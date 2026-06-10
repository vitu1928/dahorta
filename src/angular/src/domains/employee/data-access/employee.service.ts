import { Injectable, WritableSignal } from '@angular/core';
import { StockItem } from './employee.models';

@Injectable({ providedIn: 'root' })
export abstract class EmployeeService {
  abstract readonly restaurantOpen: WritableSignal<boolean>;
  abstract readonly stockItems: WritableSignal<StockItem[]>;

  abstract toggleRestaurantOpen(): void;
  abstract updateStockQuantity(itemId: string, quantity: number): void;
}
