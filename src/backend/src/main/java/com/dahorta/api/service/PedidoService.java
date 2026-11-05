package com.dahorta.api.service;

import com.dahorta.api.dto.AtualizarStatusPedidoRequestDTO;
import com.dahorta.api.dto.CriarPedidoRequestDTO;
import com.dahorta.api.dto.EnderecoEntregaRequestDTO;
import com.dahorta.api.dto.ItemPedidoResponseDTO;
import com.dahorta.api.dto.PedidoResponseDTO;
import com.dahorta.api.dto.PedidoStatusEventoDTO;
import com.dahorta.api.entity.EnderecoEntrega;
import com.dahorta.api.entity.ItemPedido;
import com.dahorta.api.entity.ConfiguracaoRestaurante;
import com.dahorta.api.entity.Cupom;
import com.dahorta.api.entity.InsumoEstoque;
import com.dahorta.api.entity.MovimentacaoEstoque;
import com.dahorta.api.entity.PerfilUsuario;
import com.dahorta.api.entity.Pedido;
import com.dahorta.api.entity.Produto;
import com.dahorta.api.entity.StatusPedido;
import com.dahorta.api.entity.TipoMovimentacaoEstoque;
import com.dahorta.api.entity.Usuario;
import com.dahorta.api.repository.ConfiguracaoRestauranteRepository;
import com.dahorta.api.repository.CupomRepository;
import com.dahorta.api.repository.InsumoEstoqueRepository;
import com.dahorta.api.repository.MovimentacaoEstoqueRepository;
import com.dahorta.api.repository.PedidoRepository;
import com.dahorta.api.repository.ProdutoRepository;
import com.dahorta.api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.HexFormat;
import java.util.TreeMap;

@Service
public class PedidoService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InsumoEstoqueRepository insumoRepository;
    private final MovimentacaoEstoqueRepository movimentacaoRepository;
    private final CupomRepository cupomRepository;
    private final ConfiguracaoRestauranteRepository configuracaoRepository;
    private final CupomService cupomService;
    private final PedidoEventPublisher pedidoEventPublisher;
    private final BigDecimal taxaEntrega;

    public PedidoService(
            PedidoRepository pedidoRepository,
            ProdutoRepository produtoRepository,
            UsuarioRepository usuarioRepository,
            InsumoEstoqueRepository insumoRepository,
            MovimentacaoEstoqueRepository movimentacaoRepository,
            CupomRepository cupomRepository,
            ConfiguracaoRestauranteRepository configuracaoRepository,
            CupomService cupomService,
            PedidoEventPublisher pedidoEventPublisher,
            @Value("${dahorta.pedidos.taxa-entrega}") BigDecimal taxaEntrega) {
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
        this.usuarioRepository = usuarioRepository;
        this.insumoRepository = insumoRepository;
        this.movimentacaoRepository = movimentacaoRepository;
        this.cupomRepository = cupomRepository;
        this.configuracaoRepository = configuracaoRepository;
        this.cupomService = cupomService;
        this.pedidoEventPublisher = pedidoEventPublisher;
        this.taxaEntrega = taxaEntrega;
    }

    @Transactional
    public PedidoResponseDTO criar(CriarPedidoRequestDTO request, Authentication authentication) {
        Usuario cliente = usuarioAtual(authentication);
        exigirPerfil(cliente, PerfilUsuario.CLIENTE);

        ConfiguracaoRestaurante configuracao = configuracaoRepository.findForReadById(1L)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE, "Configuração do restaurante não inicializada."));
        if (!configuracao.isAberto()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Restaurante fechado para novos pedidos.");
        }

        String codigoEntrega = gerarCodigoEntrega();
        Pedido pedido = new Pedido(
                cliente,
                request.metodoPagamento(),
                paraEntidade(request.enderecoEntrega()),
                BigDecimal.ZERO,
                taxaEntrega,
                request.observacoes(),
                hashCodigo(codigoEntrega),
                Instant.now());

        Map<Long, BigDecimal> consumoPorInsumo = new TreeMap<>();
        for (var itemRequest : request.itens()) {
            Produto produto = produtoRepository.findById(itemRequest.produtoId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Produto não encontrado: " + itemRequest.produtoId()));

            if (!produto.isDisponivel()) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT, "Produto indisponível: " + produto.getNome());
            }

            ItemPedido item = new ItemPedido(produto, itemRequest.quantidade());
            pedido.adicionarItem(item);
            produto.getIngredientes().forEach(ingrediente -> consumoPorInsumo.merge(
                    ingrediente.getInsumo().getId(),
                    ingrediente.getQuantidade().multiply(BigDecimal.valueOf(itemRequest.quantidade())),
                    BigDecimal::add));
        }

        Cupom cupom = null;
        if (request.cupomCodigo() != null && !request.cupomCodigo().isBlank()) {
            cupom = cupomRepository.findForUpdateByCodigo(request.cupomCodigo().trim())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cupom inválido."));
            BigDecimal desconto = cupomService.calcularDesconto(cupom, pedido.getSubtotal(), taxaEntrega);
            pedido.aplicarCupom(cupom, desconto);
        }

        Map<Long, InsumoEstoque> insumosBloqueados = new LinkedHashMap<>();
        for (Long insumoId : consumoPorInsumo.keySet()) {
            InsumoEstoque insumo = insumoRepository.findForUpdateById(insumoId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.CONFLICT, "Ficha técnica referencia insumo inexistente: " + insumoId));
            if (!insumo.isAtivo()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Ficha técnica usa insumo inativo: " + insumo.getNome());
            }
            BigDecimal necessario = consumoPorInsumo.get(insumoId);
            if (insumo.getQuantidadeAtual().compareTo(necessario) < 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Estoque insuficiente para: " + insumo.getNome());
            }
            insumosBloqueados.put(insumoId, insumo);
        }

        pedido = pedidoRepository.save(pedido);
        for (var consumo : consumoPorInsumo.entrySet()) {
            InsumoEstoque insumo = insumosBloqueados.get(consumo.getKey());
            insumo.definirQuantidade(insumo.getQuantidadeAtual().subtract(consumo.getValue()));
            movimentacaoRepository.save(new MovimentacaoEstoque(
                    insumo, cliente, pedido, TipoMovimentacaoEstoque.BAIXA_PEDIDO,
                    consumo.getValue(), "Baixa automática do pedido " + pedido.getId()));
        }
        if (cupom != null) {
            cupom.registrarUso();
        }
        return paraResposta(pedido, codigoEntrega);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listar(Authentication authentication) {
        Usuario usuario = usuarioAtual(authentication);
        List<Pedido> pedidos = switch (usuario.getPerfil()) {
            case CLIENTE -> pedidoRepository.findAllByClienteIdOrderByCriadoEmDesc(usuario.getId());
            case COZINHA -> pedidoRepository.findAllByStatusInOrderByCriadoEmAsc(
                    List.of(StatusPedido.RECEBIDO, StatusPedido.EM_PREPARO));
            case ADMIN -> pedidoRepository.findAll();
            case MOTOBOY -> listarPedidosMotoboy(usuario);
        };
        return pedidos.stream().map(pedido -> paraResposta(pedido, null)).toList();
    }

    @Transactional(readOnly = true)
    public PedidoResponseDTO buscar(Long pedidoId, Authentication authentication) {
        Usuario usuario = usuarioAtual(authentication);
        Pedido pedido = buscarEntidade(pedidoId);
        validarAcesso(pedido, usuario);
        return paraResposta(pedido, null);
    }

    @Transactional
    public PedidoResponseDTO atualizarStatus(
            Long pedidoId,
            AtualizarStatusPedidoRequestDTO request,
            Authentication authentication) {
        Usuario usuario = usuarioAtual(authentication);
        StatusPedido destino = request.status();
        Instant agora = Instant.now();

        if (destino == StatusPedido.EM_PREPARO || destino == StatusPedido.PRONTO_ENTREGA) {
            exigirPerfilOuAdmin(usuario, PerfilUsuario.COZINHA);
        } else if (destino == StatusPedido.SAIU_ENTREGA) {
            exigirPerfil(usuario, PerfilUsuario.MOTOBOY);
        } else {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "A entrega deve ser confirmada com o código do pedido.");
        }

        Pedido pedido = buscarComBloqueio(pedidoId);
        if (destino == StatusPedido.EM_PREPARO || destino == StatusPedido.PRONTO_ENTREGA) {
            StatusPedido esperado = destino == StatusPedido.EM_PREPARO
                    ? StatusPedido.RECEBIDO
                    : StatusPedido.EM_PREPARO;
            validarTransicao(pedido, esperado, destino);
        } else {
            validarTransicao(pedido, StatusPedido.PRONTO_ENTREGA, destino);

            if (pedido.getMotoboy() != null && !pedido.getMotoboy().getId().equals(usuario.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Pedido já atribuído a outro motoboy.");
            }
            Usuario motoboyBloqueado = usuarioRepository.findForUpdateById(usuario.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Motoboy inválido."));
            if (!pedidoRepository.findAllForUpdateByMotoboyAndStatus(
                    motoboyBloqueado.getId(), StatusPedido.SAIU_ENTREGA).isEmpty()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Motoboy já possui uma entrega em andamento.");
            }
            pedido.atribuirMotoboy(motoboyBloqueado, agora);
        }

        pedido.atualizarStatus(destino, agora);
        Pedido salvo = pedidoRepository.save(pedido);
        publicarEventoStatus(salvo);
        return paraResposta(salvo, null);
    }

    @Transactional
    public void confirmarEntrega(
            Long pedidoId,
            String codigo,
            Authentication authentication) {
        Usuario motoboy = usuarioAtual(authentication);
        exigirPerfil(motoboy, PerfilUsuario.MOTOBOY);

        Pedido pedido = buscarEntidade(pedidoId);
        if (pedido.getStatus() != StatusPedido.SAIU_ENTREGA
                || pedido.getMotoboy() == null
                || !pedido.getMotoboy().getId().equals(motoboy.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Pedido não está em uma entrega atribuída a você.");
        }

        if (pedido.getCodigoEntregaHash() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Pedido não possui código de entrega válido.");
        }

        String hashInformado = hashCodigo(codigo);
        if (!MessageDigest.isEqual(
                pedido.getCodigoEntregaHash().getBytes(StandardCharsets.US_ASCII),
                hashInformado.getBytes(StandardCharsets.US_ASCII))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código de entrega inválido.");
        }

        pedido.confirmarEntrega(Instant.now());
        Pedido salvo = pedidoRepository.save(pedido);
        publicarEventoStatus(salvo);
    }

    @Transactional(readOnly = true)
    public PedidoStatusEventoDTO estadoParaEventos(Long pedidoId, Authentication authentication) {
        Usuario usuario = usuarioAtual(authentication);
        Pedido pedido = buscarEntidade(pedidoId);
        validarAcesso(pedido, usuario);
        return eventoStatus(pedido);
    }

    private void publicarEventoStatus(Pedido pedido) {
        pedidoEventPublisher.publicarDepoisDoCommit(eventoStatus(pedido));
    }

    private PedidoStatusEventoDTO eventoStatus(Pedido pedido) {
        return new PedidoStatusEventoDTO(
                pedido.getId(),
                pedido.getStatus(),
                pedido.getMotoboy() == null ? null : pedido.getMotoboy().getId(),
                pedido.getMotoboy() == null ? null : pedido.getMotoboy().getNome(),
                pedido.getAtualizadoEm());
    }

    private List<Pedido> listarPedidosMotoboy(Usuario motoboy) {
        Map<Long, Pedido> pedidos = new LinkedHashMap<>();
        pedidoRepository.findAllByStatusOrderByCriadoEmAsc(StatusPedido.PRONTO_ENTREGA)
                .stream()
                .filter(pedido -> pedido.getMotoboy() == null
                        || pedido.getMotoboy().getId().equals(motoboy.getId()))
                .forEach(pedido -> pedidos.put(pedido.getId(), pedido));
        pedidoRepository.findAllByMotoboyIdAndStatusOrderByCriadoEmDesc(
                        motoboy.getId(), StatusPedido.SAIU_ENTREGA)
                .forEach(pedido -> pedidos.put(pedido.getId(), pedido));
        return new ArrayList<>(pedidos.values());
    }

    private Usuario usuarioAtual(Authentication authentication) {
        return usuarioRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário autenticado inválido."));
    }

    private Pedido buscarEntidade(Long pedidoId) {
        return pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));
    }

    private Pedido buscarComBloqueio(Long pedidoId) {
        return pedidoRepository.findForUpdateById(pedidoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));
    }

    private void validarAcesso(Pedido pedido, Usuario usuario) {
        boolean permitido = switch (usuario.getPerfil()) {
            case ADMIN, COZINHA -> true;
            case CLIENTE -> pedido.getCliente().getId().equals(usuario.getId());
            case MOTOBOY -> (pedido.getStatus() == StatusPedido.PRONTO_ENTREGA
                    && (pedido.getMotoboy() == null || pedido.getMotoboy().getId().equals(usuario.getId())))
                    || (pedido.getMotoboy() != null && pedido.getMotoboy().getId().equals(usuario.getId()));
        };
        if (!permitido) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não tem acesso a este pedido.");
        }
    }

    private void exigirPerfil(Usuario usuario, PerfilUsuario perfil) {
        if (usuario.getPerfil() != perfil) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Perfil sem permissão para esta operação.");
        }
    }

    private void exigirPerfilOuAdmin(Usuario usuario, PerfilUsuario perfil) {
        if (usuario.getPerfil() != perfil && usuario.getPerfil() != PerfilUsuario.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Perfil sem permissão para esta operação.");
        }
    }

    private void validarTransicao(Pedido pedido, StatusPedido esperado, StatusPedido destino) {
        if (pedido.getStatus() != esperado) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Transição inválida: " + pedido.getStatus() + " para " + destino + ".");
        }
    }

    private EnderecoEntrega paraEntidade(EnderecoEntregaRequestDTO endereco) {
        return new EnderecoEntrega(
                endereco.rotulo(),
                endereco.rua(),
                endereco.numero(),
                endereco.complemento(),
                endereco.bairro(),
                endereco.cidade(),
                endereco.cep());
    }

    private PedidoResponseDTO paraResposta(Pedido pedido, String codigoEntrega) {
        EnderecoEntrega endereco = pedido.getEnderecoEntrega();
        EnderecoEntregaRequestDTO enderecoDto = new EnderecoEntregaRequestDTO(
                endereco.getRotulo(),
                endereco.getRua(),
                endereco.getNumero(),
                endereco.getComplemento(),
                endereco.getBairro(),
                endereco.getCidade(),
                endereco.getCep());

        List<ItemPedidoResponseDTO> itens = pedido.getItens().stream()
                .map(item -> new ItemPedidoResponseDTO(
                        item.getNomeProdutoSnapshot(),
                        item.getPrecoUnitarioSnapshot(),
                        item.getQuantidade(),
                        item.getSubtotal()))
                .toList();

        return new PedidoResponseDTO(
                pedido.getId(),
                pedido.getCliente().getId(),
                pedido.getCliente().getNome(),
                pedido.getMotoboy() == null ? null : pedido.getMotoboy().getId(),
                pedido.getMotoboy() == null ? null : pedido.getMotoboy().getNome(),
                pedido.getStatus(),
                pedido.getMetodoPagamento(),
                enderecoDto,
                itens,
                pedido.getSubtotal(),
                pedido.getTaxaEntrega(),
                pedido.getDesconto(),
                pedido.getCupomCodigo(),
                pedido.getTotal(),
                pedido.getObservacoes(),
                pedido.getCriadoEm(),
                pedido.getAtualizadoEm(),
                codigoEntrega);
    }

    private String gerarCodigoEntrega() {
        return String.format(Locale.ROOT, "%06d", SECURE_RANDOM.nextInt(1_000_000));
    }

    private String hashCodigo(String codigo) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(codigo.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 não disponível.", exception);
        }
    }
}
