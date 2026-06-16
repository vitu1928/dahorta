# Skill: Development Process

## Propósito
Esta skill atua como o manual de operações para qualquer agente de IA ou desenvolvedor humano envolvido na migração do projeto DaHorta. Ela define os passos padronizados sobre como planejar, executar, validar e revisar cada etapa da migração incremental dos componentes React para a nova base de código Angular.

## Responsabilidades
- Definir o fluxo de trabalho passo-a-passo para migrar módulos e features.
- Orientar como analisar a complexidade do código base legado (React).
- Padronizar os artefatos de entrega (planos, checklists e validações).
- Garantir a qualidade da entrega por meio de processos formais de verificação (QA).

## Escopo
- O pipeline de migração desde o entendimento do código legado até a abertura e validação de Pull Requests (PRs).
- Estratégias para decomposição de funcionalidades massivas.
- Geração de planos de implementação e matrizes de rastreabilidade para garantir que nada foi perdido.
- Critérios para elaboração de commits semânticos.

## O que está fora do escopo
- As convenções técnicas profundas (já cobertas em "Angular Architecture" e "React to Angular Migration").
- Escolha da infraestrutura de CI/CD para processar os PRs.

## Conhecimento Obrigatório
- **Abordagem Iterativa:** A migração será feita pedaço a pedaço (por Domínio ou por Feature). Não faremos uma reescrita gigante em um único passo, sob risco de paralisação ("Big Bang").
- **Validação Cruzada:** Ao reescrever código, é necessário verificar como a funcionalidade operava na raiz e como ficou no destino, validando visual e logicamente.
- **Git Flow Básico:** Operações por meio de branches de features (`feature/migration-[dominio]`), commits granulares e PRs rastreáveis.

## Convenções
- **Commits Semânticos em Português:** Escrever as mensagens de commit obrigatoriamente em português, utilizando os prefixos convencionais: `feat:` (novo), `fix:` (correção), `refactor:` (migração estrutural), `docs:` (documentação), `chore:` (configurações).
- **Rastreabilidade:** Cada commit/PR deve ter uma referência clara de qual componente React está sendo substituído ou qual domínio está sendo afetado.

## Decisões Arquiteturais e Metodológicas
- **Análise Pré-Migração Obrigatória:** Nenhum componente grande pode ser migrado antes que suas dependências (componentes "burros", serviços, utilitários e estilos compartilhados) sejam levantadas.
- **Decomposição por Domínio:** O fluxo será guiado pela arquitetura de Domínios. Exemplo: Se começarmos pelo Domínio `owner`, todos os componentes pertencentes a ele deverão ser migrados, em camadas (do UI básico para os Smart Components, e por fim o Routing).

## Fluxo de Trabalho (Development Flow)

### 1. Analisar o Módulo React
- Ler o componente original (ex: `MenuManagementPage.tsx`).
- Extrair o modelo de estado (quais dados ele possui?).
- Mapear dependências externas (quais serviços, contexts e componentes UI ele usa?).

### 2. Decompor e Planejar
- Criar um **Plano de Implementação** (Artifact).
- Se faltam componentes base (como Botões ou Modais no ecossistema Angular), criar tarefas para migrar esses blocos primeiro.
- Desenhar as entidades Angular correspondentes (Componentes, Services, Rotas).

### 3. Migrar e Validar (Execução)
- Gerar o código Angular baseado nas estratégias definidas na Skill "React to Angular Migration".
- Garantir a sintaxe rigorosa da "Angular Architecture".
- **Validação Local:** Testar regras de negócio para assegurar paridade de funcionalidades. A regressão deve ser zero.

### 4. Preparar Commits e PRs
- Agrupar as mudanças em commits atômicos e lógicos.
- Exemplo de Commit: `refactor(owner): migrar MenuManagementPage para Angular Signals e Standalone Component`

## Checklists

### Checklist de Análise Pré-Migração
- [ ] O componente legado e suas props foram totalmente compreendidos?
- [ ] Os estados locais e contextos globais usados pelo componente foram mapeados?
- [ ] Todas as dependências UI (Dumb Components) necessárias já existem em Angular?

### Checklist de Qualidade (QA e PR)
- [ ] A funcionalidade visual está idêntica ou superior ao original?
- [ ] As interações do usuário desencadeiam as mudanças de estado corretas?
- [ ] O console do navegador está livre de erros e de avisos de depreciação do Angular?
- [ ] O código passou por verificação estrita de Tipos (`tsc --noEmit`) sem erros?
- [ ] O commit segue o formato semântico exigido?

## Critérios de Qualidade
- Alta previsibilidade nas estimativas (se a análise foi bem feita, a migração ocorre sem bloqueios).
- Código final aderente a todas as Skills anteriores.
- Pull Requests enxutos e fáceis de revisar, abordando uma tela, serviço ou escopo contido por vez.
