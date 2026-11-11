import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { EMPTY, Observable, Subscription, catchError, firstValueFrom, map, of, shareReplay, switchMap, tap, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/data-access/auth.service';
import { OrdersService } from './orders.service';
import { JwtTokenStore } from '../../../shared/data-access/jwt-token.store';
import { NotificationService } from './notification.service';
import { ToastService } from '../../../shared/data-access/toast.service';
import {
  Address,
  CartItem,
  Order,
  OrderStatus,
  PaymentMethod,
  PedidoResponseDTO,
  StatusPedidoApi
} from './customer.models';

const STATUS_TO_API: Record<OrderStatus, StatusPedidoApi> = {
  received: 'RECEBIDO',
  preparing: 'EM_PREPARO',
  ready: 'PRONTO_ENTREGA',
  delivering: 'SAIU_ENTREGA',
  delivered: 'ENTREGUE'
};

const STATUS_FROM_API: Record<StatusPedidoApi, OrderStatus> = {
  RECEBIDO: 'received',
  EM_PREPARO: 'preparing',
  PRONTO_ENTREGA: 'ready',
  SAIU_ENTREGA: 'delivering',
  ENTREGUE: 'delivered',
  CANCELADO: 'delivered'
};

interface ProdutoCatalogoApi {
  id: number;
  nome: string;
  disponivel: boolean;
}

@Injectable({ providedIn: 'root' })
export class RestOrdersService extends OrdersService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly tokenStore = inject(JwtTokenStore);
  private readonly notificationService = inject(NotificationService);
  private readonly toastService = inject(ToastService);
  private readonly baseUrl = `${environment.apiUrl}/pedidos`;

  override readonly orders = signal<Order[]>([]);
  override readonly activeOrderId = signal<string | null>(null);
  override readonly activeOrder = computed(() => {
    const id = this.activeOrderId();
    return id ? this.orders().find(order => order.id === id) ?? null : null;
  });
  private readonly pendingStatuses = new Map<string, { status: OrderStatus; previousStatus: OrderStatus }>();
  private readonly orderEventSubscriptions = new Map<string, Subscription>();
  private readonly orderEventStreams = new Map<string, Observable<Order | null>>();
  private readonly lastEventStatuses = new Map<string, OrderStatus>();

  constructor() {
    super();
    effect((onCleanup) => {
      const user = this.authService.currentUser();
      this.orders.set([]);
      if (!user) {
        return;
      }

      const subscription = timer(0, 5000).pipe(
        switchMap(() => this.http.get<PedidoResponseDTO[]>(this.baseUrl).pipe(
          map(response => response.map(dto => this.toOrder(dto))),
          catchError(error => {
            console.error('Não foi possível atualizar a lista de pedidos da API:', error);
            return EMPTY;
          })
        ))
      ).subscribe(orders => {
        this.orders.set(orders.map(order => {
          const pending = this.pendingStatuses.get(order.id);
          return pending ? { ...order, status: pending.status } : order;
        }));
        if (user.role === 'customer') {
          this.syncOrderEventSubscriptions(this.orders());
        } else {
          this.clearOrderEventSubscriptions();
        }
      });

      onCleanup(() => {
        subscription.unsubscribe();
        this.clearOrderEventSubscriptions();
      });
    });
  }

  override async placeOrder(
    _customerId: string,
    paymentMethod: PaymentMethod,
    address: Address,
    cartItems: CartItem[],
    _totalAmount: number,
    _discount = 0,
    notes?: string,
    addressNotes?: string,
    couponCode?: string
  ): Promise<Order> {
    const catalog = await firstValueFrom(
      this.http.get<ProdutoCatalogoApi[]>(`${environment.apiUrl}/produtos`)
    );
    const items = cartItems.map(item => {
      const normalizedName = this.normalizeProductName(item.name);
      const matches = catalog.filter(product =>
        this.normalizeProductName(product.nome) === normalizedName
      );
      if (matches.length !== 1 || !matches[0].disponivel) {
        throw new Error(`O produto "${item.name}" não está disponível na API. Atualize o cardápio e tente novamente.`);
      }
      return { produtoId: matches[0].id, quantidade: item.quantity };
    });

    const observacoes = [notes, addressNotes ? `Referência: ${addressNotes}` : undefined]
      .filter(Boolean)
      .join('\n');

    const response = await firstValueFrom(this.http.post<PedidoResponseDTO>(this.baseUrl, {
      itens: items,
      metodoPagamento: paymentMethod,
      enderecoEntrega: {
        rotulo: address.label,
        rua: address.street,
        numero: address.number,
        complemento: address.complement ?? null,
        bairro: address.neighborhood,
        cidade: address.city,
        cep: address.zipCode
      },
      observacoes: observacoes || null,
      cupomCodigo: couponCode || null
    }));
    const order = this.toOrder(response);
    this.activeOrderId.set(order.id);
    this.mergeOrder(order);
    this.syncOrderEventSubscriptions(this.orders());
    this.notifyStatusChange(order);
    return order;
  }

  override updateStatus(orderId: string, status: OrderStatus): void {
    const id = this.parseOrderId(orderId);
    const current = this.orders().find(order => order.id === orderId);
    if (!current || this.pendingStatuses.has(orderId)) return;
    this.pendingStatuses.set(orderId, { status, previousStatus: current.status });
    this.orders.update(orders => orders.map(order =>
      order.id === orderId ? { ...order, status, updatedAt: new Date() } : order
    ));
    this.http.patch<PedidoResponseDTO>(`${this.baseUrl}/${id}/status`, {
      status: STATUS_TO_API[status]
    }).pipe(
      tap(response => {
        this.pendingStatuses.delete(orderId);
        this.mergeOrder(this.toOrder(response));
      })
    ).subscribe({
      error: error => {
        this.pendingStatuses.delete(orderId);
        this.orders.update(orders => orders.map(order =>
          order.id === orderId && order.status === status
            ? { ...order, status: current.status, updatedAt: current.updatedAt }
            : order
        ));
        console.error('Não foi possível atualizar o status do pedido:', error);
        this.toastService.error('Não foi possível atualizar o pedido. O status anterior foi restaurado.');
      }
    });
  }

  override getByCustomer(customerId: string): Order[] {
    return this.orders().filter(order => order.customerId === customerId);
  }

  override async confirmDelivery(orderId: string, code: string): Promise<boolean> {
    await firstValueFrom(this.http.post<void>(
      `${this.baseUrl}/${this.parseOrderId(orderId)}/entrega/confirmacao`,
      { codigo: code }
    ));
    return true;
  }

  override async gerarCodigoEntrega(orderId: string): Promise<string> {
    const id = this.parseOrderId(orderId);
    const response = await firstValueFrom(this.http.post<{ codigo: string }>(
      `${this.baseUrl}/${id}/codigo-entrega`, {}
    ));
    this.orders.update(orders => orders.map(order =>
      order.id === orderId ? { ...order, deliveryCode: response.codigo } : order
    ));
    return response.codigo;
  }

  override subscribeToOrder(orderId: string): Observable<Order | null> {
    const existingStream = this.orderEventStreams.get(orderId);
    if (existingStream) return existingStream;

    const id = this.parseOrderId(orderId);
    const stream = new Observable<Order | null>(subscriber => {
      const controller = new AbortController();
      const token = this.tokenStore.get();
      if (!token) {
        subscriber.error(new Error('É necessário estar autenticado para acompanhar o pedido.'));
        return;
      }

      const readStream = async (): Promise<void> => {
        let delay = 1000;
        while (!controller.signal.aborted && !subscriber.closed) {
          try {
            const response = await fetch(`${this.baseUrl}/${id}/eventos`, {
              headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
              signal: controller.signal
            });
            if (!response.ok || !response.body) {
              throw new Error(`SSE do pedido respondeu HTTP ${response.status}.`);
            }
            delay = 1000;
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            while (!controller.signal.aborted && !subscriber.closed) {
              const { value, done } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
              const blocks = buffer.split('\n\n');
              buffer = blocks.pop() ?? '';
              for (const block of blocks) {
                const data = block.split('\n')
                  .filter(line => line.startsWith('data:'))
                  .map(line => line.slice(5).trim())
                  .join('\n');
                if (!data) continue;
                const event = JSON.parse(data) as { pedidoId: number };
                const dto = await firstValueFrom(this.http.get<PedidoResponseDTO>(`${this.baseUrl}/${event.pedidoId}`));
                const order = this.toOrder(dto);
                this.mergeOrder(order);
                subscriber.next(order);
              }
            }
            await reader.cancel().catch(() => undefined);
          } catch (error) {
            if (controller.signal.aborted || subscriber.closed) return;
            console.error('Conexão SSE do pedido interrompida; tentando reconectar:', error);
          }
          await new Promise(resolve => setTimeout(resolve, delay));
          delay = Math.min(delay * 2, 15000);
        }
      };

      void readStream();
      return () => controller.abort();
    }).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    this.orderEventStreams.set(orderId, stream);
    return stream;
  }

  private notifyStatusChange(order: Order): void {
    const messages: Partial<Record<OrderStatus, { title: string; body: string }>> = {
      received: { title: 'Pedido confirmado', body: `Seu pedido #${order.id} foi recebido.` },
      preparing: { title: 'Pedido em preparo', body: `Seu pedido #${order.id} está sendo preparado.` },
      ready: { title: 'Pedido pronto', body: `Seu pedido #${order.id} está pronto para entrega.` },
      delivering: { title: 'Pedido a caminho', body: `Seu pedido #${order.id} saiu para entrega.` },
      delivered: { title: 'Pedido entregue', body: `Seu pedido #${order.id} foi entregue. Bom apetite!` }
    };
    const message = messages[order.status];
    if (message) {
      this.notificationService.sendNotification(order.customerId, message.title, message.body, 'orderStatus');
    }
  }

  override updateMotoboyLocation(_motoboyId: string, lat: number, lng: number): void {
    this.http.post<void>(`${environment.apiUrl}/motoboys/me/localizacao`, {
      latitude: lat,
      longitude: lng
    }).subscribe({
      error: error => console.error('Não foi possível transmitir a localização do motoboy:', error)
    });
  }

  override getMotoboyLocation(
    _motoboyId: string,
    orderId?: string
  ): Observable<{ lat: number; lng: number; updatedAt: number } | null> {
    if (!orderId) {
      return of(null);
    }
    const id = this.parseOrderId(orderId);
    return timer(0, 5000).pipe(
      switchMap(() => this.http.get<{
        latitude: number;
        longitude: number;
        updatedAt: number;
      }>(`${this.baseUrl}/${id}/localizacao`).pipe(
        map(location => ({
          lat: location.latitude,
          lng: location.longitude,
          updatedAt: location.updatedAt
        })),
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            return of(null);
          }
          console.error('Não foi possível atualizar a localização do motoboy:', error);
          return of(null);
        })
      ))
    );
  }

  private parseOrderId(orderId: string): number {
    const id = Number(orderId);
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error(`Identificador inválido de pedido: ${orderId}`);
    }
    return id;
  }

  private normalizeProductName(name: string): string {
    return name.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLocaleLowerCase('pt-BR');
  }

  private toOrder(dto: PedidoResponseDTO): Order {
    const id = String(dto.id);
    const cachedDeliveryCode = this.orders().find(order => order.id === id)?.deliveryCode;
    const address: Address = {
      id: '',
      label: dto.enderecoEntrega.rotulo ?? '',
      street: dto.enderecoEntrega.rua,
      number: dto.enderecoEntrega.numero,
      complement: dto.enderecoEntrega.complemento ?? undefined,
      neighborhood: dto.enderecoEntrega.bairro,
      city: dto.enderecoEntrega.cidade,
      zipCode: dto.enderecoEntrega.cep
    };
    const items: CartItem[] = dto.itens.map(item => ({
      productId: String(item.produtoId),
      name: item.nomeProduto,
      quantity: item.quantidade,
      price: item.precoUnitario,
      image: item.imagem ?? ''
    }));
    const createdAt = new Date(dto.criadoEm);
    const updatedAt = new Date(dto.atualizadoEm);

    return {
      id,
      customerId: String(dto.clienteId),
      customerName: dto.clienteNome,
      items,
      totalAmount: dto.total,
      subtotal: dto.subtotal,
      deliveryFee: dto.taxaEntrega,
      discount: dto.desconto,
      address,
      deliveryAddress: address,
      paymentMethod: dto.metodoPagamento,
      status: STATUS_FROM_API[dto.status],
      createdAt,
      updatedAt,
      deliveryCode: dto.codigoEntrega ?? cachedDeliveryCode,
      motoboyId: dto.motoboyId === null ? undefined : String(dto.motoboyId),
      motoboyName: dto.motoboyNome ?? undefined,
      notes: dto.observacoes ?? undefined,
      total: dto.total,
      couponCode: dto.cupomCodigo ?? undefined
    };
  }

  private mergeOrder(order: Order): void {
    this.orders.update(orders => [
      order,
      ...orders.filter(existing => existing.id !== order.id)
    ]);
  }

  private syncOrderEventSubscriptions(orders: Order[]): void {
    for (const order of orders) {
      const previousStatus = this.lastEventStatuses.get(order.id);
      if (previousStatus && previousStatus !== order.status) {
        this.notifyStatusChange(order);
      }
      this.lastEventStatuses.set(order.id, order.status);
    }

    const activeOrders = orders.filter(order => order.status !== 'delivered');
    const activeIds = new Set(activeOrders.map(order => order.id));

    for (const [orderId, subscription] of this.orderEventSubscriptions) {
      if (!activeIds.has(orderId)) {
        subscription.unsubscribe();
        this.orderEventSubscriptions.delete(orderId);
        this.orderEventStreams.delete(orderId);
      }
    }
    for (const orderId of this.lastEventStatuses.keys()) {
      if (!activeIds.has(orderId)) this.lastEventStatuses.delete(orderId);
    }

    for (const order of activeOrders) {
      if (this.orderEventSubscriptions.has(order.id)) continue;

      const subscription = this.subscribeToOrder(order.id).subscribe({
        next: updatedOrder => {
          if (!updatedOrder) return;
          const previousStatus = this.lastEventStatuses.get(updatedOrder.id);
          if (previousStatus && previousStatus !== updatedOrder.status) {
            this.notifyStatusChange(updatedOrder);
          }
          this.lastEventStatuses.set(updatedOrder.id, updatedOrder.status);
        },
        error: error => console.error(`Não foi possível acompanhar o pedido #${order.id}:`, error)
      });
      this.orderEventSubscriptions.set(order.id, subscription);
    }
  }

  private clearOrderEventSubscriptions(): void {
    this.orderEventSubscriptions.forEach(subscription => subscription.unsubscribe());
    this.orderEventSubscriptions.clear();
    this.orderEventStreams.clear();
    this.lastEventStatuses.clear();
  }
}
