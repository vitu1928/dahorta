# Skill: Angular Architecture

## Propósito
Esta skill define a arquitetura oficial, as convenções e os padrões que guiarão a aplicação Angular destino. Seu objetivo é garantir uma fundação robusta, moderna e escalável, utilizando as melhores práticas do framework na sua versão mais atual.

## Responsabilidades
- Definir a estrutura de pastas e organização por domínio/features.
- Padronizar o uso de Standalone Components.
- Estabelecer diretrizes rígidas para gerenciamento de estado e reatividade (Signals).
- Fornecer um guia confiável sobre roteamento, injeção de dependência e serviços no ecossistema Angular.

## Escopo
- Padrões arquiteturais para componentes, serviços, diretivas e pipes.
- Estratégias de reatividade (Signals, `computed`, `effect` e interoperação com RxJS).
- Organização baseada em Domínio (Domain-Driven Folder Structure).
- Estratégias de roteamento (Lazy Loading).
- Convenções de nomenclatura e tipagem estrita com TypeScript.

## O que está fora do escopo
- Detalhes específicos de regras de negócio (devem consultar a Skill de Product Context).
- Detalhes de como mapear hooks do React (devem consultar a Skill de React to Angular Migration).
- Deploy, infraestrutura de nuvem ou CI/CD.

## Conhecimento Obrigatório
- **Standalone Components:** A arquitetura alvo NÃO utilizará NgModules. Tudo será Standalone.
- **Signals:** A gestão de reatividade local e de estado da aplicação deve priorizar Signals em detrimento de abordagens baseadas em BehaviorSubjects puros (quando possível).
- **RxJS:** Usado estritamente para lidar com chamadas assíncronas complexas, requisições HTTP (`HttpClient`) e eventos baseados no tempo, interoperando com Signals através de `toSignal`/`toObservable`.
- **Dependency Injection (DI):** Entendimento profundo de provedores em níveis de root, route e component.

## Convenções
- **Nomenclatura de Arquivos:** `kebab-case` para nomes de arquivos (`order-list.component.ts`).
- **Nomenclatura de Classes:** `PascalCase` para componentes e serviços (`OrderListComponent`, `OrderService`).
- **Sufixos:** Obrigatório o uso de sufixos de tipo: `.component.ts`, `.service.ts`, `.model.ts`, `.route.ts`.
- **Imports:** Utilizar Path Aliases no `tsconfig.json` (ex: `@domain/orders`, `@shared/ui`).

## Decisões Arquiteturais
- **Estrutura de Pastas:**
  ```text
  src/
  ├── app/
  │   ├── app.routes.ts
  │   ├── app.config.ts
  │   └── app.component.ts
  ├── domains/ (Módulos de Negócio isolados)
  │   ├── customer/
  │   │   ├── feature-checkout/
  │   │   ├── data-access/ (Services, State, Models)
  │   │   └── ui/ (Componentes burros do domínio)
  │   ├── owner/
  │   ├── employee/
  │   └── motoboy/
  └── shared/ (Reutilizável globalmente)
      ├── ui/ (Design System, botões, modais)
      ├── utils/
      └── data-access/ (Guards, Interceptors globais)
  ```
- **Smart/Dumb Components:** Manter a clara separação entre componentes "Smart" (injetam serviços e gerenciam Signals de estado) e componentes "Dumb" (apenas `@Input()` via `input()` signal API e `@Output()` via `output()` API).
- **Control Flow:** Utilizar exclusivamente a nova sintaxe de Control Flow (`@if`, `@for`, `@defer`) ao invés de diretivas estruturais antigas (`*ngIf`, `*ngFor`).
- **Serviços e Abstração de Dados (Dependency Inversion):** Para permitir a substituição transparente de fontes de dados (ex: trocar Mock por Firebase), os serviços de dados devem ser definidos como classes abstratas (`abstract class`). A classe abstrata serve como contrato e como runtime token de DI. As implementações concretas estendem essa classe abstrata, e os provedores são declarados centralizadamente no `app.config.ts` usando `{ provide: AbstractService, useClass: ConcreteService }`. Componentes devem injetar apenas a classe abstrata.
- **Escopo de Gerenciamento de Estado (Signals):**
  * *Estado Local:* Utilizar Signals declarados no componente para gerenciar dados específicos daquele componente (ex: modal aberto/fechado, filtros locais).
  * *Estado do Domínio:* Utilizar serviços singleton (`CartStateService`) injetados onde necessário para compartilhar estados reativos entre múltiplos componentes do mesmo domínio ou domínio compartilhado.
- **Sanitização e Manipulação de SVGs:** Evitar o uso do binding `[innerHTML]` para injetar caminhos de SVG dinâmicos no template. O mecanismo padrão de segurança do Angular irá sanitizar e remover elementos como `<path>`, `<rect>` e `<line>`, tornando as imagens invisíveis. Em vez disso, use diretivas nativas como `@switch` renderizando SVGs inline completos no template ou, se estritamente necessário, faça o bypass de segurança explicitamente usando `DomSanitizer.bypassSecurityHtml`.

## Exemplos Práticos
**Componente Angular Moderno usando Signals:**
```typescript
import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-bowl-card',
  standalone: true,
  template: `
    <div class="card">
      <h3>{{ product().name }}</h3>
      <p>{{ formattedPrice() }}</p>
      <button (click)="onAdd()">Adicionar</button>
    </div>
  `
})
export class BowlCardComponent {
  product = input.required<Product>();
  add = output<Product>();

  formattedPrice = computed(() => `R$ ${this.product().price.toFixed(2)}`);

  onAdd() {
    this.add.emit(this.product());
  }
}
```

## Checklists
- [ ] O componente está declarado como `standalone: true`?
- [ ] Foram utilizadas as APIs de `input()` e `output()` (Signal-based) em vez dos decorators `@Input`/`@Output` clássicos?
- [ ] O estado síncrono da UI está sendo gerenciado através de Signals?
- [ ] As regras de Control Flow (`@if`, `@for`) foram aplicadas?
- [ ] O componente respeita a separação Smart/Dumb?

## Critérios de Qualidade
- Alta coesão no domínio (um domínio não acessa `feature-` ou `ui-` de outro domínio, apenas expõe serviços estritamente necessários via `data-access`).
- Ausência de `NgModules`.
- Zero uso de `*ngIf` e `*ngFor`.
- Tipagem estrita e ausência de `any`.
