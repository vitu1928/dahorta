import { Injectable, WritableSignal, Signal } from '@angular/core';
import { Observable } from 'rxjs';
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
  ): Promise<Order>;

  abstract updateStatus(orderId: string, status: OrderStatus, motoboyId?: string, motoboyName?: string): void;
  abstract getByCustomer(customerId: string): Order[];
  abstract confirmDelivery(orderId: string, code: string): Promise<boolean> | boolean;
  abstract subscribeToOrder(orderId: string): Observable<Order | null>;
  abstract updateMotoboyLocation(motoboyId: string, lat: number, lng: number): void;
  abstract getMotoboyLocation(motoboyId: string): Observable<{ lat: number; lng: number; updatedAt: number } | null>;
}

