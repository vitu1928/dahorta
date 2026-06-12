import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OwnerService } from '../data-access/owner.service';
import { Insumo, InsumoUnit, PriceRecord, Supplier } from '../data-access/owner.models';

const UNITS: InsumoUnit[] = ["g", "kg", "ml", "l", "un", "fatia", "folha", "colher", "porção"];
const CATEGORIES = ["Carnes", "Panificação", "Laticínios", "Hortifruti", "Congelados", "Molhos", "Bebidas", "Outros"];

const supplierColors = ["#d4745f", "#3b82f6", "#22c55e", "#a855f7"];

@Component({
  selector: 'app-insumos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden text-foreground bg-background font-sans">
      
      <!-- ── LEFT PANEL: INSUMO LIST ── -->
      <div class="w-full lg:w-80 flex flex-col overflow-hidden bg-card border-r border-border shrink-0">
        <!-- Header & Search -->
        <div class="p-5 space-y-4 border-b border-border">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-extrabold text-foreground" style="font-family: 'Space Grotesk', sans-serif">Insumos</h1>
              <p class="text-[11px] text-muted-foreground">{{ insumos().length }} cadastrados</p>
            </div>
            <button 
              (click)="openCreateForm()"
              class="flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold text-xs text-white border-none cursor-pointer"
              style="background: var(--primary);"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
              Novo
            </button>
          </div>
          
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
            <input 
              [ngModel]="searchQuery()" 
              (ngModelChange)="searchQuery.set($event)" 
              placeholder="Buscar insumo..."
              class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-border text-foreground outline-none text-xs"
            />
          </div>
        </div>

        <!-- Scrollable List -->
        <div class="flex-1 overflow-y-auto p-3 space-y-2">
          <div 
            *ngFor="let insumo of filteredInsumos()"
            (click)="selectInsumo(insumo)"
            class="p-3 rounded-xl cursor-pointer transition-all border"
            [style.background]="selectedInsumo()?.id === insumo.id ? 'rgba(212,116,95,0.08)' : 'var(--card)'"
            [style.borderColor]="selectedInsumo()?.id === insumo.id ? 'var(--primary)' : 'var(--border)'"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <span 
                  class="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider" 
                  [style.background]="getCategoryBgColor(insumo.category)" 
                  [style.color]="getCategoryColor(insumo.category)"
                >
                  {{ insumo.category ?? 'Outros' }}
                </span>
                <h4 class="text-xs font-bold text-foreground mt-1.5 truncate leading-tight">{{ insumo.name }}</h4>
                <p class="text-[10px] text-muted-foreground mt-0.5">Unidade: {{ insumo.unit }}</p>
              </div>
              <div class="text-right shrink-0">
                <div *ngIf="getBestPriceForInsumo(insumo.id) as best; else noPrice" class="text-xs font-extrabold text-[#22c55e]">
                  {{ formatCurrency(best.value) }}<span class="text-[9px] text-muted-foreground font-normal">/{{ insumo.unit }}</span>
                </div>
                <ng-template #noPrice>
                  <span class="text-[10px] text-muted-foreground/50 italic">Sem preço</span>
                </ng-template>
              </div>
            </div>
            
            <div class="flex items-center justify-between mt-3 pt-2 border-t border-border">
              <span class="text-[9px] text-muted-foreground font-bold">{{ getInsumoRecordsCount(insumo.id) }} registros</span>
              <div class="flex items-center gap-1.5" (click)="$event.stopPropagation()">
                <button 
                  (click)="openEditForm(insumo)"
                  class="w-6 h-6 rounded flex items-center justify-center bg-background border border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground cursor-pointer transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </button>
                
                <ng-container *ngIf="deleteConfirmId() === insumo.id; else deleteBtn">
                  <button 
                    (click)="executeDeleteInsumo(insumo.id)"
                    class="w-6 h-6 rounded flex items-center justify-center bg-destructive/20 border border-destructive/30 text-destructive cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                  <button 
                    (click)="deleteConfirmId.set(null)"
                    class="w-6 h-6 rounded flex items-center justify-center bg-background border border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground cursor-pointer transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                  </button>
                </ng-container>
                <ng-template #deleteBtn>
                  <button 
                    (click)="deleteConfirmId.set(insumo.id)"
                    class="w-6 h-6 rounded flex items-center justify-center bg-background border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </ng-template>
              </div>
            </div>
          </div>
          
          <div *ngIf="filteredInsumos().length === 0" class="text-center py-12">
            <svg class="mx-auto mb-3 text-muted-foreground/30" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>
            <p class="text-xs text-muted-foreground">Nenhum insumo encontrado</p>
          </div>
        </div>
      </div>

      <!-- ── RIGHT PANEL: DETAIL & PRICE HISTORY ── -->
      <div class="flex-1 flex flex-col overflow-hidden bg-background">
        <ng-container *ngIf="selectedInsumo() as insumo; else selectPlaceholder">
          <!-- Detail Header -->
          <div class="p-6 border-b border-border flex items-start justify-between bg-card">
            <div>
              <div class="flex items-center gap-2.5 mb-1.5">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider" 
                  [style.background]="getCategoryBgColor(insumo.category)" 
                  [style.color]="getCategoryColor(insumo.category)"
                >
                  {{ insumo.category }}
                </span>
                <span class="text-[11px] text-muted-foreground font-bold">Unidade: {{ insumo.unit }}</span>
              </div>
              <h2 class="text-xl font-extrabold text-foreground" style="font-family: 'Space Grotesk', sans-serif">{{ insumo.name }}</h2>
              <p *ngIf="insumo.observations" class="text-xs text-muted-foreground mt-1">{{ insumo.observations }}</p>
            </div>
            
            <button 
              (click)="openPriceForm()"
              class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-white border-none cursor-pointer"
              style="background: var(--primary);"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
              Registrar Preço
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Stats Row -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div class="rounded-xl p-4 bg-card border border-border shadow-xs">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="text-[#22c55e]" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Melhor Preço</span>
                </div>
                <p class="text-xl font-extrabold text-[#22c55e]" style="font-family: 'Space Grotesk', sans-serif">
                  {{ getBestPriceForInsumo(insumo.id) ? formatCurrency(getBestPriceForInsumo(insumo.id)!.value) : '—' }}
                </p>
                <p class="text-[10px] text-muted-foreground mt-1 truncate">
                  {{ getBestPriceForInsumo(insumo.id) ? getSupplierName(getBestPriceForInsumo(insumo.id)!.supplierId) : 'Sem registro' }}
                </p>
              </div>

              <div class="rounded-xl p-4 bg-card border border-border shadow-xs">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="text-[#d4745f]" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  <span class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Último Registro</span>
                </div>
                <p class="text-xl font-extrabold text-foreground" style="font-family: 'Space Grotesk', sans-serif">
                  {{ getLatestRecord(insumo.id) ? formatCurrency(getLatestRecord(insumo.id)!.value) : '—' }}
                </p>
                <p class="text-[10px] text-muted-foreground mt-1">
                  {{ getLatestRecord(insumo.id) ? formatDate(getLatestRecord(insumo.id)!.date) : 'Sem registro' }}
                </p>
              </div>

              <div class="rounded-xl p-4 bg-card border border-border shadow-xs">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="text-[#3b82f6]" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                  <span class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Fornecedores</span>
                </div>
                <p class="text-xl font-extrabold text-[#3b82f6]" style="font-family: 'Space Grotesk', sans-serif">
                  {{ getUniqueSuppliersCount(insumo.id) }}
                </p>
                <p class="text-[10px] text-muted-foreground mt-1">Período: {{ pricePeriodDays() }} dias</p>
              </div>
            </div>

            <!-- Price variation Chart -->
            <div *ngIf="chartData().length > 0" class="rounded-2xl p-6 bg-card border border-border shadow-xs space-y-4">
              <h3 class="text-sm font-bold text-foreground" style="font-family: 'Space Grotesk', sans-serif">Variação de Preço por Fornecedor</h3>
              
              <!-- SVG chart container -->
              <div class="relative w-full h-52 pt-2">
                <svg class="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Grid Lines -->
                  <line x1="0" y1="37.5" x2="500" y2="37.5" stroke="var(--border)" stroke-width="1"/>
                  <line x1="0" y1="75" x2="500" y2="75" stroke="var(--border)" stroke-width="1"/>
                  <line x1="0" y1="112.5" x2="500" y2="112.5" stroke="var(--border)" stroke-width="1"/>

                  <!-- Lines for each supplier -->
                  <g *ngFor="let s of chartSuppliers()">
                    <path 
                      [attr.d]="getSupplierPath(s.name)" 
                      fill="none" 
                      [attr.stroke]="s.color" 
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    
                    <!-- Circle dots -->
                    <circle 
                      *ngFor="let pt of getSupplierPoints(s.name)"
                      [attr.cx]="pt.x" 
                      [attr.cy]="pt.y" 
                      r="4" 
                      [attr.fill]="s.color"
                    />
                  </g>
                </svg>
                
                <!-- X Axis Labels -->
                <div class="flex justify-between text-[9px] text-muted-foreground mt-2 font-bold px-1">
                  <span *ngFor="let item of chartData()">
                    {{ item.month }}
                  </span>
                </div>

                <!-- Legend -->
                <div class="flex justify-center flex-wrap gap-4 mt-4 text-[9px] font-bold text-muted-foreground">
                  <div *ngFor="let s of chartSuppliers()" class="flex items-center gap-1.5">
                    <div class="w-2 h-2 rounded-full" [style.background]="s.color"></div>
                    {{ s.name }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Price History Table -->
            <div class="rounded-2xl overflow-hidden bg-card border border-border shadow-xs">
              <div class="px-5 py-4 border-b border-border bg-muted/30">
                <h3 class="text-sm font-bold text-foreground" style="font-family: 'Space Grotesk', sans-serif">Histórico de Preços</h3>
              </div>
              <div class="overflow-x-auto">
                <table *ngIf="getInsumoRecords(insumo.id).length > 0; else emptyRecords" class="w-full text-xs">
                  <thead>
                    <tr class="border-b border-border text-muted-foreground text-[10px] uppercase font-bold tracking-wider text-left bg-muted/50">
                      <th class="px-5 py-3">Data</th>
                      <th class="px-5 py-3">Fornecedor</th>
                      <th class="px-5 py-3">Preço / Unidade</th>
                      <th class="px-5 py-3">Observação</th>
                      <th class="px-5 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let r of getInsumoRecords(insumo.id); let i = index" class="border-b border-border hover:bg-muted/20">
                      <td class="px-5 py-3 text-muted-foreground">{{ formatDate(r.date) }}</td>
                      <td class="px-5 py-3 text-muted-foreground font-semibold">{{ getSupplierName(r.supplierId) }}</td>
                      <td class="px-5 py-3 text-foreground font-extrabold">
                        <div class="flex items-center gap-2">
                          <span>{{ formatCurrency(r.value) }}</span>
                          <span *ngIf="isBestRecord(insumo.id, r, i)" class="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-[#22c55e]/15 text-[#22c55e]">Melhor</span>
                        </div>
                      </td>
                      <td class="px-5 py-3 text-muted-foreground italic">{{ r.observation ?? '—' }}</td>
                      <td class="px-5 py-3">
                        <button 
                          (click)="deletePriceRecord(r.id)"
                          class="w-6 h-6 rounded flex items-center justify-center bg-transparent border-none text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <ng-template #emptyRecords>
                  <div class="py-12 text-center text-muted-foreground/40 italic">Nenhum preço registrado ainda.</div>
                </ng-template>
              </div>
            </div>
          </div>
        </ng-container>
        <ng-template #selectPlaceholder>
          <div class="flex-1 flex flex-col items-center justify-center text-center p-6 bg-background">
            <svg class="text-muted-foreground/30 mb-4" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/></svg>
            <h3 class="text-md font-bold text-foreground">Selecione um insumo</h3>
            <p class="text-xs text-muted-foreground mt-1">Clique em um insumo na lista lateral para visualizar histórico e variação de preços.</p>
          </div>
        </ng-template>
      </div>

      <!-- ── MODAL: INSUMO FORM (CREATE / EDIT) ── -->
      <div *ngIf="showFormModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs" (click)="closeFormModal()"></div>
        <div class="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-6 z-40 text-xs shadow-lg">
          <div class="flex items-center justify-between">
            <h3 class="text-md font-bold text-foreground" style="font-family: 'Space Grotesk', sans-serif">
              {{ formInsumo() ? 'Editar Insumo' : 'Novo Insumo' }}
            </h3>
            <button (click)="closeFormModal()" class="bg-transparent border-none text-muted-foreground cursor-pointer hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
            </button>
          </div>

          <div class="space-y-4 text-xs font-semibold">
            <div class="space-y-1">
              <label class="text-muted-foreground">Nome do Insumo *</label>
              <input 
                [(ngModel)]="insumoFormState.name" 
                placeholder="Ex: Blend Bovino 180g" 
                class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none text-sm" 
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-muted-foreground">Unidade de Compra</label>
                <select 
                  [(ngModel)]="insumoFormState.unit" 
                  class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none font-bold text-sm"
                >
                  <option *ngFor="let u of unitOptions" [value]="u">{{ u }}</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="text-muted-foreground">Categoria</label>
                <select 
                  [(ngModel)]="insumoFormState.category" 
                  class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none font-bold text-sm"
                >
                  <option *ngFor="let c of categoryOptions" [value]="c">{{ c }}</option>
                </select>
              </div>
            </div>

            <div class="space-y-1">
              <label class="text-muted-foreground">Observações</label>
              <textarea 
                [(ngModel)]="insumoFormState.observations" 
                placeholder="Notas internas..." 
                rows="2" 
                class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none text-sm resize-none"
              ></textarea>
            </div>

            <div class="flex gap-4 pt-4 border-t border-border">
              <button 
                (click)="closeFormModal()" 
                class="flex-1 py-3 rounded-xl bg-muted border border-border text-muted-foreground font-bold cursor-pointer hover:bg-muted/80"
              >
                Cancelar
              </button>
              <button 
                (click)="saveInsumo()"
                [disabled]="!insumoFormState.name"
                class="flex-1 py-3 rounded-xl text-white font-bold cursor-pointer border-none flex items-center justify-center gap-1.5 bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── MODAL: PRICE RECORD FORM ── -->
      <div *ngIf="showPriceModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs" (click)="closePriceModal()"></div>
        <div class="relative w-full max-w-sm bg-card border border-border rounded-2xl p-6 space-y-6 z-40 text-xs shadow-lg">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-foreground" style="font-family: 'Space Grotesk', sans-serif">Registrar Preço</h3>
            <button (click)="closePriceModal()" class="bg-transparent border-none text-muted-foreground cursor-pointer hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
            </button>
          </div>

          <div class="space-y-4 text-xs font-semibold">
            <div class="space-y-1">
              <label class="text-muted-foreground">Fornecedor</label>
              <select 
                [(ngModel)]="priceFormState.supplierId" 
                class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none font-bold text-sm"
              >
                <option *ngFor="let s of suppliers()" [value]="s.id">{{ s.name }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-muted-foreground">Preço por Unidade (R$)</label>
                <input 
                  type="number" 
                  step="0.001" 
                  min="0"
                  [(ngModel)]="priceFormState.value" 
                  placeholder="0,00" 
                  class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none font-extrabold text-sm" 
                />
              </div>

              <div class="space-y-1">
                <label class="text-muted-foreground">Data</label>
                <input 
                  type="date" 
                  [(ngModel)]="priceFormState.date" 
                  class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none text-sm" 
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="text-muted-foreground">Observação (opcional)</label>
              <input 
                [(ngModel)]="priceFormState.observation" 
                placeholder="Ex: Promoção de fim de mês" 
                class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none text-sm" 
              />
            </div>

            <div class="flex gap-4 pt-4 border-t border-border">
              <button 
                (click)="closePriceModal()" 
                class="flex-1 py-3 rounded-xl bg-muted border border-border text-muted-foreground font-bold cursor-pointer hover:bg-muted/80"
              >
                Cancelar
              </button>
              <button 
                (click)="savePriceRecord()"
                [disabled]="!priceFormState.value || !priceFormState.supplierId"
                class="flex-1 py-3 rounded-xl text-white font-bold cursor-pointer border-none flex items-center justify-center gap-1.5 bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Registrar
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class InsumosComponent {
  private ownerService = inject(OwnerService);

  readonly searchQuery = signal<string>('');
  readonly selectedInsumo = signal<Insumo | null>(null);
  
  readonly showFormModal = signal(false);
  readonly formInsumo = signal<Insumo | undefined>(undefined);
  readonly deleteConfirmId = signal<string | null>(null);

  readonly showPriceModal = signal(false);

  // Expose owner signals
  readonly insumos = this.ownerService.insumos;
  readonly suppliers = this.ownerService.suppliers;
  readonly priceRecords = this.ownerService.priceRecords;
  readonly pricePeriodDays = this.ownerService.pricePeriodDays;

  readonly unitOptions = UNITS;
  readonly categoryOptions = CATEGORIES;

  // Form states
  insumoFormState = {
    name: '',
    unit: 'g' as InsumoUnit,
    category: 'Outros',
    observations: ''
  };

  priceFormState = {
    supplierId: '',
    value: 0,
    date: '',
    observation: ''
  };

  // Filtered lists
  readonly filteredInsumos = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    return this.insumos().filter(i => i.name.toLowerCase().includes(query));
  });

  // Unique suppliers mapped to colors
  readonly chartSuppliers = computed(() => {
    const insumo = this.selectedInsumo();
    if (!insumo) return [];
    const records = this.getInsumoRecords(insumo.id);
    const ids = [...new Set(records.map(r => r.supplierId))];
    return ids.map((id, i) => ({
      id,
      name: this.getSupplierName(id).split(' ')[0],
      color: supplierColors[i % supplierColors.length]
    }));
  });

  // Price variation aggregated monthly
  readonly chartData = computed(() => {
    const insumo = this.selectedInsumo();
    if (!insumo) return [];
    
    const records = this.getInsumoRecords(insumo.id);
    const byMonth: Record<string, Record<string, number>> = {};
    
    // Sort chronologically first
    const sorted = [...records].sort((a, b) => a.date.getTime() - b.date.getTime());

    sorted.forEach(r => {
      const d = r.date;
      const key = `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
      if (!byMonth[key]) {
        byMonth[key] = {};
      }
      const supName = this.getSupplierName(r.supplierId).split(' ')[0];
      // Keep cheapest or latest
      if (!byMonth[key][supName] || r.value < byMonth[key][supName]) {
        byMonth[key][supName] = r.value;
      }
    });

    return Object.entries(byMonth)
      .map(([month, sup]) => ({ month, ...sup }))
      .slice(-6); // Limit to last 6 months
  });

  // Calculate SVG drawing points for a supplier's price line
  getSupplierPoints(supplierName: string): { x: number; y: number }[] {
    const data = this.chartData();
    if (data.length === 0) return [];

    const width = 500;
    const height = 150;
    
    // Find absolute max value to scale Y axis
    let maxVal = 0.1;
    data.forEach(d => {
      Object.entries(d).forEach(([key, val]) => {
        if (key !== 'month' && typeof val === 'number') {
          if (val > maxVal) maxVal = val;
        }
      });
    });
    maxVal *= 1.15; // Give headroom

    const points: { x: number; y: number }[] = [];

    data.forEach((d, i) => {
      const val = d[supplierName as keyof typeof d];
      if (typeof val === 'number') {
        const x = data.length > 1 ? (i / (data.length - 1)) * width : width / 2;
        const y = height - (val / maxVal) * height;
        points.push({ x, y });
      }
    });

    return points;
  }

  // Calculate SVG line path for a supplier
  getSupplierPath(supplierName: string): string {
    const points = this.getSupplierPoints(supplierName);
    if (points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }

  // Helpers
  selectInsumo(insumo: Insumo) {
    this.selectedInsumo.set(insumo);
  }

  getBestPriceForInsumo(insumoId: string) {
    return this.ownerService.getBestPrice(insumoId);
  }

  getInsumoRecords(insumoId: string): PriceRecord[] {
    return this.priceRecords()
      .filter(r => r.insumoId === insumoId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  getInsumoRecordsCount(insumoId: string): number {
    return this.priceRecords().filter(r => r.insumoId === insumoId).length;
  }

  getSupplierName(supplierId: string): string {
    return this.suppliers().find(s => s.id === supplierId)?.name ?? supplierId;
  }

  getUniqueSuppliersCount(insumoId: string): number {
    const records = this.getInsumoRecords(insumoId);
    return new Set(records.map(r => r.supplierId)).size;
  }

  getLatestRecord(insumoId: string): PriceRecord | undefined {
    const records = this.getInsumoRecords(insumoId);
    return records[0];
  }

  isBestRecord(insumoId: string, record: PriceRecord, index: number): boolean {
    const best = this.getBestPriceForInsumo(insumoId);
    return !!best && best.value === record.value && best.supplierId === record.supplierId && index === 0;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getCategoryColor(cat?: string): string {
    const map: Record<string, string> = {
      "Carnes": "#ef4444", "Panificação": "#f97316", "Laticínios": "#eab308",
      "Hortifruti": "#22c55e", "Congelados": "#3b82f6", "Molhos": "#a855f7",
    };
    return map[cat ?? ""] ?? "#9da89a";
  }

  getCategoryBgColor(cat?: string): string {
    return this.getCategoryColor(cat) + '20';
  }

  // CRUD Insumo
  openCreateForm() {
    this.formInsumo.set(undefined);
    this.insumoFormState = {
      name: '',
      unit: 'g',
      category: 'Outros',
      observations: ''
    };
    this.showFormModal.set(true);
  }

  openEditForm(insumo: Insumo) {
    this.formInsumo.set(insumo);
    this.insumoFormState = {
      name: insumo.name,
      unit: insumo.unit as InsumoUnit,
      category: insumo.category ?? 'Outros',
      observations: insumo.observations ?? ''
    };
    this.showFormModal.set(true);
  }

  closeFormModal() {
    this.showFormModal.set(false);
    this.formInsumo.set(undefined);
  }

  saveInsumo() {
    if (!this.insumoFormState.name) return;

    const data = {
      name: this.insumoFormState.name,
      unit: this.insumoFormState.unit,
      category: this.insumoFormState.category,
      observations: this.insumoFormState.observations
    };

    const editing = this.formInsumo();
    if (editing) {
      this.ownerService.updateInsumo(editing.id, data);
      // Update selected insumo reference
      if (this.selectedInsumo()?.id === editing.id) {
        this.selectedInsumo.set({ ...editing, ...data });
      }
    } else {
      this.ownerService.addInsumo(data);
    }
    
    this.closeFormModal();
  }

  executeDeleteInsumo(id: string) {
    this.ownerService.deleteInsumo(id);
    if (this.selectedInsumo()?.id === id) {
      this.selectedInsumo.set(null);
    }
    this.deleteConfirmId.set(null);
  }

  // CRUD Price Records
  openPriceForm() {
    const insumo = this.selectedInsumo();
    if (!insumo) return;

    this.priceFormState = {
      supplierId: this.suppliers()[0]?.id ?? '',
      value: 0,
      date: new Date().toISOString().split('T')[0],
      observation: ''
    };
    this.showPriceModal.set(true);
  }

  closePriceModal() {
    this.showPriceModal.set(false);
  }

  savePriceRecord() {
    const insumo = this.selectedInsumo();
    if (!insumo || !this.priceFormState.supplierId || !this.priceFormState.value) return;

    this.ownerService.addPriceRecord({
      insumoId: insumo.id,
      supplierId: this.priceFormState.supplierId,
      value: this.priceFormState.value,
      date: new Date(this.priceFormState.date + 'T12:00:00'),
      observation: this.priceFormState.observation || undefined
    });

    this.closePriceModal();
  }

  deletePriceRecord(id: string) {
    this.ownerService.deletePriceRecord(id);
  }
}
