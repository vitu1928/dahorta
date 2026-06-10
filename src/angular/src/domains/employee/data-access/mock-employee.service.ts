import { Injectable, signal, WritableSignal } from '@angular/core';
import { EmployeeService } from './employee.service';
import { StockItem } from './employee.models';
import { MOCK_STOCK_ITEMS } from '../../customer/data-access/mock-data';

@Injectable({ providedIn: 'root' })
export class MockEmployeeService extends EmployeeService {
  override readonly restaurantOpen = signal<boolean>(true);
  
  override readonly stockItems = signal<StockItem[]>(
    MOCK_STOCK_ITEMS.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      currentQuantity: item.currentQuantity,
      maxCapacity: item.maxCapacity,
      minQuantity: item.minAlert
    }))
  );

  override toggleRestaurantOpen(): void {
    this.restaurantOpen.update(open => !open);
  }

  override updateStockQuantity(itemId: string, quantity: number): void {
    this.stockItems.update(items =>
      items.map(item =>
        item.id === itemId ? { ...item, currentQuantity: quantity } : item
      )
    );
  }
}
