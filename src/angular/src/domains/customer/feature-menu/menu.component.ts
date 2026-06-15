import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from '../data-access/products.service';
import { CartStateService } from '../data-access/cart.state';
import { ToastService } from '../../../shared/data-access/toast.service';
import { ProductCardComponent } from '../ui/product-card.component';
import { Product } from '../data-access/customer.models';
import { ProductModalComponent } from './product-modal.component';
import { CouponsService } from '../data-access/coupons.service';
import { AuthService } from '../../auth/data-access/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, ProductModalComponent],
  template: `
    <div style="color: var(--foreground)">
      <div class="px-0 py-6" style="background: var(--background)">
        <div class="relative max-w-4xl mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            type="text"
            placeholder="O que vamos comer hoje?"
            [(ngModel)]="searchTerm"
            class="w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none shadow-sm"
            style="background: var(--background-soft); border: 1px solid var(--border); color: var(--text-primary); font-size: 15px;"
          />
        </div>
      </div>

      <div class="max-w-4xl mx-auto">
        <!-- Coupons Section -->
        @if (!searchTerm() && activeCoupons().length > 0) {
          <div class="px-0 pt-6 mb-2">
            <div>
              <h2 class="font-serif text-xl text-[#4C7C59] mb-4 font-bold" style="font-family: 'Poppins', sans-serif">
                Meus Cupons
              </h2>
            </div>
            <div class="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              @for (coupon of activeCoupons(); track coupon.id) {
                <div class="flex-shrink-0 bg-white shadow-sm border border-[var(--border)] rounded-xl p-2.5 flex items-center gap-3 min-w-[170px] hover:translate-y-[-2px] transition-transform duration-200">
                  <div class="w-9 h-9 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                    <!-- Tag SVG Icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.39.39 1.02.39 1.41 0l7.59-7.59c.39-.39.39-1.02 0-1.41L12 2z"/><path d="m7 7-.01.01"/></svg>
                  </div>
                  <div>
                    <p class="font-black text-[11px] uppercase tracking-wider mb-0.5 leading-none" style="color: var(--text-primary);">
                      {{ coupon.code }}
                    </p>
                    <p class="text-[10px] text-muted-foreground font-semibold leading-none">
                      {{ coupon.type === 'percentage' ? coupon.value + '% OFF' : coupon.type === 'shipping' ? 'Frete Grátis' : 'R$ ' + coupon.value + ' OFF' }}
                    </p>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Filters -->
        @if (!searchTerm()) {
          <div class="px-0 py-5">
            <div class="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              <button 
                (click)="selectedCategory.set(null)"
                class="flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all border-none cursor-pointer"
                [style.background]="!selectedCategory() ? 'var(--primary)' : 'var(--background-soft)'"
                [style.color]="!selectedCategory() ? 'white' : 'var(--text-secondary)'"
              >
                TUDO
              </button>
              @for (cat of categories(); track cat.id) {
                <button 
                  (click)="selectedCategory.set(cat.id)"
                  class="flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 border-none cursor-pointer"
                  [style.background]="selectedCategory() === cat.id ? 'var(--primary)' : 'var(--background-soft)'"
                  [style.color]="selectedCategory() === cat.id ? 'white' : 'var(--text-secondary)'"
                >
                  <span>{{ cat.name | uppercase }}</span>
                </button>
              }
            </div>
          </div>
        }

        <!-- Plate of the Day (Prato do Dia) Recommendation -->
        @if (!searchTerm() && todaySpecial() && !selectedCategory()) {
          <div class="px-0 mb-12">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <h2 style="font-size: 24px; font-weight: 900; color: var(--text-primary); font-family: 'Poppins', sans-serif">Prato do Dia</h2>
              </div>
              <span class="hidden sm:block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full" style="color: #4C7C59; background-color: #E6F0EA;">Fresco Hoje</span>
            </div>
            
            <div (click)="openModal(todaySpecial()!)" class="special-card relative overflow-hidden rounded-[40px] shadow-2xl cursor-pointer group" style="background: #1A2E1F; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 25px 50px -12px rgba(76, 124, 89, 0.1);">
              <div class="flex flex-col lg:flex-row">
                <div class="lg:w-1/2 aspect-square lg:aspect-auto overflow-hidden relative min-h-[250px] lg:min-h-full">
                  <img [src]="todaySpecial()!.image" [alt]="todaySpecial()!.name" class="w-full h-full object-cover transition-transform duration-700" />
                  <div class="special-gradientabsolute absolute inset-0"></div>
                </div>
                <div class="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                  <div class="inline-block self-start mb-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest" style="background-color: #E9C46A; color: #1A2E1F;">RECOMENDAÇÃO DO CHEF</div>
                  <h3 style="font-size: 32px; font-weight: 900; color: white; margin-bottom: 12px; line-height: 1.1; font-family: 'Poppins', sans-serif">{{ todaySpecial()!.name }}</h3>
                  <p style="color: rgba(255,255,255,0.7); font-size: 16px; line-height: 1.6; margin-bottom: 32px; font-weight: 500">{{ todaySpecial()!.description }}</p>
                  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-auto gap-5">
                    <span style="font-size: 24px; font-weight: 900; color: #E9C46A">R$ {{ todaySpecial()!.price.toFixed(2) }}</span>
                    <button 
                      (click)="$event.stopPropagation(); addToCart({ product: todaySpecial()!, quantity: 1 })" 
                      class="w-full sm:w-auto text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 border-none cursor-pointer shadow-lg hover:brightness-110"
                      style="background-color: #4C7C59; box-shadow: 0 10px 15px -3px rgba(76, 124, 89, 0.3);"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                      Pedir Agora
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Products -->
        <div class="px-0 pb-20 mt-4">
          @if (searchTerm()) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (product of filteredProducts(); track product.id) {
                <app-product-card 
                  [product]="product"
                  [quantity]="getCartQuantity(product.id)"
                  [isSpecial]="product.id === todaySpecial()?.id"
                  (select)="openModal($event)"
                />
              }
              @if (filteredProducts().length === 0) {
                 <p class="text-center text-muted-foreground mt-10">Nenhum produto encontrado</p>
              }
            </div>
          } @else {
            @for (group of groupedProducts(); track group.category.id) {
              <div class="mb-10">
                <div class="flex items-center gap-3 mb-5 pb-2" style="border-bottom: 2px solid var(--secondary)">
                  <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary); font-family: 'Poppins', sans-serif">
                    {{ group.category.name }}
                  </h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @for (product of group.products; track product.id) {
                    <app-product-card 
                      [product]="product"
                      [quantity]="getCartQuantity(product.id)"
                      [isSpecial]="product.id === todaySpecial()?.id"
                      (select)="openModal($event)"
                    />
                  }
                </div>
              </div>
            }
          }
        </div>
      </div>

      <!-- Floating bottom cart bar -->
      @if (authService.isAuthenticated() && cartCount() > 0 && !modalOpen()) {
        <div class="fixed bottom-20 md:bottom-8 left-0 right-0 px-6 z-[40] flex justify-center">
          <button 
            (click)="router.navigate(['/customer/cart'])" 
            class="w-full max-w-[600px] flex items-center justify-between px-6 py-4 rounded-2xl border-none cursor-pointer text-white" 
            style="background: var(--primary); box-shadow: 0 20px 40px -10px rgba(76, 124, 89, 0.5);"
          >
            <div class="flex items-center gap-4">
              <div class="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center font-black">{{ cartCount() }}</div>
              <span class="font-bold">Ver Carrinho</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-lg font-black">R$ {{ cartTotal().toFixed(2) }}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </button>
        </div>
      }

      <!-- Modal -->
      @if (selectedProduct() && modalOpen()) {
        <app-product-modal 
          [product]="selectedProduct()!"
          (close)="closeModal()"
          (add)="addToCart($event)"
        />
      }
    </div>
  `,
  styles: [`
    .special-gradientabsolute {
      background: linear-gradient(to top, #1A2E1F 0%, transparent 100%);
    }
    @media (min-width: 1024px) {
      .special-gradientabsolute {
        background: linear-gradient(to left, #1A2E1F 0%, transparent 100%);
      }
    }
    .special-card:hover img {
      transform: scale(1.05);
    }
    .special-card img {
      transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `]
})
export class MenuComponent {
  private productsService = inject(ProductsService);
  private cartState = inject(CartStateService);
  private couponsService = inject(CouponsService);
  private toastService = inject(ToastService);
  authService = inject(AuthService);
  router = inject(Router);

  selectedCategory = signal<string | null>(null);
  searchTerm = signal('');
  selectedProduct = signal<Product | null>(null);
  modalOpen = signal(false);

  categories = this.productsService.categories;
  products = this.productsService.availableProducts;
  activeCoupons = computed(() => this.couponsService.coupons().filter(c => c.active).slice(0, 3));

  cartCount = this.cartState.count;
  cartTotal = this.cartState.total;

  getCartQuantity(productId: string): number {
    return this.cartState.items().find(i => i.productId === productId)?.quantity ?? 0;
  }

  todaySpecial = computed(() => {
    const currentDay = new Date().getDay();
    const plateOfDayConfig = this.productsService.plateOfDay();
    const plateOfDayId = plateOfDayConfig[currentDay];
    return this.products().find(p => p.id === plateOfDayId && p.available);
  });

  filteredProducts = computed(() => {
    let items = this.products();
    const search = this.searchTerm().toLowerCase();
    if (search) {
      return items.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
    }
    return items;
  });

  groupedProducts = computed(() => {
    const cats = this.categories();
    const items = this.products();
    const activeCat = this.selectedCategory();
    
    return cats
      .map(cat => ({
        category: cat,
        products: items.filter(p => p.category === cat.id && (!activeCat || activeCat === cat.id))
      }))
      .filter(g => g.products.length > 0);
  });

  openModal(product: Product) {
    this.selectedProduct.set(product);
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
    this.selectedProduct.set(null);
  }

  addToCart(data: { product: Product; quantity: number; subItems?: any[] }) {
    this.cartState.addItem(data.product, data.quantity, data.subItems);
    this.toastService.success(`${data.product.name} adicionado ao carrinho!`);
    this.closeModal();
  }
}


