import { Injectable, signal, inject, computed } from '@angular/core';
import { OwnerService } from './owner.service';
import { Supplier, Insumo, PriceRecord, TechnicalSheet, StockMovement, TechnicalSheetIngredient } from './owner.models';
import { AuthService } from '../../auth/data-access/auth.service';
import { EmployeeService } from '../../employee/data-access/employee.service';
import { Firestore, collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, writeBatch, runTransaction } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class FirebaseOwnerService extends OwnerService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);

  override readonly suppliers = signal<Supplier[]>([]);
  override readonly insumos = signal<Insumo[]>([]);
  override readonly priceRecords = signal<PriceRecord[]>([]);
  override readonly technicalSheets = signal<TechnicalSheet[]>([]);
  override readonly stockMovements = signal<StockMovement[]>([]);
  override readonly plateOfDay = signal<Record<number, string>>({});
  override readonly pricePeriodDays = signal<number>(60);

  constructor() {
    super();

    // Listen to suppliers
    const suppliersCol = collection(this.firestore, 'suppliers');
    onSnapshot(suppliersCol, (snapshot) => {
      const list: Supplier[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Supplier);
      });
      this.suppliers.set(list);
    }, (err) => {
      console.error('Erro ao carregar fornecedores:', err);
    });

    // Listen to insumos
    const insumosCol = collection(this.firestore, 'insumos');
    onSnapshot(insumosCol, (snapshot) => {
      const list: Insumo[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Insumo);
      });
      this.insumos.set(list);
    }, (err) => {
      console.error('Erro ao carregar insumos:', err);
    });

    // Listen to price records
    const priceRecordsCol = collection(this.firestore, 'priceRecords');
    onSnapshot(priceRecordsCol, (snapshot) => {
      const list: PriceRecord[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          insumoId: data['insumoId'],
          supplierId: data['supplierId'],
          value: data['value'],
          date: data['date']?.toDate() || new Date(),
          observation: data['observation']
        } as PriceRecord);
      });
      this.priceRecords.set(list);
    }, (err) => {
      console.error('Erro ao carregar registros de preços:', err);
    });

    // Listen to technical sheets
    const sheetsCol = collection(this.firestore, 'technicalSheets');
    onSnapshot(sheetsCol, (snapshot) => {
      const list: TechnicalSheet[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as TechnicalSheet);
      });
      this.technicalSheets.set(list);
    }, (err) => {
      console.error('Erro ao carregar fichas técnicas:', err);
    });

    // Listen to stock movements
    const movementsCol = collection(this.firestore, 'stockMovements');
    onSnapshot(movementsCol, (snapshot) => {
      const list: StockMovement[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          stockItemId: data['stockItemId'],
          type: data['type'],
          quantity: data['quantity'],
          userId: data['userId'],
          userName: data['userName'],
          timestamp: data['timestamp']?.toDate() || new Date(),
          notes: data['notes'],
          orderId: data['orderId']
        } as StockMovement);
      });
      this.stockMovements.set(list);
    }, (err) => {
      console.error('Erro ao carregar movimentações de estoque:', err);
    });

    // Listen to plate of day settings
    const plateDocRef = doc(this.firestore, 'settings/plateOfDay');
    onSnapshot(plateDocRef, (snap) => {
      if (snap.exists()) {
        this.plateOfDay.set(snap.data()['config'] || {});
      } else {
        setDoc(plateDocRef, { config: {} }).catch(err => console.error(err));
        this.plateOfDay.set({});
      }
    }, (err) => {
      console.error('Erro ao ouvir configuração de prato do dia:', err);
    });
  }

  // Suppliers CRUD
  override addSupplier(supplier: Omit<Supplier, 'id'>): void {
    const colRef = collection(this.firestore, 'suppliers');
    const docRef = doc(colRef);
    setDoc(docRef, supplier).catch(err => {
      console.error('Erro ao adicionar fornecedor:', err);
    });
  }

  override updateSupplier(id: string, supplier: Partial<Supplier>): void {
    const docRef = doc(this.firestore, `suppliers/${id}`);
    updateDoc(docRef, supplier).catch(err => {
      console.error('Erro ao atualizar fornecedor:', err);
    });
  }

  override deleteSupplier(id: string): void {
    const docRef = doc(this.firestore, `suppliers/${id}`);
    deleteDoc(docRef).catch(err => {
      console.error('Erro ao excluir fornecedor:', err);
    });
  }

  // Insumos CRUD (Sincroniza 1:1 com Coleção Stock usando mesmo ID)
  override async addInsumo(insumo: Omit<Insumo, 'id'>): Promise<void> {
    try {
      const insumosCol = collection(this.firestore, 'insumos');
      const insumoDocRef = doc(insumosCol);
      const id = insumoDocRef.id;

      const stockDocRef = doc(this.firestore, `stock/${id}`);

      const batch = writeBatch(this.firestore);
      batch.set(insumoDocRef, insumo);
      batch.set(stockDocRef, {
        name: insumo.name,
        category: insumo.category,
        unit: insumo.unit,
        currentQuantity: 0,
        maxCapacity: 1000,
        minAlert: 100
      });

      await batch.commit();
    } catch (err) {
      console.error('Erro ao cadastrar insumo e inicializar estoque:', err);
    }
  }

  override async updateInsumo(id: string, insumo: Partial<Insumo>): Promise<void> {
    try {
      const insumoDocRef = doc(this.firestore, `insumos/${id}`);
      const stockDocRef = doc(this.firestore, `stock/${id}`);

      const batch = writeBatch(this.firestore);
      batch.update(insumoDocRef, insumo);

      const stockUpdate: any = {};
      if (insumo.name) stockUpdate.name = insumo.name;
      if (insumo.category) stockUpdate.category = insumo.category;
      if (insumo.unit) stockUpdate.unit = insumo.unit;

      if (Object.keys(stockUpdate).length > 0) {
        batch.update(stockDocRef, stockUpdate);
      }

      await batch.commit();
    } catch (err) {
      console.error('Erro ao atualizar insumo e estoque:', err);
    }
  }

  override async deleteInsumo(id: string): Promise<void> {
    try {
      const insumoDocRef = doc(this.firestore, `insumos/${id}`);
      const stockDocRef = doc(this.firestore, `stock/${id}`);

      const batch = writeBatch(this.firestore);
      batch.delete(insumoDocRef);
      batch.delete(stockDocRef);

      await batch.commit();
    } catch (err) {
      console.error('Erro ao excluir insumo e registro de estoque:', err);
    }
  }

  // Price Records
  override addPriceRecord(record: Omit<PriceRecord, 'id'>): void {
    const colRef = collection(this.firestore, 'priceRecords');
    const docRef = doc(colRef);
    setDoc(docRef, {
      ...record,
      date: record.date || new Date()
    }).catch(err => {
      console.error('Erro ao adicionar registro de preço:', err);
    });
  }

  override deletePriceRecord(id: string): void {
    const docRef = doc(this.firestore, `priceRecords/${id}`);
    deleteDoc(docRef).catch(err => {
      console.error('Erro ao excluir registro de preço:', err);
    });
  }

  // Technical Sheets
  override saveTechnicalSheet(sheet: Omit<TechnicalSheet, 'id'> & { id?: string }): void {
    const colRef = collection(this.firestore, 'technicalSheets');
    if (sheet.id) {
      const docRef = doc(this.firestore, `technicalSheets/${sheet.id}`);
      setDoc(docRef, sheet, { merge: true }).catch(err => console.error(err));
    } else {
      const existing = this.technicalSheets().find(s => s.productId === sheet.productId);
      if (existing) {
        const docRef = doc(this.firestore, `technicalSheets/${existing.id}`);
        setDoc(docRef, sheet, { merge: true }).catch(err => console.error(err));
      } else {
        const docRef = doc(colRef);
        setDoc(docRef, sheet).catch(err => console.error(err));
      }
    }
  }

  override deleteTechnicalSheet(productId: string): void {
    const sheet = this.technicalSheets().find(s => s.productId === productId);
    if (!sheet) return;

    const docRef = doc(this.firestore, `technicalSheets/${sheet.id}`);
    deleteDoc(docRef).catch(err => {
      console.error('Erro ao deletar ficha técnica:', err);
    });
  }

  override getTechnicalSheetByProduct(productId: string): TechnicalSheet | undefined {
    return this.technicalSheets().find(s => s.productId === productId);
  }

  // Stock Movements & Adjustments
  override async addStockMovement(movement: Omit<StockMovement, 'id' | 'timestamp'>): Promise<void> {
    try {
      const newMovRef = doc(collection(this.firestore, 'stockMovements'));
      const stockRef = doc(this.firestore, `stock/${movement.stockItemId}`);

      await runTransaction(this.firestore, async (transaction) => {
        const stockSnap = await transaction.get(stockRef);
        if (!stockSnap.exists()) {
          throw new Error('Item de estoque não existe no Firestore.');
        }

        const currentQty = stockSnap.data()['currentQuantity'] || 0;
        const delta = movement.type === 'entry' ? movement.quantity : -movement.quantity;
        const newQty = Math.max(0, currentQty + delta);

        transaction.set(newMovRef, {
          ...movement,
          timestamp: new Date()
        });
        transaction.update(stockRef, {
          currentQuantity: newQty
        });
      });
    } catch (err) {
      console.error('Erro na transação de movimento de estoque:', err);
    }
  }

  override async adjustStock(stockItemId: string, quantity: number, notes?: string): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) return;

    try {
      const newMovRef = doc(collection(this.firestore, 'stockMovements'));
      const stockRef = doc(this.firestore, `stock/${stockItemId}`);

      await runTransaction(this.firestore, async (transaction) => {
        const stockSnap = await transaction.get(stockRef);
        if (!stockSnap.exists()) return;

        const currentQty = stockSnap.data()['currentQuantity'] || 0;
        const newQty = Math.max(0, currentQty + quantity);

        transaction.set(newMovRef, {
          stockItemId,
          type: 'adjustment',
          quantity,
          userId: user.id,
          userName: user.name,
          timestamp: new Date(),
          notes
        });
        transaction.update(stockRef, {
          currentQuantity: newQty
        });
      });
    } catch (err) {
      console.error('Erro na transação de ajuste de estoque:', err);
    }
  }

  override checkStockAvailability(productId: string, quantity: number): { available: boolean; missing: string[] } {
    const sheet = this.technicalSheets().find(s => s.productId === productId);
    if (!sheet) return { available: true, missing: [] };

    const missing: string[] = [];
    const stockList = this.employeeService.stockItems();
    const insumosList = this.insumos();

    sheet.ingredients.forEach(ingredient => {
      const insumo = insumosList.find(i => i.id === ingredient.insumoId);
      if (!insumo) return;

      // Linkagem 1:1 por ID do Insumo
      const stockItem = stockList.find(s => s.id === insumo.id);
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
    const docRef = doc(this.firestore, 'settings/plateOfDay');
    const updatedConfig = { ...this.plateOfDay(), [day]: productId };
    updateDoc(docRef, { config: updatedConfig }).catch(err => {
      console.error('Erro ao atualizar prato do dia:', err);
    });
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
