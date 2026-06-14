# Lista de Afazeres (To-Do List) — DaHorta

Este arquivo serve como repositório centralizado para planejar tarefas futuras, registrar pendências técnicas e acompanhar a evolução do projeto até sua conclusão final.

---

## 📌 Lista de Tarefas Futuras (Pós-Migração)
*Espaço para adicionar novos pedidos e refinamentos que serão realizados ao final do projeto.*

- [ ] **Integração Real com Firebase / Backend**: Substituir todas as implementações mock pelas conexões reais.
  - [x] *Autenticação Real*: Conectar o `AuthService` ao Firebase Auth.
  - [x] *Firestore Realtime Observers*: Substituir a simulação de subscrição de status do pedido por listeners reais do Firestore (`onSnapshot`).
  - [x] *CRUD de Endereços Salvos por Usuário*: Persistir a lista de endereços do cliente na subcoleção `addresses` do documento do usuário no Firestore (`users/{userId}/addresses`).
  - [x] *Rastreamento de Motoboy no Firestore*: Escutar atualizações do campo `deliveryLocation` na coleção de pedidos (`orders/{orderId}`) e projetar rota no mapa.
  - [ ] *Notificações FCM*: Configurar Cloud Messaging para notificações Push ao alterar status do pedido.
  - [x] *Sincronização de Estoque e Ficha Técnica*: Criar triggers/functions que deduzem ingredientes do estoque do Firestore quando um pedido é concluído e desativam o produto caso falte insumos.

- [ ] **Módulo de Endereços no Perfil (CRUD)**:
  - [ ] Criar interface visual (modal ou seção) no `ProfileComponent` para gerenciar e editar os endereços utilizando o `AddressService`.

- [ ] **Gestão e Desativação de Produtos**:
  - [ ] Criar interface no Painel do Funcionário/Dono para listar produtos e alternar sua disponibilidade (desativar produto), refletindo instantaneamente no cardápio do cliente.

- [ ] **Migração do Painel de Motoboy**: Migrar do React para o Angular as telas de entregas e mapa de motoboys.
- [ ] **Migração do Painel Administrativo (Owner)**: Migrar do React para o Angular a gestão de vendas e cardápios.
- [ ] **Mapear Animações e implementar elas**: Definir e catalogar todas as animações (transições de página, micro-interações, loading states, hover effects) e implementá-las em cada componente.
- `[ ]` *Adicione novos itens aqui conforme as necessidades surgirem...*


---

## 💡 Como Funciona a Comunicação entre Domínios no DaHorta Angular?

Para permitir que a integração de infraestrutura (como o Firebase ou uma API REST) seja trocada de forma transparente no futuro sem quebrar as telas de interface (UI), o projeto segue um padrão arquitetural baseado em **Inversão de Dependência (Dependency Inversion)** e **Separação de Preocupações (Separation of Concerns)**.

### 1. O Contrato (A Abstração)
Cada domínio de dados possui uma **classe abstrata** que atua como um contrato público. Esta classe não contém código lógico nem chamadas HTTP, apenas a assinatura das propriedades reativas (Signals) e dos métodos necessários.
*Exemplo em `domains/auth/data-access/auth.service.ts`:*
```typescript
export abstract class AuthService {
  abstract readonly currentUser: WritableSignal<User | null>;
  abstract login(email: string, password: string): { success: boolean };
}
```

### 2. A Implementação Simulada (O Mock)
Criamos uma classe concreta que herda da classe abstrata e simula o comportamento dos dados com delay e dados locais, mantendo o estado reativo correto usando Signals.
*Exemplo em `domains/auth/data-access/mock-auth.service.ts`:*
```typescript
export class MockAuthService extends AuthService {
  override readonly currentUser = signal<User | null>(null);
  override login(email: string, password: string) {
    // Lógica simulada com dados mockados...
  }
}
```

### 3. O Consumo Consistente (A UI)
Os componentes standalone (como o `LoginComponent` ou o `EmployeeDashboardComponent`) nunca importam ou dependem da classe concreta `Mock...Service`. Eles injetam apenas a **classe abstrata** (que o Angular trata como um Token de Injeção):
```typescript
private authService = inject(AuthService); // Injeta o token abstrato
```
Desse modo, a interface do componente se comunica puramente através de contratos predefinidos.

### 4. A Troca do Acoplamento (DI no `app.config.ts`)
A associação dinâmica entre a classe abstrata e a implementação real é feita em um único ponto central:
```typescript
// No app.config.ts
providers: [
  { provide: AuthService, useClass: MockAuthService }
]
```
Quando o Firebase estiver finalizado, criaremos uma classe concreta `FirebaseAuthService` herdando de `AuthService` e faremos apenas uma alteração:
```typescript
// No app.config.ts
providers: [
  { provide: AuthService, useClass: FirebaseAuthService } // Trocado em 1 segundo!
]
```
**Nenhum componente ou template do projeto precisará ser alterado**, pois todos continuam programando contra a interface comum `AuthService`.
