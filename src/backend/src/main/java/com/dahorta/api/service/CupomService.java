package com.dahorta.api.service;

import com.dahorta.api.dto.CupomRequestDTO;
import com.dahorta.api.dto.CupomResponseDTO;
import com.dahorta.api.dto.ItemPedidoRequestDTO;
import com.dahorta.api.dto.ValidarCupomRequestDTO;
import com.dahorta.api.dto.ValidarCupomResponseDTO;
import com.dahorta.api.entity.Cupom;
import com.dahorta.api.entity.Produto;
import com.dahorta.api.entity.TipoDesconto;
import com.dahorta.api.repository.CupomRepository;
import com.dahorta.api.repository.ProdutoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
public class CupomService {

    private final CupomRepository cupomRepository;
    private final ProdutoRepository produtoRepository;

    public CupomService(CupomRepository cupomRepository, ProdutoRepository produtoRepository) {
        this.cupomRepository = cupomRepository;
        this.produtoRepository = produtoRepository;
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
        return paraResposta(cupomRepository.save(new Cupom(codigo, request.tipo(), request.valor(),
                request.valorMinimo(), request.limiteUsos(), request.expiraEm(), request.ativo())));
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
        if (cupom.getTipo() == TipoDesconto.PERCENTUAL
                && cupom.getValor().compareTo(new BigDecimal("100")) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cupom percentual inválido.");
        }
        return switch (cupom.getTipo()) {
            case PERCENTUAL -> subtotal.multiply(cupom.getValor())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            case FIXO -> cupom.getValor().min(subtotal.add(taxaEntrega));
            case FRETE -> taxaEntrega;
        };
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
