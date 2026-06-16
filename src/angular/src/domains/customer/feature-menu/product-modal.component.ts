import { Component, input, output, signal, inject, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../data-access/customer.models';
import { ProductsService } from '../data-access/products.service';
import { AllergenIconComponent } from '../ui/allergen-icon.component';


@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule, AllergenIconComponent],
  template: `
    <div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px)" (click)="close.emit()">
      <div 
        class="w-full bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden relative"
        [class]="product().isCombo ? 'max-w-4xl h-[90vh] md:h-[85vh] flex flex-col md:flex-row' : 'max-w-lg max-h-[90vh] flex flex-col'"
        (click)="$event.stopPropagation()"
      >
        <button class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-black/20 text-white backdrop-blur-md border-none cursor-pointer hover:bg-black/40 transition-colors" (click)="close.emit()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div class="relative flex-shrink-0" [class]="product().isCombo ? 'md:w-1/2 h-48 md:h-full' : 'h-64 sm:h-72'">
          <img [src]="product().image" [alt]="product().name" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          @if (product().featured) {
            <div class="absolute top-4 left-4 bg-accent text-accent-foreground text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider">
              Destaque DaHorta
            </div>
          }
        </div>

        <div class="flex-1 flex flex-col justify-between overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-start gap-4 mb-2">
              <h2 style="font-family: 'Poppins', sans-serif; font-size: 24px; font-weight: 700; color: var(--text-primary)">
                {{ product().name }}
              </h2>
              <span style="font-size: 22px; font-weight: 800; color: var(--primary)">
                R$ {{ product().price.toFixed(2) }}
              </span>
            </div>

            <div class="flex items-center gap-4 mb-3">
              <div class="flex items-center gap-1.5 text-muted-foreground text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground/50">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{{ product().prepTime }} min</span>
              </div>
              <div class="flex items-center gap-1.5 text-accent text-sm font-bold">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent, #F4A261);">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span>4.9</span>
              </div>
            </div>

            <!-- Allergens in Modal -->
            <div class="flex gap-1.5 mb-6">
              @for (allergen of allergens(); track allergen) {
                <app-allergen-icon [type]="allergen"></app-allergen-icon>
              }
            </div>

            <p style="color: var(--text-secondary); font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
              {{ product().description }}
            </p>

            @if (product().isCombo && product().comboSlots) {
              <div class="mt-4 flex flex-col overflow-hidden">
                <h3 class="text-xs font-bold text-text-primary mb-2">Escolha seus itens:</h3>
                
                <!-- Carousel of Slots -->
                <div class="flex gap-4 overflow-x-auto pb-4 snap-x items-center no-scrollbar">
                  @for (slot of product().comboSlots; track slot.id; let idx = $index) {
                    <div
                      class="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer snap-center"
                      (click)="activeSlotIndex.set(idx)"
                    >
                      <div 
                        class="w-16 h-16 rounded-2xl overflow-hidden border-2 transition-colors flex items-center justify-center p-1 bg-white"
                        [class.border-primary]="activeSlotIndex() === idx"
                        [class.border-border]="activeSlotIndex() !== idx"
                      >
                         <img 
                           [src]="getSelectedProductForSlot(slot.id)?.image || product().image" 
                           [alt]="slot.name" 
                           class="w-full h-full object-cover rounded-xl" 
                         />
                      </div>
                      <span 
                        class="text-[9px] font-bold uppercase text-center line-clamp-1 w-20"
                        [class.text-primary]="activeSlotIndex() === idx"
                        [class.text-muted-foreground]="activeSlotIndex() !== idx"
                      >
                        {{ slot.name }}
                      </span>
                    </div>
                  }
                </div>

                <!-- Options for Active Slot -->
                @if (activeSlot(); as slot) {
                  <div class="bg-background-soft p-4 rounded-2xl border border-border mt-2">
                    <p class="text-[11px] font-bold text-muted-foreground uppercase mb-3">
                      Opções para {{ slot.name }}:
                    </p>
                    <div class="grid grid-cols-3 gap-2">
                      @for (p of activeSlotProducts(); track p.id) {
                        <div
                          class="p-1.5 rounded-xl border-2 transition-all cursor-pointer bg-white flex flex-col items-center"
                          [class.border-primary]="selections()[slot.id] === p.id"
                          [class.border-transparent]="selections()[slot.id] !== p.id"
                          (click)="selectProduct(slot.id, p.id)"
                        >
                          <div class="aspect-square w-full rounded-lg overflow-hidden mb-1 bg-[#F7F9F7]">
                            <img [src]="p.image" [alt]="p.name" class="w-full h-full object-cover" />
                          </div>
                          <p class="text-[9px] font-bold text-center leading-tight line-clamp-2 h-6">{{ p.name }}</p>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="p-6 bg-white border-t border-border mt-auto flex items-center gap-4">
            <div class="flex items-center bg-muted rounded-xl p-1 border border-border">
              <button (click)="decrementQty()" class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background transition-colors border-none cursor-pointer text-muted-foreground">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <div class="w-12 text-center font-bold text-lg select-none flex items-center justify-center">
                {{ qty }}
              </div>
              <button (click)="incrementQty()" class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background transition-colors border-none cursor-pointer text-muted-foreground">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>

            <button 
              (click)="handleAdd()"
              [disabled]="adding()"
              class="flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 px-6 transition-all border-none cursor-pointer"
              style="background: var(--primary); color: white; font-weight: 700; font-size: 16px; box-shadow: 0 10px 20px -10px var(--primary)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {{ adding() ? 'Adicionando...' : 'Adicionar • R$ ' + (product().price * qty).toFixed(2) }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductModalComponent {
  product = input.required<Product>();
  close = output<void>();
  add = output<{ product: Product; quantity: number; subItems?: any[] }>();

  private productsService = inject(ProductsService);

  quantity = signal(1);
  qty = 1;
  adding = signal(false);

  // Combo states
  selections = signal<Record<string, string>>({});
  activeSlotIndex = signal(0);
  allProducts = this.productsService.products;

  allergens = computed(() => {
    return this.product().allergens ?? [];
  });

  activeSlot = computed(() => {
    const prod = this.product();
    const idx = this.activeSlotIndex();
    if (!prod.isCombo || !prod.comboSlots) return null;
    return prod.comboSlots[idx] || null;
  });

  activeSlotProducts = computed(() => {
    const slot = this.activeSlot();
    if (!slot) return [];
    
    const all = this.allProducts();
    return slot.products.map(pid => all.find(p => p.id === pid)).filter(Boolean) as Product[];
  });

  constructor() {
    effect(() => {
      const prod = this.product();
      if (prod.isCombo && prod.comboSlots) {
        const initial: Record<string, string> = {};
        prod.comboSlots.forEach(slot => {
          if (slot.products && slot.products.length > 0) {
            initial[slot.id] = slot.products[0];
          }
        });
        this.selections.set(initial);
        this.activeSlotIndex.set(0);
      }
    }, { allowSignalWrites: true });
  }

  incrementQty() {
    this.qty++;
    this.quantity.set(this.qty);
  }

  decrementQty() {
    if (this.qty > 1) {
      this.qty--;
      this.quantity.set(this.qty);
    }
  }

  getSelectedProductForSlot(slotId: string): Product | undefined {
    const selectedPid = this.selections()[slotId];
    return selectedPid ? this.productsService.getById(selectedPid) : undefined;
  }

  selectProduct(slotId: string, productId: string) {
    this.selections.update(prev => ({
      ...prev,
      [slotId]: productId
    }));
  }

  handleAdd() {
    if (this.product().isCombo) {
      const prod = this.product();
      const allSelected = prod.comboSlots?.every(slot => this.selections()[slot.id]);
      if (!allSelected) {
        alert("Por favor, selecione todos os itens do combo.");
        return;
      }
    }

    this.adding.set(true);

    const subItems = this.product().isCombo ? this.product().comboSlots?.map(slot => {
      const selectedId = this.selections()[slot.id];
      const p = this.productsService.getById(selectedId);
      return {
        slotName: slot.name,
        productId: selectedId,
        name: p?.name || "Item selecionado"
      };
    }) : undefined;

    setTimeout(() => {
      this.add.emit({
        product: this.product(),
        quantity: this.qty,
        subItems: subItems
      });
      this.adding.set(false);
    }, 400);
  }
}

