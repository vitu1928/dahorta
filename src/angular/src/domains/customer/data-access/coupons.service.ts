import { Injectable, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { Coupon } from './customer.models';
import { MOCK_COUPONS } from './mock-data';
import { CartStateService } from './cart.state';

@Injectable({ providedIn: 'root' })
export class CouponsService {
  private cartState = inject(CartStateService);

  coupons = signal<Coupon[]>(MOCK_COUPONS);
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

  apply(code: string, cartTotal: number): { success: boolean; message: string } {
    const coupon = this.coupons().find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);

    if (!coupon) {
      return { success: false, message: 'Cupom inválido' };
    }

    if (coupon.expirationDate && new Date() > coupon.expirationDate) {
      return { success: false, message: 'Cupom expirado' };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { success: false, message: 'Cupom limite de uso atingido' };
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

  add(coupon: Omit<Coupon, 'id' | 'usedCount' | 'totalSalesVolume'>): void {
    const newCoupon: Coupon = {
      ...coupon,
      id: `coup${Date.now()}`,
      usedCount: 0,
      totalSalesVolume: 0
    };
    this.coupons.update(list => [...list, newCoupon]);
  }

  update(id: string, coupon: Partial<Coupon>): void {
    this.coupons.update(list => list.map(c => c.id === id ? { ...c, ...coupon } as Coupon : c));
  }

  delete(id: string): void {
    this.coupons.update(list => list.filter(c => c.id !== id));
  }
}
