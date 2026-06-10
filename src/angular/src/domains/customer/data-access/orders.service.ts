import { Injectable, WritableSignal, Signal } from '@angular/core';
import { Order, OrderStatus, PaymentMethod, Address, CartItem } from './customer.models';

@Injectable({ providedIn: 'root' })
export abstract class OrdersService {
  abstract readonly orders: WritableSignal<Order[]>;
  abstract readonly activeOrderId: WritableSignal<string | null>;
  abstract readonly activeOrder: Signal<Order | null>;

  abstract placeOrder(
    customerId: string,
    paymentMethod: PaymentMethod,
    address: Address,
    cartItems: CartItem[],
    totalAmount: number,
    discount?: number,
    notes?: string,
    addressNotes?: string
  ): Order;

  abstract updateStatus(orderId: string, status: OrderStatus, motoboyId?: string): void;
  abstract getByCustomer(customerId: string): Order[];
  abstract confirmDelivery(orderId: string, code: string): boolean;
}

