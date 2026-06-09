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

export interface StockItem {
  id: string;
  name: string;
  category: string;
  unit: InsumoUnit;
  currentQuantity: number;
  maxCapacity: number;
  minAlert: number;
  yieldRule?: {
    baseUnit: string;
    yields: number;
    yieldsUnit: InsumoUnit;
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
  orderId?: string;
  notes?: string;
}

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
  allergens?: string[];
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
  stockItemId?: string;
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

export type CouponType = "percentage" | "fixed" | "shipping" | "inactive";

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

export interface CartItem extends OrderItem {
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
