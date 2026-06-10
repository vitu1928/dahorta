import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { OrdersService } from './orders.service';
import { Order, OrderStatus, PaymentMethod, Address, CartItem } from './customer.models';

@Injectable({ providedIn: 'root' })
export class MockOrdersService extends OrdersService {
  override orders = signal<Order[]>([]);
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
    const order: Order = {
      id: `order-${Date.now()}`,
      customerId,
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
      return true;
    }
    return false;
  }
}
