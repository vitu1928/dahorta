
<h1 align="center">
  <img src="src/public/assets/logo.png" alt="DaHorta Logo" width="80" style="vertical-align: middle;">
  <span>DaHorta — Comanda Digital</span>
</h1>

<p align="center">
  > **Transformando a gestão de Dark Kitchens de alimentação saudável através de uma experiência digital integrada, automatizada e em tempo real.**
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

Este projeto foi gerado utilizando o **Angular CLI** na versão **19.2.27**. Graças à reatividade do Firebase Firestore, as comandas fluem instantaneamente por toda a linha de produção sem a necessidade de atualizações manuais de página (*page refreshes*), garantindo comida fresca e entregas no menor tempo possível.

---

## 🚀 Funcionalidades

O sistema está dividido em 4 módulos principais, cada um projetado para atender com excelência o seu respectivo perfil de usuário:

### 1. 🛒 Painel do Cliente (E-commerce / Menu Interativo)
* **Cardápio Digital Responsivo:** Visualização fluida de pratos e bowls saudáveis, com foco em imagens atraentes e detalhes de ingredientes.
* **Carrinho Inteligente:** Adição, remoção e personalização de itens de forma totalmente intuitiva antes da finalização.
* **Acompanhamento Real-Time:** Linha do tempo interativa que exibe o status atual do pedido (`Recebido` ➔ `Em Preparo` ➔ `Saiu para Entrega` ➔ `Entregue`).

### 2. 🍳 Painel da Cozinha (Gestão de Comandas)
* **Comandas em Tempo Real:** Recebimento instantâneo de novos pedidos na tela via escuta ativa do Firebase Firestore.
* **Fila de Produção Otimizada:** Alteração do status do pedido com apenas um clique (ex: mover de *Em Preparo* para *Pronto para Entrega*).
* **Controle de Estoque:** Painel dedicado para gerenciamento preventivo e atualização de insumos, evitando a venda de pratos sem ingredientes disponíveis.

### 3. 🛵 Painel do Motoboy (Controle de Entregas)
* **Interface Mobile-First:** Visualização limpa e otimizada para telas de smartphones na rua.
* **Fila de Despacho:** Listagem centralizada de pedidos prontos aguardando coleta.
* **Fluxo de Entrega Facilitado:** Opção rápida para assumir a corrida e mudar o status para *"Saiu para Entrega"*, além do botão de confirmação que notifica imediatamente o cliente e o painel administrativo.

### 4. 📊 Dashboard do Administrador (Painel do Dono)
* **Gestão Financeira:** Métricas gerenciais de faturamento, lucros e gráficos consolidados, além do módulo para cadastro e controle de custos fixos/variáveis.
* **CRUD de Cardápio:** Gerenciamento total de pratos, permitindo criar, ler, atualizar e deletar itens, preços e composições de ingredientes.
* **Controle de Acesso Seguro (RBAC):** Proteção de rotas e separação rígida de privilégios usando perfis customizados vinculados ao *Firebase Authentication*.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as melhores práticas do ecossistema front-end moderno e infraestrutura Serverless:

* **[Angular v19.2.27](https://angular.io/):** Framework robusto para a construção da Single Page Application (SPA), garantindo componentização, tipagem estática com TypeScript e performance ideal.
* **[Firebase Firestore](https://firebase.google.com/docs/firestore):** Banco de dados NoSQL flexível e escalável que mantém os dados sincronizados entre os clientes em tempo real através de WebSockets nativos.
* **[Firebase Authentication](https://firebase.google.com/docs/auth):** Serviço seguro de gerenciamento de identidade para autenticação de usuários e controle de níveis de acesso (Admin, Cozinha, Motoboy, Cliente).
* **HTML5 & CSS3:** Estruturação semântica e estilização customizada focada em uma UI limpa, orgânica e que remete ao conceito de alimentação saudável.

---

## 📦 Como Rodar o Projeto

### Pré-requisitos
Antes de começar, certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/) (Versão LTS recomendada)
* [Angular CLI v19.2.27](https://angular.io/cli)

### Passo a Passo

**1. Clonar o Repositório:**
```bash
git clone [https://github.com/seu-usuario/dahorta-comanda-digital.git](https://github.com/seu-usuario/dahorta-comanda-digital.git)
cd dahorta-comanda-digital
```

**2. Instalar as Dependências:**
```bash
npm install
```

**3. Configurar o Firebase:**

Crie um projeto no Firebase Console e habilite os seguintes serviços:

- Firebase Authentication
- Cloud Firestore
- Firebase Hosting (opcional para deploy)

Em seguida, copie as credenciais do projeto e configure o arquivo:

```typescript
// src/environments/environment.ts

export const environment = {
  production: false,
  firebase: {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "XXXXXXXXXXX",
    appId: "X:XXXXXXXX:web:XXXXXXXXXXXX"
  }
};
```

**4. Iniciar o Servidor de Desenvolvimento:**

```bash
ng serve
```

Após a compilação, acesse:

```text
http://localhost:4200
```

O aplicativo será recarregado automaticamente sempre que alterações forem salvas.

**5. Criar Usuários e Perfis de Acesso:**

No Firebase Authentication, crie os usuários iniciais do sistema:

| Perfil | Função |
|----------|----------|
| Admin | Controle total da plataforma |
| Cozinha | Gestão de comandas e estoque |
| Motoboy | Controle das entregas |
| Cliente | Realização de pedidos |

As permissões podem ser armazenadas em uma coleção do Firestore:

```text
users/
 └── uid
      ├── nome
      ├── email
      └── role
           ├── admin
           ├── cozinha
           ├── motoboy
           └── cliente
```

---

## 🗂️ Estrutura do Projeto

```text
src/
│
├── app/
│   ├── pages/
│   │   ├── cliente/
│   │   ├── cozinha/
│   │   ├── motoboy/
│   │   └── admin/
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── pedido.service.ts
│   │   ├── estoque.service.ts
│   │   └── financeiro.service.ts
│   │
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── role.guard.ts
│   │
│   ├── models/
│   └── shared/
│
├── environments/
└── assets/
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

Todas as alterações são sincronizadas em tempo real pelo Firebase Firestore.

---

## 🔐 Segurança

O sistema utiliza:

- Firebase Authentication
- Guards de Rotas Angular
- Controle de Acesso Baseado em Papéis (RBAC)
- Regras de Segurança do Firestore
- Proteção contra acesso não autorizado aos módulos administrativos

Exemplo de regra Firestore:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /pedidos/{pedidoId} {
      allow read, write: if request.auth != null;
    }

    match /users/{userId} {
      allow read, write: if request.auth != null
      && request.auth.uid == userId;
    }
  }
}
```

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
- [ ] Cupons de desconto

---

## 🤝 Contribuição

Contribuições são sempre bem-vindas.

1. Faça um Fork do projeto
2. Crie uma Branch:

```bash
git checkout -b feature/minha-feature
```

3. Faça suas alterações:

```bash
git commit -m "feat: adiciona nova funcionalidade"
```

4. Envie para o repositório remoto:

```bash
git push origin feature/minha-feature
```

5. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT.

---

<p align="center">
Feito com ❤️ para otimizar a operação da Dark Kitchen DaHorta e entregar alimentação saudável com eficiência, velocidade e controle total.
</p>
