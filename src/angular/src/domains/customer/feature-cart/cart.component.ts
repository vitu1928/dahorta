import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartStateService } from '../data-access/cart.state';
import { CouponsService } from '../data-access/coupons.service';
import { EmployeeService } from '../../employee/data-access/employee.service';
import { AuthService } from '@domain/auth/data-access/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="background: var(--background); min-height: 100vh;">
      <!-- Header -->
      <div
        class="flex items-center gap-4 px-6 py-5"
        style="border-bottom: 1px solid var(--border-light)"
      >
        <button
          (click)="router.navigate(['/customer/menu'])"
          class="w-10 h-10 rounded-lg flex items-center justify-center border transition-all cursor-pointer bg-transparent"
          style="border-color: var(--border); color: var(--muted-foreground);"
        >
          <!-- ArrowLeft icon (inline SVG) -->
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </button>
        <div>
          <h1
            style="font-size: 22px; color: var(--text-primary); font-weight: 600; font-family: 'Poppins', sans-serif"
          >
            Seu Carrinho
          </h1>
        </div>
        <span
          class="ml-auto"
          style="background: var(--secondary); border: 1px solid var(--primary); color: var(--primary); border-radius: 20px; padding: 4px 12px; fontSize: 12px; font-weight: 700;"
        >
          {{ cartCount() }} {{ cartCount() === 1 ? 'item' : 'itens' }}
        </span>
      </div>

      <div class="px-6 py-6 max-w-[800px] mx-auto">
        @if (cartItems().length === 0) {
          <div class="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div
              class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style="background: var(--secondary); border: 1px solid var(--primary);"
            >
              <!-- ShoppingCart icon -->
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            </div>
            <h2
              class="mb-3 text-2xl font-bold"
              style="color: var(--text-primary);"
            >
              Carrinho vazio
            </h2>
            <p
              class="mb-8 text-sm"
              style="color: var(--text-secondary); line-height: 1.5;"
            >
              Adicione itens do cardápio para fazer seu pedido
            </p>
            <button
              (click)="router.navigate(['/customer/menu'])"
              class="px-8 py-3 rounded-lg border-none cursor-pointer font-semibold text-sm transition-all"
              style="background: var(--primary); color: var(--primary-foreground);"
            >
              Ver Cardápio
            </button>
          </div>
        } @else {
          <!-- Cart Items -->
          <div class="space-y-3 mb-6">
            @for (item of cartItems(); track item.productId) {
              <div
                class="flex items-center gap-4 p-4 rounded-xl border"
                style="background: var(--card); border-color: var(--border);"
              >
                <!-- Image -->
                <div class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#F7F9F7]">
                  <img
                    [src]="item.image"
                    [alt]="item.name"
                    class="w-full h-full object-cover"
                  />
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <h4
                    class="text-sm font-semibold truncate"
                    style="color: var(--text-primary);"
                  >
                    {{ item.name }}
                  </h4>
                  @if (item.subItems && item.subItems.length > 0) {
                    <div class="mt-1 space-y-0.5">
                      @for (si of item.subItems; track si.productId) {
                        <p class="text-[10px] text-muted-foreground leading-tight">
                          <span class="font-bold uppercase text-[9px] text-primary/70">{{ si.slotName }}:</span> {{ si.name }}
                        </p>
                      }
                    </div>
                  }
                  <p
                    class="text-sm font-bold mt-1"
                    style="color: var(--accent);"
                  >
                    {{ formatCurrency(item.price * item.quantity) }}
                  </p>
                </div>

                <!-- Quantity Controls -->
                <div class="flex items-center gap-2">
                  <button
                    (click)="updateQuantity(item.productId, item.quantity - 1)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer border bg-transparent"
                    [style.background]="item.quantity === 1 ? 'rgba(230,57,70,0.1)' : 'var(--muted)'"
                    [style.border-color]="item.quantity === 1 ? 'var(--destructive)' : 'var(--border)'"
                    [style.color]="item.quantity === 1 ? 'var(--destructive)' : 'var(--muted-foreground)'"
                  >
                    @if (item.quantity === 1) {
                      <!-- Trash2 icon -->
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    } @else {
                      <!-- Minus icon -->
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/></svg>
                    }
                  </button>
                  <span
                    class="text-sm font-bold min-w-[24px] text-center"
                    style="color: var(--text-primary);"
                  >
                    {{ item.quantity }}
                  </span>
                  <button
                    (click)="updateQuantity(item.productId, item.quantity + 1)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer border"
                    style="background: var(--secondary); border-color: var(--primary); color: var(--primary);"
                  >
                    <!-- Plus icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Promo Code -->
          @if (!activeCoupon()) {
            <div class="mb-6">
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <!-- Tag icon -->
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>
                  </span>
                  <input
                    [ngModel]="couponInput()"
                    (ngModelChange)="onCouponInputChange($event)"
                    placeholder="Cupom de desconto"
                    class="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all border"
                    style="background: var(--input-background); border-color: var(--border); color: var(--text-primary); font-size: 14px;"
                  />
                </div>
                <button
                  (click)="handleApplyCoupon()"
                  class="px-5 py-3 rounded-xl font-bold border-none cursor-pointer text-sm transition-all"
                  style="background: var(--primary); color: white; box-shadow: var(--shadow-default);"
                >
                  Aplicar
                </button>
              </div>
              @if (couponError()) {
                <p class="text-destructive text-xs mt-2 flex items-center gap-1 font-medium">
                  <!-- XCircle icon -->
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
                  {{ couponError() }}
                </p>
              }

              <!-- Available coupons -->
              @if (availableCoupons().length > 0) {
                <div class="mt-4 pt-4" style="border-top: 1px dashed var(--border)">
                  <h4 class="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Cupons Disponíveis</h4>
                  <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    @for (coupon of availableCoupons(); track coupon.id) {
                      <button 
                        (click)="selectAvailableCoupon(coupon)"
                        class="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl transition-all border-none bg-primary/10 hover:bg-primary/20 cursor-pointer text-left"
                      >
                        <div class="w-6 h-6 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>
                        </div>
                        <div class="pr-1">
                          <div class="text-xs font-black text-primary leading-tight">{{ coupon.code }}</div>
                          <div class="text-[10px] font-semibold text-primary/70 leading-tight">
                            {{ coupon.type === 'percentage' ? coupon.value + '% OFF' : coupon.type === 'shipping' ? 'Frete Grátis' : 'R$ ' + coupon.value + ' OFF' }}
                          </div>
                        </div>
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          } @else {
            <!-- Active Coupon Display -->
            <div class="flex items-center justify-between p-4 rounded-xl mb-6 bg-primary/10 border border-primary/20">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <!-- Percent icon -->
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-black text-primary uppercase">{{ activeCoupon()?.code }}</span>
                    <!-- CheckCircle2 icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                  </div>
                  <span class="text-xs text-primary/80 font-bold tracking-wide uppercase">
                    Cupom Aplicado
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-primary font-black">-{{ formatCurrency(discountAmount()) }}</span>
                <button 
                  (click)="removeCoupon()"
                  class="text-muted-foreground hover:text-destructive transition-colors bg-transparent border-none cursor-pointer"
                  title="Remover cupom"
                >
                  <!-- Trash2 icon -->
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
              </div>
            </div>
          }

          <!-- Order Notes -->
          <div
            class="rounded-xl p-6 mb-4 border"
            style="background: var(--card); border-color: var(--border);"
          >
            <h3
              class="mb-4 text-xs font-bold"
              style="color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em;"
            >
              Observações do Pedido
            </h3>
            <textarea
              placeholder="Ex: Retirar talheres, campainha estragada, tirar cebola de todos os itens..."
              class="w-full p-4 rounded-xl border bg-background-soft outline-none focus:border-primary transition-all text-sm resize-none"
              rows="3"
              style="color: var(--text-primary); border-color: var(--border);"
              [ngModel]="orderNotes()"
              (ngModelChange)="onNotesChange($event)"
            ></textarea>
          </div>

          <!-- Summary Box -->
          <div
            class="rounded-xl p-6 mb-6 border"
            style="background: var(--card); border-color: var(--border);"
          >
            <h3
              class="mb-4 text-sm font-semibold"
              style="color: var(--text-primary);"
            >
              Resumo
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span style="color: var(--text-secondary); font-size: 14px;">
                  Subtotal ({{ cartCount() }} {{ cartCount() === 1 ? 'item' : 'itens' }})
                </span>
                <span style="color: var(--text-primary); font-size: 14px;">
                  {{ formatCurrency(cartTotal()) }}
                </span>
              </div>
              @if (activeCoupon() && discountAmount() > 0) {
                <div class="flex items-center justify-between">
                  <span style="color: var(--primary); font-size: 14px; font-weight: 600;">
                    Desconto ({{ activeCoupon()?.code }})
                  </span>
                  <span style="color: var(--primary); font-size: 14px; font-weight: 600;">
                    -{{ formatCurrency(discountAmount()) }}
                  </span>
                </div>
              }
              <div class="flex items-center justify-between">
                <span style="color: var(--text-secondary); font-size: 14px;">
                  Taxa de entrega
                </span>
                <span [style.color]="isFreeShipping() ? 'var(--primary)' : 'var(--text-primary)'" style="font-size: 14px;">
                  {{ isFreeShipping() ? 'Grátis' : formatCurrency(deliveryFee()) }}
                </span>
              </div>
            </div>
            <div
              class="flex items-center justify-between mt-4 pt-4"
              style="border-top: 1px solid var(--border-light)"
            >
              <span
                style="color: var(--text-primary); font-size: 18px; font-weight: 600;"
              >
                Total
              </span>
              <span
                style="color: var(--accent); font-size: 20px; font-weight: 700;"
              >
                {{ formatCurrency(grandTotal()) }}
              </span>
            </div>
            <div class="flex items-center gap-2 mt-3 text-muted-foreground" style="font-size: 12px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Estimativa: 35–50 minutos</span>
            </div>
          </div>

          <!-- Restaurante Fechado Warning -->
          @if (!restaurantOpen()) {
            <div class="flex items-center gap-3 p-4 rounded-xl mb-4" style="background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.25);">
              <span style="font-size: 20px;">🔴</span>
              <div>
                <p class="font-bold text-sm" style="color: #dc2626;">Restaurante fechado no momento</p>
                <p class="text-xs" style="color: rgba(220,38,38,0.75);">Não é possível realizar pedidos enquanto a loja está fechada.</p>
              </div>
            </div>
          }

          <!-- Checkout CTA -->
          <button
            (click)="handleCheckout()"
            [disabled]="!restaurantOpen()"
            class="w-full py-4 rounded-xl flex items-center justify-between px-6 mb-3 border-none transition-all"
            [style.background]="restaurantOpen() ? 'var(--primary)' : '#9ca3af'"
            [style.color]="'white'"
            [style.cursor]="restaurantOpen() ? 'pointer' : 'not-allowed'"
            [style.box-shadow]="restaurantOpen() ? 'var(--shadow-hover)' : 'none'"
            [style.opacity]="restaurantOpen() ? '1' : '0.7'"
          >
            <span style="font-size: 15px; font-weight: 600;">
              Finalizar Pedido
            </span>
            <div class="flex items-center gap-2">
              <span style="font-size: 16px; font-weight: 700;">
                {{ formatCurrency(grandTotal()) }}
              </span>
              <!-- ChevronRight icon -->
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </button>

          <button
            (click)="router.navigate(['/customer/menu'])"
            class="w-full py-3 rounded-xl cursor-pointer font-medium text-sm transition-all border"
            style="background: transparent; color: var(--muted-foreground); border-color: var(--border);"
          >
            Continuar Comprando
          </button>
        }
      </div>
    </div>
  `
})
export class CartComponent {
  cartState = inject(CartStateService);
  couponsService = inject(CouponsService);
  employeeService = inject(EmployeeService);
  authService = inject(AuthService);
  router = inject(Router);

  cartItems = this.cartState.items;
  cartTotal = this.cartState.total;
  cartCount = this.cartState.count;
  orderNotes = this.cartState.orderNotes;
  restaurantOpen = this.employeeService.restaurantOpen;
  isLoggedIn = this.authService.isAuthenticated;

  coupons = this.couponsService.coupons;
  activeCoupon = this.couponsService.activeCoupon;
  discountAmount = this.couponsService.discountAmount;

  couponInput = signal('');
  couponError = signal('');

  availableCoupons = computed(() => {
    return this.coupons().filter(c => c.active && c.code !== this.activeCoupon()?.code);
  });

  deliveryFee = computed(() => {
    return 6.00;
  });

  isFreeShipping = computed(() => {
    return this.activeCoupon()?.type === 'shipping';
  });

  grandTotal = computed(() => {
    const total = this.cartTotal() - this.discountAmount();
    const fee = this.isFreeShipping() ? 0 : this.deliveryFee();
    return Math.max(0, total + fee);
  });

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  onNotesChange(notes: string) {
    this.cartState.orderNotes.set(notes);
  }

  onCouponInputChange(val: string) {
    this.couponInput.set(val.toUpperCase());
  }

  handleApplyCoupon() {
    this.couponError.set('');
    const code = this.couponInput().trim();
    if (!code) return;

    const res = this.couponsService.apply(code, this.cartTotal());
    if (!res.success) {
      this.couponError.set(res.message);
    } else {
      this.couponInput.set('');
    }
  }

  selectAvailableCoupon(coupon: any) {
    this.couponError.set('');
    const res = this.couponsService.apply(coupon.code, this.cartTotal());
    if (!res.success) {
      this.couponError.set(res.message);
    } else {
      this.couponInput.set('');
    }
  }

  removeCoupon() {
    this.couponsService.remove();
    this.couponError.set('');
  }

  handleCheckout() {
    if (!this.restaurantOpen()) return;
    if (!this.isLoggedIn()) {
      this.router.navigate(['/register']);
    } else {
      this.router.navigate(['/customer/checkout']);
    }
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.cartState.removeItem(productId);
    } else {
      this.cartState.updateQuantity(productId, quantity);
    }
  }
}
