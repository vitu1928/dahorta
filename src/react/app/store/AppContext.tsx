import React, { createContext, useContext, useState, useCallback } from "react";
import {
  User, Product, Order, OrderItem, PaymentMethod, Address,
  MOCK_USERS, MOCK_PRODUCTS, MOCK_ORDERS, MOCK_CATEGORIES, Category,
  generateDeliveryCode, OrderStatus,
  Supplier, Insumo, PriceRecord, TechnicalSheet, TechnicalSheetIngredient, Review,
  MOCK_SUPPLIERS, MOCK_INSUMOS, MOCK_PRICE_RECORDS, MOCK_TECHNICAL_SHEETS, MOCK_REVIEWS,
  InsumoUnit, StockItem, StockMovement, MOCK_STOCK_ITEMS, MOCK_STOCK_MOVEMENTS,
  PlateOfDayConfig, MOCK_PLATE_OF_DAY, Coupon, MOCK_COUPONS,
  getAllergensByProductId
} from "./mockData";

export type { Category, Coupon };
export { MOCK_CATEGORIES, getAllergensByProductId };

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
  pricePeriodDays: number;
  stockItems: StockItem[];
  stockMovements: StockMovement[];
  plateOfDay: PlateOfDayConfig;
  coupons: Coupon[];
  activeCoupon: Coupon | null;
  discountAmount: number;
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => { success: boolean; message: string; role?: string };
  logout: () => void;
  register: (name: string, email: string, password: string, phone: string) => { success: boolean; message: string };
  addToCart: (product: Product, quantity?: number, subItems?: any[]) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  deliveryFee: number;
  applyCoupon: (code: string) => { success: boolean, message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Omit<Coupon, "id" | "usedCount" | "totalSalesVolume">) => void;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  placeOrder: (paymentMethod: PaymentMethod, address: Address, notes?: string, addressNotes?: string) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus, motoboyId?: string) => void;
  confirmDelivery: (orderId: string, code: string) => boolean;
  addProduct: (product: Omit<Product, "id">) => string;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductAvailability: (id: string) => void;
  toggleRestaurant: () => void;
  setActiveOrder: (id: string | null) => void;
  // Suppliers
  addSupplier: (supplier: Omit<Supplier, "id">) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  // Insumos
  addInsumo: (insumo: Omit<Insumo, "id">) => void;
  updateInsumo: (id: string, insumo: Partial<Insumo>) => void;
  deleteInsumo: (id: string) => void;
  // Price Records
  addPriceRecord: (record: Omit<PriceRecord, "id">) => void;
  deletePriceRecord: (id: string) => void;
  // Technical Sheets
  saveTechnicalSheet: (sheet: Omit<TechnicalSheet, "id"> & { id?: string }) => void;
  deleteTechnicalSheet: (productId: string) => void;
  getTechnicalSheetByProduct: (productId: string) => TechnicalSheet | undefined;
  // Cost Calculation
  calculateIngredientCost: (ingredient: TechnicalSheetIngredient) => { unitPrice: number; total: number; supplierId: string | null };
  calculateSheetCost: (sheet: TechnicalSheet) => number;
  getBestPrice: (insumoId: string) => { value: number; supplierId: string } | null;
  // Settings
  setPricePeriodDays: (days: number) => void;
  // Reviews
  addReview: (review: Omit<Review, "id">) => void;
  getOrderReview: (orderId: string) => Review | undefined;
  // ─── Inventory Management ──────────────────────────────────────────────
  addStockItem: (item: Omit<StockItem, "id">) => void;
  updateStockItem: (id: string, item: Partial<StockItem>) => void;
  deleteStockItem: (id: string) => void;
  addStockMovement: (movement: Omit<StockMovement, "id" | "timestamp">) => void;
  adjustStock: (stockItemId: string, quantity: number, notes?: string) => void;
  checkStockAvailability: (productId: string, quantity: number) => { available: boolean; missing: string[] };
  updatePlateOfDay: (day: number, productId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [restaurantOpen, setRestaurantOpen] = useState(true);
  const [activeOrderId, setActiveOrderIdState] = useState<string | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(MOCK_USERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [insumos, setInsumos] = useState<Insumo[]>(MOCK_INSUMOS);
  const [priceRecords, setPriceRecords] = useState<PriceRecord[]>(MOCK_PRICE_RECORDS);
  const [technicalSheets, setTechnicalSheets] = useState<TechnicalSheet[]>(MOCK_TECHNICAL_SHEETS);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [pricePeriodDays, setPricePeriodDaysState] = useState(60);
  const [stockItems, setStockItems] = useState<StockItem[]>(MOCK_STOCK_ITEMS);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(MOCK_STOCK_MOVEMENTS);
  const [plateOfDay, setPlateOfDay] = useState<PlateOfDayConfig>(MOCK_PLATE_OF_DAY);
  const [orderNotes, setOrderNotes] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);

  const login = useCallback((email: string, password: string) => {
    const user = registeredUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      return { success: true, message: "Login realizado com sucesso!", role: user.role };
    }
    return { success: false, message: "E-mail ou senha incorretos." };
  }, [registeredUsers]);

  const logout = useCallback(() => { setCurrentUser(null); setCart([]); }, []);

  const register = useCallback((name: string, email: string, password: string, phone: string) => {
    const existing = registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return { success: false, message: "Este e-mail já está cadastrado." };
    const newUser: User = {
      id: `u${Date.now()}`, name, email, password, role: "customer", phone,
      avatar: name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
    };
    setRegisteredUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, message: "Conta criada com sucesso!" };
  }, [registeredUsers]);

  const addToCart = useCallback((product: Product, quantity = 1, subItems?: any[]) => {
    setCart((prev) => {
      // For combos with specific selections, always treat as a unique item
      if (subItems && subItems.length > 0) {
        return [...prev, { 
          productId: product.id, 
          name: product.name, 
          quantity, 
          price: product.price, 
          image: product.image,
          subItems 
        }];
      }

      const existing = prev.find((item) => item.productId === product.id && !item.subItems);
      if (existing) return prev.map((item) => (item.productId === product.id && !item.subItems) ? { ...item, quantity: item.quantity + quantity } : item);
      return [...prev, { productId: product.id, name: product.name, quantity, price: product.price, image: product.image }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => setCart((prev) => prev.filter((item) => item.productId !== productId)), []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) setCart((prev) => prev.filter((item) => item.productId !== productId));
    else setCart((prev) => prev.map((item) => item.productId === productId ? { ...item, quantity } : item));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);
  const cartTotalRaw = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  let discountAmount = 0;
  if (activeCoupon) {
    if (activeCoupon.type === "percentage") {
      discountAmount = cartTotalRaw * (activeCoupon.value / 100);
    } else if (activeCoupon.type === "fixed") {
      discountAmount = activeCoupon.value;
    }
  }
  const cartTotal = Math.max(0, cartTotalRaw - discountAmount);

  const DELIVERY_FEE = activeCoupon?.type === "shipping" ? 0 : 6.0;

  const applyCoupon = useCallback((code: string) => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) return { success: false, message: "Cupom não encontrado." };
    if (!coupon.active) return { success: false, message: "Este cupom está inativo." };
    if (coupon.expirationDate && new Date() > coupon.expirationDate) return { success: false, message: "Cupom expirado." };
    if (coupon.minOrderValue && cartTotalRaw < coupon.minOrderValue) return { success: false, message: `Valor mínimo para este cupom é R$ ${coupon.minOrderValue.toFixed(2)}.` };
    
    // Futuras validações podem ser adicionadas aqui (ex: restrição de categorias, etc)
    
    setActiveCoupon(coupon);
    return { success: true, message: "Cupom aplicado com sucesso!" };
  }, [coupons, cartTotalRaw]);

  const removeCoupon = useCallback(() => {
    setActiveCoupon(null);
  }, []);

  const addCoupon = useCallback((coupon: Omit<Coupon, "id" | "usedCount" | "totalSalesVolume">) => {
    const newCoupon: Coupon = {
      ...coupon,
      id: `coup${Date.now()}`,
      usedCount: 0,
      totalSalesVolume: 0,
    };
    setCoupons((prev) => [...prev, newCoupon]);
  }, []);

  const updateCoupon = useCallback((id: string, coupon: Partial<Coupon>) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...coupon } : c)));
  }, []);

  const deleteCoupon = useCallback((id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ─── Automatic Stock Deduction ─────────────────────────────────────────────

  const deductStock = useCallback((productId: string, quantity: number, orderId: string) => {
    const sheet = technicalSheets.find((s) => s.productId === productId);
    if (!sheet) return;

    sheet.ingredients.forEach((ingredient) => {
      if (!ingredient.stockItemId) return;

      const stockItem = stockItems.find((s) => s.id === ingredient.stockItemId);
      if (!stockItem) return;

      // Calcular quantidade real a deduzir (considerando yield rules)
      let quantityToDeduct = ingredient.quantity * quantity;

      // Se o item tem yieldRule e unidades diferem, converter unidades
      if (ingredient.unit === "un" && stockItem.yieldRule && stockItem.unit !== "un") {
        // Ex: 1 abacate (un) = 120g
        quantityToDeduct = (ingredient.quantity * stockItem.yieldRule.yields) * quantity;
      }

      // Atualizar estoque
      setStockItems((prev) =>
        prev.map((s) =>
          s.id === ingredient.stockItemId
            ? { ...s, currentQuantity: s.currentQuantity - quantityToDeduct }
            : s
        )
      );

      // Registrar movimento
      const movement: StockMovement = {
        id: `mov${Date.now()}_${Math.random()}`,
        stockItemId: ingredient.stockItemId,
        type: "exit_auto",
        quantity: quantityToDeduct,
        userId: currentUser?.id || "system",
        userName: currentUser?.name || "Sistema",
        timestamp: new Date(),
        orderId: orderId,
        notes: `Baixa automática - ${quantity}x ${products.find((p) => p.id === productId)?.name}`,
      };

      setStockMovements((prev) => [...prev, movement]);
    });
  }, [technicalSheets, stockItems, currentUser, products]);

  const checkStockAvailability = useCallback((productId: string, quantity: number): { available: boolean; missing: string[] } => {
    const sheet = technicalSheets.find((s) => s.productId === productId);
    if (!sheet) return { available: true, missing: [] };

    const missing: string[] = [];

    sheet.ingredients.forEach((ingredient) => {
      if (!ingredient.stockItemId) return;

      const stockItem = stockItems.find((s) => s.id === ingredient.stockItemId);
      if (!stockItem) return;

      let quantityNeeded = ingredient.quantity * quantity;

      // Se o item tem yieldRule e unidades diferem, converter unidades
      if (ingredient.unit === "un" && stockItem.yieldRule && stockItem.unit !== "un") {
        quantityNeeded = (ingredient.quantity * stockItem.yieldRule.yields) * quantity;
      }

      if (stockItem.currentQuantity < quantityNeeded) {
        missing.push(stockItem.name);
      }
    });

    return { available: missing.length === 0, missing };
  }, [technicalSheets, stockItems]);

  const placeOrder = useCallback((paymentMethod: PaymentMethod, address: Address, notes?: string, addressNotes?: string): Order | null => {
    if (!currentUser || cart.length === 0) return null;

    // Verificar disponibilidade de estoque para todos os itens do carrinho
    const stockCheck: { productId: string; quantity: number; missing: string[] }[] = [];
    
    cart.forEach((item) => {
      const check = checkStockAvailability(item.productId, item.quantity);
      if (!check.available) {
        stockCheck.push({ productId: item.productId, quantity: item.quantity, missing: check.missing });
      }
    });

    if (stockCheck.length > 0) {
      // Em produção, isso geraria um alerta/modal para o usuário
      console.error("Estoque insuficiente:", stockCheck);
      // Para demo, vamos permitir o pedido mas logar o problema
    }

    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
      customerId: currentUser.id, customerName: currentUser.name, customerPhone: currentUser.phone || "",
      items: [...cart], status: "received", paymentMethod, deliveryAddress: address,
      subtotal: cartTotal, deliveryFee: DELIVERY_FEE, total: cartTotal + DELIVERY_FEE,
      createdAt: new Date(), deliveryCode: generateDeliveryCode(),
      notes,
      addressNotes,
    };

    // Deduzir estoque automaticamente para cada item do pedido
    cart.forEach((item) => {
      deductStock(item.productId, item.quantity, newOrder.id);
    });

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setOrderNotes("");
    setActiveOrderIdState(newOrder.id);
    return newOrder;
  }, [currentUser, cart, cartTotal, orders.length, checkStockAvailability, deductStock, DELIVERY_FEE]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus, motoboyId?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status, ...(motoboyId ? { motoboyId } : {}) }
          : o
      )
    );
  }, []);

  const confirmDelivery = useCallback((orderId: string, code: string): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (order && order.deliveryCode === code) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "delivered" } : o)));
      return true;
    }
    return false;
  }, [orders]);

  const addProduct = useCallback((product: Omit<Product, "id">): string => {
    const newId = `p${Date.now()}`;
    setProducts((prev) => [...prev, { ...product, id: newId }]);
    return newId;
  }, []);

  const updateProduct = useCallback((id: string, product: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...product } : p)));
  }, []);

  const deleteProduct = useCallback((id: string) => setProducts((prev) => prev.filter((p) => p.id !== id)), []);

  const toggleProductAvailability = useCallback((id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, available: !p.available } : p)));
  }, []);

  const toggleRestaurant = useCallback(() => setRestaurantOpen((prev) => !prev), []);
  const setActiveOrder = useCallback((id: string | null) => setActiveOrderIdState(id), []);

  // Suppliers
  const addSupplier = useCallback((supplier: Omit<Supplier, "id">) => {
    setSuppliers((prev) => [...prev, { ...supplier, id: `sup${Date.now()}` }]);
  }, []);
  const updateSupplier = useCallback((id: string, supplier: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...supplier } : s)));
  }, []);
  const deleteSupplier = useCallback((id: string) => setSuppliers((prev) => prev.filter((s) => s.id !== id)), []);

  // Insumos
  const addInsumo = useCallback((insumo: Omit<Insumo, "id">) => {
    setInsumos((prev) => [...prev, { ...insumo, id: `ins${Date.now()}` }]);
  }, []);
  const updateInsumo = useCallback((id: string, insumo: Partial<Insumo>) => {
    setInsumos((prev) => prev.map((i) => (i.id === id ? { ...i, ...insumo } : i)));
  }, []);
  const deleteInsumo = useCallback((id: string) => setInsumos((prev) => prev.filter((i) => i.id !== id)), []);

  // Price Records
  const addPriceRecord = useCallback((record: Omit<PriceRecord, "id">) => {
    setPriceRecords((prev) => [...prev, { ...record, id: `pr${Date.now()}` }]);
  }, []);
  const deletePriceRecord = useCallback((id: string) => setPriceRecords((prev) => prev.filter((r) => r.id !== id)), []);

  // Technical Sheets
  const saveTechnicalSheet = useCallback((sheet: Omit<TechnicalSheet, "id"> & { id?: string }) => {
    if (sheet.id) {
      setTechnicalSheets((prev) => prev.map((s) => (s.id === sheet.id ? { ...sheet, id: sheet.id } as TechnicalSheet : s)));
    } else {
      const existing = technicalSheets.find((s) => s.productId === sheet.productId);
      if (existing) {
        setTechnicalSheets((prev) => prev.map((s) => (s.productId === sheet.productId ? { ...sheet, id: s.id } : s)));
      } else {
        setTechnicalSheets((prev) => [...prev, { ...sheet, id: `ts${Date.now()}` }]);
      }
    }
  }, [technicalSheets]);

  const deleteTechnicalSheet = useCallback((productId: string) => {
    setTechnicalSheets((prev) => prev.filter((s) => s.productId !== productId));
  }, []);

  const getTechnicalSheetByProduct = useCallback((productId: string) => {
    return technicalSheets.find((s) => s.productId === productId);
  }, [technicalSheets]);

  // Cost Calculation
  const getBestPrice = useCallback((insumoId: string): { value: number; supplierId: string } | null => {
    const cutoff = new Date(Date.now() - pricePeriodDays * 24 * 60 * 60 * 1000);
    const validRecords = priceRecords.filter(
      (r) => r.insumoId === insumoId && new Date(r.date) >= cutoff
    );
    if (validRecords.length === 0) {
      const allRecords = priceRecords.filter((r) => r.insumoId === insumoId);
      if (allRecords.length === 0) return null;
      const best = allRecords.reduce((min, r) => r.value < min.value ? r : min);
      return { value: best.value, supplierId: best.supplierId };
    }
    const best = validRecords.reduce((min, r) => r.value < min.value ? r : min);
    return { value: best.value, supplierId: best.supplierId };
  }, [priceRecords, pricePeriodDays]);

  const calculateIngredientCost = useCallback((ingredient: TechnicalSheetIngredient): { unitPrice: number; total: number; supplierId: string | null } => {
    let unitPrice = 0;
    let supplierId: string | null = null;
    if (ingredient.supplierId) {
      const cutoff = new Date(Date.now() - pricePeriodDays * 24 * 60 * 60 * 1000);
      const records = priceRecords.filter(
        (r) => r.insumoId === ingredient.insumoId && r.supplierId === ingredient.supplierId && new Date(r.date) >= cutoff
      );
      if (records.length > 0) {
        const latest = records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        unitPrice = latest.value;
        supplierId = ingredient.supplierId;
      } else {
        const best = getBestPrice(ingredient.insumoId);
        if (best) { unitPrice = best.value; supplierId = best.supplierId; }
      }
    } else {
      const best = getBestPrice(ingredient.insumoId);
      if (best) { unitPrice = best.value; supplierId = best.supplierId; }
    }
    return { unitPrice, total: unitPrice * ingredient.quantity, supplierId };
  }, [priceRecords, pricePeriodDays, getBestPrice]);

  const calculateSheetCost = useCallback((sheet: TechnicalSheet): number => {
    return sheet.ingredients.reduce((sum, ing) => {
      const { total } = calculateIngredientCost(ing);
      return sum + total;
    }, 0);
  }, [calculateIngredientCost]);

  const setPricePeriodDays = useCallback((days: number) => setPricePeriodDaysState(days), []);

  // Reviews
  const addReview = useCallback((review: Omit<Review, "id">) => {
    const newReview: Review = { ...review, id: `rev${Date.now()}` };
    setReviews((prev) => [...prev, newReview]);
    setOrders((prev) => prev.map((o) => o.id === review.orderId ? { ...o, reviewId: newReview.id } : o));
  }, []);

  const getOrderReview = useCallback((orderId: string) => {
    return reviews.find((r) => r.orderId === orderId);
  }, [reviews]);

  // ─── Inventory Management ──────────────────────────────────────────────────

  const addStockItem = useCallback((item: Omit<StockItem, "id">) => {
    setStockItems((prev) => [...prev, { ...item, id: `stk${Date.now()}` }]);
  }, []);

  const updateStockItem = useCallback((id: string, item: Partial<StockItem>) => {
    setStockItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...item } : s)));
  }, []);

  const deleteStockItem = useCallback((id: string) => {
    setStockItems((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addStockMovement = useCallback((movement: Omit<StockMovement, "id" | "timestamp">) => {
    const newMovement: StockMovement = {
      ...movement,
      id: `mov${Date.now()}`,
      timestamp: new Date(),
    };
    setStockMovements((prev) => [...prev, newMovement]);

    // Atualizar quantidade do item de estoque
    setStockItems((prev) =>
      prev.map((item) => {
        if (item.id === movement.stockItemId) {
          const delta = movement.type === "entry" ? movement.quantity : -movement.quantity;
          return { ...item, currentQuantity: item.currentQuantity + delta };
        }
        return item;
      })
    );
  }, []);

  const adjustStock = useCallback((stockItemId: string, quantity: number, notes?: string) => {
    if (!currentUser) return;

    const movement: StockMovement = {
      id: `mov${Date.now()}`,
      stockItemId,
      type: "adjustment",
      quantity,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date(),
      notes,
    };

    setStockMovements((prev) => [...prev, movement]);
    setStockItems((prev) =>
      prev.map((item) =>
        item.id === stockItemId
          ? { ...item, currentQuantity: item.currentQuantity + quantity }
          : item
      )
    );
  }, [currentUser]);

  const updatePlateOfDay = useCallback((day: number, productId: string) => {
    setPlateOfDay((prev) => ({ ...prev, [day]: productId }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser, isAuthenticated: !!currentUser, products, categories: MOCK_CATEGORIES,
        restaurantOpen, cart, orders, activeOrderId, suppliers, insumos, priceRecords,
        technicalSheets, reviews, pricePeriodDays, stockItems, stockMovements,
        plateOfDay, coupons, activeCoupon, discountAmount,
        login, logout, register,
        addToCart, removeFromCart, updateCartQuantity, clearCart,
        cartTotal, cartCount, deliveryFee: DELIVERY_FEE,
        applyCoupon, removeCoupon,
        orderNotes, setOrderNotes,
        placeOrder, updateOrderStatus, confirmDelivery,
        addProduct, updateProduct, deleteProduct, toggleProductAvailability,
        toggleRestaurant, setActiveOrder,
        addSupplier, updateSupplier, deleteSupplier,
        addInsumo, updateInsumo, deleteInsumo,
        addPriceRecord, deletePriceRecord,
        saveTechnicalSheet, deleteTechnicalSheet, getTechnicalSheetByProduct,
        calculateIngredientCost, calculateSheetCost, getBestPrice,
        setPricePeriodDays,
        addReview, getOrderReview,
        addStockItem, updateStockItem, deleteStockItem,
        addStockMovement, adjustStock, checkStockAvailability,
        updatePlateOfDay,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
