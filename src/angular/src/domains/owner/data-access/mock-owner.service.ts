import { Injectable, signal, inject, WritableSignal } from '@angular/core';
import { OwnerService } from './owner.service';
import { Supplier, Insumo, PriceRecord, TechnicalSheet, StockMovement, TechnicalSheetIngredient } from './owner.models';
import { AuthService } from '../../auth/data-access/auth.service';
import { EmployeeService } from '../../employee/data-access/employee.service';
import { 
  MOCK_SUPPLIERS, MOCK_INSUMOS, MOCK_PRICE_RECORDS, 
  MOCK_TECHNICAL_SHEETS, MOCK_STOCK_MOVEMENTS, MOCK_PLATE_OF_DAY 
} from '../../customer/data-access/mock-data';

@Injectable({ providedIn: 'root' })
export class MockOwnerService extends OwnerService {
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);

  override readonly suppliers = signal<Supplier[]>(MOCK_SUPPLIERS);
  override readonly insumos = signal<Insumo[]>(MOCK_INSUMOS);
  override readonly priceRecords = signal<PriceRecord[]>(
    MOCK_PRICE_RECORDS.map(r => ({
      ...r,
      date: new Date(r.date)
    }))
  );
  override readonly technicalSheets = signal<TechnicalSheet[]>(MOCK_TECHNICAL_SHEETS);
  override readonly stockMovements = signal<StockMovement[]>(
    MOCK_STOCK_MOVEMENTS.map(m => ({
      ...m,
      timestamp: new Date(m.timestamp)
    }))
  );
  override readonly plateOfDay = signal<Record<number, string>>(MOCK_PLATE_OF_DAY);
  override readonly pricePeriodDays = signal<number>(60);

  // Suppliers CRUD
  override addSupplier(supplier: Omit<Supplier, 'id'>): void {
    const newSupplier = { ...supplier, id: `sup${Date.now()}` };
    this.suppliers.update(s => [...s, newSupplier]);
  }

  override updateSupplier(id: string, supplier: Partial<Supplier>): void {
    this.suppliers.update(list => list.map(s => s.id === id ? { ...s, ...supplier } : s));
  }

  override deleteSupplier(id: string): void {
    this.suppliers.update(list => list.filter(s => s.id !== id));
  }

  // Insumos CRUD
  override addInsumo(insumo: Omit<Insumo, 'id'>): void {
    const newInsumo = { ...insumo, id: `ins${Date.now()}` };
    this.insumos.update(i => [...i, newInsumo]);
  }

  override updateInsumo(id: string, insumo: Partial<Insumo>): void {
    this.insumos.update(list => list.map(i => i.id === id ? { ...i, ...insumo } : i));
  }

  override deleteInsumo(id: string): void {
    this.insumos.update(list => list.filter(i => i.id !== id));
  }

  // Price Records
  override addPriceRecord(record: Omit<PriceRecord, 'id'>): void {
    const newRecord = { ...record, id: `pr${Date.now()}` };
    this.priceRecords.update(r => [...r, newRecord]);
  }

  override deletePriceRecord(id: string): void {
    this.priceRecords.update(list => list.filter(r => r.id !== id));
  }

  override updatePriceRecord(id: string, record: Partial<PriceRecord>): void {
    this.priceRecords.update(list => list.map(r => r.id === id ? { ...r, ...record } as PriceRecord : r));
  }

  // Technical Sheets
  override saveTechnicalSheet(sheet: Omit<TechnicalSheet, 'id'> & { id?: string }): void {
    if (sheet.id) {
      this.technicalSheets.update(list => list.map(s => s.id === sheet.id ? { ...sheet, id: sheet.id } as TechnicalSheet : s));
    } else {
      const existing = this.technicalSheets().find(s => s.productId === sheet.productId);
      if (existing) {
        this.technicalSheets.update(list => list.map(s => s.productId === sheet.productId ? { ...sheet, id: s.id } as TechnicalSheet : s));
      } else {
        const newSheet = { ...sheet, id: `ts${Date.now()}` } as TechnicalSheet;
        this.technicalSheets.update(list => [...list, newSheet]);
      }
    }
  }

  override deleteTechnicalSheet(productId: string): void {
    this.technicalSheets.update(list => list.filter(s => s.productId !== productId));
  }

  override getTechnicalSheetByProduct(productId: string): TechnicalSheet | undefined {
    return this.technicalSheets().find(s => s.productId === productId);
  }

  // Stock Movements
  override addStockMovement(movement: Omit<StockMovement, 'id' | 'timestamp'>): void {
    const newMovement = { ...movement, id: `mov${Date.now()}`, timestamp: new Date() } as StockMovement;
    this.stockMovements.update(list => [...list, newMovement]);

    // Update the actual stock items currentQuantity inside EmployeeService
    this.employeeService.stockItems.update(list => 
      list.map(item => {
        if (item.id === movement.stockItemId) {
          const delta = movement.type === 'entry' ? movement.quantity : -movement.quantity;
          return { ...item, currentQuantity: item.currentQuantity + delta };
        }
        return item;
      })
    );
  }

  override adjustStock(stockItemId: string, quantity: number, notes?: string): void {
    const user = this.authService.currentUser();
    if (!user) return;

    const newMovement = {
      id: `mov${Date.now()}`,
      stockItemId,
      type: 'adjustment',
      quantity,
      userId: user.id,
      userName: user.name,
      timestamp: new Date(),
      notes
    } as StockMovement;

    this.stockMovements.update(list => [...list, newMovement]);
    this.employeeService.stockItems.update(list => 
      list.map(item => 
        item.id === stockItemId 
          ? { ...item, currentQuantity: item.currentQuantity + quantity } 
          : item
      )
    );
  }

  override checkStockAvailability(productId: string, quantity: number): { available: boolean; missing: string[] } {
    const sheet = this.technicalSheets().find(s => s.productId === productId);
    if (!sheet) return { available: true, missing: [] };

    const missing: string[] = [];
    const stockItems = this.employeeService.stockItems();
    const insumosList = this.insumos();

    sheet.ingredients.forEach(ingredient => {
      const insumo = insumosList.find(i => i.id === ingredient.insumoId);
      if (!insumo) return;

      const stockItem = stockItems.find(s => 
        s.id === (ingredient as any).stockItemId || 
        s.name.toLowerCase().includes(insumo.name.toLowerCase()) || 
        insumo.name.toLowerCase().includes(s.name.toLowerCase())
      );
      if (!stockItem) return;

      let quantityNeeded = ingredient.quantity * quantity;

      if (ingredient.unit === 'un' && stockItem.yieldRule && stockItem.unit !== 'un') {
        quantityNeeded = (ingredient.quantity * stockItem.yieldRule.yields) * quantity;
      }

      if (stockItem.currentQuantity < quantityNeeded) {
        missing.push(stockItem.name);
      }
    });

    return { available: missing.length === 0, missing };
  }

  // Settings & Helpers
  override updatePlateOfDay(day: number, productId: string): void {
    this.plateOfDay.update(prev => ({ ...prev, [day]: productId }));
  }

  override getBestPrice(insumoId: string): { value: number; supplierId: string } | null {
    const cutoff = new Date(Date.now() - this.pricePeriodDays() * 24 * 60 * 60 * 1000);
    const validRecords = this.priceRecords().filter(
      r => r.insumoId === insumoId && r.date >= cutoff
    );

    if (validRecords.length === 0) {
      const allRecords = this.priceRecords().filter(r => r.insumoId === insumoId);
      if (allRecords.length === 0) return null;
      const best = allRecords.reduce((min, r) => r.value < min.value ? r : min);
      return { value: best.value, supplierId: best.supplierId };
    }

    const best = validRecords.reduce((min, r) => r.value < min.value ? r : min);
    return { value: best.value, supplierId: best.supplierId };
  }

  override calculateIngredientCost(ingredient: TechnicalSheetIngredient): { unitPrice: number; total: number; supplierId: string | null } {
    let unitPrice = 0;
    let supplierId: string | null = null;

    if (ingredient.supplierId) {
      const cutoff = new Date(Date.now() - this.pricePeriodDays() * 24 * 60 * 60 * 1000);
      const records = this.priceRecords().filter(
        r => r.insumoId === ingredient.insumoId && r.supplierId === ingredient.supplierId && r.date >= cutoff
      );

      if (records.length > 0) {
        const latest = records.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
        unitPrice = latest.value;
        supplierId = ingredient.supplierId;
      } else {
        const best = this.getBestPrice(ingredient.insumoId);
        if (best) {
          unitPrice = best.value;
          supplierId = best.supplierId;
        }
      }
    } else {
      const best = this.getBestPrice(ingredient.insumoId);
      if (best) {
        unitPrice = best.value;
        supplierId = best.supplierId;
      }
    }

    return { unitPrice, total: unitPrice * ingredient.quantity, supplierId };
  }

  override calculateSheetCost(sheet: TechnicalSheet): number {
    return sheet.ingredients.reduce((sum, ing) => {
      const { total } = this.calculateIngredientCost(ing);
      return sum + total;
    }, 0);
  }
}
