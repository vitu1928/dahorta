import { Injectable, signal, inject, computed, effect } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { OrdersService } from './orders.service';
import { Order, OrderStatus, PaymentMethod, Address, CartItem } from './customer.models';
import { AuthService } from '../../auth/data-access/auth.service';
import { OwnerService } from '../../owner/data-access/owner.service';
import { Firestore, collection, doc, setDoc, updateDoc, onSnapshot, runTransaction } from '@angular/fire/firestore';
import { Database } from '@angular/fire/database';
import { ref, set as dbSet, onValue } from 'firebase/database';

@Injectable({ providedIn: 'root' })
export class FirebaseOrdersService extends OrdersService {
  private firestore = inject(Firestore);
  private db = inject(Database);
  private authService = inject(AuthService);
  private ownerService = inject(OwnerService);

  override readonly orders = signal<Order[]>([]);
  override readonly activeOrderId = signal<string | null>(null);

  override readonly activeOrder = computed(() => {
    const id = this.activeOrderId();
    return id ? this.orders().find(o => o.id === id) ?? null : null;
  });

  private unsubscribe: (() => void) | null = null;

  constructor() {
    super();

    // Listen to user changes and query corresponding orders
    effect(() => {
      const user = this.authService.currentUser();
      
      // Cleanup previous listener
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }

      if (user) {
        const colRef = collection(this.firestore, 'orders');
        this.unsubscribe = onSnapshot(colRef, (snapshot) => {
          const list: Order[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              ...data,
              createdAt: data['createdAt']?.toDate() || new Date(),
              updatedAt: data['updatedAt']?.toDate() || new Date()
            } as Order);
          });
          
          let filtered = list;
          if (user.role === 'customer') {
            filtered = list.filter(o => o.customerId === user.id);
          } else if (user.role === 'motoboy') {
            filtered = list.filter(o => o.motoboyId === user.id || o.status === 'ready');
          }

          // Sort chronologically descending
          filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          this.orders.set(filtered);
        }, (err) => {
          console.error('Erro ao escutar pedidos do Firestore:', err);
        });
      } else {
        this.orders.set([]);
      }
    });
  }

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

    const ordersCol = collection(this.firestore, 'orders');
    const orderDocRef = doc(ordersCol);
    const orderId = orderDocRef.id;

    const order: Order = {
      id: orderId,
      customerId,
      customerName,
      customerPhone,
      items: cartItems,
      totalAmount,
      deliveryFee: 15,
      discount,
      address,
      paymentMethod,
      status: 'received',
      createdAt: new Date(),
      updatedAt: new Date(),
      notes,
      addressNotes,
      deliveryCode: Math.floor(100000 + Math.random() * 900000).toString()
    };

    // Transaction to write order and deduct stock in Firestore
    runTransaction(this.firestore, async (transaction) => {
      // 1. Write order document
      transaction.set(orderDocRef, {
        ...order,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // 2. Read recipe configurations and deduct stock
      const sheetsList = this.ownerService.technicalSheets();
      
      for (const item of cartItems) {
        const sheet = sheetsList.find(ts => ts.productId === item.productId);
        if (sheet) {
          for (const ingredient of sheet.ingredients) {
            // Deduct stock item corresponding to ingredient (1:1 link by ID)
            const stockDocRef = doc(this.firestore, `stock/${ingredient.insumoId}`);
            const stockSnap = await transaction.get(stockDocRef);
            
            if (stockSnap.exists()) {
              const currentQty = stockSnap.data()['currentQuantity'] || 0;
              let quantityNeeded = ingredient.quantity * item.quantity;
              
              const yieldRule = stockSnap.data()['yieldRule'];
              if (ingredient.unit === 'un' && yieldRule && stockSnap.data()['unit'] !== 'un') {
                quantityNeeded = (ingredient.quantity * yieldRule.yields) * item.quantity;
              }
              
              const newQty = Math.max(0, currentQty - quantityNeeded);
              transaction.update(stockDocRef, { currentQuantity: newQty });

              // Record a stock movement log
              const newMovRef = doc(collection(this.firestore, 'stockMovements'));
              transaction.set(newMovRef, {
                stockItemId: ingredient.insumoId,
                type: 'exit_auto',
                quantity: quantityNeeded,
                userId: customerId,
                userName: customerName,
                timestamp: new Date(),
                notes: `Baixa automática do pedido ${orderId}`,
                orderId
              });
            }
          }
        }
      }
    }).catch(err => {
      console.error('Erro na transação ao criar pedido:', err);
    });

    this.activeOrderId.set(orderId);
    return order;
  }

  override updateStatus(orderId: string, status: OrderStatus, motoboyId?: string) {
    const docRef = doc(this.firestore, `orders/${orderId}`);
    const updates: any = {
      status,
      updatedAt: new Date()
    };
    if (motoboyId) {
      updates.motoboyId = motoboyId;
    }

    updateDoc(docRef, updates).catch(err => {
      console.error('Erro ao atualizar status do pedido:', err);
    });
  }

  override getByCustomer(customerId: string): Order[] {
    return this.orders().filter(o => o.customerId === customerId);
  }

  override confirmDelivery(orderId: string, code: string): boolean {
    const order = this.orders().find(o => o.id === orderId);
    if (order && order.deliveryCode === code) {
      this.updateStatus(orderId, 'delivered');
      return true;
    }
    return false;
  }

  override subscribeToOrder(orderId: string): Observable<Order | null> {
    const docRef = doc(this.firestore, `orders/${orderId}`);
    return new Observable<Order | null>((subscriber) => {
      const unsub = onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          subscriber.next({
            id: snap.id,
            ...data,
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date()
          } as Order);
        } else {
          subscriber.next(null);
        }
      }, (err) => {
        subscriber.error(err);
      });
      return () => unsub();
    });
  }

  // Realtime Database location telemetry (Write)
  override updateMotoboyLocation(motoboyId: string, lat: number, lng: number): void {
    const pathRef = ref(this.db, `telemetry/motoboyLocations/${motoboyId}`);
    dbSet(pathRef, {
      lat,
      lng,
      updatedAt: Date.now()
    }).catch(err => {
      console.error('Erro ao enviar telemetria do motoboy no Realtime DB:', err);
    });
  }

  // Realtime Database location telemetry (Read)
  override getMotoboyLocation(motoboyId: string): Observable<{ lat: number; lng: number } | null> {
    const pathRef = ref(this.db, `telemetry/motoboyLocations/${motoboyId}`);
    return new Observable<{ lat: number; lng: number } | null>((subscriber) => {
      const unsub = onValue(pathRef, (snapshot) => {
        const val = snapshot.val();
        if (val && val.lat && val.lng) {
          subscriber.next({ lat: val.lat, lng: val.lng });
        } else {
          subscriber.next(null);
        }
      }, (err) => {
        subscriber.error(err);
      });
      return () => unsub();
    });
  }
}
