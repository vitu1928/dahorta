import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OwnerService } from '../data-access/owner.service';
import { EmployeeService } from '../../employee/data-access/employee.service';

const DAYS = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

interface Schedule {
  open: boolean;
  from: string;
  to: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 space-y-6 text-foreground font-sans">
      
      <!-- ── HEADER ── -->
      <div class="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <p class="overline-label mb-2 text-[#E9C46A]" style="font-weight: 700; letter-spacing: 0.1em">Sistema</p>
          <h1 class="display-heading text-foreground text-3xl font-extrabold" style="font-family: 'Space Grotesk', sans-serif">Configurações</h1>
          <p class="text-muted-foreground text-xs mt-1">Informações e preferências do restaurante.</p>
        </div>
        
        <button 
          (click)="handleSave()"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white border-none cursor-pointer transition-all"
          [style.background]="saved() ? '#4CAF50' : 'var(--primary)'"
        >
          <svg *ngIf="!saved()" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          <svg *ngIf="saved()" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {{ saved() ? 'Salvo!' : 'Salvar' }}
        </button>
      </div>

      <!-- ── RESTAURANT OPEN/CLOSED STATUS ── -->
      <div class="rounded-2xl p-6 bg-card border border-border space-y-4">
        <h3 class="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <span class="text-primary font-black">■</span> Status do Restaurante
        </h3>
        
        <div class="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
          <div>
            <p class="text-xs font-bold text-foreground">Restaurante {{ restaurantOpen() ? 'Aberto' : 'Fechado' }}</p>
            <p class="text-[10px] text-muted-foreground mt-0.5">Controle a disponibilidade do seu restaurante para pedidos em tempo real.</p>
          </div>
          <button 
            (click)="toggleRestaurant()" 
            class="bg-transparent border-none cursor-pointer flex items-center"
            [style.color]="restaurantOpen() ? '#22c55e' : 'var(--border)'"
          >
            <svg *ngIf="restaurantOpen()" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="16" cy="12" r="4" fill="currentColor"/></svg>
            <svg *ngIf="!restaurantOpen()" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="4" fill="currentColor"/></svg>
          </button>
        </div>
      </div>

      <!-- ── PRICING INTELLIGENCE ── -->
      <div class="rounded-2xl p-6 bg-card border border-border space-y-4">
        <h3 class="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <span class="text-primary font-black">■</span> Inteligência de Precificação
        </h3>
        
        <div class="space-y-3.5 text-xs">
          <label class="text-muted-foreground font-bold">Período de Validade de Preços</label>
          <p class="text-[11px] text-muted-foreground leading-relaxed">
            Define por quantos dias um registro de preço é considerado válido para cálculo da ficha técnica. Registros mais antigos que este período serão ignorados para precificação de custos.
          </p>
          
          <div class="flex items-center gap-3 flex-wrap">
            <button
              *ngFor="let days of periodOptions"
              (click)="selectedPeriod.set(days)"
              class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold transition-all border"
              [style.background]="selectedPeriod() === days ? 'rgba(212,116,95,0.1)' : 'var(--muted)'"
              [style.borderColor]="selectedPeriod() === days ? 'rgba(212,116,95,0.4)' : 'var(--border)'"
              [style.color]="selectedPeriod() === days ? '#d4745f' : 'var(--foreground)'"
              style="cursor: pointer;"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              {{ days }} dias
            </button>

            <div class="relative">
              <input
                type="number"
                min="7"
                max="365"
                [ngModel]="selectedPeriod()"
                (ngModelChange)="selectedPeriod.set($event)"
                class="pl-4 pr-8 py-2 rounded-xl outline-none border font-bold text-xs bg-muted border-border text-foreground"
                style="width: 100px;"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">d</span>
            </div>
          </div>

          <div class="mt-4 p-3.5 rounded-xl bg-[#d4745f]/5 border border-[#d4745f]/15">
            <p class="text-[#d4745f] font-bold">✓ Configuração activa: {{ selectedPeriod() }} dias</p>
            <p class="text-[10px] text-muted-foreground mt-1">
              Registros de preços de insumos anteriores a {{ getCutoffDate() }} serão desconsiderados nos custos reais.
            </p>
          </div>
        </div>
      </div>

      <!-- ── BASIC DETAILS ── -->
      <div class="rounded-2xl p-6 bg-card border border-border space-y-4">
        <h3 class="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <span class="text-primary font-black">■</span> Informações do Restaurante
        </h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <div class="space-y-1">
            <label class="text-muted-foreground">Nome</label>
            <input [(ngModel)]="restaurantInfo.name" class="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-foreground" />
          </div>
          <div class="space-y-1">
            <label class="text-muted-foreground">Slogan</label>
            <input [(ngModel)]="restaurantInfo.tagline" class="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-foreground" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <div class="space-y-1">
            <label class="text-muted-foreground">Telefone</label>
            <input [(ngModel)]="restaurantInfo.phone" class="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-foreground" />
          </div>
          <div class="space-y-1">
            <label class="text-muted-foreground">E-mail</label>
            <input type="email" [(ngModel)]="restaurantInfo.email" class="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-foreground" />
          </div>
        </div>

        <div class="space-y-1 text-xs font-semibold">
          <label class="text-muted-foreground">Endereço</label>
          <input [(ngModel)]="restaurantInfo.address" class="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-foreground" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <div class="space-y-1">
            <label class="text-muted-foreground">Instagram</label>
            <input [(ngModel)]="restaurantInfo.instagram" class="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-foreground" />
          </div>
          <div class="space-y-1">
            <label class="text-muted-foreground">Website</label>
            <input [(ngModel)]="restaurantInfo.website" class="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-foreground" />
          </div>
        </div>
      </div>

      <!-- ── DELIVERY CONFIG ── -->
      <div class="rounded-2xl p-6 bg-card border border-border space-y-4">
        <h3 class="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <span class="text-primary font-black">■</span> Configurações de Entrega
        </h3>
        
        <div class="grid grid-cols-3 gap-4 text-xs font-semibold">
          <div class="space-y-1">
            <label class="text-muted-foreground">Taxa de Entrega (R$)</label>
            <input type="number" step="0.01" [(ngModel)]="restaurantInfo.deliveryFee" class="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-foreground font-bold" />
          </div>
          <div class="space-y-1">
            <label class="text-muted-foreground">Tempo Estimado (min)</label>
            <input [(ngModel)]="restaurantInfo.deliveryTime" class="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-foreground" />
          </div>
          <div class="space-y-1">
            <label class="text-muted-foreground">Pedido Mínimo (R$)</label>
            <input type="number" step="0.01" [(ngModel)]="restaurantInfo.minOrder" class="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-foreground font-bold" />
          </div>
        </div>
      </div>

      <!-- ── OPERATION HOURS ── -->
      <div class="rounded-2xl p-6 bg-card border border-border space-y-4">
        <h3 class="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <span class="text-primary font-black">■</span> Horário de Funcionamento
        </h3>
        
        <div class="space-y-3.5">
          <div 
            *ngFor="let day of weekDays" 
            class="flex items-center gap-4 text-xs"
          >
            <button 
              (click)="schedule[day].open = !schedule[day].open"
              class="bg-transparent border-none cursor-pointer flex items-center flex-shrink-0"
              [style.color]="schedule[day].open ? '#22c55e' : 'var(--border)'"
            >
              <svg *ngIf="schedule[day].open" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="16" cy="12" r="4" fill="currentColor"/></svg>
              <svg *ngIf="!schedule[day].open" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="4" fill="currentColor"/></svg>
            </button>

            <span class="w-24 font-bold text-foreground flex-shrink-0">{{ day }}</span>

            <div *ngIf="schedule[day].open; else closedText" class="flex items-center gap-2 flex-1">
              <input 
                type="time" 
                [(ngModel)]="schedule[day].from"
                class="px-3 py-1.5 rounded-lg outline-none text-xs font-semibold text-foreground bg-muted border border-border" 
              />
              <span class="text-muted-foreground">até</span>
              <input 
                type="time" 
                [(ngModel)]="schedule[day].to"
                class="px-3 py-1.5 rounded-lg outline-none text-xs font-semibold text-foreground bg-muted border border-border" 
              />
            </div>
            
            <ng-template #closedText>
              <span class="text-muted-foreground italic flex-1">Fechado</span>
            </ng-template>
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
export class SettingsComponent {
  private ownerService = inject(OwnerService);
  private employeeService = inject(EmployeeService);

  readonly restaurantOpen = this.employeeService.restaurantOpen;
  readonly pricePeriodDays = this.ownerService.pricePeriodDays;
  readonly restaurantInfoSignal = this.ownerService.restaurantInfo;

  readonly saved = signal(false);
  readonly selectedPeriod = signal(60);

  readonly periodOptions = [30, 60, 90, 120];
  readonly weekDays = DAYS;

  restaurantInfo = {
    name: "DaHorta",
    tagline: "Bowls orgânicos, sabor natural.",
    phone: "(11) 99999-0001",
    whatsapp: "(11) 99999-0001",
    email: "contato@dahorta.com",
    address: "Rua dos Orgânicos, 42",
    city: "São Paulo, SP",
    deliveryFee: 6.00,
    deliveryTime: "35-50",
    minOrder: 20.00,
    instagram: "@dahorta",
    website: "dahorta.com",
    priceValidityDays: 60,
  };

  schedule: Record<string, Schedule> = {
    "Segunda-feira": { open: true, from: "11:00", to: "23:00" },
    "Terça-feira": { open: true, from: "11:00", to: "23:00" },
    "Quarta-feira": { open: true, from: "11:00", to: "23:00" },
    "Quinta-feira": { open: true, from: "11:00", to: "23:00" },
    "Sexta-feira": { open: true, from: "11:00", to: "00:00" },
    "Sábado": { open: true, from: "11:00", to: "00:00" },
    "Domingo": { open: true, from: "11:00", to: "22:00" },
  };

  constructor() {
    effect(() => {
      this.selectedPeriod.set(this.pricePeriodDays());
      const info = this.restaurantInfoSignal();
      if (info) {
        this.restaurantInfo = { ...info };
      }
    }, { allowSignalWrites: true });
  }

  toggleRestaurant() {
    this.employeeService.toggleRestaurantOpen();
  }

  getCutoffDate(): string {
    const cutoff = new Date(Date.now() - this.selectedPeriod() * 24 * 60 * 60 * 1000);
    return cutoff.toLocaleDateString('pt-BR');
  }

  handleSave() {
    const info = {
      ...this.restaurantInfo,
      priceValidityDays: this.selectedPeriod()
    };
    this.restaurantInfo = info;
    this.ownerService.pricePeriodDays.set(info.priceValidityDays);
    this.ownerService.updateRestaurantInfo(info);
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }
}
