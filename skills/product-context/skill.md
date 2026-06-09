# Skill: Product Context

## Propósito
Esta skill define o domínio fundamental da plataforma Dark Kitchen "DaHorta". Seu objetivo é fornecer aos agentes de IA o entendimento de negócio necessário para que as decisões técnicas durante a migração não comprometam a lógica de negócio, garantindo que o sistema atenda aos fluxos operacionais e às necessidades de todos os atores envolvidos.

## Responsabilidades
- Descrever de forma clara e objetiva o modelo de negócio Dark Kitchen.
- Identificar e mapear as permissões, visões e interações dos atores do sistema.
- Explicar os fluxos principais, com foco no ciclo de vida de um pedido.
- Descrever as regras de negócio compartilhadas entre os domínios.

## Escopo
- Definição do domínio "Dark Kitchen" focado em refeições saudáveis (bowls orgânicos, etc.).
- Comportamento das interfaces de Cliente (Landing Page, Menu, Carrinho, Checkout, Tracking), Dono/Admin (Gestão de Insumos, Menu, Estoque, Cupons, Analytics), Funcionário (Kanban/Painel de Produção) e Motoboy (Painel de Entregas).
- O ciclo de vida completo do pedido (Recebido -> Preparando -> Pronto -> A Caminho -> Entregue).
- Mapeamento de dependências operacionais (ex: o funcionário não pode finalizar o pedido sem que haja ingredientes; o motoboy só enxerga pedidos "Prontos").

## O que está fora do escopo
- Decisões técnicas de implementação ou tecnologias específicas (Angular, React, bancos de dados).
- Detalhes sobre infraestrutura de nuvem, CI/CD ou deploys.
- Migrações de código e arquitetura de software.

## Conhecimento Obrigatório
- **Dark Kitchen:** Modelo de restaurante operando exclusivamente para delivery (sem salão de atendimento). Exige alta eficiência de comunicação entre cozinha e entregadores.
- **Domínio DaHorta:** Foco em ingredientes frescos e orgânicos, processos de higienização rigorosos e preparo ágil.
- **Sincronização em tempo real:** A mudança de status de um pedido no Kanban do funcionário deve refletir instantaneamente no tracking do cliente e no app do motoboy.

## Convenções
- Usar a terminologia oficial nos modelos de domínio: `Customer` (Cliente), `Owner` (Dono), `Employee` (Funcionário), `Motoboy` (Entregador), `Order` (Pedido), `Product` (Produto), `StockItem` (Item de Estoque).
- Status de Pedidos: `received` (Recebido), `preparing` (Preparando), `ready` (Pronto), `delivering` (A Caminho), `delivered` (Entregue).

## Decisões Arquiteturais (de Negócio)
- **Centralização do Pedido (Order):** O "Pedido" é a entidade central que interliga todos os atores.
- **Dedução automática de estoque:** Quando um pedido entra no status `preparing`, os insumos da ficha técnica são deduzidos.
- **Acesso Baseado em Papéis (RBAC):** Cada ator tem uma visão isolada e dependente de seu `role` de usuário.

## Exemplos Práticos
**Cenário: Cliente realiza um pedido**
1. **Cliente:** Monta o carrinho e finaliza o checkout. O status do pedido é `received`.
2. **Funcionário:** Visualiza o pedido na coluna "Recebidos" do Kanban. Move para "Preparando" (`preparing`), deduzindo o estoque.
3. **Cliente:** O tracking atualiza para "Seu bowl está sendo preparado".
4. **Funcionário:** Conclui o preparo e move para "Pronto" (`ready`).
5. **Motoboy:** Recebe o alerta do pedido pronto para coleta. Retira e marca como "A Caminho" (`delivering`).
6. **Cliente:** Acompanha a entrega.
7. **Motoboy:** Entrega o pedido e marca "Entregue" (`delivered`).

## Checklists
- [ ] O ator envolvido e suas permissões estão claros no fluxo?
- [ ] O impacto das mudanças de estado do pedido em outros atores foi considerado?
- [ ] O fluxo respeita a disponibilidade de estoque e regras de cupons/descontos?

## Critérios de Qualidade
- O modelo de negócio deve ser compreendido de forma independente do código.
- Todas as restrições operacionais (ex: motoboy não aprova pagamentos) devem ser estritamente respeitadas.
