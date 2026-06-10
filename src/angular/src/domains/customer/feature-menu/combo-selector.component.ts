import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComboSlot } from '../data-access/customer.models';

@Component({
  selector: 'app-combo-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="combo-selector">
      <p class="title">Escolha seus itens:</p>

      <!-- Carousel de Slots -->
      <div class="slots-carousel">
        @for (slot of slots(); track slot.id; let idx = $index) {
          <button
            [class.active]="activeSlot() === idx"
            (click)="activeSlot.set(idx)"
            class="slot-button"
          >
            {{ slot.name }}
          </button>
        }
      </div>

      <!-- Grid de Opções -->
      @if (activeSlotData(); as slot) {
        <div class="options-grid">
          <p>Opções para {{ slot.name }}:</p>
          <div class="grid">
            @for (productId of slot.products; track productId) {
              <button
                [class.selected]="selections()[slot.id] === productId"
                (click)="selectProduct(slot.id, productId)"
                class="option-btn"
              >
                {{ productId }}
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .combo-selector { margin-top: 20px; border-top: 1px solid #ccc; padding-top: 20px; }
    .slots-carousel { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px; }
    .slot-button { padding: 8px 16px; border-radius: 20px; border: 1px solid #ccc; background: white; cursor: pointer; }
    .slot-button.active { background: #4C7C59; color: white; border-color: #4C7C59; }
    .options-grid { margin-top: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; margin-top: 10px; }
    .option-btn { padding: 10px; border-radius: 8px; border: 1px solid #ccc; background: white; cursor: pointer; }
    .option-btn.selected { border-color: #4C7C59; background: #E6F0EA; font-weight: bold; }
  `]
})
export class ComboSelectorComponent {
  slots = input.required<ComboSlot[]>();
  selections = input.required<Record<string, string>>();
  selectionsChange = output<Record<string, string>>();

  activeSlot = signal(0);

  activeSlotData = computed(() => {
    return this.slots()[this.activeSlot()];
  });

  selectProduct(slotId: string, productId: string) {
    const newSelections = { ...this.selections(), [slotId]: productId };
    this.selectionsChange.emit(newSelections);
  }
}
