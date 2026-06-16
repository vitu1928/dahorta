import { Injectable, signal, inject, computed, effect } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { OrdersService } from './orders.service';
import { Order, OrderStatus, PaymentMethod, Address, CartItem } from './customer.models';
import { AuthService } from '../../auth/data-access/auth.service';
import { OwnerService } from '../../owner/data-access/owner.service';
import { Firestore, collection, doc, setDoc, updateDoc, onSnapshot, query, where, runTransaction } from '@angular/fire/firestore';
import { Database } from '@angular/fire/database';
import { ref, set as dbSet, onValue } from 'firebase/database';
import { NotificationService } from './notification.service';

function sanitizeObject(obj: any): any {
  if (obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    const clean: any = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] !== undefined) {
        clean[key] = sanitizeObject(obj[key]);
      }
    }
    return clean;
  }
  return obj;
}

@Injectable({ providedIn: 'root' })
export class FirebaseOrdersService extends OrdersService {
  private firestore = inject(Firestore);
  private db = inject(Database);
  private authService = inject(AuthService);
  private ownerService = inject(OwnerService);
  private notificationService = inject(NotificationService);

  private previousOrderStatusMap = new Map<string, OrderStatus>();

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
        let q;
        if (user.role === 'customer') {
          q = query(colRef, where('customerId', '==', user.id));
        } else {
          q = colRef;
        }

        this.unsubscribe = onSnapshot(q, (snapshot) => {
          const list: Order[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            const order = {
              id: doc.id,
              ...data,
              createdAt: data['createdAt']?.toDate() || new Date(),
              updatedAt: data['updatedAt']?.toDate() || new Date()
            } as Order;
            list.push(order);

            // Notify on status change
            if (this.previousOrderStatusMap.has(order.id)) {
              const prevStatus = this.previousOrderStatusMap.get(order.id);
              if (prevStatus !== order.status) {
                const cleanId = order.id;
                if (order.status === 'preparing') {
                  this.notificationService.sendNotification('Pedido em Preparo 🥗', `Seu pedido #${cleanId} está sendo preparado com muito carinho!`, 'orderStatus');
                } else if (order.status === 'ready') {
                  this.notificationService.sendNotification('Pedido Pronto! 😋', `Seu pedido #${cleanId} está pronto e aguardando o entregador.`, 'orderStatus');
                } else if (order.status === 'delivering') {
                  this.notificationService.sendNotification('Pedido a Caminho! 🛵', `Seu pedido #${cleanId} saiu para entrega!`, 'orderStatus');
                  this.notificationService.sendNotification('Entregador se Aproximando 📍', 'O entregador já está a caminho do seu endereço.', 'motoboyApproaching');
                } else if (order.status === 'delivered') {
                  this.notificationService.sendNotification('Pedido Entregue! 🎉', 'Seu pedido foi entregue com sucesso. Bom apetite!', 'orderStatus');
                }
              }
            }
            this.previousOrderStatusMap.set(order.id, order.status);
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

  override async placeOrder(
    customerId: string,
    paymentMethod: PaymentMethod,
    address: Address,
    cartItems: CartItem[],
    totalAmount: number,
    discount: number = 0,
    notes?: string,
    addressNotes?: string
  ): Promise<Order> {
    const currentUser = this.authService.currentUser();
    const customerName = currentUser?.name || 'Cliente Anônimo';
    const customerPhone = currentUser?.phone || '';

    try {
      const finalOrder = await runTransaction(this.firestore, async (transaction) => {
        // 0. CHECK IF RESTAURANT IS OPEN
        const restaurantSettingsRef = doc(this.firestore, 'settings/restaurant');
        const restaurantSnap = await transaction.get(restaurantSettingsRef);
        if (restaurantSnap.exists() && restaurantSnap.data()['open'] === false) {
          throw new Error('RESTAURANT_CLOSED');
        }

        // 1. GET THE ORDER COUNTER AND CALCULATE NEXT ID
        const counterRef = doc(this.firestore, 'settings/counters');
        const counterSnap = await transaction.get(counterRef);
        let nextCount = 6;
        if (counterSnap.exists()) {
          nextCount = (counterSnap.data()['orderCount'] || 0) + 1;
        }

        const paddedNum = String(nextCount).padStart(3, '0');
        const orderId = `ORD-${paddedNum}`;
        const orderDocRef = doc(this.firestore, `orders/${orderId}`);

        // 2. GATHER UNIQUE INSUMO IDS & DO ALL READS FIRST
        const sheetsList = this.ownerService.technicalSheets();
        const stockUpdates = new Map<string, { 
          docRef: any; 
          currentQty: number; 
          yieldRule: any; 
          unit: string; 
          name: string; 
          deductQty: number;
        }>();

        for (const item of cartItems) {
          const sheet = sheetsList.find(ts => ts.productId === item.productId);
          if (sheet) {
            for (const ingredient of sheet.ingredients) {
              const insumoId = ingredient.insumoId;
              if (!stockUpdates.has(insumoId)) {
                const docRef = doc(this.firestore, `insumos/${insumoId}`);
                const snap = await transaction.get(docRef);
                if (snap.exists()) {
                  const data = snap.data();
                  stockUpdates.set(insumoId, {
                    docRef,
                    currentQty: data['currentQuantity'] || 0,
                    yieldRule: data['yieldRule'] || null,
                    unit: data['unit'] || '',
                    name: data['name'] || '',
                    deductQty: 0
                  });
                }
              }
            }
          }
        }

        // 3. COMPUTE DEDUCTIONS
        for (const item of cartItems) {
          const sheet = sheetsList.find(ts => ts.productId === item.productId);
          if (sheet) {
            for (const ingredient of sheet.ingredients) {
              const insumoId = ingredient.insumoId;
              const updateInfo = stockUpdates.get(insumoId);
              if (updateInfo) {
                let qtyNeeded = ingredient.quantity * item.quantity;
                if (ingredient.unit === 'un' && updateInfo.yieldRule && updateInfo.unit !== 'un') {
                  qtyNeeded = (ingredient.quantity * updateInfo.yieldRule.yields) * item.quantity;
                }
                updateInfo.deductQty += qtyNeeded;
              }
            }
          }
        }

        // Sanitize address to avoid any undefined properties (like complement)
        const sanitizedAddress = {
          id: address?.id || '',
          label: address?.label || '',
          street: address?.street || '',
          number: address?.number || '',
          complement: address?.complement || '',
          neighborhood: address?.neighborhood || '',
          city: address?.city || '',
          zipCode: address?.zipCode || ''
        };

        const order: Order = {
          id: orderId,
          customerId,
          customerName: customerName || 'Cliente Anônimo',
          customerPhone: customerPhone || '',
          items: cartItems,
          totalAmount,
          deliveryFee: 15,
          discount: discount || 0,
          address: sanitizedAddress,
          paymentMethod,
          status: 'received',
          createdAt: new Date(),
          updatedAt: new Date(),
          notes: notes || '',
          addressNotes: addressNotes || '',
          deliveryCode: Math.floor(100000 + Math.random() * 900000).toString()
        };

        // 4. WRITE INCREMENTED COUNTER
        transaction.set(counterRef, { orderCount: nextCount }, { merge: true });

        // 5. WRITE THE ORDER
        transaction.set(orderDocRef, sanitizeObject({
          ...order,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        // 6. WRITE THE STOCK UPDATES AND MOVEMENTS (ALL WRITES LAST)
        for (const [insumoId, info] of stockUpdates.entries()) {
          if (info.deductQty > 0) {
            const newQty = Math.max(0, info.currentQty - info.deductQty);
            transaction.update(info.docRef, { currentQuantity: newQty });

            const newMovRef = doc(collection(this.firestore, 'stockMovements'));
            transaction.set(newMovRef, {
              stockItemId: insumoId,
              type: 'exit_auto',
              quantity: info.deductQty,
              userId: customerId,
              userName: customerName,
              timestamp: new Date(),
              notes: `Baixa automática do pedido ${orderId}`,
              orderId
            });
          }
        }

        return order;
      });

      this.activeOrderId.set(finalOrder.id);
      return finalOrder;
    } catch (err) {
      console.error('Erro na transação ao criar pedido:', err);
      throw err;
    }
  }

  override updateStatus(orderId: string, status: OrderStatus, motoboyId?: string, motoboyName?: string) {
    const docRef = doc(this.firestore, `orders/${orderId}`);
    const updates: any = {
      status,
      updatedAt: new Date()
    };
    if (motoboyId) {
      updates.motoboyId = motoboyId;
    }
    if (motoboyName) {
      updates.motoboyName = motoboyName;
    }

    updateDoc(docRef, updates).catch(err => {
      console.error('Erro ao atualizar status do pedido:', err);
    });
  }

  override getByCustomer(customerId: string): Order[] {
    return this.orders().filter(o => o.customerId === customerId);
  }

  override async confirmDelivery(orderId: string, code: string): Promise<boolean> {
    const order = this.orders().find(o => o.id === orderId);
    if (order && order.deliveryCode === code) {
      try {
        const docRef = doc(this.firestore, `orders/${orderId}`);
        await updateDoc(docRef, {
          status: 'delivered',
          updatedAt: new Date()
        });
        return true;
      } catch (err) {
        console.error('Erro ao confirmar entrega no Firestore:', err);
        throw err;
      }
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
    console.log(`[TELEMETRIA] Gravando localização no Realtime DB para o motoboy ${motoboyId}:`, { lat, lng });
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
  override getMotoboyLocation(motoboyId: string): Observable<{ lat: number; lng: number; updatedAt: number } | null> {
    console.log(`[TELEMETRIA] Iniciando escuta de localização no Realtime DB para o motoboy ${motoboyId}`);
    const pathRef = ref(this.db, `telemetry/motoboyLocations/${motoboyId}`);
    return new Observable<{ lat: number; lng: number; updatedAt: number } | null>((subscriber) => {
      const unsub = onValue(pathRef, (snapshot) => {
        const val = snapshot.val();
        console.log(`[TELEMETRIA] Atualização de localização recebida para o motoboy ${motoboyId}:`, val);
        if (val && val.lat && val.lng) {
          subscriber.next({ lat: val.lat, lng: val.lng, updatedAt: val.updatedAt || Date.now() });
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
