import { HttpClient } from '@angular/common/http';
import { Injectable, effect, inject, signal } from '@angular/core';
import { EMPTY, catchError, switchMap, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/data-access/auth.service';
import { EmployeeService } from './employee.service';
import { StockItem } from './employee.models';

interface InsumoApi {
  id: number;
  nome: string;
  unidade: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
}

@Injectable({ providedIn: 'root' })
export class RestEmployeeService extends EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = environment.apiUrl;

  override readonly restaurantOpen = signal(true);
  override readonly stockItems = signal<StockItem[]>([]);

  constructor() {
    super();

    timer(0, 5000).pipe(
      switchMap(() => this.http.get<{ aberto: boolean }>(`${this.baseUrl}/restaurante`).pipe(
        catchError(error => {
          console.error('Não foi possível carregar o estado do restaurante pela API:', error);
          return EMPTY;
        })
      ))
    ).subscribe(response => this.restaurantOpen.set(response.aberto));

    effect(onCleanup => {
      const user = this.authService.currentUser();
      this.stockItems.set([]);
      if (!user || (user.role !== 'owner' && user.role !== 'employee')) return;

      const subscription = timer(0, 10000).pipe(
        switchMap(() => this.http.get<InsumoApi[]>(`${this.baseUrl}/estoque/insumos`).pipe(
          catchError(error => {
            console.error('Não foi possível carregar o estoque pela API:', error);
            return EMPTY;
          })
        ))
      ).subscribe(items => this.stockItems.set(items.map(item => ({
        id: String(item.id),
        name: item.nome,
        category: '',
        unit: item.unidade,
        currentQuantity: Number(item.quantidadeAtual),
        maxCapacity: 1000,
        minQuantity: Number(item.quantidadeMinima),
        minAlert: Number(item.quantidadeMinima)
      }))));

      onCleanup(() => subscription.unsubscribe());
    });
  }

  override toggleRestaurantOpen(): void {
    this.http.patch<{ aberto: boolean }>(`${this.baseUrl}/restaurante`, {
      aberto: !this.restaurantOpen()
    }).subscribe({
      next: response => this.restaurantOpen.set(response.aberto),
      error: error => console.error('Não foi possível alterar o estado do restaurante pela API:', error)
    });
  }

  override updateStockQuantity(itemId: string, quantity: number): void {
    const insumoId = Number(itemId);
    if (!Number.isSafeInteger(insumoId) || insumoId <= 0 || !Number.isFinite(quantity) || quantity < 0) {
      console.error('Não foi possível atualizar o estoque: identificador ou quantidade inválidos.');
      return;
    }

    this.http.post<InsumoApi>(`${this.baseUrl}/estoque/movimentacoes`, {
      insumoId,
      tipo: 'AJUSTE',
      quantidade: quantity,
      observacao: 'Ajuste de estoque pelo painel da equipe.'
    }).subscribe({
      next: item => this.stockItems.update(items => items.map(current =>
        current.id === itemId ? {
          ...current,
          currentQuantity: Number(item.quantidadeAtual),
          minQuantity: Number(item.quantidadeMinima),
          minAlert: Number(item.quantidadeMinima)
        } : current
      )),
      error: error => console.error('Não foi possível ajustar o estoque pela API:', error)
    });
  }
}
