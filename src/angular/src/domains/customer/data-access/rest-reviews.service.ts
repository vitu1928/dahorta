import { HttpClient } from '@angular/common/http';
import { Injectable, effect, inject, signal } from '@angular/core';
import { EMPTY, catchError, firstValueFrom, switchMap, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/data-access/auth.service';
import { Review } from './customer.models';
import { ReviewsService } from './reviews.service';

interface AvaliacaoApi {
  id: number;
  pedidoId: number;
  estrelas: number;
  comentario: string | null;
  criadoEm: string;
  clienteId: number;
  clienteNome: string;
}

@Injectable({ providedIn: 'root' })
export class RestReviewsService extends ReviewsService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  override readonly reviews = signal<Review[]>([]);

  constructor() {
    super();
    effect(onCleanup => {
      if (this.auth.currentUser()?.role !== 'owner') return;
      const subscription = timer(0, 30000).pipe(
        switchMap(() => this.http.get<AvaliacaoApi[]>(`${environment.apiUrl}/avaliacoes`).pipe(
          catchError(error => {
            console.error('Não foi possível carregar as avaliações administrativas:', error);
            return EMPTY;
          })
        ))
      ).subscribe(values => this.reviews.set(values.map(value => this.toReview(value))));
      onCleanup(() => subscription.unsubscribe());
    });
  }

  override async addReview(review: Omit<Review, 'id'>): Promise<void> {
    const saved = await firstValueFrom(this.http.post<AvaliacaoApi>(`${environment.apiUrl}/avaliacoes`, {
      pedidoId: this.parseId(review.orderId),
      estrelas: review.stars,
      comentario: review.comment ?? ''
    }));
    this.reviews.update(items => [...items.filter(item => item.orderId !== String(saved.pedidoId)), this.toReview(saved)]);
  }

  override getByOrder(orderId: string): Review | undefined {
    const cached = this.reviews().find(review => review.orderId === orderId);
    if (cached) return cached;
    const id = this.parseId(orderId);
    this.http.get<AvaliacaoApi>(`${environment.apiUrl}/avaliacoes/pedido/${id}`).subscribe({
      next: value => this.reviews.update(items => [...items.filter(item => item.orderId !== String(value.pedidoId)), this.toReview(value)]),
      error: error => {
        if (error.status !== 404) console.error('Não foi possível carregar a avaliação do pedido:', error);
      }
    });
    return undefined;
  }

  private toReview(value: AvaliacaoApi): Review {
    return {
      id: String(value.id),
      orderId: String(value.pedidoId),
      stars: value.estrelas,
      comment: value.comentario ?? undefined,
      createdAt: new Date(value.criadoEm),
      customerId: String(value.clienteId),
      customerName: value.clienteNome
    };
  }

  private parseId(id: string): number {
    const parsed = Number(id);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) throw new Error(`Identificador inválido: ${id}`);
    return parsed;
  }
}
