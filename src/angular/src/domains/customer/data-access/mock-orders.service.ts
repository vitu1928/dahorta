import { Injectable, signal, computed, WritableSignal, Signal, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrdersService } from './orders.service';
import { Order, OrderStatus, PaymentMethod, Address, CartItem } from './customer.models';
import { MOCK_ORDERS, MOCK_TECHNICAL_SHEETS, MOCK_INSUMOS } from './mock-data';
import { EmployeeService } from '../../employee/data-access/employee.service';
import { ProductsService } from './products.service';
import { AuthService } from '@domain/auth/data-access/auth.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class MockOrdersService extends OrdersService {
  private employeeService = inject(EmployeeService);
  private productsService = inject(ProductsService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  override orders = signal<Order[]>(MOCK_ORDERS);
  override activeOrderId = signal<string | null>(null);

  override activeOrder = computed(() => {
    const id = this.activeOrderId();
    return (id ? this.orders().find(o => o.id === id) : null) ?? null;
  });

  override placeOrder(
    customerId: string,
    paymentMethod: PaymentMethod,
    address: Address,
    cartItems: CartItem[],
    totalAmount: number,
    discount: number = 0,
    notes?: string,
    addressNotes?: string
  ): Order {
    const currentUser = this.authService.currentUser();
    const customerName = currentUser ? currentUser.name : 'Cliente Anônimo';
    const customerPhone = currentUser ? currentUser.phone : '';

    const order: Order = {
      id: `order-${Date.now()}`,
      customerId,
      customerName,
      customerPhone,
      items: cartItems,
      totalAmount,
      deliveryFee: 15, // Mock fee
      discount,
      address,
      paymentMethod,
      status: 'received',
      createdAt: new Date(),
      updatedAt: new Date(),
      notes,
      addressNotes,
      deliveryCode: Math.random().toString(36).substring(7).toUpperCase(),
    };

    // Deduct stock and update product availability based on depleted stock
    for (const item of cartItems) {
      const sheet = MOCK_TECHNICAL_SHEETS.find(ts => ts.productId === item.productId);
      if (sheet) {
        for (const ing of sheet.ingredients) {
          const insumo = MOCK_INSUMOS.find(ins => ins.id === ing.insumoId);
          if (insumo) {
            const normalizedInsumoName = insumo.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const stockItem = this.employeeService.stockItems().find(stk => {
              const normalizedStkName = stk.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              return normalizedStkName.includes(normalizedInsumoName.substring(0, 8)) || normalizedInsumoName.includes(normalizedStkName.substring(0, 8));
            });
            
            if (stockItem) {
              const newQty = Math.max(0, stockItem.currentQuantity - (ing.quantity * item.quantity));
              this.employeeService.updateStockQuantity(stockItem.id, newQty);
              
              // If stock is depleted, disable product
              if (newQty <= 0) {
                const prod = this.productsService.products().find(p => p.id === item.productId);
                if (prod && prod.available) {
                  prod.available = false;
                  this.productsService.products.set([...this.productsService.products()]);
                }
              }
            }
          }
        }
      }
    }

    this.orders.set([...this.orders(), order]);
    this.activeOrderId.set(order.id);
    
    return order;
  }

  override updateStatus(orderId: string, status: OrderStatus, motoboyId?: string) {
    const order = this.orders().find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
      if (motoboyId) order.motoboyId = motoboyId;
      this.orders.set([...this.orders()]);

      // Trigger notification based on status
      const cleanId = orderId.startsWith('order-') ? orderId.substring(6) : orderId;
      if (status === 'preparing') {
        this.notificationService.sendNotification('Pedido em Preparo 🥗', `Seu pedido #${cleanId} está sendo preparado com muito carinho!`, 'orderStatus');
      } else if (status === 'ready') {
        this.notificationService.sendNotification('Pedido Pronto! 😋', `Seu pedido #${cleanId} está pronto e aguardando o entregador.`, 'orderStatus');
      } else if (status === 'delivering') {
        this.notificationService.sendNotification('Pedido a Caminho! 🛵', `Seu pedido #${cleanId} saiu para entrega!`, 'orderStatus');
        this.notificationService.sendNotification('Entregador se Aproximando 📍', 'O entregador já está a caminho do seu endereço.', 'motoboyApproaching');
      } else if (status === 'delivered') {
        this.notificationService.sendNotification('Pedido Entregue! 🎉', 'Seu pedido foi entregue com sucesso. Bom apetite!', 'orderStatus');
      }

      // If marked as 'ready', simulate Motoboy picking it up 10 seconds later
      if (status === 'ready') {
        setTimeout(() => {
          const currentOrder = this.orders().find(o => o.id === orderId);
          if (currentOrder && currentOrder.status === 'ready') {
            this.updateStatus(orderId, 'delivering', 'm1');
          }
        }, 10000);
      }
    }
  }

  override getByCustomer(customerId: string): Order[] {
    return this.orders().filter(o => o.customerId === customerId);
  }

  override confirmDelivery(orderId: string, code: string): boolean {
    const order = this.orders().find(o => o.id === orderId);
    if (order && order.deliveryCode === code) {
      order.status = 'delivered';
      order.updatedAt = new Date();
      this.orders.set([...this.orders()]);
      
      const cleanId = orderId.startsWith('order-') ? orderId.substring(6) : orderId;
      this.notificationService.sendNotification('Pedido Entregue! 🎉', `Seu pedido #${cleanId} foi entregue com sucesso. Bom apetite!`, 'orderStatus');
      
      return true;
    }
    return false;
  }

  override subscribeToOrder(orderId: string): Observable<Order | null> {
    return toObservable(this.orders).pipe(
      map(list => list.find(o => o.id === orderId) ?? null)
    );
  }
}
