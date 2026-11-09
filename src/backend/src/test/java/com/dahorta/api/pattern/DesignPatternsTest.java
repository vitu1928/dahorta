package com.dahorta.api.pattern;

import com.dahorta.api.entity.Cupom;
import com.dahorta.api.entity.EnderecoEntrega;
import com.dahorta.api.entity.MetodoPagamento;
import com.dahorta.api.entity.Pedido;
import com.dahorta.api.entity.PerfilUsuario;
import com.dahorta.api.entity.Produto;
import com.dahorta.api.entity.StatusPedido;
import com.dahorta.api.entity.TipoDesconto;
import com.dahorta.api.entity.Usuario;
import com.dahorta.api.pattern.behavioral.chain.ContextoCheckout;
import com.dahorta.api.pattern.behavioral.chain.ValidadorCheckout;
import com.dahorta.api.pattern.behavioral.chain.ValidadorCredito;
import com.dahorta.api.pattern.behavioral.chain.ValidadorCupom;
import com.dahorta.api.pattern.behavioral.chain.ValidadorEstoque;
import com.dahorta.api.pattern.behavioral.command.AprovarPedidoCommand;
import com.dahorta.api.pattern.behavioral.command.PedidoCommandExecutor;
import com.dahorta.api.pattern.behavioral.interpreter.ContextoRegraCupom;
import com.dahorta.api.pattern.behavioral.interpreter.InterpretadorRegraCupom;
import com.dahorta.api.pattern.behavioral.mediator.PedidoMediatorImpl;
import com.dahorta.api.pattern.behavioral.template.ProcessadorCheckoutTemplate;
import com.dahorta.api.pattern.behavioral.visitor.CalculoImpostoVisitor;
import com.dahorta.api.pattern.behavioral.visitor.RelatorioFiscalVisitor;
import com.dahorta.api.pattern.creational.ConfiguracaoRelatorio;
import com.dahorta.api.pattern.creational.CupomFactories;
import com.dahorta.api.pattern.creational.GerenciadorSessaoLocal;
import com.dahorta.api.pattern.creational.PedidoBuilder;
import com.dahorta.api.pattern.creational.notification.EmailNotificacaoFactory;
import com.dahorta.api.pattern.structural.bridge.FormatoCsv;
import com.dahorta.api.pattern.structural.bridge.FormatoPdf;
import com.dahorta.api.pattern.structural.bridge.RelatorioVendas;
import com.dahorta.api.pattern.structural.composite.ComboKitItem;
import com.dahorta.api.pattern.structural.composite.ProdutoItem;
import com.dahorta.api.pattern.structural.flyweight.StatusPedidoFlyweightFactory;
import com.dahorta.api.pattern.behavioral.iterator.FiltroPedidoCollection;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DesignPatternsTest {
    private static final Instant AGORA = Instant.parse("2026-01-01T00:00:00Z");

    @Test
    void factoriesBuilderPrototypeAndSingletonAreUsable() {
        List<String> enviados = new ArrayList<>();
        var factory = new EmailNotificacaoFactory(enviados::add);
        factory.criarNotificador().enviar(factory.criarFormatoMensagem().formatar("Pedido", "Recebido"));
        assertEquals("Pedido" + System.lineSeparator() + "Recebido", enviados.get(0));

        Cupom cupom = CupomFactories.para(TipoDesconto.FRETE).criar(
                "FRETE", new BigDecimal("15"), null, null, null, true);
        assertEquals(TipoDesconto.FRETE, cupom.getTipo());

        Pedido pedido = PedidoBuilder.umPedido(cliente(), MetodoPagamento.PIX, endereco(),
                        new BigDecimal("15"), "hash", AGORA)
                .adicionarItem(new Produto("Alface", new BigDecimal("10"), true), 2)
                .construir();
        assertEquals(new BigDecimal("20"), pedido.getSubtotal());

        Map<String, String> parametros = new HashMap<>();
        parametros.put("ano", "2026");
        ConfiguracaoRelatorio original = new ConfiguracaoRelatorio("Vendas", "CSV", parametros);
        ConfiguracaoRelatorio copia = original.copiar();
        parametros.put("ano", "2027");
        assertNotSame(original, copia);
        assertEquals("2026", copia.parametros().get("ano"));
        assertSame(GerenciadorSessaoLocal.INSTANCIA, GerenciadorSessaoLocal.valueOf("INSTANCIA"));
    }

    @Test
    void bridgeExportsCsvAndPdfAndFlyweightReusesMetadata() {
        Pedido pedido = pedido();
        String csv = new String(new RelatorioVendas(new FormatoCsv())
                .exportar(List.of(pedido)).conteudo());
        byte[] pdf = new RelatorioVendas(new FormatoPdf()).exportar(List.of(pedido)).conteudo();
        assertTrue(csv.startsWith("pedido_id,status,total"));
        assertTrue(new String(pdf).startsWith("%PDF-1.4"));
        assertSame(StatusPedidoFlyweightFactory.obter(StatusPedido.RECEBIDO),
                StatusPedidoFlyweightFactory.obter(StatusPedido.RECEBIDO));
    }

    @Test
    void compositeVisitorAndIteratorProcessDomainData() {
        ComboKitItem combo = new ComboKitItem("Kit", List.of(
                new ProdutoItem("Alface", new BigDecimal("10"), 2)));
        Cupom cupom = new Cupom("FIXO", TipoDesconto.FIXO, new BigDecimal("2"),
                null, null, null, true);
        RelatorioFiscalVisitor relatorio = new RelatorioFiscalVisitor();
        combo.aceitar(relatorio);
        relatorio.visitar(cupom);
        assertTrue(relatorio.resultado().contains("Cupom FIXO"));

        CalculoImpostoVisitor imposto = new CalculoImpostoVisitor(new BigDecimal("0.10"));
        combo.aceitar(imposto);
        imposto.visitar(cupom);
        assertEquals(new BigDecimal("1.80"), imposto.imposto());

        Pedido pedido = pedido();
        var iterator = new FiltroPedidoCollection(List.of(pedido), item -> item.getTotal().signum() > 0)
                .iterator();
        assertTrue(iterator.hasNext());
        assertSame(pedido, iterator.next());
        assertFalse(iterator.hasNext());
    }

    @Test
    void behavioralPatternsValidateInterpretAndRestoreOperations() {
        var regra = new InterpretadorRegraCupom()
                .interpretar("VALOR > 100 AND CATEGORIA == HORTALIÇA");
        assertTrue(regra.interpretar(new ContextoRegraCupom(
                new BigDecimal("120"), "Hortaliça")));
        assertFalse(regra.interpretar(new ContextoRegraCupom(
                new BigDecimal("100"), "Hortaliça")));
        assertThrows(IllegalArgumentException.class,
                () -> new InterpretadorRegraCupom().interpretar("VALOR < 100"));

        ValidadorCheckout cadeia = new ValidadorEstoque();
        cadeia.encadear(new ValidadorCupom()).encadear(new ValidadorCredito());
        cadeia.validar(new ContextoCheckout(new BigDecimal("2"), new BigDecimal("3"),
                true, new BigDecimal("10"), new BigDecimal("15")));
        assertThrows(IllegalStateException.class, () -> cadeia.validar(new ContextoCheckout(
                new BigDecimal("4"), new BigDecimal("3"), true,
                new BigDecimal("10"), new BigDecimal("15"))));

        Pedido pedido = pedido();
        PedidoCommandExecutor executor = new PedidoCommandExecutor();
        executor.enfileirar(new AprovarPedidoCommand(pedido));
        assertTrue(executor.executarProximo());
        assertEquals(StatusPedido.EM_PREPARO, pedido.getStatus());
        assertTrue(executor.desfazerUltimo());
        assertEquals(StatusPedido.RECEBIDO, pedido.getStatus());

        List<Long> etapas = new ArrayList<>();
        PedidoMediatorImpl mediator = new PedidoMediatorImpl(
                id -> etapas.add(id), id -> etapas.add(id), id -> etapas.add(id));
        mediator.pedidoAtualizado(42L);
        assertEquals(List.of(42L, 42L, 42L), etapas);
    }

    @Test
    void templateMethodRunsStagesInOrder() {
        List<String> etapas = new ArrayList<>();
        ProcessadorCheckoutTemplate<String, String> processador = new ProcessadorCheckoutTemplate<>() {
            @Override
            protected String validar(String contexto) {
                etapas.add("validar");
                return contexto;
            }

            @Override
            protected String calcular(String contexto) {
                etapas.add("calcular");
                return contexto;
            }

            @Override
            protected String efetivar(String contexto) {
                etapas.add("efetivar");
                return contexto;
            }

            @Override
            protected void notificar(String contexto, String resultado) {
                etapas.add("notificar");
            }
        };
        assertEquals("checkout", processador.processar("checkout"));
        assertEquals(List.of("validar", "calcular", "efetivar", "notificar"), etapas);
    }

    private Pedido pedido() {
        return new Pedido(cliente(), MetodoPagamento.PIX, endereco(),
                new BigDecimal("20"), new BigDecimal("15"), null, "hash", AGORA);
    }

    private Usuario cliente() {
        return new Usuario("Cliente", "cliente@dahorta.test", "hash", PerfilUsuario.CLIENTE);
    }

    private EnderecoEntrega endereco() {
        return new EnderecoEntrega("Casa", "Rua A", "1", null, "Centro", "São Paulo", "01000-000");
    }
}
