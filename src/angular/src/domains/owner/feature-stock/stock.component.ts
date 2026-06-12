import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../employee/data-access/employee.service';
import { OwnerService } from '../data-access/owner.service';
import { StockItem, StockMovement, InsumoUnit } from '../data-access/owner.models';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 space-y-6 text-foreground font-sans bg-background">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="overline-label mb-2 text-[#E9C46A]" style="font-weight: 700; letter-spacing: 0.1em">Gestão de Inventário</p>
          <h1 class="display-heading text-foreground text-3xl font-extrabold" style="font-family: 'Space Grotesk', sans-serif">Estoque e Insumos</h1>
          <p class="text-muted-foreground text-xs mt-1">
            {{ filteredItems().length }} itens no estoque · {{ lowStockItemsCount() }} em nível crítico.
          </p>
        </div>
        <button
          (click)="openAddModal()"
          class="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border-none cursor-pointer text-white text-xs"
          style="background: var(--primary); shadow: var(--shadow-default);"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          Adicionar Item
        </button>
      </div>

      <!-- Critical Alerts Box -->
      <div 
        *ngIf="lowStockItems().length > 0"
        class="p-4 rounded-xl flex items-start gap-3 border"
        style="background: rgba(230,57,70,0.05); border-color: var(--destructive);"
      >
        <svg class="text-destructive mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <div>
          <p class="font-extrabold text-sm text-foreground leading-tight">Itens em Estado Crítico</p>
          <p class="text-xs text-muted-foreground mt-1">
            {{ lowStockItems().length }} {{ lowStockItems().length === 1 ? 'item precisa' : 'itens precisam' }} de reposição: 
            <span class="text-foreground font-semibold">{{ lowStockNames() }}</span>
          </p>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="relative flex-1">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
          <input 
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Buscar item no estoque..."
            class="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border text-foreground outline-none focus:border-primary text-xs"
          />
        </div>
        <div class="flex items-center gap-2 px-4 py-3 rounded-xl bg-background border border-border">
          <svg class="text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          <select 
            [ngModel]="categoryFilter()"
            (ngModelChange)="categoryFilter.set($event)"
            class="bg-transparent border-none outline-none text-xs text-foreground cursor-pointer font-bold"
          >
            <option value="all">Todas categorias</option>
            <option *ngFor="let cat of categories()" [value]="cat">{{ cat | titlecase }}</option>
          </select>
        </div>
      </div>

      <!-- Stock Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          *ngFor="let item of filteredItems()"
          class="p-5 rounded-2xl bg-card border shadow-sm flex flex-col justify-between"
          [style.borderColor]="isLowStock(item) ? 'var(--destructive)' : 'var(--border)'"
        >
          <div>
            <div class="flex items-start justify-between gap-2 mb-3">
              <div>
                <span class="text-[9px] font-black uppercase tracking-wider text-primary">{{ item.category }}</span>
                <h3 class="text-sm font-extrabold text-foreground mt-0.5 leading-tight">{{ item.name }}</h3>
              </div>
              <span 
                class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border"
                [style.background]="isLowStock(item) ? 'rgba(230,57,70,0.1)' : 'rgba(58,165,93,0.1)'"
                [style.color]="isLowStock(item) ? 'var(--destructive)' : 'var(--success)'"
                [style.borderColor]="isLowStock(item) ? 'var(--destructive)' : 'var(--success)'"
              >
                {{ isLowStock(item) ? 'Crítico' : 'Estável' }}
              </span>
            </div>

            <!-- Quantitative -->
            <div class="mb-4">
              <div class="flex items-baseline gap-1.5 mb-1.5">
                <span class="text-2xl font-black text-foreground">{{ item.currentQuantity }}</span>
                <span class="text-xs text-muted-foreground">/ {{ item.maxCapacity }} {{ formatUnit(item.unit) }}</span>
              </div>
              <div class="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-500" 
                  [style.width.%]="getPercent(item)"
                  [style.background]="isLowStock(item) ? 'var(--destructive)' : 'var(--success)'"
                ></div>
              </div>
            </div>

            <!-- Yield rule -->
            <div *ngIf="item.yieldRule" class="p-2.5 rounded-lg bg-muted text-[10px] text-muted-foreground leading-relaxed mb-4">
              <strong>Yield:</strong> {{ item.yieldRule.baseUnit }} ≈ {{ item.yieldRule.yields }} {{ formatUnit(item.yieldRule.yieldsUnit) }}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-2 border-t border-border">
            <button 
              (click)="openMovementModal(item)"
              class="flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border border-primary bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              Lançar
            </button>
            <button 
              (click)="openEditModal(item)"
              class="p-2 rounded-lg bg-background border border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
            <button 
              (click)="openHistoryModal(item)"
              class="p-2 rounded-lg bg-background border border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </button>
            <button 
              (click)="deleteItem(item)"
              class="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 border-none text-destructive cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- ── ADD / EDIT ITEM MODAL ── -->
      <div *ngIf="showItemModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs" (click)="closeItemModal()"></div>
        <div class="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 z-40 text-xs">
          <h2 class="text-base font-bold text-foreground mb-5">{{ isEditing() ? 'Editar Item de Estoque' : 'Adicionar Item de Estoque' }}</h2>
          <div class="space-y-4">
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-muted-foreground block">Nome do Item *</label>
              <input [(ngModel)]="itemForm.name" class="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-foreground outline-none text-sm" />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-muted-foreground block">Categoria</label>
                <select [(ngModel)]="itemForm.category" class="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-foreground outline-none font-bold text-sm">
                  <option value="hortifruti">Hortifruti</option>
                  <option value="proteína">Proteína</option>
                  <option value="grãos">Grãos</option>
                  <option value="molhos">Molhos</option>
                  <option value="temperos">Temperos</option>
                  <option value="secos">Secos</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-muted-foreground block">Unidade de Medida</label>
                <select [(ngModel)]="itemForm.unit" class="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-foreground outline-none font-bold text-sm">
                  <option *ngFor="let u of units" [value]="u">{{ u }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div class="space-y-1">
                <label class="text-[9px] font-bold text-muted-foreground block">Qtd Atual</label>
                <input type="number" [(ngModel)]="itemForm.currentQuantity" class="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-center text-foreground text-sm" />
              </div>
              <div class="space-y-1">
                <label class="text-[9px] font-bold text-muted-foreground block">Capac. Máxima</label>
                <input type="number" [(ngModel)]="itemForm.maxCapacity" class="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-center text-foreground text-sm" />
              </div>
              <div class="space-y-1">
                <label class="text-[9px] font-bold text-muted-foreground block">Limite Alerta</label>
                <input type="number" [(ngModel)]="itemForm.minAlert" class="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-center text-foreground text-sm" />
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button (click)="closeItemModal()" class="flex-1 py-3 px-4 rounded-xl font-bold bg-muted border border-border text-muted-foreground hover:bg-muted/80 cursor-pointer">Cancelar</button>
              <button (click)="saveItem()" class="flex-1 py-3 px-4 rounded-xl font-bold bg-primary text-white border-none cursor-pointer">Salvar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── MOVEMENT MODAL ── -->
      <div *ngIf="showMovementModal() && selectedItem()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs" (click)="closeMovementModal()"></div>
        <div class="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 z-40 text-xs">
          <h2 class="text-base font-bold text-foreground mb-2">Movimentar Estoque</h2>
          <p class="text-xs text-muted-foreground mb-5 font-semibold">{{ selectedItem()?.name }}</p>
          
          <div class="space-y-4">
            <div class="flex gap-2 p-1 rounded-xl bg-muted border border-border">
              <button 
                (click)="movementType.set('entry')"
                class="flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 font-bold text-xs"
                [class.bg-primary]="movementType() === 'entry'"
                [class.bg-transparent]="movementType() !== 'entry'"
                [class.text-white]="movementType() === 'entry'"
                [class.text-muted-foreground]="movementType() !== 'entry'"
                style="border: none; cursor: pointer;"
              >
                Entrada
              </button>
              <button 
                (click)="movementType.set('exit_manual')"
                class="flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 font-bold text-xs"
                [class.bg-primary]="movementType() === 'exit_manual'"
                [class.bg-transparent]="movementType() !== 'exit_manual'"
                [class.text-white]="movementType() === 'exit_manual'"
                [class.text-muted-foreground]="movementType() !== 'exit_manual'"
                style="border: none; cursor: pointer;"
              >
                Saída
              </button>
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-bold text-muted-foreground block">Quantidade ({{ formatUnit(selectedItem()!.unit) }})</label>
              <input type="number" [(ngModel)]="movementQuantity" placeholder="0.00" class="w-full px-4 py-3 rounded-xl bg-white border border-border text-foreground text-sm" />
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-bold text-muted-foreground block">Notas / Motivo</label>
              <textarea [(ngModel)]="movementNotes" rows="3" placeholder="Reposição de estoque semanal, descarte por vencimento..." class="w-full px-4 py-3 rounded-xl bg-white border border-border text-foreground text-sm resize-none"></textarea>
            </div>

            <div class="flex gap-3 pt-2">
              <button (click)="closeMovementModal()" class="flex-1 py-3 px-4 rounded-xl font-bold bg-muted border border-border text-muted-foreground hover:bg-muted/80 cursor-pointer">Cancelar</button>
              <button (click)="saveMovement()" class="flex-1 py-3 px-4 rounded-xl font-bold bg-primary text-white border-none cursor-pointer">Confirmar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── HISTORY MODAL ── -->
      <div *ngIf="showHistoryModal() && selectedItem()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs" (click)="closeHistoryModal()"></div>
        <div class="relative w-full max-w-2xl bg-card border border-border rounded-2xl p-6 z-40 text-xs flex flex-col max-h-[80vh]">
          <h2 class="text-base font-bold text-foreground mb-2">Histórico de Movimentações</h2>
          <p class="text-xs text-muted-foreground mb-5 font-semibold">{{ selectedItem()?.name }}</p>
          
          <div class="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            <div 
              *ngFor="let move of filteredHistory()"
              class="p-4 rounded-xl bg-muted/30 border border-border flex flex-col justify-between"
            >
              <div class="flex justify-between items-start gap-4 mb-2">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" [style.background]="move.type === 'entry' ? 'var(--success)' : 'var(--destructive)'"></span>
                  <span class="font-bold text-foreground">{{ getMovementTypeLabel(move.type) }}</span>
                </div>
                <span class="text-sm font-extrabold" [style.color]="move.type === 'entry' ? 'var(--success)' : 'var(--destructive)'">
                  {{ move.type === 'entry' ? '+' : '-' }}{{ move.quantity }} {{ formatUnit(selectedItem()!.unit) }}
                </span>
              </div>
              <div class="text-[10px] text-muted-foreground space-y-1">
                <p>Por: <span class="text-foreground font-semibold">{{ move.userName }}</span></p>
                <p>Data: {{ move.timestamp | date:'dd/MM/yyyy HH:mm' }}</p>
                <p *ngIf="move.notes" class="italic mt-1">"{{ move.notes }}"</p>
                <p *ngIf="move.orderId" class="font-bold text-primary mt-1">Pedido Ref: {{ move.orderId }}</p>
              </div>
            </div>
            <div *ngIf="filteredHistory().length === 0" class="py-12 text-center text-muted-foreground italic">
              Nenhuma movimentação registrada para este insumo.
            </div>
          </div>
          <button (click)="closeHistoryModal()" class="w-full mt-4 py-3 rounded-xl bg-muted border border-border text-muted-foreground hover:bg-muted/80 font-bold cursor-pointer">Fechar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overline-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
  `]
})
export class StockComponent {
  private employeeService = inject(EmployeeService);
  private ownerService = inject(OwnerService);

  readonly searchQuery = signal<string>('');
  readonly categoryFilter = signal<string>('all');

  // Modals toggles
  readonly showItemModal = signal(false);
  readonly isEditing = signal(false);
  readonly selectedItem = signal<StockItem | null>(null);

  readonly showMovementModal = signal(false);
  readonly movementType = signal<'entry' | 'exit_manual'>('entry');
  movementQuantity = 0;
  movementNotes = '';

  readonly showHistoryModal = signal(false);

  // Expose stock signals
  readonly stockItems = this.employeeService.stockItems;
  readonly stockMovements = this.ownerService.stockMovements;

  readonly units: InsumoUnit[] = ["g", "kg", "ml", "l", "un", "fatia", "folha", "colher", "porção"];

  // Form local state
  itemForm = {
    name: '',
    category: 'hortifruti',
    unit: 'g' as InsumoUnit,
    currentQuantity: 0,
    maxCapacity: 1000,
    minAlert: 100
  };

  // Computeds
  readonly categories = computed(() => 
    Array.from(new Set(this.stockItems().map(item => item.category)))
  );

  readonly lowStockItems = computed(() => 
    this.stockItems().filter(item => item.currentQuantity <= item.minAlert)
  );

  readonly lowStockItemsCount = computed(() => this.lowStockItems().length);

  readonly lowStockNames = computed(() => 
    this.lowStockItems().map(item => item.name).join(', ')
  );

  readonly filteredItems = computed(() => {
    const search = this.searchQuery().toLowerCase().trim();
    const cat = this.categoryFilter();
    return this.stockItems().filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search);
      const matchesCategory = cat === 'all' || item.category === cat;
      return matchesSearch && matchesCategory;
    });
  });

  readonly filteredHistory = computed(() => {
    const item = this.selectedItem();
    if (!item) return [];
    return this.stockMovements()
      .filter(m => m.stockItemId === item.id)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  });

  // Helpers
  isLowStock(item: StockItem): boolean {
    return item.currentQuantity <= item.minAlert;
  }

  getPercent(item: StockItem): number {
    if (item.maxCapacity <= 0) return 0;
    return Math.min((item.currentQuantity / item.maxCapacity) * 100, 100);
  }

  formatUnit(unit: string): string {
    const map: Record<string, string> = {
      g: "g",
      kg: "kg",
      ml: "ml",
      l: "L",
      un: "un",
      fatia: "fats",
      folha: "fls",
      colher: "colh",
      porção: "porc"
    };
    return map[unit] || unit;
  }

  getMovementTypeLabel(type: string): string {
    switch (type) {
      case 'entry': return 'Entrada';
      case 'exit_auto': return 'Baixa Automática (Pedido)';
      case 'exit_manual': return 'Saída Manual';
      case 'adjustment': return 'Ajuste Manual';
      default: return type;
    }
  }

  // CRUD Actions
  openAddModal() {
    this.isEditing.set(false);
    this.selectedItem.set(null);
    this.itemForm = {
      name: '',
      category: 'hortifruti',
      unit: 'g',
      currentQuantity: 0,
      maxCapacity: 1000,
      minAlert: 100
    };
    this.showItemModal.set(true);
  }

  openEditModal(item: StockItem) {
    this.isEditing.set(true);
    this.selectedItem.set(item);
    this.itemForm = {
      name: item.name,
      category: item.category,
      unit: item.unit as InsumoUnit,
      currentQuantity: item.currentQuantity,
      maxCapacity: item.maxCapacity,
      minAlert: item.minAlert
    };
    this.showItemModal.set(true);
  }

  closeItemModal() {
    this.showItemModal.set(false);
    this.selectedItem.set(null);
  }

  saveItem() {
    if (!this.itemForm.name) return;

    const data = {
      id: '', // filled below
      name: this.itemForm.name,
      category: this.itemForm.category,
      unit: this.itemForm.unit,
      currentQuantity: this.itemForm.currentQuantity,
      maxCapacity: this.itemForm.maxCapacity,
      minAlert: this.itemForm.minAlert,
      minQuantity: this.itemForm.minAlert
    };

    if (this.isEditing() && this.selectedItem()) {
      const id = this.selectedItem()!.id;
      this.stockItems.update(list => list.map(item => item.id === id ? { ...data, id } as any : item));
    } else {
      const id = `stk${Date.now()}`;
      this.stockItems.update(list => [...list, { ...data, id } as any]);
    }

    this.closeItemModal();
  }

  deleteItem(item: StockItem) {
    if (confirm(`Deseja realmente excluir "${item.name}" do estoque?`)) {
      this.stockItems.update(list => list.filter(i => i.id !== item.id));
    }
  }

  // Movement Actions
  openMovementModal(item: StockItem) {
    this.selectedItem.set(item);
    this.movementType.set('entry');
    this.movementQuantity = 0;
    this.movementNotes = '';
    this.showMovementModal.set(true);
  }

  closeMovementModal() {
    this.showMovementModal.set(false);
    this.selectedItem.set(null);
  }

  saveMovement() {
    const item = this.selectedItem();
    if (!item || this.movementQuantity <= 0) return;

    this.ownerService.addStockMovement({
      stockItemId: item.id,
      type: this.movementType(),
      quantity: this.movementQuantity,
      userId: 'owner', // Mock user
      userName: 'Rafael Mendes', // Mock user
      notes: this.movementNotes || undefined
    });

    this.closeMovementModal();
  }

  // History Actions
  openHistoryModal(item: StockItem) {
    this.selectedItem.set(item);
    this.showHistoryModal.set(true);
  }

  closeHistoryModal() {
    this.showHistoryModal.set(false);
    this.selectedItem.set(null);
  }
}
