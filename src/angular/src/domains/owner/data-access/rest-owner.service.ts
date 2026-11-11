import { HttpClient } from '@angular/common/http';
import { Injectable, signal, inject, computed, effect } from '@angular/core';
import { EMPTY, Observable, Subscription, catchError, forkJoin, of, switchMap, tap, timer } from 'rxjs';
import { OwnerService } from './owner.service';
import { Supplier, Insumo, PriceRecord, TechnicalSheet, StockMovement, TechnicalSheetIngredient, RestaurantInfo } from './owner.models';
import { AuthService } from '../../auth/data-access/auth.service';
import { EmployeeService } from '../../employee/data-access/employee.service';
import { ProductsService } from '../../customer/data-access/products.service';
import { Product } from '../../customer/data-access/customer.models';
import { environment } from '../../../environments/environment';

interface InsumoApi {
  id: number;
  nome: string;
  unidade: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  ativo: boolean;
  categoria: string | null;
  observacoes: string | null;
}

interface ProdutoApi {
  id: number;
  nome: string;
  descricao: string;
  imagem: string;
  categoria: string;
  preco: number;
  disponivel: boolean;
  tempoPreparo: number;
  alergicos: string[];
  ingredientes: { insumoId: number; nome: string; unidade: string; quantidade: number }[];
  comboSlots?: Product['comboSlots'];
}

interface MovimentacaoApi {
  id: number;
  insumoId: number;
  usuarioId: number;
  usuarioNome: string;
  pedidoId: number | null;
  tipo: string;
  quantidade: number;
  observacao: string | null;
  criadoEm: string;
}

interface RegistroPrecoApi {
  id: number;
  insumoId: number;
  fornecedorId: string;
  valor: number;
  data: string;
  observacao: string | null;
}

interface FornecedorApi {
  id: number;
  nome: string;
  cnpj: string | null;
  telefone: string;
  email: string;
  endereco: string;
}

@Injectable({ providedIn: 'root' })
export class RestOwnerService extends OwnerService {
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private http = inject(HttpClient);
  private productsService = inject(ProductsService);
  private readonly apiUrl = environment.apiUrl;
  private apiProducts: ProdutoApi[] = [];

  override readonly suppliers = signal<Supplier[]>([]);
  override readonly insumos = signal<Insumo[]>([]);
  override readonly priceRecords = signal<PriceRecord[]>([]);
  override readonly technicalSheets = signal<TechnicalSheet[]>([]);
  override readonly stockMovements = signal<StockMovement[]>([]);
  override readonly plateOfDay = signal<Record<number, string>>({});
  override readonly pricePeriodDays = signal<number>(60);
  override readonly restaurantInfo = signal<RestaurantInfo | null>(null);

  constructor() {
    super();

    let unsubscribeRestData: Subscription | null = null;
    let unsubscribeSettings: Subscription | null = null;

    // Dynamically manage listeners based on authenticated user role to prevent unauthorized client console warnings
    effect(() => {
      const user = this.authService.currentUser();
      
      // Cleanup previous subscriptions
      if (unsubscribeRestData) { unsubscribeRestData.unsubscribe(); unsubscribeRestData = null; }
      if (unsubscribeSettings) { unsubscribeSettings.unsubscribe(); unsubscribeSettings = null; }
      this.pricePeriodDays.set(60);
      if (user) {
        const isStaff = user.role === 'owner' || user.role === 'employee';
        
        if (isStaff) {
          unsubscribeRestData = timer(0, 10000).pipe(
            switchMap(() => this.loadRestData(user.role).pipe(
              catchError(err => {
                console.error('Erro ao carregar estoque e fichas técnicas pela API:', err);
                return EMPTY;
              })
            ))
          ).subscribe();
        } else {
          this.insumos.set([]);
          this.suppliers.set([]);
          this.priceRecords.set([]);
          this.technicalSheets.set([]);
          this.stockMovements.set([]);
          this.apiProducts = [];
        }

        unsubscribeSettings = timer(0, 10000).pipe(
          switchMap(() => forkJoin({
            plate: this.http.get<Record<number, string>>(`${this.apiUrl}/prato-do-dia`),
            restaurant: this.http.get<RestaurantInfo | null>(`${this.apiUrl}/restaurante/detalhes`)
          }).pipe(catchError(err => {
            console.error('Erro ao carregar configurações pela API:', err);
            return EMPTY;
          })))
        ).subscribe(({ plate, restaurant }) => {
          this.plateOfDay.set(this.fromApiPlateOfDay(plate));
          this.restaurantInfo.set(restaurant);
          if (restaurant) this.pricePeriodDays.set(restaurant.priceValidityDays);
        });

      } else {
        this.suppliers.set([]);
        this.insumos.set([]);
        this.priceRecords.set([]);
        this.technicalSheets.set([]);
        this.stockMovements.set([]);
        this.apiProducts = [];
        this.plateOfDay.set({});
        this.restaurantInfo.set(null);
      }
    }, { allowSignalWrites: true });
  }

  private loadRestData(role: string): Observable<unknown> {
    const products$ = role === 'owner'
      ? this.http.get<ProdutoApi[]>(`${this.apiUrl}/admin/produtos`)
      : of([] as ProdutoApi[]);

    return forkJoin({
      insumos: this.http.get<InsumoApi[]>(`${this.apiUrl}/estoque/insumos`),
      movements: this.http.get<MovimentacaoApi[]>(`${this.apiUrl}/estoque/movimentacoes`),
      products: products$,
      suppliers: role === 'owner'
        ? this.http.get<FornecedorApi[]>(`${this.apiUrl}/admin/fornecedores`)
        : of([] as FornecedorApi[]),
      priceRecords: role === 'owner'
        ? this.http.get<RegistroPrecoApi[]>(`${this.apiUrl}/admin/historico-precos`)
        : of([] as RegistroPrecoApi[])
    }).pipe(tap(({ insumos, movements, products, suppliers, priceRecords }) => {
      this.apiProducts = products;
      this.insumos.set(insumos.map(item => this.toInsumo(item)));
      this.stockMovements.set(movements.map(item => this.toStockMovement(item)));
      this.suppliers.set(suppliers.map(item => this.toSupplier(item)));
      this.priceRecords.set(priceRecords.map(item => this.toPriceRecord(item)));
      this.technicalSheets.set(products.flatMap(product => {
        if (!product.ingredientes?.length) return [];
        const frontendProduct = this.findFrontendProduct(product);
        return [{
          id: String(product.id),
          productId: frontendProduct?.id ?? String(product.id),
          internalName: frontendProduct?.internalName ?? product.nome,
          desiredMargin: frontendProduct?.desiredMargin ?? 40,
          ingredients: product.ingredientes.map(ingredient => ({
            id: `${product.id}-${ingredient.insumoId}`,
            insumoId: String(ingredient.insumoId),
            quantity: Number(ingredient.quantidade),
            unit: ingredient.unidade
          }))
        }];
      }));
    }));
  }

  private refreshRestData(): void {
    const role = this.authService.currentUser()?.role;
    if (role !== 'owner' && role !== 'employee') return;

    this.loadRestData(role).pipe(
      catchError(err => {
        console.error('Erro ao atualizar estoque e fichas técnicas pela API:', err);
        return EMPTY;
      })
    ).subscribe();
  }

  private toInsumo(item: InsumoApi): Insumo {
    return {
      id: String(item.id),
      name: item.nome,
      unit: item.unidade,
      category: item.categoria ?? 'Não classificado',
      observations: item.observacoes ?? undefined,
      currentQuantity: Number(item.quantidadeAtual),
      maxCapacity: Math.max(Number(item.quantidadeAtual), 1000),
      minAlert: Number(item.quantidadeMinima)
    };
  }

  private toStockMovement(item: MovimentacaoApi): StockMovement {
    const type = item.tipo === 'ENTRADA' ? 'entry'
      : item.tipo === 'BAIXA_PEDIDO' ? 'exit_auto'
      : item.tipo === 'AJUSTE' ? 'adjustment'
      : 'exit_manual';
    return {
      id: String(item.id),
      stockItemId: String(item.insumoId),
      type,
      quantity: Number(item.quantidade),
      userId: String(item.usuarioId),
      userName: item.usuarioNome,
      timestamp: new Date(item.criadoEm),
      notes: item.observacao ?? undefined,
      orderId: item.pedidoId == null ? undefined : String(item.pedidoId)
    };
  }

  private toPriceRecord(item: RegistroPrecoApi): PriceRecord {
    return {
      id: String(item.id),
      insumoId: String(item.insumoId),
      supplierId: item.fornecedorId,
      value: Number(item.valor),
      date: new Date(item.data),
      observation: item.observacao ?? undefined
    };
  }

  private toSupplier(item: FornecedorApi): Supplier {
    return {
      id: String(item.id),
      name: item.nome,
      cnpj: item.cnpj ?? undefined,
      phone: item.telefone,
      email: item.email,
      address: item.endereco
    };
  }

  private findFrontendProduct(product: ProdutoApi): Product | undefined {
    const normalizedName = this.normalizeName(product.nome);
    return this.productsService.products().find(item => this.normalizeName(item.name) === normalizedName);
  }

  private findApiProduct(productId: string): ProdutoApi | undefined {
    const numericId = Number(productId);
    const byId = Number.isSafeInteger(numericId)
      ? this.apiProducts.find(product => product.id === numericId)
      : undefined;
    if (byId) return byId;

    const existingSheet = this.technicalSheets().find(sheet => sheet.productId === productId);
    if (existingSheet) {
      const sheetId = Number(existingSheet.id);
      const productBySheetId = this.apiProducts.find(product => product.id === sheetId);
      if (productBySheetId) return productBySheetId;
    }

    const frontendProduct = this.productsService.getById(productId);
    if (!frontendProduct) return undefined;
    const normalizedName = this.normalizeName(frontendProduct.name);
    return this.apiProducts.find(product => this.normalizeName(product.nome) === normalizedName);
  }

  private normalizeName(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');
  }

  private fromApiPlateOfDay(config: Record<number, string>): Record<number, string> {
    const normalized: Record<number, string> = {};
    for (const [apiDay, productId] of Object.entries(config)) {
      normalized[Number(apiDay) % 7] = productId;
    }
    return normalized;
  }

  private toApiInsumoRequest(item: Insumo): {
    nome: string;
    unidade: string;
    quantidadeInicial: number;
    quantidadeMinima: number;
    categoria: string;
    observacoes: string | null;
  } {
    return {
      nome: item.name,
      unidade: item.unit,
      quantidadeInicial: Number(item.currentQuantity ?? 0),
      quantidadeMinima: Number(item.minAlert ?? 0),
      categoria: item.category,
      observacoes: item.observations?.trim() || null
    };
  }

  private saveApiTechnicalSheet(
    product: ProdutoApi,
    ingredients: TechnicalSheetIngredient[]
  ): void {
    const apiIngredients = ingredients.map(ingredient => ({
      insumoId: Number(ingredient.insumoId),
      quantidade: Number(ingredient.quantity)
    }));
    if (apiIngredients.some(ingredient =>
      !Number.isSafeInteger(ingredient.insumoId) || ingredient.insumoId <= 0 ||
      !Number.isFinite(ingredient.quantidade) || ingredient.quantidade <= 0
    )) {
      console.error(`Não foi possível salvar a ficha técnica do produto "${product.nome}": ingredientes inválidos.`);
      return;
    }

    this.http.put<ProdutoApi>(`${this.apiUrl}/admin/produtos/${product.id}`, {
      nome: product.nome,
      descricao: product.descricao,
      imagem: product.imagem,
      categoria: product.categoria,
      preco: product.preco,
      disponivel: product.disponivel,
      tempoPreparo: product.tempoPreparo,
      alergicos: product.alergicos ?? [],
      ingredientes: apiIngredients,
      comboSlots: product.comboSlots ?? []
    }).subscribe({
      next: updated => {
        this.apiProducts = this.apiProducts.map(item => item.id === updated.id ? updated : item);
        this.refreshRestData();
      },
      error: err => console.error(`Erro ao salvar ficha técnica do produto "${product.nome}" pela API:`, err)
    });
  }

  // Suppliers CRUD
  override addSupplier(supplier: Omit<Supplier, 'id'>): void {
    this.http.post<FornecedorApi>(`${this.apiUrl}/admin/fornecedores`, this.toApiSupplier(supplier)).subscribe({
      next: item => this.suppliers.update(items => [...items, this.toSupplier(item)]),
      error: err => console.error('Erro ao adicionar fornecedor pela API:', err)
    });
  }

  override updateSupplier(id: string, supplier: Partial<Supplier>): void {
    const numericId = Number(id);
    const existing = this.suppliers().find(item => item.id === id);
    if (!Number.isSafeInteger(numericId) || numericId <= 0 || !existing) {
      console.error('Não foi possível atualizar o fornecedor: identificador inválido ou fornecedor ausente.');
      return;
    }

    this.http.put<FornecedorApi>(`${this.apiUrl}/admin/fornecedores/${numericId}`,
      this.toApiSupplier({ ...existing, ...supplier })).subscribe({
      next: updated => this.suppliers.update(items => items.map(item =>
        item.id === id ? this.toSupplier(updated) : item
      )),
      error: err => console.error('Erro ao atualizar fornecedor pela API:', err)
    });
  }

  override deleteSupplier(id: string): void {
    const numericId = Number(id);
    if (!Number.isSafeInteger(numericId) || numericId <= 0) {
      console.error('Não foi possível excluir o fornecedor: identificador inválido.');
      return;
    }

    this.http.delete<void>(`${this.apiUrl}/admin/fornecedores/${numericId}`).subscribe({
      next: () => this.suppliers.update(items => items.filter(item => item.id !== id)),
      error: err => console.error('Erro ao excluir fornecedor pela API:', err)
    });
  }

  private toApiSupplier(supplier: Omit<Supplier, 'id'> | Supplier): {
    nome: string;
    cnpj: string | null;
    telefone: string;
    email: string;
    endereco: string;
  } {
    return {
      nome: supplier.name.trim(),
      cnpj: supplier.cnpj?.trim() || null,
      telefone: supplier.phone.trim(),
      email: supplier.email.trim().toLowerCase(),
      endereco: supplier.address.trim()
    };
  }

  // Insumos CRUD
  override async addInsumo(insumo: Omit<Insumo, 'id'>): Promise<void> {
    const request = this.toApiInsumoRequest({ ...insumo, id: '' });
    this.http.post<InsumoApi>(`${this.apiUrl}/estoque/insumos`, request).subscribe({
      next: item => this.insumos.update(items => [...items, this.toInsumo(item)]),
      error: err => console.error('Erro ao cadastrar insumo pela API:', err)
    });
  }

  override async updateInsumo(id: string, insumo: Partial<Insumo>): Promise<void> {
    const numericId = Number(id);
    const current = this.insumos().find(item => item.id === id);
    if (!Number.isSafeInteger(numericId) || numericId <= 0 || !current) {
      console.error('Não foi possível atualizar o insumo: identificador inválido ou item ausente.');
      return;
    }

    const request = this.toApiInsumoRequest({ ...current, ...insumo });
    this.http.put<InsumoApi>(`${this.apiUrl}/estoque/insumos/${numericId}`, request).subscribe({
      next: item => this.insumos.update(items => items.map(existing =>
        existing.id === id ? this.toInsumo(item) : existing
      )),
      error: err => console.error('Erro ao atualizar insumo pela API:', err)
    });
  }

  override async deleteInsumo(id: string): Promise<void> {
    const numericId = Number(id);
    if (!Number.isSafeInteger(numericId) || numericId <= 0) {
      console.error('Não foi possível excluir o insumo: identificador inválido.');
      return;
    }

    this.http.delete<void>(`${this.apiUrl}/estoque/insumos/${numericId}`).subscribe({
      next: () => this.insumos.update(items => items.filter(item => item.id !== id)),
      error: err => console.error('Erro ao excluir insumo pela API:', err)
    });
  }

  // Price Records
  override addPriceRecord(record: Omit<PriceRecord, 'id'>): void {
    let body: ReturnType<RestOwnerService['toApiPriceRecord']>;
    try {
      body = this.toApiPriceRecord(record);
    } catch (err) {
      console.error('Não foi possível adicionar registro de preço: dados inválidos.', err);
      return;
    }

    this.http.post<RegistroPrecoApi>(`${this.apiUrl}/admin/historico-precos`, body).subscribe({
      next: item => this.priceRecords.update(records => [...records, this.toPriceRecord(item)]),
      error: err => console.error('Erro ao adicionar registro de preço pela API:', err)
    });
  }

  override deletePriceRecord(id: string): void {
    const numericId = Number(id);
    if (!Number.isSafeInteger(numericId) || numericId <= 0) {
      console.error('Não foi possível excluir o registro de preço: identificador inválido.');
      return;
    }

    this.http.delete<void>(`${this.apiUrl}/admin/historico-precos/${numericId}`).subscribe({
      next: () => this.priceRecords.update(records => records.filter(record => record.id !== id)),
      error: err => console.error('Erro ao excluir registro de preço pela API:', err)
    });
  }

  override updatePriceRecord(id: string, record: Partial<PriceRecord>): void {
    const numericId = Number(id);
    const existing = this.priceRecords().find(item => item.id === id);
    if (!Number.isSafeInteger(numericId) || numericId <= 0 || !existing) {
      console.error('Não foi possível atualizar o registro de preço: identificador inválido ou registro ausente.');
      return;
    }

    let body: ReturnType<RestOwnerService['toApiPriceRecord']>;
    try {
      body = this.toApiPriceRecord({ ...existing, ...record });
    } catch (err) {
      console.error('Não foi possível atualizar o registro de preço: dados inválidos.', err);
      return;
    }

    this.http.put<RegistroPrecoApi>(`${this.apiUrl}/admin/historico-precos/${numericId}`, body).subscribe({
      next: updated => this.priceRecords.update(records => records.map(item =>
        item.id === id ? this.toPriceRecord(updated) : item
      )),
      error: err => console.error('Erro ao atualizar registro de preço pela API:', err)
    });
  }

  private toApiPriceRecord(record: Omit<PriceRecord, 'id'> | PriceRecord): {
    insumoId: number;
    fornecedorId: number;
    valor: number;
    data: string;
    observacao: string | null;
  } {
    const insumoId = Number(record.insumoId);
    const fornecedorId = Number(record.supplierId);
    if (!Number.isSafeInteger(insumoId) || insumoId <= 0 ||
        !Number.isSafeInteger(fornecedorId) || fornecedorId <= 0 ||
        !Number.isFinite(record.value) || record.value <= 0 ||
        Number.isNaN(record.date.getTime())) {
      throw new Error('Dados inválidos para registro de preço.');
    }

    return {
      insumoId,
      fornecedorId,
      valor: record.value,
      data: record.date.toISOString(),
      observacao: record.observation?.trim() || null
    };
  }

  // Technical Sheets
  override saveTechnicalSheet(sheet: Omit<TechnicalSheet, 'id'> & { id?: string }): void {
    const product = this.findApiProduct(sheet.productId);
    if (!product) {
      console.error(`Não foi possível salvar a ficha técnica: produto "${sheet.productId}" não encontrado na API.`);
      return;
    }

    this.saveApiTechnicalSheet(product, sheet.ingredients);
  }

  override deleteTechnicalSheet(productId: string): void {
    const product = this.findApiProduct(productId);
    if (!product) {
      console.error(`Não foi possível remover a ficha técnica: produto "${productId}" não encontrado na API.`);
      return;
    }

    this.saveApiTechnicalSheet(product, []);
  }

  override getTechnicalSheetByProduct(productId: string): TechnicalSheet | undefined {
    return this.technicalSheets().find(s => s.productId === productId);
  }

  // Stock Movements & Adjustments
  override async addStockMovement(movement: Omit<StockMovement, 'id' | 'timestamp'>): Promise<void> {
    const insumoId = Number(movement.stockItemId);
    const tipo = movement.type === 'entry' ? 'ENTRADA'
      : movement.type === 'adjustment' ? 'AJUSTE'
      : movement.type === 'exit_auto' ? 'BAIXA_PEDIDO'
      : 'SAIDA_MANUAL';
    if (!Number.isSafeInteger(insumoId) || insumoId <= 0 || movement.quantity <= 0 || tipo === 'BAIXA_PEDIDO') {
      console.error('Não foi possível registrar a movimentação: insumo ou quantidade inválidos.');
      return;
    }

    this.http.post<InsumoApi>(`${this.apiUrl}/estoque/movimentacoes`, {
      insumoId,
      tipo,
      quantidade: movement.quantity,
      observacao: movement.notes ?? null
    }).subscribe({
      next: () => this.refreshRestData(),
      error: err => console.error('Erro ao registrar movimentação pela API:', err)
    });
  }

  override async adjustStock(stockItemId: string, quantity: number, notes?: string): Promise<void> {
    const insumoId = Number(stockItemId);
    const current = this.insumos().find(item => item.id === stockItemId);
    if (!Number.isSafeInteger(insumoId) || insumoId <= 0 || !current || current.currentQuantity === undefined) {
      console.error('Não foi possível ajustar o estoque: identificador inválido ou item ausente.');
      return;
    }

    const quantidade = Math.max(0, current.currentQuantity + quantity);
    this.http.post<InsumoApi>(`${this.apiUrl}/estoque/movimentacoes`, {
      insumoId,
      tipo: 'AJUSTE',
      quantidade,
      observacao: notes ?? null
    }).subscribe({
      next: () => this.refreshRestData(),
      error: err => console.error('Erro ao ajustar estoque pela API:', err)
    });
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
    const produtoId = Number(productId);
    if (!Number.isSafeInteger(day) || day < 0 || day > 6 ||
        !Number.isSafeInteger(produtoId) || produtoId <= 0) {
      console.error('Não foi possível salvar o prato do dia: dia ou produto inválido.');
      return;
    }
    const apiDay = day === 0 ? 7 : day;
    this.http.put<void>(`${this.apiUrl}/admin/prato-do-dia/${apiDay}`, { produtoId }).subscribe({
      next: () => this.plateOfDay.update(config => ({ ...config, [day]: productId })),
      error: err => console.error('Erro ao atualizar prato do dia pela API:', err)
    });
  }

  override updateRestaurantInfo(info: RestaurantInfo): void {
    this.http.patch<RestaurantInfo>(`${this.apiUrl}/admin/restaurante/detalhes`, info).subscribe({
      next: saved => {
        this.restaurantInfo.set(saved);
        this.pricePeriodDays.set(saved.priceValidityDays);
      },
      error: err => console.error('Erro ao atualizar informações pela API:', err)
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
