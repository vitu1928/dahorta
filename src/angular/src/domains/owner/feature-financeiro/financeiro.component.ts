import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface FornecedorOption {
  id: number;
  nome: string;
}

interface InsumoOption {
  id: number;
  nome: string;
  unidade: string;
}

interface Compra {
  id: number;
  fornecedorNome: string;
  criadaEm: string;
  total: number;
  itens: { insumoNome: string; quantidade: number; unidade: string; subtotal: number }[];
}

interface Despesa {
  id: number;
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  recorrente: boolean;
  status: string;
}

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="p-6 lg:p-8 space-y-6 bg-background text-foreground">
      <header>
        <p class="overline-label mb-2 text-[#E9C46A]">Gestão financeira</p>
        <h1 class="display-heading text-3xl font-extrabold">Compras e despesas</h1>
        <p class="text-sm text-muted-foreground mt-2">Compras recebidas atualizam o estoque e o histórico de preços automaticamente.</p>
      </header>

      @if (error()) {
        <p role="alert" class="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{{ error() }}</p>
      }
      @if (notice()) {
        <p role="status" class="rounded-xl border border-green-300 bg-green-50 p-3 text-sm text-green-700">{{ notice() }}</p>
      }

      <section class="grid gap-6 xl:grid-cols-2">
        <form class="space-y-4 rounded-2xl border border-border bg-card p-5" (ngSubmit)="registrarCompra()">
          <h2 class="text-lg font-bold">Registrar recebimento</h2>
          <label class="block text-xs font-semibold">Fornecedor
            <select name="fornecedor" [(ngModel)]="compra.fornecedorId" required class="mt-1 w-full rounded-lg border border-border bg-background p-2">
              <option [ngValue]="0" disabled>Selecione</option>
              @for (fornecedor of fornecedores(); track fornecedor.id) {
                <option [ngValue]="fornecedor.id">{{ fornecedor.nome }}</option>
              }
            </select>
          </label>
          <div class="space-y-3">
            @for (linha of compra.itens; track $index; let index = $index) {
              <div class="rounded-xl border border-border p-3">
                <label class="block text-xs font-semibold">Insumo
                  <select [name]="'insumo' + index" [(ngModel)]="linha.insumoId" required class="mt-1 w-full rounded-lg border border-border bg-background p-2">
                    <option [ngValue]="0" disabled>Selecione</option>
                    @for (insumo of insumos(); track insumo.id) {
                      <option [ngValue]="insumo.id">{{ insumo.nome }} ({{ insumo.unidade }})</option>
                    }
                  </select>
                </label>
                <div class="mt-3 grid grid-cols-2 gap-3">
                  <label class="text-xs font-semibold">Quantidade
                    <input [name]="'quantidade' + index" type="number" min="0.001" step="0.001" [(ngModel)]="linha.quantidade" required class="mt-1 w-full rounded-lg border border-border bg-background p-2">
                  </label>
                  <label class="text-xs font-semibold">Preço unitário
                    <input [name]="'preco' + index" type="number" min="0.01" step="0.01" [(ngModel)]="linha.precoUnitario" required class="mt-1 w-full rounded-lg border border-border bg-background p-2">
                  </label>
                </div>
                @if (compra.itens.length > 1) {
                  <button type="button" (click)="removerItemCompra(index)" class="mt-2 text-xs text-red-600">Remover insumo</button>
                }
              </div>
            }
            <button type="button" (click)="adicionarItemCompra()" [disabled]="compra.itens.length >= 100" class="rounded-lg border border-border px-3 py-2 text-xs font-bold disabled:opacity-50">Adicionar outro insumo</button>
          </div>
          <label class="block text-xs font-semibold">Observação
            <input name="observacao" maxlength="500" [(ngModel)]="compra.observacao" class="mt-1 w-full rounded-lg border border-border bg-background p-2">
          </label>
          <button [disabled]="saving()" class="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
            {{ saving() ? 'Salvando...' : 'Registrar compra recebida' }}
          </button>
        </form>

        <form class="space-y-4 rounded-2xl border border-border bg-card p-5" (ngSubmit)="registrarDespesa()">
          <h2 class="text-lg font-bold">Registrar despesa</h2>
          <div class="grid grid-cols-2 gap-3">
            <label class="text-xs font-semibold">Categoria
              <input name="categoria" required maxlength="80" [(ngModel)]="despesa.categoria" class="mt-1 w-full rounded-lg border border-border bg-background p-2">
            </label>
            <label class="text-xs font-semibold">Valor
              <input name="valor" type="number" min="0.01" step="0.01" required [(ngModel)]="despesa.valor" class="mt-1 w-full rounded-lg border border-border bg-background p-2">
            </label>
          </div>
          <label class="block text-xs font-semibold">Descrição
            <input name="descricao" required maxlength="180" [(ngModel)]="despesa.descricao" class="mt-1 w-full rounded-lg border border-border bg-background p-2">
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="text-xs font-semibold">Data
              <input name="data" type="date" required [(ngModel)]="despesa.data" class="mt-1 w-full rounded-lg border border-border bg-background p-2">
            </label>
            <label class="text-xs font-semibold">Status
              <select name="status" [(ngModel)]="despesa.status" class="mt-1 w-full rounded-lg border border-border bg-background p-2">
                <option value="PENDENTE">Pendente</option>
                <option value="PAGO">Pago</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </label>
          </div>
          <label class="flex items-center gap-2 text-xs font-semibold">
            <input name="recorrente" type="checkbox" [(ngModel)]="despesa.recorrente"> Despesa recorrente
          </label>
          <button [disabled]="saving()" class="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
            {{ saving() ? 'Salvando...' : 'Salvar despesa' }}
          </button>
        </form>
      </section>

      <section class="grid gap-6 xl:grid-cols-2">
        <div class="overflow-x-auto rounded-2xl border border-border bg-card p-5">
          <h2 class="mb-4 text-lg font-bold">Compras recebidas</h2>
          @for (item of compras(); track item.id) {
            <article class="border-t border-border py-3 text-sm">
              <div class="flex justify-between gap-3">
                <strong>{{ item.fornecedorNome }}</strong>
                <strong>{{ item.total | currency:'BRL' }}</strong>
              </div>
              <p class="text-xs text-muted-foreground">{{ item.criadaEm | date:'short' }}</p>
              <p class="mt-1 text-xs">
                @for (linha of item.itens; track linha.insumoNome) {
                  <span>{{ linha.insumoNome }} × {{ linha.quantidade }} {{ linha.unidade }}{{ !$last ? ', ' : '' }}</span>
                }
              </p>
            </article>
          } @empty {
            <p class="text-sm text-muted-foreground">Nenhuma compra registrada.</p>
          }
        </div>

        <div class="overflow-x-auto rounded-2xl border border-border bg-card p-5">
          <h2 class="mb-4 text-lg font-bold">Despesas</h2>
          @for (item of despesas(); track item.id) {
            <article class="flex items-center justify-between gap-3 border-t border-border py-3 text-sm">
              <div>
                <strong>{{ item.descricao }}</strong>
                <p class="text-xs text-muted-foreground">{{ item.categoria }} · {{ item.data | date:'shortDate' }} · {{ item.status }}</p>
              </div>
              <div class="flex items-center gap-3">
                <strong>{{ item.valor | currency:'BRL' }}</strong>
                <button type="button" (click)="excluirDespesa(item)" aria-label="Excluir despesa" class="rounded-lg border border-border px-2 py-1 text-xs">Excluir</button>
              </div>
            </article>
          } @empty {
            <p class="text-sm text-muted-foreground">Nenhuma despesa registrada.</p>
          }
        </div>
      </section>
    </main>
  `
})
export class FinanceiroComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  readonly fornecedores = signal<FornecedorOption[]>([]);
  readonly insumos = signal<InsumoOption[]>([]);
  readonly compras = signal<Compra[]>([]);
  readonly despesas = signal<Despesa[]>([]);
  readonly error = signal('');
  readonly notice = signal('');
  readonly saving = signal(false);

  compra = { fornecedorId: 0, itens: [{ insumoId: 0, quantidade: 1, precoUnitario: 0.01 }], observacao: '' };
  despesa = { categoria: '', descricao: '', valor: 0.01, data: this.dataAtual(), recorrente: false, status: 'PENDENTE' };

  ngOnInit(): void {
    void this.carregar();
  }

  async registrarCompra(): Promise<void> {
    await this.executar(async () => {
      await firstValueFrom(this.http.post(`${this.baseUrl}/admin/compras`, {
        fornecedorId: this.compra.fornecedorId,
        observacao: this.compra.observacao,
        itens: this.compra.itens
      }));
      this.compra = { fornecedorId: 0, itens: [{ insumoId: 0, quantidade: 1, precoUnitario: 0.01 }], observacao: '' };
      this.notice.set('Compra recebida e estoque atualizado.');
      await this.carregar();
    });
  }

  adicionarItemCompra(): void {
    if (this.compra.itens.length < 100) {
      this.compra.itens.push({ insumoId: 0, quantidade: 1, precoUnitario: 0.01 });
    }
  }

  removerItemCompra(index: number): void {
    this.compra.itens.splice(index, 1);
  }

  async registrarDespesa(): Promise<void> {
    await this.executar(async () => {
      await firstValueFrom(this.http.post(`${this.baseUrl}/admin/despesas`, this.despesa));
      this.despesa = { categoria: '', descricao: '', valor: 0.01, data: this.dataAtual(), recorrente: false, status: 'PENDENTE' };
      this.notice.set('Despesa salva.');
      await this.carregar();
    });
  }

  async excluirDespesa(despesa: Despesa): Promise<void> {
    if (!confirm(`Excluir a despesa "${despesa.descricao}"?`)) return;
    await this.executar(async () => {
      await firstValueFrom(this.http.delete(`${this.baseUrl}/admin/despesas/${despesa.id}`));
      this.notice.set('Despesa excluída.');
      await this.carregar();
    });
  }

  private async carregar(): Promise<void> {
    try {
      const [compras, despesas, fornecedores, insumos] = await Promise.all([
        firstValueFrom(this.http.get<Compra[]>(`${this.baseUrl}/admin/compras`)),
        firstValueFrom(this.http.get<Despesa[]>(`${this.baseUrl}/admin/despesas`)),
        firstValueFrom(this.http.get<FornecedorOption[]>(`${this.baseUrl}/admin/fornecedores`)),
        firstValueFrom(this.http.get<InsumoOption[]>(`${this.baseUrl}/estoque/insumos`))
      ]);
      this.compras.set(compras);
      this.despesas.set(despesas);
      this.fornecedores.set(fornecedores);
      this.insumos.set(insumos);
    } catch (error) {
      this.error.set(this.errorMessage(error));
    }
  }

  private async executar(action: () => Promise<void>): Promise<void> {
    this.error.set('');
    this.notice.set('');
    this.saving.set(true);
    try {
      await action();
    } catch (error) {
      this.error.set(this.errorMessage(error));
    } finally {
      this.saving.set(false);
    }
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.detail ?? error.error?.message;
      if (typeof message === 'string') return message;
    }
    return 'Não foi possível concluir a operação com a API.';
  }

  private dataAtual(): string {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
