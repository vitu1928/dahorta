# 📊 ANÁLISE COMPLETA: Cliente (Menu) - React para Angular

**Data:** 2026-06-10  
**Versão:** v1.0 (Atualizado React)  
**Status:** ✅ Pronto para Migração Angular

---

## 📑 Índice
1. [Análise de Negócio](#análise-de-negócio)
2. [Mapeamento Técnico React](#mapeamento-técnico-react)
3. [Arquitetura Angular Proposta](#arquitetura-angular-proposta)
4. [Matriz de Conversão Técnica](#matriz-de-conversão-técnica)
5. [Plano de Migração](#plano-de-migração)
6. [Checklist de Implementação](#checklist-de-implementação)

---

## 🎯 Análise de Negócio

### Contexto de Negócio - Dark Kitchen "DaHorta"
- **Modelo:** Dark Kitchen (delivery-only, sem salão)
- **Especialidade:** Refeições saudáveis, bowls orgânicos com ingredientes frescos
- **Ator Foco:** Cliente (Customer) - comprador final

### Permissões e Fluxo do Cliente

| Ator | Permissões | Ações no Menu | Regras |
|------|-----------|---------------|--------|
| **Cliente** | Visualizar menu, adicionar ao carrinho, fazer pedidos | <ul><li>Ver produtos disponíveis</li><li>Filtrar por categoria</li><li>Buscar produtos</li><li>Ver allergens</li><li>Ver tempo de preparo</li><li>Adicionar ao carrinho</li><li>Montar combos (se aplicável)</li></ul> | <ul><li>Produtos devem estar `available: true`</li><li>Deve ser possível ver informações nutricionais/alérgenos</li><li>Filtros por categoria obrigatórios</li><li>Busca por nome/ingredientes</li><li>Carrinho persiste em session</li><li>Combos permitem seleção de itens por slot</li></ul> |

### Fluxo Completo do Cliente

```
Landing Page
    ↓
Menu (FOCO DESTA ANÁLISE)
    ├─ Ver produtos disponíveis
    ├─ Filtrar por categoria
    ├─ Buscar por nome/ingredientes
    ├─ Ver detalhes (allergens, prepTime, preço)
    ├─ Montar combo (se aplicável)
    └─ Adicionar ao carrinho
         ↓
Carrinho
    ├─ Ver items adicionados
    ├─ Aplicar cupom desconto
    ├─ Remover items
    └─ Proceder ao checkout
         ↓
Checkout
    ├─ Informar endereço
    ├─ Escolher método de pagamento
    └─ Confirmar pedido
         ↓
Order Tracking
    ├─ Acompanhar preparo em tempo real
    ├─ Receber notificações
    └─ Avaliar pedido
```

### Regras de Negócio Validadas

✅ **Produtos em Menu:**
- Apenas produtos com `available: true` devem aparecer
- Produtos podem ser "destaque" (`featured: true`)
- Produtos podem ser combos (`isCombo: true`)

✅ **Categorias:**
- Menu deve ter filtros por categoria
- Cada categoria tem icon
- MOCK_CATEGORIES fornece dados

✅ **Allergens:**
- Cada produto pode ter alérgenos (Glúten, Soja, Nozes, Ovo, Peixe, Crustáceos, Leite)
- Icons visuais de alérgenos obrigatórios
- Função `getAllergensByProductId()` implementada

✅ **Combos:**
- Produtos podem ser combos (ex: montar seu próprio bowl)
- Cada combo tem slots (ex: proteína, grãos, molho)
- Cliente seleciona 1 produto por slot
- Carousel de seleção de slots
- Grid de opções para cada slot

✅ **Carrinho:**
- Items são persistidos em `cart: CartItem[]`
- CartItem estende OrderItem
- Suporta `subItems` para combos
- Métodos: `addToCart`, `removeFromCart`, `updateCartQuantity`, `clearCart`

✅ **Cupons:**
- Cupons aplicáveis ao carrinho
- Tipos: `percentage`, `fixed`, `shipping`, `inactive`
- Validação: expiração, limite de uso, ordem mínima
- Função `applyCoupon()` valida e aplica

### Validação: Implementação React Cumpre 100% as Regras?

| Regra | React | Status | Notas |
|-------|-------|--------|-------|
| Exibir produtos disponíveis | ✅ Implementado em MenuPage | ✅ OK | Usa `useApp().products` filtrado |
| Filtrar por categoria | ✅ Implementado | ✅ OK | State local `selectedCategory` |
| Buscar por nome | ✅ Implementado | ✅ OK | State local `searchTerm` com debounce |
| Exibir allergens | ✅ Implementado | ✅ OK | Component `AllergenIcon` com 7 tipos |
| Suportar combos | ✅ Implementado | ✅ OK | ProductModal com carousel e grid |
| Carrinho persiste | ⚠️ Apenas em sessão | ⚠️ ATENÇÃO | Sem localStorage/BD - perder ao refresh |
| Cupons funcionam | ✅ Implementado | ✅ OK | `applyCoupon()` valida tudo |

**GAPs Identificados:**
- ⚠️ Carrinho não persiste ao refresh (apenas Context em memória)
- ⚠️ Sem sincronização em tempo real com backend (mock data)
- ⚠️ Sem tratamento de estoque (verifica disponibilidade do produto, mas não quantity por combo slot)

---

## 🔧 Mapeamento Técnico React

### Estrutura de Pastas Atual

```
src/react/
├── app/
│   ├── pages/customer/
│   │   ├── CustomerLayout.tsx          (Layout/Sidebar do Cliente)
│   │   ├── MenuPage.tsx                 (FOCO: Listagem e Modal de Produtos)
│   │   ├── CartPage.tsx                 (Carrinho)
│   │   ├── CheckoutPage.tsx             (Checkout)
│   │   ├── OrderTrackingPage.tsx        (Acompanhamento)
│   │   ├── OrdersPage.tsx               (Histórico)
│   │   └── ProfilePage.tsx              (Perfil)
│   ├── components/
│   │   ├── MockDeliveryMap.tsx
│   │   └── figma/
│   │       └── ImageWithFallback.tsx
│   │   └── ui/
│   │       └── [shadcn components]
│   └── store/
│       ├── AppContext.tsx               (Global State)
│       └── mockData.ts                  (Tipos + Mock Data)
└── styles/
    ├── tailwind.css
    ├── theme.css
    ├── fonts.css
    └── index.css
```

### Componentes React - MenuPage

#### 1. **MenuPage.tsx** (Principal)

**Props:** Nenhuma (Consumer do Context)

**Estados Locais:**
```typescript
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
const [searchTerm, setSearchTerm] = useState("");
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
const [sortOption, setSortOption] = useState<"featured" | "name" | "price">("featured");
```

**Context Consumido:**
```typescript
const { products, cart, addToCart, categories } = useApp();
```

**Dependências Externas:**
- `motion` (Framer Motion) - animações
- `lucide-react` - icons
- `ImageWithFallback` - component customizado
- `AllergenIcon` - sub-component local
- `ProductModal` - sub-component local

**Lógica Principal:**
1. Filtra produtos por categoria (se selecionada)
2. Filtra por searchTerm (debounce)
3. Ordena por: featured, nome, preço
4. Renderiza grid de ProductCards
5. Abre Modal ao clicar em produto

**Lifecycle:**
- Sem `useEffect` complexos
- Apenas renderização condicional

---

#### 2. **AllergenIcon.tsx** (Sub-component)

**Props:**
```typescript
{ type: string } // "Gluten", "Soja", "Nozes", "Ovo", "Peixe", "Crustáceos", "Leite"
```

**Lógica:**
- Retorna SVG inline com cor específica
- Tooltip com nome do alérgeno
- Map hardcoded: `allergenMap: Record<string, { svg, color, name }>`

---

#### 3. **ProductModal.tsx** (Sub-component)

**Props:**
```typescript
{
  product: Product;
  onClose: () => void;
  onAdd: (product: Product, quantity: number, subItems?: any[]) => void;
  quantity: number;
}
```

**Estados Locais:**
```typescript
const [adding, setAdding] = useState(false);
const [selections, setSelections] = useState<Record<string, string>>({});
const [localQty, setLocalQty] = useState(1);
const [activeSlotIndex, setActiveSlotIndex] = useState(0);
```

**Context Consumido:**
```typescript
const { products } = useApp();
```

**Lógica:**
1. Se combo:
   - Carousel de slots com produtos disponíveis
   - Grid de seleção por slot
   - Valida que todos os slots foram preenchidos
2. Se não combo:
   - Apenas mostra imagem, descrição, preço, allergens
3. Quantidade com +/- buttons
4. Ao clicar "Adicionar", chama `onAdd()` com subItems (se combo)

**Efeitos:**
```typescript
useEffect(() => {
  if (product.isCombo && product.comboSlots) {
    // Pre-fill combos com primeiro item de cada slot
    const initial: Record<string, string> = {};
    product.comboSlots.forEach(slot => {
      if (slot.products && slot.products.length > 0) {
        initial[slot.id] = slot.products[0];
      }
    });
    setSelections(initial);
  }
}, [product.id, product.isCombo, product.comboSlots]);

useEffect(() => {
  if (carouselRef.current) {
    // Scroll carousel para o slot ativo
    const activeEl = carouselRef.current.children[activeSlotIndex] as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", inline: "center" });
    }
  }
}, [activeSlotIndex]);
```

---

### Componentes React - Suporte (Layout, Context, Utils)

#### 4. **CustomerLayout.tsx**

**Responsabilidade:**
- Layout principal do Cliente
- Sidebar desktop com navegação
- Navbar mobile
- Outlet para sub-rotas

**Navigation Items:**
- Cardápio (`/menu`)
- Carrinho (`/cart`, com badge de quantidade)
- Meus Pedidos (`/orders`)
- Meu Perfil (`/profile`)

**Context Consumido:**
```typescript
const { cartCount, logout, currentUser } = useApp();
```

---

#### 5. **CartPage.tsx**

**Responsabilidades:**
- Exibir items do carrinho
- Permitir remover / atualizar quantidade
- Aplicar cupom desconto
- Ver resumo de preços
- Navegação para checkout

**Estados Locais:**
```typescript
const [couponInput, setCouponInput] = useState("");
const [couponError, setCouponError] = useState("");
```

**Context Consumido:**
```typescript
const {
  cart, cartTotal, cartCount, deliveryFee,
  removeFromCart, updateCartQuantity,
  orderNotes, setOrderNotes,
  applyCoupon, removeCoupon,
  activeCoupon, discountAmount, coupons
} = useApp();
```

---

#### 6. **CheckoutPage.tsx**

**Responsabilidades:**
- 3 passos: Endereço → Pagamento → Confirmar
- Formulário de endereço
- Seleção de método de pagamento
- Resumo e confirmação de pedido

**Estados Locais:**
```typescript
const [step, setStep] = useState<"address" | "payment" | "confirm">("address");
const [address, setAddress] = useState<Address>({ ... });
const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
const [addressNotes, setAddressNotes] = useState("");
const [change, setChange] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
```

**Métodos de Pagamento Suportados:**
- PIX
- Cartão de Crédito
- Cartão de Débito
- Vale Refeição (VR, Alelo, Sodexo, Flash)
- Dinheiro

---

#### 7. **OrderTrackingPage.tsx**

**Responsabilidades:**
- Timeline de status do pedido
- Mapa simulado de entrega (MockDeliveryMap)
- Formulário de avaliação (Review)
- Dados de entrega

**Timeline Statuses:**
```typescript
received → preparing → ready → delivering → delivered
```

**Component ReviewForm:**
- 5 stars selector (Excellent/Very Good/Regular/Bad/Terrible)
- Campo de comentário (obrigatório para avaliações ≤ 3 stars)
- Submissão com feedback visual

---

#### 8. **OrdersPage.tsx**

**Responsabilidades:**
- Listar histórico de pedidos do Cliente
- Filtros por status
- Link para acompanhamento de pedido ativo
- Data/hora do pedido

---

#### 9. **ProfilePage.tsx**

**Responsabilidades:**
- Dados do usuário (nome, email, telefone)
- Endereços salvos (CRUD)
- Método de pagamento preferido
- Logout

---

#### 10. **AppContext.tsx** (Global State)

**Estrutura de Estado:**
```typescript
interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  products: Product[];
  categories: Category[];
  restaurantOpen: boolean;
  cart: CartItem[];
  orders: Order[];
  activeOrderId: string | null;
  suppliers: Supplier[];
  insumos: Insumo[];
  priceRecords: PriceRecord[];
  technicalSheets: TechnicalSheet[];
  reviews: Review[];
  stockItems: StockItem[];
  stockMovements: StockMovement[];
  plateOfDay: PlateOfDayConfig;
  coupons: Coupon[];
  activeCoupon: Coupon | null;
  discountAmount: number;
}
```

**Métodos Relevantes para Cliente/Menu:**
```typescript
// Autenticação
login(email, password) → { success, message, role }
logout() → void
register(name, email, password, phone) → { success, message }

// Produtos
addToCart(product, quantity?, subItems?) → void
removeFromCart(productId) → void
updateCartQuantity(productId, quantity) → void
clearCart() → void
toggleProductAvailability(id) → void

// Carrinho
cartTotal: number (computed)
cartCount: number (computed)
deliveryFee: number

// Cupons
applyCoupon(code) → { success, message }
removeCoupon() → void
discountAmount: number (computed)

// Pedidos
placeOrder(paymentMethod, address, notes?, addressNotes?) → Order | null
updateOrderStatus(orderId, status, motoboyId?) → void
confirmDelivery(orderId, code) → boolean

// Reviews
addReview(review) → void
getOrderReview(orderId) → Review | undefined

// Order Notes
orderNotes: string
setOrderNotes(notes) → void
```

---

### Componentes UI Utilizados

**shadcn Components Usados no Menu:**
- Button
- Input
- Dialog (Modal)
- Popover
- Tabs
- Badge
- Separator

**Icons (lucide-react):**
- Plus, Minus, Trash2, ShoppingCart, ArrowLeft
- Clock, Star, Search, ChevronRight, X
- Tag, Percent, CheckCircle2, MapPin, CreditCard
- E mais...

**Bibliotecas de Animação:**
- Framer Motion (`motion` + `AnimatePresence`)

---

## ⚙️ Arquitetura Angular Proposta

### Estrutura de Pastas Alvo

```
src/angular/src/
├── app/
│   ├── app.routes.ts                (Configuração de rotas)
│   ├── app.config.ts                (Providers globais)
│   └── app.component.ts             (Root component)
├── domains/
│   └── customer/
│       ├── feature-menu/            ⭐ FOCO DESTA MIGRAÇÃO
│       │   ├── menu.component.ts    (Smart - Listagem + Modal)
│       │   ├── menu.component.html
│       │   ├── menu.component.css
│       │   ├── menu.routes.ts       (Sub-rotas)
│       │   ├── product-modal.component.ts (Modal)
│       │   ├── product-modal.component.html
│       │   ├── product-modal.component.css
│       │   └── combo-selector.component.ts (Carousel de combos)
│       │
│       ├── feature-cart/
│       │   ├── cart.component.ts
│       │   ├── cart.component.html
│       │   ├── cart.component.css
│       │   └── cart.routes.ts
│       │
│       ├── feature-checkout/
│       │   ├── checkout.component.ts
│       │   ├── checkout.component.html
│       │   ├── checkout.component.css
│       │   ├── checkout-address.component.ts
│       │   ├── checkout-payment.component.ts
│       │   └── checkout.routes.ts
│       │
│       ├── feature-order-tracking/
│       │   ├── order-tracking.component.ts
│       │   ├── order-tracking.component.html
│       │   ├── order-tracking.component.css
│       │   ├── order-timeline.component.ts
│       │   ├── order-review.component.ts
│       │   └── order-tracking.routes.ts
│       │
│       ├── feature-orders-history/
│       │   ├── orders.component.ts
│       │   ├── orders.component.html
│       │   ├── orders.component.css
│       │   └── orders.routes.ts
│       │
│       ├── feature-profile/
│       │   ├── profile.component.ts
│       │   ├── profile.component.html
│       │   ├── profile.component.css
│       │   └── profile.routes.ts
│       │
│       ├── feature-layout/          (Layout do Cliente)
│       │   ├── customer-layout.component.ts
│       │   ├── customer-layout.component.html
│       │   ├── customer-layout.component.css
│       │   └── customer-layout.routes.ts
│       │
│       ├── data-access/
│       │   ├── customer.service.ts          (Métodos do Cliente)
│       │   ├── cart.state.ts               (Signal-based state do Carrinho)
│       │   ├── orders.service.ts           (Pedidos)
│       │   ├── products.service.ts         (Produtos)
│       │   ├── coupons.service.ts          (Cupons)
│       │   ├── reviews.service.ts          (Avaliações)
│       │   └── customer.models.ts          (TypeScript models)
│       │
│       ├── ui/
│       │   ├── product-card.component.ts  (Card de Produto - Dumb)
│       │   ├── product-card.component.html
│       │   ├── product-card.component.css
│       │   ├── allergen-icon.component.ts (Icon de Alérgeno - Dumb)
│       │   ├── allergen-icon.component.html
│       │   ├── allergen-icon.component.css
│       │   ├── category-filter.component.ts (Filtro de Categoria - Dumb)
│       │   ├── order-timeline.component.ts (Timeline - Dumb)
│       │   ├── order-timeline.component.html
│       │   ├── coupon-input.component.ts   (Cupom Input - Dumb)
│       │   └── coupon-input.component.html
│       │
│       └── customer.routes.ts      (Rotas raiz do domínio)
│
├── shared/
│   ├── ui/
│   │   ├── button.component.ts      (Design System)
│   │   ├── input.component.ts
│   │   ├── dialog.component.ts
│   │   ├── badge.component.ts
│   │   ├── tabs.component.ts
│   │   └── ... (outros componentes shadcn)
│   │
│   ├── models/
│   │   ├── app.models.ts            (User, Order, Product, Category, etc.)
│   │   └── payment.models.ts        (PaymentMethod, Address, etc.)
│   │
│   ├── data-access/
│   │   ├── app.service.ts           (Global State/Context equivalente)
│   │   ├── auth.service.ts          (Autenticação)
│   │   ├── http.service.ts          (Wrapper HttpClient)
│   │   └── storage.service.ts       (LocalStorage, SessionStorage)
│   │
│   └── utils/
│       ├── currency.pipe.ts         (Pipe para BRL)
│       ├── format.utils.ts          (Funções de formato)
│       └── validators.ts            (Validadores customizados)
│
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

---

### Conversão de Componentes React → Angular

#### MenuPage.tsx → menu.component.ts + menu.component.html

**Mudanças Estruturais:**

1. **Smart Component** (injetar serviços, gerenciar estado)
2. **Usar Signals para estado local:**
   ```typescript
   selectedCategory = signal<string | null>(null);
   searchTerm = signal("");
   selectedProduct = signal<Product | null>(null);
   sortOption = signal<"featured" | "name" | "price">("featured");
   ```

3. **Usar Computed para dados derivados:**
   ```typescript
   filteredProducts = computed(() => {
     const products = this.productsService.products();
     const category = this.selectedCategory();
     const search = this.searchTerm();
     // ... filter logic
     return filtered;
   });
   ```

4. **Usar Control Flow moderno:**
   ```html
   @if (filteredProducts().length > 0) {
     <div class="grid">
       @for (product of filteredProducts(); track product.id) {
         <app-product-card [product]="product" (click)="openModal(product)" />
       }
     </div>
   } @else {
     <p>Nenhum produto encontrado</p>
   }
   ```

5. **Modal via dialog/popover Angular:**
   ```typescript
   productModalOpen = signal(false);
   selectedProduct = signal<Product | null>(null);

   openModal(product: Product) {
     this.selectedProduct.set(product);
     this.productModalOpen.set(true);
   }

   closeModal() {
     this.productModalOpen.set(false);
   }
   ```

---

#### AllergenIcon.tsx → allergen-icon.component.ts

**Conversão:**
```typescript
@Component({
  selector: 'app-allergen-icon',
  standalone: true,
  template: `
    @if (allergen() as allergen) {
      <div class="allergen-badge" [title]="allergen.name">
        <!-- SVG inline -->
      </div>
    }
  `,
  styleUrls: ['./allergen-icon.component.css']
})
export class AllergenIconComponent {
  type = input.required<string>();

  allergen = computed(() => {
    // Map de alérgenos
    const allergenMap = { ... };
    return allergenMap[this.type()];
  });
}
```

---

#### ProductModal.tsx → product-modal.component.ts

**Conversão:**
```typescript
@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ComboSelectorComponent],
  template: `...`
})
export class ProductModalComponent {
  product = input.required<Product>();
  onClose = output<void>();
  onAdd = output<{ product: Product; quantity: number; subItems: any[] }>();

  adding = signal(false);
  selections = signal<Record<string, string>>({});
  localQty = signal(1);
  activeSlotIndex = signal(0);

  products = inject(ProductsService).products;

  ngOnInit() {
    if (this.product().isCombo && this.product().comboSlots) {
      // Pre-fill combos
    }
  }

  handleAdd() {
    // ... logic
  }
}
```

---

#### AppContext.tsx → app.service.ts + Multiple Feature Services

**Conversão - Centralizar em app.service.ts (providedIn: 'root'):**

```typescript
@Injectable({ providedIn: 'root' })
export class AppService {
  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);
  products = signal<Product[]>(MOCK_PRODUCTS);
  categories = signal<Category[]>(MOCK_CATEGORIES);
  restaurantOpen = signal(true);

  // Métodos
  login(email: string, password: string) { ... }
  logout() { ... }
  // ... outros métodos
}
```

**Conversão - Serviços Específicos:**

1. **CartStateService** (Signals-based):
   ```typescript
   @Injectable({ providedIn: 'root' })
   export class CartStateService {
     items = signal<CartItem[]>([]);
     total = computed(() => {
       return this.items().reduce((acc, item) => acc + item.price * item.quantity, 0);
     });
     count = computed(() => {
       return this.items().reduce((acc, item) => acc + item.quantity, 0);
     });

     addItem(product: Product, quantity: number, subItems?: any[]) {
       // logic
     }

     removeItem(productId: string) { ... }
   }
   ```

2. **ProductsService**:
   ```typescript
   @Injectable({ providedIn: 'root' })
   export class ProductsService {
     products = signal<Product[]>(MOCK_PRODUCTS);

     getByCategory(category: string) {
       return this.products().filter(p => p.category === category);
     }

     search(term: string) {
       return this.products().filter(p => 
         p.name.toLowerCase().includes(term.toLowerCase())
       );
     }
   }
   ```

3. **OrdersService**:
   ```typescript
   @Injectable({ providedIn: 'root' })
   export class OrdersService {
     orders = signal<Order[]>(MOCK_ORDERS);

     placeOrder(paymentMethod: PaymentMethod, address: Address, notes?: string) {
       // logic
     }

     updateStatus(orderId: string, status: OrderStatus) { ... }
   }
   ```

4. **CouponsService**:
   ```typescript
   @Injectable({ providedIn: 'root' })
   export class CouponsService {
     coupons = signal<Coupon[]>(MOCK_COUPONS);
     activeCoupon = signal<Coupon | null>(null);

     apply(code: string) { ... }
     remove() { ... }
   }
   ```

---

### Roteamento Proposto

**app.routes.ts:**
```typescript
export const routes: Routes = [
  { path: '', redirectTo: '/customer/menu', pathMatch: 'full' },
  {
    path: 'customer',
    component: CustomerLayoutComponent,
    children: [
      { path: 'menu', loadComponent: () => MenuComponent },
      { path: 'cart', loadComponent: () => CartComponent },
      { path: 'checkout', loadComponent: () => CheckoutComponent },
      { path: 'orders', loadComponent: () => OrdersComponent },
      { path: 'orders/:id', loadComponent: () => OrderTrackingComponent },
      { path: 'profile', loadComponent: () => ProfileComponent },
    ]
  },
  // Outras rotas (owner, employee, motoboy, auth)
];
```

---

## 🔄 Matriz de Conversão Técnica

### React Hooks → Angular Signals

| React | Angular | Exemplo |
|-------|---------|---------|
| `useState(initial)` | `signal(initial)` | `const count = signal(0); count.set(1); count.update(c => c + 1);` |
| `useMemo(fn, deps)` | `computed(fn)` | `const double = computed(() => count() * 2);` |
| `useEffect(fn, deps)` | `effect(fn)` + `ngOnInit()` | `effect(() => { if (product()) console.log('changed'); })` |
| `useCallback(fn, deps)` | Método direto | `handleClick() { ... }` |
| `useRef(initial)` | `@ViewChild()` / `ElementRef` | `@ViewChild('carousel') carouselRef!: ElementRef;` |
| `useContext(Ctx)` | `inject(Service)` | `private service = inject(AppService);` |
| `useNavigate()` | `inject(Router)` | `this.router.navigate(['/menu']);` |
| `useParams()` | `input()` + routing | Route: `path: ':id'` → `id = input<string>();` |

### React Context API → Angular Services

| React Pattern | Angular Pattern |
|---|---|
| `createContext()` + Provider wrap | `@Injectable({ providedIn: 'root' })` + `inject()` |
| `useContext(AppContext)` em qualquer component | `inject(AppService)` no component/service |
| Context com `useState` + callbacks | Service com Signals + methods |
| Consumidor observa mudanças via re-render | Componente observa Signal via computed/effect |

### React JSX → Angular Templates

| React JSX | Angular Template |
|---|---|
| `{condition && <Component />}` | `@if (condition) { <app-component /> }` |
| `{array.map(item => <Item key={item.id} {...item} />)}` | `@for (item of array; track item.id) { <app-item [item]="item" /> }` |
| `<Component prop={value} onEvent={handler} />` | `<app-component [prop]="value" (onEvent)="handler($event)" />` |
| `onClick={() => fn()}` | `(click)="fn()"` |
| `className={condition ? 'class1' : 'class2'}` | `[class.class1]="condition"` ou `[ngClass]="{ class1: condition }"` |
| `style={{ color: value }}` | `[style.color]="value"` |
| Props spread `{...props}` | N/A (use explicit inputs) |

### React Router → Angular Router

| React Router | Angular Router |
|---|---|
| `useNavigate()` | `inject(Router).navigate([path])` |
| `useParams()` | Route: `path: ':id'` + `id = input<string>();` (with `withComponentInputBinding()`) |
| `<Routes>` + `<Route>` | `Routes` array + lazy loading via `loadComponent` |
| `useLocation()` | `inject(ActivatedRoute)` |
| Dynamic segments `/:id` | Angular: `:id` (same) |

### Tailwind CSS → Angular (No Changes!)

- React: `className="text-xl font-bold bg-blue-500 text-white px-4 py-2 rounded"`
- Angular: `class="text-xl font-bold bg-blue-500 text-white px-4 py-2 rounded"` (identical!)

**Migração Tailwind:** Copy-paste com `className` → `class` (já suportado no Angular)

---

## 📋 Plano de Migração

### Fases e Dependências

```
┌─────────────────────────────────────────────────────────────┐
│ FASE 0: Setup Base Angular                                  │
│ └─ app.config.ts + app.routes.ts + providers globais        │
│                                                              │
│ FASE 1: Services + Models (Data Access)                     │
│ ├─ AppService (singleton, global state)                     │
│ ├─ ProductsService                                          │
│ ├─ CartStateService                                         │
│ ├─ OrdersService                                            │
│ ├─ CouponsService                                           │
│ ├─ ReviewsService                                           │
│ └─ Models (Product, Order, CartItem, etc.)                  │
│                                                              │
│ FASE 2: UI Dumb Components (Design System)                  │
│ ├─ ProductCard                                              │
│ ├─ AllergenIcon                                             │
│ ├─ CategoryFilter                                           │
│ ├─ CouponInput                                              │
│ └─ OrderTimeline                                            │
│                                                              │
│ FASE 3: Layout + Menu Feature (Smart Components)            │
│ ├─ CustomerLayoutComponent                                  │
│ ├─ MenuComponent (Smart)                                    │
│ ├─ ProductModalComponent (Smart)                            │
│ ├─ ComboSelectorComponent (Smart)                           │
│ └─ Menu Routing                                             │
│                                                              │
│ FASE 4: Cart Feature                                        │
│ ├─ CartComponent (Smart)                                    │
│ ├─ Cart Routing                                             │
│ └─ Integração com MenuComponent                             │
│                                                              │
│ FASE 5: Checkout Feature                                    │
│ ├─ CheckoutComponent (Smart, multi-step)                    │
│ ├─ CheckoutAddressComponent (Dumb)                          │
│ ├─ CheckoutPaymentComponent (Dumb)                          │
│ ├─ Checkout Routing                                         │
│ └─ Integração com CartComponent                             │
│                                                              │
│ FASE 6: Order Tracking + History                            │
│ ├─ OrdersComponent (Smart)                                  │
│ ├─ OrderTrackingComponent (Smart)                           │
│ ├─ OrderTimeline (Dumb, refatorado)                         │
│ ├─ OrderReviewComponent (Dumb)                              │
│ └─ Routing                                                  │
│                                                              │
│ FASE 7: Profile + Final Integrations                        │
│ └─ ProfileComponent                                         │
│                                                              │
│ FASE 8: QA + Testing + Fixes                                │
│ └─ Validação de todos os fluxos                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Detalhamento de Cada Fase

#### FASE 0: Setup Base Angular
**Duração:** ~2h  
**Entregáveis:**
- [ ] Configurar providers globais em `app.config.ts`
- [ ] Estrutura de pastas `/domains/customer/`
- [ ] Configuração de path aliases (`@domain/customer`, `@shared/ui`, etc.)
- [ ] Tailwind + Theme configurados

**Commits:**
```
chore: setup de estrutura base do domínio customer
feat: configurar path aliases e providers globais
```

---

#### FASE 1: Services + Models
**Duração:** ~8h  
**Entregáveis:**
- [ ] `customer.models.ts` - Tipos (Product, Order, CartItem, Coupon, etc.)
- [ ] `app.service.ts` - Lógica global (autenticação, estado principal)
- [ ] `products.service.ts` - CRUD e filtros de produtos
- [ ] `cart.state.ts` - Signal-based cart management
- [ ] `orders.service.ts` - Lógica de pedidos
- [ ] `coupons.service.ts` - Aplicação de cupons
- [ ] `reviews.service.ts` - Gerenciamento de avaliações

**Critérios de Qualidade:**
- [ ] Sem `any` types - tipagem estrita
- [ ] Signals para estado síncrono
- [ ] `computed()` para dados derivados
- [ ] Métodos nomeados em português
- [ ] Testes unitários das services

**Commits:**
```
feat(customer): criar models do domínio
feat(customer/data-access): implementar AppService
feat(customer/data-access): implementar ProductsService
feat(customer/data-access): implementar CartStateService
feat(customer/data-access): implementar OrdersService
feat(customer/data-access): implementar CouponsService
```

---

#### FASE 2: UI Dumb Components
**Duração:** ~6h  
**Entregáveis:**
- [ ] `product-card.component.ts` - Card de produto reutilizável
- [ ] `allergen-icon.component.ts` - Icon de alérgeno
- [ ] `category-filter.component.ts` - Filtro de categoria
- [ ] `coupon-input.component.ts` - Input de cupom
- [ ] `order-timeline.component.ts` - Timeline de status

**Critérios de Qualidade:**
- [ ] Apenas `@Input()` / `input()` e `@Output()` / `output()`
- [ ] Nenhuma injeção de service
- [ ] Estilos encapsulados (CSS ou Tailwind)
- [ ] Documentadas com comentários JSDoc

**Commits:**
```
feat(customer/ui): criar ProductCardComponent
feat(customer/ui): criar AllergenIconComponent
feat(customer/ui): criar CategoryFilterComponent
feat(customer/ui): criar CouponInputComponent
feat(customer/ui): criar OrderTimelineComponent
```

---

#### FASE 3: Layout + Menu (FOCO)
**Duração:** ~10h  
**Entregáveis:**
- [ ] `customer-layout.component.ts` - Layout com sidebar/navbar
- [ ] `menu.component.ts` - Smart, listagem de produtos com filtros
- [ ] `menu.component.html` - Control flow (`@if`, `@for`, `@defer`)
- [ ] `product-modal.component.ts` - Modal de detalhe + add to cart
- [ ] `combo-selector.component.ts` - Carousel e grid de combo slots
- [ ] `customer-layout.routes.ts` - Sub-routing do customer

**Critérios de Qualidade:**
- [ ] MenuComponent com Signals para: selectedCategory, searchTerm, sortOption, filteredProducts
- [ ] Debounce em searchTerm (via Signal setter customizado)
- [ ] ProductModal com lógica de combo (pré-preenchimento de slots, carousel)
- [ ] Integração com ProductsService e CartStateService
- [ ] Responsivo (mobile + desktop)
- [ ] Animações com Framer Motion (se necessário, ou CSS-in-JS)

**Checklist Visual:**
- [ ] Grid de produtos renderiza corretamente
- [ ] Filtro por categoria funciona
- [ ] Busca com debounce funciona
- [ ] Click no produto abre modal
- [ ] Modal exibe imagem, preço, allergens, descrição
- [ ] Para combos: carousel de slots + grid de opções
- [ ] Botão "Adicionar" adiciona ao cart com quantidade
- [ ] Badge de carrinho atualiza em real-time

**Commits:**
```
feat(customer/feature-menu): implementar MenuComponent
feat(customer/feature-menu): implementar ProductModalComponent
feat(customer/feature-menu): implementar ComboSelectorComponent
feat(customer/feature-layout): implementar CustomerLayoutComponent
feat(customer): adicionar rotas do domínio customer
```

---

#### FASE 4: Cart Feature
**Duração:** ~6h  
**Entregáveis:**
- [ ] `cart.component.ts` - Smart, listagem de items + resumo de preços
- [ ] `cart.component.html` - Layout dos items, +/-, remove, cupom
- [ ] Integração com `CartStateService` e `CouponsService`
- [ ] Navegação para checkout

**Critérios de Qualidade:**
- [ ] Items renderizam com quantidade e preço
- [ ] +/- buttons atualizam quantidade
- [ ] Remove button remove do carrinho
- [ ] Campo de cupom com validação
- [ ] Resumo: subtotal + cupom + entrega = total
- [ ] Carrinho vazio mostra mensagem e link para menu

**Commits:**
```
feat(customer/feature-cart): implementar CartComponent
feat(customer/feature-cart): adicionar lógica de aplicação de cupom
```

---

#### FASE 5: Checkout Feature
**Duração:** ~8h  
**Entregáveis:**
- [ ] `checkout.component.ts` - Smart, orquestra 3 passos
- [ ] `checkout-address.component.ts` - Formulário de endereço
- [ ] `checkout-payment.component.ts` - Seleção de pagamento
- [ ] `checkout.component.html` - Multi-step layout com progress
- [ ] Integração com `OrdersService`

**Critérios de Qualidade:**
- [ ] Passo 1: Endereço com campos: rua, número, complemento, bairro, cidade, CEP
- [ ] Passo 2: 5 opções de pagamento (PIX, CC, DD, VR, Dinheiro)
- [ ] Passo 3: Resumo final com confirmação
- [ ] Validação de campos obrigatórios
- [ ] Loading state ao submeter
- [ ] Sucesso: redireciona para orders com toast
- [ ] Erro: mostra mensagem e permite corrigir

**Commits:**
```
feat(customer/feature-checkout): implementar CheckoutComponent
feat(customer/feature-checkout): adicionar endereço e pagamento steps
feat(customer/feature-checkout): integrar com OrdersService
```

---

#### FASE 6: Order Tracking + History
**Duração:** ~8h  
**Entregáveis:**
- [ ] `orders.component.ts` - Smart, listagem de pedidos com filtros
- [ ] `order-tracking.component.ts` - Smart, acompanhamento em tempo real
- [ ] `order-timeline.component.ts` - Refatorado como Dumb
- [ ] `order-review.component.ts` - Formulário de avaliação (5 stars + comment)
- [ ] `mock-delivery-map.component.ts` - Portado do React

**Critérios de Qualidade:**
- [ ] OrdersComponent filtra por status
- [ ] OrderTrackingComponent exibe timeline de progresso
- [ ] OrderTimeline animado (Framer Motion ou CSS)
- [ ] ReviewForm 5 stars, comment obrigatório se ≤ 3 stars
- [ ] MockDeliveryMap funciona (simulação)

**Commits:**
```
feat(customer/feature-orders): implementar OrdersComponent
feat(customer/feature-order-tracking): implementar OrderTrackingComponent
feat(customer/feature-order-tracking): implementar ReviewForm
```

---

#### FASE 7: Profile + Final Integrations
**Duração:** ~4h  
**Entregáveis:**
- [ ] `profile.component.ts` - Dados do usuário, endereços, logout
- [ ] Validação de autenticação (guards)
- [ ] Redirecionamento correto entre páginas

**Commits:**
```
feat(customer/feature-profile): implementar ProfileComponent
```

---

#### FASE 8: QA + Testing + Fixes
**Duração:** ~6h  
**Entregáveis:**
- [ ] Testes unitários dos services (80%+ coverage)
- [ ] Testes do fluxo completo (e2e conceitual)
- [ ] Responsivo testado (mobile/tablet/desktop)
- [ ] Console sem erros/warnings
- [ ] TypeScript strict mode: 0 erros
- [ ] Validação contra mock data

**Commits:**
```
test(customer): adicionar testes unitários de services
fix(customer): corrigir responsive design
fix(customer): eliminar warnings de TypeScript
```

---

**Total Estimado:** ~48 horas

---

## ✅ Checklist de Implementação

### Pré-Migração (Antes de Começar)

- [ ] Ler e entender os 4 documentos de skill (Product Context, Development Process, Angular Architecture, React to Angular Migration)
- [ ] Clonar branch `angular` do repositório
- [ ] Instalar dependências: `npm install` em `/src/angular/`
- [ ] Verificar que Angular 17+ está configurado
- [ ] Path aliases estão configurados em `tsconfig.json`
- [ ] Tailwind CSS e tema estão funcionando

### FASE 0

- [ ] Estrutura de pastas `/domains/customer/` criada
- [ ] Path aliases funcionando (`@domain/customer`, `@shared/ui`)
- [ ] Providers globais em `app.config.ts`

### FASE 1

- [ ] `customer.models.ts` com todos os tipos
- [ ] `app.service.ts` compilando e sem `any`
- [ ] `products.service.ts` com métodos de filtro/busca
- [ ] `cart.state.ts` com Signals e métodos CRUD
- [ ] `orders.service.ts` com placeOrder e status updates
- [ ] `coupons.service.ts` com validação
- [ ] `reviews.service.ts` implementado
- [ ] **QA:** `ng build` com sucesso
- [ ] **QA:** `ng lint` com 0 erros

### FASE 2

- [ ] ProductCard compilando, sem injeções
- [ ] AllergenIcon renderiza 7 tipos de alérgenos
- [ ] CategoryFilter recebe `@Input()` e emite `@Output()`
- [ ] CouponInput emite submit event
- [ ] OrderTimeline renderiza 5 status com icons
- [ ] **QA:** Todos os componentes Dumb testáveis isoladamente

### FASE 3 (FOCO)

- [ ] MenuComponent exibe grid de produtos
- [ ] Filtro por categoria funciona
- [ ] Busca com debounce funciona
- [ ] Click abre ProductModal
- [ ] ProductModal exibe detalhes corretos
- [ ] Combos: carousel de slots + grid de seleção
- [ ] Allergens renderizam com icons
- [ ] Adicionar ao carrinho atualiza badge
- [ ] ProductModal fecha após adicionar
- [ ] **QA:** Menu responsivo (mobile/desktop)
- [ ] **QA:** Sem console errors/warnings
- [ ] **QA:** TypeScript build limpo

### FASE 4

- [ ] CartComponent exibe todos os items
- [ ] +/- buttons funcionam
- [ ] Remove button funciona
- [ ] Cupom input valida e aplica desconto
- [ ] Resumo calcula: subtotal + cupom + entrega = total
- [ ] Carrinho vazio exibe mensagem
- [ ] Link para menu funciona
- [ ] **QA:** Integração com MenuComponent OK

### FASE 5

- [ ] Checkout tem 3 passos: endereço → pagamento → confirmar
- [ ] Endereço valida campos obrigatórios
- [ ] 5 opções de pagamento aparecem
- [ ] Resumo final mostra total
- [ ] Submeter coloca ordem e redireciona
- [ ] **QA:** Validação e error handling OK

### FASE 6

- [ ] Orders lista histórico de pedidos
- [ ] OrderTracking mostra timeline de status
- [ ] MockDeliveryMap renderiza
- [ ] ReviewForm com 5 stars + comment
- [ ] **QA:** Integração com OrdersService OK

### FASE 7

- [ ] Profile mostra dados do usuário
- [ ] Logout funciona
- [ ] **QA:** Autenticação guards implementados

### FASE 8

- [ ] `ng build` com sucesso (prod build)
- [ ] `ng lint` com 0 erros
- [ ] TypeScript strict: 0 erros
- [ ] Responsivo testado
- [ ] Fluxo completo: Menu → Carrinho → Checkout → Orders → Review
- [ ] Todos os icons/images aparecem
- [ ] Dark theme / Light theme funcionam (se houver)

---

## 🚀 Próximos Passos

1. **Executar FASE 0:** Setup base
2. **Executar FASE 1:** Services (o alicerce de tudo)
3. **Executar FASE 2:** UI Components (reutilizáveis)
4. **Executar FASE 3:** Menu + Layout (o coração)
5. **Executar FASES 4-8:** Features restantes + QA

---

## 📌 Notas Importantes

- **Perseverança em Signals:** Todos os estados devem ser Signals, não BehaviorSubjects
- **Computed para Derivações:** Sempre use `computed()` para dados calculados
- **Control Flow Moderno:** `@if`, `@for` em vez de `*ngIf`, `*ngFor`
- **Sem NgModules:** Tudo Standalone Components
- **Tipagem Estrita:** Nenhum `any` permitido
- **Commits Semânticos:** Português + prefixos convencionais
- **Rastreabilidade:** Cada commit referencia qual componente React → Angular

---

## 📚 Referências Cruzadas

| Skill | Seção Relevante |
|-------|-----------------|
| Product Context | [Análise de Negócio](#análise-de-negócio) |
| Development Process | [Plano de Migração](#plano-de-migração) + [Checklist](#checklist-de-implementação) |
| Angular Architecture | [Arquitetura Angular Proposta](#arquitetura-angular-proposta) |
| React to Angular Migration | [Matriz de Conversão Técnica](#matriz-de-conversão-técnica) |

