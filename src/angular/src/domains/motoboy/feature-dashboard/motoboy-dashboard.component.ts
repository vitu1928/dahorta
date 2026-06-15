import { Component, inject, signal, computed, effect, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/data-access/auth.service';
import { OrdersService } from '../../customer/data-access/orders.service';
import { Order, OrderStatus } from '../../customer/data-access/customer.models';
import { ToastService } from '../../../shared/data-access/toast.service';

@Component({
  selector: 'app-delivery-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="rounded-xl overflow-hidden transition-all duration-300"
      [style.background]="confirmed() ? 'rgba(58,165,93,0.08)' : 'var(--card)'"
      [style.border]="confirmed() ? '1px solid var(--success)' : isDelivering() ? '1px solid var(--primary)' : '1px solid var(--border)'"
      style="box-shadow: var(--shadow-card);"
    >
      <div
        class="h-1"
        [style.background]="confirmed() ? 'var(--success)' : isDelivering() ? 'var(--primary)' : 'var(--accent)'"
      ></div>
      <div class="p-4">
        @if (confirmed()) {
          <div class="flex flex-col items-center py-4 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--success)"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            <h3 class="text-[#3AA55D] text-lg font-bold mt-3">
              Entregue!
            </h3>
            <p class="text-sm text-[#5F5F5F] mt-1">
              Pedido {{ order.id }} finalizado
            </p>
          </div>
        } @else {
          <div class="flex items-start justify-between mb-3">
            <div>
              <span
                [style.color]="isDelivering() ? 'var(--primary)' : 'var(--accent)'"
                class="text-[11px] font-bold tracking-wider"
              >
                {{ order.id }}
              </span>
              <h3 class="text-[#1F1F1F] text-lg font-bold mt-0.5">
                {{ order.customerName || 'Cliente Anônimo' }}
              </h3>
            </div>
            <div
              class="px-2.5 py-1 rounded-lg border text-[11px] font-semibold"
              [style.background]="isDelivering() ? 'rgba(76,124,89,0.15)' : 'rgba(233,196,106,0.15)'"
              [style.borderColor]="isDelivering() ? 'var(--primary)' : 'var(--accent)'"
              [style.color]="isDelivering() ? 'var(--primary)' : 'var(--accent)'"
            >
              {{ isDelivering() ? '🛵 A Caminho' : '✓ Pronto' }}
            </div>
          </div>

          <div
            class="p-3 rounded-lg mb-3 bg-[#F7F9F7] border border-[#EEF2EE]"
          >
            <div class="flex items-center gap-2 mb-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--primary)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span class="text-[#5F5F5F] text-[11px] font-bold uppercase tracking-wider flex-1">
                Endereço de Entrega
              </span>
              @if (order.deliveryAddress || order.address) {
                <a
                  [href]="getMapsUrl(order.deliveryAddress || order.address)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors"
                  style="background: rgba(66,133,244,0.1); color: #4285f4; border-color: rgba(66,133,244,0.3); text-decoration: none;"
                  title="Abrir no Google Maps"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                  Navegar
                </a>
              }
            </div>
            @if (order.deliveryAddress || order.address; as addr) {
              <p class="text-[#1F1F1F] text-sm font-medium leading-relaxed">
                {{ addr.street }}, {{ addr.number }}
                {{ addr.complement ? ' — ' + addr.complement : '' }}
              </p>
              <p class="text-[#5F5F5F] text-xs mt-0.5">
                {{ addr.neighborhood }} · {{ addr.city }}
              </p>
            } @else {
              <p class="text-[#1F1F1F] text-sm font-medium leading-relaxed">
                Retirada no Balcão
              </p>
            }
          </div>

          @if (order.notes) {
            <div
              class="p-3 rounded-lg mb-3 bg-[#4C7C59]/10 border border-[#4C7C59]/20"
            >
              <p class="text-[#1F1F1F] text-xs font-bold mb-1">
                📝 Observações do pedido:
              </p>
              <p class="text-[#5F5F5F] text-sm leading-relaxed">
                {{ order.notes }}
              </p>
            </div>
          }

          @if (order.addressNotes) {
            <div
              class="p-3 rounded-lg mb-3 bg-[#E9C46A]/10 border border-[#E9C46A]/20"
            >
              <p class="text-[#1F1F1F] text-xs font-bold mb-1">
                📍 Observações de ponto de referência:
              </p>
              <p class="text-[#5F5F5F] text-sm leading-relaxed">
                {{ order.addressNotes }}
              </p>
            </div>
          }

          <div
            class="flex items-center gap-3 mb-3 p-2.5 rounded-lg bg-[#F7F9F7]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5F5F5F"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span class="text-[#1F1F1F] text-sm flex-1">
              {{ order.customerPhone || 'Sem telefone' }}
            </span>
            @if (order.customerPhone) {
              <a
                [href]="'tel:' + order.customerPhone"
                class="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors"
                style="background: rgba(58,165,93,0.15); color: #3AA55D; border-color: #3AA55D; text-decoration: none;"
              >
                Ligar
              </a>
            }
            @if (order.deliveryAddress || order.address) {
              <a
                [href]="getMapsUrl(order.deliveryAddress || order.address)"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors"
                style="background: rgba(66,133,244,0.15); color: #4285f4; border-color: rgba(66,133,244,0.5); text-decoration: none;"
                title="Abrir rota no Google Maps"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                Maps
              </a>
            }
          </div>

          <div class="mb-4">
            <p class="text-[#5F5F5F] text-[10px] font-bold uppercase tracking-wider mb-2">
              Itens ({{ totalQuantity() }})
            </p>
            @for (item of order.items; track item.productId) {
              <div class="flex items-center justify-between py-0.5 text-xs text-[#5F5F5F]">
                <span>{{ item.quantity }}x {{ item.name }}</span>
              </div>
            }
            <div class="flex items-center justify-between pt-1.5 mt-1.5 border-t border-[#EEF2EE]">
              <span class="text-xs text-[#5F5F5F]">Total</span>
              <span class="text-[#1F1F1F] text-base font-bold">
                {{ formatCurrency(order.total || order.totalAmount || 0) }}
              </span>
            </div>
          </div>

          @if (!isDelivering()) {
            <button
              (click)="handleStartDelivery()"
              class="w-full py-3.5 rounded-lg flex items-center justify-center gap-2 font-bold text-white bg-primary hover:bg-[#3d6347] border-none cursor-pointer text-sm shadow-sm transition-all duration-150 active:scale-[0.98]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
              Iniciar Entrega
            </button>
          } @else {
            <div>
              <p class="text-[#5F5F5F] text-xs font-medium mb-2">
                Código de confirmação do cliente:
              </p>
              <div class="flex gap-2">
                <input
                  [value]="code()"
                  (input)="code.set($any($event.target).value); error.set('')"
                  placeholder="000000"
                  maxLength="6"
                  class="flex-1 px-3 py-2.5 rounded-lg outline-none text-center font-bold tracking-widest bg-[#F7F9F7] text-[#1F1F1F] text-base"
                  [style.border]="error() ? '1px solid var(--destructive)' : '1px solid var(--border)'"
                  style="letter-spacing: 4px;"
                />
                <button
                  (click)="handleConfirm()"
                  [disabled]="code().length < 6"
                  class="px-4 py-2.5 rounded-lg font-bold border-none transition-all duration-150"
                  [style.background]="code().length >= 6 ? 'var(--primary)' : 'var(--muted)'"
                  [style.color]="code().length >= 6 ? 'var(--primary-foreground)' : 'var(--muted-foreground)'"
                  [style.cursor]="code().length >= 6 ? 'pointer' : 'not-allowed'"
                >
                  OK
                </button>
              </div>
              @if (error()) {
                <div class="flex items-center gap-2 mt-2 text-[#E62525] text-[11px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
                  </svg>
                  <span>{{ error() }}</span>
                </div>
              }
              <p class="text-[#5F5F5F] text-[10px] mt-2 leading-relaxed">
                💡 Para demo, o código é: <strong class="text-[#1F1F1F]">{{ order.deliveryCode }}</strong>
              </p>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class DeliveryCardComponent {
  private ordersService = inject(OrdersService);

  @Input({ required: true }) order!: Order;
  @Output() startDelivery = new EventEmitter<string>();

  readonly code = signal('');
  readonly error = signal('');
  readonly confirmed = signal(false);

  isDelivering(): boolean {
    return this.order.status === 'delivering';
  }

  totalQuantity(): number {
    return this.order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  handleStartDelivery() {
    this.startDelivery.emit(this.order.id);
  }

  async handleConfirm() {
    this.error.set('');
    try {
      const success = await this.ordersService.confirmDelivery(this.order.id, this.code());
      if (success) {
        this.confirmed.set(true);
        this.error.set('');
      } else {
        this.error.set('Código incorreto. Tente novamente.');
      }
    } catch (err: any) {
      console.error(err);
      this.error.set('Falha de permissão ou rede ao registrar a entrega.');
    }
  }

  getMapsUrl(addr: any): string {
    if (!addr) return '#';
    const parts = [
      addr.street,
      addr.number,
      addr.complement,
      addr.neighborhood,
      addr.city || 'São Paulo',
      'Brasil'
    ].filter(Boolean).join(', ');
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(parts)}&travelmode=driving`;
  }

  formatCurrency(v: number): string {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

type LocationStatus = 'checking' | 'granted' | 'denied' | 'unsupported';

@Component({
  selector: 'app-motoboy-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DeliveryCardComponent],
  templateUrl: './motoboy-dashboard.component.html',
  styles: [`
    .motoboy {
      font-family: 'Outfit', sans-serif;
      --sidebar: #1A2E1F;
      --sidebar-foreground: #FFFFFF;
      --sidebar-active: #4C7C59;
      --sidebar-border: rgba(255, 255, 255, 0.1);
    }
  `]
})
export class MotoboyDashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private ordersService = inject(OrdersService);
  private router = inject(Router);
  private toast = inject(ToastService);

  // Bind properties to services
  readonly currentUser = this.authService.currentUser;
  readonly orders = this.ordersService.orders;

  // Local state signals
  readonly locationStatus = signal<LocationStatus>('checking');
  readonly showLocationWarning = signal<boolean>(false);
  readonly showUserMenu = signal<boolean>(false);

  private watchId: number | null = null;
  private lastLocationUpdateTime = 0;

  constructor() {
    // Watch location during active deliveries
    effect(() => {
      const status = this.locationStatus();
      const ordersList = this.orders();
      const user = this.currentUser();
      
      const hasActiveDelivery = ordersList.some(
        o => o.status === 'delivering' && o.motoboyId === user?.id
      );

      // Cleanup previous watcher
      if (this.watchId !== null) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }

      if (status === 'granted' && hasActiveDelivery) {
        this.watchId = navigator.geolocation.watchPosition(
          (pos) => {
            this.showLocationWarning.set(false);
            if (user) {
              const now = Date.now();
              if (now - this.lastLocationUpdateTime >= 10000) {
                this.lastLocationUpdateTime = now;
                this.ordersService.updateMotoboyLocation(user.id, pos.coords.latitude, pos.coords.longitude);
              }
            }
          },
          () => this.showLocationWarning.set(true),
          { timeout: 15000, enableHighAccuracy: true }
        );
      }
    });
  }

  ngOnInit() {
    this.checkLocationPermission();
  }

  ngOnDestroy() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  private checkLocationPermission() {
    if (!navigator.geolocation) {
      this.locationStatus.set('unsupported');
      return;
    }

    if (navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          if (result.state === 'granted') {
            this.locationStatus.set('granted');
          } else {
            this.locationStatus.set('denied'); // prompt - show gate
          }
          result.onchange = () => {
            if (result.state === 'granted') {
              this.locationStatus.set('granted');
            } else {
              this.locationStatus.set('denied');
            }
          };
        })
        .catch(() => this.locationStatus.set('denied'));
    } else {
      this.locationStatus.set('denied');
    }
  }

  requestLocation() {
    this.locationStatus.set('checking');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.locationStatus.set('granted');
          const user = this.currentUser();
          if (user) {
            this.ordersService.updateMotoboyLocation(user.id, pos.coords.latitude, pos.coords.longitude);
          }
        },
        (err) => {
          console.error('Erro ao obter localização:', err);
          this.locationStatus.set('denied');
          this.toast.error('Permissão de localização negada ou indisponível.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      this.locationStatus.set('unsupported');
      this.toast.error('Geolocalização não é suportada por este navegador.');
    }
  }

  // Computed values
  readonly activeDelivery = computed(() => 
    this.orders().find(
      o => o.status === 'delivering' && o.motoboyId === this.currentUser()?.id
    )
  );

  readonly myOrders = computed(() => 
    this.orders().filter(
      o => (o.status === 'ready' || o.status === 'delivering') &&
           (o.motoboyId === this.currentUser()?.id || o.status === 'ready')
    )
  );

  readonly deliveredCount = computed(() => 
    this.orders().filter(
      o => o.status === 'delivered' && o.motoboyId === this.currentUser()?.id
    ).length
  );

  readonly readyOrdersCount = computed(() =>
    this.myOrders().filter(o => o.status === 'ready').length
  );

  readonly deliveringOrdersCount = computed(() =>
    this.myOrders().filter(o => o.status === 'delivering').length
  );

  readonly deliveredOrders = computed(() => 
    this.orders()
      .filter(o => o.status === 'delivered' && o.motoboyId === this.currentUser()?.id)
      .slice(0, 3)
  );

  readonly showPasswordModal = signal(false);
  newPassword = '';
  passwordSubmitting = signal(false);
  passwordError = signal('');

  async handleUpdatePassword() {
    this.passwordError.set('');
    if (this.newPassword.trim().length < 6) {
      this.passwordError.set('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    this.passwordSubmitting.set(true);
    const res = await this.authService.updatePassword(this.newPassword.trim());
    this.passwordSubmitting.set(false);

    if (res.success) {
      this.toast.success('Senha atualizada com sucesso!');
      this.showPasswordModal.set(false);
      this.newPassword = '';
    } else {
      this.passwordError.set(res.message);
    }
  }

  // Handlers
  handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  handleStartDelivery(id: string): void {
    if (this.activeDelivery()) {
      this.toast.error('Você já possui um pedido em rota!');
      return;
    }
    this.ordersService.updateStatus(id, 'delivering', this.currentUser()?.id, this.currentUser()?.name);
    this.toast.success('Entrega iniciada com sucesso!');
  }

  // Formatting helpers
  formatCurrency(v: number): string {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
