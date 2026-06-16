import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../data-access/customer.models';
import { AllergenIconComponent } from './allergen-icon.component';


@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, AllergenIconComponent],
  template: `
    <div 
      class="bg-card rounded-2xl overflow-hidden border border-border flex items-center p-3 gap-4 cursor-pointer relative group transition-all hover:-translate-y-1 hover:shadow-md"
      (click)="onSelect()"
    >
      <div class="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
        <img [src]="product().image" [alt]="product().name" class="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-300" />
        @if (isSpecial()) {
          <div class="absolute top-1 left-1 text-[9px] font-black px-1.5 py-0.5 rounded text-white uppercase tracking-tight shadow-sm z-10" style="background-color: var(--accent, #F4A261);">
            Destaque
          </div>
        }
      </div>

      <div class="flex-1 min-w-0 pr-8">
        <div class="flex justify-between items-start mb-0.5">
          <h3 class="font-bold text-base text-text-primary truncate">{{ product().name }}</h3>
        </div>
        <p class="text-[11px] text-muted-foreground line-clamp-2 mb-2 leading-tight">
          {{ product().description }}
        </p>
        
        <div class="flex items-center gap-2 mb-2">
          @for (allergen of allergens(); track allergen) {
            <app-allergen-icon [type]="allergen"></app-allergen-icon>
          }
        </div>

        <div class="flex items-center justify-between mt-3">
          <span class="font-black text-primary text-sm">
            R$ {{ product().price.toFixed(2) }}
          </span>
          <div class="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground/50">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>{{ product().prepTime }} min</span>
          </div>
        </div>
      </div>

      @if (quantity() > 0) {
        <div class="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shadow-lg border-2 border-white">
          {{ quantity() }}
        </div>
      }

      <div class="absolute right-4 bottom-4 w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center transition-all">
        <span class="font-bold text-lg leading-none">+</span>
      </div>
    </div>
  `
})
export class ProductCardComponent {
  product = input.required<Product>();
  quantity = input<number>(0);
  isSpecial = input<boolean>(false);
  select = output<Product>();

  allergens = computed(() => {
    return (this.product().allergens ?? []).slice(0, 3);
  });

  onSelect() {
    this.select.emit(this.product());
  }
}

