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
  totalAmount?: number;
  deliveryFee: number;
  discount?: number;
  address?: Address;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: Date;
  updatedAt?: Date;
  deliveryCode?: string;
  motoboyId?: string;
  notes?: string;
  addressNotes?: string;
  customerName?: string;
  customerPhone?: string;
  subtotal?: number;
  total?: number;
  reviewId?: string;
  deliveryAddress?: Address;
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

export interface Insumo {
  id: string;
  name: string;
  unit: string;
  category: string;
  observations?: string;
  allergens?: string[];
}

export type PlateOfDayConfig = Record<number, string>;

export interface StockItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentQuantity: number;
  maxCapacity: number;
  minAlert: number;
  yieldRule?: any;
}

export interface StockMovement {
  id: string;
  stockItemId: string;
  type: string;
  quantity: number;
  userId: string;
  userName: string;
  timestamp: Date;
  notes?: string;
}

export interface TechnicalSheet {
  id: string;
  productId: string;
  internalName: string;
  desiredMargin: number;
  ingredients: { id: string; insumoId: string; quantity: number; unit: string }[];
}
