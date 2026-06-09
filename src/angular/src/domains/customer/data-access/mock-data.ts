import {
  Address,
  Category,
  Coupon,
  Insumo,
  Order,
  PlateOfDayConfig,
  Product,
  Review,
  StockItem,
  StockMovement,
  TechnicalSheet,
  User,
} from './models';

const bowlProteico = '/assets/bowl_proteico.png';
const bowlVegano = '/assets/bowl_vegano.png';
const bowlMediterraneo = '/assets/bowl_mediterraneo.png';
const bowlAsiatico = '/assets/bowl_oriental.png';
const bowlFrango = '/assets/bowl_low_carb.png';
const bowlTropical = '/assets/bowl_tropical.png';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Rafael Mendes', email: 'dono@dahorta.com', password: '123456', role: 'owner', phone: '(11) 99999-0001', avatar: 'RM' },
  { id: 'u2', name: 'Carlos Lima', email: 'func@dahorta.com', password: '123456', role: 'employee', phone: '(11) 99999-0002', avatar: 'CL' },
  { id: 'u3', name: 'Diego Santos', email: 'moto@dahorta.com', password: '123456', role: 'motoboy', phone: '(11) 99999-0003', avatar: 'DS' },
  { id: 'u4', name: 'Ana Paula', email: 'cliente@email.com', password: '123456', role: 'customer', phone: '(11) 98888-1234', avatar: 'AP' },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Bowls', icon: '🥗' },
  { id: 'c2', name: 'Saladas', icon: '🥬' },
  { id: 'c3', name: 'Bebidas', icon: '🥤' },
  { id: 'c4', name: 'Sobremesas', icon: '🍨' },
  { id: 'c5', name: 'Acompanhamentos', icon: '🍞' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Bowl Proteico',
    internalName: 'BOWL-PROTEICO-01',
    description: 'Quinoa, frango grelhado organico, abacate, tomate cereja, espinafre e molho tahine.',
    image: bowlProteico,
    price: 28.9,
    category: 'c1',
    available: true,
    prepTime: 12,
    featured: true,
    desiredMargin: 45,
  },
  {
    id: 'p2',
    name: 'Bowl Vegano Power',
    internalName: 'BOWL-VEGANO-01',
    description: 'Grao-de-bico, couve massageada, cenoura ralada, beterraba, hummus e sementes de girassol.',
    image: bowlVegano,
    price: 24.9,
    category: 'c1',
    available: true,
    prepTime: 10,
    featured: true,
    desiredMargin: 48,
  },
  {
    id: 'p3',
    name: 'Bowl Mediterraneo',
    description: 'Arroz integral, salmao grelhado, pepino, azeitonas, tomate e molho de iogurte.',
    image: bowlMediterraneo,
    price: 32.9,
    category: 'c1',
    available: true,
    prepTime: 15,
    featured: true,
    desiredMargin: 42,
  },
  {
    id: 'p12',
    name: 'Bowl Low-Carb Frango',
    description: 'Arroz de couve-flor, frango grelhado premium, brocolis ao bafo, ovo cozido e sementes de gergelim.',
    image: bowlFrango,
    price: 29.9,
    category: 'c1',
    available: true,
    prepTime: 12,
  },
  {
    id: 'p13',
    name: 'Bowl Asiatico',
    description: 'Macarrao de arroz, tofu defumado, edamame, cogumelos shitake e molho de soja e gengibre.',
    image: bowlAsiatico,
    price: 31.9,
    category: 'c1',
    available: true,
    prepTime: 14,
  },
  {
    id: 'p4',
    name: 'Salada Caesar Organica',
    description: 'Alface romana organica, croutons artesanais, parmesao e molho caesar caseiro.',
    image: 'https://i.imgur.com/BM0eoHE.jpeg',
    price: 22.9,
    category: 'c2',
    available: true,
    prepTime: 8,
    desiredMargin: 50,
  },
  {
    id: 'p5',
    name: 'Suco de Laranja Organico',
    description: 'Suco de laranja 100% natural e organico, sem adicao de acucar ou conservantes. 400ml.',
    image: 'https://i.imgur.com/D5fUFkH.jpeg',
    price: 12.9,
    category: 'c3',
    available: true,
    prepTime: 3,
  },
  {
    id: 'p6',
    name: 'Pink Lemonade Natural',
    description: 'Limao siciliano, framboesa natural e agua gaseificada. Uma explosao de sabor. 400ml.',
    image: 'https://i.imgur.com/qpBWUlU.jpeg',
    price: 15.9,
    category: 'c3',
    available: true,
    prepTime: 5,
  },
  {
    id: 'p14',
    name: 'Kombucha de Gengibre',
    description: 'Bebida fermentada milenar, naturalmente gaseificada e probiotica. 300ml.',
    image: 'https://i.imgur.com/xcjjl0M.jpeg',
    price: 18.9,
    category: 'c3',
    available: true,
    prepTime: 2,
  },
  {
    id: 'p15',
    name: 'Cha Mate com Limao',
    description: 'Mate artesanal batido com limao e gelo. Sabor carioca e natural. 400ml.',
    image: 'https://i.imgur.com/PLxpqrU.jpeg',
    price: 11.9,
    category: 'c3',
    available: true,
    prepTime: 4,
  },
  {
    id: 'p16',
    name: 'Agua Mineral Alcalina',
    description: 'Agua mineral alcalina de PH elevado para hidratacao maxima. 500ml.',
    image: 'https://i.imgur.com/J6fsFty.jpeg',
    price: 6.9,
    category: 'c3',
    available: true,
    prepTime: 1,
  },
  {
    id: 'p7',
    name: 'Bowl de Acai Organico',
    description: 'Acai puro batido com banana, coberto com granola artesanal, frutas frescas e mel.',
    image: 'https://i.imgur.com/UWcS8Go.jpeg',
    price: 26.9,
    category: 'c4',
    available: true,
    prepTime: 8,
  },
  {
    id: 'p8',
    name: 'Mousse de Cacau Raw',
    description: 'Mousse de cacau cru com abacate, tamaras e castanhas. Vegano e sem acucar refinado.',
    image: 'https://i.imgur.com/ihFpYkN.jpeg',
    price: 18.9,
    category: 'c4',
    available: true,
    prepTime: 0,
  },
  {
    id: 'p17',
    name: 'Chia Pudding de Coco',
    description: 'Sementes de chia hidratadas no leite de coco, com laminas de coco e morangos. Vegano.',
    image: 'https://i.imgur.com/mfV8k60.jpeg',
    price: 21.9,
    category: 'c4',
    available: true,
    prepTime: 2,
  },
  {
    id: 'p18',
    name: 'Cheesecake de Frutas Vermelhas',
    description: 'Cheesecake vegano com base de amendoas e calda caseira de frutas vermelhas.',
    image: 'https://i.imgur.com/A5w2xJK.jpeg',
    price: 24.9,
    category: 'c4',
    available: true,
    prepTime: 2,
  },
  {
    id: 'p19',
    name: 'Brownie de Batata Doce',
    description: 'Brownie denso e chocolatudo, adocado naturalmente, sem gluten e sem lactose.',
    image: 'https://i.imgur.com/RVx4FyV.jpeg',
    price: 16.9,
    category: 'c4',
    available: true,
    prepTime: 2,
  },
  {
    id: 'p20',
    name: 'Salada de Frutas Tropical',
    description: 'Mix de frutas da estacao rigorosamente selecionadas com suco de laranja.',
    image: 'https://i.imgur.com/hVEpQWR.jpeg',
    price: 14.9,
    category: 'c4',
    available: true,
    prepTime: 5,
  },
  {
    id: 'p9',
    name: 'Pao Integral Artesanal',
    description: 'Pao 100% integral com sementes de chia, linhaca e girassol. 2 fatias.',
    image: 'https://i.imgur.com/uvBI6kE.jpeg',
    price: 8.9,
    category: 'c5',
    available: true,
    prepTime: 3,
  },
  {
    id: 'p21',
    name: 'Batata Doce com Alecrim',
    description: 'Cubos de batata doce organica assados com azeite e alecrim fresco.',
    image: 'https://i.imgur.com/jygmHBo.jpeg',
    price: 12.9,
    category: 'c5',
    available: true,
    prepTime: 10,
  },
  {
    id: 'p22',
    name: 'Chips de Mandioca',
    description: 'Laminas crocantes de mandioca preparadas na airfryer com sal marinho.',
    image: 'https://i.imgur.com/c8aI4Ez.jpeg',
    price: 10.9,
    category: 'c5',
    available: true,
    prepTime: 12,
  },
  {
    id: 'p23',
    name: 'Mix de Vegetais Grelhados',
    description: 'Abobrinha, berinjela e pimentoes grelhados com ervas finas.',
    image: 'https://i.imgur.com/mviwuIq.jpeg',
    price: 15.9,
    category: 'c5',
    available: true,
    prepTime: 8,
  },
  {
    id: 'p10',
    name: 'Combo Casal Fitness',
    description: '2 Bowls a escolha + 2 Sucos Detox com um desconto especial.',
    image: bowlProteico,
    price: 79.9,
    category: 'c1',
    available: true,
    prepTime: 20,
    isCombo: true,
    comboSlots: [
      { id: 's1', name: 'Primeiro Bowl', type: 'selectable', products: ['p1', 'p2', 'p3', 'p11', 'p12', 'p13'] },
      { id: 's2', name: 'Segundo Bowl', type: 'selectable', products: ['p1', 'p2', 'p3', 'p11', 'p12', 'p13'] },
      { id: 's3', name: 'Bebida 1', type: 'selectable', products: ['p5', 'p6', 'p14', 'p15'] },
      { id: 's4', name: 'Bebida 2', type: 'selectable', products: ['p5', 'p6', 'p14', 'p15'] },
    ],
  },
];

export const MOCK_COUPONS: Coupon[] = [
  {
    id: 'coup2',
    code: 'DAHORTA20',
    type: 'percentage',
    value: 20,
    active: true,
    minOrderValue: 50,
    expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    usedCount: 89,
    totalSalesVolume: 2670,
  },
  { id: 'coup3', code: 'FRETEGRATIS', type: 'shipping', value: 0, active: true, usedCount: 320, totalSalesVolume: 9600 },
  { id: 'coup4', code: 'VERAOINATIVO', type: 'inactive', value: 10, active: false, usedCount: 500, totalSalesVolume: 15000 },
];

export const MOCK_PLATE_OF_DAY: PlateOfDayConfig = {
  0: 'p1',
  1: 'p1',
  2: 'p2',
  3: 'p3',
  4: 'p1',
  5: 'p2',
  6: 'p3',
};

export const MOCK_STOCK_ITEMS: StockItem[] = [
  { id: 'stk1', name: 'Tomate Cereja Organico', category: 'hortifruti', unit: 'g', currentQuantity: 2500, maxCapacity: 5000, minAlert: 500 },
  { id: 'stk2', name: 'Alface Romana', category: 'hortifruti', unit: 'un', currentQuantity: 15, maxCapacity: 30, minAlert: 5, yieldRule: { baseUnit: '1 alface', yields: 10, yieldsUnit: 'porção' } },
  { id: 'stk3', name: 'Espinafre Fresco', category: 'hortifruti', unit: 'g', currentQuantity: 1200, maxCapacity: 3000, minAlert: 300 },
  { id: 'stk4', name: 'Couve Organica', category: 'hortifruti', unit: 'folha', currentQuantity: 80, maxCapacity: 150, minAlert: 20 },
  { id: 'stk5', name: 'Abacate', category: 'hortifruti', unit: 'un', currentQuantity: 100, maxCapacity: 200, minAlert: 10, yieldRule: { baseUnit: '1 abacate', yields: 120, yieldsUnit: 'g' } },
  { id: 'stk6', name: 'Cenoura Organica', category: 'hortifruti', unit: 'un', currentQuantity: 18, maxCapacity: 40, minAlert: 8, yieldRule: { baseUnit: '1 cenoura', yields: 80, yieldsUnit: 'g' } },
  { id: 'stk7', name: 'Beterraba', category: 'hortifruti', unit: 'un', currentQuantity: 12, maxCapacity: 30, minAlert: 6, yieldRule: { baseUnit: '1 beterraba', yields: 150, yieldsUnit: 'g' } },
  { id: 'stk8', name: 'Pepino', category: 'hortifruti', unit: 'un', currentQuantity: 20, maxCapacity: 40, minAlert: 8, yieldRule: { baseUnit: '1 pepino', yields: 100, yieldsUnit: 'g' } },
  { id: 'stk9', name: 'Peito de Frango Organico', category: 'proteina', unit: 'g', currentQuantity: 4500, maxCapacity: 8000, minAlert: 1000 },
  { id: 'stk10', name: 'Salmao Fresco', category: 'proteina', unit: 'g', currentQuantity: 2000, maxCapacity: 5000, minAlert: 500 },
  { id: 'stk11', name: 'Grao-de-bico Cozido', category: 'proteina', unit: 'g', currentQuantity: 3000, maxCapacity: 6000, minAlert: 800 },
  { id: 'stk12', name: 'Quinoa em Graos', category: 'graos', unit: 'g', currentQuantity: 5000, maxCapacity: 10000, minAlert: 1500 },
  { id: 'stk13', name: 'Arroz Integral', category: 'graos', unit: 'g', currentQuantity: 6000, maxCapacity: 15000, minAlert: 2000 },
  { id: 'stk14', name: 'Molho Tahine Caseiro', category: 'molhos', unit: 'ml', currentQuantity: 800, maxCapacity: 2000, minAlert: 200 },
  { id: 'stk15', name: 'Hummus Tradicional', category: 'molhos', unit: 'g', currentQuantity: 1200, maxCapacity: 3000, minAlert: 300 },
  { id: 'stk16', name: 'Molho Caesar Organico', category: 'molhos', unit: 'ml', currentQuantity: 600, maxCapacity: 1500, minAlert: 200 },
  { id: 'stk17', name: 'Azeite Extra Virgem', category: 'temperos', unit: 'ml', currentQuantity: 2500, maxCapacity: 5000, minAlert: 500 },
  { id: 'stk18', name: 'Azeitonas Pretas', category: 'secos', unit: 'g', currentQuantity: 800, maxCapacity: 2000, minAlert: 200 },
  { id: 'stk19', name: 'Sementes de Girassol', category: 'secos', unit: 'g', currentQuantity: 1500, maxCapacity: 3000, minAlert: 400 },
  { id: 'stk20', name: 'Acai Polpa Organica', category: 'secos', unit: 'g', currentQuantity: 5000, maxCapacity: 10000, minAlert: 1000 },
  { id: 'stk21', name: 'Granola Artesanal', category: 'secos', unit: 'g', currentQuantity: 2000, maxCapacity: 5000, minAlert: 500 },
];

export const MOCK_STOCK_MOVEMENTS: StockMovement[] = [
  { id: 'mov1', stockItemId: 'stk1', type: 'entry', quantity: 2000, userId: 'u1', userName: 'Rafael Mendes', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), notes: 'Compra semanal' },
  { id: 'mov2', stockItemId: 'stk2', type: 'entry', quantity: 20, userId: 'u2', userName: 'Carlos Lima', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), notes: 'Reposicao hortifruti' },
  { id: 'mov3', stockItemId: 'stk9', type: 'exit_manual', quantity: 500, userId: 'u2', userName: 'Carlos Lima', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), notes: 'Preparo bowls proteicos' },
  { id: 'mov4', stockItemId: 'stk12', type: 'adjustment', quantity: -200, userId: 'u1', userName: 'Carlos Lima', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), notes: 'Ajuste de inventario - perda' },
];

const baseAddress: Address = {
  id: 'a1',
  label: 'Casa',
  street: 'Rua das Flores',
  number: '142',
  complement: 'Apto 31',
  neighborhood: 'Jardim Paulista',
  city: 'Sao Paulo',
  zipCode: '01310-100',
};

export const generateDeliveryCode = (): string => Math.floor(100000 + Math.random() * 900000).toString();

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customerId: 'u4',
    customerName: 'Ana Paula',
    customerPhone: '(11) 98888-1234',
    items: [
      { productId: 'p1', name: 'Bowl Proteico', quantity: 2, price: 28.9, image: bowlProteico },
      { productId: 'p5', name: 'Smoothie Detox', quantity: 1, price: 16.9, image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&q=80' },
    ],
    status: 'preparing',
    paymentMethod: 'pix',
    deliveryAddress: baseAddress,
    subtotal: 74.7,
    deliveryFee: 6,
    total: 80.7,
    createdAt: new Date(Date.now() - 12 * 60000),
    deliveryCode: '482910',
  },
  {
    id: 'ORD-002',
    customerId: 'u5',
    customerName: 'Lucas Ferreira',
    customerPhone: '(11) 97777-5678',
    items: [
      { productId: 'p2', name: 'Bowl Vegano Power', quantity: 1, price: 24.9, image: bowlVegano },
      { productId: 'p6', name: 'Suco Verde Energizante', quantity: 1, price: 14.9, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80' },
    ],
    status: 'received',
    paymentMethod: 'credit_card',
    deliveryAddress: { ...baseAddress, id: 'a2', label: 'Trabalho', street: 'Av. Paulista', number: '1578', neighborhood: 'Bela Vista', complement: 'Sala 902' },
    subtotal: 39.8,
    deliveryFee: 6,
    total: 45.8,
    createdAt: new Date(Date.now() - 5 * 60000),
    deliveryCode: '731045',
  },
  {
    id: 'ORD-003',
    customerId: 'u6',
    customerName: 'Mariana Costa',
    customerPhone: '(11) 96666-9012',
    items: [{ productId: 'p3', name: 'Bowl Mediterraneo', quantity: 1, price: 32.9, image: bowlMediterraneo }],
    status: 'ready',
    paymentMethod: 'meal_voucher',
    deliveryAddress: { ...baseAddress, id: 'a3', street: 'Rua Augusta', number: '890', neighborhood: 'Consolacao', complement: '' },
    subtotal: 32.9,
    deliveryFee: 6,
    total: 38.9,
    createdAt: new Date(Date.now() - 28 * 60000),
    deliveryCode: '295847',
    motoboyId: 'u3',
    addressNotes: 'Predio comercial, deixar na recepcao.',
  },
  {
    id: 'ORD-004',
    customerId: 'u7',
    customerName: 'Pedro Alves',
    customerPhone: '(11) 95555-3456',
    items: [{ productId: 'p4', name: 'Salada Caesar Organica', quantity: 2, price: 22.9, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80' }],
    status: 'delivering',
    paymentMethod: 'debit_card',
    deliveryAddress: { ...baseAddress, id: 'a4', street: 'Rua Oscar Freire', number: '455', neighborhood: 'Cerqueira Cesar', complement: 'Casa 2' },
    subtotal: 45.8,
    deliveryFee: 6,
    total: 51.8,
    createdAt: new Date(Date.now() - 45 * 60000),
    deliveryCode: '619203',
    motoboyId: 'u3',
    addressNotes: 'Interfone 202, toca direto.',
  },
  {
    id: 'ORD-005',
    customerId: 'u4',
    customerName: 'Ana Paula',
    customerPhone: '(11) 98888-1234',
    items: [{ productId: 'p7', name: 'Bowl de Acai Organico', quantity: 1, price: 26.9, image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=80' }],
    status: 'delivered',
    paymentMethod: 'cash',
    deliveryAddress: baseAddress,
    subtotal: 26.9,
    deliveryFee: 6,
    total: 32.9,
    createdAt: new Date(Date.now() - 90 * 60000),
    deliveryCode: '504739',
    motoboyId: 'u3',
    reviewId: 'rev1',
  },
];

const daysAgo = (days: number): Date => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

export const MOCK_INSUMOS: Insumo[] = [
  { id: 'ins1', name: 'Quinoa em Graos Organica', unit: 'g', category: 'Graos', observations: 'Armazenar em local seco' },
  { id: 'ins2', name: 'Frango Organico (peito)', unit: 'g', category: 'Proteinas', observations: 'Manter refrigerado' },
  { id: 'ins3', name: 'Tomate Cereja', unit: 'g', category: 'Hortifruti' },
  { id: 'ins4', name: 'Abacate', unit: 'un', category: 'Hortifruti' },
  { id: 'ins5', name: 'Espinafre Fresco', unit: 'g', category: 'Hortifruti', observations: 'Higienizar antes do uso' },
  { id: 'ins6', name: 'Molho Tahine', unit: 'ml', category: 'Molhos', observations: 'Producao interna', allergens: ['Soja'] },
  { id: 'ins7', name: 'Couve Organica', unit: 'folha', category: 'Hortifruti' },
  { id: 'ins8', name: 'Grao-de-bico Cozido', unit: 'g', category: 'Proteinas' },
  { id: 'ins9', name: 'Salmao Fresco', unit: 'g', category: 'Proteinas', observations: 'Manter refrigerado, consumir em ate 48h', allergens: ['Peixe'] },
  { id: 'ins10', name: 'Acai Polpa', unit: 'g', category: 'Frutas', observations: 'Manter congelado' },
  { id: 'ins11', name: 'Pao de Trigo Artesanal', unit: 'un', category: 'Secos', allergens: ['Gluten'] },
  { id: 'ins12', name: 'Leite de Vaca', unit: 'ml', category: 'Laticinios', allergens: ['Leite'] },
  { id: 'ins13', name: 'Ovo de Galinha', unit: 'un', category: 'Proteinas', allergens: ['Ovo'] },
  { id: 'ins14', name: 'Castanha do Para', unit: 'g', category: 'Secos', allergens: ['Nozes'] },
  { id: 'ins15', name: 'Camarao Medio', unit: 'g', category: 'Proteinas', allergens: ['Crustaceos'] },
];

export const MOCK_TECHNICAL_SHEETS: TechnicalSheet[] = [
  { id: 'ts1', productId: 'p1', internalName: 'BOWL-PROTEICO-01', desiredMargin: 45, ingredients: [
    { id: 'tsi1', insumoId: 'ins1', quantity: 60, unit: 'g' },
    { id: 'tsi2', insumoId: 'ins2', quantity: 120, unit: 'g' },
    { id: 'tsi3', insumoId: 'ins3', quantity: 30, unit: 'g' },
    { id: 'tsi4', insumoId: 'ins4', quantity: 0.5, unit: 'un' },
    { id: 'tsi5', insumoId: 'ins6', quantity: 20, unit: 'ml' },
  ] },
  { id: 'ts2', productId: 'p2', internalName: 'BOWL-VEGANO-01', desiredMargin: 48, ingredients: [
    { id: 'tsi6', insumoId: 'ins8', quantity: 80, unit: 'g' },
    { id: 'tsi7', insumoId: 'ins7', quantity: 3, unit: 'folha' },
    { id: 'tsi8', insumoId: 'ins5', quantity: 40, unit: 'g' },
  ] },
  { id: 'ts3', productId: 'p3', internalName: 'BOWL-MED-01', desiredMargin: 42, ingredients: [
    { id: 'tsi9', insumoId: 'ins9', quantity: 120, unit: 'g' },
    { id: 'tsi10', insumoId: 'ins12', quantity: 30, unit: 'ml' },
  ] },
  { id: 'ts4', productId: 'p11', internalName: 'BOWL-TROP-01', desiredMargin: 40, ingredients: [
    { id: 'tsi11', insumoId: 'ins15', quantity: 100, unit: 'g' },
    { id: 'tsi12', insumoId: 'ins14', quantity: 20, unit: 'g' },
  ] },
  { id: 'ts5', productId: 'p12', internalName: 'BOWL-LC-01', desiredMargin: 45, ingredients: [
    { id: 'tsi13', insumoId: 'ins13', quantity: 1, unit: 'un' },
  ] },
  { id: 'ts6', productId: 'p13', internalName: 'BOWL-ORI-01', desiredMargin: 45, ingredients: [
    { id: 'tsi14', insumoId: 'ins6', quantity: 25, unit: 'ml' },
    { id: 'tsi15', insumoId: 'ins11', quantity: 40, unit: 'g' },
  ] },
];

export const getAllergensByProductId = (productId: string): string[] => {
  const sheet = MOCK_TECHNICAL_SHEETS.find((technicalSheet) => technicalSheet.productId === productId);
  if (!sheet) {
    return [];
  }

  const allergens = sheet.ingredients.flatMap((ingredient) => {
    const insumo = MOCK_INSUMOS.find((item) => item.id === ingredient.insumoId);
    return insumo?.allergens ?? [];
  });

  return Array.from(new Set(allergens));
};

export const MOCK_REVIEWS: Review[] = [
  { id: 'rev1', orderId: 'ORD-005', stars: 5, comment: 'Bowl de acai perfeito! Ingredientes fresquissimos e muito saboroso!', createdAt: daysAgo(2), customerId: 'u4', customerName: 'Ana Paula' },
  { id: 'rev2', orderId: 'ORD-099', stars: 4, comment: 'Bowl proteico muito bom, so achei que poderia vir um pouco mais de quinoa.', createdAt: daysAgo(3), customerId: 'u5', customerName: 'Lucas Ferreira' },
  { id: 'rev3', orderId: 'ORD-088', stars: 5, comment: 'Adorei o bowl vegano! Tudo muito fresco e bem temperado.', createdAt: daysAgo(5), customerId: 'u7', customerName: 'Pedro Alves' },
];

export const FEATURED_HERO_IMAGE = '/assets/6a6cb4394cfe8dac99d70ae300042099f5cbd856.png';
export const LOGO_IMAGE = '/assets/db23158a97674c4fe48dc9d4281a185fc5cf6a4b.png';
export const TROPICAL_BOWL_IMAGE = bowlTropical;
