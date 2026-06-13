import { Injectable, WritableSignal, Signal } from '@angular/core';
import { Product, Category } from './customer.models';

@Injectable({ providedIn: 'root' })
export abstract class ProductsService {
  abstract readonly products: WritableSignal<Product[]>;
  abstract readonly categories: WritableSignal<Category[]>;
  abstract readonly availableProducts: Signal<Product[]>;
  abstract readonly plateOfDay: Signal<Record<number, string>>;

  abstract getByCategory(category: string): Signal<Product[]>;
  abstract search(searchTerm: string): Signal<Product[]>;
  abstract getById(id: string): Product | undefined;
  abstract toggleAvailability(id: string): void;
}

