process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Ignora erros de SSL locais se houver interceptação de certificado

const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const serviceAccount = require('./src/privatekey.json');

console.log('Inicializando Firebase Admin SDK...');
admin.initializeApp({
  credential: admin.cert(serviceAccount)
});

const auth = getAuth();
const db = getFirestore();

// Configura o Firestore para usar REST em vez de gRPC, permitindo que a chamada respeite o desvio de SSL
db.settings({ preferRest: true });

// ----------------------------------------------------
// DADOS DOS USUÁRIOS
// ----------------------------------------------------
const users = [
  { id: 'u1', name: 'Rafael Mendes', email: 'dono@dahorta.com', password: '123456', role: 'owner', phone: '(11) 99999-0001', avatar: 'RM' },
  { id: 'u2', name: 'Carlos Lima', email: 'func@dahorta.com', password: '123456', role: 'employee', phone: '(11) 99999-0002', avatar: 'CL' },
  { id: 'u3', name: 'Diego Santos', email: 'moto@dahorta.com', password: '123456', role: 'motoboy', phone: '(11) 99999-0003', avatar: 'DS' },
  { id: 'u4', name: 'Ana Paula', email: 'cliente@email.com', password: '123456', role: 'customer', phone: '(11) 98888-1234', avatar: 'AP' },
];

// ----------------------------------------------------
// DADOS DAS CATEGORIAS
// ----------------------------------------------------
const categories = [
  { id: 'c1', name: 'Bowls', icon: '🥗' },
  { id: 'c2', name: 'Saladas', icon: '🥬' },
  { id: 'c3', name: 'Bebidas', icon: '🥤' },
  { id: 'c4', name: 'Sobremesas', icon: '🍨' },
  { id: 'c5', name: 'Acompanhamentos', icon: '🍞' },
];

// ----------------------------------------------------
// DADOS DOS PRODUTOS
// ----------------------------------------------------
const products = [
  { id: 'p1', name: 'Bowl Proteico', internalName: 'BOWL-PROTEICO-01', description: 'Quinoa, frango grelhado organico, abacate, tomate cereja, espinafre e molho tahine.', image: '/assets/bowl_proteico.png', price: 28.9, category: 'c1', available: true, prepTime: 12, featured: true, desiredMargin: 45 },
  { id: 'p2', name: 'Bowl Vegano Power', internalName: 'BOWL-VEGANO-01', description: 'Grao-de-bico, couve massageada, cenoura ralada, beterraba, hummus e sementes de girassol.', image: '/assets/bowl_vegano.png', price: 24.9, category: 'c1', available: true, prepTime: 10, featured: true, desiredMargin: 48 },
  { id: 'p3', name: 'Bowl Mediterraneo', description: 'Arroz integral, salmao grelhado, pepino, azeitonas, tomate e molho de iogurte.', image: '/assets/bowl_mediterraneo.png', price: 32.9, category: 'c1', available: true, prepTime: 15, featured: true, desiredMargin: 42 },
  { id: 'p12', name: 'Bowl Low-Carb Frango', description: 'Arroz de couve-flor, frango grelhado premium, brocolis ao bafo, ovo cozido e sementes de gergelim.', image: '/assets/bowl_low_carb.png', price: 29.9, category: 'c1', available: true, prepTime: 12 },
  { id: 'p13', name: 'Bowl Asiatico', description: 'Macarrao de arroz, tofu defumado, edamame, cogumelos shitake e molho de soja e gengibre.', image: '/assets/bowl_oriental.png', price: 31.9, category: 'c1', available: true, prepTime: 14 },
  { id: 'p4', name: 'Salada Caesar Organica', description: 'Alface romana organica, croutons artesanais, parmesao e molho caesar caseiro.', image: 'https://i.imgur.com/BM0eoHE.jpeg', price: 22.9, category: 'c2', available: true, prepTime: 8, desiredMargin: 50 },
  { id: 'p5', name: 'Suco de Laranja Organico', description: 'Suco de laranja 100% natural e organico, sem adicao de acucar ou conservantes. 400ml.', image: 'https://i.imgur.com/D5fUFkH.jpeg', price: 12.9, category: 'c3', available: true, prepTime: 3 },
  { id: 'p6', name: 'Pink Lemonade Natural', description: 'Limao siciliano, framboesa natural e agua gaseificada. Uma explosao de sabor. 400ml.', image: 'https://i.imgur.com/qpBWUlU.jpeg', price: 15.9, category: 'c3', available: true, prepTime: 5 },
  { id: 'p14', name: 'Kombucha de Gengibre', description: 'Bebida fermentada milenar, naturalmente gaseificada e probiotica. 300ml.', image: 'https://i.imgur.com/xcjjl0M.jpeg', price: 18.9, category: 'c3', available: true, prepTime: 2 },
  { id: 'p15', name: 'Cha Mate com Limao', description: 'Mate artesanal batido com limao e gelo. Sabor carioca e natural. 400ml.', image: 'https://i.imgur.com/PLxpqrU.jpeg', price: 11.9, category: 'c3', available: true, prepTime: 4 },
  { id: 'p16', name: 'Agua Mineral Alcalina', description: 'Agua mineral alcalina de PH elevado para hidratacao maxima. 500ml.', image: 'https://i.imgur.com/J6fsFty.jpeg', price: 6.9, category: 'c3', available: true, prepTime: 1 },
  { id: 'p7', name: 'Bowl de Acai Organico', description: 'Acai puro batido com banana, coberto com granola artesanal, frutas frescas e mel.', image: 'https://i.imgur.com/UWcS8Go.jpeg', price: 26.9, category: 'c4', available: true, prepTime: 8 },
  { id: 'p8', name: 'Mousse de Cacau Raw', description: 'Mousse de cacau cru com abacate, tamaras e castanhas. Vegano e sem acucar refinado.', image: 'https://i.imgur.com/ihFpYkN.jpeg', price: 18.9, category: 'c4', available: true, prepTime: 0 },
  { id: 'p17', name: 'Chia Pudding de Coco', description: 'Sementes de chia hidratadas no leite de coco, com laminas de coco e morangos. Vegano.', image: 'https://i.imgur.com/mfV8k60.jpeg', price: 21.9, category: 'c4', available: true, prepTime: 2 },
  { id: 'p18', name: 'Cheesecake de Frutas Vermelhas', description: 'Cheesecake vegano com base de amendoas e calda caseira de frutas vermelhas.', image: 'https://i.imgur.com/A5w2xJK.jpeg', price: 24.9, category: 'c4', available: true, prepTime: 2 },
  { id: 'p19', name: 'Brownie de Batata Doce', description: 'Brownie denso e chocolatudo, adocado naturalmente, sem gluten e sem lactose.', image: 'https://i.imgur.com/RVx4FyV.jpeg', price: 16.9, category: 'c4', available: true, prepTime: 2 },
  { id: 'p20', name: 'Salada de Frutas Tropical', description: 'Mix de frutas da estacao rigorosamente selecionadas com suco de laranja.', image: 'https://i.imgur.com/hVEpQWR.jpeg', price: 14.9, category: 'c4', available: true, prepTime: 5 },
  { id: 'p9', name: 'Pao Integral Artesanal', description: 'Pao 100% integral com sementes de chia, linhaca e girassol. 2 fatias.', image: 'https://i.imgur.com/uvBI6kE.jpeg', price: 8.9, category: 'c5', available: true, prepTime: 3 },
  { id: 'p21', name: 'Batata Doce com Alecrim', description: 'Cubos de batata doce organica assados com azeite e alecrim fresco.', image: 'https://i.imgur.com/jygmHBo.jpeg', price: 12.9, category: 'c5', available: true, prepTime: 10 },
  { id: 'p22', name: 'Chips de Mandioca', description: 'Laminas crocantes de mandioca preparadas na airfryer com sal marinho.', image: 'https://i.imgur.com/c8aI4Ez.jpeg', price: 10.9, category: 'c5', available: true, prepTime: 12 },
  { id: 'p23', name: 'Mix de Vegetais Grelhados', description: 'Abobrinha, berinjela e pimentoes grelhados com ervas finas.', image: 'https://i.imgur.com/mviwuIq.jpeg', price: 15.9, category: 'c5', available: true, prepTime: 8 },
  { id: 'p10', name: 'Combo Casal Fitness', description: '2 Bowls a escolha + 2 Sucos Detox com um desconto especial.', image: '/assets/bowl_proteico.png', price: 79.9, category: 'c1', available: true, prepTime: 20, isCombo: true, comboSlots: [
      { id: 's1', name: 'Primeiro Bowl', type: 'selectable', products: ['p1', 'p2', 'p3', 'p12', 'p13'] },
      { id: 's2', name: 'Segundo Bowl', type: 'selectable', products: ['p1', 'p2', 'p3', 'p12', 'p13'] },
      { id: 's3', name: 'Bebida 1', type: 'selectable', products: ['p5', 'p6', 'p14', 'p15'] },
      { id: 's4', name: 'Bebida 2', type: 'selectable', products: ['p5', 'p6', 'p14', 'p15'] },
    ]
  }
];

// ----------------------------------------------------
// DADOS DOS INSUMOS E ESTOQUE (SINCRONIZAÇÃO 1:1)
// ----------------------------------------------------
const insumos = [
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
  { id: 'ins16', name: 'Alface Romana', unit: 'un', category: 'Hortifruti' },
  { id: 'ins17', name: 'Cenoura Organica', unit: 'un', category: 'Hortifruti' },
  { id: 'ins18', name: 'Beterraba', unit: 'un', category: 'Hortifruti' },
  { id: 'ins19', name: 'Pepino', unit: 'un', category: 'Hortifruti' },
  { id: 'ins20', name: 'Arroz Integral', unit: 'g', category: 'Graos' },
  { id: 'ins21', name: 'Hummus Tradicional', unit: 'g', category: 'Molhos' },
  { id: 'ins22', name: 'Molho Caesar Organico', unit: 'ml', category: 'Molhos' },
  { id: 'ins23', name: 'Azeite Extra Virgem', unit: 'ml', category: 'Temperos' },
  { id: 'ins24', name: 'Azeitonas Pretas', unit: 'g', category: 'Secos' },
  { id: 'ins25', name: 'Sementes de Girassol', unit: 'g', category: 'Secos' },
  { id: 'ins26', name: 'Granola Artesanal', unit: 'g', category: 'Secos' },
];

const stockDetails = {
  ins1: { currentQuantity: 5000, maxCapacity: 10000, minAlert: 1500 },
  ins2: { currentQuantity: 4500, maxCapacity: 8000, minAlert: 1000 },
  ins3: { currentQuantity: 2500, maxCapacity: 5000, minAlert: 500 },
  ins4: { currentQuantity: 100, maxCapacity: 200, minAlert: 10, yieldRule: { baseUnit: '1 abacate', yields: 120, yieldsUnit: 'g' } },
  ins5: { currentQuantity: 1200, maxCapacity: 3000, minAlert: 300 },
  ins6: { currentQuantity: 800, maxCapacity: 2000, minAlert: 200 },
  ins7: { currentQuantity: 80, maxCapacity: 150, minAlert: 20 },
  ins8: { currentQuantity: 3000, maxCapacity: 6000, minAlert: 800 },
  ins9: { currentQuantity: 2000, maxCapacity: 5000, minAlert: 500 },
  ins10: { currentQuantity: 5000, maxCapacity: 10000, minAlert: 1000 },
  ins11: { currentQuantity: 15, maxCapacity: 30, minAlert: 5 },
  ins12: { currentQuantity: 2500, maxCapacity: 5000, minAlert: 500 },
  ins13: { currentQuantity: 50, maxCapacity: 120, minAlert: 15 },
  ins14: { currentQuantity: 1500, maxCapacity: 3000, minAlert: 400 },
  ins15: { currentQuantity: 2000, maxCapacity: 5000, minAlert: 500 },
  ins16: { currentQuantity: 15, maxCapacity: 30, minAlert: 5, yieldRule: { baseUnit: '1 alface', yields: 10, yieldsUnit: 'porção' } },
  ins17: { currentQuantity: 18, maxCapacity: 40, minAlert: 8, yieldRule: { baseUnit: '1 cenoura', yields: 80, yieldsUnit: 'g' } },
  ins18: { currentQuantity: 12, maxCapacity: 30, minAlert: 6, yieldRule: { baseUnit: '1 beterraba', yields: 150, yieldsUnit: 'g' } },
  ins19: { currentQuantity: 20, maxCapacity: 40, minAlert: 8, yieldRule: { baseUnit: '1 pepino', yields: 100, yieldsUnit: 'g' } },
  ins20: { currentQuantity: 6000, maxCapacity: 15000, minAlert: 2000 },
  ins21: { currentQuantity: 1200, maxCapacity: 3000, minAlert: 300 },
  ins22: { currentQuantity: 600, maxCapacity: 1500, minAlert: 200 },
  ins23: { currentQuantity: 2500, maxCapacity: 5000, minAlert: 500 },
  ins24: { currentQuantity: 800, maxCapacity: 2000, minAlert: 200 },
  ins25: { currentQuantity: 1500, maxCapacity: 3000, minAlert: 400 },
  ins26: { currentQuantity: 2000, maxCapacity: 5000, minAlert: 500 }
};

// ----------------------------------------------------
// DADOS DOS FORNECEDORES
// ----------------------------------------------------
const suppliers = [
  { id: 'sup1', name: 'Horta Orgânica Vale Verde', cnpj: '12.345.678/0001-99', phone: '(11) 3333-4444', email: 'compras@valeverde.com.br', address: 'Estrada da Colheita, 890 - Zona Rural, Ibiúna' },
  { id: 'sup2', name: 'Distribuidora Saúde & Sabor', cnpj: '98.765.432/0001-11', phone: '(11) 2222-5555', email: 'vendas@saudesabor.com.br', address: 'Av. dos Orgânicos, 244 - Pinheiros, São Paulo' },
  { id: 'sup3', name: 'Proteínas Naturais Premium', cnpj: '55.123.456/0001-77', phone: '(11) 4444-6666', email: 'comercial@proteinaspremium.com.br', address: 'Rod. Raposo Tavares, km 28 - Cotia, SP' },
];

// ----------------------------------------------------
// HISTÓRICO DE PREÇOS
// ----------------------------------------------------
const priceRecords = [
  { id: 'pr1', insumoId: 'ins1', supplierId: 'sup2', value: 0.042, observation: 'Quinoa orgânica certificada', daysAgo: 5 },
  { id: 'pr2', insumoId: 'ins1', supplierId: 'sup2', value: 0.045, daysAgo: 35 },
  { id: 'pr3', insumoId: 'ins2', supplierId: 'sup3', value: 0.055, observation: 'Frango caipira orgânico', daysAgo: 3 },
  { id: 'pr4', insumoId: 'ins2', supplierId: 'sup3', value: 0.058, daysAgo: 33 },
  { id: 'pr5', insumoId: 'ins3', supplierId: 'sup1', value: 0.028, daysAgo: 2 },
  { id: 'pr6', insumoId: 'ins4', supplierId: 'sup1', value: 4.5, observation: 'Abacate médio', daysAgo: 4 },
  { id: 'pr7', insumoId: 'ins5', supplierId: 'sup1', value: 0.035, daysAgo: 1 },
  { id: 'pr8', insumoId: 'ins6', supplierId: 'sup2', value: 0.08, daysAgo: 10 },
  { id: 'pr9', insumoId: 'ins9', supplierId: 'sup3', value: 0.095, observation: 'Salmão do Chile', daysAgo: 1 },
];

// ----------------------------------------------------
// FICHAS TÉCNICAS
// ----------------------------------------------------
const technicalSheets = [
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

// ----------------------------------------------------
// CUPONS DE DESCONTO
// ----------------------------------------------------
const coupons = [
  { id: 'coup2', code: 'DAHORTA20', type: 'percentage', value: 20, active: true, minOrderValue: 50, expirationDays: 10, usedCount: 89, totalSalesVolume: 2670 },
  { id: 'coup3', code: 'FRETEGRATIS', type: 'shipping', value: 0, active: true, usedCount: 320, totalSalesVolume: 9600 },
  { id: 'coup4', code: 'VERAOINATIVO', type: 'inactive', value: 10, active: false, usedCount: 500, totalSalesVolume: 15000 },
];

// ----------------------------------------------------
// AVALIAÇÕES (REVIEWS)
// ----------------------------------------------------
const reviews = [
  { id: 'rev1', orderId: 'ORD-005', stars: 5, comment: 'Bowl de acai perfeito! Ingredientes fresquissimos e muito saboroso!', daysAgo: 2, customerId: 'u4', customerName: 'Ana Paula' },
  { id: 'rev2', orderId: 'ORD-099', stars: 4, comment: 'Bowl proteico muito bom, so achei que poderia vir um pouco mais de quinoa.', daysAgo: 3, customerId: 'u5', customerName: 'Lucas Ferreira' },
  { id: 'rev3', orderId: 'ORD-088', stars: 5, comment: 'Adorei o bowl vegano! Tudo muito fresco e bem temperado.', daysAgo: 5, customerId: 'u7', customerName: 'Pedro Alves' },
];

// ----------------------------------------------------
// PEDIDOS (ORDERS)
// ----------------------------------------------------
const baseAddress = { id: 'a1', label: 'Casa', street: 'Rua das Flores', number: '142', complement: 'Apto 31', neighborhood: 'Jardim Paulista', city: 'Sao Paulo', zipCode: '01310-100' };

const orders = [
  {
    id: 'ORD-001',
    customerId: 'u4',
    customerName: 'Ana Paula',
    customerPhone: '(11) 98888-1234',
    items: [
      { productId: 'p1', name: 'Bowl Proteico', quantity: 2, price: 28.9, image: '/assets/bowl_proteico.png' },
      { productId: 'p5', name: 'Smoothie Detox', quantity: 1, price: 16.9, image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&q=80' },
    ],
    status: 'preparing',
    paymentMethod: 'pix',
    deliveryAddress: baseAddress,
    subtotal: 74.7,
    deliveryFee: 6,
    total: 80.7,
    minutesAgo: 12,
    deliveryCode: '482910',
  },
  {
    id: 'ORD-002',
    customerId: 'u5',
    customerName: 'Lucas Ferreira',
    customerPhone: '(11) 97777-5678',
    items: [
      { productId: 'p2', name: 'Bowl Vegano Power', quantity: 1, price: 24.9, image: '/assets/bowl_vegano.png' },
      { productId: 'p6', name: 'Suco Verde Energizante', quantity: 1, price: 14.9, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80' },
    ],
    status: 'received',
    paymentMethod: 'credit_card',
    deliveryAddress: { ...baseAddress, id: 'a2', label: 'Trabalho', street: 'Av. Paulista', number: '1578', neighborhood: 'Bela Vista', complement: 'Sala 902' },
    subtotal: 39.8,
    deliveryFee: 6,
    total: 45.8,
    minutesAgo: 5,
    deliveryCode: '731045',
  },
  {
    id: 'ORD-003',
    customerId: 'u6',
    customerName: 'Mariana Costa',
    customerPhone: '(11) 96666-9012',
    items: [{ productId: 'p3', name: 'Bowl Mediterraneo', quantity: 1, price: 32.9, image: '/assets/bowl_mediterraneo.png' }],
    status: 'ready',
    paymentMethod: 'meal_voucher',
    deliveryAddress: { ...baseAddress, id: 'a3', street: 'Rua Augusta', number: '890', neighborhood: 'Consolacao', complement: '' },
    subtotal: 32.9,
    deliveryFee: 6,
    total: 38.9,
    minutesAgo: 28,
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
    minutesAgo: 45,
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
    minutesAgo: 90,
    deliveryCode: '504739',
    motoboyId: 'u3',
    reviewId: 'rev1',
  },
];

// ----------------------------------------------------
// ALGORITMO DE EXECUÇÃO
// ----------------------------------------------------
async function main() {
  try {
    console.log('\n--- 1. CADASTRANDO USUÁRIOS NO AUTH E FIRESTORE ---');
    for (const u of users) {
      let firebaseUser;
      
      // Sanitização do telefone para formato E.164 exigido pelo Firebase Auth (ex: +5511999990001)
      const sanitizedPhone = u.phone ? '+55' + u.phone.replace(/\D/g, '') : undefined;

      try {
        firebaseUser = await auth.createUser({
          uid: u.id,
          email: u.email,
          password: u.password,
          displayName: u.name,
          phoneNumber: sanitizedPhone
        });
        console.log(`[AUTH] Usuário criado: ${u.email} (UID: ${firebaseUser.uid})`);
      } catch (err) {
        if (err.code === 'auth/email-already-exists' || err.code === 'auth/uid-already-exists') {
          // Se já existir, busca e atualiza as credenciais
          const existing = err.code === 'auth/email-already-exists' 
            ? await auth.getUserByEmail(u.email)
            : await auth.getUser(u.id);

          firebaseUser = await auth.updateUser(existing.uid, {
            password: u.password,
            displayName: u.name,
            phoneNumber: sanitizedPhone
          });
          console.log(`[AUTH] Usuário atualizado (já existia): ${u.email} (UID: ${firebaseUser.uid})`);
        } else {
          console.error(`[AUTH] Falha ao criar/atualizar ${u.email}:`, err.message);
        }
      }

      if (firebaseUser) {
        // Grava/Mescla perfil no Firestore
        await db.collection('users').doc(firebaseUser.uid).set({
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone,
          avatar: u.avatar,
          createdAt: FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`[FIRESTORE] Perfil de usuário /users/${firebaseUser.uid} Sincronizado.`);
      }
    }

    console.log('\n--- 2. POPULANDO CATEGORIAS ---');
    for (const cat of categories) {
      await db.collection('categories').doc(cat.id).set({
        name: cat.name,
        icon: cat.icon
      });
      console.log(`[FIRESTORE] Categoria cadastrada: ${cat.name} (${cat.id})`);
    }

    console.log('\n--- 3. POPULANDO PRODUTOS DO CARDÁPIO ---');
    for (const prod of products) {
      await db.collection('products').doc(prod.id).set(prod);
      console.log(`[FIRESTORE] Produto cadastrado: ${prod.name} (${prod.id})`);
    }

    console.log('\n--- 4. POPULANDO INSUMOS E ESTOQUE (1:1) ---');
    for (const ins of insumos) {
      // Grava no Insumo
      await db.collection('insumos').doc(ins.id).set({
        name: ins.name,
        unit: ins.unit,
        category: ins.category,
        observations: ins.observations || null,
        allergens: ins.allergens || []
      });

      // Grava no Estoque correspondente usando mesmo ID
      const stock = stockDetails[ins.id] || { currentQuantity: 100, maxCapacity: 1000, minAlert: 10 };
      await db.collection('stock').doc(ins.id).set({
        name: ins.name,
        category: ins.category.toLowerCase(),
        unit: ins.unit,
        currentQuantity: stock.currentQuantity,
        maxCapacity: stock.maxCapacity,
        minAlert: stock.minAlert,
        yieldRule: stock.yieldRule || null
      });
      console.log(`[FIRESTORE] Insumo e Estoque criados para: ${ins.name} (${ins.id})`);
    }

    console.log('\n--- 5. POPULANDO FORNECEDORES ---');
    for (const sup of suppliers) {
      await db.collection('suppliers').doc(sup.id).set({
        name: sup.name,
        cnpj: sup.cnpj,
        phone: sup.phone,
        email: sup.email,
        address: sup.address
      });
      console.log(`[FIRESTORE] Fornecedor cadastrado: ${sup.name} (${sup.id})`);
    }

    console.log('\n--- 6. POPULANDO HISTÓRICO DE PREÇOS ---');
    for (const pr of priceRecords) {
      await db.collection('priceRecords').doc(pr.id).set({
        insumoId: pr.insumoId,
        supplierId: pr.supplierId,
        value: pr.value,
        date: Timestamp.fromDate(new Date(Date.now() - pr.daysAgo * 24 * 60 * 60 * 1000)),
        observation: pr.observation || null
      });
      console.log(`[FIRESTORE] Registro de preço criado para Insumo: ${pr.insumoId} (${pr.id})`);
    }

    console.log('\n--- 7. POPULANDO FICHAS TÉCNICAS ---');
    for (const ts of technicalSheets) {
      await db.collection('technicalSheets').doc(ts.id).set(ts);
      console.log(`[FIRESTORE] Ficha Técnica cadastrada para Produto: ${ts.productId} (${ts.id})`);
    }

    console.log('\n--- 8. POPULANDO CONFIGURAÇÕES ---');
    await db.collection('settings').doc('restaurant').set({ open: true });
    await db.collection('settings').doc('plateOfDay').set({
      config: {
        0: 'p1',
        1: 'p1',
        2: 'p2',
        3: 'p3',
        4: 'p1',
        5: 'p2',
        6: 'p3'
      }
    });
    console.log('[FIRESTORE] Configurações de funcionamento e prato do dia gravadas.');

    console.log('\n--- 9. POPULANDO CUPONS DE DESCONTO ---');
    for (const coup of coupons) {
      const expDate = coup.expirationDays
        ? Timestamp.fromDate(new Date(Date.now() + coup.expirationDays * 24 * 60 * 60 * 1000))
        : null;

      await db.collection('coupons').doc(coup.id).set({
        code: coup.code,
        type: coup.type,
        value: coup.value,
        active: coup.active,
        expirationDate: expDate,
        usedCount: coup.usedCount || 0,
        totalSalesVolume: coup.totalSalesVolume || 0,
        minOrderValue: coup.minOrderValue || 0
      });
      console.log(`[FIRESTORE] Cupom cadastrado: ${coup.code} (${coup.id})`);
    }

    console.log('\n--- 10. POPULANDO AVALIAÇÕES (REVIEWS) ---');
    for (const rev of reviews) {
      await db.collection('reviews').doc(rev.id).set({
        orderId: rev.orderId,
        stars: rev.stars,
        comment: rev.comment,
        createdAt: Timestamp.fromDate(new Date(Date.now() - rev.daysAgo * 24 * 60 * 60 * 1000)),
        customerId: rev.customerId,
        customerName: rev.customerName
      });
      console.log(`[FIRESTORE] Avaliação cadastrada: ${rev.id}`);
    }

    console.log('\n--- 11. POPULANDO HISTÓRICO DE PEDIDOS ---');
    for (const ord of orders) {
      await db.collection('orders').doc(ord.id).set({
        customerId: ord.customerId,
        customerName: ord.customerName,
        customerPhone: ord.customerPhone,
        items: ord.items,
        status: ord.status,
        paymentMethod: ord.paymentMethod,
        address: ord.deliveryAddress,
        subtotal: ord.subtotal,
        deliveryFee: ord.deliveryFee,
        totalAmount: ord.total,
        createdAt: Timestamp.fromDate(new Date(Date.now() - ord.minutesAgo * 60 * 1000)),
        updatedAt: Timestamp.fromDate(new Date(Date.now() - ord.minutesAgo * 60 * 1000)),
        deliveryCode: ord.deliveryCode,
        motoboyId: ord.motoboyId || null,
        addressNotes: ord.addressNotes || '',
        reviewId: ord.reviewId || null
      });
      console.log(`[FIRESTORE] Pedido cadastrado: ${ord.id}`);
    }

    console.log('\n==================================================');
    console.log('✓ BANCO DE DADOS POPULADO E USUÁRIOS CRIADOS COM SUCESSO!');
    console.log('==================================================\n');
  } catch (err) {
    console.error('X ERRO FATAL AO POPULAR O FIREBASE:', err);
  }
}

main();
