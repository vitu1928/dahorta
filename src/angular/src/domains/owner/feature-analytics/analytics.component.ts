import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OwnerService } from '../data-access/owner.service';
import { OrdersService } from '../../customer/data-access/orders.service';
import { ReviewsService } from '../../customer/data-access/reviews.service';
import { EmployeeService } from '../../employee/data-access/employee.service';
import { ProductsService } from '../../customer/data-access/products.service';

type Tab = 'overview' | 'costs' | 'ratings';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 space-y-6 text-foreground bg-background font-sans">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="overline-label mb-2 text-[#E9C46A]">Inteligência de dados</p>
          <h1 class="display-heading text-foreground text-3xl font-extrabold" style="font-family: 'Space Grotesk', sans-serif">Analytics</h1>
        </div>
        <div class="flex items-center flex-wrap gap-3">
          <button
            (click)="handleExport()"
            class="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted/80 cursor-pointer font-semibold text-xs transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            CSV
          </button>
          
          <div class="flex p-1 rounded-xl gap-1 bg-card border border-border">
            <button 
              *ngFor="let tab of tabs" 
              (click)="activeTab.set(tab.id)"
              class="px-4 py-1.5 rounded-lg text-xs transition-all font-semibold"
              [style.background]="activeTab() === tab.id ? 'var(--primary)' : 'transparent'"
              [style.color]="activeTab() === tab.id ? 'white' : 'var(--muted-foreground)'"
              style="border: none; cursor: pointer;"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border">
            <span style="font-size: 12px; font-weight: 600;" [style.color]="restaurantOpen() ? '#4CAF50' : '#D64545'">
              {{ restaurantOpen() ? 'Aberto' : 'Fechado' }}
            </span>
            <button 
              (click)="toggleRestaurant()" 
              style="background: none; border: none; cursor: pointer; padding: 0;"
              [style.color]="restaurantOpen() ? '#4CAF50' : '#D64545'"
              class="flex items-center"
            >
              <svg *ngIf="restaurantOpen()" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="16" cy="12" r="4" fill="currentColor"/></svg>
              <svg *ngIf="!restaurantOpen()" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="4" fill="currentColor"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- ── OVERVIEW TAB ── -->
      <div *ngIf="activeTab() === 'overview'" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="metric-card" [style.background]="cardStyle.background" [style.border]="cardStyle.border">
            <div class="flex items-start justify-between mb-4">
              <div class="icon-wrap bg-[#d4745f]/15 text-[#d4745f]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <span class="change-tag bg-[#4CAF50]/10 text-[#4CAF50]">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                12.5%
              </span>
            </div>
            <div class="metric-val">{{ formatCurrency(totalFaturamento()) }}</div>
            <div class="metric-label">Total Faturado</div>
          </div>

          <div class="metric-card" [style.background]="cardStyle.background" [style.border]="cardStyle.border">
            <div class="flex items-start justify-between mb-4">
              <div class="icon-wrap bg-[#75B044]/15 text-[#75B044]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <span class="change-tag bg-[#4CAF50]/10 text-[#4CAF50]">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                8.2%
              </span>
            </div>
            <div class="metric-val">{{ todayOrders().length || orders().length }}</div>
            <div class="metric-label">Pedidos Hoje</div>
          </div>

          <div class="metric-card" [style.background]="cardStyle.background" [style.border]="cardStyle.border">
            <div class="flex items-start justify-between mb-4">
              <div class="icon-wrap bg-[#4CAF50]/15 text-[#4CAF50]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
              </div>
              <span class="change-tag bg-[#4CAF50]/10 text-[#4CAF50]">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                5.7%
              </span>
            </div>
            <div class="metric-val">{{ formatCurrency(ticketMedio()) }}</div>
            <div class="metric-label">Ticket Médio</div>
          </div>
        </div>

        <!-- Sales Chart -->
        <div class="rounded-2xl p-6 text-white" [style.background]="cardStyle.background" [style.border]="cardStyle.border">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-sm font-bold text-white tracking-wide" style="font-family: 'Space Grotesk', sans-serif">Faturamento por Período</h3>
            <div class="flex gap-1 p-1 rounded-lg" style="background: #152415;">
              <button 
                (click)="salesPeriod.set('week')"
                class="px-3 py-1 rounded-md text-[10px] font-bold transition-all border-none cursor-pointer"
                [style.background]="salesPeriod() === 'week' ? '#d4745f' : 'transparent'"
                [style.color]="salesPeriod() === 'week' ? 'white' : '#9da89a'"
              >
                Semana
              </button>
              <button 
                (click)="salesPeriod.set('month')"
                class="px-3 py-1 rounded-md text-[10px] font-bold transition-all border-none cursor-pointer"
                [style.background]="salesPeriod() === 'month' ? '#d4745f' : 'transparent'"
                [style.color]="salesPeriod() === 'month' ? 'white' : '#9da89a'"
              >
                Meses
              </button>
            </div>
          </div>

          <!-- Custom SVG Area Chart -->
          <div class="relative w-full h-56 pt-2">
            <svg class="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#d4745f" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#d4745f" stop-opacity="0"/>
                </linearGradient>
                <linearGradient id="areaGradMonthly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#d4745f" stop-opacity="0.15"/>
                  <stop offset="100%" stop-color="#d4745f" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <!-- Grid lines -->
              <line x1="0" y1="45" x2="500" y2="45" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
              <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
              <line x1="0" y1="135" x2="500" y2="135" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>

              <!-- Weekly Chart Path -->
              <g *ngIf="salesPeriod() === 'week'">
                <path [attr.d]="weeklyChartPath().area" fill="url(#areaGrad)"/>
                <path [attr.d]="weeklyChartPath().line" fill="none" stroke="#d4745f" stroke-width="2.5"/>
              </g>

              <!-- Monthly Chart Path -->
              <g *ngIf="salesPeriod() === 'month'">
                <path [attr.d]="monthlyChartPaths().fatArea" fill="url(#areaGradMonthly)"/>
                <path [attr.d]="monthlyChartPaths().fatLine" fill="none" stroke="#d4745f" stroke-width="2.5"/>
                <path [attr.d]="monthlyChartPaths().lucLine" fill="none" stroke="#4CAF50" stroke-width="2" stroke-dasharray="4,4"/>
              </g>
            </svg>
            
            <!-- X Axis Labels -->
            <div class="flex justify-between text-[10px] text-white/40 mt-2 font-bold px-1" *ngIf="salesPeriod() === 'week'">
              <span *ngFor="let item of salesData">
                {{ item.day }}
              </span>
            </div>
            <div class="flex justify-between text-[10px] text-white/40 mt-2 font-bold px-1" *ngIf="salesPeriod() === 'month'">
              <span *ngFor="let item of monthlyData">
                {{ item.month }}
              </span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Weekly Orders Bar Chart -->
          <div class="rounded-2xl p-6 text-white" [style.background]="cardStyle.background" [style.border]="cardStyle.border">
            <h3 class="text-sm font-bold text-white tracking-wide mb-6" style="font-family: 'Space Grotesk', sans-serif">Pedidos por Dia da Semana</h3>
            <div class="flex items-end justify-between h-44 pt-2">
              <div *ngFor="let item of salesData" class="flex flex-col items-center flex-1 h-full justify-end group relative">
                <!-- Hover value label -->
                <div class="opacity-0 group-hover:opacity-100 absolute -top-6 bg-[#152415] border border-white/10 text-[9px] text-white font-bold py-0.5 px-1.5 rounded transition-all pointer-events-none whitespace-nowrap z-10">
                  {{ item.vendas }} ped.
                </div>
                <!-- Bar -->
                <div 
                  [style.height.px]="getBarHeight(item.vendas)"
                  class="w-7 rounded-t-md transition-all duration-300 hover:brightness-110"
                  style="background: #d4745f;"
                ></div>
                <span class="text-[10px] text-white/40 mt-2.5 font-bold">{{ item.day }}</span>
              </div>
            </div>
          </div>

          <!-- Top Products -->
          <div class="rounded-2xl p-6 text-white" [style.background]="cardStyle.background" [style.border]="cardStyle.border">
            <h3 class="text-sm font-bold text-white tracking-wide mb-6" style="font-family: 'Space Grotesk', sans-serif">Produtos Mais Vendidos</h3>
            <div class="space-y-4.5">
              <div *ngFor="let item of topProducts; let i = index">
                <div class="flex items-center justify-between mb-1.5 text-xs font-semibold">
                  <div class="flex items-center gap-2">
                    <span class="text-white/30 font-black">#{{ i + 1 }}</span>
                    <span class="text-white/80">{{ item.name }}</span>
                  </div>
                  <span class="text-white font-bold">{{ item.pedidos }} pedidos</span>
                </div>
                <div class="h-1.5 rounded-full bg-[#152415]">
                  <div 
                    class="h-full rounded-full transition-all duration-1000" 
                    [style.width.%]="(item.pedidos / topProducts[0].pedidos) * 100" 
                    [style.background]="item.color"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── COSTS TAB ── -->
      <div *ngIf="activeTab() === 'costs'" class="space-y-6">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="metric-card" [style.background]="cardStyle.background" [style.border]="cardStyle.border">
            <div class="flex items-start justify-between mb-3">
              <div class="icon-wrap bg-[#d4745f]/15 text-[#d4745f]">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <span class="change-tag bg-[#4CAF50]/10 text-[#4CAF50]">-3.2%</span>
            </div>
            <div class="metric-val text-xl">{{ formatCurrency(avgCost) }}</div>
            <div class="metric-label">Custo Médio/Produto</div>
          </div>

          <div class="metric-card" [style.background]="cardStyle.background" [style.border]="cardStyle.border">
            <div class="flex items-start justify-between mb-3">
              <div class="icon-wrap bg-[#75B044]/15 text-[#75B044]">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <span class="change-tag bg-[#4CAF50]/10 text-[#4CAF50]">+11.4%</span>
            </div>
            <div class="metric-val text-xl">{{ formatCurrency(totalFaturamentoProducts) }}</div>
            <div class="metric-label">Faturamento Total</div>
          </div>

          <div class="metric-card" [style.background]="cardStyle.background" [style.border]="cardStyle.border">
            <div class="flex items-start justify-between mb-3">
              <div class="icon-wrap bg-[#4CAF50]/15 text-[#4CAF50]">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
              <span class="change-tag bg-[#4CAF50]/10 text-[#4CAF50]">+8.9%</span>
            </div>
            <div class="metric-val text-xl">{{ formatCurrency(totalLucro) }}</div>
            <div class="metric-label">Lucro Estimado</div>
          </div>

          <div class="metric-card" [style.background]="cardStyle.background" [style.border]="cardStyle.border">
            <div class="flex items-start justify-between mb-3">
              <div class="icon-wrap bg-[#a855f7]/15 text-[#a855f7]">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <span class="change-tag bg-[#4CAF50]/10 text-[#4CAF50]">+2.1%</span>
            </div>
            <div class="metric-val text-xl">{{ (totalLucro / totalFaturamentoProducts * 100).toFixed(1) }}%</div>
            <div class="metric-label">Margem Média</div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="rounded-2xl p-5 text-white" style="background: #1b2e1b; border: 1px solid rgba(76,175,80,0.2)">
            <div class="flex items-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
              <span style="color: #4CAF50; font-size: 13px; font-weight: 700;">Produto Mais Lucrativo</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">{{ bestProduct.name }}</h3>
            <div class="flex gap-6 mt-3">
              <div><p class="text-[10px] text-white/50 font-bold uppercase mb-0.5">Margem</p><p style="color: #4CAF50; font-size: 16px; font-weight: 800;">{{ bestProduct.margem.toFixed(1) }}%</p></div>
              <div><p class="text-[10px] text-white/50 font-bold uppercase mb-0.5">Preço</p><p class="text-sm font-bold text-white">{{ formatCurrency(bestProduct.preco) }}</p></div>
              <div><p class="text-[10px] text-white/50 font-bold uppercase mb-0.5">Custo</p><p class="text-sm font-bold text-[#d4745f]">{{ formatCurrency(bestProduct.custo) }}</p></div>
            </div>
          </div>

          <div class="rounded-2xl p-5 text-white" style="background: #1b2e1b; border: 1px solid rgba(230,57,70,0.2)">
            <div class="flex items-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D64545" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span style="color: #D64545; font-size: 13px; font-weight: 700;">Produto Menos Lucrativo</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">{{ worstProduct.name }}</h3>
            <div class="flex gap-6 mt-3">
              <div><p class="text-[10px] text-white/50 font-bold uppercase mb-0.5">Margem</p><p style="color: #D64545; font-size: 16px; font-weight: 800;">{{ worstProduct.margem.toFixed(1) }}%</p></div>
              <div><p class="text-[10px] text-white/50 font-bold uppercase mb-0.5">Preço</p><p class="text-sm font-bold text-white">{{ formatCurrency(worstProduct.preco) }}</p></div>
              <div><p class="text-[10px] text-white/50 font-bold uppercase mb-0.5">Custo</p><p class="text-sm font-bold text-[#d4745f]">{{ formatCurrency(worstProduct.custo) }}</p></div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl p-6 text-white" [style.background]="cardStyle.background" [style.border]="cardStyle.border">
          <h3 class="text-sm font-bold text-white tracking-wide mb-6" style="font-family: 'Space Grotesk', sans-serif">Margem Real por Produto</h3>
          <div class="space-y-4">
            <div *ngFor="let item of productCostsSorted">
              <div class="flex items-center justify-between mb-1 text-xs">
                <span class="text-white/80 font-semibold">{{ item.name }}</span>
                <div class="flex items-center gap-3">
                  <span class="text-white/40">Custo: {{ formatCurrency(item.custo) }}</span>
                  <span class="font-bold" [style.color]="item.margem >= 50 ? '#4CAF50' : item.margem >= 35 ? '#F4A261' : '#D64545'">
                    {{ item.margem.toFixed(1) }}%
                  </span>
                </div>
              </div>
              <div class="h-2 rounded-full bg-[#152415]">
                <div 
                  class="h-full rounded-full transition-all duration-800" 
                  [style.width.%]="item.margem"
                  [style.background]="item.margem >= 50 ? '#4CAF50' : item.margem >= 35 ? '#F4A261' : '#D64545'"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Insumo Price Trend Chart -->
        <div class="rounded-2xl p-6 text-white" [style.background]="cardStyle.background" [style.border]="cardStyle.border">
          <h3 class="text-sm font-bold text-white tracking-wide mb-6" style="font-family: 'Space Grotesk', sans-serif">Variação de Preço de Insumos</h3>
          <div class="relative w-full h-52 pt-2">
            <svg class="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="45" x2="500" y2="45" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
              <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
              <line x1="0" y1="135" x2="500" y2="135" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>

              <path [attr.d]="priceTrendPaths().proteinas" fill="none" stroke="#D64545" stroke-width="2"/>
              <path [attr.d]="priceTrendPaths().graos" fill="none" stroke="#d4745f" stroke-width="2"/>
              <path [attr.d]="priceTrendPaths().hortifruti" fill="none" stroke="#75B044" stroke-width="2"/>
            </svg>
            <div class="flex justify-between text-[10px] text-white/40 mt-2 font-bold px-1">
              <span *ngFor="let d of insumoTrend">{{ d.month }}</span>
            </div>
            <!-- Legend -->
            <div class="flex justify-center gap-6 mt-4 text-[10px] font-bold text-white/60">
              <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-[#D64545]"></div>Proteínas (/g)</div>
              <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-[#d4745f]"></div>Grãos (/g)</div>
              <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-[#75B044]"></div>Hortifruti (/folha)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── RATINGS TAB ── -->
      <div *ngIf="activeTab() === 'ratings'" class="space-y-6">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="metric-card" [style.background]="cardStyle.background" [style.border]="cardStyle.border">
            <div class="flex items-center gap-1 text-[#F4A261] mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span class="text-[10px] text-[#9da89a] font-bold uppercase">Nota Média Geral</span>
            </div>
            <div class="metric-val">{{ avgRating().toFixed(1) }}</div>
            <div class="flex gap-0.5 mt-2">
              <span *ngFor="let s of [1,2,3,4,5]">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                  [attr.fill]="s <= Math.round(avgRating()) ? '#F4A261' : 'none'" 
                  [attr.stroke]="s <= Math.round(avgRating()) ? '#F4A261' : '#3a4e35'"
                  stroke-width="2"
                ><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </span>
            </div>
          </div>

          <div class="metric-card" [style.background]="cardStyle.background" [style.border]="cardStyle.border">
            <div class="flex items-center gap-1 text-[#4CAF50] mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span class="text-[10px] text-[#9da89a] font-bold uppercase">Avaliações 5★</span>
            </div>
            <div class="metric-val text-[#4CAF50]">{{ countStars(5) }}</div>
            <div class="text-[10px] text-white/40 font-bold mt-1.5">{{ reviews().length ? ((countStars(5)/reviews().length)*100).toFixed(0) : 0 }}% do total</div>
          </div>

          <div class="metric-card" [style.background]="cardStyle.background" [style.border]="cardStyle.border">
            <div class="flex items-center gap-1 text-[#D64545] mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span class="text-[10px] text-[#9da89a] font-bold uppercase">Críticas (≤3★)</span>
            </div>
            <div class="metric-val text-[#D64545]">{{ countLowStars() }}</div>
            <div class="text-[10px] text-white/40 font-bold mt-1.5">Requerem atenção</div>
          </div>

          <div class="metric-card" [style.background]="cardStyle.background" [style.border]="cardStyle.border">
            <div class="flex items-center gap-1 text-[#75B044] mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span class="text-[10px] text-[#9da89a] font-bold uppercase">Total Geral</span>
            </div>
            <div class="metric-val text-[#75B044]">{{ reviews().length }}</div>
            <div class="text-[10px] text-white/40 font-bold mt-1.5">Média calculada</div>
          </div>
        </div>

        <div class="rounded-2xl p-6 text-white" [style.background]="cardStyle.background" [style.border]="cardStyle.border">
          <h3 class="text-sm font-bold text-white tracking-wide mb-6" style="font-family: 'Space Grotesk', sans-serif">Distribuição de Estrelas</h3>
          <div class="space-y-3">
            <div *ngFor="let star of [5,4,3,2,1]" class="flex items-center gap-3">
              <div class="flex items-center gap-1 w-12 flex-shrink-0 text-xs font-bold text-white/70">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#F4A261" stroke="#F4A261"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span>{{ star }}</span>
              </div>
              <div class="flex-1 h-2.5 rounded-full bg-[#152415] overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-600" 
                  [style.width.%]="reviews().length ? (countStars(star)/reviews().length)*100 : 0" 
                  [style.background]="star >= 4 ? '#4CAF50' : star === 3 ? '#F4A261' : '#D64545'"
                ></div>
              </div>
              <span class="text-[10px] text-[#9da89a] font-bold w-8 text-right">{{ countStars(star) }}</span>
            </div>
          </div>
        </div>

        <!-- Comments -->
        <div class="rounded-2xl overflow-hidden text-white" [style.background]="cardStyle.background" [style.border]="cardStyle.border">
          <div class="px-5 py-4 border-b border-white/5 bg-white/2">
            <h3 class="text-sm font-bold text-white tracking-wide" style="font-family: 'Space Grotesk', sans-serif">Comentários Recentes</h3>
          </div>
          <div class="divide-y divide-white/5">
            <div *ngFor="let r of reviews()" class="px-5 py-4 hover:bg-white/2 transition-colors">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-[#3a4e35] text-[#d4745f]">
                    {{ getInitials(r.customerName) }}
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-white leading-tight">{{ r.customerName }}</p>
                    <p class="text-[9px] text-[#9da89a] mt-0.5">{{ r.orderId }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex gap-0.5">
                    <span *ngFor="let s of [1,2,3,4,5]">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
                        [attr.fill]="s <= r.stars ? '#F4A261' : 'none'" 
                        [attr.stroke]="s <= r.stars ? '#F4A261' : '#3a4e35'"
                      ><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </span>
                  </div>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-black" [style.background]="getStarBg(r.stars)" [style.color]="getStarColor(r.stars)">
                    {{ r.stars }}★
                  </span>
                </div>
              </div>
              <p *ngIf="r.comment" class="text-xs text-white/60 leading-relaxed pl-11">{{ r.comment }}</p>
            </div>
            <div *ngIf="reviews().length === 0" class="py-10 text-center">
              <p class="text-xs text-white/40">Nenhuma avaliação cadastrada ainda</p>
            </div>
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
    .metric-card {
      padding: 20px;
      border-radius: 16px;
      position: relative;
      overflow: hidden;
      color: white;
    }
    .metric-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--primary) 50%, transparent);
    }
    .icon-wrap {
      width: 36px; height: 36px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .change-tag {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .metric-val {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-top: 12px;
      font-family: 'Space Grotesk', sans-serif;
    }
    .metric-label {
      font-size: 11px;
      color: #9da89a;
      margin-top: 4px;
      font-weight: 500;
    }
  `]
})
export class AnalyticsComponent {
  readonly Math = Math;
  private ownerService = inject(OwnerService);
  private ordersService = inject(OrdersService);
  private reviewsService = inject(ReviewsService);
  private employeeService = inject(EmployeeService);
  private productsService = inject(ProductsService);

  readonly activeTab = signal<Tab>('overview');
  readonly salesPeriod = signal<'week' | 'month'>('week');

  // Global Signals
  readonly orders = this.ordersService.orders;
  readonly reviews = this.reviewsService.reviews;
  readonly restaurantOpen = this.employeeService.restaurantOpen;

  readonly tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'costs', label: 'Custos & Margens' },
    { id: 'ratings', label: 'Avaliações' }
  ];

  readonly cardStyle = {
    background: '#1b2e1b',
    border: '1px solid rgba(255,255,255,0.06)',
    color: 'white'
  };

  // 1. Weekly Sales grouped by Day of the Week (Seg-Dom) for the last 7 days
  private readonly _salesData = computed(() => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const data = days.map(day => ({ day, vendas: 0, faturamento: 0 }));
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    this.orders().forEach(o => {
      const date = new Date(o.createdAt);
      if (date >= oneWeekAgo) {
        const jsDay = date.getDay();
        const index = (jsDay + 6) % 7; // Convert 0=Sun, 1=Mon... to 0=Mon, 1=Tue...
        data[index].vendas++;
        data[index].faturamento += o.total || o.totalAmount || 0;
      }
    });
    return data;
  });
  get salesData() { return this._salesData(); }

  // 2. Ranking of Top 5 most ordered products
  private readonly _topProducts = computed(() => {
    const counts: Record<string, { name: string; pedidos: number }> = {};
    this.orders().forEach(o => {
      o.items.forEach((item: any) => {
        if (!counts[item.productId]) {
          counts[item.productId] = { name: item.name, pedidos: 0 };
        }
        counts[item.productId].pedidos += item.quantity || 1;
      });
    });

    const colors = ['#4C7C59', '#7FA652', '#E9C46A', '#F4A261', '#E76F51', '#3A4E35', '#D4745F'];

    const sorted = Object.values(counts)
      .sort((a, b) => b.pedidos - a.pedidos)
      .slice(0, 5)
      .map((item, index) => ({
        name: item.name,
        pedidos: item.pedidos,
        color: colors[index % colors.length]
      }));

    if (sorted.length === 0) {
      return [{ name: 'Nenhum pedido', pedidos: 0, color: '#4C7C59' }];
    }
    return sorted;
  });
  get topProducts() { return this._topProducts(); }

  // 3. Monthly Sales and estimated profit for the last 6 months
  private readonly _monthlyData = computed(() => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const data: Record<string, { month: string; faturamento: number; lucro: number; orderCount: number; monthNum: number; year: number }> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mNum = d.getMonth();
      const yr = d.getFullYear();
      const key = `${yr}-${mNum}`;
      data[key] = {
        month: monthNames[mNum],
        faturamento: 0,
        lucro: 0,
        orderCount: 0,
        monthNum: mNum,
        year: yr
      };
    }

    const sheets = this.ownerService.technicalSheets();

    this.orders().forEach(o => {
      const date = new Date(o.createdAt);
      const mNum = date.getMonth();
      const yr = date.getFullYear();
      const key = `${yr}-${mNum}`;

      if (data[key]) {
        const orderTotal = o.total || o.totalAmount || 0;
        data[key].faturamento += orderTotal;
        data[key].orderCount++;

        let orderCost = 0;
        o.items.forEach((item: any) => {
          const sheet = sheets.find(s => s.productId === item.productId);
          const itemCost = sheet ? this.ownerService.calculateSheetCost(sheet) : item.price * 0.4;
          orderCost += itemCost * item.quantity;
        });

        data[key].lucro += Math.max(0, orderTotal - orderCost);
      }
    });

    return Object.values(data)
      .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.monthNum - b.monthNum))
      .map(d => ({
        month: d.month,
        faturamento: d.faturamento,
        lucro: d.lucro
      }));
  });
  get monthlyData() { return this._monthlyData(); }

  // 4. Detailed cost and margin statistics per product
  private readonly _productCosts = computed(() => {
    const prods = this.productsService.products();
    const sheets = this.ownerService.technicalSheets();
    const salesCount: Record<string, number> = {};

    this.orders().forEach(o => {
      o.items.forEach((item: any) => {
        salesCount[item.productId] = (salesCount[item.productId] || 0) + item.quantity;
      });
    });

    return prods.map(p => {
      const sheet = sheets.find(s => s.productId === p.id);
      const custo = sheet ? this.ownerService.calculateSheetCost(sheet) : p.price * 0.4;
      const margem = p.price > 0 ? ((p.price - custo) / p.price) * 100 : 0;
      return {
        name: p.name,
        custo,
        preco: p.price,
        margem,
        vendas: salesCount[p.id] || 0
      };
    });
  });
  get productCosts() { return this._productCosts(); }

  // 5. Insumos price trend over the last 6 months grouped by category
  private readonly _insumoTrend = computed(() => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const trends: Record<string, { month: string; proteinas: number; graos: number; hortifruti: number; monthNum: number; year: number; counts: Record<string, { sum: number; count: number }> }> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mNum = d.getMonth();
      const yr = d.getFullYear();
      const key = `${yr}-${mNum}`;
      trends[key] = {
        month: monthNames[mNum],
        proteinas: 0,
        graos: 0,
        hortifruti: 0,
        monthNum: mNum,
        year: yr,
        counts: {
          proteinas: { sum: 0, count: 0 },
          graos: { sum: 0, count: 0 },
          hortifruti: { sum: 0, count: 0 }
        }
      };
    }

    const records = this.ownerService.priceRecords();
    const insumosList = this.ownerService.insumos();

    records.forEach(r => {
      const date = new Date(r.date);
      const mNum = date.getMonth();
      const yr = date.getFullYear();
      const key = `${yr}-${mNum}`;

      if (trends[key]) {
        const ins = insumosList.find(i => i.id === r.insumoId);
        if (ins) {
          const category = ins.category.toLowerCase();
          let targetKey = '';
          if (category.includes('protein')) {
            targetKey = 'proteinas';
          } else if (category.includes('grao') || category.includes('grão')) {
            targetKey = 'graos';
          } else if (category.includes('horti')) {
            targetKey = 'hortifruti';
          }

          if (targetKey) {
            trends[key].counts[targetKey].sum += r.value;
            trends[key].counts[targetKey].count++;
          }
        }
      }
    });

    const defaultMocks = [
      { proteinas: 0.052, graos: 0.038, hortifruti: 0.025 },
      { proteinas: 0.055, graos: 0.040, hortifruti: 0.028 },
      { proteinas: 0.058, graos: 0.042, hortifruti: 0.026 },
      { proteinas: 0.062, graos: 0.045, hortifruti: 0.032 },
      { proteinas: 0.057, graos: 0.041, hortifruti: 0.024 },
      { proteinas: 0.055, graos: 0.042, hortifruti: 0.028 },
    ];

    return Object.values(trends)
      .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.monthNum - b.monthNum))
      .map((d, index) => {
        const defaultMock = defaultMocks[index % defaultMocks.length];
        return {
          month: d.month,
          proteinas: d.counts['proteinas'].count > 0 ? d.counts['proteinas'].sum / d.counts['proteinas'].count : defaultMock.proteinas,
          graos: d.counts['graos'].count > 0 ? d.counts['graos'].sum / d.counts['graos'].count : defaultMock.graos,
          hortifruti: d.counts['hortifruti'].count > 0 ? d.counts['hortifruti'].sum / d.counts['hortifruti'].count : defaultMock.hortifruti
        };
      });
  });
  get insumoTrend() { return this._insumoTrend(); }

  // Calculations
  readonly totalFaturamento = computed(() => 
    this.orders().reduce((s: number, o: any) => s + (o.total || o.totalAmount || 0), 0)
  );

  readonly ticketMedio = computed(() => 
    this.orders().length ? this.totalFaturamento() / this.orders().length : 0
  );

  readonly todayOrders = computed(() => {
    const today = new Date().toDateString();
    return this.orders().filter(o => new Date(o.createdAt).toDateString() === today);
  });

  readonly avgRating = computed(() => {
    const list = this.reviews();
    return list.length ? list.reduce((s: number, r: any) => s + r.stars, 0) / list.length : 0;
  });

  // Cost metrics
  private readonly _avgCost = computed(() => {
    const list = this._productCosts();
    return list.length ? list.reduce((s: number, p: any) => s + p.custo, 0) / list.length : 0;
  });
  get avgCost() { return this._avgCost(); }

  private readonly _totalFaturamentoProducts = computed(() => 
    this.productCosts.reduce((s: number, p: any) => s + p.preco * p.vendas, 0)
  );
  get totalFaturamentoProducts() { return this._totalFaturamentoProducts(); }

  private readonly _totalLucro = computed(() => 
    this.productCosts.reduce((s: number, p: any) => s + (p.preco - p.custo) * p.vendas, 0)
  );
  get totalLucro() { return this._totalLucro(); }
  
  private readonly _productCostsSorted = computed(() => 
    [...this.productCosts].sort((a, b) => b.margem - a.margem)
  );
  get productCostsSorted() { return this._productCostsSorted(); }

  private readonly _bestProduct = computed(() => {
    const sorted = this.productCostsSorted;
    return sorted.length ? sorted[0] : { name: 'Nenhum', margem: 0, preco: 0, custo: 0 };
  });
  get bestProduct() { return this._bestProduct(); }

  private readonly _worstProduct = computed(() => {
    const sorted = this.productCostsSorted;
    return sorted.length ? sorted[sorted.length - 1] : { name: 'Nenhum', margem: 0, preco: 0, custo: 0 };
  });
  get worstProduct() { return this._worstProduct(); }

  // SVG Area Paths calculations
  readonly weeklyChartPath = computed(() => {
    const data = this.salesData;
    const width = 500;
    const height = 180;
    const maxVal = Math.max(...data.map((d: any) => d.faturamento)) * 1.1 || 1;
    const points = data.map((d: any, i: number) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d.faturamento / maxVal) * height;
      return { x, y };
    });

    const line = points.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const area = `M 0 ${height} ` + points.map((p: any) => `L ${p.x} ${p.y}`).join(' ') + ` L ${width} ${height} Z`;
    return { line, area };
  });

  readonly monthlyChartPaths = computed(() => {
    const data = this.monthlyData;
    const width = 500;
    const height = 180;
    const maxVal = Math.max(...data.map((d: any) => d.faturamento)) * 1.1 || 1;
    
    const pointsFat = data.map((d: any, i: number) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d.faturamento / maxVal) * height;
      return { x, y };
    });

    const pointsLuc = data.map((d: any, i: number) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d.lucro / maxVal) * height;
      return { x, y };
    });

    const fatLine = pointsFat.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const fatArea = `M 0 ${height} ` + pointsFat.map((p: any) => `L ${p.x} ${p.y}`).join(' ') + ` L ${width} ${height} Z`;
    const lucLine = pointsLuc.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    return { fatLine, fatArea, lucLine };
  });

  readonly priceTrendPaths = computed(() => {
    const data = this.insumoTrend;
    const width = 500;
    const height = 180;
    const allVals = data.flatMap((d: any) => [d.proteinas, d.graos, d.hortifruti]);
    const maxVal = Math.max(...allVals) * 1.1 || 0.1;

    const makePath = (key: 'proteinas' | 'graos' | 'hortifruti') => {
      return data.map((d: any, i: number) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (d[key] / maxVal) * height;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');
    };

    return {
      proteinas: makePath('proteinas'),
      graos: makePath('graos'),
      hortifruti: makePath('hortifruti')
    };
  });

  // Helpers
  formatCurrency(val: number): string {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  getBarHeight(vendas: number): number {
    const maxVal = Math.max(...this.salesData.map((d: any) => d.vendas)) || 1;
    return Math.max((vendas / maxVal) * 140, 10);
  }

  countStars(star: number): number {
    return this.reviews().filter(r => r.stars === star).length;
  }

  countLowStars(): number {
    return this.reviews().filter(r => r.stars <= 3).length;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  getStarColor(stars: number): string {
    return stars >= 4 ? '#4CAF50' : stars === 3 ? '#F4A261' : '#D64545';
  }

  getStarBg(stars: number): string {
    return (stars >= 4 ? 'rgba(76,175,80,0.1)' : stars === 3 ? 'rgba(244,162,97,0.1)' : 'rgba(214,69,69,0.1)');
  }

  toggleRestaurant(): void {
    this.employeeService.toggleRestaurantOpen();
  }

  // Export CSV
  handleExport(): void {
    let dataToExport: any[] = [];
    let filename = '';

    if (this.activeTab() === 'overview') {
      dataToExport = this.salesData;
      filename = 'vendas_semanal';
    } else if (this.activeTab() === 'costs') {
      dataToExport = this.productCosts;
      filename = 'custos_produtos';
    } else if (this.activeTab() === 'ratings') {
      dataToExport = this.reviews().map(r => ({
        id: r.id,
        cliente: r.customerName,
        estrelas: r.stars,
        comentario: r.comment || '',
        pedido: r.orderId
      }));
      filename = 'avaliacoes';
    }

    if (!dataToExport.length) return;

    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(obj => 
      Object.values(obj)
        .map(val => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + headers + '\\n' + rows.join('\\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
