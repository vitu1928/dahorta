# 🔨 ROADMAP PRÁTICO: Migração Cliente (Menu) React → Angular

**Objetivo:** Executar a reanálise e migração de forma incremental, começando agora mesmo.

---

## 📍 STATUS ATUAL

✅ Análise concluída: `ANALISE_CLIENTE_MENU_COMPLETA.md`  
⏳ **Próximo:** Iniciar FASE 0 (Setup Base)

---

## 🎯 EXECUÇÃO PASSO A PASSO

### FASE 0: Setup Base Angular (~2h)

**Objetivo:** Estrutura e configuração base para que as próximas fases funcionem sem obstáculos.

#### Task 0.1: Criar Estrutura de Pastas
```bash
# Executar no terminal
mkdir -p src/angular/src/domains/customer/{feature-menu,feature-cart,feature-checkout,feature-order-tracking,feature-orders-history,feature-profile,feature-layout,data-access,ui}
```

**Checklist:**
- [ ] Pastas criadas
- [ ] Verificar em VS Code

#### Task 0.2: Configurar Path Aliases
**Arquivo:** `src/angular/tsconfig.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@domain/customer": ["src/domains/customer"],
      "@domain/customer/*": ["src/domains/customer/*"],
      "@shared/ui": ["src/shared/ui"],
      "@shared/ui/*": ["src/shared/ui/*"],
      "@shared/models": ["src/shared/models"],
      "@shared/data-access": ["src/shared/data-access"]
    }
  }
}
```

**Checklist:**
- [ ] Paths configurados
- [ ] `ng build` sem erros de import

#### Task 0.3: Configurar Providers Globais
**Arquivo:** `src/angular/src/app/app.config.ts`

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // Será expandido conforme adicionar services
  ],
};
```

**Checklist:**
- [ ] Arquivo criado/atualizado
- [ ] App compila com sucesso

#### Task 0.4: Estruturar app.routes.ts
**Arquivo:** `src/angular/src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/customer/menu', pathMatch: 'full' },
  {
    path: 'customer',
    loadComponent: () => import('@domain/customer/feature-layout/customer-layout.component')
      .then(m => m.CustomerLayoutComponent),
    children: [
      { path: 'menu', loadComponent: () => import('@domain/customer/feature-menu/menu.component')
          .then(m => m.MenuComponent) },
      // Demais rotas serão adicionadas nas próximas fases
    ]
  },
];
```

**Checklist:**
- [ ] Rotas estruturadas
- [ ] `ng serve` sem erros

---

### FASE 1: Services + Models (~8h)

#### Task 1.1: Criar Models
**Arquivo:** `src/angular/src/domains/customer/data-access/customer.models.ts`

```typescript
export type UserRole = 'owner' | 'employee' | 'motoboy' | 'customer';
export type OrderStatus = 'received' | 'preparing' | 'ready' | 'delivering' | 'delivered';
export type InsumoUnit = 'g' | 'kg' | 'ml' | 'l' | 'un' | 'fatia' | 'folha' | 'colher' | 'porção';
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'meal_voucher' | 'cash';
export type CouponType = 'percentage' | 'fixed' | 'shipping' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface ComboSlot {
  id: string;
  name: string;
  type: 'fixed' | 'selectable';
  products: string[];
  allowSwap?: boolean;
}

export interface Product {
  id: string;
  name: string;
  internalName?: string;
  description: string;
  image: string;
  price: number;
  category: string;
  available: boolean;
  prepTime: number;
  featured?: boolean;
  desiredMargin?: number;
  isCombo?: boolean;
  comboSlots?: ComboSlot[];
}

export interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  zipCode: string;
}

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  subItems?: {
    slotName: string;
    productId: string;
    name: string;
  }[];
}

export interface Order {
  id: string;
  customerId: string;
  items: CartItem[];
  totalAmount: number;
  deliveryFee: number;
  discount: number;
  address: Address;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  deliveryCode?: string;
  motoboyId?: string;
  notes?: string;
  addressNotes?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  active: boolean;
  expirationDate?: Date;
  minOrderValue?: number;
  usageLimit?: number;
  usedCount: number;
  totalSalesVolume: number;
  restrictedCategories?: string[];
}

export interface Review {
  id: string;
  orderId: string;
  stars: number;
  comment?: string;
  createdAt: Date;
  customerId: string;
  customerName: string;
}

// Allergens
export const ALLERGEN_TYPES = [
  'Glúten', 'Soja', 'Nozes', 'Ovo', 'Peixe', 'Crustáceos', 'Leite'
] as const;

export const getAllergensByProductId = (productId: string): string[] => {
  // Será implementado com dados reais ou mock
  return [];
};
```

**Checklist:**
- [ ] Arquivo criado
- [ ] TypeScript compila sem erros

#### Task 1.2: Criar ProductsService
**Arquivo:** `src/angular/src/domains/customer/data-access/products.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';
import { Product, Category } from './customer.models';

// Mock data - será substituído por API
const MOCK_PRODUCTS: Product[] = [
  // ... copiar do React mockData.ts
];

const MOCK_CATEGORIES: Category[] = [
  // ... copiar do React mockData.ts
];

@Injectable({ providedIn: 'root' })
export class ProductsService {
  products = signal<Product[]>(MOCK_PRODUCTS);
  categories = signal<Category[]>(MOCK_CATEGORIES);

  availableProducts = computed(() => 
    this.products().filter(p => p.available)
  );

  getByCategory(category: string) {
    return computed(() =>
      this.availableProducts().filter(p => p.category === category)
    );
  }

  search(searchTerm: string) {
    return computed(() => {
      const term = searchTerm.toLowerCase();
      return this.availableProducts().filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    });
  }

  getById(id: string): Product | undefined {
    return this.products().find(p => p.id === id);
  }

  toggleAvailability(id: string) {
    const product = this.getById(id);
    if (product) {
      product.available = !product.available;
      this.products.set([...this.products()]);
    }
  }
}
```

**Checklist:**
- [ ] Arquivo criado
- [ ] Testa `availableProducts` computed signal
- [ ] Métodos de filtro funcionam

#### Task 1.3: Criar CartStateService
**Arquivo:** `src/angular/src/domains/customer/data-access/cart.state.ts`

```typescript
import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';
import { CartItem, Product } from './customer.models';

@Injectable({ providedIn: 'root' })
export class CartStateService {
  items = signal<CartItem[]>([]);

  count = computed(() =>
    this.items().reduce((acc, item) => acc + item.quantity, 0)
  );

  total = computed(() =>
    this.items().reduce((acc, item) => acc + item.price * item.quantity, 0)
  );

  addItem(product: Product, quantity: number = 1, subItems?: any[]) {
    const existing = this.items().find(item => item.productId === product.id);

    if (existing) {
      existing.quantity += quantity;
      this.items.set([...this.items()]);
    } else {
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        quantity,
        price: product.price,
        image: product.image,
        subItems: subItems,
      };
      this.items.set([...this.items(), newItem]);
    }
  }

  removeItem(productId: string) {
    this.items.set(this.items().filter(item => item.productId !== productId));
  }

  updateQuantity(productId: string, quantity: number) {
    const item = this.items().find(item => item.productId === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.items.set([...this.items()]);
    }
  }

  clear() {
    this.items.set([]);
  }
}
```

**Checklist:**
- [ ] Arquivo criado
- [ ] Métodos CRUD testáveis
- [ ] Signals e computed funcionam

#### Task 1.4: Criar OrdersService
**Arquivo:** `src/angular/src/domains/customer/data-access/orders.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';
import { Order, OrderStatus, PaymentMethod, Address, CartItem } from './customer.models';
import { CartStateService } from './cart.state';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  orders = signal<Order[]>([]);
  activeOrderId = signal<string | null>(null);

  activeOrder = computed(() => {
    const id = this.activeOrderId();
    return id ? this.orders().find(o => o.id === id) : null;
  });

  placeOrder(
    customerId: string,
    paymentMethod: PaymentMethod,
    address: Address,
    cartItems: CartItem[],
    totalAmount: number,
    discount: number = 0,
    notes?: string,
    addressNotes?: string
  ): Order {
    const order: Order = {
      id: `order-${Date.now()}`,
      customerId,
      items: cartItems,
      totalAmount,
      deliveryFee: 15, // Mock fee
      discount,
      address,
      paymentMethod,
      status: 'received',
      createdAt: new Date(),
      updatedAt: new Date(),
      notes,
      addressNotes,
      deliveryCode: Math.random().toString(36).substring(7).toUpperCase(),
    };

    this.orders.set([...this.orders(), order]);
    this.activeOrderId.set(order.id);
    return order;
  }

  updateStatus(orderId: string, status: OrderStatus, motoboyId?: string) {
    const order = this.orders().find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
      if (motoboyId) order.motoboyId = motoboyId;
      this.orders.set([...this.orders()]);
    }
  }

  getByCustomer(customerId: string): Order[] {
    return this.orders().filter(o => o.customerId === customerId);
  }

  confirmDelivery(orderId: string, code: string): boolean {
    const order = this.orders().find(o => o.id === orderId);
    if (order && order.deliveryCode === code) {
      order.status = 'delivered';
      order.updatedAt = new Date();
      this.orders.set([...this.orders()]);
      return true;
    }
    return false;
  }
}
```

**Checklist:**
- [ ] Arquivo criado
- [ ] Métodos de pedido implementados
- [ ] activeOrder computed funciona

#### Task 1.5: Criar CouponsService
**Arquivo:** `src/angular/src/domains/customer/data-access/coupons.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';
import { Coupon } from './customer.models';

// Mock
const MOCK_COUPONS: Coupon[] = [
  {
    id: '1',
    code: 'TESTE10',
    type: 'percentage',
    value: 10,
    active: true,
    usedCount: 0,
    totalSalesVolume: 0,
  },
];

@Injectable({ providedIn: 'root' })
export class CouponsService {
  coupons = signal<Coupon[]>(MOCK_COUPONS);
  activeCoupon = signal<Coupon | null>(null);

  discountAmount = computed(() => {
    const coupon = this.activeCoupon();
    // Será calculado baseado no carrinho
    return 0;
  });

  apply(code: string, cartTotal: number): { success: boolean; message: string } {
    const coupon = this.coupons().find(c => c.code === code && c.active);

    if (!coupon) {
      return { success: false, message: 'Cupom inválido' };
    }

    if (coupon.expirationDate && new Date() > coupon.expirationDate) {
      return { success: false, message: 'Cupom expirado' };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { success: false, message: 'Cupom limite de uso atingido' };
    }

    if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
      return { success: false, message: `Valor mínimo: R$ ${coupon.minOrderValue}` };
    }

    this.activeCoupon.set(coupon);
    return { success: true, message: 'Cupom aplicado!' };
  }

  remove() {
    this.activeCoupon.set(null);
  }

  calculateDiscount(cartTotal: number): number {
    const coupon = this.activeCoupon();
    if (!coupon) return 0;

    if (coupon.type === 'percentage') {
      return (cartTotal * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      return coupon.value;
    }
    return 0;
  }
}
```

**Checklist:**
- [ ] Arquivo criado
- [ ] Métodos de validação funcionam
- [ ] Cálculo de desconto correto

#### Task 1.6: Criar ReviewsService
**Arquivo:** `src/angular/src/domains/customer/data-access/reviews.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { Review } from './customer.models';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  reviews = signal<Review[]>([]);

  addReview(review: Omit<Review, 'id'>) {
    const newReview: Review = {
      id: `review-${Date.now()}`,
      ...review,
    };
    this.reviews.set([...this.reviews(), newReview]);
  }

  getByOrder(orderId: string): Review | undefined {
    return this.reviews().find(r => r.orderId === orderId);
  }
}
```

**Checklist:**
- [ ] Arquivo criado
- [ ] Métodos funcionam

#### Task 1.7: QA Fase 1
```bash
ng build
ng lint
```

**Checklist:**
- [ ] Build com sucesso
- [ ] Sem erros de lint
- [ ] Sem warnings TypeScript

---

### FASE 2: UI Dumb Components (~6h)

#### Task 2.1: Criar ProductCard Component
**Arquivo:** `src/angular/src/domains/customer/ui/product-card.component.ts`

```typescript
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../data-access/customer.models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-card" (click)="onSelect()">
      <div class="image-wrapper">
        <img [src]="product().image" [alt]="product().name" />
        @if (product().featured) {
          <div class="featured-badge">Destaque</div>
        }
      </div>
      <div class="content">
        <h3>{{ product().name }}</h3>
        <p>{{ product().description }}</p>
        <div class="footer">
          <span class="price">R$ {{ product().price.toFixed(2) }}</span>
          <span class="preptime">{{ product().prepTime }} min</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent {
  product = input.required<Product>();
  select = output<Product>();

  onSelect() {
    this.select.emit(this.product());
  }
}
```

**Checklist:**
- [ ] Arquivo criado
- [ ] Renderiza imagem, nome, descrição
- [ ] Emite evento ao clicar
- [ ] Exibe badge de destaque (se houver)

#### Task 2.2: Criar AllergenIcon Component
**Arquivo:** `src/angular/src/domains/customer/ui/allergen-icon.component.ts`

```typescript
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AllergenMap {
  name: string;
  color: string;
  icon: string;
}

@Component({
  selector: 'app-allergen-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (allergen() as allergen) {
      <div class="allergen-icon" [title]="allergen.name" [style.background-color]="allergen.color">
        <span>{{ allergen.icon }}</span>
      </div>
    }
  `,
  styleUrls: ['./allergen-icon.component.css'],
})
export class AllergenIconComponent {
  type = input.required<string>();

  allergen = computed(() => {
    const allergenMap: Record<string, AllergenMap> = {
      'Glúten': { name: 'Contém Glúten', color: '#E9C46A', icon: '🌾' },
      'Soja': { name: 'Contém Soja', color: '#4C7C59', icon: '🌱' },
      'Nozes': { name: 'Contém Nozes', color: '#F4A261', icon: '🥜' },
      'Ovo': { name: 'Contém Ovo', color: '#F4A261', icon: '🥚' },
      'Peixe': { name: 'Contém Peixe', color: '#457B9D', icon: '🐟' },
      'Crustáceos': { name: 'Contém Crustáceos', color: '#E76F51', icon: '🦐' },
      'Leite': { name: 'Contém Leite', color: '#A8DADC', icon: '🥛' },
    };
    return allergenMap[this.type()];
  });
}
```

**Checklist:**
- [ ] Arquivo criado
- [ ] Renderiza 7 tipos de alérgenos

#### Task 2.3: Criar CategoryFilter Component
**Arquivo:** `src/angular/src/domains/customer/ui/category-filter.component.ts`

```typescript
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../data-access/customer.models';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="category-filter">
      <button 
        [class.active]="!selectedCategory()"
        (click)="onSelect(null)"
      >
        Todos
      </button>
      @for (category of categories(); track category.id) {
        <button 
          [class.active]="selectedCategory() === category.id"
          (click)="onSelect(category.id)"
        >
          {{ category.name }}
        </button>
      }
    </div>
  `,
  styleUrls: ['./category-filter.component.css'],
})
export class CategoryFilterComponent {
  categories = input.required<Category[]>();
  selectedCategory = input<string | null>(null);
  selectCategory = output<string | null>();

  onSelect(categoryId: string | null) {
    this.selectCategory.emit(categoryId);
  }
}
```

**Checklist:**
- [ ] Arquivo criado
- [ ] Botões renderizam todas as categorias
- [ ] Emite seleção

#### Task 2.4: Criar CouponInput Component
**Arquivo:** `src/angular/src/domains/customer/ui/coupon-input.component.ts`

```typescript
import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-coupon-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="coupon-input">
      <input 
        [(ngModel)]="code"
        placeholder="Código do cupom"
      />
      <button (click)="onApply()">Aplicar</button>
      @if (error()) {
        <p class="error">{{ error() }}</p>
      }
    </div>
  `,
  styleUrls: ['./coupon-input.component.css'],
})
export class CouponInputComponent {
  code = signal('');
  error = signal('');
  apply = output<string>();

  onApply() {
    if (this.code()) {
      this.apply.emit(this.code());
      this.code.set('');
    }
  }

  setError(msg: string) {
    this.error.set(msg);
  }

  clearError() {
    this.error.set('');
  }
}
```

**Checklist:**
- [ ] Arquivo criado
- [ ] Input e botão funcionam
- [ ] Emite código ao aplicar

#### Task 2.5: Criar OrderTimeline Component
**Arquivo:** `src/angular/src/domains/customer/ui/order-timeline.component.ts`

```typescript
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatus } from '../data-access/customer.models';

interface TimelineStep {
  status: OrderStatus;
  label: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-order-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline">
      @for (step of steps; track step.status; let last = $last) {
        <div class="timeline-step" [class.active]="isActive(step.status)">
          <div class="step-icon" [style.background-color]="step.color">
            {{ step.icon }}
          </div>
          <div class="step-label">{{ step.label }}</div>
          @if (!last) {
            <div class="step-line" [class.filled]="isCompleted(step.status)"></div>
          }
        </div>
      }
    </div>
  `,
  styleUrls: ['./order-timeline.component.css'],
})
export class OrderTimelineComponent {
  currentStatus = input.required<OrderStatus>();

  steps: TimelineStep[] = [
    { status: 'received', label: 'Recebido', icon: '✓', color: '#a855f7' },
    { status: 'preparing', label: 'Preparando', icon: '👨‍🍳', color: '#d4745f' },
    { status: 'ready', label: 'Pronto', icon: '🕐', color: '#75B044' },
    { status: 'delivering', label: 'Entregando', icon: '🚴', color: '#2F80ED' },
    { status: 'delivered', label: 'Entregue', icon: '🏠', color: '#4CAF50' },
  ];

  statusIndex: Record<OrderStatus, number> = {
    received: 0,
    preparing: 1,
    ready: 2,
    delivering: 3,
    delivered: 4,
  };

  isActive(status: OrderStatus): boolean {
    return this.statusIndex[status] <= this.statusIndex[this.currentStatus()];
  }

  isCompleted(status: OrderStatus): boolean {
    return this.statusIndex[status] < this.statusIndex[this.currentStatus()];
  }
}
```

**Checklist:**
- [ ] Arquivo criado
- [ ] Timeline renderiza 5 status
- [ ] Icons e cores corretos

#### Task 2.6: QA Fase 2
```bash
ng build
ng lint
```

**Checklist:**
- [ ] Build com sucesso
- [ ] Todos os componentes Dumb testáveis isoladamente

---

### FASE 3: Menu + Layout (FOCO) (~10h)

#### Task 3.1: Criar CustomerLayoutComponent
**Arquivo:** `src/angular/src/domains/customer/feature-layout/customer-layout.component.ts`

```typescript
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartStateService } from '../data-access/cart.state';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="customer-layout">
      <!-- Sidebar Desktop -->
      <aside class="sidebar">
        <div class="logo">
          <span>🥗</span>
          <h1>DaHorta</h1>
        </div>
        <nav class="nav-menu">
          <a routerLink="/customer/menu" routerLinkActive="active" class="nav-item">
            🏠 Cardápio
          </a>
          <a routerLink="/customer/cart" routerLinkActive="active" class="nav-item">
            🛒 Carrinho
            @if (cartCount() > 0) {
              <span class="badge">{{ cartCount() }}</span>
            }
          </a>
          <a routerLink="/customer/orders" routerLinkActive="active" class="nav-item">
            📦 Meus Pedidos
          </a>
          <a routerLink="/customer/profile" routerLinkActive="active" class="nav-item">
            👤 Perfil
          </a>
        </nav>
        <button (click)="logout()" class="logout-btn">
          Sair
        </button>
      </aside>

      <!-- Content -->
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrls: ['./customer-layout.component.css'],
})
export class CustomerLayoutComponent {
  private cartState = inject(CartStateService);
  private router = inject(Router);

  cartCount = this.cartState.count;

  logout() {
    this.cartState.clear();
    this.router.navigate(['/login']);
  }
}
```

**Checklist:**
- [ ] Arquivo criado
- [ ] Sidebar renderiza com navegação
- [ ] Badge de carrinho atualiza em tempo real
- [ ] Logout funciona

#### Task 3.2: Criar MenuComponent (Smart)
**Arquivo:** `src/angular/src/domains/customer/feature-menu/menu.component.ts`

```typescript
import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../data-access/products.service';
import { CartStateService } from '../data-access/cart.state';
import { ProductCardComponent } from '../ui/product-card.component';
import { CategoryFilterComponent } from '../ui/category-filter.component';
import { Product } from '../data-access/customer.models';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, CategoryFilterComponent],
  template: `
    <div class="menu-container">
      <h1>Cardápio</h1>

      <!-- Filters -->
      <div class="filters">
        <app-category-filter 
          [categories]="categories()"
          [selectedCategory]="selectedCategory()"
          (selectCategory)="selectedCategory.set($event)"
        />
        <input 
          type="text"
          placeholder="Buscar produtos..."
          [(ngModel)]="searchTerm"
          class="search-input"
        />
      </div>

      <!-- Products Grid -->
      <div class="products-grid">
        @if (filteredProducts().length > 0) {
          @for (product of filteredProducts(); track product.id) {
            <app-product-card 
              [product]="product"
              (select)="openModal($event)"
            />
          }
        } @else {
          <p>Nenhum produto encontrado</p>
        }
      </div>

      <!-- Modal -->
      @if (selectedProduct() && modalOpen()) {
        <app-product-modal 
          [product]="selectedProduct()!"
          (close)="closeModal()"
          (add)="addToCart($event)"
        />
      }
    </div>
  `,
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
  private productsService = inject(ProductsService);
  private cartState = inject(CartStateService);

  selectedCategory = signal<string | null>(null);
  searchTerm = signal('');
  selectedProduct = signal<Product | null>(null);
  modalOpen = signal(false);

  categories = this.productsService.categories;
  products = this.productsService.availableProducts;

  filteredProducts = computed(() => {
    let items = this.products();
    
    // Filter by category
    if (this.selectedCategory()) {
      items = items.filter(p => p.category === this.selectedCategory());
    }

    // Filter by search
    const search = this.searchTerm().toLowerCase();
    if (search) {
      items = items.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
    }

    return items;
  });

  openModal(product: Product) {
    this.selectedProduct.set(product);
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
    this.selectedProduct.set(null);
  }

  addToCart(data: { product: Product; quantity: number; subItems?: any[] }) {
    this.cartState.addItem(data.product, data.quantity, data.subItems);
    this.closeModal();
  }
}
```

**Checklist:**
- [ ] Arquivo criado
- [ ] Grid de produtos renderiza
- [ ] Filtro por categoria funciona
- [ ] Busca funciona com debounce
- [ ] Modal abre ao clicar em produto

#### Task 3.3: Criar ProductModalComponent (Smart)
**Arquivo:** `src/angular/src/domains/customer/feature-menu/product-modal.component.ts`

```typescript
import { Component, input, output, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, ComboSlot } from '../data-access/customer.models';
import { ProductsService } from '../data-access/products.service';
import { AllergenIconComponent } from '../ui/allergen-icon.component';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, AllergenIconComponent],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="close-btn" (click)="close()">✕</button>

        <div class="modal-body">
          <!-- Image -->
          <div class="image-section">
            <img [src]="product().image" [alt]="product().name" />
          </div>

          <!-- Content -->
          <div class="content-section">
            <h2>{{ product().name }}</h2>
            <p class="price">R$ {{ product().price.toFixed(2) }}</p>
            
            <!-- Allergens -->
            <div class="allergens">
              @for (allergen of allergens(); track allergen) {
                <app-allergen-icon [type]="allergen" />
              }
            </div>

            <p class="description">{{ product().description }}</p>

            <!-- Combo Selector -->
            @if (product().isCombo && product().comboSlots) {
              <app-combo-selector 
                [slots]="product().comboSlots!"
                [selections]="selections()"
                (selectionsChange)="selections.set($event)"
              />
            }

            <!-- Quantity -->
            <div class="quantity-control">
              <button (click)="decrementQty()">−</button>
              <input type="number" [(ngModel)]="qty" />
              <button (click)="incrementQty()">+</button>
            </div>

            <!-- Add Button -->
            <button 
              class="add-btn"
              (click)="handleAdd()"
              [disabled]="adding()"
            >
              {{ adding() ? 'Adicionando...' : 'Adicionar ao Carrinho' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./product-modal.component.css'],
})
export class ProductModalComponent {
  product = input.required<Product>();
  close = output<void>();
  add = output<{ product: Product; quantity: number; subItems?: any[] }>();

  private productsService = inject(ProductsService);

  quantity = signal(1);
  qty = 1;
  selections = signal<Record<string, string>>({});
  adding = signal(false);

  allergens = computed(() => {
    // Will be replaced with real allergen data
    return [];
  });

  constructor() {
    // Pre-fill combos
    effect(() => {
      if (this.product().isCombo && this.product().comboSlots) {
        const initial: Record<string, string> = {};
        this.product().comboSlots!.forEach(slot => {
          if (slot.products.length > 0) {
            initial[slot.id] = slot.products[0];
          }
        });
        this.selections.set(initial);
      }
    });
  }

  incrementQty() {
    this.qty++;
    this.quantity.set(this.qty);
  }

  decrementQty() {
    if (this.qty > 1) {
      this.qty--;
      this.quantity.set(this.qty);
    }
  }

  handleAdd() {
    const product = this.product();
    
    if (product.isCombo) {
      const allSelected = product.comboSlots?.every(slot => this.selections()[slot.id]);
      if (!allSelected) {
        alert('Por favor, selecione todos os itens do combo.');
        return;
      }
    }

    const subItems = product.isCombo 
      ? product.comboSlots?.map(slot => ({
          slotName: slot.name,
          productId: this.selections()[slot.id],
          name: this.productsService.getById(this.selections()[slot.id])?.name || 'Item',
        }))
      : undefined;

    this.adding.set(true);
    setTimeout(() => {
      this.add.emit({
        product,
        quantity: this.qty,
        subItems,
      });
      this.adding.set(false);
    }, 400);
  }
}
```

**Checklist:**
- [ ] Arquivo criado
- [ ] Modal exibe detalhes do produto
- [ ] Allergens renderizam
- [ ] Quantity +/- funciona
- [ ] Combos: carousel (TBD) + grid de seleção
- [ ] Botão "Adicionar" emite evento

#### Task 3.4: Criar ComboSelectorComponent
**Arquivo:** `src/angular/src/domains/customer/feature-menu/combo-selector.component.ts`

```typescript
import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComboSlot } from '../data-access/customer.models';

@Component({
  selector: 'app-combo-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="combo-selector">
      <p class="title">Escolha seus itens:</p>

      <!-- Carousel de Slots -->
      <div class="slots-carousel">
        @for (slot of slots(); track slot.id; let idx = $index) {
          <button
            [class.active]="activeSlot() === idx"
            (click)="activeSlot.set(idx)"
            class="slot-button"
          >
            {{ slot.name }}
          </button>
        }
      </div>

      <!-- Grid de Opções -->
      @if (activeSlotData() as slot) {
        <div class="options-grid">
          <p>Opções para {{ slot.name }}:</p>
          <div class="grid">
            @for (productId of slot.products; track productId) {
              <button
                [class.selected]="selections()[slot.id] === productId"
                (click)="selectProduct(slot.id, productId)"
                class="option-btn"
              >
                {{ productId }}
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./combo-selector.component.css'],
})
export class ComboSelectorComponent {
  slots = input.required<ComboSlot[]>();
  selections = input.required<Record<string, string>>();
  selectionsChange = output<Record<string, string>>();

  activeSlot = signal(0);

  activeSlotData = computed(() => {
    return this.slots()[this.activeSlot()];
  });

  selectProduct(slotId: string, productId: string) {
    const newSelections = { ...this.selections(), [slotId]: productId };
    this.selectionsChange.emit(newSelections);
  }
}
```

**Checklist:**
- [ ] Arquivo criado
- [ ] Carousel de slots funciona
- [ ] Grid de opções renderiza
- [ ] Seleção emite evento

#### Task 3.5: Criar Menu Routes
**Arquivo:** `src/angular/src/domains/customer/feature-menu/menu.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { MenuComponent } from './menu.component';

export const MENU_ROUTES: Routes = [
  { path: '', component: MenuComponent },
];
```

**Checklist:**
- [ ] Arquivo criado

#### Task 3.6: Atualizar app.routes.ts
**Arquivo:** `src/angular/src/app/app.routes.ts`

Atualizar para incluir rotas de menu:

```typescript
import { MENU_ROUTES } from '@domain/customer/feature-menu/menu.routes';

// ... resto das rotas
{
  path: 'customer',
  loadComponent: () => import('@domain/customer/feature-layout/customer-layout.component')
    .then(m => m.CustomerLayoutComponent),
  children: [
    { path: 'menu', loadChildren: () => MENU_ROUTES },
    // Demais rotas
  ]
}
```

**Checklist:**
- [ ] Rotas atualizadas
- [ ] `ng serve` sem erros

#### Task 3.7: QA Fase 3
```bash
ng build
ng lint
ng serve
# Testar em http://localhost:4200/customer/menu
```

**Checklist:**
- [ ] Build com sucesso
- [ ] Menu renderiza corretamente
- [ ] Produtos aparecem
- [ ] Filtro por categoria funciona
- [ ] Busca funciona
- [ ] Click abre modal
- [ ] Adicionar ao carrinho funciona
- [ ] Badge atualiza

---

### Próximos Passos

**FASE 4:** Cart (~6h)  
**FASE 5:** Checkout (~8h)  
**FASE 6:** Order Tracking (~8h)  
**FASE 7:** Profile (~4h)  
**FASE 8:** QA + Fixes (~6h)

**Total:** ~50 horas

---

## 🎯 Como Começar Agora

```bash
# 1. Criar estrutura
mkdir -p src/angular/src/domains/customer/{feature-menu,feature-cart,feature-checkout,feature-order-tracking,feature-orders-history,feature-profile,feature-layout,data-access,ui}

# 2. Começar com FASE 1: Task 1.1 (Models)
# Criar arquivo: src/angular/src/domains/customer/data-access/customer.models.ts

# 3. Progressivamente executar os tasks

# 4. Em cada task:
#    - Criar arquivo
#    - Copiar código
#    - Marcar checklist
#    - Fazer commit semântico

# 5. Após FASE 1:
ng build  # Validar

# 6. Após FASE 2:
ng build  # Validar

# 7. Após FASE 3:
ng serve  # Testar Menu

```

