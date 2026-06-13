import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { ProductsService } from './products.service';
import { Product, Category } from './customer.models';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_PLATE_OF_DAY } from './mock-data';

@Injectable({ providedIn: 'root' })
export class MockProductsService extends ProductsService {
  override products = signal<Product[]>(MOCK_PRODUCTS);
  override categories = signal<Category[]>(MOCK_CATEGORIES);
  override readonly plateOfDay = signal<Record<number, string>>(MOCK_PLATE_OF_DAY);

  override availableProducts = computed(() => 
    this.products().filter(p => p.available)
  );

  override getByCategory(category: string) {
    return computed(() =>
      this.availableProducts().filter(p => p.category === category)
    );
  }

  override search(searchTerm: string) {
    return computed(() => {
      const term = searchTerm.toLowerCase();
      return this.availableProducts().filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    });
  }

  override getById(id: string): Product | undefined {
    return this.products().find(p => p.id === id);
  }

  override toggleAvailability(id: string) {
    const product = this.getById(id);
    if (product) {
      product.available = !product.available;
      this.products.set([...this.products()]);
    }
  }
}
