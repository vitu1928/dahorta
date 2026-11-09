package com.dahorta.api.service;

import com.dahorta.api.dto.CupomRequestDTO;
import com.dahorta.api.dto.CupomResponseDTO;
import com.dahorta.api.dto.ItemPedidoRequestDTO;
import com.dahorta.api.dto.ValidarCupomRequestDTO;
import com.dahorta.api.dto.ValidarCupomResponseDTO;
import com.dahorta.api.entity.Cupom;
import com.dahorta.api.entity.Produto;
import com.dahorta.api.entity.TipoDesconto;
import com.dahorta.api.pattern.behavioral.strategy.CalculoDescontoStrategy;
import com.dahorta.api.pattern.behavioral.strategy.DescontoFixoStrategy;
import com.dahorta.api.pattern.behavioral.strategy.DescontoFreteStrategy;
import com.dahorta.api.pattern.behavioral.strategy.DescontoPercentualStrategy;
import com.dahorta.api.pattern.creational.CupomFactories;
import com.dahorta.api.repository.CupomRepository;
import com.dahorta.api.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Padrão GoF: Factory Method, Strategy */
@Service
public class CupomService {

    private final CupomRepository cupomRepository;
    private final ProdutoRepository produtoRepository;
    private final Map<TipoDesconto, CalculoDescontoStrategy> estrategias;

    @Autowired
    public CupomService(CupomRepository cupomRepository, ProdutoRepository produtoRepository,
                        List<CalculoDescontoStrategy> estrategias) {
        this.cupomRepository = cupomRepository;
        this.produtoRepository = produtoRepository;
        EnumMap<TipoDesconto, CalculoDescontoStrategy> mapa = new EnumMap<>(TipoDesconto.class);
        estrategias.forEach(estrategia -> {
            if (mapa.putIfAbsent(estrategia.tipo(), estrategia) != null) {
                throw new IllegalStateException("Estratégia duplicada para " + estrategia.tipo());
            }
        });
        if (!mapa.keySet().containsAll(List.of(TipoDesconto.values()))) {
            throw new IllegalStateException("É necessária uma estratégia para cada tipo de desconto.");
        }
        this.estrategias = Map.copyOf(mapa);
    }

    CupomService(CupomRepository cupomRepository, ProdutoRepository produtoRepository) {
        this(cupomRepository, produtoRepository, List.of(
                new DescontoPercentualStrategy(), new DescontoFixoStrategy(), new DescontoFreteStrategy()));
    }

    @Transactional(readOnly = true)
    public ValidarCupomResponseDTO validar(ValidarCupomRequestDTO request, BigDecimal taxaEntrega) {
        BigDecimal subtotal = calcularSubtotal(request.itens());
        Cupom cupom = cupomRepository.findByCodigoIgnoreCase(normalizarCodigo(request.codigo()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cupom inválido."));
        BigDecimal desconto = calcularDesconto(cupom, subtotal, taxaEntrega);
        return new ValidarCupomResponseDTO(
                cupom.getCodigo(), subtotal, desconto, subtotal.add(taxaEntrega).subtract(desconto));
    }

    @Transactional(readOnly = true)
    public List<CupomResponseDTO> listar() {
        return cupomRepository.findAllByOrderByCodigoAsc().stream().map(this::paraResposta).toList();
    }

    @Transactional
    public CupomResponseDTO criar(CupomRequestDTO request) {
        validarRegras(request);
        String codigo = normalizarCodigo(request.codigo());
        if (cupomRepository.findByCodigoIgnoreCase(codigo).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Código de cupom já cadastrado.");
        }
        Cupom cupom = CupomFactories.para(request.tipo()).criar(codigo, request.valor(),
                request.valorMinimo(), request.limiteUsos(), request.expiraEm(), request.ativo());
        return paraResposta(cupomRepository.save(cupom));
    }

    @Transactional
    public CupomResponseDTO atualizar(Long id, CupomRequestDTO request) {
        validarRegras(request);
        Cupom cupom = cupomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cupom não encontrado."));
        String codigo = normalizarCodigo(request.codigo());
        cupomRepository.findByCodigoIgnoreCase(codigo)
                .filter(outro -> !outro.getId().equals(id))
                .ifPresent(outro -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Código de cupom já cadastrado.");
                });
        cupom.atualizar(codigo, request.tipo(), request.valor(), request.valorMinimo(),
                request.limiteUsos(), request.expiraEm(), request.ativo());
        return paraResposta(cupom);
    }

    @Transactional
    public void desativar(Long id) {
        Cupom cupom = cupomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cupom não encontrado."));
        cupom.atualizar(cupom.getCodigo(), cupom.getTipo(), cupom.getValor(), cupom.getValorMinimo(),
                cupom.getLimiteUsos(), cupom.getExpiraEm(), false);
    }

    public BigDecimal calcularDesconto(Cupom cupom, BigDecimal subtotal, BigDecimal taxaEntrega) {
        validarDisponibilidade(cupom, subtotal);
        try {
            return estrategias.get(cupom.getTipo()).calcular(cupom, subtotal, taxaEntrega);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, exception.getMessage(), exception);
        }
    }

    public void validarDisponibilidade(Cupom cupom, BigDecimal subtotal) {
        if (!cupom.isAtivo() || (cupom.getExpiraEm() != null && !cupom.getExpiraEm().isAfter(Instant.now()))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cupom inativo ou expirado.");
        }
        if (cupom.getValorMinimo() != null && subtotal.compareTo(cupom.getValorMinimo()) < 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Pedido abaixo do valor mínimo do cupom.");
        }
        if (cupom.getLimiteUsos() != null && cupom.getUsosRealizados() >= cupom.getLimiteUsos()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Limite de usos do cupom atingido.");
        }
    }

    private BigDecimal calcularSubtotal(List<ItemPedidoRequestDTO> itens) {
        BigDecimal subtotal = BigDecimal.ZERO;
        for (ItemPedidoRequestDTO item : itens) {
            Produto produto = produtoRepository.findById(item.produtoId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Produto não encontrado: " + item.produtoId()));
            if (!produto.isDisponivel()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Produto indisponível: " + produto.getNome());
            }
            subtotal = subtotal.add(produto.getPreco().multiply(BigDecimal.valueOf(item.quantidade())));
        }
        return subtotal;
    }

    private void validarRegras(CupomRequestDTO request) {
        if (request.tipo() == TipoDesconto.PERCENTUAL
                && request.valor().compareTo(new BigDecimal("100")) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Desconto percentual não pode exceder 100%.");
        }
        if (request.limiteUsos() != null && request.limiteUsos() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Limite de usos deve ser maior que zero.");
        }
    }

    private String normalizarCodigo(String codigo) {
        return codigo.trim().toUpperCase(Locale.ROOT);
    }

    private CupomResponseDTO paraResposta(Cupom cupom) {
        return new CupomResponseDTO(cupom.getId(), cupom.getCodigo(), cupom.getTipo(), cupom.getValor(),
                cupom.getValorMinimo(), cupom.getLimiteUsos(), cupom.getUsosRealizados(),
                cupom.getExpiraEm(), cupom.isAtivo());
    }
}
