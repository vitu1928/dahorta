import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/data-access/auth.service';
import { OrdersService } from '../../customer/data-access/orders.service';
import { EmployeeService } from '../data-access/employee.service';
import { Order, OrderStatus } from '../../customer/data-access/customer.models';
import { ToastService } from '../../../shared/data-access/toast.service';

interface ColumnDef {
  status: OrderStatus;
  label: string;
  color: string;
  bg: string;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-dashboard.component.html',
  styles: [`
    .employee {
      font-family: 'Outfit', sans-serif;
      --sidebar: #1A2E1F;
      --sidebar-foreground: #FFFFFF;
      --sidebar-active: #4C7C59;
      --sidebar-border: rgba(255, 255, 255, 0.1);
    }
  `]
})
export class EmployeeDashboardComponent {
  private authService = inject(AuthService);
  private ordersService = inject(OrdersService);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private toast = inject(ToastService);

  // Expose signals from services
  readonly currentUser = this.authService.currentUser;
  readonly orders = this.ordersService.orders;
  readonly restaurantOpen = this.employeeService.restaurantOpen;
  readonly stockItems = this.employeeService.stockItems;

  // Local state signals
  readonly activeView = signal<'orders' | 'stock' | 'account'>('orders');
  readonly search = signal<string>('');
  readonly stockSearch = signal<string>('');

  readonly filteredStockItems = computed(() => {
    const term = this.stockSearch().toLowerCase().trim();
    const list = this.stockItems();
    if (!term) return list;
    return list.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    );
  });

  // Constants mapping
  readonly paymentLabels: Record<string, string> = {
    pix: 'PIX',
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    meal_voucher: 'Vale Refeição',
    cash: 'Dinheiro'
  };

  readonly columns: ColumnDef[] = [
    { status: 'received', label: 'Recebidos', color: '#F2994A', bg: 'rgba(242,153,74,0.1)' },
    { status: 'preparing', label: 'Preparando', color: '#E9C46A', bg: 'rgba(233,196,106,0.15)' },
    { status: 'ready', label: 'Prontos', color: '#3AA55D', bg: 'rgba(58,165,93,0.1)' },
    { status: 'delivering', label: 'A Caminho', color: '#2D9CDB', bg: 'rgba(45,156,219,0.1)' }
  ];

  readonly nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
    received: 'preparing',
    preparing: 'ready'
  };

  readonly nextLabelsMap: Partial<Record<OrderStatus, string>> = {
    received: 'Iniciar Preparo',
    preparing: 'Marcar Pronto'
  };

  // Computeds for orders page
  readonly activeOrders = computed(() => {
    return this.orders().filter(o => o.status !== 'delivered');
  });

  readonly filteredOrders = computed(() => {
    const term = this.search().toLowerCase().trim();
    const list = this.activeOrders();
    if (!term) return list;
    return list.filter(
      o =>
        (o.customerName && o.customerName.toLowerCase().includes(term)) ||
        o.id.toLowerCase().includes(term)
    );
  });

  // Pre-grouped orders by status to avoid templates arrow function issues
  readonly ordersByStatus = computed(() => {
    const list = this.filteredOrders();
    const groups: Record<OrderStatus, Order[]> = {
      received: [],
      preparing: [],
      ready: [],
      delivering: [],
      delivered: []
    };
    for (const order of list) {
      if (groups[order.status]) {
        groups[order.status].push(order);
      }
    }
    return groups;
  });

  readonly totalToday = computed(() => this.orders().length);
  readonly preparingCount = computed(() => this.orders().filter(o => o.status === 'preparing').length);
  readonly readyCount = computed(() => this.orders().filter(o => o.status === 'ready').length);

  // Computeds for stock page
  readonly lowStockItems = computed(() => {
    return this.stockItems().filter(item => item.currentQuantity <= item.minQuantity);
  });

  newPassword = '';
  currentPassword = '';
  readonly passwordSubmitting = signal(false);
  readonly passwordError = signal('');

  async handleUpdatePassword() {
    this.passwordError.set('');
    if (this.newPassword.trim().length < 6) {
      this.passwordError.set('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    this.passwordSubmitting.set(true);
    const res = await this.authService.updatePassword(this.newPassword.trim(), this.currentPassword);
    this.passwordSubmitting.set(false);

    if (res.success) {
      this.toast.success('Senha atualizada com sucesso!');
      this.newPassword = '';
      this.currentPassword = '';
      this.activeView.set('orders');
    } else {
      this.passwordError.set(res.message);
    }
  }

  // Action methods
  handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  updateOrderStatus(orderId: string, status: OrderStatus): void {
    this.ordersService.updateStatus(orderId, status);
  }

  toggleRestaurantOpen(): void {
    this.employeeService.toggleRestaurantOpen();
  }

  // Formatting helpers
  formatTime(d: any): string {
    const date = d instanceof Date ? d : new Date(d);
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'agora';
    if (diff < 60) return `${diff}min atrás`;
    return `${Math.floor(diff / 60)}h ${diff % 60}min atrás`;
  }

  formatCurrency(v: number): string {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  getPercent(current: number, minQuantity: number): number {
    return Math.min((current / (minQuantity * 2)) * 100, 100);
  }

  getDeliveryAddressText(order: Order): string {
    const addr = order.deliveryAddress || order.address;
    if (addr) {
      return `${addr.street}, ${addr.number} — ${addr.neighborhood}`;
    }
    return 'Retirada no Balcão';
  }
}
