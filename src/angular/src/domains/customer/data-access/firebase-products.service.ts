import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { ProductsService } from './products.service';
import { Product, Category } from './customer.models';
import { Firestore, collection, doc, updateDoc, onSnapshot, setDoc, deleteDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class FirebaseProductsService extends ProductsService {
  private firestore = inject(Firestore);

  override readonly products = signal<Product[]>([]);
  override readonly categories = signal<Category[]>([]);
  override readonly plateOfDay = signal<Record<number, string>>({});
  
  override readonly availableProducts = computed(() => 
    this.products().filter(p => p.available)
  );

  constructor() {
    super();

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
      snapshot.forEach((productDoc) => {
        list.push({ id: productDoc.id, ...productDoc.data() } as Product);
      });
      this.products.set(list.map(product => ({
        ...product,
        allergens: product.allergens ?? []
      })));
    }, (err) => {
      console.error('Erro ao carregar produtos do Firestore:', err);
    });
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

  override async addProduct(product: Omit<Product, 'id'>): Promise<string> {
    const colRef = collection(this.firestore, 'products');
    const docRef = doc(colRef);
    await setDoc(docRef, product);
    return docRef.id;
  }

  override async updateProduct(id: string, product: Partial<Product>): Promise<void> {
    const docRef = doc(this.firestore, `products/${id}`);
    await updateDoc(docRef, product);
  }

  override async deleteProduct(id: string): Promise<void> {
    const docRef = doc(this.firestore, `products/${id}`);
    await deleteDoc(docRef);
  }
}
