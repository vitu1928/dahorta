import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CustomerStateService } from '../data-access/customer-state.service';
import { Product } from '../data-access/models';
import { ImageWithFallbackComponent } from '../../../shared/ui/image-with-fallback/image-with-fallback.component';
import { AllergenIconComponent } from '../ui/allergen-icon.component';
import { FEATURED_HERO_IMAGE, LOGO_IMAGE } from '../data-access/mock-data';

const formatCurrency = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

@Component({
  selector: 'app-menu-page',
  standalone: true,
  imports: [ImageWithFallbackComponent, AllergenIconComponent],
  template: `
    <main class="min-h-screen bg-[#F7F9F7] pb-28 text-[#1F1F1F]">
      <section class="relative min-h-[360px] overflow-hidden bg-[#1A2E1F] px-5 py-6 text-white md:px-10 md:py-8">
        <app-image-with-fallback
          [src]="heroImage"
          alt="Bowl DaHorta"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-[#1A2E1F]/75 via-[#1A2E1F]/70 to-[#1A2E1F]"></div>

        <div class="relative z-10 mx-auto flex max-w-6xl items-start justify-between gap-4">
          <app-image-with-fallback [src]="logoImage" alt="DaHorta" className="h-10 w-auto object-contain brightness-0 invert" />
          <button
            type="button"
            (click)="goToCart()"
            class="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            aria-label="Abrir carrinho"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            @if (state.cartCount() > 0) {
              <span class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E9C46A] px-1 text-[11px] font-extrabold text-[#1F1F1F]">
                {{ state.cartCount() }}
              </span>
            }
          </button>
        </div>

        <div class="relative z-10 mx-auto mt-16 max-w-6xl">
          <p class="mb-3 font-serif text-xl italic text-[#E9C46A]">Cardapio DaHorta</p>
          <h1 class="max-w-3xl text-5xl font-extrabold leading-[1.02] text-white md:text-7xl">
            Escolha seu bowl fresco de hoje.
          </h1>
          <p class="mt-5 max-w-xl text-base font-medium leading-relaxed text-white/75 md:text-lg">
            Bowls, saladas, bebidas e acompanhamentos preparados com ingredientes frescos e ficha tecnica controlada.
          </p>
        </div>
      </section>

      <section class="mx-auto -mt-12 max-w-6xl px-5 md:px-10">
        <div class="relative z-20 rounded-[28px] border border-[#EEF2EE] bg-white p-4 shadow-xl shadow-black/5 md:p-5">
          <div class="flex flex-col gap-4 md:flex-row md:items-center">
            <label class="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-[#DADADA] bg-white px-4 text-[#5F5F5F]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="search"
                class="h-10 flex-1 border-none bg-transparent outline-none"
                placeholder="Buscar no cardapio"
                [value]="search()"
                (input)="updateSearch($event)"
              />
            </label>

            <div class="flex gap-2 overflow-x-auto pb-1 md:max-w-[55%]">
              <button
                type="button"
                class="whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition"
                [class.bg-[#4C7C59]]="activeCategory() === 'all'"
                [class.text-white]="activeCategory() === 'all'"
                [class.bg-[#EEF2EE]]="activeCategory() !== 'all'"
                [class.text-[#4C7C59]]="activeCategory() !== 'all'"
                (click)="activeCategory.set('all')"
              >
                Todos
              </button>
              @for (category of state.categories(); track category.id) {
                <button
                  type="button"
                  class="whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition"
                  [class.bg-[#4C7C59]]="activeCategory() === category.id"
                  [class.text-white]="activeCategory() === category.id"
                  [class.bg-[#EEF2EE]]="activeCategory() !== category.id"
                  [class.text-[#4C7C59]]="activeCategory() !== category.id"
                  (click)="activeCategory.set(category.id)"
                >
                  {{ category.icon }} {{ category.name }}
                </button>
              }
            </div>
          </div>
        </div>
      </section>

      <section class="mx-auto mt-10 max-w-6xl px-5 md:px-10">
        @if (todaySpecial(); as special) {
          <button
            type="button"
            (click)="addProduct(special)"
            class="mb-9 grid w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#1A2E1F] text-left shadow-2xl shadow-[#4C7C59]/10 md:grid-cols-[0.9fr_1.1fr]"
          >
            <div class="relative min-h-56">
              <app-image-with-fallback [src]="special.image" [alt]="special.name" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div class="p-6 text-white md:p-8">
              <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#E9C46A]">Prato do dia</p>
              <h2 class="text-3xl font-extrabold text-white">{{ special.name }}</h2>
              <p class="mt-3 text-sm leading-relaxed text-white/70">{{ special.description }}</p>
              <div class="mt-6 flex items-center justify-between gap-4">
                <span class="text-xl font-extrabold text-white">{{ currency(special.price) }}</span>
                <span class="rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#4C7C59]">Adicionar</span>
              </div>
            </div>
          </button>
        }

        <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          @for (product of filteredProducts(); track product.id) {
            <article class="overflow-hidden rounded-[24px] border border-[#EEF2EE] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
              <button type="button" class="block w-full text-left" (click)="addProduct(product)">
                <div class="relative aspect-[4/3] bg-[#EEF2EE]">
                  <app-image-with-fallback [src]="product.image" [alt]="product.name" className="h-full w-full object-cover" />
                  @if (product.featured) {
                    <span class="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#4C7C59] shadow-sm">
                      Destaque
                    </span>
                  }
                </div>
                <div class="p-5">
                  <div class="mb-2 flex items-start justify-between gap-3">
                    <h3 class="text-xl font-extrabold text-[#1F1F1F]">{{ product.name }}</h3>
                    <span class="whitespace-nowrap text-base font-extrabold text-[#4C7C59]">{{ currency(product.price) }}</span>
                  </div>
                  <p class="line-clamp-3 min-h-[60px] text-sm leading-relaxed text-[#5F5F5F]">{{ product.description }}</p>
                  <div class="mt-4 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-1">
                      @for (allergen of state.getAllergensByProductId(product.id).slice(0, 3); track allergen) {
                        <app-allergen-icon [type]="allergen" />
                      }
                    </div>
                    <span class="flex items-center gap-1 rounded-xl bg-[#E6F0EA] px-3 py-2 text-xs font-bold text-[#4C7C59]">
                      + Adicionar
                    </span>
                  </div>
                </div>
              </button>
            </article>
          } @empty {
            <div class="rounded-3xl border border-[#EEF2EE] bg-white p-10 text-center text-[#5F5F5F] md:col-span-2 lg:col-span-3">
              Nenhum item encontrado.
            </div>
          }
        </div>
      </section>

      @if (state.cartCount() > 0) {
        <div class="fixed bottom-5 left-0 right-0 z-40 px-5">
          <button
            type="button"
            (click)="goToCart()"
            class="mx-auto flex w-full max-w-xl items-center justify-between rounded-2xl bg-[#4C7C59] px-6 py-4 font-extrabold text-white shadow-2xl shadow-[#4C7C59]/30"
          >
            <span>{{ state.cartCount() }} item(ns)</span>
            <span>Ver carrinho · {{ currency(state.cartTotal()) }}</span>
          </button>
        </div>
      }
    </main>
  `,
})
export class MenuPageComponent {
  readonly state = inject(CustomerStateService);
  private readonly router = inject(Router);

  readonly search = signal('');
  readonly activeCategory = signal('all');
  readonly heroImage = FEATURED_HERO_IMAGE;
  readonly logoImage = LOGO_IMAGE;

  readonly todaySpecial = computed(() => this.state.todaySpecial());
  readonly filteredProducts = computed(() => {
    const search = this.search().trim().toLowerCase();
    const category = this.activeCategory();

    return this.state.products().filter((product) => {
      const matchesCategory = category === 'all' || product.category === category;
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search);

      return product.available && matchesCategory && matchesSearch;
    });
  });

  currency(value: number): string {
    return formatCurrency(value);
  }

  updateSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  addProduct(product: Product): void {
    this.state.addToCart(product);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }
}
