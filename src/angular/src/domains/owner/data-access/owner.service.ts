import { Injectable, WritableSignal } from '@angular/core';
import { Supplier, Insumo, PriceRecord, TechnicalSheet, StockMovement, TechnicalSheetIngredient, RestaurantInfo } from './owner.models';

@Injectable({ providedIn: 'root' })
export abstract class OwnerService {
  abstract readonly suppliers: WritableSignal<Supplier[]>;
  abstract readonly insumos: WritableSignal<Insumo[]>;
  abstract readonly priceRecords: WritableSignal<PriceRecord[]>;
  abstract readonly technicalSheets: WritableSignal<TechnicalSheet[]>;
  abstract readonly stockMovements: WritableSignal<StockMovement[]>;
  abstract readonly plateOfDay: WritableSignal<Record<number, string>>;
  abstract readonly pricePeriodDays: WritableSignal<number>;
  abstract readonly restaurantInfo: WritableSignal<RestaurantInfo | null>;

  // Suppliers CRUD
  abstract addSupplier(supplier: Omit<Supplier, 'id'>): void;
  abstract updateSupplier(id: string, supplier: Partial<Supplier>): void;
  abstract deleteSupplier(id: string): void;

  // Insumos CRUD
  abstract addInsumo(insumo: Omit<Insumo, 'id'>): void;
  abstract updateInsumo(id: string, insumo: Partial<Insumo>): void;
  abstract deleteInsumo(id: string): void;

  // Price Records
  abstract addPriceRecord(record: Omit<PriceRecord, 'id'>): void;
  abstract updatePriceRecord(id: string, record: Partial<PriceRecord>): void;
  abstract deletePriceRecord(id: string): void;

  // Technical Sheets
  abstract saveTechnicalSheet(sheet: Omit<TechnicalSheet, 'id'> & { id?: string }): void;
  abstract deleteTechnicalSheet(productId: string): void;
  abstract getTechnicalSheetByProduct(productId: string): TechnicalSheet | undefined;

  // Stock Movements & Adjustments
  abstract addStockMovement(movement: Omit<StockMovement, 'id' | 'timestamp'>): void;
  abstract adjustStock(stockItemId: string, quantity: number, notes?: string): void;
  abstract checkStockAvailability(productId: string, quantity: number): { available: boolean; missing: string[] };

  // Settings & Helpers
  abstract updatePlateOfDay(day: number, productId: string): void;
  abstract updateRestaurantInfo(info: RestaurantInfo): void;
  abstract getBestPrice(insumoId: string): { value: number; supplierId: string } | null;
  abstract calculateIngredientCost(ingredient: TechnicalSheetIngredient): { unitPrice: number; total: number; supplierId: string | null };
  abstract calculateSheetCost(sheet: TechnicalSheet): number;
}
