# DaHorta API

Backend independente em Java 17, Spring Boot 3, Spring Data JPA e MySQL 8.

## Configuração

O MySQL de desenvolvimento é iniciado via Docker Compose:

```bash
docker compose up -d
mvn spring-boot:run
```

O Compose cria o banco `dahorta` na porta `3306`, com volume persistente. As
credenciais locais padrão são `dahorta`/`dahorta`; defina `DB_USERNAME`,
`DB_PASSWORD` ou `MYSQL_ROOT_PASSWORD` no ambiente antes de iniciar o Compose
para substituí-las. A aplicação usa `DB_URL`, `DB_USERNAME` e `DB_PASSWORD`;
a URL padrão aponta para `localhost:3306/dahorta`.

Para parar o banco, execute `docker compose down` (os dados permanecem no
volume). `docker compose down -v` também remove o volume e todos os dados.

`DELIVERY_FEE` define a taxa de entrega e tem padrão `15.00`. Configure um
segredo aleatório de pelo menos 32 bytes em `JWT_SECRET`. Para provisionar o
administrador inicial, defina `ADMIN_EMAIL` e `ADMIN_PASSWORD`; se a conta já
existir, o bootstrap não a altera. `CORS_ALLOWED_ORIGIN` define a origem
permitida do Angular (padrão `http://localhost:4200`).

`spring.jpa.hibernate.ddl-auto` está em `update` para desenvolvimento; use
migrações versionadas antes de implantar em produção.

Se o catálogo estiver vazio, a API cadastra os 22 produtos iniciais usados pelo
frontend. O checkout resolve os IDs internos da API pelo nome do produto; ao
personalizar o catálogo, mantenha os nomes consistentes até a migração completa
do cardápio para a API.

Endereços salvos do cliente ficam no armazenamento local do navegador, por conta
e dispositivo; eles não são sincronizados entre dispositivos.

As rotas protegidas requerem o header `Authorization`, com `Bearer` seguido do
campo `accessToken` retornado pelo login.
O cadastro público cria somente contas `CLIENTE`; a equipe operacional é criada
por um `ADMIN`. Senhas são armazenadas com BCrypt.

## Pedidos

- `POST /api/v1/pedidos`: cliente autenticado cria pedido.
- `GET /api/v1/pedidos` e `GET /api/v1/pedidos/{id}`: consulta com escopo por
  perfil/usuário.
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

Checkout bloqueia a configuração da loja, o cupom aplicado e as linhas de
estoque relevantes, valida disponibilidade/limites e cria pedido, itens,
movimentações e consumo de cupom na mesma transação. Produtos sem ficha técnica
não consomem estoque.

## Outros módulos

- `POST /api/v1/auth/register` e `POST /api/v1/auth/login`: cadastro e autenticação.
- `/api/v1/usuarios/me`: consultar/editar perfil e alterar senha; ao editar e-mail,
  a resposta inclui um novo JWT.
- `/api/v1/admin/equipe`: CRUD de contas `COZINHA` e `MOTOBOY`.
- `/api/v1/admin/fornecedores`: CRUD de fornecedores, restrito a ADMIN.
- `/api/v1/admin/historico-precos`: CRUD do histórico de preços por insumo e fornecedor, restrito a ADMIN.
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
