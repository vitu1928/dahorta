
<h1 align="center">
  <img src="./src/angular/public/assets/logo.png" alt="DaHorta Logo" width="80" color="transparent" style="vertical-align: middle;">
  <span>DaHorta — Comanda Digital</span>
</h1>

> **Transformando a gestão de Dark Kitchens de alimentação saudável através de uma experiência digital integrada, automatizada e em tempo real.**

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

Este projeto foi gerado utilizando o **Angular CLI** na versão **19.2.27**. Graças à reatividade do Firebase Firestore, as comandas fluem instantaneamente por toda a linha de produção sem a necessidade de atualizações manuais de página (*page refreshes*), garantindo comida fresca e entregas no menor tempo possível[cite: 1].

---

## 🚀 Funcionalidades

O sistema está dividido em 4 módulos principais, cada um projetado para atender com excelência o seu respectivo perfil de usuário[cite: 1]:

### 1. 🛒 Painel do Cliente (E-commerce / Menu Interativo)
* **Cardápio Digital Responsivo:** Visualização fluida de pratos e bowls saudáveis, com foco em imagens atraentes e detalhes de ingredientes[cite: 1].
* **Carrinho Inteligente:** Adição, remoção e personalização de itens de forma totalmente intuitiva antes da finalização[cite: 1].
* **Acompanhamento Real-Time:** Linha do tempo interativa que exibe o status atual do pedido (`Recebido` ➔ `Em Preparo` ➔ `Saiu para Entrega` ➔ `Entregue`)[cite: 1].

### 2. 🍳 Painel da Cozinha (Gestão de Comandas)
* **Comandas em Tempo Real:** Recebimento instantâneo de novos pedidos na tela via escuta ativa do Firebase Firestore[cite: 1].
* **Fila de Produção Otimizada:** Alteração do status do pedido com apenas um clique (ex: mover de *Em Preparo* para *Pronto para Entrega*)[cite: 1].
* **Controle de Estoque:** Painel dedicado para gerenciamento preventivo e atualização de insumos, evitando a venda de pratos sem ingredientes disponíveis[cite: 1].

### 3. 🛵 Painel do Motoboy (Controle de Entregas)
* **Interface Mobile-First:** Visualização limpa e otimizada para telas de smartphones na rua[cite: 1].
* **Fila de Despacho:** Listagem centralizada de pedidos prontos aguardando coleta[cite: 1].
* **Fluxo de Entrega Facilitado:** Opção rápida para assumir a corrida e mudar o status para *"Saiu para Entrega"*, além do botão de confirmação que notifica imediatamente o cliente e o painel administrativo[cite: 1].

### 4. 📊 Dashboard do Administrador (Painel do Dono)
* **Gestão Financeira:** Métricas gerenciais de faturamento, lucros e gráficos consolidados, além do módulo para cadastro e controle de custos fixos/variáveis[cite: 1].
* **CRUD de Cardápio:** Gerenciamento total de pratos, permitindo criar, ler, atualizar e deletar itens, preços e composições de ingredientes[cite: 1].
* **Controle de Acesso Seguro (RBAC):** Proteção de rotas e separação rígida de privilégios usando perfis customizados vinculados ao *Firebase Authentication*[cite: 1].

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as melhores práticas do ecossistema front-end moderno e infraestrutura Serverless:

* **[Angular v19.2.27](https://angular.io/):** Framework robusto para a construção da Single Page Application (SPA), garantindo componentização, tipagem estática com TypeScript e performance ideal[cite: 1].
* **[Firebase Firestore](https://firebase.google.com/docs/firestore):** Banco de dados NoSQL flexível e escalável que mantém os dados sincronizados entre os clientes em tempo real através de WebSockets nativos[cite: 1].
* **[Firebase Authentication](https://firebase.google.com/docs/auth):** Serviço seguro de gerenciamento de identidade para autenticação de usuários e controle de níveis de acesso (Admin, Cozinha, Motoboy, Cliente)[cite: 1].
* **HTML5 & CSS3:** Estruturação semântica e estilização customizada focada em uma UI limpa, orgânica e que remete ao conceito de alimentação saudável[cite: 1].

---

## 📦 Como Rodar o Projeto

### Pré-requisitos
Antes de começar, certifique-se de ter instalado em sua máquina[cite: 1]:
* [Node.js](https://nodejs.org/) (Versão LTS recomendada)[cite: 1]
* [Angular CLI v19.2.27](https://angular.io/cli)[cite: 1]

### Passo a Passo

**1. Clonar o Repositório:**
```bash
git clone [https://github.com/seu-usuario/dahorta-comanda-digital.git](https://github.com/seu-usuario/dahorta-comanda-digital.git)
cd dahorta-comanda-digital
