import { Injectable, inject, signal, effect } from '@angular/core';
import { EmployeeService } from './employee.service';
import { StockItem } from './employee.models';
import { Firestore, doc, collection, onSnapshot, updateDoc, setDoc } from '@angular/fire/firestore';
import { AuthService } from '../../auth/data-access/auth.service';

@Injectable({ providedIn: 'root' })
export class FirebaseEmployeeService extends EmployeeService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  override readonly restaurantOpen = signal<boolean>(true);
  override readonly stockItems = signal<StockItem[]>([]);

  constructor() {
    super();

    // Listen to restaurant open/close status in settings
    const statusDocRef = doc(this.firestore, 'settings/restaurant');
    onSnapshot(statusDocRef, (snap) => {
      if (snap.exists()) {
        this.restaurantOpen.set(snap.data()['open'] ?? true);
      } else {
        // Initialize settings if it doesn't exist
        setDoc(statusDocRef, { open: true }).catch(err => 
          console.error('Erro ao inicializar status do restaurante:', err)
        );
        this.restaurantOpen.set(true);
      }
    }, (err) => {
      console.error('Erro ao ouvir status do restaurante:', err);
    });

    let unsubscribeStock: any = null;

    // Listen to stock inventory in real time (unified in insumos) only for logged-in staff
    effect(() => {
      const user = this.authService.currentUser();
      
      if (unsubscribeStock) {
        unsubscribeStock();
        unsubscribeStock = null;
      }

      if (user && (user.role === 'owner' || user.role === 'employee')) {
        const stockCol = collection(this.firestore, 'insumos');
        unsubscribeStock = onSnapshot(stockCol, (snapshot) => {
          const list: StockItem[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              name: data['name'] || '',
              category: data['category'] || '',
              unit: data['unit'] || '',
              currentQuantity: data['currentQuantity'] ?? 0,
              maxCapacity: data['maxCapacity'] ?? 1000,
              minAlert: data['minAlert'] ?? 100,
              minQuantity: data['minAlert'] ?? 100,
              yieldRule: data['yieldRule']
            } as StockItem);
          });
          this.stockItems.set(list);
        }, (err) => {
          console.error('Erro ao carregar itens do estoque do Firestore:', err);
        });
      } else {
        this.stockItems.set([]);
      }
    }, { allowSignalWrites: true });
  }

  override toggleRestaurantOpen(): void {
    const docRef = doc(this.firestore, 'settings/restaurant');
    updateDoc(docRef, { open: !this.restaurantOpen() }).catch(err => {
      console.error('Erro ao alternar status de abertura da loja:', err);
    });
  }

  override updateStockQuantity(itemId: string, quantity: number): void {
    const docRef = doc(this.firestore, `insumos/${itemId}`);
    updateDoc(docRef, { currentQuantity: quantity }).catch(err => {
      console.error('Erro ao atualizar quantidade do item de estoque:', err);
    });
  }
}
