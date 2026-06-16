import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../data-access/customer.models';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="category-filter">
      <button 
        [class.active]="!selectedCategory()"
        (click)="onSelect(null)"
      >
        Todos
      </button>
      @for (category of categories(); track category.id) {
        <button 
          [class.active]="selectedCategory() === category.id"
          (click)="onSelect(category.id)"
        >
          {{ category.name }}
        </button>
      }
    </div>
  `,
  styles: [`
    .category-filter { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; }
    button { padding: 8px 16px; border-radius: 20px; border: 1px solid #ccc; background: white; cursor: pointer; }
    button.active { background: #4C7C59; color: white; border-color: #4C7C59; }
  `]
})
export class CategoryFilterComponent {
  categories = input.required<Category[]>();
  selectedCategory = input<string | null>(null);
  selectCategory = output<string | null>();

  onSelect(categoryId: string | null) {
    this.selectCategory.emit(categoryId);
  }
}
