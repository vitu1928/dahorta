import { computed, Injectable, signal } from '@angular/core';

import {
  MOCK_CATEGORIES,
  MOCK_COUPONS,
  MOCK_INSUMOS,
  MOCK_ORDERS,
  MOCK_PLATE_OF_DAY,
  MOCK_PRODUCTS,
  MOCK_REVIEWS,
  MOCK_STOCK_ITEMS,
  MOCK_STOCK_MOVEMENTS,
  MOCK_TECHNICAL_SHEETS,
  MOCK_USERS,
  generateDeliveryCode,
  getAllergensByProductId,
} from './mock-data';
import {
  Address,
  CartItem,
  Coupon,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  Review,
  StockMovement,
  User,
} from './models';

export interface ActionResult {
  success: boolean;
  message: string;
}

export interface LoginResult extends ActionResult {
  role?: User['role'];
}

export interface StockAvailabilityResult {
  available: boolean;
  missing: string[];
}

@Injectable({ providedIn: 'root' })
export class CustomerStateService {
  private readonly registeredUsers = signal<User[]>([...MOCK_USERS]);

  readonly currentUser = signal<User | null>(null);
  readonly products = signal<Product[]>([...MOCK_PRODUCTS]);
  readonly categories = signal([...MOCK_CATEGORIES]);
  readonly restaurantOpen = signal(true);
  readonly cart = signal<CartItem[]>([]);
  readonly orders = signal<Order[]>([...MOCK_ORDERS]);
  readonly activeOrderId = signal<string | null>(null);
  readonly insumos = signal([...MOCK_INSUMOS]);
  readonly technicalSheets = signal([...MOCK_TECHNICAL_SHEETS]);
  readonly reviews = signal<Review[]>([...MOCK_REVIEWS]);
  readonly stockItems = signal([...MOCK_STOCK_ITEMS]);
  readonly stockMovements = signal<StockMovement[]>([...MOCK_STOCK_MOVEMENTS]);
  readonly plateOfDay = signal({ ...MOCK_PLATE_OF_DAY });
  readonly coupons = signal<Coupon[]>([...MOCK_COUPONS]);
  readonly activeCoupon = signal<Coupon | null>(null);
  readonly orderNotes = signal('');

  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  readonly cartSubtotal = computed(() =>
    this.cart().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  readonly cartCount = computed(() =>
    this.cart().reduce((sum, item) => sum + item.quantity, 0),
  );

  readonly discountAmount = computed(() => {
    const coupon = this.activeCoupon();
    const subtotal = this.cartSubtotal();

    if (!coupon) {
      return 0;
    }

    if (coupon.type === 'percentage') {
      return subtotal * (coupon.value / 100);
    }

    if (coupon.type === 'fixed') {
      return coupon.value;
    }

    return 0;
  });

  readonly cartTotal = computed(() =>
    Math.max(0, this.cartSubtotal() - this.discountAmount()),
  );

  readonly deliveryFee = computed(() =>
    this.activeCoupon()?.type === 'shipping' ? 0 : 6,
  );

  readonly orderTotal = computed(() => this.cartTotal() + this.deliveryFee());

  readonly activeCoupons = computed(() =>
    this.coupons().filter((coupon) => coupon.active),
  );

  readonly todaySpecial = computed(() => {
    const productId = this.plateOfDay()[new Date().getDay()];
    return this.products().find((product) => product.id === productId) ?? this.products()[0] ?? null;
  });

  readonly visibleOrders = computed(() => {
    const user = this.currentUser();
    if (!user || user.role === 'owner') {
      return this.orders();
    }

    return this.orders().filter((order) => order.customerId === user.id);
  });

  login(email: string, password: string): LoginResult {
    const user = this.registeredUsers().find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password,
    );

    if (!user) {
      return { success: false, message: 'E-mail ou senha incorretos.' };
    }

    this.currentUser.set(user);
    return { success: true, message: 'Login realizado com sucesso!', role: user.role };
  }

  logout(): void {
    this.currentUser.set(null);
    this.cart.set([]);
    this.activeCoupon.set(null);
  }

  register(name: string, email: string, password: string, phone: string): ActionResult {
    const existingUser = this.registeredUsers().find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );

    if (existingUser) {
      return { success: false, message: 'Este e-mail ja esta cadastrado.' };
    }

    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      password,
      phone,
      role: 'customer',
      avatar: this.buildAvatar(name),
    };

    this.registeredUsers.update((users) => [...users, newUser]);
    this.currentUser.set(newUser);

    return { success: true, message: 'Conta criada com sucesso!' };
  }

  addToCart(product: Product, quantity = 1, subItems?: CartItem['subItems']): void {
    this.cart.update((items) => {
      if (subItems && subItems.length > 0) {
        return [
          ...items,
          {
            productId: product.id,
            name: product.name,
            quantity,
            price: product.price,
            image: product.image,
            subItems,
          },
        ];
      }

      const existing = items.find((item) => item.productId === product.id && !item.subItems);
      if (existing) {
        return items.map((item) =>
          item.productId === product.id && !item.subItems
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...items,
        {
          productId: product.id,
          name: product.name,
          quantity,
          price: product.price,
          image: product.image,
        },
      ];
    });
  }

  removeFromCart(productId: string): void {
    this.cart.update((items) => items.filter((item) => item.productId !== productId));
  }

  updateCartQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.cart.update((items) =>
      items.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
    );
  }

  clearCart(): void {
    this.cart.set([]);
    this.activeCoupon.set(null);
  }

  applyCoupon(code: string): ActionResult {
    const coupon = this.coupons().find(
      (item) => item.code.toUpperCase() === code.toUpperCase(),
    );

    if (!coupon) {
      return { success: false, message: 'Cupom nao encontrado.' };
    }

    if (!coupon.active) {
      return { success: false, message: 'Este cupom esta inativo.' };
    }

    if (coupon.expirationDate && new Date() > coupon.expirationDate) {
      return { success: false, message: 'Cupom expirado.' };
    }

    if (coupon.minOrderValue && this.cartSubtotal() < coupon.minOrderValue) {
      return {
        success: false,
        message: `Valor minimo para este cupom e R$ ${coupon.minOrderValue.toFixed(2)}.`,
      };
    }

    this.activeCoupon.set(coupon);
    return { success: true, message: 'Cupom aplicado com sucesso!' };
  }

  removeCoupon(): void {
    this.activeCoupon.set(null);
  }

  placeOrder(
    paymentMethod: PaymentMethod,
    address: Address,
    notes?: string,
    addressNotes?: string,
  ): Order | null {
    const user = this.currentUser();
    const cartItems = this.cart();

    if (!user || cartItems.length === 0) {
      return null;
    }

    const stockCheck = cartItems
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        missing: this.checkStockAvailability(item.productId, item.quantity).missing,
      }))
      .filter((item) => item.missing.length > 0);

    if (stockCheck.length > 0) {
      console.error('Estoque insuficiente:', stockCheck);
    }

    const newOrder: Order = {
      id: `ORD-${String(this.orders().length + 1).padStart(3, '0')}`,
      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone || '',
      items: [...cartItems],
      status: 'received',
      paymentMethod,
      deliveryAddress: address,
      subtotal: this.cartTotal(),
      deliveryFee: this.deliveryFee(),
      total: this.cartTotal() + this.deliveryFee(),
      createdAt: new Date(),
      deliveryCode: generateDeliveryCode(),
      notes,
      addressNotes,
    };

    cartItems.forEach((item) => this.deductStock(item.productId, item.quantity, newOrder.id));

    this.orders.update((orders) => [newOrder, ...orders]);
    this.cart.set([]);
    this.orderNotes.set('');
    this.activeCoupon.set(null);
    this.activeOrderId.set(newOrder.id);

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OrderStatus, motoboyId?: string): void {
    this.orders.update((orders) =>
      orders.map((order) =>
        order.id === orderId
          ? { ...order, status, ...(motoboyId ? { motoboyId } : {}) }
          : order,
      ),
    );
  }

  confirmDelivery(orderId: string, code: string): boolean {
    const order = this.orders().find((item) => item.id === orderId);

    if (!order || order.deliveryCode !== code) {
      return false;
    }

    this.orders.update((orders) =>
      orders.map((item) => (item.id === orderId ? { ...item, status: 'delivered' } : item)),
    );

    return true;
  }

  setActiveOrder(id: string | null): void {
    this.activeOrderId.set(id);
  }

  addReview(review: Omit<Review, 'id'>): void {
    const newReview: Review = {
      ...review,
      id: `rev${Date.now()}`,
    };

    this.reviews.update((reviews) => [...reviews, newReview]);
    this.orders.update((orders) =>
      orders.map((order) =>
        order.id === review.orderId ? { ...order, reviewId: newReview.id } : order,
      ),
    );
  }

  getOrderReview(orderId: string): Review | undefined {
    return this.reviews().find((review) => review.orderId === orderId);
  }

  getProductById(productId: string): Product | undefined {
    return this.products().find((product) => product.id === productId);
  }

  getAllergensByProductId(productId: string): string[] {
    return getAllergensByProductId(productId);
  }

  checkStockAvailability(productId: string, quantity: number): StockAvailabilityResult {
    const sheet = this.technicalSheets().find((item) => item.productId === productId);
    if (!sheet) {
      return { available: true, missing: [] };
    }

    const missing = sheet.ingredients.flatMap((ingredient) => {
      if (!ingredient.stockItemId) {
        return [];
      }

      const stockItem = this.stockItems().find((item) => item.id === ingredient.stockItemId);
      if (!stockItem) {
        return [];
      }

      let quantityNeeded = ingredient.quantity * quantity;
      if (ingredient.unit === 'un' && stockItem.yieldRule && stockItem.unit !== 'un') {
        quantityNeeded = ingredient.quantity * stockItem.yieldRule.yields * quantity;
      }

      return stockItem.currentQuantity < quantityNeeded ? [stockItem.name] : [];
    });

    return { available: missing.length === 0, missing };
  }

  updateOrderNotes(notes: string): void {
    this.orderNotes.set(notes);
  }

  reviewRequiresComment(stars: number, comment: string): boolean {
    return stars > 0 && stars <= 3 && comment.trim().length === 0;
  }

  private deductStock(productId: string, quantity: number, orderId: string): void {
    const sheet = this.technicalSheets().find((item) => item.productId === productId);
    if (!sheet) {
      return;
    }

    sheet.ingredients.forEach((ingredient) => {
      if (!ingredient.stockItemId) {
        return;
      }

      const stockItem = this.stockItems().find((item) => item.id === ingredient.stockItemId);
      if (!stockItem) {
        return;
      }

      let quantityToDeduct = ingredient.quantity * quantity;
      if (ingredient.unit === 'un' && stockItem.yieldRule && stockItem.unit !== 'un') {
        quantityToDeduct = ingredient.quantity * stockItem.yieldRule.yields * quantity;
      }

      this.stockItems.update((items) =>
        items.map((item) =>
          item.id === ingredient.stockItemId
            ? { ...item, currentQuantity: item.currentQuantity - quantityToDeduct }
            : item,
        ),
      );

      const currentUser = this.currentUser();
      const product = this.products().find((item) => item.id === productId);
      const movement: StockMovement = {
        id: `mov${Date.now()}_${Math.random()}`,
        stockItemId: ingredient.stockItemId,
        type: 'exit_auto',
        quantity: quantityToDeduct,
        userId: currentUser?.id || 'system',
        userName: currentUser?.name || 'Sistema',
        timestamp: new Date(),
        orderId,
        notes: `Baixa automatica - ${quantity}x ${product?.name}`,
      };

      this.stockMovements.update((movements) => [...movements, movement]);
    });
  }

  private buildAvatar(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
