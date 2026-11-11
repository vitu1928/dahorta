import { HttpClient } from '@angular/common/http';
import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';
import { EMPTY, catchError, firstValueFrom, forkJoin, switchMap, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/data-access/auth.service';
import { Category, Product } from './customer.models';
import { ProductsService } from './products.service';

interface ProdutoApi {
  id: number;
  nome: string;
  descricao: string;
  imagem: string;
  categoria: string;
  preco: number;
  disponivel: boolean;
  tempoPreparo: number;
  alergicos: string[];
  comboSlots?: {
    id: string;
    name: string;
    type?: 'fixed' | 'selectable';
    products: string[];
    allowSwap?: boolean;
  }[];
}

@Injectable({ providedIn: 'root' })
export class RestProductsService extends ProductsService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = environment.apiUrl;
  override readonly products = signal<Product[]>([]);
  override readonly categories = signal<Category[]>([]);
  override readonly plateOfDay = signal<Record<number, string>>({});
  override readonly availableProducts = computed(() => this.products().filter(product => product.available));

  constructor() {
    super();
    effect(onCleanup => {
      const isOwner = this.auth.currentUser()?.role === 'owner';
      const subscription = timer(0, 10000).pipe(
        switchMap(() => forkJoin({
          products: this.http.get<ProdutoApi[]>(`${this.baseUrl}${isOwner ? '/admin' : ''}/produtos`),
          categories: this.http.get<Category[]>(`${this.baseUrl}/categorias`),
          plate: this.http.get<Record<number, string>>(`${this.baseUrl}/prato-do-dia`)
        }).pipe(catchError(error => {
          console.error('Não foi possível carregar o cardápio da API:', error);
          return EMPTY;
        })))
      ).subscribe(({ products, categories, plate }) => {
        this.products.set(products.map(product => this.fromApi(product)));
        this.categories.set(categories);
        this.plateOfDay.set(this.fromApiPlateOfDay(plate));
      });
      onCleanup(() => subscription.unsubscribe());
    });
  }

  private fromApi(product: ProdutoApi): Product {
    return {
      id: String(product.id),
      name: product.nome,
      description: product.descricao ?? '',
      image: product.imagem ?? '',
      price: product.preco,
      category: product.categoria ?? '',
      available: product.disponivel,
      prepTime: product.tempoPreparo,
      isCombo: !!product.comboSlots?.length || product.categoria === 'combos',
      comboSlots: product.comboSlots?.map(slot => ({
        ...slot,
        type: slot.type ?? 'selectable'
      })),
      allergens: product.alergicos ?? []
    };
  }

  private fromApiPlateOfDay(config: Record<number, string>): Record<number, string> {
    const normalized: Record<number, string> = {};
    for (const [apiDay, productId] of Object.entries(config)) {
      normalized[Number(apiDay) % 7] = productId;
    }
    return normalized;
  }

  override getByCategory(category: string): Signal<Product[]> {
    return computed(() => this.products().filter(product => product.category === category));
  }

  override search(searchTerm: string): Signal<Product[]> {
    return computed(() => {
      const query = searchTerm.toLocaleLowerCase('pt-BR').trim();
      return this.products().filter(product =>
        product.name.toLocaleLowerCase('pt-BR').includes(query)
        || product.description.toLocaleLowerCase('pt-BR').includes(query)
      );
    });
  }

  override getById(id: string): Product | undefined {
    return this.products().find(product => product.id === id);
  }

  override toggleAvailability(id: string): void {
    const product = this.getById(id);
    if (!product) return;
    this.http.patch<ProdutoApi>(`${this.baseUrl}/admin/produtos/${this.parseId(id)}/disponibilidade`, {
      disponivel: !product.available
    }).subscribe({
      next: updated => this.products.update(items =>
        items.map(item => item.id === id ? this.fromApi(updated) : item)),
      error: error => console.error('Não foi possível alterar a disponibilidade do produto:', error)
    });
  }

  override async addProduct(product: Omit<Product, 'id'>): Promise<string> {
    const response = await firstValueFrom(this.http.post<ProdutoApi>(`${this.baseUrl}/admin/produtos`, this.toApi(product)));
    const saved = this.fromApi(response);
    this.products.update(items => [...items, saved]);
    return saved.id;
  }

  override async updateProduct(id: string, product: Partial<Product>): Promise<void> {
    const current = this.getById(id);
    if (!current) throw new Error(`Produto não encontrado: ${id}`);
    const response = await firstValueFrom(this.http.put<ProdutoApi>(
      `${this.baseUrl}/admin/produtos/${this.parseId(id)}`, this.toApi({ ...current, ...product })
    ));
    const saved = this.fromApi(response);
    this.products.update(items => items.map(item => item.id === id ? saved : item));
  }

  override async deleteProduct(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/admin/produtos/${this.parseId(id)}`));
    this.products.update(items => items.filter(item => item.id !== id));
  }

  private toApi(product: Omit<Product, 'id'> | Product): Omit<ProdutoApi, 'id'> {
    return {
      nome: product.name,
      descricao: product.description,
      imagem: product.image,
      categoria: product.category,
      preco: product.price,
      disponivel: product.available,
      tempoPreparo: product.prepTime,
      alergicos: product.allergens ?? [],
      comboSlots: product.comboSlots?.map(slot => ({
        ...slot,
        type: slot.type ?? 'selectable'
      }))
    };
  }

  private parseId(id: string): number {
    const parsed = Number(id);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) throw new Error(`Identificador inválido de produto: ${id}`);
    return parsed;
  }
}
