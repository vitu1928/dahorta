import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartStateService } from '../data-access/cart.state';
import { CouponsService } from '../data-access/coupons.service';
import { OrdersService } from '../data-access/orders.service';
import { AuthService } from '../data-access/auth.service';
import { PaymentMethod, Address } from '../data-access/customer.models';

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  iconPaths: string;
  description: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: 'pix', label: 'PIX', iconPaths: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>', description: 'Aprovação instantânea' },
  { id: 'credit_card', label: 'Cartão de Crédito', iconPaths: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>', description: 'Visa, Mastercard, Elo' },
  { id: 'debit_card', label: 'Cartão de Débito', iconPaths: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M16 14.5a1.5 1.5 0 0 1 0-3H21v3z"/>', description: 'Visa, Mastercard' },
  { id: 'meal_voucher', label: 'Vale Refeição', iconPaths: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>', description: 'VR, Alelo, Sodexo, Flash' },
  { id: 'cash', label: 'Dinheiro', iconPaths: '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', description: 'Troco se necessário' },
];

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="color: var(--foreground); min-height: 100vh;">
      <!-- Header -->
      <div class="flex items-center gap-3 px-4 py-4" style="border-bottom: 1px solid var(--border)">
        <button
          (click)="handleBack()"
          class="w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer bg-transparent"
          style="background: var(--muted); border-color: var(--border); color: var(--muted-foreground);"
        >
          <!-- ArrowLeft SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </button>
        <div>
          <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700;">
            Finalizar Pedido
          </h1>
        </div>
      </div>

      <!-- Progress Steps -->
      <div class="flex items-center justify-between px-6 py-4" style="border-bottom: 1px solid var(--border)">
        @for (s of steps; track s.key; let idx = $index; let last = $last) {
          <div class="flex flex-col items-center gap-1">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center transition-all font-bold"
              [style.background]="isStepDone(idx) ? '#4CAF50' : isStepActive(s.key) ? 'var(--primary)' : 'var(--muted)'"
              [style.border-color]="isStepDone(idx) ? '#4CAF50' : isStepActive(s.key) ? 'var(--primary)' : 'var(--border)'"
              [style.color]="isStepDone(idx) || isStepActive(s.key) ? 'white' : 'var(--muted-foreground)'"
              style="border: 2px solid;"
            >
              @if (isStepDone(idx)) {
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
              } @else if (s.key === 'address') {
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              } @else if (s.key === 'payment') {
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              } @else if (s.key === 'confirm') {
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
              }
            </div>
            <span 
              class="text-[10px]"
              [style.color]="isStepActive(s.key) ? 'var(--primary)' : isStepDone(idx) ? '#4CAF50' : 'var(--muted-foreground)'"
              [style.font-weight]="isStepActive(s.key) ? '600' : '400'"
            >
              {{ s.label }}
            </span>
          </div>
          @if (!last) {
            <div class="flex-1 h-0.5 mx-2" [style.background]="isStepDone(idx) ? '#4CAF50' : 'var(--border)'"></div>
          }
        }
      </div>

      <div class="px-4 py-5 max-w-[800px] mx-auto">
        @if (error()) {
          <div
            class="flex items-center gap-2 p-3 rounded-xl mb-4"
            style="background: rgba(196,69,54,0.08); border: 1px solid rgba(196,69,54,0.25);"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            <span style="color: var(--destructive); font-size: 13px;">{{ error() }}</span>
          </div>
        }

        <!-- Step 1: Address -->
        @if (step() === 'address') {
          <div>
            <div class="flex items-center gap-2 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700;">
                Endereço de Entrega
              </h2>
            </div>
            <div class="space-y-3">
              <div>
                <label class="label-text">CEP</label>
                <input [(ngModel)]="address.zipCode" placeholder="00000-000" class="input-field" />
              </div>
              <div class="grid grid-cols-3 gap-3">
                <div class="col-span-2">
                  <label class="label-text">Rua / Avenida *</label>
                  <input required [(ngModel)]="address.street" placeholder="Rua das Flores" class="input-field" />
                </div>
                <div>
                  <label class="label-text">Número *</label>
                  <input required [(ngModel)]="address.number" placeholder="123" class="input-field" />
                </div>
              </div>
              <div>
                <label class="label-text">Complemento</label>
                <input [(ngModel)]="address.complement" placeholder="Apto, Bloco, Casa..." class="input-field" />
              </div>
              <div>
                <label class="label-text">Bairro *</label>
                <input required [(ngModel)]="address.neighborhood" placeholder="Jardim Paulista" class="input-field" />
              </div>
              <div>
                <label class="label-text">Cidade</label>
                <input [(ngModel)]="address.city" placeholder="São Paulo" class="input-field" />
              </div>
              <div>
                <label class="label-text">Observações de ponto de referência (opcional)</label>
                <textarea [(ngModel)]="addressNotes" placeholder="Ex: Casa verde, portão preto, interfone 2..." rows="2" class="input-field resize-none"></textarea>
              </div>
            </div>

            <button
              (click)="goToPayment()"
              class="w-full py-4 rounded-2xl flex items-center justify-between px-5 font-bold mt-5 border-none cursor-pointer"
              style="background: var(--primary); color: white; font-size: 15px;"
            >
              Continuar para Pagamento
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        }

        <!-- Step 2: Payment -->
        @if (step() === 'payment') {
          <div>
            <div class="flex items-center gap-2 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700;">
                Forma de Pagamento
              </h2>
            </div>
            <div class="space-y-2">
              @for (opt of paymentOptions; track opt.id) {
                <button
                  (click)="paymentMethod.set(opt.id)"
                  class="w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left border cursor-pointer bg-white"
                  [style.background]="paymentMethod() === opt.id ? 'rgba(212,116,95,0.1)' : 'var(--card)'"
                  [style.border-color]="paymentMethod() === opt.id ? 'var(--primary)' : 'var(--border)'"
                >
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    [style.background]="paymentMethod() === opt.id ? 'var(--primary)' : 'var(--border)'"
                    [style.color]="paymentMethod() === opt.id ? 'white' : 'var(--muted-foreground)'"
                  >
                    @switch (opt.id) {
                      @case ('pix') {
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                      }
                      @case ('credit_card') {
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                      }
                      @case ('debit_card') {
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M16 14.5a1.5 1.5 0 0 1 0-3H21v3z"/></svg>
                      }
                      @case ('meal_voucher') {
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                      }
                      @case ('cash') {
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      }
                    }
                  </div>
                  <div class="flex-1">
                    <div style="color: var(--foreground); font-size: 14px; font-weight: 600;">{{ opt.label }}</div>
                    <div style="color: var(--muted-foreground); font-size: 12px;">{{ opt.description }}</div>
                  </div>
                  @if (paymentMethod() === opt.id) {
                    <div class="w-6 h-6 rounded-full flex items-center justify-center text-white" style="background: var(--primary)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                  }
                </button>
              }
            </div>

            @if (paymentMethod() === 'cash') {
              <div class="mt-3">
                <label class="label-text">Troco para quanto?</label>
                <input
                  [(ngModel)]="change"
                  placeholder="Ex: R$ 100,00"
                  class="input-field"
                />
              </div>
            }

            <button
              (click)="goToConfirm()"
              class="w-full py-4 rounded-2xl flex items-center justify-between px-5 font-bold mt-5 border-none cursor-pointer"
              style="background: var(--primary); color: white; font-size: 15px;"
            >
              Revisar Pedido
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        }

        <!-- Step 3: Confirm -->
        @if (step() === 'confirm') {
          <div>
            <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 16px;">
              Revisar Pedido
            </h2>

            <!-- Items -->
            <div class="rounded-2xl p-4 mb-4 border bg-white" style="border-color: var(--border);">
              <h4 class="section-title">Itens</h4>
              @for (item of cartItems(); track item.productId) {
                <div class="flex flex-col py-2 border-b last:border-none" style="border-color: var(--border);">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span style="color: var(--primary); font-size: 12px; font-weight: 700;">{{ item.quantity }}x</span>
                      <span style="color: var(--muted-foreground); font-size: 13px;">{{ item.name }}</span>
                    </div>
                    <span style="color: var(--foreground); font-size: 13px; font-weight: 600;">
                      {{ formatCurrency(item.price * item.quantity) }}
                    </span>
                  </div>
                  @if (item.subItems && item.subItems.length > 0) {
                    <div class="ml-6 space-y-0.5 mt-1">
                      @for (si of item.subItems; track si.productId) {
                        <div class="flex items-center gap-1.5 text-[10px] text-muted-foreground opacity-75">
                          <span class="font-bold uppercase text-[9px] text-primary/70">{{ si.slotName }}:</span> {{ si.name }}
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Address Summary -->
            <div class="rounded-2xl p-4 mb-4 border bg-white" style="border-color: var(--border);">
              <div class="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <h4 class="section-title">Endereço</h4>
              </div>
              <p style="color: var(--muted-foreground); font-size: 13px; line-height: 1.5;">
                {{ address.street }}, {{ address.number }}{{ address.complement ? ', ' + address.complement : '' }}
                <br />{{ address.neighborhood }}, {{ address.city }}
              </p>
            </div>

            <!-- Payment Summary -->
            <div class="rounded-2xl p-4 mb-4 border bg-white" style="border-color: var(--border);">
              <div class="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                <h4 class="section-title">Pagamento</h4>
              </div>
              <p style="color: var(--muted-foreground); font-size: 13px;">
                {{ getPaymentLabel() }}
                @if (paymentMethod() === 'cash' && change) {
                  (Troco para {{ change }})
                }
              </p>
            </div>

            <!-- Notes -->
            @if (orderNotes()) {
              <div class="rounded-2xl p-4 mb-4 border bg-white" style="border-color: var(--border);">
                <div class="flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <h4 class="section-title">Observações do pedido</h4>
                </div>
                <p style="color: var(--muted-foreground); font-size: 13px;">{{ orderNotes() }}</p>
              </div>
            }

            @if (addressNotes) {
              <div class="rounded-2xl p-4 mb-4 border bg-white" style="border-color: var(--border);">
                <div class="flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <h4 class="section-title">Observações de ponto de referência</h4>
                </div>
                <p style="color: var(--muted-foreground); font-size: 13px;">{{ addressNotes }}</p>
              </div>
            }

            <!-- Costs -->
            <div class="rounded-2xl p-4 mb-6 space-y-2 border bg-white" style="border-color: var(--border);">
              <div class="flex justify-between">
                <span style="color: var(--muted-foreground); font-size: 13px;">Subtotal</span>
                <span style="color: var(--muted-foreground); font-size: 13px;">{{ formatCurrency(cartTotal()) }}</span>
              </div>
              @if (activeCoupon() && discountAmount() > 0) {
                <div class="flex justify-between">
                  <span style="color: var(--primary); font-size: 13px; font-weight: 600;">Desconto ({{ activeCoupon()?.code }})</span>
                  <span style="color: var(--primary); font-size: 13px; font-weight: 600;">-{{ formatCurrency(discountAmount()) }}</span>
                </div>
              }
              <div class="flex justify-between">
                <span style="color: var(--muted-foreground); font-size: 13px;">Entrega</span>
                <span style="color: var(--muted-foreground); font-size: 13px;">{{ isFreeShipping() ? 'Grátis' : formatCurrency(deliveryFee()) }}</span>
              </div>
              <div class="flex justify-between pt-2 border-t" style="border-color: var(--border);">
                <span style="color: var(--foreground); font-size: 15px; font-weight: 700;">Total</span>
                <span style="color: var(--primary); font-size: 18px; font-weight: 800;">{{ formatCurrency(grandTotal()) }}</span>
              </div>
            </div>

            <!-- Submit CTA -->
            <button
              (click)="handlePlaceOrder()"
              [disabled]="loading()"
              class="w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold border-none cursor-pointer text-white text-[16px] transition-all"
              style="background: var(--primary);"
              [style.background]="loading() ? 'var(--secondary)' : 'var(--primary)'"
              [style.color]="loading() ? 'var(--primary)' : 'white'"
            >
              @if (loading()) {
                <div class="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                <span>Processando...</span>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                <span>Confirmar Pedido — {{ formatCurrency(grandTotal()) }}</span>
              }
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .label-text { color: var(--muted-foreground); font-size: 12px; font-weight: 500; display: block; margin-bottom: 6px; }
    .input-field {
      width: 100%; padding: 10px 16px; outline: none; border-radius: 12px;
      background: var(--muted); border: 1px solid var(--border); color: var(--foreground); font-size: 14px;
      transition: all 0.2s;
    }
    .input-field:focus { border-color: var(--primary); }
    .section-title { color: var(--muted-foreground); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  `]
})
export class CheckoutComponent {
  cartState = inject(CartStateService);
  couponsService = inject(CouponsService);
  ordersService = inject(OrdersService);
  authService = inject(AuthService);
  router = inject(Router);

  cartItems = this.cartState.items;
  cartTotal = this.cartState.total;
  orderNotes = this.cartState.orderNotes;

  activeCoupon = this.couponsService.activeCoupon;
  discountAmount = this.couponsService.discountAmount;

  step = signal<'address' | 'payment' | 'confirm'>('address');
  address: Address = {
    id: 'new',
    label: 'Casa',
    street: 'Rua das Palmeiras',
    number: '123',
    complement: 'Apto 45',
    neighborhood: 'Pinheiros',
    city: 'São Paulo',
    zipCode: '05422-000',
  };
  paymentMethod = signal<PaymentMethod>('pix');
  addressNotes = '';
  change = '';
  loading = signal(false);
  error = signal('');

  steps = [
    { key: 'address', label: 'Endereço', icon: '📍' },
    { key: 'payment', label: 'Pagamento', icon: '💳' },
    { key: 'confirm', label: 'Confirmar', icon: '✓' },
  ];

  paymentOptions = PAYMENT_OPTIONS;

  deliveryFee = computed(() => 6.00);

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

  isStepActive(key: string): boolean {
    return this.step() === key;
  }

  isStepDone(idx: number): boolean {
    const stepsKeys = ['address', 'payment', 'confirm'];
    const currentIdx = stepsKeys.indexOf(this.step());
    return currentIdx > idx;
  }

  handleBack() {
    if (this.step() === 'address') {
      this.router.navigate(['/customer/cart']);
    } else if (this.step() === 'payment') {
      this.step.set('address');
    } else {
      this.step.set('payment');
    }
  }

  goToPayment() {
    this.error.set('');
    if (!this.address.street || !this.address.number || !this.address.neighborhood) {
      this.error.set('Preencha os campos obrigatórios (*).');
      return;
    }
    this.step.set('payment');
  }

  goToConfirm() {
    this.step.set('confirm');
  }

  getPaymentLabel(): string {
    return PAYMENT_OPTIONS.find(o => o.id === this.paymentMethod())?.label || '';
  }

  async handlePlaceOrder() {
    this.error.set('');
    if (!this.address.street || !this.address.number || !this.address.neighborhood) {
      this.error.set('Preencha o endereço completo.');
      this.step.set('address');
      return;
    }

    this.loading.set(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1200));

    const currentUser = this.authService.currentUser();
    const order = this.ordersService.placeOrder(
      currentUser?.id || 'guest',
      this.paymentMethod(),
      this.address,
      this.cartItems(),
      this.grandTotal(),
      this.discountAmount(),
      this.orderNotes(),
      this.addressNotes
    );

    this.loading.set(false);

    if (order) {
      this.cartState.clear();
      this.couponsService.remove();
      this.router.navigate(['/customer/orders']);
    }
  }
}
