import { Injectable, inject, signal, computed, effect, Signal } from '@angular/core';
import { ProductsService } from './products.service';
import { Product, Category } from './customer.models';
import { Firestore, collection, doc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { AuthService } from '../../auth/data-access/auth.service';

@Injectable({ providedIn: 'root' })
export class FirebaseProductsService extends ProductsService {
  private firestore = inject(Firestore);

  private rawProducts = signal<Product[]>([]);
  private technicalSheets = signal<any[]>([]);
  private insumos = signal<any[]>([]);

  override readonly products = signal<Product[]>([]);
  override readonly categories = signal<Category[]>([]);
  override readonly plateOfDay = signal<Record<number, string>>({});
  
  override readonly availableProducts = computed(() => 
    this.products().filter(p => p.available)
  );

  constructor() {
    super();
    const authService = inject(AuthService);

    // Listen to plate of day settings in real time
    const plateDocRef = doc(this.firestore, 'settings/plateOfDay');
    onSnapshot(plateDocRef, (snap) => {
      if (snap.exists()) {
        this.plateOfDay.set(snap.data()['config'] || {});
      }
    }, (err) => {
      console.error('Erro ao ouvir configuração de prato do dia do Firestore:', err);
    });

    // Listen to categories from Firestore
    const categoriesCol = collection(this.firestore, 'categories');
    onSnapshot(categoriesCol, (snapshot) => {
      const list: Category[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Category);
      });
      this.categories.set(list);
    }, (err) => {
      console.error('Erro ao carregar categorias do Firestore:', err);
    });

    // Listen to products from Firestore
    const productsCol = collection(this.firestore, 'products');
    onSnapshot(productsCol, (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Product);
      });
      this.rawProducts.set(list);
    }, (err) => {
      console.error('Erro ao carregar produtos do Firestore:', err);
    });

    let unsubscribeSheets: any = null;
    let unsubscribeInsumos: any = null;

    effect(() => {
      const user = authService.currentUser();
      
      if (unsubscribeSheets) {
        unsubscribeSheets();
        unsubscribeSheets = null;
      }
      if (unsubscribeInsumos) {
        unsubscribeInsumos();
        unsubscribeInsumos = null;
      }

      if (user) {
        // Listen to technicalSheets from Firestore only when logged in
        const sheetsCol = collection(this.firestore, 'technicalSheets');
        unsubscribeSheets = onSnapshot(sheetsCol, (snapshot) => {
          const list: any[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() });
          });
          this.technicalSheets.set(list);
        }, (err) => {
          console.error('Erro ao carregar fichas técnicas do Firestore:', err);
        });

        // Listen to insumos from Firestore only when logged in
        const insumosCol = collection(this.firestore, 'insumos');
        unsubscribeInsumos = onSnapshot(insumosCol, (snapshot) => {
          const list: any[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() });
          });
          this.insumos.set(list);
        }, (err) => {
          console.error('Erro ao carregar insumos do Firestore:', err);
        });
      } else {
        this.technicalSheets.set([]);
        this.insumos.set([]);
      }
    }, { allowSignalWrites: true });

    // Map allergens to products dynamically using technical sheets and insumos
    effect(() => {
      const raw = this.rawProducts();
      const sheets = this.technicalSheets();
      const ins = this.insumos();
      
      const mapped = raw.map(p => {
        const sheet = sheets.find(s => s.productId === p.id);
        const allergensSet = new Set<string>();
        if (sheet && sheet.ingredients) {
          sheet.ingredients.forEach((ing: any) => {
            const insumo = ins.find(i => i.id === ing.insumoId);
            if (insumo && insumo.allergens) {
              insumo.allergens.forEach((a: string) => allergensSet.add(a));
            }
          });
        }
        return {
          ...p,
          allergens: Array.from(allergensSet)
        };
      });
      
      this.products.set(mapped);
    }, { allowSignalWrites: true });
  }

  override getByCategory(category: string): Signal<Product[]> {
    return computed(() => 
      this.products().filter(p => p.category === category)
    );
  }

  override search(searchTerm: string): Signal<Product[]> {
    return computed(() => {
      const query = searchTerm.toLowerCase().trim();
      if (!query) return this.products();
      return this.products().filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
    });
  }

  override getById(id: string): Product | undefined {
    return this.products().find(p => p.id === id);
  }

  override toggleAvailability(id: string): void {
    const product = this.getById(id);
    if (!product) return;

    const docRef = doc(this.firestore, `products/${id}`);
    updateDoc(docRef, { available: !product.available }).catch(err => {
      console.error('Erro ao alternar disponibilidade do produto:', err);
    });
  }
}
