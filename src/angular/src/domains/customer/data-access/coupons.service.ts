import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { EMPTY, catchError, firstValueFrom, map, switchMap, timer } from 'rxjs';
import { Coupon } from './customer.models';
import { CartStateService } from './cart.state';
import { AuthService } from '../../auth/data-access/auth.service';
import { OrdersService } from './orders.service';
import { environment } from '../../../environments/environment';

interface CupomApi {
  id: number;
  codigo: string;
  tipo: 'PERCENTUAL' | 'FIXO' | 'FRETE';
  valor: number;
  valorMinimo: number | null;
  limiteUsos: number | null;
  usosRealizados: number;
  expiraEm: string | null;
  ativo: boolean;
}

type CupomRequest = Pick<CupomApi, 'codigo' | 'tipo' | 'valor' | 'valorMinimo' | 'limiteUsos' | 'expiraEm' | 'ativo'>;

@Injectable({ providedIn: 'root' })
export class CouponsService {
  private readonly http = inject(HttpClient);
  private readonly cartState = inject(CartStateService);
  private readonly authService = inject(AuthService);
  private readonly ordersService = inject(OrdersService);
  private readonly couponsUrl = `${environment.apiUrl}/cupons`;

  coupons = signal<Coupon[]>([]);
  activeCoupon = signal<Coupon | null>(null);

  discountAmount = computed(() => {
    const coupon = this.activeCoupon();
    if (!coupon) return 0;
    
    const cartTotal = this.cartState.total();
    if (coupon.type === 'percentage') {
      return (cartTotal * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      return coupon.value;
    }
    return 0;
  });

  constructor() {
    effect(onCleanup => {
      const user = this.authService.currentUser();
      if (!user) {
        this.coupons.set([]);
        this.activeCoupon.set(null);
        return;
      }

      const subscription = timer(0, 30000).pipe(
        switchMap(() => this.http.get<CupomApi[]>(this.couponsUrl).pipe(
          map(coupons => coupons.map(coupon => this.toCoupon(coupon))),
          catchError(error => {
            console.error('Erro ao carregar cupons pela API:', error);
            return EMPTY;
          })
        ))
      ).subscribe(coupons => this.coupons.set(coupons));

      onCleanup(() => subscription.unsubscribe());
    }, { allowSignalWrites: true });
  }

  apply(code: string, cartTotal: number): { success: boolean; message: string } {
    const coupon = this.coupons().find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);

    if (!coupon) {
      return { success: false, message: 'Cupom inválido' };
    }

    if (coupon.expirationDate && new Date() > coupon.expirationDate) {
      return { success: false, message: 'Cupom expirado' };
    }

    if (coupon.usageLimit) {
      const orders = this.ordersService.orders();
      const realUsedCount = orders.filter(o => o.couponCode === coupon.code).length;
      if (realUsedCount >= coupon.usageLimit) {
        return { success: false, message: 'Cupom limite de uso atingido' };
      }
    }

    if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
      return { success: false, message: `Valor mínimo: R$ ${coupon.minOrderValue}` };
    }

    this.activeCoupon.set(coupon);
    return { success: true, message: 'Cupom aplicado!' };
  }

  remove() {
    this.activeCoupon.set(null);
  }

  calculateDiscount(cartTotal: number): number {
    const coupon = this.activeCoupon();
    if (!coupon) return 0;

    if (coupon.type === 'percentage') {
      return (cartTotal * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      return coupon.value;
    }
    return 0;
  }

  async add(coupon: Omit<Coupon, 'id' | 'usedCount' | 'totalSalesVolume'>): Promise<void> {
    const created = await firstValueFrom(this.http.post<CupomApi>(this.couponsUrl, this.toRequest(coupon)));
    this.coupons.update(coupons => [...coupons, this.toCoupon(created)]);
  }

  async update(id: string, coupon: Partial<Coupon>): Promise<void> {
    const current = this.coupons().find(item => item.id === id);
    if (!current) throw new Error('Cupom não encontrado.');
    const updated = await firstValueFrom(this.http.put<CupomApi>(
      `${this.couponsUrl}/${id}`,
      this.toRequest({ ...current, ...coupon })
    ));
    this.coupons.update(coupons => coupons.map(item => item.id === id ? this.toCoupon(updated) : item));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.couponsUrl}/${id}`));
    this.coupons.update(coupons => coupons.map(item =>
      item.id === id ? { ...item, active: false } : item
    ));
  }

  private toCoupon(coupon: CupomApi): Coupon {
    const type = coupon.tipo === 'PERCENTUAL' ? 'percentage' : coupon.tipo === 'FIXO' ? 'fixed' : 'shipping';
    return {
      id: String(coupon.id),
      code: coupon.codigo,
      type,
      value: Number(coupon.valor),
      active: coupon.ativo,
      expirationDate: coupon.expiraEm ? new Date(coupon.expiraEm) : undefined,
      minOrderValue: coupon.valorMinimo === null ? undefined : Number(coupon.valorMinimo),
      usageLimit: coupon.limiteUsos ?? undefined,
      usedCount: coupon.usosRealizados,
      totalSalesVolume: 0
    };
  }

  private toRequest(coupon: Omit<Coupon, 'id' | 'usedCount' | 'totalSalesVolume'> | Coupon): CupomRequest {
    return {
      codigo: coupon.code.trim().toUpperCase(),
      tipo: coupon.type === 'percentage' ? 'PERCENTUAL' : coupon.type === 'fixed' ? 'FIXO' : 'FRETE',
      valor: coupon.value,
      valorMinimo: coupon.minOrderValue ?? null,
      limiteUsos: coupon.usageLimit ?? null,
      expiraEm: coupon.expirationDate ? new Date(coupon.expirationDate).toISOString() : null,
      ativo: coupon.active
    };
  }
}
