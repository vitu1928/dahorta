
<h1 align="center">
  <img src="src/angular/public/assets/logo.png" alt="DaHorta Logo" width="80" style="vertical-align: middle;">
  <span>DaHorta — Comanda Digital</span>
</h1>

<p align="center">
 <em><strong>Transformando a gestão de Dark Kitchens de alimentação saudável através de uma experiência digital integrada, automatizada e em tempo real.</strong></em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular">
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License">
</p>

---

## 📖 Sobre o Projeto

O **DaHorta - Comanda Digital** é um ecossistema focado na eficiência operacional de uma *Dark Kitchen* especializada em bowls e pratos saudáveis. O sistema resolve o gargalo de comunicação e sincronia unindo quatro pontas cruciais do modelo de negócios em uma única plataforma reativa: o **Cliente**, a **Cozinha**, a **Logística de Entrega (Motoboy)** e a **Administração Estratégica**. 

O frontend foi gerado com **Angular CLI 19.2.27** e usa uma API Spring Boot com MySQL para autenticação, catálogo, pedidos, avaliações e operações administrativas.

---

## 🚀 Funcionalidades

O sistema está dividido em 4 módulos principais, cada um projetado para atender com excelência o seu respectivo perfil de usuário:

### 1. 🛒 Painel do Cliente (E-commerce / Menu Interativo)
* **Cardápio Digital Responsivo:** Visualização fluida de pratos e bowls saudáveis, com foco em imagens atraentes e detalhes de ingredientes.
* **Carrinho Inteligente:** Adição, remoção e personalização de itens de forma totalmente intuitiva antes da finalização.
* **Acompanhamento de pedidos:** Linha do tempo de status (`Recebido` ➔ `Em Preparo` ➔ `Saiu para Entrega` ➔ `Entregue`), carregada pela API local.

### 2. 🍳 Painel da Cozinha (Gestão de Comandas)
* **Comandas:** Pedidos e mudanças de status são persistidos pela API local; o frontend atualiza a fila periodicamente e acompanha pedidos do cliente por SSE autenticado.
* **Fila de Produção Otimizada:** Alteração do status do pedido com apenas um clique (ex: mover de *Em Preparo* para *Pronto para Entrega*).
* **Controle de Estoque:** Painel dedicado para gerenciamento preventivo e atualização de insumos, evitando a venda de pratos sem ingredientes disponíveis.

### 3. 🛵 Painel do Motoboy (Controle de Entregas)
* **Interface Mobile-First:** Visualização limpa e otimizada para telas de smartphones na rua.
* **Fila de Despacho:** Listagem centralizada de pedidos prontos aguardando coleta.
* **Fluxo de Entrega Facilitado:** Opção rápida para assumir a corrida e mudar o status para *"Saiu para Entrega"*, além do botão de confirmação que notifica imediatamente o cliente e o painel administrativo.

### 4. 📊 Dashboard do Administrador (Painel do Dono)
* **Gestão operacional:** Estoque, fornecedores, histórico de preços, compras, despesas, fichas técnicas, cupons e equipe usam a API local.
* **Cardápio:** Catálogo público, categorias, prato do dia e informações adicionais do restaurante são lidos e gravados pela API local.
* **Controle de acesso (RBAC):** A API local autentica com JWT e controla os perfis ADMIN, COZINHA, MOTOBOY e CLIENTE.

---

## 🛠️ Tecnologias Utilizadas

Tecnologias atuais:

* **[Angular v19.2.27](https://angular.io/):** Framework robusto para a construção da Single Page Application (SPA), garantindo componentização, tipagem estática com TypeScript e performance ideal.
* **Java 17, Spring Boot 3 e Spring Data JPA:** API REST local com autenticação JWT e regras de pedidos/estoque.
* **MySQL 8:** Persistência relacional para catálogo, pedidos, avaliações, estoque, compras e despesas.
* **HTML5 & CSS3:** Estruturação semântica e estilização customizada focada em uma UI limpa, orgânica e que remete ao conceito de alimentação saudável.

---

## 🧩 Backend Java

No Codespace, o devcontainer Ubuntu 24.04 executa o frontend e a API; Docker-in-Docker
executa o container MySQL. O fluxo local é `navegador → Angular (4200) → API Spring
Boot (8080) → MySQL (3306)`. O Angular encaminha `/api` à API pelo proxy de
desenvolvimento e envia o JWT nas chamadas autenticadas. O estado atual da migração,
os dados demonstrativos e as rotas estão em [`src/backend/README.md`](src/backend/README.md).

---

## 📦 Como Rodar o Projeto

### Executar no Codespace

O devcontainer instala Node.js 22, Java 17, Maven e Docker-in-Docker.
O arquivo `.env.codespace` é local e ignorado pelo Git; configure nele apenas
as credenciais usadas pelo backend. Não copie credenciais backend para o código
Angular.

**1. Iniciar MySQL e API** (terminal em `src/backend`):

```bash
docker compose --env-file ../../.env.codespace up -d
set -a
. ../../.env.codespace
set +a
mvn spring-boot:run
```

O backend cria o administrador com `OWNER_EMAIL`/`OWNER_PASSWORD` (ou
`ADMIN_EMAIL`/`ADMIN_PASSWORD`) e a equipe com os pares `EMPLOYEE_*` e
`MOTOBOY_*`. Clientes podem se cadastrar pela aplicação.

**Atalho para iniciar tudo:** na raiz do repositório, execute:

```bash
npm start
```

O comando instala as dependências Angular caso necessário, inicia o MySQL,
aguarda a API Spring Boot, aplica o seed demonstrativo idempotente e inicia o
Angular. Ao ficar pronto, imprime os links de acesso do frontend e da API.
Use `Ctrl+C` para parar API e Angular; o MySQL permanece em execução e conserva
os dados. O Codespace precisa ter Java 17, Maven, Node.js, npm e Docker Compose,
e o arquivo local `.env.codespace` precisa estar configurado.

**2. Iniciar Angular manualmente** (outro terminal):

```bash
cd src/angular
npm install --legacy-peer-deps --no-package-lock
npm start
```

Acesse `http://localhost:4200`. O MySQL fica na porta `3306`, a API na `8080`;
o devcontainer encaminha essas portas, além da `4200`.

Os providers Firebase antigos ainda existem como código legado, mas não são
inicializados pela aplicação. APIs pendentes e limitações conhecidas estão
documentadas em [`src/backend/README.md`](src/backend/README.md).

---

## 🗂️ Estrutura do Projeto

```text
src/
├── angular/       # Angular SPA, módulos de cliente, equipe e administração
└── backend/       # API Spring Boot, entidades, serviços, testes e SQL demonstrativo
.devcontainer/     # Ubuntu 24.04 + Node/Java + Docker-in-Docker para Codespaces
```

---

## 🔥 Modelo de Fluxo dos Pedidos

```text
Cliente
   │
   ▼
Pedido Recebido
   │
   ▼
Em Preparo (Cozinha)
   │
   ▼
Pronto para Entrega
   │
   ▼
Saiu para Entrega (Motoboy)
   │
   ▼
Entregue
```

Pedidos/status são persistidos na API local. O cliente acompanha individualmente
seu pedido por SSE autenticado; as telas gerais de operação ainda usam polling.

---

## 🔐 Segurança

Os endpoints locais usam JWT e verificações de perfil no backend; o frontend
anexa o token às chamadas autenticadas à API. As contas e dados legados do
Firebase não são importados automaticamente.

As regras completas não são divulgadas neste repositório por motivos de segurança operacional.

---

## 🚀 Deploy

### Build de Produção

```bash
ng build --configuration production
```

Os arquivos serão gerados na pasta:

```text
dist/
```

### Deploy no Firebase Hosting

Instale o Firebase CLI:

```bash
npm install -g firebase-tools
```

Faça login:

```bash
firebase login
```

Inicialize o Hosting:

```bash
firebase init hosting
```

Realize o deploy:

```bash
firebase deploy
```

---

## 📈 Roadmap

### Versão 1.0
- [x] Cadastro e autenticação
- [x] Cardápio digital
- [x] Gestão de comandas
- [x] Painel do motoboy
- [x] Dashboard administrativo

### Versão 1.1
- [ ] Integração com WhatsApp
- [ ] Notificações Push
- [ ] Relatórios avançados
- [ ] Desenvolvimento de testes unitários, integrados e e2e

---

## 🤝 Contribuidores

Este Projeto foi desenvolvido com a colaboração de:

- **Anna Clara Gomes de Souza**
- **Victor Garcia Torrens**

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT.

---

<p align="center">
Feito com ❤️ para otimizar a operação da Dark Kitchen DaHorta e entregar alimentação saudável com eficiência, velocidade e controle total.
</p>
