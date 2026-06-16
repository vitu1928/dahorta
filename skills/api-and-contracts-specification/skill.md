# Skill: API & Contracts Specification

## Propósito
Esta skill define as diretrizes para desenvolvimento baseado em contratos de dados (Spec-Driven Design) no projeto DaHorta. O objetivo é assegurar o desacoplamento entre a camada visual (Componentes) e a camada de persistência de dados (Serviços e APIs), preparando o ecossistema para a transição transparente entre dados de simulação (Mock) e serviços de nuvem (Firebase).

## Responsabilidades
- Estabelecer a especificação de interfaces de dados de forma independente da origem física da informação.
- Padronizar a assinatura e comportamento de serviços de dados através de classes abstratas.
- Definir regras para alinhamento entre dados simulados (mock) e esquemas de produção.

## Escopo
- Modelagem de dados de negócio do domínio cliente, admin e motoboy.
- Definição de contratos de injeção de dependência.
- Alinhamento de schemas de mock com schemas do Firebase.

## O que está fora do escopo
- Implementação física de bancos de dados Firestore ou Realtime Database.
- Configuração de regras de segurança ou autenticação no painel do Firebase.

## Diretrizes de Spec-Driven Design

### 1. Definição de Interfaces de Domínio
Qualquer nova entidade ou modelo de dados deve ser tipada estritamente em arquivos `.model.ts` e exportada de forma agnóstica a bancos de dados.
Exemplo:
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'owner' | 'employee' | 'motoboy';
  phone: string;
  avatar?: string;
}
```

### 2. Classes Abstratas como Contrato
Antes de qualquer tela ou funcionalidade ser implementada, deve-se criar uma classe abstrata de serviço que define:
1. Sinais públicos (ex: `abstract readonly currentUser: WritableSignal<User | null>`).
2. Assinatura e parâmetros dos métodos de alteração (ex: `abstract login(...)`).

Essa classe servirá tanto de tipo estático quanto de token de Injeção de Dependência no Angular.

### 3. Alinhamento de Mocks com Schemas do Firebase
Ao criar arquivos `mock-data.ts` ou arquivos de dados simulados:
- As propriedades devem espelhar as exatas chaves e tipos de campo que serão persistidos nos documentos do Firestore (ex: uso de datas estruturadas, IDs únicos consistentes, campos opcionais demarcados).
- Os mocks devem herdar/estender a classe abstrata contrato correspondente e simular delays de rede reais para prever comportamento assíncrono.
