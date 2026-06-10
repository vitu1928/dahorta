# Prompt: Reavaliação e Refatoração do Domínio Cliente (Menu) - React para Angular

## 🎯 Objetivo Geral
Realizar uma reanálise completa e refatoração do domínio **Cliente (Customer)**, especificamente a funcionalidade de **Menu**, que foi desenvolvida previamente com uma versão desatualizada do React. Agora que a base React foi atualizada, é necessário reavaliar, atualizar e preparar um plano de migração robusta para o Angular, assegurando que todas as regras de negócio, fluxos de usuário e padrões modernos sejam preservados e otimizados.

---

## 📋 Contexto

### Estado Atual
- ✅ Existe um domínio React "customer" com funcionalidade de Menu implementada
- ⚠️ Código foi desenvolvido com versão antiga do React
- ✅ React agora foi atualizado para versão mais recente
- ❌ Não há análise formal sobre a qualidade, padrões modernos e pronto para Angular
- ❌ Não há plano claro de migração para Angular

### O que Precisa Ser Feito
Você deve realizar uma **reavaliação 360° completa** do código do Menu do Cliente, utilizando rigorosamente as 4 skills corporativas para:
1. Compreender o contexto de negócio
2. Mapear a arquitetura atual e suas deficiências
3. Definir o plano de refatoração/migração
4. Gerar um roadmap pronto para execução

---

## 🔧 Skills Obrigatórios a Utilizar

### 1️⃣ **Product Context** (Negócio)
**Use para:**
- Entender qual é o papel do **Cliente** na Dark Kitchen
- Mapear as permissões do Cliente: O que ele pode e não pode fazer no Menu?
- Descrever o fluxo de um Cliente desde a **Landing Page** até a escolha de itens no **Menu**
- Listar as regras de negócio que afetam o Menu:
  - Quais produtos estão disponíveis?
  - Como funciona a filtragem/busca de produtos?
  - Quais restrições existem (ex: horários, quantidade mínima)?
  - Como são exibidas informações nutricionais/alérgenos?
- Validar se a implementação React atual respeita 100% as regras

**Entregáveis:**
- [ ] Documento de "Regras de Negócio do Menu do Cliente"
- [ ] Mapeamento de permissões e fluxos
- [ ] Identificação de gaps entre o esperado e o implementado

---

### 2️⃣ **Development Process** (Metodologia)
**Use para:**
- Estruturar a **análise pré-migração** do código React existente
- Decompor os componentes e funcionalidades do Menu em unidades menores
- Mapear as dependências (componentes UI, serviços, contextos, estilos)
- Criar um **Plano de Implementação** formal com prioridades
- Estabelecer checklist de validação (QA e PR)

**Entregáveis:**
- [ ] Análise Estruturada do Código React (componentes, props, estados, side-effects)
- [ ] Matriz de Rastreabilidade: Qual componente React → Qual entidade Angular
- [ ] Plano de Migração Incremental (fases, dependências, ordem recomendada)
- [ ] Checklist de Commits Semânticos (em português, prefixos convencionais)

---

### 3️⃣ **Angular Architecture** (Padrões Alvo)
**Use para:**
- Desenhar como o Menu deve ser estruturado **no novo mundo Angular**
- Definir os componentes Angular necessários (Smart/Dumb)
- Mapear a estrutura de pastas conforme a convenção: `domains/customer/feature-menu/`, `domains/customer/ui/`, `domains/customer/data-access/`
- Especificar o uso de **Signals**, **Computed** e **Effects** para o estado
- Detalhar o roteamento (lazy-loading, routing do Menu)

**Entregáveis:**
- [ ] Arquitetura Angular proposta em diagrama (ou texto estruturado)
- [ ] Lista de componentes Angular a criar (por tipo: Smart, Dumb, Rotas)
- [ ] Estrutura de pastas exata
- [ ] Convenções de nomenclatura e tipagem aplicadas

---

### 4️⃣ **React to Angular Migration** (Tradução Técnica)
**Use para:**
- **Linha por linha:** Mapear cada hook React (`useState`, `useEffect`, `useContext`) para seus equivalentes Angular (Signals, Effects, Services)
- Traduzir Context API para Angular Services
- Converter JSX/TSX para templates HTML Angular com Control Flow moderno (`@if`, `@for`)
- Mapear React Router para Angular Router
- Garantir que o CSS/Tailwind seja portado corretamente

**Entregáveis:**
- [ ] Matriz de Conversão: React Hooks → Angular Signals
- [ ] Matriz de Conversão: Context API React → Angular Services
- [ ] Matriz de Conversão: JSX → HTML Templates
- [ ] Matriz de Conversão: React Router → Angular Router
- [ ] Exemplos práticos de componentes convertidos (no mínimo 3)

---

## 📊 Estrutura de Análise Esperada

### Fase 1: Descoberta (Product Context + Development Process)
```
├─ Compreender o domínio Cliente no contexto de negócio
├─ Mapear fluxos de navegação: Landing → Menu → Carrinho → Checkout
├─ Listar todos os produtos, filtros, buscas disponíveis
├─ Documentar regras: horários, descontos, cupons, restrições alérgenos
├─ Validar se a implementação React atual cumpre 100% as regras
└─ Identificar bugs, inconsistências ou features faltando
```

### Fase 2: Análise Técnica do Código React (Development Process + React to Angular Migration)
```
├─ Listar todos os componentes React em `src/react/app/pages/customer/` e sub-pastas
├─ Para cada componente, documentar:
│  ├─ Props recebidas
│  ├─ Estados locais (useState)
│  ├─ Efeitos (useEffect, useMemo, useCallback)
│  ├─ Contextos consumidos
│  ├─ Chamadas a serviços/APIs
│  ├─ Estilos (Tailwind classes)
│  └─ Dependências externas
├─ Mapear a árvore de componentes (hierarquia)
├─ Identificar componentes reutilizáveis vs. específicos do Menu
└─ Detectar anti-patterns ou oportunidades de refatoração
```

### Fase 3: Design da Arquitetura Angular (Angular Architecture)
```
├─ Propor estrutura de pastas no domínio `customer`
├─ Desenhar os componentes Smart/Dumb necessários
├─ Especificar os Signals e Computed para gerenciar estado
├─ Mapear os Services de data-access
├─ Definir o roteamento (lazy-loading, parâmetros)
└─ Validar conformidade com as convenções Angular
```

### Fase 4: Plano de Migração (Development Process)
```
├─ Decompor o Menu em fases (ex: UI Base → Funcionalidade → Integração)
├─ Definir prioridade das dependências
├─ Criar checklist de validação (QA) por fase
├─ Especificar commits semânticos esperados
├─ Estimar esforço por componente
└─ Identificar riscos e planos de mitigação
```

---

## 📝 Entregáveis Finais Esperados

### 1. **Documento de Análise de Negócio** (Product Context)
   - Tabela com: Cliente → Permissões → Ações no Menu → Regras
   - Fluxo de usuário completo (passo a passo)
   - Validação: Implementação React cumpre as regras?
   - GAPs identificados

### 2. **Relatório Técnico do Código React** (Development Process + React to Angular Migration)
   - Lista de componentes encontrados
   - Para cada componente: dependências, complexidade, anti-patterns
   - Matriz de Rastreabilidade (React → Angular)
   - Análise de hooks e como serão mapeados
   - Identificação de código legado ou desatualizado

### 3. **Especificação da Arquitetura Angular** (Angular Architecture)
   - Diagrama (textual ou visual) da estrutura
   - Lista de componentes a criar (com nomes exatos, conforme convenções)
   - Estrutura de pastas
   - Mapeamento de Signals e Services
   - Convenções de nomenclatura aplicadas

### 4. **Plano de Migração Executável** (Development Process)
   - Fases de migração (ex: Fase 1 - UI Base, Fase 2 - Listagem de Produtos, etc.)
   - Checklist de QA por fase
   - Commits semânticos esperados (em português)
   - Dependências entre fases
   - Estimativa de esforço

### 5. **Matriz de Conversão Técnica** (React to Angular Migration)
   - `useState` → `signal()` (exemplos específicos do Menu)
   - `useEffect` → `effect()` / `ngOnInit()` (exemplos)
   - Context API → Angular Services (exemplos)
   - React Router → Angular Router (exemplos)
   - JSX → Templates HTML (exemplos)
   - Mínimo 3 componentes convertidos como exemplo prático

### 6. **Checklist de Pronto para Angular**
   - [ ] Todas as regras de negócio foram validadas e documentadas?
   - [ ] Todos os componentes React foram mapeados?
   - [ ] A arquitetura Angular foi aprovada (sem conflitos)?
   - [ ] O plano de migração está claro e sequencial?
   - [ ] As matrizes de conversão cobrem 100% dos padrões usados?
   - [ ] Não há gaps ou lacunas no conhecimento?

---

## 🎬 Como Executar Este Prompt

### Passo 1: Leia Todas as Skills
Inicie consultando os 4 documentos de skill. Eles são sua fonte de verdade.

### Passo 2: Explore o Código React do Cliente
Navegue por `src/react/app/pages/customer/` e mapeie todos os componentes, hooks e lógica.

### Passo 3: Valide Contra o Contexto de Negócio
Compare o código com as regras de negócio definidas em Product Context. Há divergências?

### Passo 4: Estruture a Análise
Siga as 4 fases descritas acima na seção "Estrutura de Análise Esperada".

### Passo 5: Gere os Entregáveis
Compile todos os documentos, matrizes e planos em formato claro e acionável.

### Passo 6: Validação Final
Applique o Checklist de Pronto para Angular acima.

---

## 📌 Notas Importantes

- **Rigor:** Este é um exercício de análise completa, não é uma migração. O objetivo é ter 100% de clareza antes de começar a codificar.
- **Documentação:** Todos os entregáveis devem ser bem documentados, com exemplos de código real do projeto.
- **Sem Omissões:** Nenhum componente React ou regra de negócio pode ser ignorado. Se algo não é claro, levante como gap.
- **Idioma:** Documentação em Português; commits semânticos em Português.
- **Referências Cruzadas:** Sempre citar qual skill respalda cada decisão técnica.

---

## 🚀 Resultado Esperado

Ao final desta análise, você deve ter:
✅ Compreensão 360° do domínio Cliente/Menu  
✅ Mapeamento exato de código React para equivalentes Angular  
✅ Plano claro de migração, pronto para ser executado por um desenvolvedor  
✅ Zero gaps ou ambiguidades  
✅ Conformidade garantida com regras de negócio e padrões corporativos  

