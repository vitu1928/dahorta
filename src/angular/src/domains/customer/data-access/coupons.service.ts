import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Coupon } from './customer.models';
import { CartStateService } from './cart.state';
import { Firestore, collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { AuthService } from '../../auth/data-access/auth.service';
import { OrdersService } from './orders.service';

@Injectable({ providedIn: 'root' })
export class CouponsService {
  private firestore = inject(Firestore);
  private cartState = inject(CartStateService);
  private authService = inject(AuthService);
  private ordersService = inject(OrdersService);

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
    let unsubscribeCoupons: any = null;

    effect(() => {
      const user = this.authService.currentUser();
      
      if (unsubscribeCoupons) {
        unsubscribeCoupons();
        unsubscribeCoupons = null;
      }

      if (user) {
        const colRef = collection(this.firestore, 'coupons');
        unsubscribeCoupons = onSnapshot(colRef, (snapshot) => {
          const list: Coupon[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              code: data['code'],
              type: data['type'],
              value: data['value'],
              active: data['active'],
              expirationDate: data['expirationDate']?.toDate() || null,
              minOrderValue: data['minOrderValue'],
              usageLimit: data['usageLimit'],
              usedCount: data['usedCount'] || 0,
              totalSalesVolume: data['totalSalesVolume'] || 0
            } as Coupon);
          });
          this.coupons.set(list);
        }, (err) => {
          console.error('Erro ao carregar cupons do Firestore:', err);
        });
      } else {
        this.coupons.set([]);
      }
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

  add(coupon: Omit<Coupon, 'id' | 'usedCount' | 'totalSalesVolume'>): void {
    const colRef = collection(this.firestore, 'coupons');
    const docRef = doc(colRef);
    const newCoupon = {
      ...coupon,
      usedCount: 0,
      totalSalesVolume: 0,
      expirationDate: coupon.expirationDate ? coupon.expirationDate : null
    };
    setDoc(docRef, newCoupon).catch(err => {
      console.error('Erro ao adicionar cupom:', err);
    });
  }

  update(id: string, coupon: Partial<Coupon>): void {
    const docRef = doc(this.firestore, `coupons/${id}`);
    const updateData = { ...coupon };
    if (updateData.expirationDate) {
      updateData.expirationDate = new Date(updateData.expirationDate);
    }
    updateDoc(docRef, updateData).catch(err => {
      console.error('Erro ao atualizar cupom:', err);
    });
  }

  delete(id: string): void {
    const docRef = doc(this.firestore, `coupons/${id}`);
    deleteDoc(docRef).catch(err => {
      console.error('Erro ao deletar cupom:', err);
    });
  }
}
