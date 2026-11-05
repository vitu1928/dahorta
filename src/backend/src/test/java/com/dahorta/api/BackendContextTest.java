package com.dahorta.api;

import com.dahorta.api.repository.ConfiguracaoRestauranteRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:dahorta-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "dahorta.jwt.secret=test-only-secret-that-is-at-least-32-bytes-long",
        "dahorta.admin.email=admin@dahorta.test",
        "dahorta.admin.password=SenhaAdmin123"
})
@AutoConfigureMockMvc
class BackendContextTest {

    @Autowired
    private ConfiguracaoRestauranteRepository configuracaoRepository;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void iniciaAplicacaoEProvisionaConfiguracaoDaLoja() {
        assertTrue(configuracaoRepository.findById(1L).orElseThrow().isAberto());
    }

    @Test
    void disponibilizaCatalogoInicialParaCheckout() throws Exception {
        String catalogo = mockMvc.perform(get("/api/v1/produtos"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        assertTrue(catalogo.contains("\"nome\":\"Chia Pudding de Coco\""));
    }

    @Test
    void registraClienteEmiteJwtEProtegePerfil() throws Exception {
        String email = "cliente-" + java.util.UUID.randomUUID() + "@dahorta.test";
        String resposta = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nome": "Cliente",
                                  "email": "%s",
                                  "senha": "SenhaForte123",
                                  "telefone": "11999999999"
                                }
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.perfil").value("CLIENTE"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode tokenResponse = objectMapper.readTree(resposta);
        String token = tokenResponse.get("accessToken").asText();

        mockMvc.perform(get("/api/v1/usuarios/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.telefone").value("11999999999"));
    }

    @Test
    void naoPermiteCriarCuponsComTokenDeCliente() throws Exception {
        String email = "cliente-" + java.util.UUID.randomUUID() + "@dahorta.test";
        String resposta = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Cliente","email":"%s","senha":"SenhaForte123"}
                                """.formatted(email)))
                .andReturn().getResponse().getContentAsString();
        String token = objectMapper.readTree(resposta).get("accessToken").asText();

        mockMvc.perform(post("/api/v1/cupons")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"codigo":"TESTE","tipo":"FIXO","valor":5,"ativo":true}
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void listaInsumosAbaixoDoMinimoEPermiteAlterarDisponibilidadeDoProduto() throws Exception {
        String adminToken = login("admin@dahorta.test", "SenhaAdmin123");
        String insumoName = "Baixo-" + java.util.UUID.randomUUID();
        mockMvc.perform(post("/api/v1/estoque/insumos")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nome": "%s",
                                  "unidade": "un",
                                  "quantidadeInicial": 0,
                                  "quantidadeMinima": 1
                                }
                                """.formatted(insumoName)))
                .andExpect(status().isCreated());

        String belowMinimum = mockMvc.perform(get("/api/v1/estoque/insumos/abaixo-minimo")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        assertTrue(belowMinimum.contains(insumoName));

        String productResponse = mockMvc.perform(post("/api/v1/produtos")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nome": "Produto disponibilidade %s",
                                  "preco": 10.00,
                                  "disponivel": true,
                                  "ingredientes": []
                                }
                                """.formatted(java.util.UUID.randomUUID())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long productId = objectMapper.readTree(productResponse).get("id").asLong();

        mockMvc.perform(patch("/api/v1/produtos/{id}/disponibilidade", productId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"disponivel\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.disponivel").value(false));

        mockMvc.perform(patch("/api/v1/produtos/{id}/disponibilidade", productId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"disponivel\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.disponivel").value(true));
    }

    @Test
    void checkoutValidaLojaEAplicaCupomComBaixaDeEstoque() throws Exception {
        String adminToken = login("admin@dahorta.test", "SenhaAdmin123");
        String insumoJson = mockMvc.perform(post("/api/v1/estoque/insumos")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nome": "Abacate-%s",
                                  "unidade": "un",
                                  "quantidadeInicial": 10,
                                  "quantidadeMinima": 1
                                }
                                """.formatted(java.util.UUID.randomUUID())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long insumoId = objectMapper.readTree(insumoJson).get("id").asLong();

        String produtoJson = mockMvc.perform(post("/api/v1/admin/produtos")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nome": "Bowl de teste %s",
                                  "descricao": "Bowl",
                                  "categoria": "Bowls",
                                  "preco": 32.50,
                                  "disponivel": true,
                                  "ingredientes": [{"insumoId": %d, "quantidade": 2}]
                                }
                                """.formatted(java.util.UUID.randomUUID(), insumoId)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long produtoId = objectMapper.readTree(produtoJson).get("id").asLong();

        String couponCode = "T-" + java.util.UUID.randomUUID().toString().replace("-", "");
        mockMvc.perform(post("/api/v1/cupons")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "codigo": "%s",
                                  "tipo": "FIXO",
                                  "valor": 5,
                                  "limiteUsos": 1,
                                  "ativo": true
                                }
                                """.formatted(couponCode)))
                .andExpect(status().isCreated());

        String clienteEmail = "checkout-" + java.util.UUID.randomUUID() + "@dahorta.test";
        String clienteJson = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Cliente Checkout","email":"%s","senha":"SenhaCliente123"}
                                """.formatted(clienteEmail)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String clienteToken = objectMapper.readTree(clienteJson).get("accessToken").asText();

        mockMvc.perform(patch("/api/v1/restaurante")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"aberto\":false}"))
                .andExpect(status().isOk());

        String pedidoRequest = """
                {
                  "itens": [{"produtoId": %d, "quantidade": 2}],
                  "metodoPagamento": "pix",
                  "enderecoEntrega": {
                    "rua": "Rua de Teste",
                    "numero": "10",
                    "bairro": "Centro",
                    "cidade": "São Paulo",
                    "cep": "01000-000"
                  },
                  "cupomCodigo": "%s"
                }
                """.formatted(produtoId, "TESTE-INVALIDO");
        mockMvc.perform(post("/api/v1/pedidos")
                        .header("Authorization", "Bearer " + clienteToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pedidoRequest))
                .andExpect(status().isConflict());

        mockMvc.perform(patch("/api/v1/restaurante")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"aberto\":true}"))
                .andExpect(status().isOk());

        pedidoRequest = pedidoRequest.replace("TESTE-INVALIDO", couponCode);
        String pedidoJson = mockMvc.perform(post("/api/v1/pedidos")
                        .header("Authorization", "Bearer " + clienteToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pedidoRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.subtotal").value(65.0))
                .andExpect(jsonPath("$.desconto").value(5.0))
                .andExpect(jsonPath("$.total").value(75.0))
                .andReturn().getResponse().getContentAsString();
        long pedidoId = objectMapper.readTree(pedidoJson).get("id").asLong();

        mockMvc.perform(get("/api/v1/pedidos/" + pedidoId)
                        .header("Authorization", "Bearer " + clienteToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RECEBIDO"));

        MvcResult sse = mockMvc.perform(get("/api/v1/pedidos/" + pedidoId + "/eventos")
                        .header("Authorization", "Bearer " + clienteToken))
                .andExpect(request().asyncStarted())
                .andReturn();
        assertTrue(sse.getResponse().getContentType().startsWith("text/event-stream"));
        assertTrue(sse.getResponse().getContentAsString().contains("RECEBIDO"));

        mockMvc.perform(patch("/api/v1/pedidos/" + pedidoId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"EM_PREPARO\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EM_PREPARO"));
        assertTrue(sse.getResponse().getContentAsString().contains("EM_PREPARO"));

        mockMvc.perform(post("/api/v1/pedidos")
                        .header("Authorization", "Bearer " + clienteToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pedidoRequest))
                .andExpect(status().isConflict());

        mockMvc.perform(get("/api/v1/estoque/insumos")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].quantidadeAtual").value(6.0));

        mockMvc.perform(get("/api/v1/cupons")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].usosRealizados").value(1));
    }

    private String login(String email, String senha) throws Exception {
        String resposta = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","senha":"%s"}
                                """.formatted(email, senha)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(resposta).get("accessToken").asText();
    }
}
