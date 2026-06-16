import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrdersService } from '../data-access/orders.service';
import { AuthService } from '@domain/auth/data-access/auth.service';
import { ReviewsService } from '../data-access/reviews.service';
import { Order, OrderStatus } from '../data-access/customer.models';
import { DeliveryMapComponent } from '../ui/delivery-map.component';
import { OrderTimelineComponent } from '../ui/order-timeline.component';

const STATUS_LABELS: Record<OrderStatus, string> = {
  received: 'Pedido Recebido',
  preparing: 'Preparando',
  ready: 'Pronto para Entrega',
  delivering: 'Saiu para Entrega',
  delivered: 'Entregue',
};

const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  received: 'Seu pedido foi confirmado',
  preparing: 'Nossa equipe está preparando seu pedido',
  ready: 'Aguardando o motoboy',
  delivering: 'Seu pedido está a caminho!',
  delivered: 'Bom apetite! 🥗',
};

const ETA_VALUES: Record<OrderStatus, string> = {
  received: '45-55',
  preparing: '30-40',
  ready: '20-30',
  delivering: '10-20',
  delivered: '0',
};

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, DeliveryMapComponent, OrderTimelineComponent],
  template: `
    <div style="color: var(--foreground); min-height: 100vh;">
      <!-- Header -->
      <div class="flex items-center gap-3 px-4 py-4" style="border-bottom: 1px solid var(--border)">
        <button 
          (click)="router.navigate(['/customer/menu'])" 
          class="w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer bg-transparent"
          style="background: var(--muted); border-color: var(--border); color: var(--muted-foreground);"
        >
          <!-- ArrowLeft SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </button>
        <div>
          <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700;">
            Acompanhar Pedido
          </h1>
          <p style="color: var(--muted-foreground); font-size: 12px;">{{ orderId() }}</p>
        </div>
      </div>

      <div class="px-4 py-5 space-y-4 max-w-[800px] mx-auto">
        @if (!order()) {
          <div class="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div style="font-size: 48px; margin-bottom: 16px;">😕</div>
            <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Pedido não encontrado</h2>
            <p style="color: var(--muted-foreground); font-size: 14px; margin-bottom: 24px;">
              O pedido {{ orderId() }} não existe ou foi removido.
            </p>
            <button 
              (click)="router.navigate(['/customer/menu'])" 
              class="px-5 py-2.5 rounded-xl border-none cursor-pointer text-white font-semibold" 
              style="background: var(--primary);"
            >
              Voltar ao Cardápio
            </button>
          </div>
        } @else {
          <!-- Status Card -->
          <div
            class="rounded-2xl p-5 text-center border"
            [style.background]="isDelivered() ? 'rgba(76,175,80,0.07)' : 'rgba(212,116,95,0.07)'"
            [style.border-color]="isDelivered() ? 'rgba(76,175,80,0.22)' : 'rgba(212,116,95,0.22)'"
          >
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              [style.background]="isDelivered() ? 'rgba(76,175,80,0.14)' : 'rgba(212,116,95,0.14)'"
            >
              @switch (order()!.status) {
                @case ('received') {
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                }
                @case ('preparing') {
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18V6a4 4 0 0 1 8 0v12"/><path d="M18 18V9a4 4 0 0 0-8 0v9"/><path d="M3 18h18a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1z"/><path d="M12 6V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3"/></svg>
                }
                @case ('ready') {
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                }
                @case ('delivering') {
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M15 13.5 16.5 16H20M15 13.5a1.5 1.5 0 1 1-3 0l-3-6H5M12 7.5l-3-3H6.5"/></svg>
                }
                @case ('delivered') {
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                }
              }
            </div>
            <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 800;">
              {{ getStatusLabel(order()!.status) }}
            </h2>
            <p style="color: var(--muted-foreground); font-size: 13px; mt-1;">
              {{ getStatusDescription(order()!.status) }}
            </p>
            
            @if (!isDelivered()) {
              <div 
                class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border"
                style="background: rgba(212,116,95,0.1); border-color: rgba(212,116,95,0.22);"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span style="color: var(--primary); font-size: 13px; font-weight: 600;">
                  ~{{ getEstimatedTime(order()!.status) }} minutos restantes
                </span>
              </div>
            }
          </div>

          <!-- Live Map (when delivering) -->
          @if (order()!.status === 'delivering') {
            <app-delivery-map
              [motoboyName]="order()!.motoboyName || 'Motoboy'"
              [customerAddress]="getAddressString(order()!.deliveryAddress || order()!.address)"
              [address]="order()!.deliveryAddress || order()!.address"
              [motoboyLocation]="motoboyCoords()"
              [lastLocationUpdate]="lastLocationUpdate()"
            ></app-delivery-map>
          }

          <!-- Timeline -->
          <div class="rounded-2xl p-5 border bg-white" style="border-color: var(--border);">
            <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 20px;">Timeline do Pedido</h3>
            <app-order-timeline [currentStatus]="order()!.status"></app-order-timeline>
          </div>

          <!-- Order Details -->
          <div class="rounded-2xl p-5 border bg-white" style="border-color: var(--border);">
            <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">Detalhes do Pedido</h3>
            @for (item of order()!.items; track item.productId) {
              <div class="flex items-center justify-between py-2 border-b last:border-none" style="border-color: var(--border);">
                <div class="flex items-center gap-3">
                  <div class="w-7 h-7 rounded-lg overflow-hidden bg-[#F7F9F7]">
                    <img [src]="item.image" [alt]="item.name" class="w-full h-full object-cover" />
                  </div>
                  <span style="color: var(--muted-foreground); font-size: 13px;">
                    {{ item.quantity }}x {{ item.name }}
                  </span>
                </div>
                <span style="color: var(--foreground); font-size: 13px; font-weight: 600;">
                  {{ formatCurrency(item.price * item.quantity) }}
                </span>
              </div>
            }
            <div class="flex justify-between pt-3 font-bold">
              <span style="font-size: 14px;">Total</span>
              <span style="color: var(--primary); font-size: 16px;">
                {{ formatCurrency(order()!.totalAmount || order()!.total || 0) }}
              </span>
            </div>

            @if (order()!.notes || order()!.addressNotes) {
              <div class="mt-4 pt-4 space-y-3 border-t" style="border-color: var(--border);">
                @if (order()!.notes) {
                  <div class="flex gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <div>
                      <span style="color: var(--muted-foreground); font-size: 11px; font-weight: 600; text-transform: uppercase;">
                        Observações do Pedido
                      </span>
                      <p style="color: var(--foreground); font-size: 13px; margin-top: 2px;">{{ order()!.notes }}</p>
                    </div>
                  </div>
                }
                @if (order()!.addressNotes) {
                  <div class="flex gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <div>
                      <span style="color: var(--muted-foreground); font-size: 11px; font-weight: 600; text-transform: uppercase;">
                        Ponto de Referência
                      </span>
                      <p style="color: var(--foreground); font-size: 13px; margin-top: 2px;">{{ order()!.addressNotes }}</p>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Confirmation Code -->
          @if (!isDelivered()) {
            <div class="rounded-2xl p-5 border bg-white" style="border-color: var(--border);">
              <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">Código de Confirmação</h3>
              <p style="color: var(--muted-foreground); font-size: 12px; margin-bottom: 12px;">
                Informe este código ao motoboy ao receber seu pedido
              </p>
              <div class="flex items-center gap-3">
                <div 
                  class="flex-1 py-4 rounded-xl text-center font-bold tracking-widest border"
                  style="background: var(--muted); color: var(--primary); font-size: 28px; letter-spacing: 8px; border-color: rgba(212,116,95,0.3); border-style: dashed;"
                >
                  {{ order()!.deliveryCode || '123456' }}
                </div>
                <button 
                  (click)="copyCode(order()!.deliveryCode || '123456')"
                  class="w-12 h-12 rounded-xl flex items-center justify-center border transition-all cursor-pointer"
                  [style.color]="copiedCode() ? '#4CAF50' : 'var(--muted-foreground)'"
                  style="background: var(--muted); border-color: var(--border);"
                >
                  @if (copiedCode()) {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-[#4CAF50]"><polyline points="20 6 9 17 4 12"/></svg>
                  } @else {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  }
                </button>
              </div>
            </div>
          }

          <!-- Post-Delivery: Rating Section -->
          @if (isDelivered()) {
            <div class="text-center py-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
              <h3 style="color: #4CAF50; font-size: 20px; font-weight: 700;">Pedido Entregue!</h3>
              <p style="color: var(--muted-foreground); font-size: 13px; margin-top: 4px;">
                Obrigado por escolher o DaHorta!
              </p>
              <button 
                (click)="router.navigate(['/customer/menu'])" 
                class="mt-4 px-6 py-3 rounded-xl font-semibold border-none cursor-pointer text-white"
                style="background: var(--primary);"
              >
                Pedir Novamente
              </button>
            </div>

            @if (!reviewSubmitted()) {
              <div
                class="rounded-2xl p-5 border bg-white"
                style="border-color: rgba(244,162,97,0.3);"
              >
                <div class="flex items-center gap-2 mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent, #F4A261);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700;">
                    {{ existingReview() ? 'Sua Avaliação' : 'Avalie seu Pedido' }}
                  </h3>
                </div>

                @if (existingReview(); as rev) {
                  <div class="text-center py-4">
                    <div class="flex justify-center gap-1.5 mb-3">
                      @for (s of [1,2,3,4,5]; track s) {
                        <svg width="28" height="28" viewBox="0 0 24 24" [attr.fill]="s <= rev.stars ? '#F4A261' : 'transparent'" [attr.stroke]="s <= rev.stars ? '#F4A261' : 'var(--border)'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      }
                    </div>
                    @if (rev.comment) {
                      <p style="color: var(--muted-foreground); font-size: 13px; font-style: italic;">
                        "{{ rev.comment }}"
                      </p>
                    }
                    <p style="color: var(--muted-foreground); font-size: 12px; margin-top: 8px;">
                      Avaliação enviada. Obrigado!
                    </p>
                  </div>
                } @else {
                  <!-- Inline Review Form -->
                  <div class="space-y-5">
                    <div class="text-center">
                      <p style="color: var(--muted-foreground); font-size: 13px; margin-bottom: 12px;">
                        Como foi a sua experiência?
                      </p>
                      <div class="flex justify-center gap-3 mb-3">
                        @for (s of [1,2,3,4,5]; track s) {
                          <button
                            (click)="setStars(s)"
                            (mouseenter)="hoverStar.set(s)"
                            (mouseleave)="hoverStar.set(0)"
                            class="cursor-pointer border-none bg-transparent"
                            [style.transform]="(hoverStar() === s || stars() === s) ? 'scale(1.15)' : 'scale(1)'"
                            style="transition: transform 0.15s; padding: 4px;"
                          >
                            <svg width="36" height="36" viewBox="0 0 24 24" [attr.fill]="s <= (hoverStar() || stars()) ? '#F4A261' : 'transparent'" [attr.stroke]="s <= (hoverStar() || stars()) ? '#F4A261' : 'var(--border)'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: all 0.15s;">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                          </button>
                        }
                      </div>
                      @if (stars() > 0) {
                        <p [style.color]="getStarColor()" style="font-size: 14px; font-weight: 700;">
                          {{ getStarLabel() }}
                        </p>
                      }
                    </div>

                    @if (stars() > 0) {
                      <div>
                        <label style="color: var(--muted-foreground); font-size: 12px; font-weight: 500; display: block; margin-bottom: 8px;">
                          @if (needsComment()) {
                            <span class="flex items-center gap-1.5" style="color: var(--destructive);">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                              <span>Comentário obrigatório para notas ≤ 3 *</span>
                            </span>
                          } @else {
                            Comentário (opcional)
                          }
                        </label>
                        <textarea
                          [(ngModel)]="comment"
                          [placeholder]="needsComment() ? 'Conte o que aconteceu para melhorarmos...' : 'Algo especial que gostou ou pode melhorar?'"
                          rows="3"
                          class="w-full px-4 py-3 rounded-xl outline-none resize-none border"
                          [style.background]="'var(--muted)'"
                          [style.border-color]="(needsComment() && !comment.trim()) ? 'rgba(196,69,54,0.4)' : 'var(--border)'"
                          style="font-size: 13px;"
                        ></textarea>
                        @if (needsComment() && !comment.trim()) {
                          <p style="color: var(--destructive); font-size: 11px; margin-top: 4px;">
                            ⚠️ Avaliações com 3 estrelas ou menos exigem um comentário.
                          </p>
                        }
                      </div>
                    }

                    <button
                      (click)="submitReview()"
                      [disabled]="!canSubmitReview()"
                      class="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 border-none font-bold text-sm transition-all"
                      [style.background]="canSubmitReview() ? 'var(--primary)' : 'var(--muted)'"
                      [style.color]="canSubmitReview() ? 'white' : 'var(--muted-foreground)'"
                      [style.cursor]="canSubmitReview() ? 'pointer' : 'not-allowed'"
                    >
                      Enviar Avaliação
                    </button>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-6 border rounded-2xl bg-white" style="border-color: var(--border);">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                <h3 style="color: #4CAF50; font-size: 18px; font-weight: 700; margin-top: 8px;">Obrigado pela avaliação!</h3>
                <p style="color: var(--muted-foreground); font-size: 13px; margin-top: 4px;">Sua opinião nos ajuda a melhorar sempre.</p>
              </div>
            }
          }
        }
      </div>
    </div>
  `
})
export class OrderTrackingComponent {
  private route = inject(ActivatedRoute);
  private ordersService = inject(OrdersService);
  private authService = inject(AuthService);
  private reviewsService = inject(ReviewsService);
  router = inject(Router);

  orderId = signal<string>('');
  order = signal<Order | null>(null);

  isDelivered = computed(() => {
    const o = this.order();
    return o ? o.status === 'delivered' : false;
  });

  copiedCode = signal(false);
  reviewSubmitted = signal(false);
  
  motoboyLocation = signal<{ lat: number; lng: number; updatedAt: number } | null>(null);
  lastLocationUpdate = signal<number | null>(null);
  private locationSub: any = null;
  private tickInterval: any = null;
  private _now = signal<number>(Date.now());

  /** Exposes only lat/lng to the map component (no updatedAt leak needed there) */
  motoboyCoords = computed(() => {
    const loc = this.motoboyLocation();
    return loc ? { lat: loc.lat, lng: loc.lng } : null;
  });

  // Review states
  stars = signal(0);
  hoverStar = signal(0);
  comment = '';

  existingReview = computed(() => {
    const o = this.order();
    return o ? this.reviewsService.getByOrder(o.id) : undefined;
  });

  needsComment = computed(() => {
    const s = this.stars();
    return s > 0 && s <= 3;
  });

  canSubmitReview = computed(() => {
    const s = this.stars();
    const commentOk = !this.needsComment() || this.comment.trim().length > 0;
    return s > 0 && commentOk;
  });

  constructor() {
    // Get ID from URL
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.orderId.set(idParam);
      this.ordersService.subscribeToOrder(idParam)
        .pipe(takeUntilDestroyed())
        .subscribe(o => {
          this.order.set(o);
          
          if (o && o.status === 'delivering' && o.motoboyId) {
            if (!this.locationSub) {
              this.locationSub = this.ordersService.getMotoboyLocation(o.motoboyId)
                .subscribe(loc => {
                  console.log('[TRACKING] Localização recebida do motoboy:', loc);
                  this.motoboyLocation.set(loc);
                  if (loc) {
                    console.log('[TRACKING] updatedAt:', loc.updatedAt, new Date(loc.updatedAt).toLocaleTimeString('pt-BR'));
                    this.lastLocationUpdate.set(loc.updatedAt);
                  }
                });

              // Start 1-second ticker to keep "há X seg" fresh
              if (!this.tickInterval) {
                this.tickInterval = setInterval(() => {
                  this._now.set(Date.now());
                }, 1000);
              }
            }
          } else {
            if (this.locationSub) {
              this.locationSub.unsubscribe();
              this.locationSub = null;
            }
            if (this.tickInterval) {
              clearInterval(this.tickInterval);
              this.tickInterval = null;
            }
            this.motoboyLocation.set(null);
            this.lastLocationUpdate.set(null);
          }
        });
    }
  }

  getStatusEmoji(status: OrderStatus): string {
    switch (status) {
      case 'received': return '💜';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '🕐';
      case 'delivering': return '🚴';
      case 'delivered': return '🏠';
      default: return '📦';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    return STATUS_LABELS[status] || status;
  }

  getStatusDescription(status: OrderStatus): string {
    return STATUS_DESCRIPTIONS[status] || '';
  }

  getEstimatedTime(status: OrderStatus): string {
    return ETA_VALUES[status] || '0';
  }

  getAddressString(address: any): string {
    if (!address) return '';
    return `${address.street}, ${address.number}`;
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    this.copiedCode.set(true);
    setTimeout(() => this.copiedCode.set(false), 2000);
  }

  setStars(s: number) {
    this.stars.set(s);
  }

  getStarColor(): string {
    const s = this.stars();
    if (s >= 4) return '#22c55e';
    if (s === 3) return '#eab308';
    return '#ef4444';
  }

  getStarLabel(): string {
    switch (this.stars()) {
      case 5: return 'Excelente!';
      case 4: return 'Muito Bom!';
      case 3: return 'Regular';
      case 2: return 'Ruim';
      case 1: return 'Péssimo';
      default: return '';
    }
  }

  submitReview() {
    if (!this.canSubmitReview()) return;
    const currentUser = this.authService.currentUser();
    const o = this.order();
    if (!o) return;

    this.reviewsService.addReview({
      orderId: o.id,
      stars: this.stars(),
      comment: this.comment.trim() || undefined,
      createdAt: new Date(),
      customerId: currentUser?.id || 'guest',
      customerName: currentUser?.name || 'Cliente',
    });

    this.reviewSubmitted.set(true);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
