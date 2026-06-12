import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CouponsService } from '../../customer/data-access/coupons.service';
import { Coupon, CouponType } from '../../customer/data-access/customer.models';

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 space-y-6 text-foreground font-sans bg-background">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="overline-label mb-2 text-[#E9C46A]" style="font-weight: 700; letter-spacing: 0.1em">Gestão de Ofertas</p>
          <h1 class="display-heading text-foreground text-3xl font-extrabold" style="font-family: 'Space Grotesk', sans-serif">Cupons e Promoções</h1>
          <p class="text-muted-foreground text-xs mt-1">Gerencie as ofertas e acompanhe o impacto nas vendas.</p>
        </div>
        <button
          (click)="openCreator()"
          class="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border-none cursor-pointer text-white text-xs"
          style="background: var(--primary); shadow: var(--shadow-default);"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          Criar Cupom
        </button>
      </div>

      <!-- Analytics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-card border border-border p-5 rounded-2xl flex items-center gap-5">
          <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l5-5c.94-.94.94-2.48 0-3.42L12 2z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          </div>
          <div>
            <p class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Cupons Ativos</p>
            <h3 class="text-2xl font-extrabold text-foreground">{{ analytics().activeCount }}</h3>
          </div>
        </div>
        
        <div class="bg-card border border-border p-5 rounded-2xl flex items-center gap-5">
          <div class="w-12 h-12 rounded-full bg-[#E9C46A]/10 flex items-center justify-center text-[#E9C46A]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
          </div>
          <div>
            <p class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Total de Usos</p>
            <h3 class="text-2xl font-extrabold text-foreground">{{ analytics().totalUses }}</h3>
          </div>
        </div>

        <div class="bg-card border border-border p-5 rounded-2xl flex items-center gap-5">
          <div class="w-12 h-12 rounded-full bg-[#E63946]/10 flex items-center justify-center text-[#E63946]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polygon points="17 6 23 6 23 12"/></svg>
          </div>
          <div>
            <p class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Volume de Vendas</p>
            <h3 class="text-2xl font-extrabold text-foreground">{{ formatCurrency(analytics().totalVolume) }}</h3>
          </div>
        </div>
      </div>

      <!-- Coupons Table Container -->
      <div class="bg-card border border-border rounded-2xl p-6 space-y-6">
        <div class="relative w-full">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
          <input 
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Buscar por código de cupom..."
            class="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border text-foreground outline-none focus:border-primary text-xs"
          />
        </div>

        <div class="space-y-3">
          <div 
            *ngFor="let coupon of filteredCoupons()"
            class="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border bg-background/50 hover:border-primary/50 transition-all gap-4"
          >
            <div class="flex items-center gap-4 flex-1">
              <div 
                class="w-11 h-11 rounded-lg flex items-center justify-center"
                [class]="coupon.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'"
              >
                <!-- Standard Tag SVG Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l5-5c.94-.94.94-2.48 0-3.42L12 2z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              </div>
              
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-base leading-tight uppercase tracking-wider text-foreground">{{ coupon.code }}</h4>
                  <span *ngIf="!coupon.active" class="text-[9px] bg-muted border border-border text-muted-foreground px-1.5 py-0.5 rounded font-black uppercase">Inativo</span>
                </div>
                <p class="text-[11px] text-muted-foreground mt-0.5">
                  {{ formatValueLabel(coupon) }} • Usado {{ coupon.usedCount }}x
                </p>
              </div>

              <div class="hidden md:block ml-8 pr-8 border-r border-border min-w-[110px]">
                <p class="text-[9px] text-muted-foreground uppercase font-black mb-0.5">Volume Vendas</p>
                <p class="font-bold text-xs text-primary">{{ formatCurrency(coupon.totalSalesVolume || 0) }}</p>
              </div>
              
              <div class="hidden md:block ml-4 pr-8 border-r border-border min-w-[100px]">
                <p class="text-[9px] text-muted-foreground uppercase font-black mb-0.5">Ticket Médio</p>
                <p class="font-bold text-xs text-foreground">
                  {{ coupon.usedCount > 0 ? formatCurrency((coupon.totalSalesVolume || 0) / coupon.usedCount) : "R$ 0,00" }}
                </p>
              </div>
            </div>

            <div class="flex items-center justify-between md:justify-end gap-6">
              <div class="text-right text-xs">
                <div class="text-muted-foreground">
                  {{ coupon.minOrderValue ? 'Min: ' + formatCurrency(coupon.minOrderValue) : "Sem mínimo" }}
                </div>
                <div [class.text-destructive]="isExpired(coupon.expirationDate)" class="text-muted-foreground mt-0.5">
                  {{ coupon.expirationDate ? 'Exp: ' + formatDate(coupon.expirationDate) : "Sem expiração" }}
                </div>
              </div>
              
              <div class="flex gap-2">
                <button 
                  (click)="startEdit(coupon)"
                  class="w-8 h-8 rounded-lg flex items-center justify-center bg-background border border-border text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </button>
                <button 
                  (click)="deleteCoupon(coupon.id)"
                  class="w-8 h-8 rounded-lg flex items-center justify-center bg-background border border-border text-muted-foreground hover:text-destructive hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
              </div>
            </div>
          </div>
          <div *ngIf="filteredCoupons().length === 0" class="py-12 text-center text-muted-foreground italic">
            Nenhum cupom encontrado.
          </div>
        </div>
      </div>

      <!-- ── VIEW: SLIDING DRAWER EDITOR ── -->
      <div *ngIf="isCreatorOpen()" class="fixed inset-0 z-50 flex justify-end">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs" (click)="closeCreator()"></div>
        
        <!-- Drawer Panel -->
        <div 
          class="relative flex flex-col h-full w-full max-w-md bg-card z-40 border-l border-border shadow-2xl"
        >
          <!-- Drawer Header -->
          <div class="flex items-center justify-between p-6 border-b border-border">
            <h2 class="text-lg font-bold text-foreground">{{ editingCoupon() ? "Editar Cupom" : "Criar Novo Cupom" }}</h2>
            <button
              (click)="closeCreator()"
              class="w-8 h-8 flex items-center justify-center bg-muted text-muted-foreground rounded-full hover:bg-muted/80 border-none cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
            </button>
          </div>

          <!-- Drawer Form Body -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            <div class="space-y-1">
              <label class="text-xs font-bold text-muted-foreground block">Código do Cupom *</label>
              <input 
                [(ngModel)]="formState.code"
                placeholder="Ex: DAHORTAFIT"
                class="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground font-bold tracking-widest outline-none focus:border-primary uppercase"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-muted-foreground block">Tipo de Desconto</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  *ngFor="let type of couponTypes"
                  (click)="formState.type = type.value"
                  class="flex items-center gap-2 p-2.5 rounded-xl border text-left cursor-pointer transition-all font-semibold"
                  [class.border-primary]="formState.type === type.value"
                  [class.border-border]="formState.type !== type.value"
                  [class.bg-primary]="formState.type === type.value"
                  [class.bg-background]="formState.type !== type.value"
                  [class.text-white]="formState.type === type.value"
                  [class.text-muted-foreground]="formState.type !== type.value"
                >
                  <span class="flex-shrink-0 flex items-center" [innerHTML]="getIconForType(type.value)"></span>
                  <span class="text-[10px]">{{ type.label }}</span>
                </button>
              </div>
            </div>

            <div *ngIf="formState.type !== 'shipping' && formState.type !== 'inactive'" class="space-y-1">
              <label class="text-xs font-bold text-muted-foreground block">Valor do Desconto</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                  {{ formState.type === 'percentage' ? '%' : 'R$' }}
                </span>
                <input 
                  type="number"
                  [(ngModel)]="formState.value"
                  placeholder="0.00"
                  class="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground font-bold outline-none"
                />
              </div>
            </div>

            <div class="flex items-center justify-between p-3 rounded-xl bg-muted border border-border">
              <span class="font-bold text-foreground">Cupom Ativo</span>
              <button 
                (click)="formState.active = !formState.active"
                class="flex items-center bg-transparent border-none cursor-pointer"
                [style.color]="formState.active ? 'var(--success)' : 'var(--border)'"
              >
                <svg *ngIf="formState.active" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="16" cy="12" r="4" fill="currentColor"/></svg>
                <svg *ngIf="!formState.active" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="4" fill="currentColor"/></svg>
              </button>
            </div>

            <hr class="border-border my-6" />
            <h3 class="font-bold text-sm text-foreground mb-4">Restrições</h3>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-muted-foreground block">Pedido Mínimo (R$)</label>
                <input 
                  type="number"
                  [(ngModel)]="formState.minOrderValue"
                  placeholder="Ex: 50.00"
                  class="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-muted-foreground block">Validade</label>
                <input 
                  type="date"
                  [ngModel]="formState.expirationDate"
                  (ngModelChange)="formState.expirationDate = $event"
                  class="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none text-xs"
                  style="color-scheme: light;"
                />
              </div>
            </div>

            <div class="p-4 bg-muted rounded-xl flex gap-3 text-[10px] text-muted-foreground leading-relaxed">
              <svg class="text-primary flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <p>Cupons ativos são exibidos automaticamente na tela de finalização de compras dos clientes quando eles cumprem as regras de pedido mínimo.</p>
            </div>
          </div>

          <!-- Drawer Footer -->
          <div class="p-6 border-t border-border bg-card">
            <button
              (click)="saveCoupon()"
              class="w-full py-4 rounded-xl text-white font-extrabold cursor-pointer border-none shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              style="background: var(--primary);"
            >
              Salvar Cupom
            </button>
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
export class CouponsComponent {
  private couponsService = inject(CouponsService);

  readonly searchQuery = signal<string>('');
  readonly isCreatorOpen = signal(false);
  readonly editingCoupon = signal<Coupon | null>(null);

  readonly coupons = this.couponsService.coupons;

  readonly couponTypes = [
    { value: 'percentage' as CouponType, label: 'Percentual (% Off)' },
    { value: 'fixed' as CouponType, label: 'Fixo (R$ Off)' },
    { value: 'shipping' as CouponType, label: 'Frete Grátis' }
  ];

  // Form local state
  formState = {
    code: '',
    type: 'percentage' as CouponType,
    value: 0,
    active: true,
    minOrderValue: 0,
    expirationDate: ''
  };

  readonly filteredCoupons = computed(() => {
    const term = this.searchQuery().toLowerCase().trim();
    return this.coupons().filter(c => c.code.toLowerCase().includes(term));
  });

  // Top level stats
  readonly analytics = computed(() => {
    const list = this.coupons();
    const totalUses = list.reduce((sum, c) => sum + c.usedCount, 0);
    const activeCount = list.filter(c => c.active).length;
    const totalVolume = list.reduce((sum, c) => sum + (c.totalSalesVolume || 0), 0);
    return { totalUses, activeCount, totalVolume };
  });

  // Actions
  openCreator() {
    this.editingCoupon.set(null);
    this.formState = {
      code: '',
      type: 'percentage' as CouponType,
      value: 0,
      active: true,
      minOrderValue: 0,
      expirationDate: ''
    };
    this.isCreatorOpen.set(true);
  }

  startEdit(coupon: Coupon) {
    this.editingCoupon.set(coupon);
    let expDateStr = '';
    if (coupon.expirationDate) {
      const d = new Date(coupon.expirationDate);
      expDateStr = d.toISOString().split('T')[0];
    }

    this.formState = {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      active: coupon.active,
      minOrderValue: coupon.minOrderValue || 0,
      expirationDate: expDateStr
    };
    this.isCreatorOpen.set(true);
  }

  closeCreator() {
    this.isCreatorOpen.set(false);
    this.editingCoupon.set(null);
  }

  saveCoupon() {
    if (!this.formState.code) return;

    const couponData = {
      code: this.formState.code.toUpperCase().replace(/\s/g, ''),
      type: this.formState.type,
      value: this.formState.value || 0,
      active: this.formState.active,
      minOrderValue: this.formState.minOrderValue || undefined,
      expirationDate: this.formState.expirationDate ? new Date(this.formState.expirationDate + 'T12:00:00') : undefined
    };

    const editing = this.editingCoupon();
    if (editing) {
      this.couponsService.update(editing.id, couponData);
    } else {
      this.couponsService.add(couponData);
    }

    this.closeCreator();
  }

  deleteCoupon(id: string) {
    if (confirm('Deseja realmente deletar esta oferta?')) {
      this.couponsService.delete(id);
    }
  }

  // Icons mapper
  getIconForType(type: string): string {
    switch (type) {
      case 'percentage': 
        return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>';
      case 'fixed': 
        return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
      case 'shipping': 
        return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="16" height="11" x="2" y="7" rx="2"/><path d="M18 18H2v-5c0-1.66 1.34-3 3-3h10c1.66 0 3 1.34 3 3v5zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><circle cx="7" cy="18" r="2"/><circle cx="15" cy="18" r="2"/></svg>';
      default: 
        return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="9" y2="15"/><line x1="15" x2="9" y1="9" y2="15"/></svg>';
    }
  }

  formatValueLabel(c: Coupon): string {
    if (c.type === 'percentage') return `${c.value}% OFF`;
    if (c.type === 'fixed') return this.formatCurrency(c.value);
    if (c.type === 'shipping') return "Frete Grátis";
    return `${c.value}`;
  }

  isExpired(date?: Date): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  formatDate(date: any): string {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  formatCurrency(val: number): string {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
