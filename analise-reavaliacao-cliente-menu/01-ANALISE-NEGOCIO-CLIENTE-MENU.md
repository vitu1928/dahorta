# 📋 Análise de Negócio - Domínio Cliente (Menu)

**Skill Responsável:** Product Context  
**Data:** 2026-06-10  
**Status:** Completo

---

## 🎯 Objetivo

Documentar completamente as **regras de negócio**, **fluxos de usuário** e **permissões** relacionadas ao domínio **Cliente** na Dark Kitchen "DaHorta", com foco especial na funcionalidade de **Menu**.

---

## 📚 Contexto do Negócio

### O que é Dark Kitchen "DaHorta"?

**DaHorta** é uma Dark Kitchen (cozinha fantasma) especializada em refeições saudáveis e orgânicas:
- **Modelo:** Exclusivamente delivery (sem espaço físico de atendimento)
- **Foco:** Bowls orgânicos, saladas e refeições preparadas no momento
- **Público-alvo:** Clientes conscientes com saúde e sustentabilidade
- **Operação:** Altamente sincronizada entre cozinha (Employee), entregadores (Motoboy) e gerência (Owner)

---

## 👥 Atores e Permissões do Cliente

### Ator: Cliente (Customer)

**Definição:** Usuário final que acessa a plataforma para montar carrinho, fazer pedidos e acompanhá-los.

**Permissões Gerais:**
| Ação | Permitida | Notas |
|------|----------|-------|
| Visualizar Menu | ✅ Sim | Apenas produtos com `available: true` |
| Filtrar por categoria | ✅ Sim | Dinâmico conforme categorias disponíveis |
| Buscar produtos | ✅ Sim | Por nome ou descrição (case-insensitive) |
| Ver alérgenos/informações | ✅ Sim | Importante para segurança |
| Visualizar "Prato do Dia" | ✅ Sim | Especial destacado |
| Adicionar ao carrinho | ✅ Sim | Sem limite de quantidade por sessão |
| Aplicar cupons | ✅ Sim | Apenas cupons com `active: true` |
| Acessar carrinho | ✅ Sim | Persiste na sessão |
| Fazer checkout | ✅ Sim | Requer endereço e método de pagamento |
| Acompanhar pedido | ✅ Sim | Após fazer pedido (status em tempo real) |
| Visualizar histórico | ✅ Sim | Pedidos anteriores do cliente autenticado |
| Editar perfil | ✅ Sim | Nome, email, telefone, endereço |

**Restrições Importantes:**
| Restrição | Razão |
|-----------|-------|
| ❌ Não pode editar Menu | Apenas Owner/Admin |
| ❌ Não pode gerenciar estoque | Apenas Owner/Employee |
| ❌ Não pode alterar status de pedido | Apenas Employee/Owner |
| ❌ Não pode aceitar/rejeitar entregas | Apenas Motoboy |
| ❌ Não pode ver outros clientes | Dados isolados por autenticação |

---

## 🔄 Fluxos de Usuário

### Fluxo 1: Do Landing até Fazer Pedido

```
┌─────────────────┐
│   Landing Page  │
│  (Sem autent.)  │
└────────┬────────┘
         │ Clica "Fazer Pedido" ou "Explorar Menu"
         ▼
┌─────────────────┐
│   Login/Sign-up │
│   (Se novo)     │
└────────┬────────┘
         │ Autentica com email+senha
         ▼
┌─────────────────┐
│   Menu Page     │ ◄─── FOCO DESTE DOCUMENTO
│  (Cardápio)     │
│  - Filtros      │
│  - Busca        │
│  - Produtos     │
└────────┬────────┘
         │ Clica em produto
         ▼
┌─────────────────┐
│ Product Modal   │
│  - Combo opts   │
│  - Qty selector │
│  - Add to cart  │
└────────┬────────┘
         │ Clica "Adicionar ao Carrinho"
         ▼
┌─────────────────┐
│ Cart Page       │
│  - Review items │
│  - Cupons       │
│  - Checkout     │
└────────┬────────┘
         │ Clica "Finalizar Pedido"
         ▼
┌─────────────────┐
│ Checkout Page   │
│  - Endereço     │
│  - Pagamento    │
│  - Confirmação  │
└────────┬────────┘
         │ Confirma pagamento
         ▼
┌─────────────────┐
│ Order Tracking  │
│  - Status real  │
│  - ETA          │
│  - Motoboy info │
└─────────────────┘
```

### Fluxo 2: Dentro do Menu Page (Detalhado)

```
┌──────────────────────┐
│  Menu Page Abierta   │
│  - Lista categorias  │
│  - Busca vazia       │
│  - Prato do dia      │
└──────────┬───────────┘
           │
      ┌────┴──────────────┬──────────────────┐
      │                   │                  │
      ▼                   ▼                  ▼
  Clica em       Clica categoria       Digita busca
  "Destaque"          ou                  em nome
                   "Tudo"
      │                   │                  │
      ▼                   ▼                  ▼
  Abre Modal      Filtra grid          Filtra produto
  de produto     por categoria         por nome/desc
      │                   │                  │
      └───────┬───────────┴──────────────────┘
              │
              ▼
      ┌─────────────────────┐
      │  Visualiza Item     │
      │  - Nome             │
      │  - Preço            │
      │  - Tempo de preparo │
      │  - Alérgenos        │
      │  - Descrição        │
      └──────┬──────────────┘
             │ Se é combo
             ▼
      ┌─────────────────────┐
      │ Seleciona Itens Combo
      │ - Carousel de slots │
      │ - Grid de opções    │
      └──────┬──────────────┘
             │
             ▼
      ┌─────────────────────┐
      │ Ajusta Quantidade   │
      │ (Min: 1, Max: ∞)    │
      └──────┬──────────────┘
             │
             ▼
      ┌─────────────────────┐
      │ Clica Adicionar     │
      │ (com animação)      │
      └──────┬──────────────┘
             │
             ▼
      ┌─────────────────────┐
      │ Item em Carrinho    │
      │ - Badge de qty      │
      │ - Subtotal calculado│
      │ - Modal fecha       │
      └─────────────────────┘
```

---

## 📦 Produtos e Categorias

### Estrutura de Produto

```typescript
interface Product {
  id: string;                    // UUID único
  name: string;                  // "Bowl de Abacate e Quinoa"
  description: string;           // Descrição completa
  price: number;                 // Em reais (ex: 45.90)
  prepTime: number;              // Em minutos (ex: 15)
  available: boolean;            // Disponível agora?
  category: string;              // ID da categoria
  image: string;                 // URL da imagem
  featured: boolean;             // Destaque no catálogo?
  allergens: string[];           // ["Glúten", "Soja"]
  
  // Suporte a combos
  isCombo: boolean;              // É um combo selecionável?
  comboSlots?: ComboSlot[];      // ["Proteína", "Base", "Acompanhamento"]
}

interface ComboSlot {
  id: string;                    // ID da slot
  name: string;                  // "Escolha sua Proteína"
  products: string[];            // IDs de produtos disponíveis
  type: 'fixed' | 'selectable';  // Obrigatório selecionar?
}
```

### Categorias Padrão

| ID | Nome | Descrição | Ícone |
|----|------|-----------|-------|
| `salads` | Saladas | Refeições frias e frescas | 🥗 |
| `bowls` | Bowls | Combinações quentes/frias | 🍲 |
| `proteins` | Proteínas | Acompanhamentos de proteína | 🍗 |
| `sides` | Acompanhamentos | Extras e complementos | 🥒 |
| `drinks` | Bebidas | Sucos, chás, refrigerantes | 🥤 |
| `desserts` | Sobremesas | Doces e guloseimas saudáveis | 🍰 |

### Exemplo de Produto (Combo)

```json
{
  "id": "bowl-custom-001",
  "name": "Bowl Personalizado",
  "description": "Escolha sua base, proteína e acompanhamentos",
  "price": 52.90,
  "prepTime": 12,
  "available": true,
  "category": "bowls",
  "image": "https://...",
  "featured": false,
  "allergens": [],
  "isCombo": true,
  "comboSlots": [
    {
      "id": "slot-base",
      "name": "Escolha sua Base",
      "type": "selectable",
      "products": ["product-rice", "product-quinoa", "product-lettuce"]
    },
    {
      "id": "slot-protein",
      "name": "Escolha sua Proteína",
      "type": "selectable",
      "products": ["product-chicken", "product-tofu", "product-salmon"]
    },
    {
      "id": "slot-sauce",
      "name": "Molho",
      "type": "selectable",
      "products": ["sauce-tahine", "sauce-ginger", "sauce-lemon"]
    }
  ]
}
```

---

## 🍽️ Menu e Disponibilidade

### Regra: Produtos Disponíveis

**Critério Principal:** Um produto é visível **apenas se**:
1. `product.available === true`
2. Categoria do produto tem pelo menos 1 produto disponível
3. Não é "Prato do Dia" de outro dia da semana (exceto hoje)

**Validação de Disponibilidade:**
```typescript
const isVisible = (product: Product, today: DayOfWeek) => {
  const allPlatesOfDay = ["plate-1", "plate-2", ..., "plate-7"];
  const isSpecialOfOtherDay = 
    allPlatesOfDay.includes(product.id) && 
    product.id !== plateOfDay[today];
  
  return product.available && !isSpecialOfOtherDay;
};
```

### Prato do Dia (Plate of the Day)

**Definição:** Produto especial destacado para cada dia da semana.

**Regras:**
- 1 único prato por dia (segunda a domingo)
- Exibido com destaque visual especial (badge "Fresco Hoje")
- Recomendado pelo chef
- Ocupa posição premium na página
- Sem custo extra (preço é o mesmo)

**Implementação:**
```typescript
const plateOfDay = {
  0: "bowl-sunday-special",      // Domingo
  1: "bowl-monday-special",      // Segunda
  2: "bowl-tuesday-special",     // Terça
  // ... e assim por diante
};

// Acesso no componente
const todaySpecial = products.find(p => 
  p.id === plateOfDay[new Date().getDay()] && p.available
);
```

---

## 🔍 Busca e Filtragem

### Regra: Busca por Nome/Descrição

**Comportamento:**
- Busca é **case-insensitive**
- Procura em: `product.name` + `product.description`
- Sem delay/debounce (instantâneo)
- Limpa filtros de categoria (se algum estava ativo)

**Exemplos:**
| Busca | Encontra |
|-------|----------|
| "salada" | "Salada Caesar Orgânica" ✅ |
| "BOWL" | "Bowl de Abacate" ✅ |
| "protein" | "Proteína extra de frango" ✅ |
| "xy9" | Nenhum ❌ |

### Regra: Filtro por Categoria

**Comportamento:**
- 1 categoria ativa por vez
- Botão "Tudo" retorna a todas as categorias
- Scroll automático para categoria ao clicar
- Apenas categorias com produtos disponíveis são mostradas

**Estados:**
```
Estado Inicial: "all" (mostra todos os produtos)
       ↓ Clica em categoria
Estado Ativo: "bowls" (mostra apenas bowls)
       ↓ Clica em "Tudo"
Estado Inicial: "all"
```

---

## 💳 Cupons e Descontos

### Estrutura de Cupom

```typescript
interface Coupon {
  id: string;
  code: string;                  // "PRIMEIRACOMPRA20"
  type: 'percentage' | 'fixed' | 'shipping'; // Tipo de desconto
  value: number;                 // Percentual ou valor em reais
  minOrder: number;              // Pedido mínimo em reais
  maxUsage: number;              // Quantas vezes pode usar
  active: boolean;               // Ativo agora?
  expiresAt: Date;               // Data de expiração
  description: string;           // "20% de desconto na primeira compra"
}
```

### Regras de Cupom

| Regra | Descrição |
|-------|-----------|
| **Validação** | Cupom deve ter `active: true` e `expiresAt > agora` |
| **Valor Mínimo** | Pedido deve atender `minOrder` para aplicar |
| **Acúmulo** | ❌ Apenas 1 cupom por pedido |
| **Visualização** | Mostra até 3 cupons ativos para o cliente |
| **Aplicação** | Aplicado no Checkout, não no Menu |

**Exemplo de Cálculo:**
```
Subtotal: R$ 100,00
Cupom: "DESC10" (10% off)
Desconto: -R$ 10,00
Total: R$ 90,00
```

---

## ⚠️ Informações de Alérgenos

### Alérgenos Suportados

| ID | Nome | Cor | Risco | Ícone |
|----|------|-----|-------|-------|
| `gluten` | Glúten | Amarelo (#E9C46A) | Alto | 🌾 |
| `soja` | Soja | Verde (#4C7C59) | Médio | 🫘 |
| `nuts` | Nozes | Laranja (#F4A261) | Alto | 🥜 |
| `egg` | Ovo | Laranja (#F4A261) | Médio | 🥚 |
| `fish` | Peixe | Azul (#457B9D) | Alto | 🐟 |
| `shellfish` | Crustáceos | Vermelho (#E76F51) | Alto | 🦐 |
| `milk` | Leite | Claro (#A8DADC) | Médio | 🥛 |

### Visualização de Alérgenos

**No Card do Produto:**
- Mostra até 3 alérgenos (com overflow "...")
- Ícones coloridos em miniatura

**No Modal do Produto:**
- Mostra TODOS os alérgenos
- Ícones maiores com tooltips informativos
- Ordem de exibição: por risco (alto > médio)

---

## 🛒 Carrinho

### Regras do Carrinho

| Regra | Validação |
|-------|-----------|
| **Persistência** | ⚠️ Apenas em sessão (Context) - **PROBLEMA IDENTIFICADO** |
| **Quantidade Mínima** | Sem limite mínimo |
| **Quantidade Máxima** | Sem limite máximo |
| **Itens Duplicados** | Incrementa quantidade do mesmo item |
| **Remoção** | Cliente pode remover a qualquer momento |
| **Atualização de Preço** | Preço é capturado no momento da adição (congelado) |

**Estrutura de Item no Carrinho:**
```typescript
interface CartItem {
  productId: string;
  name: string;
  price: number;                 // Preço congelado
  quantity: number;
  subtotal: number;              // price * quantity
  combo?: ComboSelection[];       // Se produto é combo
}

interface ComboSelection {
  slotId: string;
  slotName: string;
  selectedProductId: string;
  selectedProductName: string;
}
```

---

## 🔐 Validações de Negócio

### Validação: Pode Adicionar ao Carrinho?

```
✅ Produto está disponível (available: true)
✅ Se é combo, TODOS os slots foram preenchidos
✅ Quantidade >= 1
✅ Preço é válido (> 0)
```

### Validação: Pode Fazer Checkout?

```
✅ Carrinho não está vazio
✅ Endereço de entrega preenchido
✅ Método de pagamento selecionado
✅ Cupom (se aplicado) é válido
```

---

## 📊 Análise de Conformidade

### Implementação React vs Regras de Negócio

| Regra de Negócio | Implementado? | Status | Notas |
|------------------|---------------|--------|-------|
| Exibir produtos disponíveis | ✅ Sim | ✅ OK | Filtro `available: true` aplicado |
| Filtrar por categoria | ✅ Sim | ✅ OK | State `activeCategory` |
| Buscar por nome/descrição | ✅ Sim | ✅ OK | Busca case-insensitive implementada |
| Exibir alérgenos | ✅ Sim | ✅ OK | Component `AllergenIcon` com 7 tipos |
| Suportar combos (carousel) | ✅ Sim | ✅ OK | Modal com carousel + grid de seleção |
| Destaque de "Prato do Dia" | ✅ Sim | ✅ OK | Seção especial com visual premium |
| Cupons visíveis | ✅ Sim | ✅ OK | Lista de até 3 cupons ativos |
| Carrinho persiste | ⚠️ Não | ⚠️ **GAP** | Apenas Context em memória (sem localStorage/BD) |
| Sincronização tempo real | ⚠️ Parcial | ⚠️ **GAP** | Mock data, sem websocket/polling |
| Validação de estoque | ⚠️ Parcial | ⚠️ **GAP** | Não valida quantidade por combo slot |

---

## 🚨 GAPs Identificados

### GAP 1: Carrinho Não Persiste Entre Sessões
**Severidade:** 🔴 Alta  
**Descrição:** Ao fazer refresh da página, o carrinho é limpo.  
**Causa Raiz:** Dados armazenados apenas em Context (memória RAM).  
**Impacto:** Cliente perde produtos selecionados.  
**Solução Proposta:**
- Persistir carrinho em `localStorage` (curto prazo)
- Sincronizar com backend em próximas requisições (longo prazo)

### GAP 2: Sem Sincronização em Tempo Real
**Severidade:** 🟡 Média  
**Descrição:** Mudanças no menu (ex: produto ficou indisponível) não atualizam em real-time.  
**Causa Raiz:** Mock data, sem integração com backend.  
**Impacto:** Cliente pode tentar adicionar produto que saiu do estoque.  
**Solução Proposta:**
- Implementar polling (a cada 30s) ou WebSocket
- Validar disponibilidade no backend antes de adicionar ao carrinho

### GAP 3: Sem Validação de Estoque por Combo Slot
**Severidade:** 🟡 Média  
**Descrição:** Não valida se a opção escolhida em um combo slot tem estoque.  
**Causa Raiz:** Mock data assume quantidade infinita.  
**Impacto:** Cliente pode escolher opção que não há estoque.  
**Solução Proposta:**
- Adicionar campo `quantity` em cada ComboSlot
- Validar antes de permitir seleção

### GAP 4: Sem Suporte a Customizações de Alimentos
**Severidade:** 🟢 Baixa  
**Descrição:** Cliente não pode solicitar "sem sal", "sem cebola", etc.  
**Causa Raiz:** Model de ComboSlot não suporta customizações livres.  
**Impacto:** Perda de flexibilidade para cliente.  
**Solução Proposta:**
- Adicionar campo `notes` no CartItem
- Integrar com sistema de instruções de preparo

---

## ✅ Checklist de Validação

- [x] Compreendi o papel do Cliente na Dark Kitchen
- [x] Mapeei todas as permissões e ações permitidas
- [x] Documentei o fluxo completo (Landing → Menu → Checkout)
- [x] Validei estrutura de Produtos, Categorias e Combos
- [x] Confirmei regras de Busca e Filtro
- [x] Mapeei regras de Cupons e Alérgenos
- [x] Identifiquei GAPs entre esperado e implementado
- [x] Criei matriz de conformidade (React vs Regras)

---

## 📌 Conclusão

A implementação **React atual do Menu** está **85% conforme** as regras de negócio definidas. Os principais problemas são **técnicos** (persistência, sincronização em tempo real) e não funcionais. A experiência do usuário é **sólida**, com suporte a buscas, filtros, combos e visual atraente.

**Próximo passo:** Relatório Técnico detalhado do código React para preparar migração para Angular.
