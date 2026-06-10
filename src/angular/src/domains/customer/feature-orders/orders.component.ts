import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrdersService } from '../data-access/orders.service';
import { AuthService } from '@domain/auth/data-access/auth.service';
import { Order, OrderStatus } from '../data-access/customer.models';

const STATUS_LABELS: Record<OrderStatus, string> = {
  received: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Pronto para Entrega',
  delivering: 'Saiu para Entrega',
  delivered: 'Entregue',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  received: '#a855f7',
  preparing: '#d4745f',
  ready: '#75B044',
  delivering: '#2F80ED',
  delivered: '#4CAF50',
};

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="color: var(--foreground); min-height: 100vh;">
      <div class="px-4 py-5 max-w-[800px] mx-auto">
        <h1 style="font-family: 'Poppins', sans-serif; font-size: 22px; font-weight: 700; color: var(--foreground); margin-bottom: 4px;">
          Meus Pedidos
        </h1>
        <p style="color: var(--muted-foreground); font-size: 13px; margin-bottom: 20px;">
          {{ myOrders().length }} pedido{{ myOrders().length !== 1 ? 's' : '' }}
        </p>

        @if (myOrders().length === 0) {
          <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div 
              class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" 
              style="background: rgba(212,116,95,0.08); border: 2px solid rgba(212,116,95,0.18);"
            >
              <!-- Package Icon SVG -->
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>
            </div>
            <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: var(--foreground); margin-bottom: 8px;">
              Nenhum pedido ainda
            </h2>
            <p style="color: var(--muted-foreground); font-size: 14px; margin-bottom: 24px;">
              Seus pedidos aparecerão aqui após sua primeira compra
            </p>
            <button 
              (click)="router.navigate(['/customer/menu'])" 
              class="px-6 py-3 rounded-xl font-semibold border-none cursor-pointer text-white" 
              style="background: var(--primary);"
            >
              Explorar Cardápio
            </button>
          </div>
        } @else {
          <div class="space-y-3">
            @for (order of myOrders(); track order.id; let idx = $index) {
              <button
                (click)="viewOrder(order.id)"
                class="w-full text-left rounded-2xl overflow-hidden transition-all border cursor-pointer bg-white"
                [style.border-color]="isOrderActive(order.status) ? getStatusColor(order.status) + '30' : 'var(--border)'"
                (mouseenter)="onMouseEnter($event, order.status)"
                (mouseleave)="onMouseLeave($event, order.status)"
              >
                <div class="h-1" [style.background]="getStatusColor(order.status)"></div>
                <div class="p-4">
                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <span [style.color]="getStatusColor(order.status)" style="font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">
                        {{ order.id }}
                      </span>
                      <p style="color: var(--foreground); font-size: 15px; font-weight: 600; margin-top: 2px;">
                        {{ getItemsSummary(order) }}
                      </p>
                    </div>
                    <span class="mt-1 flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><polyline points="9 18 15 12 9 6"/></svg>
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="px-2 py-0.5 rounded-lg text-xs font-semibold" [style.background]="getStatusColor(order.status) + '18'" [style.color]="getStatusColor(order.status)">
                        {{ getStatusLabel(order.status) }}
                      </span>
                      <span style="color: var(--muted-foreground); font-size: 12px;">{{ formatDate(order.createdAt) }}</span>
                    </div>
                    <span style="color: var(--foreground); font-size: 14px; font-weight: 700;">
                      {{ formatCurrency(order.totalAmount || order.total || 0) }}
                    </span>
                  </div>
                </div>
              </button>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class OrdersComponent {
  ordersService = inject(OrdersService);
  authService = inject(AuthService);
  router = inject(Router);

  orders = this.ordersService.orders;
  currentUser = this.authService.currentUser;

  myOrders = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    
    // Include user orders
    return this.orders().filter(o => o.customerId === user.id);
  });

  isOrderActive(status: OrderStatus): boolean {
    return status !== 'delivered';
  }

  getStatusColor(status: OrderStatus): string {
    return STATUS_COLORS[status] || '#525252';
  }

  getStatusLabel(status: OrderStatus): string {
    return STATUS_LABELS[status] || 'Pendente';
  }

  getItemsSummary(order: Order): string {
    const names = order.items.map(i => i.name).join(', ');
    return names.length > 40 ? names.slice(0, 40) + '...' : names;
  }

  formatDate(d: Date): string {
    const date = new Date(d);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  viewOrder(orderId: string) {
    this.router.navigate(['/customer/orders', orderId]);
  }

  onMouseEnter(event: MouseEvent, status: OrderStatus) {
    const button = event.currentTarget as HTMLButtonElement;
    button.style.borderColor = this.getStatusColor(status);
  }

  onMouseLeave(event: MouseEvent, status: OrderStatus) {
    const button = event.currentTarget as HTMLButtonElement;
    button.style.borderColor = this.isOrderActive(status) ? this.getStatusColor(status) + '30' : 'var(--border)';
  }
}
