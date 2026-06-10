import { Injectable, effect } from '@angular/core';
import { signal, computed } from '@angular/core';
import { CartItem, Product } from './customer.models';

@Injectable({ providedIn: 'root' })
export class CartStateService {
  items = signal<CartItem[]>(this.loadCartFromStorage());
  orderNotes = signal<string>('');

  constructor() {
    // Save items to localStorage whenever the signal changes
    effect(() => {
      try {
        localStorage.setItem('dahorta_cart', JSON.stringify(this.items()));
      } catch (e) {
        console.error('Error saving cart to storage:', e);
      }
    });
  }

  private loadCartFromStorage(): CartItem[] {
    try {
      const stored = localStorage.getItem('dahorta_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading cart from storage:', e);
      return [];
    }
  }

  count = computed(() =>
    this.items().reduce((acc, item) => acc + item.quantity, 0)
  );

  total = computed(() =>
    this.items().reduce((acc, item) => acc + item.price * item.quantity, 0)
  );

  addItem(product: Product, quantity: number = 1, subItems?: any[]) {
    const existing = this.items().find(item => item.productId === product.id);

    if (existing) {
      existing.quantity += quantity;
      this.items.set([...this.items()]);
    } else {
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        quantity,
        price: product.price,
        image: product.image,
        subItems: subItems,
      };
      this.items.set([...this.items(), newItem]);
    }
  }

  removeItem(productId: string) {
    this.items.set(this.items().filter(item => item.productId !== productId));
  }

  updateQuantity(productId: string, quantity: number) {
    const item = this.items().find(item => item.productId === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.items.set([...this.items()]);
    }
  }

  clear() {
    this.items.set([]);
  }
}
