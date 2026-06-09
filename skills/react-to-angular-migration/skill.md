# Skill: React to Angular Migration

## Propósito
Esta skill fornece o mapa de tradução técnica para migrar de forma segura e eficiente os artefatos construídos em React para o novo ecossistema do Angular. O objetivo é orientar agentes de IA em como transformar paradigmas do React (Hooks, Context, JSX) em seus equivalentes idiomáticos e modernos no Angular (Signals, Services, Control Flow).

## Responsabilidades
- Fornecer mapeamentos de-para entre React e Angular.
- Definir como traduzir estratégias de gerenciamento de estado e ciclo de vida.
- Guiar a migração do React Router para o Angular Router.
- Orientar a migração de componentes visuais do React (TSX/JSX) para Templates HTML do Angular utilizando as novas APIs.

## Escopo
- Tradução de Hooks básicos (`useState`, `useEffect`, `useMemo`, `useCallback`).
- Tradução de Context API (`createContext`, `useContext`) para Angular Services e Providers.
- Tradução de React Router (`RouterProvider`, `useNavigate`, `useParams`) para `@angular/router`.
- Estratégias de migração incremental (preservando o comportamento do usuário e a árvore de dependências).

## O que está fora do escopo
- Decisão sobre qual domínio de negócio migrar primeiro (isto pertence ao Development Process).
- Mudanças profundas em regras de negócio que já funcionavam no React.
- Criação de bibliotecas de componentes híbridas (Micro Frontends), a não ser que estritamente requisitado. O foco é reescrever o código.

## Conhecimento Obrigatório
- **Diferenças de Paradigma:** React utiliza um fluxo declarativo onde toda a função é re-executada em mudanças de estado (Virtual DOM render phase). O Angular utiliza uma árvore reativa onde as atualizações são granulares e rastreadas por Signals/Change Detection sem re-executar a lógica de inicialização da classe.
- **Isolamento Lógico:** O React mistura JSX com lógica JavaScript na mesma função. O Angular exige separação entre o template e a classe de controle.

## Convenções e Regras de Conversão
1. **`useState` → `signal()`:**
   - React: `const [count, setCount] = useState(0);`
   - Angular: `count = signal(0);` (Atualização via `this.count.set(1)` ou `this.count.update(c => c + 1)`)
2. **`useMemo` → `computed()`:**
   - React: `const double = useMemo(() => count * 2, [count]);`
   - Angular: `double = computed(() => this.count() * 2);`
3. **`useEffect` → `effect()` ou Lifecycle Hooks:**
   - Para reatividade sincronizada pura baseada em dados: Use `effect()`.
   - Para chamadas assíncronas iniciais (onMount): Use o hook `ngOnInit()` ou `constructor`.
   - Para limpeza (onUnmount): Use o hook `ngOnDestroy()` ou a API `DestroyRef`.
4. **Context API → Angular Service (Provide in root ou environment injector):**
   - React: `<AppProvider> ... </AppProvider>`
   - Angular: Criar `@Injectable({ providedIn: 'root' }) class AppStateService {}` e usar o método `inject(AppStateService)` nos componentes.
5. **Rotas e Navegação:**
   - `useNavigate()` → `inject(Router).navigate(['/path'])`
   - `useParams()` → `inject(ActivatedRoute).paramMap` ou uso do `withComponentInputBinding()` nas rotas do Angular.
6. **Passagem de Props:**
   - Props normais → `minhaProp = input<string>()`
   - Funções de Callback → `meuEvento = output<string>()`

## Decisões Arquiteturais de Migração
- **Migração Incremental Top-Down vs Bottom-Up:**
  - Componentes estúpidos (Dumb UI components como Botões, Cards, Badges) devem ser migrados primeiro (Bottom-up) para formar a base de UI (`@shared/ui`).
  - Módulos e roteamentos devem ser estruturados (Top-Down) apontando progressivamente para os novos domínios Angular.
- **Preservação de Estilo:** O Tailwind CSS será portado exatamente como estava no React (com `className` se transformando em `class`).
- **Nenhum Redux/NgRx Prematuro:** O Contexto simples do React será mapeado para Angular Services usando Signals. Complexidade não será adicionada sem necessidade.

## Exemplos Práticos
**React Component:**
```tsx
function Counter({ initial = 0, onReachTen }) {
  const [count, setCount] = useState(initial);
  const isTen = useMemo(() => count === 10, [count]);

  useEffect(() => {
    if (isTen) onReachTen();
  }, [isTen]);

  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;
}
```
**Angular Migrado:**
```typescript
import { Component, input, output, signal, computed, effect } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: `<button (click)="increment()">Count: {{ count() }}</button>`
})
export class CounterComponent {
  initial = input(0);
  onReachTen = output<void>();

  count = signal(this.initial());
  isTen = computed(() => this.count() === 10);

  constructor() {
    effect(() => {
      if (this.isTen()) {
        this.onReachTen.emit();
      }
    });
  }

  increment() {
    this.count.update(c => c + 1);
  }
}
```

## Checklists
- [ ] Todos os `useEffect` foram traduzidos para `effect` (caso monitorem dependências reativas) ou `ngOnInit` (caso sejam inicializações)?
- [ ] O componente React original possui `Context` que deve ser traduzido para um `Service` de domínio?
- [ ] A folha de estilo Tailwind foi aplicada usando os mesmos nomes de classes?
- [ ] Não há vazamentos de memória na migração (ex: observables sem `takeUntilDestroyed`)?

## Critérios de Qualidade
- O componente traduzido deve ter o mesmo comportamento exato (ou superior por não ter problemas de re-renderização massiva) que o componente original em React.
- Os templates não devem conter lógica complexa de negócios.
- O mapeamento reflete a sintaxe moderna do Angular (Angular 17+).
