-- Carga demonstrativa para desenvolvimento local.
-- Pressupoe que a API ja foi iniciada: ela cria o schema, o cardapio e o admin.
-- Valores de estoque, fichas, fornecedores e precos sao ficticios; nao usar em producao.
-- Seguro para reaplicar: nao apaga nem substitui dados existentes.

USE dahorta;
START TRANSACTION;

SET @demo_supplies = '[
  {"nome":"Quinoa","unidade":"kg","estoque":8.000,"minimo":2.000,"preco":34.90},
  {"nome":"Peito de frango","unidade":"kg","estoque":12.000,"minimo":3.000,"preco":22.50},
  {"nome":"Abacate","unidade":"kg","estoque":5.000,"minimo":1.000,"preco":14.90},
  {"nome":"Tomate cereja","unidade":"kg","estoque":4.000,"minimo":1.000,"preco":18.90},
  {"nome":"Espinafre","unidade":"kg","estoque":3.000,"minimo":1.000,"preco":12.90},
  {"nome":"Tahine","unidade":"kg","estoque":1.000,"minimo":0.250,"preco":49.90},
  {"nome":"Grao-de-bico","unidade":"kg","estoque":5.000,"minimo":1.000,"preco":14.90},
  {"nome":"Couve manteiga","unidade":"kg","estoque":4.000,"minimo":1.000,"preco":8.90},
  {"nome":"Cenoura","unidade":"kg","estoque":10.000,"minimo":2.000,"preco":6.90},
  {"nome":"Beterraba","unidade":"kg","estoque":8.000,"minimo":2.000,"preco":5.90},
  {"nome":"Homus","unidade":"kg","estoque":3.000,"minimo":1.000,"preco":24.90},
  {"nome":"Semente de girassol","unidade":"kg","estoque":2.000,"minimo":0.500,"preco":21.90},
  {"nome":"Arroz integral","unidade":"kg","estoque":12.000,"minimo":3.000,"preco":8.90},
  {"nome":"Salmao","unidade":"kg","estoque":5.000,"minimo":1.000,"preco":65.90},
  {"nome":"Pepino","unidade":"kg","estoque":6.000,"minimo":1.000,"preco":5.50},
  {"nome":"Azeitona sem caroço","unidade":"kg","estoque":2.000,"minimo":0.500,"preco":29.90},
  {"nome":"Iogurte natural","unidade":"l","estoque":4.000,"minimo":1.000,"preco":8.90},
  {"nome":"Couve-flor","unidade":"kg","estoque":8.000,"minimo":2.000,"preco":9.90},
  {"nome":"Brocolis","unidade":"kg","estoque":6.000,"minimo":1.000,"preco":11.90},
  {"nome":"Ovos","unidade":"un","estoque":60.000,"minimo":12.000,"preco":1.10},
  {"nome":"Gergelim","unidade":"kg","estoque":1.000,"minimo":0.250,"preco":28.90},
  {"nome":"Macarrao de arroz","unidade":"kg","estoque":4.000,"minimo":1.000,"preco":19.90},
  {"nome":"Tofu defumado","unidade":"kg","estoque":4.000,"minimo":1.000,"preco":24.90},
  {"nome":"Edamame","unidade":"kg","estoque":2.000,"minimo":0.500,"preco":32.90},
  {"nome":"Shiitake","unidade":"kg","estoque":2.000,"minimo":0.500,"preco":45.90},
  {"nome":"Molho de soja","unidade":"l","estoque":2.000,"minimo":0.500,"preco":14.90},
  {"nome":"Gengibre","unidade":"kg","estoque":2.000,"minimo":0.500,"preco":13.90},
  {"nome":"Alface romana","unidade":"kg","estoque":5.000,"minimo":1.000,"preco":8.90},
  {"nome":"Croutons","unidade":"kg","estoque":2.000,"minimo":0.500,"preco":18.90},
  {"nome":"Parmesao","unidade":"kg","estoque":2.000,"minimo":0.500,"preco":46.90},
  {"nome":"Molho caesar","unidade":"l","estoque":2.000,"minimo":0.500,"preco":28.90},
  {"nome":"Laranja","unidade":"kg","estoque":15.000,"minimo":3.000,"preco":6.90},
  {"nome":"Limao siciliano","unidade":"kg","estoque":8.000,"minimo":2.000,"preco":7.90},
  {"nome":"Framboesa congelada","unidade":"kg","estoque":2.000,"minimo":0.500,"preco":39.90},
  {"nome":"Agua com gas","unidade":"l","estoque":24.000,"minimo":6.000,"preco":2.90},
  {"nome":"Erva mate","unidade":"kg","estoque":2.000,"minimo":0.500,"preco":24.90},
  {"nome":"Base de kombucha","unidade":"l","estoque":6.000,"minimo":1.500,"preco":18.00},
  {"nome":"Polpa de acai","unidade":"kg","estoque":5.000,"minimo":1.000,"preco":32.90},
  {"nome":"Banana","unidade":"kg","estoque":12.000,"minimo":3.000,"preco":6.90},
  {"nome":"Granola","unidade":"kg","estoque":4.000,"minimo":1.000,"preco":22.90},
  {"nome":"Mel","unidade":"kg","estoque":2.000,"minimo":0.500,"preco":28.90},
  {"nome":"Cacau em po","unidade":"kg","estoque":2.000,"minimo":0.500,"preco":58.90},
  {"nome":"Tamara","unidade":"kg","estoque":2.000,"minimo":0.500,"preco":23.90},
  {"nome":"Castanha de caju","unidade":"kg","estoque":2.000,"minimo":0.500,"preco":49.90},
  {"nome":"Chia","unidade":"kg","estoque":2.000,"minimo":0.500,"preco":32.90},
  {"nome":"Leite de coco","unidade":"l","estoque":4.000,"minimo":1.000,"preco":12.90},
  {"nome":"Morango","unidade":"kg","estoque":5.000,"minimo":1.000,"preco":15.90},
  {"nome":"Farinha de amendoa","unidade":"kg","estoque":2.000,"minimo":0.500,"preco":48.90},
  {"nome":"Batata doce","unidade":"kg","estoque":12.000,"minimo":3.000,"preco":7.90},
  {"nome":"Mandioca","unidade":"kg","estoque":10.000,"minimo":2.000,"preco":6.90},
  {"nome":"Sal marinho","unidade":"kg","estoque":2.000,"minimo":0.500,"preco":8.90},
  {"nome":"Azeite de oliva","unidade":"l","estoque":4.000,"minimo":1.000,"preco":39.90},
  {"nome":"Alecrim","unidade":"kg","estoque":1.000,"minimo":0.250,"preco":22.90},
  {"nome":"Abobrinha","unidade":"kg","estoque":8.000,"minimo":2.000,"preco":9.90},
  {"nome":"Berinjela","unidade":"kg","estoque":6.000,"minimo":1.000,"preco":9.90},
  {"nome":"Pimentao","unidade":"kg","estoque":5.000,"minimo":1.000,"preco":14.90},
  {"nome":"Pao integral","unidade":"kg","estoque":8.000,"minimo":2.000,"preco":12.90},
  {"nome":"Linhaca","unidade":"kg","estoque":2.000,"minimo":0.500,"preco":16.90},
  {"nome":"Mix de ervas","unidade":"kg","estoque":1.000,"minimo":0.250,"preco":34.90},
  {"nome":"Farinha de aveia","unidade":"kg","estoque":3.000,"minimo":0.750,"preco":12.90},
  {"nome":"Coco ralado","unidade":"kg","estoque":2.000,"minimo":0.500,"preco":19.90},
  {"nome":"Agua mineral","unidade":"l","estoque":24.000,"minimo":6.000,"preco":1.90},
  {"nome":"Abacaxi","unidade":"kg","estoque":5.000,"minimo":1.000,"preco":7.90},
  {"nome":"Manga","unidade":"kg","estoque":5.000,"minimo":1.000,"preco":8.90},
  {"nome":"Acucar mascavo","unidade":"kg","estoque":3.000,"minimo":0.750,"preco":9.90}
]';

INSERT INTO insumos_estoque (nome, unidade, quantidade_atual, quantidade_minima, ativo, versao)
SELECT seed.nome, seed.unidade, seed.estoque, seed.minimo, TRUE, 0
FROM JSON_TABLE(@demo_supplies, '$[*]' COLUMNS (
    nome VARCHAR(120) PATH '$.nome',
    unidade VARCHAR(30) PATH '$.unidade',
    estoque DECIMAL(12,3) PATH '$.estoque',
    minimo DECIMAL(12,3) PATH '$.minimo'
)) AS seed
WHERE NOT EXISTS (
    SELECT 1 FROM insumos_estoque existing WHERE existing.nome = seed.nome
);

INSERT INTO fornecedores (nome, cnpj, telefone, email, endereco, ativo)
SELECT seed.nome, seed.cnpj, seed.telefone, seed.email, seed.endereco, TRUE
FROM (
    SELECT 'Hortifruti Demo da Serra' AS nome, '00.000.000/0001-01' AS cnpj,
           '+55 19 4000-0101' AS telefone, 'hortifruti@demo.example' AS email,
           'Endereco ficticio, Campinas - SP' AS endereco
    UNION ALL
    SELECT 'Distribuidora Demo Verde', '00.000.000/0001-02',
           '+55 19 4000-0102', 'distribuidora@demo.example',
           'Endereco ficticio, Valinhos - SP'
    UNION ALL
    SELECT 'Emporio Demo Natural', '00.000.000/0001-03',
           '+55 19 4000-0103', 'emporio@demo.example',
           'Endereco ficticio, Vinhedo - SP'
) AS seed
WHERE NOT EXISTS (
    SELECT 1 FROM fornecedores existing WHERE existing.email = seed.email
);

INSERT INTO registros_preco (insumo_id, fornecedor_id, valor, `data`, observacao)
SELECT ingredient.id, supplier.id,
       ROUND(item.preco * supplier_seed.fator * history.fator, 2),
       history.observado_em,
       CONCAT('Demonstracao; preco por ', item.unidade, '; ', supplier.nome, '; ', history.periodo)
FROM JSON_TABLE(@demo_supplies, '$[*]' COLUMNS (
    nome VARCHAR(120) PATH '$.nome',
    unidade VARCHAR(30) PATH '$.unidade',
    preco DECIMAL(10,2) PATH '$.preco'
)) AS item
JOIN insumos_estoque ingredient ON ingredient.nome = item.nome
CROSS JOIN (
    SELECT 'hortifruti@demo.example' AS email, 'Hortifruti Demo da Serra' AS nome, 0.96 AS fator
    UNION ALL
    SELECT 'distribuidora@demo.example', 'Distribuidora Demo Verde', 1.04
    UNION ALL
    SELECT 'emporio@demo.example', 'Emporio Demo Natural', 1.10
) AS supplier_seed
JOIN fornecedores supplier ON supplier.email = supplier_seed.email
CROSS JOIN (
    SELECT TIMESTAMP('2026-09-10 12:00:00') AS observado_em, 0.94 AS fator, 'set/2026' AS periodo
    UNION ALL
    SELECT TIMESTAMP('2026-10-10 12:00:00'), 1.00, 'out/2026'
    UNION ALL
    SELECT TIMESTAMP('2026-11-10 12:00:00'), 1.05, 'nov/2026'
) AS history
WHERE NOT EXISTS (
    SELECT 1
    FROM registros_preco existing
    WHERE existing.insumo_id = ingredient.id
      AND existing.fornecedor_id = supplier.id
      AND existing.`data` = history.observado_em
      AND existing.observacao = CONCAT(
          'Demonstracao; preco por ', item.unidade, '; ', supplier.nome, '; ', history.periodo)
);

SET @demo_recipes = '[
  {"produto":"Bowl Proteico","insumo":"Quinoa","quantidade":0.080},
  {"produto":"Bowl Proteico","insumo":"Peito de frango","quantidade":0.150},
  {"produto":"Bowl Proteico","insumo":"Abacate","quantidade":0.050},
  {"produto":"Bowl Proteico","insumo":"Tomate cereja","quantidade":0.050},
  {"produto":"Bowl Proteico","insumo":"Espinafre","quantidade":0.030},
  {"produto":"Bowl Proteico","insumo":"Tahine","quantidade":0.020},
  {"produto":"Bowl Vegano Power","insumo":"Grao-de-bico","quantidade":0.100},
  {"produto":"Bowl Vegano Power","insumo":"Couve manteiga","quantidade":0.030},
  {"produto":"Bowl Vegano Power","insumo":"Cenoura","quantidade":0.040},
  {"produto":"Bowl Vegano Power","insumo":"Beterraba","quantidade":0.040},
  {"produto":"Bowl Vegano Power","insumo":"Homus","quantidade":0.050},
  {"produto":"Bowl Vegano Power","insumo":"Semente de girassol","quantidade":0.010},
  {"produto":"Bowl Mediterraneo","insumo":"Arroz integral","quantidade":0.100},
  {"produto":"Bowl Mediterraneo","insumo":"Salmao","quantidade":0.120},
  {"produto":"Bowl Mediterraneo","insumo":"Pepino","quantidade":0.040},
  {"produto":"Bowl Mediterraneo","insumo":"Azeitona sem caroço","quantidade":0.015},
  {"produto":"Bowl Mediterraneo","insumo":"Iogurte natural","quantidade":0.030},
  {"produto":"Bowl Low-Carb Frango","insumo":"Couve-flor","quantidade":0.150},
  {"produto":"Bowl Low-Carb Frango","insumo":"Peito de frango","quantidade":0.120},
  {"produto":"Bowl Low-Carb Frango","insumo":"Brocolis","quantidade":0.070},
  {"produto":"Bowl Low-Carb Frango","insumo":"Ovos","quantidade":0.050},
  {"produto":"Bowl Low-Carb Frango","insumo":"Gergelim","quantidade":0.005},
  {"produto":"Bowl Asiatico","insumo":"Macarrao de arroz","quantidade":0.100},
  {"produto":"Bowl Asiatico","insumo":"Tofu defumado","quantidade":0.100},
  {"produto":"Bowl Asiatico","insumo":"Edamame","quantidade":0.040},
  {"produto":"Bowl Asiatico","insumo":"Shiitake","quantidade":0.025},
  {"produto":"Bowl Asiatico","insumo":"Molho de soja","quantidade":0.015},
  {"produto":"Bowl Asiatico","insumo":"Gengibre","quantidade":0.005},
  {"produto":"Salada Caesar Organica","insumo":"Alface romana","quantidade":0.080},
  {"produto":"Salada Caesar Organica","insumo":"Croutons","quantidade":0.025},
  {"produto":"Salada Caesar Organica","insumo":"Parmesao","quantidade":0.015},
  {"produto":"Salada Caesar Organica","insumo":"Molho caesar","quantidade":0.040},
  {"produto":"Suco de Laranja Organico","insumo":"Laranja","quantidade":0.450},
  {"produto":"Pink Lemonade Natural","insumo":"Limao siciliano","quantidade":0.080},
  {"produto":"Pink Lemonade Natural","insumo":"Framboesa congelada","quantidade":0.060},
  {"produto":"Pink Lemonade Natural","insumo":"Agua com gas","quantidade":0.350},
  {"produto":"Kombucha de Gengibre","insumo":"Base de kombucha","quantidade":0.300},
  {"produto":"Kombucha de Gengibre","insumo":"Gengibre","quantidade":0.005},
  {"produto":"Cha Mate com Limao","insumo":"Erva mate","quantidade":0.015},
  {"produto":"Cha Mate com Limao","insumo":"Limao siciliano","quantidade":0.050},
  {"produto":"Cha Mate com Limao","insumo":"Agua mineral","quantidade":0.350},
  {"produto":"Agua Mineral Alcalina","insumo":"Agua mineral","quantidade":0.500},
  {"produto":"Bowl de Acai Organico","insumo":"Polpa de acai","quantidade":0.200},
  {"produto":"Bowl de Acai Organico","insumo":"Banana","quantidade":0.080},
  {"produto":"Bowl de Acai Organico","insumo":"Granola","quantidade":0.030},
  {"produto":"Bowl de Acai Organico","insumo":"Morango","quantidade":0.020},
  {"produto":"Bowl de Acai Organico","insumo":"Mel","quantidade":0.010},
  {"produto":"Mousse de Cacau Raw","insumo":"Cacau em po","quantidade":0.025},
  {"produto":"Mousse de Cacau Raw","insumo":"Abacate","quantidade":0.080},
  {"produto":"Mousse de Cacau Raw","insumo":"Tamara","quantidade":0.040},
  {"produto":"Mousse de Cacau Raw","insumo":"Castanha de caju","quantidade":0.020},
  {"produto":"Chia Pudding de Coco","insumo":"Chia","quantidade":0.025},
  {"produto":"Chia Pudding de Coco","insumo":"Leite de coco","quantidade":0.150},
  {"produto":"Chia Pudding de Coco","insumo":"Morango","quantidade":0.050},
  {"produto":"Chia Pudding de Coco","insumo":"Coco ralado","quantidade":0.010},
  {"produto":"Cheesecake de Frutas Vermelhas","insumo":"Farinha de amendoa","quantidade":0.035},
  {"produto":"Cheesecake de Frutas Vermelhas","insumo":"Castanha de caju","quantidade":0.060},
  {"produto":"Cheesecake de Frutas Vermelhas","insumo":"Framboesa congelada","quantidade":0.050},
  {"produto":"Cheesecake de Frutas Vermelhas","insumo":"Tamara","quantidade":0.025},
  {"produto":"Brownie de Batata Doce","insumo":"Batata doce","quantidade":0.080},
  {"produto":"Brownie de Batata Doce","insumo":"Cacau em po","quantidade":0.020},
  {"produto":"Brownie de Batata Doce","insumo":"Farinha de aveia","quantidade":0.030},
  {"produto":"Brownie de Batata Doce","insumo":"Tamara","quantidade":0.025},
  {"produto":"Salada de Frutas Tropical","insumo":"Morango","quantidade":0.080},
  {"produto":"Salada de Frutas Tropical","insumo":"Banana","quantidade":0.050},
  {"produto":"Salada de Frutas Tropical","insumo":"Laranja","quantidade":0.050},
  {"produto":"Salada de Frutas Tropical","insumo":"Abacaxi","quantidade":0.060},
  {"produto":"Pao Integral Artesanal","insumo":"Pao integral","quantidade":0.080},
  {"produto":"Pao Integral Artesanal","insumo":"Chia","quantidade":0.005},
  {"produto":"Pao Integral Artesanal","insumo":"Linhaca","quantidade":0.005},
  {"produto":"Pao Integral Artesanal","insumo":"Semente de girassol","quantidade":0.005},
  {"produto":"Batata Doce com Alecrim","insumo":"Batata doce","quantidade":0.180},
  {"produto":"Batata Doce com Alecrim","insumo":"Azeite de oliva","quantidade":0.010},
  {"produto":"Batata Doce com Alecrim","insumo":"Alecrim","quantidade":0.001},
  {"produto":"Chips de Mandioca","insumo":"Mandioca","quantidade":0.150},
  {"produto":"Chips de Mandioca","insumo":"Sal marinho","quantidade":0.002},
  {"produto":"Chips de Mandioca","insumo":"Azeite de oliva","quantidade":0.006},
  {"produto":"Mix de Vegetais Grelhados","insumo":"Abobrinha","quantidade":0.060},
  {"produto":"Mix de Vegetais Grelhados","insumo":"Berinjela","quantidade":0.060},
  {"produto":"Mix de Vegetais Grelhados","insumo":"Pimentao","quantidade":0.050},
  {"produto":"Mix de Vegetais Grelhados","insumo":"Azeite de oliva","quantidade":0.008},
  {"produto":"Mix de Vegetais Grelhados","insumo":"Mix de ervas","quantidade":0.002},
  {"produto":"Combo Casal Fitness","insumo":"Quinoa","quantidade":0.160},
  {"produto":"Combo Casal Fitness","insumo":"Peito de frango","quantidade":0.300},
  {"produto":"Combo Casal Fitness","insumo":"Laranja","quantidade":0.900},
  {"produto":"Combo Casal Fitness","insumo":"Banana","quantidade":0.160}
]';

INSERT INTO ficha_tecnica_produto (produto_id, insumo_id, quantidade_por_produto)
SELECT product.id, ingredient.id, recipe.quantidade
FROM JSON_TABLE(@demo_recipes, '$[*]' COLUMNS (
    produto VARCHAR(150) PATH '$.produto',
    insumo VARCHAR(120) PATH '$.insumo',
    quantidade DECIMAL(12,3) PATH '$.quantidade'
)) AS recipe
JOIN produtos product ON product.nome = recipe.produto
JOIN insumos_estoque ingredient ON ingredient.nome = recipe.insumo
WHERE NOT EXISTS (
    SELECT 1
    FROM ficha_tecnica_produto existing
    WHERE existing.produto_id = product.id
      AND existing.insumo_id = ingredient.id
);

INSERT INTO movimentacoes_estoque
    (criado_em, observacao, quantidade, tipo, insumo_id, pedido_id, usuario_id)
SELECT TIMESTAMP('2026-11-10 15:00:00'),
       'Saldo inicial demonstrativo; nao representa contagem fisica.',
       ingredient.quantidade_atual, 'ENTRADA', ingredient.id, NULL, admin.id
FROM insumos_estoque ingredient
JOIN usuarios admin ON admin.perfil = 'ADMIN' AND admin.ativo = TRUE
WHERE ingredient.nome IN (
    SELECT seed.nome
    FROM JSON_TABLE(@demo_supplies, '$[*]' COLUMNS (nome VARCHAR(120) PATH '$.nome')) AS seed
)
  AND NOT EXISTS (
      SELECT 1
      FROM movimentacoes_estoque existing
      WHERE existing.insumo_id = ingredient.id
        AND existing.usuario_id = admin.id
        AND existing.observacao = 'Saldo inicial demonstrativo; nao representa contagem fisica.'
  );

INSERT INTO cupons (codigo, tipo, valor, valor_minimo, limite_usos, usos_realizados, expira_em, ativo, versao)
SELECT seed.codigo, seed.tipo, seed.valor, seed.valor_minimo, seed.limite_usos, 0, seed.expira_em, TRUE, 0
FROM (
    SELECT 'BEMVINDO10' AS codigo, 'PERCENTUAL' AS tipo, 10.00 AS valor,
           35.00 AS valor_minimo, 200 AS limite_usos, TIMESTAMP('2026-12-31 23:59:59') AS expira_em
    UNION ALL
    SELECT 'DESCONTO5', 'FIXO', 5.00, 50.00, 100, TIMESTAMP('2026-12-31 23:59:59')
    UNION ALL
    SELECT 'FRETEGRATIS', 'FRETE', 15.00, 40.00, 100, TIMESTAMP('2026-12-31 23:59:59')
) AS seed
WHERE NOT EXISTS (
    SELECT 1 FROM cupons existing WHERE existing.codigo = seed.codigo
);

UPDATE insumos_estoque SET versao = 0 WHERE versao IS NULL;
UPDATE cupons SET versao = 0 WHERE versao IS NULL;
UPDATE pedidos SET versao = 0 WHERE versao IS NULL;
UPDATE configuracao_restaurante SET versao = 0 WHERE versao IS NULL;

COMMIT;
