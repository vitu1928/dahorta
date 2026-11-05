package com.dahorta.api.service;

import com.dahorta.api.dto.AtualizarStatusPedidoRequestDTO;
import com.dahorta.api.dto.CriarPedidoRequestDTO;
import com.dahorta.api.dto.EnderecoEntregaRequestDTO;
import com.dahorta.api.dto.ItemPedidoRequestDTO;
import com.dahorta.api.entity.MetodoPagamento;
import com.dahorta.api.entity.ConfiguracaoRestaurante;
import com.dahorta.api.entity.IngredienteProduto;
import com.dahorta.api.entity.InsumoEstoque;
import com.dahorta.api.entity.PerfilUsuario;
import com.dahorta.api.entity.Pedido;
import com.dahorta.api.entity.Produto;
import com.dahorta.api.entity.StatusPedido;
import com.dahorta.api.entity.Usuario;
import com.dahorta.api.repository.PedidoRepository;
import com.dahorta.api.repository.ProdutoRepository;
import com.dahorta.api.repository.CupomRepository;
import com.dahorta.api.repository.ConfiguracaoRestauranteRepository;
import com.dahorta.api.repository.InsumoEstoqueRepository;
import com.dahorta.api.repository.MovimentacaoEstoqueRepository;
import com.dahorta.api.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PedidoServiceTest {

    private PedidoRepository pedidoRepository;
    private ProdutoRepository produtoRepository;
    private UsuarioRepository usuarioRepository;
    private ConfiguracaoRestauranteRepository configuracaoRepository;
    private InsumoEstoqueRepository insumoRepository;
    private ConfiguracaoRestaurante configuracao;
    private PedidoService pedidoService;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        pedidoRepository = mock(PedidoRepository.class);
        produtoRepository = mock(ProdutoRepository.class);
        usuarioRepository = mock(UsuarioRepository.class);
        insumoRepository = mock(InsumoEstoqueRepository.class);
        configuracaoRepository = mock(ConfiguracaoRestauranteRepository.class);
        configuracao = mock(ConfiguracaoRestaurante.class);
        when(configuracao.isAberto()).thenReturn(true);
        when(configuracaoRepository.findForReadById(1L)).thenReturn(Optional.of(configuracao));
        pedidoService = new PedidoService(
                pedidoRepository,
                produtoRepository,
                usuarioRepository,
                insumoRepository,
                mock(MovimentacaoEstoqueRepository.class),
                mock(CupomRepository.class),
                configuracaoRepository,
                mock(CupomService.class),
                mock(PedidoEventPublisher.class),
                new BigDecimal("15.00"));
        authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("cliente@dahorta.test");
    }

    @Test
    void criarRecalculaTotalComPrecoDoCatalogo() {
        Usuario cliente = new Usuario("Cliente", "cliente@dahorta.test", "hash", PerfilUsuario.CLIENTE);
        Produto produto = new Produto("Bowl", new BigDecimal("32.50"), true);
        when(usuarioRepository.findByEmailIgnoreCase("cliente@dahorta.test")).thenReturn(Optional.of(cliente));
        when(produtoRepository.findById(10L)).thenReturn(Optional.of(produto));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CriarPedidoRequestDTO request = new CriarPedidoRequestDTO(
                List.of(new ItemPedidoRequestDTO(10L, 2)),
                MetodoPagamento.PIX,
                new EnderecoEntregaRequestDTO(
                        "Casa", "Rua das Flores", "10", null, "Centro", "São Paulo", "01000-000"),
                null,
                null);

        var response = pedidoService.criar(request, authentication);

        assertEquals(new BigDecimal("65.00"), response.subtotal());
        assertEquals(new BigDecimal("15.00"), response.taxaEntrega());
        assertEquals(new BigDecimal("80.00"), response.total());
        assertNotNull(response.codigoEntrega());
        assertEquals(6, response.codigoEntrega().length());
    }

    @Test
    void clienteNaoPodeAlterarStatusDoPedido() {
        Usuario cliente = mock(Usuario.class);
        when(cliente.getPerfil()).thenReturn(PerfilUsuario.CLIENTE);
        when(usuarioRepository.findByEmailIgnoreCase("cliente@dahorta.test")).thenReturn(Optional.of(cliente));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> pedidoService.atualizarStatus(
                        1L,
                        new AtualizarStatusPedidoRequestDTO(StatusPedido.EM_PREPARO),
                        authentication));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verify(pedidoRepository, never()).save(any());
    }

    @Test
    void cozinhaNaoPodePularEtapaDoPedido() {
        Usuario cozinha = mock(Usuario.class);
        when(cozinha.getPerfil()).thenReturn(PerfilUsuario.COZINHA);
        when(usuarioRepository.findByEmailIgnoreCase("cliente@dahorta.test")).thenReturn(Optional.of(cozinha));

        Pedido pedido = mock(Pedido.class);
        when(pedido.getStatus()).thenReturn(StatusPedido.RECEBIDO);
        when(pedidoRepository.findForUpdateById(1L)).thenReturn(Optional.of(pedido));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> pedidoService.atualizarStatus(
                        1L,
                        new AtualizarStatusPedidoRequestDTO(StatusPedido.PRONTO_ENTREGA),
                        authentication));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(pedidoRepository, never()).save(any());
    }

    @Test
    void naoCriaPedidoQuandoRestauranteEstaFechado() {
        when(configuracao.isAberto()).thenReturn(false);
        when(usuarioRepository.findByEmailIgnoreCase("cliente@dahorta.test"))
                .thenReturn(Optional.of(new Usuario("Cliente", "cliente@dahorta.test", "hash", PerfilUsuario.CLIENTE)));
        CriarPedidoRequestDTO request = new CriarPedidoRequestDTO(
                List.of(new ItemPedidoRequestDTO(10L, 1)),
                MetodoPagamento.PIX,
                new EnderecoEntregaRequestDTO("Casa", "Rua", "1", null, "Centro", "Cidade", "01000-000"),
                null,
                null);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class, () -> pedidoService.criar(request, authentication));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(produtoRepository, never()).findById(10L);
    }

    @Test
    void checkoutDebitaInsumosEmMovimentoAtomico() {
        Usuario cliente = new Usuario("Cliente", "cliente@dahorta.test", "hash", PerfilUsuario.CLIENTE);
        InsumoEstoque insumo = mock(InsumoEstoque.class);
        when(insumo.getId()).thenReturn(99L);
        when(insumo.isAtivo()).thenReturn(true);
        when(insumo.getQuantidadeAtual()).thenReturn(new BigDecimal("10.000"));
        when(insumoRepository.findForUpdateById(99L)).thenReturn(Optional.of(insumo));
        Produto produto = new Produto("Bowl", new BigDecimal("32.50"), true);
        produto.getIngredientes().add(new IngredienteProduto(insumo, new BigDecimal("2.000")));
        when(usuarioRepository.findByEmailIgnoreCase("cliente@dahorta.test")).thenReturn(Optional.of(cliente));
        when(produtoRepository.findById(10L)).thenReturn(Optional.of(produto));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));
        CriarPedidoRequestDTO request = new CriarPedidoRequestDTO(
                List.of(new ItemPedidoRequestDTO(10L, 2)),
                MetodoPagamento.PIX,
                new EnderecoEntregaRequestDTO("Casa", "Rua", "1", null, "Centro", "Cidade", "01000-000"),
                null,
                null);

        pedidoService.criar(request, authentication);

        verify(insumo).definirQuantidade(new BigDecimal("6.000"));
    }

    @Test
    void naoCriaPedidoQuandoEstoqueEhInsuficiente() {
        Usuario cliente = new Usuario("Cliente", "cliente@dahorta.test", "hash", PerfilUsuario.CLIENTE);
        InsumoEstoque insumo = mock(InsumoEstoque.class);
        when(insumo.getId()).thenReturn(99L);
        when(insumo.isAtivo()).thenReturn(true);
        when(insumo.getNome()).thenReturn("Abacate");
        when(insumo.getQuantidadeAtual()).thenReturn(new BigDecimal("1.000"));
        when(insumoRepository.findForUpdateById(99L)).thenReturn(Optional.of(insumo));
        Produto produto = new Produto("Bowl", new BigDecimal("32.50"), true);
        produto.getIngredientes().add(new IngredienteProduto(insumo, new BigDecimal("2.000")));
        when(usuarioRepository.findByEmailIgnoreCase("cliente@dahorta.test")).thenReturn(Optional.of(cliente));
        when(produtoRepository.findById(10L)).thenReturn(Optional.of(produto));
        CriarPedidoRequestDTO request = new CriarPedidoRequestDTO(
                List.of(new ItemPedidoRequestDTO(10L, 1)),
                MetodoPagamento.PIX,
                new EnderecoEntregaRequestDTO("Casa", "Rua", "1", null, "Centro", "Cidade", "01000-000"),
                null,
                null);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class, () -> pedidoService.criar(request, authentication));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(pedidoRepository, never()).save(any());
    }
}
