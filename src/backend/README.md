# DaHorta API local

Backend independente em Java 17, Spring Boot 3, Spring Data JPA e MySQL 8.
No Codespace, o MySQL roda em um container Docker e a API roda no devcontainer.
O frontend Angular continua sendo um aplicativo separado.

## Configuração

O MySQL de desenvolvimento é iniciado via Docker Compose:

```bash
docker compose --env-file ../../.env.codespace up -d
set -a
. ../../.env.codespace
set +a
mvn spring-boot:run
```

O Compose cria o banco `dahorta` na porta `3306`, com volume persistente. As
credenciais locais padrão são `dahorta`/`dahorta`; defina `DB_USERNAME`,
`DB_PASSWORD` ou `MYSQL_ROOT_PASSWORD` no ambiente antes de iniciar o Compose
para substituí-las. A aplicação usa `DB_URL`, `DB_USERNAME` e `DB_PASSWORD`;
a URL padrão aponta para `localhost:3306/dahorta`.

Ao iniciar a API, `OWNER_EMAIL`/`OWNER_PASSWORD` provisionam o perfil `ADMIN`,
`EMPLOYEE_EMAIL`/`EMPLOYEE_PASSWORD` provisionam `COZINHA`, e
`MOTOBOY_EMAIL`/`MOTOBOY_PASSWORD` provisionam `MOTOBOY`. As senhas são
armazenadas com BCrypt. Contas já existentes não têm senha nem perfil alterados;
se um e-mail de equipe já pertencer a outro perfil, a inicialização falha
explicitamente.
O cadastro público cria usuários `CLIENTE`. A API local assina JWT; ela não usa
Firebase Authentication. Mantenha essas credenciais apenas no arquivo local
ignorado pelo Git, nunca em SQL, commits ou no frontend.

### Carga demonstrativa local

Com o backend iniciado e o schema criado, aplique [demo-seed.sql](./data/demo-seed.sql)
a partir de `src/backend`:

```bash
docker compose --env-file ../../.env.codespace exec -T mysql \
  sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' < data/demo-seed.sql
```

O atalho `npm start` na raiz aplica essa carga automaticamente depois que a API
cria o schema e antes de iniciar o Angular. A carga é segura para reaplicar.

A carga não altera nem recria o cardápio: associa fichas técnicas estimadas aos
22 produtos atuais. Ela adiciona 65 insumos, 3 fornecedores fictícios e 585
históricos de preço (65 insumos × 3 fornecedores × 3 datas). Também registra
65 movimentos de saldo inicial e 3 cupons. Compras e despesas podem ser
registradas pelos endpoints administrativos e não são incluídas na carga
demonstrativa.
Quantidades e preços são sintéticos; os preços representam a unidade cadastrada
(kg, litro ou unidade), não uma cotação real. O SQL pode ser reaplicado sem
apagar dados nem duplicar as linhas demonstrativas. Não use esses valores como
ficha técnica, estoque ou custo real de produção.
As três datas do histórico de preços são relativas ao dia em que a carga roda,
para que a demonstração não apresente datas futuras ou antigas fixas.

Para parar o banco, execute `docker compose down` (os dados permanecem no
volume). `docker compose down -v` também remove o volume e todos os dados.

`DELIVERY_FEE` define a taxa de entrega e tem padrão `15.00`. Configure um
segredo aleatório de pelo menos 32 bytes em `JWT_SECRET`. O administrador pode
ser configurado com `OWNER_EMAIL`/`OWNER_PASSWORD` (ou com os nomes
`ADMIN_EMAIL`/`ADMIN_PASSWORD`). Se a conta já existir, o bootstrap não altera
sua senha ou perfil. `CORS_ALLOWED_ORIGIN` define a origem permitida do Angular
(padrão `http://localhost:4200`).

`spring.jpa.hibernate.ddl-auto` está em `update` para desenvolvimento; use
migrações versionadas antes de implantar em produção.

Se o catálogo da API estiver vazio, ela cadastra 22 produtos de demonstração.
O catálogo público, categorias, prato do dia e informações do restaurante são
lidos da API local. O frontend usa o ID numérico local no checkout.

Endereços salvos do cliente ficam no armazenamento local do navegador, por conta
e dispositivo; eles não são sincronizados entre dispositivos.

As rotas protegidas requerem o header `Authorization`, com `Bearer` seguido do
campo `accessToken` retornado pelo login.
O cadastro público cria somente contas `CLIENTE`; a equipe operacional é criada
por um `ADMIN`. Senhas são armazenadas com BCrypt.

## Migração do Firebase: estado atual

O frontend usa a API local para os fluxos abaixo. Os antigos serviços Firebase
permanecem no código como implementações legadas, mas já não são inicializados
nem registrados como providers ativos.

| Área | Estado local | Ainda depende de Firebase ou falta migrar |
|---|---|---|
| Login, cadastro e perfis | API local, JWT e contas MySQL; inicialização opcional de ADMIN, COZINHA e MOTOBOY pelo `.env.codespace`. | Login social ainda não está disponível na API local. |
| Pedidos e checkout | API local e MySQL; estoque, cupom, totais e pedido são processados no backend. O acompanhamento de pedido usa SSE autenticado. | A lista geral de pedidos ainda atualiza por polling de 5 s. |
| Cozinha e motoboy | A equipe e o estoque usam a API local; estados de pedido passam pela API local. | Rastreamento/localização é volátil em memória no backend e não persiste. Notificações são do navegador em primeiro plano; Web Push em segundo plano requer service worker e VAPID, ainda não configurados. |
| Insumos, movimentações e fichas técnicas | MySQL e API local; o painel administrativo lê/escreve pela API. Categoria e observações do insumo também são persistidas. | Dados existentes no Firestore não foram importados automaticamente; o seed é fictício. |
| Fornecedores, compras e preços | API local e MySQL; o painel `/owner/financeiro` registra recebimentos com vários insumos e cada compra atualiza estoque, movimentações e preços. | Dados legados do Firestore não foram importados. |
| Despesas | CRUD administrativo na API local e persistência MySQL; cadastro e listagem no painel `/owner/financeiro`. | A edição direta de despesa ainda é feita pela API, não pela tela. |
| Cardápio público e categorias | Catálogo de demonstração e CRUD de produtos pela API local; categorias derivadas dos produtos disponíveis; combos, opções, tempo de preparo e alérgenos persistidos pela API. | Produtos e preços do seed são demonstrativos, não dados comerciais reais. |
| Configurações do restaurante | API local para prato do dia e informações do restaurante; validade do histórico de preços fica persistida junto às configurações. O estado da loja também é salvo pela API. | O formulário do prato do dia ainda depende de IDs numéricos de produto. |
| Avaliações | API e tabela MySQL; só permite avaliar pedido entregue do próprio cliente, uma vez por pedido. | A listagem administrativa de avaliações não tem interface integrada. |
| Endereços e carrinho | Guardados no `localStorage` do navegador. | Não são dados do Firebase nem do MySQL; ficam neste dispositivo. |
| Notificações e relatórios | O browser pode exibir notificações locais; relatórios combinam dados disponíveis no frontend. | Não há envio Web Push centralizado. |

Os dados legados do Firebase não são copiados ou sincronizados automaticamente
com a API local. O Angular não precisa inicializar Firebase para os providers
ativos atuais.

## Pedidos

- `POST /api/v1/pedidos`: cliente autenticado cria pedido.
- `GET /api/v1/pedidos` e `GET /api/v1/pedidos/{id}`: consulta com escopo por
  perfil/usuário.
- `POST /api/v1/pedidos/{id}/codigo-entrega`: cliente dono do pedido gera um novo
  código enquanto o pedido está ativo, inclusive durante a entrega; apenas o hash
  é persistido. A emissão substitui o código anterior, que deixa de ser válido.
- `PATCH /api/v1/pedidos/{id}/status`: cozinha avança
  `RECEBIDO → EM_PREPARO → PRONTO_ENTREGA`; motoboy assume o pedido como
  `SAIU_ENTREGA`.
- `POST /api/v1/pedidos/{id}/entrega/confirmacao`: motoboy confirma entrega com
  código de seis dígitos; o código é persistido como hash.
- `GET /api/v1/pedidos/{id}/eventos`: fluxo SSE autenticado. Envia o status atual
  ao conectar e eventos `pedido-status` depois de cada transição confirmada.
  A implementação de emissores é em memória e requer um broker compartilhado
  (por exemplo Redis) ao executar múltiplas instâncias da API. Como o `EventSource`
  nativo do browser não permite enviar `Authorization`, conecte usando `fetch`
  streaming ou um cliente SSE que aceite headers; não passe JWT na query string.
- `POST /api/v1/motoboys/me/localizacao`: motoboy autenticado envia latitude e
  longitude durante uma entrega; `GET /api/v1/pedidos/{id}/localizacao` permite
  ao cliente do pedido e à equipe autorizada consultar a última posição recente.
  As posições ficam em memória por até dois minutos e não são persistidas.

Checkout bloqueia a configuração da loja, o cupom aplicado e as linhas de
estoque relevantes, valida disponibilidade/limites e cria pedido, itens,
movimentações e consumo de cupom na mesma transação. Produtos sem ficha técnica
não consomem estoque.

## Outros módulos

- `POST /api/v1/auth/register` e `POST /api/v1/auth/login`: cadastro e autenticação.
- `GET/POST /api/v1/enderecos` e `PUT/DELETE /api/v1/enderecos/{id}`: CRUD de
  endereços salvos, restrito ao cliente autenticado e isolado por usuário.
- `/api/v1/usuarios/me`: consultar/editar perfil e alterar senha; ao editar e-mail,
  a resposta inclui um novo JWT.
- `/api/v1/admin/equipe`: CRUD de contas `COZINHA` e `MOTOBOY`.
- `/api/v1/admin/fornecedores`: CRUD de fornecedores, restrito a ADMIN.
- `/api/v1/admin/historico-precos`: CRUD do histórico de preços por insumo e fornecedor, restrito a ADMIN.
- `GET/POST /api/v1/admin/compras`: lista e registra recebimentos. O recebimento
  aumenta o estoque e registra movimentos e preços na mesma transação.
- `GET/POST/PUT/DELETE /api/v1/admin/despesas`: CRUD de despesas, restrito a ADMIN.
- `POST /api/v1/avaliacoes` e `GET /api/v1/avaliacoes/pedido/{pedidoId}`:
  avaliação única de pedido entregue, somente pelo cliente dono.
- `GET /api/v1/categorias`, `/api/v1/prato-do-dia` e
  `/api/v1/restaurante/detalhes`: configurações públicas do catálogo.
- `PUT /api/v1/admin/prato-do-dia/{dia}` e
  `PATCH /api/v1/admin/restaurante/detalhes`: edição administrativa dessas configurações.
- `GET /api/v1/produtos` e `/api/v1/produtos/{id}`: catálogo público. Composição
  interna não é exposta ao cliente.
- `/api/v1/admin/produtos`: CRUD administrativo do cardápio e fichas técnicas.
  Também aceita `POST`, `PUT` e `DELETE` em `/api/v1/produtos`; a disponibilidade
  pode ser alterada com `PATCH /api/v1/produtos/{id}/disponibilidade`
  (`{"disponivel": false}`), sempre restrito a ADMIN.
- `/api/v1/estoque/insumos` e `/api/v1/estoque/movimentacoes`: estoque,
  ajustes auditados e histórico.
- `GET /api/v1/estoque/insumos/abaixo-minimo`: insumos ativos com saldo menor
  ou igual ao mínimo cadastrado. Movimentações manuais usam `ENTRADA`,
  `SAIDA_MANUAL` ou `AJUSTE`; `BAIXA_PEDIDO` é reservado ao checkout.
- `GET/PATCH /api/v1/restaurante`: estado de abertura; cozinha/admin pode alterar.
- `/api/v1/cupons`: CRUD administrativo e `POST /validacao` para clientes.

## Padrões GoF no domínio

As implementações explícitas estão organizadas em `com.dahorta.api.pattern`,
com o nome do padrão indicado no Javadoc de cada classe:

- **Criacionais:** Abstract Factory (`NotificacaoAbstractFactory` e fábricas
  de e-mail/SSE), Builder (`PedidoBuilder`, usado pelo checkout), Factory Method
  (`CupomFactories`, usado para criar cupons), Prototype (`ConfiguracaoRelatorio`)
  e Singleton (`GerenciadorSessaoLocal`, usado na geração segura do código de
  entrega).
- **Estruturais:** Adapter (`Usuario`/`UserDetails`), Bridge (`RelatorioVendas`
  com PDF/CSV), Composite (`ItemEstrutura`), Decorator (`NotificadorDecorator`),
  Facade (`CheckoutFacade`, usada no endpoint de criação), Flyweight
  (`StatusPedidoFlyweightFactory`) e Proxy (`PedidoRepositoryProxy`).
- **Comportamentais:** Chain of Responsibility (validadores de checkout),
  Command (aprovação/cancelamento e executor), Interpreter (regras de cupom),
  Iterator (coleção filtrada de pedidos), Mediator (`PedidoMediator`), Memento
  (histórico de status), Observer (eventos pós-commit SSE/log), State
  (transições de `Pedido`), Strategy (cálculo de desconto no `CupomService`),
  Template Method (fluxo usado pela facade) e Visitor (relatório fiscal/cálculo
  de imposto sobre a estrutura composta).

O checkout atual continua sendo efetivado atomicamente pelo `PedidoService`,
que já bloqueia estoque e cupom dentro da mesma transação. Não há integração de
gateway de pagamento nem serviços separados de entrega/notificação no backend;
por isso, as factories de notificação recebem o mecanismo de entrega por
injeção e o Mediator recebe seus participantes como portas `Consumer`, sem
simular pagamentos ou cobranças externas.

Exemplo de criação (o cliente é obtido da conta autenticada; preços e totais
vêm do catálogo no servidor):

```json
{
  "itens": [{ "produtoId": 10, "quantidade": 2 }],
  "metodoPagamento": "pix",
  "enderecoEntrega": {
    "rotulo": "Casa",
    "rua": "Rua das Flores",
    "numero": "10",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "cep": "01000-000"
  },
  "observacoes": "Sem castanhas",
  "cupomCodigo": "BEMVINDO"
}
```

Execute os testes com `mvn test`.
