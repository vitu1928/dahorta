import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-coupon-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="coupon-input">
      <input 
        [(ngModel)]="code"
        placeholder="Código do cupom"
      />
      <button (click)="onApply()">Aplicar</button>
      @if (error()) {
        <p class="error">{{ error() }}</p>
      }
    </div>
  `,
  styles: [`
    .coupon-input { display: flex; gap: 8px; align-items: center; }
    .error { color: red; font-size: 12px; }
  `]
})
export class CouponInputComponent {
  code = signal('');
  error = signal('');
  apply = output<string>();

  onApply() {
    if (this.code()) {
      this.apply.emit(this.code());
      this.code.set('');
    }
  }

  setError(msg: string) {
    this.error.set(msg);
  }

  clearError() {
    this.error.set('');
  }
}
