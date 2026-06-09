export type UserRole = "owner" | "employee" | "motoboy" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

import bowlProteico from "figma:asset/bowl_proteico.png";
import bowlVegano from "figma:asset/bowl_vegano.png";
import bowlMediterraneo from "figma:asset/bowl_mediterraneo.png";
import bowlAsiatico from "figma:asset/bowl_oriental.png";
import bowlFrango from "figma:asset/bowl_low_carb.png";
import bowlCamarao from "figma:asset/bowl_tropical.png";
import bowlTropical from "figma:asset/bowl_tropical.png";
import bowlLowCarb from "figma:asset/bowl_low_carb.png";
import bowlOriental from "figma:asset/bowl_oriental.png";


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

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export type InsumoUnit = "g" | "kg" | "ml" | "l" | "un" | "fatia" | "folha" | "colher" | "porção";

// ─── Inventory System ──────────────────────────────────────────────────────────

export interface StockItem {
  id: string;
  name: string;
  category: string; // "hortifruti" | "proteína" | "molhos" | "secos" | "grãos" | "temperos"
  unit: InsumoUnit;
  currentQuantity: number;
  maxCapacity: number; // Definido pelo Dono
  minAlert: number; // Ponto mínimo de alerta
  yieldRule?: {
    // Para itens orgânicos de difícil mensuração
    baseUnit: string; // ex: "1 tomate"
    yields: number; // ex: 8 (fatias)
    yieldsUnit: InsumoUnit; // ex: "fatia"
  };
}

export interface StockMovement {
  id: string;
  stockItemId: string;
  type: "entry" | "exit_manual" | "exit_auto" | "adjustment";
  quantity: number;
  userId: string;
  userName: string;
  timestamp: Date;
  orderId?: string; // Se foi baixa automática de pedido
  notes?: string;
}

// ─── Existing Types ────────────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  cnpj?: string;
  phone: string;
  email: string;
  address: string;
}

export interface Insumo {
  id: string;
  name: string;
  unit: InsumoUnit;
  category?: string;
  observations?: string;
  allergens?: string[]; // Gluten, Soja, Nozes, Ovo, Peixe, Crustáceos, Leite
}

export interface PriceRecord {
  id: string;
  insumoId: string;
  supplierId: string;
  value: number;
  date: Date;
  observation?: string;
}

export interface TechnicalSheetIngredient {
  id: string;
  insumoId: string;
  quantity: number;
  unit: InsumoUnit;
  supplierId?: string;
  stockItemId?: string; // Vincula ao item de estoque
}

export interface TechnicalSheet {
  id: string;
  productId: string;
  internalName: string;
  desiredMargin: number;
  ingredients: TechnicalSheetIngredient[];
  manualPriceOverride?: number;
}

export type PlateOfDayConfig = Record<number, string>; // { [dayOfWeek]: productId }

export interface Review {
  id: string;
  orderId: string;
  stars: number;
  comment?: string;
  createdAt: Date;
  customerId: string;
  customerName: string;
}

export interface ComboSlot {
  id: string;
  name: string;
  type: "fixed" | "selectable";
  products: string[]; // List of product IDs
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

export type CouponType = "percentage" | "fixed" | "shipping" | "inactive";

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number; // Ex: 20 (para 20%), 15 (para R$15)
  active: boolean;
  expirationDate?: Date;
  minOrderValue?: number;
  usageLimit?: number;
  usedCount: number;
  totalSalesVolume: number; // For analytics
  restrictedCategories?: string[]; // IDs das categorias permitidas
}

export type OrderStatus =
  | "received"
  | "preparing"
  | "ready"
  | "delivering"
  | "delivered";

export interface OrderItem {
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

export type PaymentMethod =
  | "pix"
  | "credit_card"
  | "debit_card"
  | "meal_voucher"
  | "cash";

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryAddress: Address;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: Date;
  deliveryCode: string;
  motoboyId?: string;
  notes?: string;
  addressNotes?: string;
  reviewId?: string;
}

export const MOCK_USERS: User[] = [
  { id: "u1", name: "Rafael Mendes", email: "dono@dahorta.com", password: "123456", role: "owner", phone: "(11) 99999-0001", avatar: "RM" },
  { id: "u2", name: "Carlos Lima", email: "func@dahorta.com", password: "123456", role: "employee", phone: "(11) 99999-0002", avatar: "CL" },
  { id: "u3", name: "Diego Santos", email: "moto@dahorta.com", password: "123456", role: "motoboy", phone: "(11) 99999-0003", avatar: "DS" },
  { id: "u4", name: "Ana Paula", email: "cliente@email.com", password: "123456", role: "customer", phone: "(11) 98888-1234", avatar: "AP" },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: "c1", name: "Bowls", icon: "🥗" },
  { id: "c2", name: "Saladas", icon: "🥬" },
  { id: "c3", name: "Bebidas", icon: "🥤" },
  { id: "c4", name: "Sobremesas", icon: "🍨" },
  { id: "c5", name: "Acompanhamentos", icon: "🍞" },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: "p1", name: "Bowl Proteico", internalName: "BOWL-PROTEICO-01", description: "Quinoa, frango grelhado orgânico, abacate, tomate cereja, espinafre e molho tahine.", image: bowlProteico, price: 28.9, category: "c1", available: true, prepTime: 12, featured: true, desiredMargin: 45 },
  { id: "p2", name: "Bowl Vegano Power", internalName: "BOWL-VEGANO-01", description: "Grão-de-bico, couve massageada, cenoura ralada, beterraba, hummus e sementes de girassol.", image: bowlVegano, price: 24.9, category: "c1", available: true, prepTime: 10, featured: true, desiredMargin: 48 },
  { id: "p3", name: "Bowl Mediterrâneo", description: "Arroz integral, salmão grelhado, pepino, azeitonas, tomate e molho de iogurte.", image: bowlMediterraneo, price: 32.9, category: "c1", available: true, prepTime: 15, featured: true, desiredMargin: 42 },
  { id: "p12", name: "Bowl Low-Carb Frango", description: "Arroz de couve-flor, frango grelhado premium, brócolis ao bafo, ovo cozido e sementes de gergelim.", image: bowlFrango, price: 29.9, category: "c1", available: true, prepTime: 12 },
  { id: "p13", name: "Bowl Asiático", description: "Macarrão de arroz, tofu defumado, edamame, cogumelos shitake e molho de soja e gengibre.", image: bowlAsiatico, price: 31.9, category: "c1", available: true, prepTime: 14 },
  
  { id: "p4", name: "Salada Caesar Orgânica", description: "Alface romana orgânica, croutons artesanais, parmesão e molho caesar caseiro.", image: "https://i.imgur.com/BM0eoHE.jpeg", price: 22.9, category: "c2", available: true, prepTime: 8, desiredMargin: 50 },
  
  { id: "p5", name: "Suco de Laranja Orgânico", description: "Suco de laranja 100% natural e orgânico, sem adição de açúcar ou conservantes. 400ml.", image: "https://i.imgur.com/D5fUFkH.jpeg", price: 12.9, category: "c3", available: true, prepTime: 3 },
  { id: "p6", name: "Pink Lemonade Natural", description: "Limão siciliano, framboesa natural e água gaseificada. Uma explosão de sabor. 400ml.", image: "https://i.imgur.com/qpBWUlU.jpeg", price: 15.9, category: "c3", available: true, prepTime: 5 },
  { id: "p14", name: "Kombucha de Gengibre", description: "Bebida fermentada milenar, naturalmente gaseificada e probiótica. 300ml.", image: "https://i.imgur.com/xcjjl0M.jpeg", price: 18.9, category: "c3", available: true, prepTime: 2 },
  { id: "p15", name: "Chá Mate com Limão", description: "Mate artesanal batido com limão e gelo. Sabor carioca e natural. 400ml.", image: "https://i.imgur.com/PLxpqrU.jpeg", price: 11.9, category: "c3", available: true, prepTime: 4 },
  { id: "p16", name: "Água Mineral Alcalina", description: "Água mineral alcalina de PH elevado para hidratação máxima. 500ml.", image: "https://i.imgur.com/J6fsFty.jpeg", price: 6.9, category: "c3", available: true, prepTime: 1 },
  
  { id: "p7", name: "Bowl de Açaí Orgânico", description: "Açaí puro batido com banana, coberto com granola artesanal, frutas frescas e mel.", image: "https://i.imgur.com/UWcS8Go.jpeg", price: 26.9, category: "c4", available: true, prepTime: 8 },
  { id: "p8", name: "Mousse de Cacau Raw", description: "Mousse de cacau cru com abacate, tâmaras e castanhas. Vegano e sem açúcar refinado.", image: "https://i.imgur.com/ihFpYkN.jpeg", price: 18.9, category: "c4", available: true, prepTime: 0 },
  { id: "p17", name: "Chia Pudding de Coco", description: "Sementes de chia hidratadas no leite de coco, com lâminas de coco e morangos. Vegano.", image: "https://i.imgur.com/mfV8k60.jpeg", price: 21.9, category: "c4", available: true, prepTime: 2 },
  { id: "p18", name: "Cheesecake de Frutas Vermelhas", description: "Cheesecake vegano com base de amêndoas e calda caseira de frutas vermelhas.", image: "https://i.imgur.com/A5w2xJK.jpeg", price: 24.9, category: "c4", available: true, prepTime: 2 },
  { id: "p19", name: "Brownie de Batata Doce", description: "Brownie denso e chocolatudo, adoçado naturally, sem glúten e sem lactose.", image: "https://i.imgur.com/RVx4FyV.jpeg", price: 16.9, category: "c4", available: true, prepTime: 2 },
  { id: "p20", name: "Salada de Frutas Tropical", description: "Mix de frutas da estação rigorosamente selecionadas com suco de laranja.", image: "https://i.imgur.com/hVEpQWR.jpeg", price: 14.9, category: "c4", available: true, prepTime: 5 },
  
  { id: "p9", name: "Pão Integral Artesanal", description: "Pão 100% integral com sementes de chia, linhaça e girassol. 2 fatias.", image: "https://i.imgur.com/uvBI6kE.jpeg", price: 8.9, category: "c5", available: true, prepTime: 3 },
  { id: "p21", name: "Batata Doce com Alecrim", description: "Cubos de batata doce orgânica assados com azeite e alecrim fresco.", image: "https://i.imgur.com/jygmHBo.jpeg", price: 12.9, category: "c5", available: true, prepTime: 10 },
  { id: "p22", name: "Chips de Mandioca", description: "Lâminas crocantes de mandioca preparadas na airfryer com sal marinho.", image: "https://i.imgur.com/c8aI4Ez.jpeg", price: 10.9, category: "c5", available: true, prepTime: 12 },
  { id: "p23", name: "Mix de Vegetais Grelhados", description: "Abobrinha, berinjela e pimentões grelhados com ervas finas.", image: "https://i.imgur.com/mviwuIq.jpeg", price: 15.9, category: "c5", available: true, prepTime: 8 },
  
  { id: "p10", name: "Combo Casal Fitness", description: "2 Bowls à escolha + 2 Sucos Detox com um desconto especial.", image: bowlProteico, price: 79.9, category: "c1", available: true, prepTime: 20, isCombo: true, comboSlots: [
    { id: "s1", name: "Primeiro Bowl", type: "selectable", products: ["p1", "p2", "p3", "p11", "p12", "p13"] },
    { id: "s2", name: "Segundo Bowl", type: "selectable", products: ["p1", "p2", "p3", "p11", "p12", "p13"] },
    { id: "s3", name: "Bebida 1", type: "selectable", products: ["p5", "p6", "p14", "p15"] },
    { id: "s4", name: "Bebida 2", type: "selectable", products: ["p5", "p6", "p14", "p15"] },
  ]},
];

export const MOCK_COUPONS: Coupon[] = [
  { id: "coup2", code: "DAHORTA20", type: "percentage", value: 20, active: true, minOrderValue: 50, expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), usedCount: 89, totalSalesVolume: 2670 },
  { id: "coup3", code: "FRETEGRATIS", type: "shipping", value: 0, active: true, usedCount: 320, totalSalesVolume: 9600 },
  { id: "coup4", code: "VERAOINATIVO", type: "inactive", value: 10, active: false, usedCount: 500, totalSalesVolume: 15000 },
];

export const MOCK_PLATE_OF_DAY: PlateOfDayConfig = {
  1: "p1", // Segunda: Bowl Proteico
  2: "p2", // Terça: Bowl Vegano Power
  3: "p3", // Quarta: Bowl Mediterrâneo
  4: "p1", // Quinta
  5: "p2", // Sexta
  6: "p3", // Sábado
  0: "p1", // Domingo
};

// ─── Stock Items ───────────────────────────────────────────────────────────────

export const MOCK_STOCK_ITEMS: StockItem[] = [
  // Hortifruti
  { id: "stk1", name: "Tomate Cereja Orgânico", category: "hortifruti", unit: "g", currentQuantity: 2500, maxCapacity: 5000, minAlert: 500 },
  { id: "stk2", name: "Alface Romana", category: "hortifruti", unit: "un", currentQuantity: 15, maxCapacity: 30, minAlert: 5, yieldRule: { baseUnit: "1 alface", yields: 10, yieldsUnit: "porção" } },
  { id: "stk3", name: "Espinafre Fresco", category: "hortifruti", unit: "g", currentQuantity: 1200, maxCapacity: 3000, minAlert: 300 },
  { id: "stk4", name: "Couve Orgânica", category: "hortifruti", unit: "folha", currentQuantity: 80, maxCapacity: 150, minAlert: 20 },
  { id: "stk5", name: "Abacate", category: "hortifruti", unit: "un", currentQuantity: 100, maxCapacity: 200, minAlert: 10, yieldRule: { baseUnit: "1 abacate", yields: 120, yieldsUnit: "g" } },
  { id: "stk6", name: "Cenoura Orgânica", category: "hortifruti", unit: "un", currentQuantity: 18, maxCapacity: 40, minAlert: 8, yieldRule: { baseUnit: "1 cenoura", yields: 80, yieldsUnit: "g" } },
  { id: "stk7", name: "Beterraba", category: "hortifruti", unit: "un", currentQuantity: 12, maxCapacity: 30, minAlert: 6, yieldRule: { baseUnit: "1 beterraba", yields: 150, yieldsUnit: "g" } },
  { id: "stk8", name: "Pepino", category: "hortifruti", unit: "un", currentQuantity: 20, maxCapacity: 40, minAlert: 8, yieldRule: { baseUnit: "1 pepino", yields: 100, yieldsUnit: "g" } },
  
  // Proteínas
  { id: "stk9", name: "Peito de Frango Orgânico", category: "proteína", unit: "g", currentQuantity: 4500, maxCapacity: 8000, minAlert: 1000 },
  { id: "stk10", name: "Salmão Fresco", category: "proteína", unit: "g", currentQuantity: 2000, maxCapacity: 5000, minAlert: 500 },
  { id: "stk11", name: "Grão-de-bico Cozido", category: "proteína", unit: "g", currentQuantity: 3000, maxCapacity: 6000, minAlert: 800 },
  
  // Grãos e Carboidratos
  { id: "stk12", name: "Quinoa em Grãos", category: "grãos", unit: "g", currentQuantity: 5000, maxCapacity: 10000, minAlert: 1500 },
  { id: "stk13", name: "Arroz Integral", category: "grãos", unit: "g", currentQuantity: 6000, maxCapacity: 15000, minAlert: 2000 },
  
  // Molhos e Temperos
  { id: "stk14", name: "Molho Tahine Caseiro", category: "molhos", unit: "ml", currentQuantity: 800, maxCapacity: 2000, minAlert: 200 },
  { id: "stk15", name: "Hummus Tradicional", category: "molhos", unit: "g", currentQuantity: 1200, maxCapacity: 3000, minAlert: 300 },
  { id: "stk16", name: "Molho Caesar Orgânico", category: "molhos", unit: "ml", currentQuantity: 600, maxCapacity: 1500, minAlert: 200 },
  { id: "stk17", name: "Azeite Extra Virgem", category: "temperos", unit: "ml", currentQuantity: 2500, maxCapacity: 5000, minAlert: 500 },
  
  // Outros
  { id: "stk18", name: "Azeitonas Pretas", category: "secos", unit: "g", currentQuantity: 800, maxCapacity: 2000, minAlert: 200 },
  { id: "stk19", name: "Sementes de Girassol", category: "secos", unit: "g", currentQuantity: 1500, maxCapacity: 3000, minAlert: 400 },
  { id: "stk20", name: "Açaí Polpa Orgânica", category: "secos", unit: "g", currentQuantity: 5000, maxCapacity: 10000, minAlert: 1000 },
  { id: "stk21", name: "Granola Artesanal", category: "secos", unit: "g", currentQuantity: 2000, maxCapacity: 5000, minAlert: 500 },
];

export const MOCK_STOCK_MOVEMENTS: StockMovement[] = [
  { id: "mov1", stockItemId: "stk1", type: "entry", quantity: 2000, userId: "u1", userName: "Rafael Mendes", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), notes: "Compra semanal" },
  { id: "mov2", stockItemId: "stk2", type: "entry", quantity: 20, userId: "u2", userName: "Carlos Lima", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), notes: "Reposição hortifruti" },
  { id: "mov3", stockItemId: "stk9", type: "exit_manual", quantity: 500, userId: "u2", userName: "Carlos Lima", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), notes: "Preparo bowls proteicos" },
  { id: "mov4", stockItemId: "stk12", type: "adjustment", quantity: -200, userId: "u1", userName: "Rafael Mendes", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), notes: "Ajuste de inventário - perda" },
];

// ─── Existing Mock Data (updated) ──────────────────────────────────────────────

const baseAddress: Address = {
  id: "a1", label: "Casa", street: "Rua das Flores", number: "142", complement: "Apto 31",
  neighborhood: "Jardim Paulista", city: "São Paulo", zipCode: "01310-100",
};

export const generateDeliveryCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const MOCK_ORDERS: Order[] = [
  { id: "ORD-001", customerId: "u4", customerName: "Ana Paula", customerPhone: "(11) 98888-1234", items: [{ productId: "p1", name: "Bowl Proteico", quantity: 2, price: 28.9, image: bowlProteico }, { productId: "p5", name: "Smoothie Detox", quantity: 1, price: 16.9, image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&q=80" }], status: "preparing", paymentMethod: "pix", deliveryAddress: baseAddress, subtotal: 74.7, deliveryFee: 6.0, total: 80.7, createdAt: new Date(Date.now() - 12 * 60000), deliveryCode: "482910" },
  { id: "ORD-002", customerId: "u5", customerName: "Lucas Ferreira", customerPhone: "(11) 97777-5678", items: [{ productId: "p2", name: "Bowl Vegano Power", quantity: 1, price: 24.9, image: bowlVegano }, { productId: "p6", name: "Suco Verde Energizante", quantity: 1, price: 14.9, image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80" }], status: "received", paymentMethod: "credit_card", deliveryAddress: { ...baseAddress, id: "a2", label: "Trabalho", street: "Av. Paulista", number: "1578", neighborhood: "Bela Vista", complement: "Sala 902" }, subtotal: 39.8, deliveryFee: 6.0, total: 45.8, createdAt: new Date(Date.now() - 5 * 60000), deliveryCode: "731045" },
  { id: "ORD-003", customerId: "u6", customerName: "Mariana Costa", customerPhone: "(11) 96666-9012", items: [{ productId: "p3", name: "Bowl Mediterrâneo", quantity: 1, price: 32.9, image: bowlMediterraneo }], status: "ready", paymentMethod: "meal_voucher", deliveryAddress: { ...baseAddress, id: "a3", street: "Rua Augusta", number: "890", neighborhood: "Consolação", complement: "" }, subtotal: 32.9, deliveryFee: 6.0, total: 38.9, createdAt: new Date(Date.now() - 28 * 60000), deliveryCode: "295847", motoboyId: "u3", addressNotes: "Prédio comercial, deixar na recepção." },
  { id: "ORD-004", customerId: "u7", customerName: "Pedro Alves", customerPhone: "(11) 95555-3456", items: [{ productId: "p4", name: "Salada Caesar Orgânica", quantity: 2, price: 22.9, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80" }], status: "delivering", paymentMethod: "debit_card", deliveryAddress: { ...baseAddress, id: "a4", street: "Rua Oscar Freire", number: "455", neighborhood: "Cerqueira César", complement: "Casa 2" }, subtotal: 45.8, deliveryFee: 6.0, total: 51.8, createdAt: new Date(Date.now() - 45 * 60000), deliveryCode: "619203", motoboyId: "u3", addressNotes: "Interfone 202, toca direto." },
  { id: "ORD-005", customerId: "u4", customerName: "Ana Paula", customerPhone: "(11) 98888-1234", items: [{ productId: "p7", name: "Bowl de Açaí Orgânico", quantity: 1, price: 26.9, image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=80" }], status: "delivered", paymentMethod: "cash", deliveryAddress: baseAddress, subtotal: 26.9, deliveryFee: 6.0, total: 32.9, createdAt: new Date(Date.now() - 90 * 60000), deliveryCode: "504739", motoboyId: "u3", reviewId: "rev1" },
];

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: "sup1", name: "Horta Orgânica Vale Verde", cnpj: "12.345.678/0001-99", phone: "(11) 3333-4444", email: "compras@valeverde.com.br", address: "Estrada da Colheita, 890 - Zona Rural, Ibiúna" },
  { id: "sup2", name: "Distribuidora Saúde & Sabor", cnpj: "98.765.432/0001-11", phone: "(11) 2222-5555", email: "vendas@saudesabor.com.br", address: "Av. dos Orgânicos, 244 - Pinheiros, São Paulo" },
  { id: "sup3", name: "Proteínas Naturais Premium", cnpj: "55.123.456/0001-77", phone: "(11) 4444-6666", email: "comercial@proteinaspremium.com.br", address: "Rod. Raposo Tavares, km 28 - Cotia, SP" },
];

export const MOCK_INSUMOS: Insumo[] = [
  { id: "ins1", name: "Quinoa em Grãos Orgânica", unit: "g", category: "Grãos", observations: "Armazenar em local seco" },
  { id: "ins2", name: "Frango Orgânico (peito)", unit: "g", category: "Proteínas", observations: "Manter refrigerado" },
  { id: "ins3", name: "Tomate Cereja", unit: "g", category: "Hortifruti" },
  { id: "ins4", name: "Abacate", unit: "un", category: "Hortifruti" },
  { id: "ins5", name: "Espinafre Fresco", unit: "g", category: "Hortifruti", observations: "Higienizar antes do uso" },
  { id: "ins6", name: "Molho Tahine", unit: "ml", category: "Molhos", observations: "Produção interna", allergens: ["Soja"] },
  { id: "ins7", name: "Couve Orgânica", unit: "folha", category: "Hortifruti" },
  { id: "ins8", name: "Grão-de-bico Cozido", unit: "g", category: "Proteínas" },
  { id: "ins9", name: "Salmão Fresco", unit: "g", category: "Proteínas", observations: "Manter refrigerado, consumir em até 48h", allergens: ["Peixe"] },
  { id: "ins10", name: "Açaí Polpa", unit: "g", category: "Frutas", observations: "Manter congelado" },
  { id: "ins11", name: "Pão de Trigo Artesanal", unit: "un", category: "Secos", allergens: ["Gluten"] },
  { id: "ins12", name: "Leite de Vaca", unit: "ml", category: "Laticínios", allergens: ["Leite"] },
  { id: "ins13", name: "Ovo de Galinha", unit: "un", category: "Proteínas", allergens: ["Ovo"] },
  { id: "ins14", name: "Castanha do Pará", unit: "g", category: "Secos", allergens: ["Nozes"] },
  { id: "ins15", name: "Camarão Médio", unit: "g", category: "Proteínas", allergens: ["Crustáceos"] },
];

export const getAllergensByProductId = (productId: string): string[] => {
  const sheet = MOCK_TECHNICAL_SHEETS.find(ts => ts.productId === productId);
  if (!sheet) return [];
  
  const allAllergens = sheet.ingredients.reduce((acc: string[], ingredient) => {
    const insumo = MOCK_INSUMOS.find(i => i.id === ingredient.insumoId);
    if (insumo && insumo.allergens) {
      return [...acc, ...insumo.allergens];
    }
    return acc;
  }, []);
  
  return Array.from(new Set(allAllergens));
};

export const MOCK_PRICE_RECORDS: PriceRecord[] = [
  { id: "pr1", insumoId: "ins1", supplierId: "sup2", value: 0.042, date: daysAgo(5), observation: "Quinoa orgânica certificada" },
  { id: "pr2", insumoId: "ins1", supplierId: "sup2", value: 0.045, date: daysAgo(35) },
  { id: "pr3", insumoId: "ins2", supplierId: "sup3", value: 0.055, date: daysAgo(3), observation: "Frango caipira orgânico" },
  { id: "pr4", insumoId: "ins2", supplierId: "sup3", value: 0.058, date: daysAgo(33) },
  { id: "pr5", insumoId: "ins3", supplierId: "sup1", value: 0.028, date: daysAgo(2) },
  { id: "pr6", insumoId: "ins4", supplierId: "sup1", value: 4.5, date: daysAgo(4), observation: "Abacate médio" },
  { id: "pr7", insumoId: "ins5", supplierId: "sup1", value: 0.035, date: daysAgo(1) },
  { id: "pr8", insumoId: "ins6", supplierId: "sup2", value: 0.08, date: daysAgo(10) },
  { id: "pr9", insumoId: "ins9", supplierId: "sup3", value: 0.095, date: daysAgo(1), observation: "Salmão do Chile" },
];

export const MOCK_TECHNICAL_SHEETS: TechnicalSheet[] = [
  { id: "ts1", productId: "p1", internalName: "BOWL-PROTEICO-01", desiredMargin: 45, ingredients: [
    { id: "tsi1", insumoId: "ins1", quantity: 60, unit: "g" },
    { id: "tsi2", insumoId: "ins2", quantity: 120, unit: "g" },
    { id: "tsi3", insumoId: "ins3", quantity: 30, unit: "g" },
    { id: "tsi4", insumoId: "ins4", quantity: 0.5, unit: "un" },
    { id: "tsi5", insumoId: "ins6", quantity: 20, unit: "ml" },
  ]},
  { id: "ts2", productId: "p2", internalName: "BOWL-VEGANO-01", desiredMargin: 48, ingredients: [
    { id: "tsi6", insumoId: "ins8", quantity: 80, unit: "g" },
    { id: "tsi7", insumoId: "ins7", quantity: 3, unit: "folha" },
    { id: "tsi8", insumoId: "ins5", quantity: 40, unit: "g" },
  ]},
  { id: "ts3", productId: "p3", internalName: "BOWL-MED-01", desiredMargin: 42, ingredients: [
    { id: "tsi9", insumoId: "ins9", quantity: 120, unit: "g" },
    { id: "tsi10", insumoId: "ins12", quantity: 30, unit: "ml" },
  ]},
  { id: "ts4", productId: "p11", internalName: "BOWL-TROP-01", desiredMargin: 40, ingredients: [
    { id: "tsi11", insumoId: "ins15", quantity: 100, unit: "g" },
    { id: "tsi12", insumoId: "ins14", quantity: 20, unit: "g" },
  ]},
  { id: "ts5", productId: "p12", internalName: "BOWL-LC-01", desiredMargin: 45, ingredients: [
    { id: "tsi13", insumoId: "ins13", quantity: 1, unit: "un" },
  ]},
  { id: "ts6", productId: "p13", internalName: "BOWL-ORI-01", desiredMargin: 45, ingredients: [
    { id: "tsi14", insumoId: "ins6", quantity: 25, unit: "ml" },
    { id: "tsi15", insumoId: "ins11", quantity: 40, unit: "g" },
  ]},
];

export const MOCK_REVIEWS: Review[] = [
  { id: "rev1", orderId: "ORD-005", stars: 5, comment: "Bowl de açaí perfeito! Ingredientes fresquíssimos e muito saboroso!", createdAt: daysAgo(2), customerId: "u4", customerName: "Ana Paula" },
  { id: "rev2", orderId: "ORD-099", stars: 4, comment: "Bowl proteico muito bom, só achei que poderia vir um pouco mais de quinoa.", createdAt: daysAgo(3), customerId: "u5", customerName: "Lucas Ferreira" },
  { id: "rev3", orderId: "ORD-088", stars: 5, comment: "Adorei o bowl vegano! Tudo muito fresco e bem temperado.", createdAt: daysAgo(5), customerId: "u7", customerName: "Pedro Alves" },
];

export const SALES_DATA = [
  { day: "Seg", vendas: 15, faturamento: 423.5 },
  { day: "Ter", vendas: 22, faturamento: 618.8 },
  { day: "Qua", vendas: 18, faturamento: 506.2 },
  { day: "Qui", vendas: 28, faturamento: 788.4 },
  { day: "Sex", vendas: 42, faturamento: 1182.6 },
  { day: "Sáb", vendas: 48, faturamento: 1351.2 },
  { day: "Dom", vendas: 35, faturamento: 985.5 },
];

export const TOP_PRODUCTS_DATA = [
  { name: "Bowl Proteico", pedidos: 132, color: "#4C7C59" },
  { name: "Bowl Vegano Power", pedidos: 98, color: "#7FA652" },
  { name: "Bowl Mediterrâneo", pedidos: 87, color: "#E9C46A" },
  { name: "Smoothie Detox", pedidos: 76, color: "#F4A261" },
  { name: "Bowl de Açaí", pedidos: 54, color: "#E76F51" },
];

export const ORDER_STATUS_DATA = [
  { name: "Entregues", value: 78, color: "#22c55e" },
  { name: "Preparando", value: 12, color: "#4C7C59" },
  { name: "A Caminho", value: 6, color: "#3b82f6" },
  { name: "Recebidos", value: 4, color: "#a855f7" },
];

export const MONTHLY_DATA = [
  { month: "Set", faturamento: 16420, lucro: 7890 },
  { month: "Out", faturamento: 19310, lucro: 9240 },
  { month: "Nov", faturamento: 17850, lucro: 8530 },
  { month: "Dez", faturamento: 28200, lucro: 13540 },
  { month: "Jan", faturamento: 24780, lucro: 11850 },
  { month: "Fev", faturamento: 26940, lucro: 12920 },
];

export const PRODUCT_COST_DATA = [
  { name: "Bowl Proteico", custo: 15.89, preco: 28.9, margem: 45.0, vendas: 132 },
  { name: "Bowl Vegano", custo: 12.95, preco: 24.9, margem: 48.0, vendas: 98 },
  { name: "Bowl Mediterrâneo", custo: 19.08, preco: 32.9, margem: 42.0, vendas: 87 },
  { name: "Salada Caesar", custo: 11.45, preco: 22.9, margem: 50.0, vendas: 64 },
  { name: "Smoothie Detox", custo: 7.61, preco: 16.9, margem: 55.0, vendas: 76 },
  { name: "Bowl Açaí", custo: 14.77, preco: 26.9, margem: 45.1, vendas: 54 },
];

export const INSUMO_PRICE_TREND = [
  { month: "Set", proteinas: 0.052, graos: 0.038, hortifruti: 0.025 },
  { month: "Out", proteinas: 0.055, graos: 0.040, hortifruti: 0.028 },
  { month: "Nov", proteinas: 0.058, graos: 0.042, hortifruti: 0.026 },
  { month: "Dez", proteinas: 0.062, graos: 0.045, hortifruti: 0.032 },
  { month: "Jan", proteinas: 0.057, graos: 0.041, hortifruti: 0.024 },
  { month: "Fev", proteinas: 0.055, graos: 0.042, hortifruti: 0.028 },
];

export const paymentLabels: Record<PaymentMethod, string> = {
  pix: "PIX",
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  meal_voucher: "Vale Refeição",
  cash: "Dinheiro",
};

export const statusLabels: Record<OrderStatus, string> = {
  received: "Recebido",
  preparing: "Preparando",
  ready: "Pronto",
  delivering: "A Caminho",
  delivered: "Entregue",
};

export const statusColors: Record<OrderStatus, string> = {
  received: "#a855f7",
  preparing: "#4C7C59",
  ready: "#3b82f6",
  delivering: "#06b6d4",
  delivered: "#22c55e",
};
