import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatus } from '../data-access/customer.models';

interface TimelineStep {
  status: OrderStatus;
  label: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-order-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline-container relative pl-0 py-2">
      <!-- Background Vertical Line -->
      <div class="absolute left-5 top-5 bottom-5 w-0.5" style="background: var(--border-light, #e2e8f0);"></div>
      <!-- Progress Line Overlay -->
      <div class="absolute left-5 top-5 w-0.5 transition-all duration-700" [style.background]="'var(--primary)'" [style.height]="progressHeight()"></div>

      @for (step of steps; track step.status; let i = $index) {
        <div class="relative flex items-start gap-4 mb-6 last:mb-0">
          <!-- Dot / Icon -->
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 transition-all duration-300"
            [style.background]="isPast(i) || currentStatus() === step.status ? step.color : 'var(--border)'"
            [style.border]="isFuture(i) ? '2px solid var(--border)' : '2px solid ' + step.color"
          >
            @switch (step.status) {
              @case ('received') {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" [attr.stroke]="isFuture(i) ? 'var(--muted-foreground)' : 'white'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
              }
              @case ('preparing') {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" [attr.stroke]="isFuture(i) ? 'var(--muted-foreground)' : 'white'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18V6a4 4 0 0 1 8 0v12"/><path d="M18 18V9a4 4 0 0 0-8 0v9"/><path d="M3 18h18a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1z"/><path d="M12 6V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3"/></svg>
              }
              @case ('ready') {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" [attr.stroke]="isFuture(i) ? 'var(--muted-foreground)' : 'white'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              }
              @case ('delivering') {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" [attr.stroke]="isFuture(i) ? 'var(--muted-foreground)' : 'white'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M15 13.5 16.5 16H20M15 13.5a1.5 1.5 0 1 1-3 0l-3-6H5M12 7.5l-3-3H6.5"/></svg>
              }
              @case ('delivered') {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" [attr.stroke]="isFuture(i) ? 'var(--muted-foreground)' : 'white'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              }
            }

            <!-- Pulsing ring overlay for active step -->
            @if (currentStatus() === step.status) {
              <div class="pulse-overlay" [style.border-color]="step.color"></div>
            }
          </div>

          <!-- Step Content -->
          <div class="flex-1 pt-1.5 min-w-0">
            <p 
              class="text-sm font-semibold leading-none"
              [style.color]="isFuture(i) ? 'var(--muted-foreground)' : 'var(--foreground)'"
              [style.font-weight]="currentStatus() === step.status ? '700' : '500'"
            >
              {{ step.label }}
            </p>
            <p 
              class="text-xs mt-1.5 leading-tight"
              [style.color]="isFuture(i) ? 'var(--border)' : 'var(--muted-foreground)'"
            >
              {{ step.description }}
            </p>
          </div>

          <!-- CheckCircle2 for past steps -->
          @if (isPast(i)) {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" [attr.stroke]="step.color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0 mt-2 z-10"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .pulse-overlay {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px solid currentColor;
      background: transparent;
      animation: pulse-ring 2s infinite;
    }
    @keyframes pulse-ring {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.35); opacity: 0; }
    }
  `]
})
export class OrderTimelineComponent {
  currentStatus = input.required<OrderStatus>();

  steps: TimelineStep[] = [
    { status: 'received', label: 'Pedido Recebido', description: 'Seu pedido foi confirmado', color: '#a855f7' },
    { status: 'preparing', label: 'Preparando', description: 'Nossa equipe está preparando seu pedido', color: '#d4745f' },
    { status: 'ready', label: 'Pronto para Entrega', description: 'Aguardando o motoboy', color: '#75B044' },
    { status: 'delivering', label: 'Saiu para Entrega', description: 'Seu pedido está a caminho!', color: '#2F80ED' },
    { status: 'delivered', label: 'Entregue', description: 'Bom apetite! 🥗', color: '#4CAF50' },
  ];

  statusIndex: Record<OrderStatus, number> = {
    received: 0,
    preparing: 1,
    ready: 2,
    delivering: 3,
    delivered: 4,
  };

  progressHeight = computed(() => {
    const idx = this.statusIndex[this.currentStatus()];
    if (idx === 0) return '0px';
    if (idx === 4) return 'calc(100% - 40px)';
    return `calc(${(idx / 4) * 100}% - 20px)`;
  });

  isPast(idx: number): boolean {
    return idx < this.statusIndex[this.currentStatus()];
  }

  isFuture(idx: number): boolean {
    return idx > this.statusIndex[this.currentStatus()];
  }
}


