import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../customer/data-access/products.service';
import { OwnerService } from '../data-access/owner.service';
import { Product, TechnicalSheet, TechnicalSheetIngredient, InsumoUnit, ComboSlot } from '../data-access/owner.models';

const DAYS_OF_WEEK = [
  { id: 0, name: "Domingo" },
  { id: 1, name: "Segunda-feira" },
  { id: 2, name: "Terça-feira" },
  { id: 3, name: "Quarta-feira" },
  { id: 4, name: "Quinta-feira" },
  { id: 5, name: "Sexta-feira" },
  { id: 6, name: "Sábado" },
];

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 space-y-6 text-foreground font-sans bg-background">
      <!-- ── Main View ── -->
      <ng-container *ngIf="!showForm() && !showComboModal()">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p class="overline-label mb-2 text-[#E9C46A]" style="font-weight: 700; letter-spacing: 0.1em">Gestão de Cardápio</p>
            <h1 class="display-heading text-foreground text-3xl font-extrabold" style="font-family: 'Space Grotesk', sans-serif">Cardápio</h1>
            <p class="text-muted-foreground text-xs mt-1">Configure seus produtos, preços, pratos do dia e combos.</p>
          </div>
          <div *ngIf="activeTab() === 'menu'">
            <button 
              (click)="openCreateForm()"
              class="flex items-center gap-2 px-6 py-3 rounded-xl transition-all"
              style="background: var(--primary); color: white; border: none; cursor: pointer; font-size: 14px; font-weight: 600; box-shadow: var(--shadow-default);"
              onmouseenter="this.style.transform = 'translateY(-1px)'"
              onmouseleave="this.style.transform = 'translateY(0)'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
              Novo Produto
            </button>
          </div>
          <div *ngIf="activeTab() === 'combos'">
            <button 
              (click)="openCreateCombo()"
              class="flex items-center gap-2 px-6 py-3 rounded-xl transition-all"
              style="background: var(--primary); color: white; border: none; cursor: pointer; font-size: 14px; font-weight: 600; box-shadow: var(--shadow-default);"
              onmouseenter="this.style.transform = 'translateY(-1px)'"
              onmouseleave="this.style.transform = 'translateY(0)'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
              Novo Combo
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-6 border-b border-border pb-0">
          <button 
            *ngFor="let tab of tabs"
            (click)="activeTab.set(tab.id)"
            class="pb-3 px-1 text-xs font-bold transition-all relative"
            [style.color]="activeTab() === tab.id ? 'var(--primary)' : 'var(--muted-foreground)'"
            style="cursor: pointer; background: none; border: none;"
          >
            {{ tab.label }}
            <div *ngIf="activeTab() === tab.id" class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style="background: var(--primary);"></div>
          </button>
        </div>

        <!-- ── TAB: MENU LIST ── -->
        <div *ngIf="activeTab() === 'menu'" class="space-y-6">
          <!-- Filters -->
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="relative flex-1">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
              <input 
                [ngModel]="searchQuery()" 
                (ngModelChange)="searchQuery.set($event)" 
                placeholder="Buscar no cardápio..."
                class="w-full pl-11 pr-4 py-3 rounded-xl outline-none bg-white border border-border text-foreground focus:border-primary text-xs"
              />
            </div>
            <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button 
                (click)="selectedCategory.set('all')"
                class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0"
                [style.background]="selectedCategory() === 'all' ? 'var(--primary)' : 'var(--muted)'"
                [style.color]="selectedCategory() === 'all' ? 'white' : 'var(--muted-foreground)'"
                style="border: none; cursor: pointer;"
              >
                Todos
              </button>
              <button 
                *ngFor="let cat of categories()"
                (click)="selectedCategory.set(cat.id)"
                class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0"
                [style.background]="selectedCategory() === cat.id ? 'var(--primary)' : 'var(--muted)'"
                [style.color]="selectedCategory() === cat.id ? 'white' : 'var(--muted-foreground)'"
                style="border: none; cursor: pointer;"
              >
                {{ cat.name }}
              </button>
            </div>
          </div>

          <!-- Products Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div 
              *ngFor="let product of filteredProducts()"
              (click)="openEditForm(product)"
              class="group relative rounded-2xl overflow-hidden transition-all hover:shadow-lg cursor-pointer bg-card border border-border"
            >
              <!-- Image -->
              <div class="aspect-[4/3] relative overflow-hidden bg-black/20">
                <img 
                  [src]="product.image" 
                  [alt]="product.name" 
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <!-- Badges -->
                <div class="absolute top-3 left-3 flex gap-2">
                  <div *ngIf="product.featured" class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-[#E9C46A] text-[#1F1F1F]">Destaque</div>
                  <div class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-white" [style.background]="product.available ? 'var(--success)' : 'var(--destructive)'">
                    {{ product.available ? 'Ativo' : 'Pausado' }}
                  </div>
                </div>
              </div>

              <!-- Product Details -->
              <div class="p-4 space-y-2">
                <h4 class="text-sm font-bold text-foreground leading-tight line-clamp-1">{{ product.name }}</h4>
                <p class="text-[10px] text-muted-foreground line-clamp-2 h-7 leading-relaxed">{{ product.description }}</p>
                <div class="flex items-center justify-between pt-1 border-t border-border">
                  <span class="text-sm font-extrabold text-foreground">{{ formatCurrency(product.price) }}</span>
                  
                  <!-- Margin calculation -->
                  <div *ngIf="getProductMargin(product) as margin" class="text-[10px] font-bold" [style.color]="margin.color">
                    {{ margin.pct }}% Margem
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── TAB: PRATO DO DIA ── -->
        <div *ngIf="activeTab() === 'plateOfDay'" class="max-w-xl space-y-4">
          <div 
            *ngFor="let day of weekDays" 
            class="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
          >
            <div class="w-32 flex-shrink-0">
              <span class="font-bold text-xs text-foreground/80">{{ day.name }}</span>
            </div>
            <div class="flex-1 relative">
              <select 
                [ngModel]="plateOfDayConfig()[day.id] || ''"
                (ngModelChange)="savePlateOfDay(day.id, $event)"
                class="w-full px-4 py-2.5 outline-none appearance-none pr-10 text-xs font-semibold text-foreground rounded-lg bg-white border border-border"
              >
                <option value="">Nenhum prato selecionado</option>
                <option *ngFor="let p of availableMenuProducts()" [value]="p.id">{{ p.name }}</option>
              </select>
              <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
            
            <div *ngIf="plateOfDayConfig()[day.id]" class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black/10 border border-border">
              <img [src]="getProductImage(plateOfDayConfig()[day.id])" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- ── TAB: COMBOS ── -->
        <div *ngIf="activeTab() === 'combos'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div 
            *ngFor="let product of comboProducts()"
            (click)="openEditCombo(product)"
            class="group relative rounded-2xl overflow-hidden transition-all hover:shadow-lg cursor-pointer bg-card border border-border"
          >
            <!-- Image -->
            <div class="aspect-[4/3] relative overflow-hidden bg-black/20">
              <img 
                [src]="product.image || '/assets/hero.png'" 
                [alt]="product.name" 
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              <div class="absolute top-3 left-3">
                <div class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-primary text-white">Combo</div>
              </div>
            </div>

            <!-- Combo Details -->
            <div class="p-4 space-y-2">
              <h4 class="text-sm font-bold text-foreground leading-tight line-clamp-1">{{ product.name }}</h4>
              <p class="text-[10px] text-muted-foreground line-clamp-2 h-7 leading-relaxed">{{ product.description }}</p>
              <div class="flex items-center justify-between pt-1 border-t border-border">
                <span class="text-sm font-extrabold text-foreground">{{ formatCurrency(product.price) }}</span>
                <span class="text-[9px] text-muted-foreground font-bold">{{ product.comboSlots?.length || 0 }} Slots</span>
              </div>
            </div>
          </div>
          
          <div *ngIf="comboProducts().length === 0" class="col-span-full py-16 text-center text-muted-foreground">
            Nenhum combo cadastrado ainda.
          </div>
        </div>
      </ng-container>

      <!-- ── VIEW: PRODUCT FORM (EDIT / CREATE) ── -->
      <div *ngIf="showForm()" class="space-y-6">
        <!-- Form Header -->
        <div class="flex items-center justify-between pb-4 border-b border-border">
          <div class="flex items-center gap-3">
            <button 
              (click)="closeForm()"
              class="w-9 h-9 rounded-xl flex items-center justify-center bg-muted border border-border text-muted-foreground hover:bg-muted/80 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
            <div>
              <h2 class="text-lg font-bold text-foreground">{{ editProduct() ? 'Editar Produto' : 'Novo Produto' }}</h2>
              <p class="text-[10px] text-muted-foreground">Ficha Técnica Integrada</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <button 
              *ngIf="editProduct()"
              (click)="deleteConfirm.set(true)"
              class="px-4 py-2 rounded-xl text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 cursor-pointer"
            >
              Excluir
            </button>
            <button 
              (click)="saveProduct()"
              class="px-5 py-2.5 rounded-xl font-bold text-xs text-white border-none cursor-pointer"
              style="background: var(--primary); shadow: var(--shadow-default);"
            >
              Salvar
            </button>
          </div>
        </div>

        <!-- Confirm Delete Dialog -->
        <div *ngIf="deleteConfirm()" class="p-4 rounded-xl border border-destructive bg-destructive/5 text-xs text-foreground flex items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Deseja realmente deletar este produto do cardápio? Esta ação não pode ser desfeita.</span>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button (click)="deleteConfirm.set(false)" class="px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground font-bold cursor-pointer hover:bg-muted/80">Cancelar</button>
            <button (click)="executeDeleteProduct()" class="px-3 py-1.5 rounded-lg bg-destructive text-white font-bold cursor-pointer border-none">Sim, Excluir</button>
          </div>
        </div>

        <!-- Form Body -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <!-- Left: Product details + ingredients -->
          <div class="xl:col-span-2 space-y-6">
            <!-- General Info Card -->
            <div class="p-6 rounded-2xl bg-card border border-border space-y-4">
              <h3 class="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <span class="text-primary font-black">■</span> Informações Gerais
              </h3>
              
              <!-- Image Preview -->
              <div *ngIf="formState.image" class="relative w-full h-44 rounded-xl overflow-hidden border border-border bg-muted/30">
                <img [src]="formState.image" alt="preview" class="w-full h-full object-cover" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-muted-foreground">Nome do Produto *</label>
                  <input [(ngModel)]="formState.name" required class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-primary text-sm" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-muted-foreground">Nome Interno (Código)</label>
                  <input [(ngModel)]="formState.internalName" class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-primary text-sm" placeholder="BOWL-PROT-01" />
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-xs font-bold text-muted-foreground">URL da Imagem</label>
                <input [(ngModel)]="formState.image" class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-primary text-sm" />
              </div>

              <div class="space-y-1">
                <label class="text-xs font-bold text-muted-foreground">Descrição</label>
                <textarea [(ngModel)]="formState.description" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-primary text-sm resize-none"></textarea>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-muted-foreground">Categoria</label>
                  <select [(ngModel)]="formState.category" class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-primary text-xs font-semibold">
                    <option *ngFor="let cat of categories()" [value]="cat.id">{{ cat.name }}</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-muted-foreground">Preço de Venda (R$)</label>
                  <input type="number" step="0.01" [(ngModel)]="formState.price" class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-primary text-sm font-bold" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-muted-foreground">Margem Alvo (%)</label>
                  <input type="number" [(ngModel)]="formState.desiredMargin" class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-primary text-sm" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-muted-foreground">Preparo (minutos)</label>
                  <input type="number" [(ngModel)]="formState.prepTime" class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-primary text-sm" />
                </div>
                <div class="flex items-end h-full">
                  <div class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted border border-border">
                    <span class="text-xs font-bold text-foreground">Disponível p/ venda</span>
                    <button 
                      type="button" 
                      (click)="formState.available = !formState.available"
                      class="flex items-center text-xs font-bold bg-transparent border-none cursor-pointer"
                      [style.color]="formState.available ? 'var(--success)' : 'var(--border)'"
                    >
                      <svg *ngIf="formState.available" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="16" cy="12" r="4" fill="currentColor"/></svg>
                      <svg *ngIf="!formState.available" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="4" fill="currentColor"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ficha Técnica Card -->
            <div class="p-6 rounded-2xl bg-card border border-border space-y-4">
              <div class="flex items-center justify-between border-b border-border pb-3">
                <h3 class="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <span class="text-primary font-black">■</span> Ingredientes (Ficha Técnica)
                </h3>
                <button 
                  type="button" 
                  (click)="addIngredient()"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-primary bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                  Adicionar
                </button>
              </div>

              <!-- Table -->
              <div class="overflow-x-auto">
                <table class="w-full text-xs" style="min-width: 500px;">
                  <thead>
                    <tr class="border-b border-border text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                      <th class="text-left py-2">Ingrediente</th>
                      <th class="text-center py-2 w-16">Qtd</th>
                      <th class="text-left py-2 w-20">Unidade</th>
                      <th class="text-right py-2 w-20">Unitário</th>
                      <th class="text-right py-2 w-20">Total</th>
                      <th class="py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let ing of formIngredients" class="border-b border-border py-1">
                      <td class="py-2">
                        <select [(ngModel)]="ing.insumoId" class="px-2 py-1.5 rounded bg-white border border-border text-foreground w-full outline-none text-xs">
                          <option value="">Selecione...</option>
                          <option *ngFor="let i of insumos()" [value]="i.id">{{ i.name }}</option>
                        </select>
                      </td>
                      <td class="py-2 px-1">
                        <input type="number" [(ngModel)]="ing.quantity" class="px-1 py-1.5 rounded bg-white border border-border text-center text-foreground w-full outline-none text-xs" />
                      </td>
                      <td class="py-2 px-1">
                        <select [(ngModel)]="ing.unit" class="px-1 py-1.5 rounded bg-white border border-border text-foreground w-full outline-none text-xs">
                          <option *ngFor="let u of units" [value]="u">{{ u }}</option>
                        </select>
                      </td>
                      <td class="text-right py-2 text-muted-foreground">
                        {{ formatCurrency(getIngredientCost(ing).unitPrice) }}
                      </td>
                      <td class="text-right py-2 font-bold text-[#d4745f]">
                        {{ formatCurrency(getIngredientCost(ing).total) }}
                      </td>
                      <td class="text-center py-2">
                        <button 
                          (click)="removeIngredient(ing.id)"
                          class="p-1 rounded text-destructive hover:bg-destructive/10 border-none bg-transparent cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                        </button>
                      </td>
                    </tr>
                    <tr *ngIf="formIngredients.length === 0">
                      <td colspan="6" class="text-center py-6 text-muted-foreground/50 italic">Nenhum ingrediente vinculado a este produto</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Right: Calculator Panel -->
          <div class="space-y-6">
            <div class="p-5 rounded-2xl bg-card border border-border space-y-4">
              <h3 class="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                Calculadora de Margem
              </h3>
              
              <div class="space-y-3.5 text-xs font-medium">
                <div class="flex justify-between items-center py-1.5 border-b border-border">
                  <span class="text-muted-foreground">Custo Total Receita:</span>
                  <span class="font-extrabold text-foreground">{{ formatCurrency(calculatorState().totalCost) }}</span>
                </div>
                <div class="flex justify-between items-center py-1.5 border-b border-border">
                  <span class="text-muted-foreground">Preço Sugerido ({{ formState.desiredMargin }}% margem):</span>
                  <span class="font-bold text-primary">{{ formatCurrency(calculatorState().suggestedPrice) }}</span>
                </div>
                <div class="flex justify-between items-center py-1.5 border-b border-border">
                  <span class="text-muted-foreground">Preço de Venda Definido:</span>
                  <span class="font-extrabold text-foreground">{{ formatCurrency(formState.price) }}</span>
                </div>
                <div class="flex justify-between items-center py-1.5 border-b border-border">
                  <span class="text-muted-foreground">Margem Real Calculada:</span>
                  <span class="font-extrabold" [style.color]="calculatorState().marginColor">
                    {{ calculatorState().realMargin.toFixed(1) }}%
                  </span>
                </div>
                <div class="flex justify-between items-center py-1.5">
                  <span class="text-muted-foreground">Lucro Estimado/Venda:</span>
                  <span class="font-extrabold text-foreground">{{ formatCurrency(calculatorState().profit) }}</span>
                </div>

                <div 
                  *ngIf="calculatorState().realMargin > 0"
                  class="p-3 rounded-xl flex items-center gap-2 text-[10px] font-bold"
                  [style.background]="calculatorState().marginColor + '12'"
                  [style.border]="'1px solid ' + calculatorState().marginColor + '20'"
                  [style.color]="calculatorState().marginColor"
                >
                  <div class="w-1.5 h-1.5 rounded-full" [style.background]="calculatorState().marginColor"></div>
                  <span>{{ calculatorState().marginLabel }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── VIEW: COMBO MODAL (EDIT / CREATE) ── -->
      <div *ngIf="showComboModal()" class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-border">
          <div class="flex items-center gap-3">
            <button 
              (click)="closeCombo()"
              class="w-9 h-9 rounded-xl flex items-center justify-center bg-muted border border-border text-muted-foreground hover:bg-muted/80 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
            <h2 class="text-lg font-bold text-foreground">{{ editCombo() ? 'Editar Combo' : 'Novo Combo' }}</h2>
          </div>
          
          <div class="flex items-center gap-3">
            <button 
              *ngIf="editCombo()"
              (click)="deleteConfirmCombo.set(true)"
              class="px-4 py-2 rounded-xl text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 cursor-pointer"
            >
              Excluir
            </button>
            <button 
              (click)="saveCombo()"
              class="px-5 py-2.5 rounded-xl font-bold text-xs text-white border-none cursor-pointer"
              style="background: var(--primary);"
            >
              Salvar Combo
            </button>
          </div>
        </div>

        <!-- Confirm Delete Combo Dialog -->
        <div *ngIf="deleteConfirmCombo()" class="p-4 rounded-xl border border-destructive bg-destructive/5 text-xs text-foreground flex items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Deseja realmente deletar este combo do cardápio?</span>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button (click)="deleteConfirmCombo.set(false)" class="px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground font-bold cursor-pointer hover:bg-muted/80">Cancelar</button>
            <button (click)="executeDeleteCombo()" class="px-3 py-1.5 rounded-lg bg-destructive text-white font-bold cursor-pointer border-none">Sim, Excluir</button>
          </div>
        </div>

        <!-- Combo Body -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <!-- Left: Combo Meta -->
          <div class="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h3 class="text-xs font-bold text-foreground uppercase tracking-wider">Dados do Combo</h3>
            <div class="space-y-4">
              <div class="space-y-1">
                <label class="text-xs font-bold text-muted-foreground">Nome do Combo</label>
                <input [(ngModel)]="comboState.name" class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-primary text-sm" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-muted-foreground">Preço Especial (R$)</label>
                <input type="number" step="0.01" [(ngModel)]="comboState.price" class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-primary text-sm font-bold" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-muted-foreground">URL Imagem</label>
                <input [(ngModel)]="comboState.image" class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-primary text-sm" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-muted-foreground">Descrição do Combo</label>
                <textarea [(ngModel)]="comboState.description" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-primary text-sm resize-none"></textarea>
              </div>
            </div>
          </div>

          <!-- Center/Right: Combo Slots Config -->
          <div class="md:col-span-2 space-y-6">
            <div class="flex justify-between items-center">
              <h3 class="text-sm font-bold text-foreground">Configuração de Slots</h3>
              <button 
                (click)="addComboSlot()"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-primary bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
              >
                + Adicionar Slot
              </button>
            </div>

            <div class="space-y-6">
              <div *ngFor="let slot of comboSlots" class="bg-card border border-border rounded-2xl p-5 space-y-4">
                <div class="flex justify-between items-center border-b border-border pb-3">
                  <input 
                    [(ngModel)]="slot.name" 
                    placeholder="Nome do Slot (ex: Seleção de Bebida)"
                    class="font-bold text-sm bg-transparent border-none outline-none text-foreground focus:text-[#4C7C59] transition-colors"
                  />
                  <button (click)="removeComboSlot(slot.id)" class="text-destructive hover:bg-destructive/10 border-none bg-transparent cursor-pointer p-1 rounded">
                    Excluir Slot
                  </button>
                </div>

                <!-- Product Selector Grid for this Slot -->
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    *ngFor="let p of availableMenuProducts()"
                    (click)="toggleProductInSlot(slot.id, p.id)"
                    class="p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer"
                    [style.borderColor]="slot.products.includes(p.id) ? 'var(--primary)' : 'var(--border)'"
                    [style.background]="slot.products.includes(p.id) ? 'rgba(76,124,89,0.1)' : 'var(--muted)'"
                  >
                    <div class="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-black/10">
                      <img [src]="p.image" class="w-full h-full object-cover" />
                    </div>
                    <span class="text-[10px] font-bold text-foreground line-clamp-1 flex-1">{{ p.name }}</span>
                    <span *ngIf="slot.products.includes(p.id)" class="text-primary font-bold">✓</span>
                  </button>
                </div>
              </div>
              
              <div *ngIf="comboSlots.length === 0" class="py-12 text-center rounded-2xl border border-dashed border-border text-muted-foreground/50 italic">
                Nenhum slot adicionado. Crie um slot para os clientes escolherem os itens do combo.
              </div>
            </div>
          </div>
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
export class MenuComponent {
  private productsService = inject(ProductsService);
  private ownerService = inject(OwnerService);

  readonly activeTab = signal<'menu' | 'plateOfDay' | 'combos'>('menu');
  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('all');

  // Form toggles
  readonly showForm = signal(false);
  readonly editProduct = signal<Product | undefined>(undefined);
  readonly deleteConfirm = signal(false);

  // Combo modal toggles
  readonly showComboModal = signal(false);
  readonly editCombo = signal<Product | undefined>(undefined);
  readonly deleteConfirmCombo = signal(false);

  readonly tabs: { id: 'menu' | 'plateOfDay' | 'combos'; label: string }[] = [
    { id: 'menu', label: 'Lista de Produtos' },
    { id: 'plateOfDay', label: 'Prato do Dia' },
    { id: 'combos', label: 'Combos' }
  ];

  readonly units: InsumoUnit[] = ["g", "kg", "ml", "l", "un", "fatia", "folha", "colher", "porção"];
  readonly weekDays = DAYS_OF_WEEK;

  // Form State variables
  formState = {
    name: '',
    internalName: '',
    description: '',
    image: '',
    price: 0,
    category: '',
    available: true,
    prepTime: 15,
    featured: false,
    desiredMargin: 40
  };
  formIngredients: (Partial<TechnicalSheetIngredient> & { id: string })[] = [];

  // Combo State variables
  comboState = {
    name: '',
    price: 0,
    image: '',
    description: ''
  };
  comboSlots: { id: string; name: string; products: string[] }[] = [];

  // Expose base services Writable Signals
  readonly products = this.productsService.products;
  readonly categories = this.productsService.categories;
  readonly insumos = this.ownerService.insumos;
  readonly suppliers = this.ownerService.suppliers;
  readonly plateOfDayConfig = this.ownerService.plateOfDay;

  // Filtered lists
  readonly comboProducts = computed(() => 
    this.products().filter(p => p.isCombo)
  );

  readonly availableMenuProducts = computed(() => 
    this.products().filter(p => !p.isCombo && p.available)
  );

  readonly filteredProducts = computed(() => {
    const search = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    return this.products().filter(p => {
      if (p.isCombo) return false;
      const matchesSearch = p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search);
      const matchesCat = cat === 'all' || p.category === cat;
      return matchesSearch && matchesCat;
    });
  });

  // Ingredient cost calculation
  getIngredientCost(ing: any): { unitPrice: number; total: number } {
    if (!ing.insumoId || !ing.quantity) return { unitPrice: 0, total: 0 };
    const cost = this.ownerService.calculateIngredientCost(ing as TechnicalSheetIngredient);
    return { unitPrice: cost.unitPrice, total: cost.total };
  }

  // Margin status helper
  getProductMargin(product: Product) {
    const sheet = this.ownerService.getTechnicalSheetByProduct(product.id);
    if (!sheet) return null;
    const cost = this.ownerService.calculateSheetCost(sheet);
    if (product.price <= 0) return null;
    const pct = ((product.price - cost) / product.price) * 100;
    const color = pct >= 40 ? 'var(--success)' : pct >= 25 ? 'var(--warning)' : 'var(--destructive)';
    return { pct: pct.toFixed(0), color };
  }

  // Calculator panel state
  readonly calculatorState = computed(() => {
    const ingredients = this.formIngredients;
    const price = this.formState.price;
    const desiredMargin = this.formState.desiredMargin;

    const totalCost = ingredients.reduce((sum, ing) => {
      if (!ing.insumoId || !ing.quantity) return sum;
      const cost = this.ownerService.calculateIngredientCost(ing as TechnicalSheetIngredient);
      return sum + cost.total;
    }, 0);

    const suggestedPrice = desiredMargin > 0 && desiredMargin < 100 && totalCost > 0
      ? totalCost / (1 - desiredMargin / 100)
      : 0;

    const finalPrice = price > 0 ? price : suggestedPrice;
    const realMargin = finalPrice > 0 && totalCost > 0
      ? ((finalPrice - totalCost) / finalPrice) * 100
      : 0;
    const profit = finalPrice - totalCost;

    const marginColor = realMargin >= 40 ? 'var(--success)' : realMargin >= 25 ? 'var(--warning)' : 'var(--destructive)';
    const marginLabel = realMargin >= 40 ? "Margem Saudável" : realMargin >= 25 ? "Margem Média" : "Margem Baixa";

    return { totalCost, suggestedPrice, realMargin, profit, marginColor, marginLabel };
  });

  // Actions
  openCreateForm() {
    this.editProduct.set(undefined);
    this.deleteConfirm.set(false);
    this.formState = {
      name: '',
      internalName: '',
      description: '',
      image: '',
      price: 0,
      category: this.categories()[0]?.id || '',
      available: true,
      prepTime: 15,
      featured: false,
      desiredMargin: 45
    };
    this.formIngredients = [];
    this.showForm.set(true);
  }

  openEditForm(product: Product) {
    this.editProduct.set(product);
    this.deleteConfirm.set(false);
    this.formState = {
      name: product.name,
      internalName: product.internalName || '',
      description: product.description,
      image: product.image,
      price: product.price,
      category: product.category,
      available: product.available,
      prepTime: product.prepTime || 15,
      featured: product.featured || false,
      desiredMargin: product.desiredMargin || 45
    };
    const sheet = this.ownerService.getTechnicalSheetByProduct(product.id);
    this.formIngredients = sheet ? sheet.ingredients.map(i => ({ ...i })) : [];
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editProduct.set(undefined);
  }

  addIngredient() {
    this.formIngredients.push({
      id: `tmp_${Date.now()}`,
      insumoId: '',
      quantity: 0,
      unit: 'g'
    });
  }

  removeIngredient(id: string) {
    this.formIngredients = this.formIngredients.filter(i => i.id !== id);
  }

  async saveProduct() {
    if (!this.formState.name || this.formState.price <= 0) return;

    const prodData: Omit<Product, 'id'> = {
      name: this.formState.name,
      internalName: this.formState.internalName,
      description: this.formState.description,
      image: this.formState.image,
      price: this.formState.price,
      category: this.formState.category,
      available: this.formState.available,
      prepTime: this.formState.prepTime,
      featured: this.formState.featured,
      desiredMargin: this.formState.desiredMargin
    };

    let pId: string;
    const editing = this.editProduct();

    try {
      if (editing) {
        pId = editing.id;
        await this.productsService.updateProduct(pId, prodData);
      } else {
        pId = await this.productsService.addProduct(prodData);
      }

      // Save Technical Sheet
      const validIngredients = this.formIngredients.filter(i => i.insumoId && i.quantity);
      if (validIngredients.length > 0) {
        const sheet: Omit<TechnicalSheet, 'id'> & { id?: string } = {
          productId: pId,
          internalName: this.formState.internalName || this.formState.name,
          desiredMargin: this.formState.desiredMargin,
          ingredients: validIngredients as TechnicalSheetIngredient[],
          id: editing ? this.ownerService.getTechnicalSheetByProduct(editing.id)?.id : undefined
        };
        this.ownerService.saveTechnicalSheet(sheet);
      } else if (editing) {
        this.ownerService.deleteTechnicalSheet(editing.id);
      }
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
    }

    this.closeForm();
  }

  async executeDeleteProduct() {
    const editing = this.editProduct();
    if (editing) {
      try {
        await this.productsService.deleteProduct(editing.id);
        this.ownerService.deleteTechnicalSheet(editing.id);
      } catch (err) {
        console.error('Erro ao deletar produto:', err);
      }
    }
    this.closeForm();
  }

  // Combo Actions
  openCreateCombo() {
    this.editCombo.set(undefined);
    this.deleteConfirmCombo.set(false);
    this.comboState = {
      name: '',
      price: 0,
      image: '',
      description: ''
    };
    this.comboSlots = [];
    this.showComboModal.set(true);
  }

  openEditCombo(product: Product) {
    this.editCombo.set(product);
    this.deleteConfirmCombo.set(false);
    this.comboState = {
      name: product.name,
      price: product.price,
      image: product.image || '',
      description: product.description
    };
    this.comboSlots = product.comboSlots ? product.comboSlots.map(s => ({ ...s })) : [];
    this.showComboModal.set(true);
  }

  closeCombo() {
    this.showComboModal.set(false);
    this.editCombo.set(undefined);
  }

  addComboSlot() {
    this.comboSlots.push({
      id: `slot_${Date.now()}`,
      name: 'Novo Slot',
      products: []
    });
  }

  removeComboSlot(id: string) {
    this.comboSlots = this.comboSlots.filter(s => s.id !== id);
  }

  toggleProductInSlot(slotId: string, productId: string) {
    this.comboSlots = this.comboSlots.map(s => {
      if (s.id !== slotId) return s;
      const isIncluded = s.products.includes(productId);
      return {
        ...s,
        products: isIncluded ? s.products.filter(id => id !== productId) : [...s.products, productId]
      };
    });
  }

  saveCombo() {
    if (!this.comboState.name || this.comboState.price <= 0) return;

    const data: Omit<Product, 'id'> = {
      name: this.comboState.name,
      description: this.comboState.description,
      price: this.comboState.price,
      image: this.comboState.image,
      category: 'combos',
      available: true,
      prepTime: 20,
      isCombo: true,
      comboSlots: this.comboSlots as ComboSlot[]
    };

    const editing = this.editCombo();
    if (editing) {
      this.products.update(list => list.map(p => p.id === editing.id ? { ...p, ...data } as Product : p));
    } else {
      this.products.update(list => [...list, { ...data, id: `p${Date.now()}` }]);
    }
    this.closeCombo();
  }

  executeDeleteCombo() {
    const editing = this.editCombo();
    if (editing) {
      this.products.update(list => list.filter(p => p.id !== editing.id));
    }
    this.closeCombo();
  }

  // Plate of the Day
  getProductImage(productId: string): string {
    return this.products().find(p => p.id === productId)?.image || '';
  }

  savePlateOfDay(day: number, productId: string): void {
    this.ownerService.updatePlateOfDay(day, productId);
  }

  formatCurrency(val: number): string {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
