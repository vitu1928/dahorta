import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../data-access/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      @for (toast of toasts(); track toast.id) {
        <div 
          class="flex items-center gap-3 p-4 rounded-xl shadow-lg border pointer-events-auto toast-card animate-toast-in"
          [ngClass]="{
            'bg-green-50 border-green-200 text-green-800': toast.type === 'success',
            'bg-red-50 border-red-200 text-red-800': toast.type === 'error',
            'bg-blue-50 border-blue-200 text-blue-800': toast.type === 'info'
          }"
        >
          <!-- Icons -->
          @switch (toast.type) {
            @case ('success') {
              <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            }
            @case ('error') {
              <svg class="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            }
            @case ('info') {
              <svg class="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            }
          }
          <div class="text-sm font-semibold flex-1">{{ toast.message }}</div>
          <button 
            (click)="remove(toast.id)"
            class="text-current opacity-60 hover:opacity-100 bg-transparent border-none cursor-pointer p-0.5 flex items-center justify-center"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-card {
      transition: all 0.2s ease-in-out;
      backdrop-filter: blur(8px);
    }
    .animate-toast-in {
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-12px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `]
})
export class ToastComponent {
  private toastService = inject(ToastService);
  toasts = this.toastService.toasts;

  remove(id: string) {
    this.toastService.remove(id);
  }
}
