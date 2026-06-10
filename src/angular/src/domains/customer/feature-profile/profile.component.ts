import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrdersService } from '../data-access/orders.service';
import { AuthService } from '../data-access/auth.service';
import { Order } from '../data-access/customer.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="color: var(--foreground); min-height: 100vh;">
      <div class="px-4 py-5 max-w-[800px] mx-auto">
        @if (!currentUser()) {
          <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h2 style="color: var(--foreground); font-size: 20px; font-weight: 700; margin-bottom: 8px;">Faça login</h2>
            <p style="color: var(--muted-foreground); font-size: 14px; margin-bottom: 24px;">
              Acesse sua conta para ver seu perfil
            </p>
            <button 
              (click)="router.navigate(['/landing'])" 
              class="px-6 py-3 rounded-xl font-semibold border-none cursor-pointer text-white" 
              style="background: var(--primary);"
            >
              Ir para Landing
            </button>
          </div>
        } @else {
          <!-- Avatar Header -->
          <div class="flex flex-col items-center mb-6">
            <div
              class="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold mb-3 text-white"
              style="background: linear-gradient(135deg, var(--primary), #a855f7);"
            >
              {{ currentUser()?.avatar }}
            </div>
            <h2 style="font-family: 'Poppins', sans-serif; font-size: 20px; font-weight: 700; color: var(--foreground);">
              {{ currentUser()?.name }}
            </h2>
            <div class="flex items-center gap-2 mt-1">
              <div 
                class="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border" 
                style="background: rgba(212,116,95,0.1); color: var(--primary); border-color: rgba(212,116,95,0.22);"
              >
                {{ getRoleLabel(currentUser()?.role) }}
              </div>
            </div>
          </div>

          <!-- Profile Details Card -->
          <div class="rounded-2xl p-5 mb-4 border bg-white" style="border-color: var(--border);">
            <div class="flex items-center justify-between mb-4">
              <h3 style="font-size: 14px; font-weight: 600; color: var(--foreground);">Dados Pessoais</h3>
              <button
                (click)="toggleEditMode()"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer"
                [style.background]="editMode() ? 'rgba(76,175,80,0.1)' : 'rgba(212,116,95,0.1)'"
                [style.color]="editMode() ? '#4CAF50' : 'var(--primary)'"
                [style.border-color]="editMode() ? 'rgba(76,175,80,0.22)' : 'rgba(212,116,95,0.22)'"
              >
                @if (editMode()) {
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Salvar</span>
                } @else {
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  <span>Editar</span>
                }
              </button>
            </div>
            <div class="space-y-3">
              <div>
                <label class="label-text">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>Nome</span>
                </label>
                @if (editMode()) {
                  <input [(ngModel)]="formName" class="input-field" />
                } @else {
                  <p style="color: var(--text-secondary); font-size: 14px;">{{ currentUser()?.name || '—' }}</p>
                }
              </div>
              <div>
                <label class="label-text">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <span>E-mail</span>
                </label>
                @if (editMode()) {
                  <input [(ngModel)]="formEmail" class="input-field" />
                } @else {
                  <p style="color: var(--text-secondary); font-size: 14px;">{{ currentUser()?.email || '—' }}</p>
                }
              </div>
              <div>
                <label class="label-text">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span>Telefone</span>
                </label>
                @if (editMode()) {
                  <input [(ngModel)]="formPhone" class="input-field" />
                } @else {
                  <p style="color: var(--text-secondary); font-size: 14px;">{{ currentUser()?.phone || '—' }}</p>
                }
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="rounded-2xl overflow-hidden mb-4 border bg-white" style="border-color: var(--border);">
            @for (act of actions; track act.label; let idx = $index; let last = $last) {
              <button
                (click)="act.action()"
                class="w-full flex items-center gap-3 px-5 py-4 transition-all text-left bg-transparent border-none cursor-pointer"
                style="border-bottom: 1px solid var(--border);"
                [style.border-bottom-style]="last ? 'none' : 'solid'"
                (mouseenter)="onMouseEnterAction($event)"
                (mouseleave)="onMouseLeaveAction($event)"
              >
                <div 
                  class="w-8 h-8 rounded-xl flex items-center justify-center text-sm" 
                  [style.background]="act.bg" 
                  [style.color]="act.color"
                >
                  @switch (act.label) {
                    @case ('Meus Pedidos') {
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>
                    }
                    @case ('Endereços Salvos') {
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    }
                    @case ('Notificações') {
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                    }
                    @case ('Segurança & Privacidade') {
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    }
                  }
                </div>
                <span style="color: var(--text-secondary); font-size: 14px; flex: 1;">{{ act.label }}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            }
          </div>

          <!-- Recent Orders -->
          @if (recentOrders().length > 0) {
            <div class="mb-5">
              <div class="flex items-center justify-between mb-3">
                <h3 style="font-size: 14px; font-weight: 600; color: var(--foreground);">Pedidos Recentes</h3>
                <button 
                  (click)="router.navigate(['/customer/orders'])" 
                  class="bg-transparent border-none cursor-pointer" 
                  style="color: var(--primary); font-size: 12px;"
                >
                  Ver todos
                </button>
              </div>
              <div class="space-y-2">
                @for (order of recentOrders(); track order.id) {
                  <button
                    (click)="router.navigate(['/customer/orders', order.id])"
                    class="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border cursor-pointer bg-white"
                    style="border-color: var(--border);"
                    (mouseenter)="onMouseEnterOrder($event)"
                    (mouseleave)="onMouseLeaveOrder($event)"
                  >
                    <div class="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#F7F9F7] flex items-center justify-center text-xl">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>
                    </div>
                    <div class="flex-1">
                      <p style="color: var(--foreground); font-size: 13px; font-weight: 600;">
                        {{ getOrderSummary(order) }}
                      </p>
                      <p style="color: var(--muted-foreground); font-size: 11px;">
                        {{ order.id }} • {{ formatCurrency(order.totalAmount || order.total || 0) }}
                      </p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                }
              </div>
            </div>
          }

          <!-- Logout -->
          <button
            (click)="handleLogout()"
            class="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all border cursor-pointer"
            style="background: rgba(196,69,54,0.08); color: var(--destructive); border-color: rgba(196,69,54,0.22); font-size: 14px; font-weight: 600;"
            (mouseenter)="onMouseEnterLogout($event)"
            (mouseleave)="onMouseLeaveLogout($event)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sair da Conta
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .label-text { display: flex; align-items: center; gap: 6px; color: var(--muted-foreground); font-size: 11px; font-weight: 500; margin-bottom: 6px; }
    .input-field {
      width: 100%; px: 16px; py: 10px; outline: none; border-radius: 12px;
      background: var(--muted); border: 1px solid var(--border); color: var(--foreground); font-size: 14px;
      transition: all 0.2s;
    }
    .input-field:focus { border-color: var(--primary); }
  `]
})
export class ProfileComponent {
  authService = inject(AuthService);
  ordersService = inject(OrdersService);
  router = inject(Router);

  currentUser = this.authService.currentUser;
  orders = this.ordersService.orders;

  editMode = signal(false);

  formName = '';
  formEmail = '';
  formPhone = '';

  recentOrders = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    
    // Sort orders by date descending and take first 2
    return this.orders()
      .filter(o => o.customerId === user.id)
      .slice(0, 2);
  });

  actions = [
    { label: 'Meus Pedidos', action: () => this.router.navigate(['/customer/orders']), icon: '📦', bg: 'rgba(212,116,95,0.14)', color: 'var(--primary)' },
    { label: 'Endereços Salvos', action: () => {}, icon: '📍', bg: 'rgba(117,176,68,0.14)', color: '#75B044' },
    { label: 'Notificações', action: () => {}, icon: '🔔', bg: 'rgba(168,85,247,0.14)', color: '#a855f7' },
    { label: 'Segurança & Privacidade', action: () => {}, icon: '🛡️', bg: 'rgba(76,175,80,0.14)', color: '#4CAF50' },
  ];

  constructor() {
    const user = this.currentUser();
    if (user) {
      this.formName = user.name;
      this.formEmail = user.email;
      this.formPhone = user.phone || '';
    }
  }

  getRoleLabel(role?: string): string {
    if (role === 'owner') return 'Dono';
    if (role === 'employee') return 'Funcionário';
    if (role === 'motoboy') return 'Motoboy';
    return 'Cliente';
  }

  toggleEditMode() {
    if (this.editMode()) {
      // Save changes
      this.authService.updateProfile(this.formName, this.formEmail, this.formPhone);
      this.editMode.set(false);
    } else {
      const user = this.currentUser();
      if (user) {
        this.formName = user.name;
        this.formEmail = user.email;
        this.formPhone = user.phone || '';
      }
      this.editMode.set(true);
    }
  }

  getOrderSummary(order: Order): string {
    const names = order.items.map(i => i.name).join(', ');
    return names.length > 30 ? names.slice(0, 30) + '...' : names;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  handleLogout() {
    this.authService.logout();
    this.router.navigate(['/landing']);
  }

  onMouseEnterAction(e: MouseEvent) {
    const btn = e.currentTarget as HTMLButtonElement;
    btn.style.background = 'var(--muted)';
  }

  onMouseLeaveAction(e: MouseEvent) {
    const btn = e.currentTarget as HTMLButtonElement;
    btn.style.background = 'transparent';
  }

  onMouseEnterOrder(e: MouseEvent) {
    const btn = e.currentTarget as HTMLButtonElement;
    btn.style.borderColor = 'var(--primary)';
  }

  onMouseLeaveOrder(e: MouseEvent) {
    const btn = e.currentTarget as HTMLButtonElement;
    btn.style.borderColor = 'var(--border)';
  }

  onMouseEnterLogout(e: MouseEvent) {
    const btn = e.currentTarget as HTMLButtonElement;
    btn.style.background = 'rgba(196,69,54,0.15)';
  }

  onMouseLeaveLogout(e: MouseEvent) {
    const btn = e.currentTarget as HTMLButtonElement;
    btn.style.background = 'rgba(196,69,54,0.08)';
  }
}
