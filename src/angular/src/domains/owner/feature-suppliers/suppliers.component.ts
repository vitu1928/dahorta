import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Supplier, Insumo, PriceRecord } from '../data-access/owner.models';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../../shared/data-access/toast.service';

interface SupplierApi {
  id: number;
  nome: string;
  cnpj: string | null;
  telefone: string;
  email: string;
  endereco: string;
}

interface InsumoApi {
  id: number;
  nome: string;
  unidade: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
}

interface PriceRecordApi {
  id: number;
  insumoId: number;
  fornecedorId: string;
  valor: number;
  data: string;
  observacao: string | null;
}

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 space-y-6 text-foreground bg-background font-sans">
      
      <!-- ── HEADER ── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="overline-label mb-2 text-[#E9C46A]" style="font-weight: 700; letter-spacing: 0.1em">Gestão de Parceiros</p>
          <h1 class="display-heading text-foreground text-3xl font-extrabold" style="font-family: 'Space Grotesk', sans-serif">Fornecedores</h1>
          <p class="text-muted-foreground text-xs mt-1">{{ suppliers().length }} fornecedores cadastrados</p>
        </div>
        <button 
          (click)="openCreateForm()"
          class="flex items-center gap-2 px-6 py-3 rounded-xl transition-all border-none cursor-pointer text-white text-xs font-semibold"
          style="background: var(--primary); box-shadow: var(--shadow-default);"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          Novo Fornecedor
        </button>
      </div>

      <!-- ── SUMMARY STATS ── -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="rounded-2xl p-5 bg-card border border-border flex items-center gap-4 shadow-sm">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-[#d4745f]/15 text-[#d4745f]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="7" height="12" x="14" y="3" rx="1"/><rect width="7" height="8" x="3" y="7" rx="1"/><path d="M10 12h4"/><path d="M10 16h4"/><path d="M10 20h4"/><path d="M3 3h7v4H3z"/></svg>
          </div>
          <div>
            <div class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Fornecedores</div>
            <div class="text-2xl font-extrabold text-foreground mt-0.5" style="font-family: 'Space Grotesk', sans-serif">{{ suppliers().length }}</div>
          </div>
        </div>

        <div class="rounded-2xl p-5 bg-card border border-border flex items-center gap-4 shadow-sm">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-[#3b82f6]/15 text-[#3b82f6]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <div>
            <div class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Insumos Mapeados</div>
            <div class="text-2xl font-extrabold text-[#3b82f6] mt-0.5" style="font-family: 'Space Grotesk', sans-serif">{{ mappedInsumosCount() }}</div>
          </div>
        </div>

        <div class="rounded-2xl p-5 bg-card border border-border flex items-center gap-4 shadow-sm">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-[#22c55e]/15 text-[#22c55e]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <div class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Registros de Preço</div>
            <div class="text-2xl font-extrabold text-[#22c55e] mt-0.5" style="font-family: 'Space Grotesk', sans-serif">{{ priceRecords().length }}</div>
          </div>
        </div>
      </div>

      <!-- ── SUPPLIERS ACCORDION LIST ── -->
      <div class="space-y-3">
        <div 
          *ngFor="let supplier of suppliers()"
          class="rounded-2xl overflow-hidden border bg-card border-border transition-all shadow-sm"
        >
          <!-- Accordion Header -->
          <div 
            (click)="toggleExpanded(supplier.id)"
            class="flex flex-col sm:flex-row sm:items-center justify-between p-5 cursor-pointer gap-4"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-[#d4745f]/10 border border-[#d4745f]/20">
                <svg class="text-[#d4745f]" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><line x1="9" x2="9" y1="9" y2="15"/><line x1="15" x2="15" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="9"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
              </div>
              <div>
                <h3 class="text-sm font-bold text-foreground">{{ supplier.name }}</h3>
                <p *ngIf="supplier.cnpj" class="text-[10px] text-muted-foreground mt-0.5">CNPJ: {{ supplier.cnpj }}</p>
              </div>
            </div>
            
            <div class="flex items-center justify-between sm:justify-end gap-6">
              <div class="flex gap-6 text-right">
                <div>
                  <div class="text-xs font-extrabold text-foreground">{{ getSupplierInsumosCount(supplier.id) }}</div>
                  <div class="text-[9px] text-muted-foreground font-bold">Insumos</div>
                </div>
                <div>
                  <div class="text-xs font-extrabold text-[#22c55e]">{{ getBestPriceCount(supplier.id) }}</div>
                  <div class="text-[9px] text-muted-foreground font-bold">Melhores Preços</div>
                </div>
              </div>

              <div class="flex items-center gap-2" (click)="$event.stopPropagation()">
                <!-- Edit button -->
                <button 
                  (click)="openEditForm(supplier)"
                  class="w-8 h-8 rounded-lg flex items-center justify-center bg-background border border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground cursor-pointer transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </button>

                <!-- Delete Confirmations -->
                <ng-container *ngIf="deleteConfirmId() === supplier.id; else deleteBtn">
                  <button 
                    (click)="executeDeleteSupplier(supplier.id)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center bg-destructive/20 border border-destructive/30 text-destructive cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                  <button 
                    (click)="deleteConfirmId.set(null)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center bg-background border border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground cursor-pointer transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                  </button>
                </ng-container>
                <ng-template #deleteBtn>
                  <button 
                    (click)="deleteConfirmId.set(supplier.id)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center bg-background border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </ng-template>

                <div 
                  class="w-8 h-8 flex items-center justify-center transition-transform duration-300"
                  [style.transform]="expandedSupplierId() === supplier.id ? 'rotate(90deg)' : 'rotate(0deg)'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Accordion Content -->
          <div 
            *ngIf="expandedSupplierId() === supplier.id"
            class="border-t border-border bg-muted/10"
          >
            <!-- Contacts row -->
            <div class="px-5 py-3.5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground bg-muted/30 border-b border-border">
              <div *ngIf="supplier.phone" class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>{{ supplier.phone }}</span>
              </div>
              <div *ngIf="supplier.email" class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span>{{ supplier.email }}</span>
              </div>
              <div *ngIf="supplier.address" class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{{ supplier.address }}</span>
              </div>
            </div>

            <!-- Insumos Table -->
            <div class="p-5">
              <h4 class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-3">Insumos Fornecidos</h4>
              
              <div *ngIf="getSupplierInsumos(supplier.id).length > 0; else noInsumos" class="overflow-x-auto rounded-xl border border-border">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="text-muted-foreground text-[10px] uppercase font-bold tracking-wider text-left bg-muted/50 border-b border-border">
                      <th class="px-4 py-3">Insumo</th>
                      <th class="px-4 py-3">Unidade</th>
                      <th class="px-4 py-3">Último Preço</th>
                      <th class="px-4 py-3">Última Atualização</th>
                      <th class="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of getSupplierInsumos(supplier.id)" class="border-b border-border hover:bg-muted/20">
                      <td class="px-4 py-3 text-foreground font-semibold">{{ item.insumo.name }}</td>
                      <td class="px-4 py-3 text-muted-foreground">{{ item.insumo.unit }}</td>
                      <td class="px-4 py-3 text-foreground font-extrabold">{{ formatCurrency(item.latestRecord.value) }}</td>
                      <td class="px-4 py-3 text-muted-foreground">{{ formatDate(item.latestRecord.date) }}</td>
                      <td class="px-4 py-3">
                        <span 
                          *ngIf="item.isCurrentBest; else notBest"
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-[#22c55e]/15 text-[#22c55e]"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          Melhor Preço
                        </span>
                        <ng-template #notBest>
                          <span class="text-[10px] text-muted-foreground italic">Não é o melhor</span>
                        </ng-template>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ng-template #noInsumos>
                <div class="py-6 text-center rounded-xl border border-dashed border-border text-muted-foreground space-y-1">
                  <svg class="mx-auto text-muted-foreground/30 mb-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                  <p class="text-xs">Nenhum insumo vinculado</p>
                  <p class="text-[10px] text-muted-foreground/50">Registre preços de insumos vinculando a este fornecedor na aba Insumos.</p>
                </div>
              </ng-template>
            </div>
          </div>
        </div>
      </div>

      <!-- ── MODAL: FORNECEDOR FORM (CREATE / EDIT) ── -->
      <div *ngIf="showFormModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs" (click)="closeFormModal()"></div>
        <div class="relative w-full max-w-lg bg-card border border-border rounded-2xl p-6 space-y-6 z-40 text-xs shadow-lg">
          <div class="flex items-center justify-between">
            <h3 class="text-md font-bold text-foreground" style="font-family: 'Space Grotesk', sans-serif">
              {{ formSupplier() ? 'Editar Fornecedor' : 'Novo Fornecedor' }}
            </h3>
            <button (click)="closeFormModal()" class="bg-transparent border-none text-muted-foreground cursor-pointer hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
            </button>
          </div>

          <div class="space-y-4 text-xs font-semibold">
            <div class="space-y-1">
              <label class="text-muted-foreground">Nome do Fornecedor *</label>
              <input 
                [(ngModel)]="supplierFormState.name" 
                placeholder="Ex: Distribuidora Prime Foods" 
                class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none text-sm" 
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-muted-foreground">CNPJ (opcional)</label>
                <input 
                  [(ngModel)]="supplierFormState.cnpj" 
                  placeholder="00.000.000/0001-00" 
                  class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none text-sm" 
                />
              </div>

              <div class="space-y-1">
                <label class="text-muted-foreground">Telefone</label>
                <input 
                  [(ngModel)]="supplierFormState.phone" 
                  placeholder="(11) 0000-0000" 
                  class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none text-sm" 
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="text-muted-foreground">E-mail</label>
              <input 
                type="email"
                [(ngModel)]="supplierFormState.email" 
                placeholder="contato@fornecedor.com.br" 
                class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none text-sm" 
              />
            </div>

            <div class="space-y-1">
              <label class="text-muted-foreground">Endereço</label>
              <input 
                [(ngModel)]="supplierFormState.address" 
                placeholder="Rua, número - Bairro, Cidade" 
                class="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground outline-none text-sm" 
              />
            </div>

            <div class="flex gap-4 pt-4 border-t border-border">
              <button 
                (click)="closeFormModal()" 
                class="flex-1 py-3 rounded-xl bg-muted border border-border text-muted-foreground font-bold cursor-pointer hover:bg-muted/80"
              >
                Cancelar
              </button>
              <button 
                (click)="saveSupplier()"
                [disabled]="!supplierFormState.name"
                class="flex-1 py-3 rounded-xl text-white font-bold cursor-pointer border-none flex items-center justify-center gap-1.5 bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Salvar
              </button>
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
  `]
})
export class SuppliersComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly suppliersUrl = `${environment.apiUrl}/admin/fornecedores`;

  readonly suppliers = signal<Supplier[]>([]);
  readonly priceRecords = signal<PriceRecord[]>([]);
  readonly insumos = signal<Insumo[]>([]);

  readonly expandedSupplierId = signal<string | null>(null);
  readonly showFormModal = signal(false);
  readonly formSupplier = signal<Supplier | undefined>(undefined);
  readonly deleteConfirmId = signal<string | null>(null);

  supplierFormState = {
    name: '',
    cnpj: '',
    phone: '',
    email: '',
    address: ''
  };

  ngOnInit(): void {
    void this.loadSuppliers();
    void this.loadInsumos();
    void this.loadPriceRecords();
  }

  private async loadInsumos(): Promise<void> {
    try {
      const items = await firstValueFrom(
        this.http.get<InsumoApi[]>(`${environment.apiUrl}/estoque/insumos`)
      );
      this.insumos.set(items.map(item => ({
        id: String(item.id),
        name: item.nome,
        unit: item.unidade,
        category: 'Outros',
        currentQuantity: Number(item.quantidadeAtual),
        minAlert: Number(item.quantidadeMinima)
      })));
    } catch (error) {
      console.error('Erro ao carregar insumos para fornecedores pela API:', error);
      this.toast.error(this.errorMessage(error, 'Não foi possível carregar os insumos.'));
    }
  }

  private async loadSuppliers(): Promise<void> {
    try {
      const suppliers = await firstValueFrom(this.http.get<SupplierApi[]>(this.suppliersUrl));
      this.suppliers.set(suppliers.map(supplier => this.toSupplier(supplier)));
    } catch (error) {
      console.error('Erro ao carregar fornecedores pela API:', error);
      this.toast.error(this.errorMessage(error, 'Não foi possível carregar os fornecedores.'));
    }
  }

  private async loadPriceRecords(): Promise<void> {
    try {
      const records = await firstValueFrom(
        this.http.get<PriceRecordApi[]>(`${environment.apiUrl}/admin/historico-precos`)
      );
      this.priceRecords.set(records.map(record => ({
        id: String(record.id),
        insumoId: String(record.insumoId),
        supplierId: record.fornecedorId,
        value: Number(record.valor),
        date: new Date(record.data),
        observation: record.observacao ?? undefined
      })));
    } catch (error) {
      console.error('Erro ao carregar histórico de preços pela API:', error);
      this.toast.error(this.errorMessage(error, 'Não foi possível carregar o histórico de preços.'));
    }
  }

  private toSupplier(supplier: SupplierApi): Supplier {
    return {
      id: String(supplier.id),
      name: supplier.nome,
      cnpj: supplier.cnpj ?? undefined,
      phone: supplier.telefone,
      email: supplier.email,
      address: supplier.endereco
    };
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.detail ?? error.error?.message;
      if (typeof message === 'string' && message.trim()) return message;
      if (error.status === 0) return 'Não foi possível conectar à API. Verifique se o backend está em execução.';
    }
    return fallback;
  }

  // Stats calculation
  readonly mappedInsumosCount = computed(() => {
    const records = this.priceRecords();
    const uniqueInsumos = new Set(records.map(r => r.insumoId));
    return uniqueInsumos.size;
  });

  toggleExpanded(supplierId: string) {
    if (this.expandedSupplierId() === supplierId) {
      this.expandedSupplierId.set(null);
    } else {
      this.expandedSupplierId.set(supplierId);
    }
  }

  getSupplierInsumos(supplierId: string) {
    const records = this.priceRecords();
    const insumosList = this.insumos();
    
    // Find unique insumoIds for this supplier
    const supplierRecords = records.filter(r => r.supplierId === supplierId);
    const insumoIds = [...new Set(supplierRecords.map(r => r.insumoId))];

    return insumoIds.map(id => {
      const insumo = insumosList.find(i => i.id === id);
      
      // Sort this supplier's records for this insumo chronologically descending
      const itemRecords = supplierRecords
        .filter(r => r.insumoId === id)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      
      const best = itemRecords.reduce<Pick<PriceRecord, 'value' | 'supplierId'> | null>(
        (currentBest, record) => !currentBest || record.value < currentBest.value
          ? { value: record.value, supplierId: record.supplierId }
          : currentBest,
        null
      );
      const isCurrentBest = best?.supplierId === supplierId;

      return {
        insumo: insumo!,
        records: itemRecords,
        isCurrentBest,
        latestRecord: itemRecords[0]
      };
    }).filter(item => !!item.insumo);
  }

  getSupplierInsumosCount(supplierId: string): number {
    return this.getSupplierInsumos(supplierId).length;
  }

  getBestPriceCount(supplierId: string): number {
    return this.getSupplierInsumos(supplierId).filter(item => item.isCurrentBest).length;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  // CRUD Actions
  openCreateForm() {
    this.formSupplier.set(undefined);
    this.supplierFormState = {
      name: '',
      cnpj: '',
      phone: '',
      email: '',
      address: ''
    };
    this.showFormModal.set(true);
  }

  openEditForm(supplier: Supplier) {
    this.formSupplier.set(supplier);
    this.supplierFormState = {
      name: supplier.name,
      cnpj: supplier.cnpj || '',
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address
    };
    this.showFormModal.set(true);
  }

  closeFormModal() {
    this.showFormModal.set(false);
    this.formSupplier.set(undefined);
  }

  async saveSupplier(): Promise<void> {
    if (!this.supplierFormState.name) return;

    const data = {
      nome: this.supplierFormState.name.trim(),
      cnpj: this.supplierFormState.cnpj.trim() || null,
      telefone: this.supplierFormState.phone.trim(),
      email: this.supplierFormState.email.trim().toLowerCase(),
      endereco: this.supplierFormState.address.trim()
    };

    try {
      const editing = this.formSupplier();
      if (editing) {
        await firstValueFrom(this.http.put<SupplierApi>(`${this.suppliersUrl}/${editing.id}`, data));
      } else {
        await firstValueFrom(this.http.post<SupplierApi>(this.suppliersUrl, data));
      }
      await this.loadSuppliers();
      this.toast.success(editing ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor cadastrado com sucesso!');
      this.closeFormModal();
    } catch (error) {
      console.error('Erro ao salvar fornecedor pela API:', error);
      this.toast.error(this.errorMessage(error, 'Não foi possível salvar o fornecedor.'));
    }
  }

  async executeDeleteSupplier(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete<void>(`${this.suppliersUrl}/${id}`));
      await this.loadSuppliers();
      if (this.expandedSupplierId() === id) {
        this.expandedSupplierId.set(null);
      }
      this.toast.success('Fornecedor removido com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir fornecedor pela API:', error);
      this.toast.error(this.errorMessage(error, 'Não foi possível excluir o fornecedor.'));
    }
    this.deleteConfirmId.set(null);
  }
}
