package com.dahorta.api.service;

import com.dahorta.api.dto.InsumoRequestDTO;
import com.dahorta.api.dto.InsumoResponseDTO;
import com.dahorta.api.dto.MovimentacaoEstoqueRequestDTO;
import com.dahorta.api.dto.MovimentacaoEstoqueResponseDTO;
import com.dahorta.api.entity.InsumoEstoque;
import com.dahorta.api.entity.MovimentacaoEstoque;
import com.dahorta.api.entity.TipoMovimentacaoEstoque;
import com.dahorta.api.entity.Usuario;
import com.dahorta.api.repository.InsumoEstoqueRepository;
import com.dahorta.api.repository.MovimentacaoEstoqueRepository;
import com.dahorta.api.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class EstoqueService {

    private final InsumoEstoqueRepository insumoRepository;
    private final MovimentacaoEstoqueRepository movimentacaoRepository;
    private final UsuarioRepository usuarioRepository;

    public EstoqueService(InsumoEstoqueRepository insumoRepository,
                          MovimentacaoEstoqueRepository movimentacaoRepository,
                          UsuarioRepository usuarioRepository) {
        this.insumoRepository = insumoRepository;
        this.movimentacaoRepository = movimentacaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<InsumoResponseDTO> listar() {
        return insumoRepository.findAllByAtivoTrueOrderByNomeAsc().stream().map(this::paraResposta).toList();
    }

    @Transactional(readOnly = true)
    public List<InsumoResponseDTO> listarAbaixoDoMinimo() {
        return insumoRepository.findAllAtOrBelowMinimum().stream().map(this::paraResposta).toList();
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoEstoqueResponseDTO> listarMovimentacoes() {
        return movimentacaoRepository.findAllByOrderByCriadoEmDesc().stream()
                .map(movimentacao -> new MovimentacaoEstoqueResponseDTO(
                        movimentacao.getId(),
                        movimentacao.getInsumo().getId(),
                        movimentacao.getInsumo().getNome(),
                        movimentacao.getUsuario().getId(),
                        movimentacao.getUsuario().getNome(),
                        movimentacao.getPedido() == null ? null : movimentacao.getPedido().getId(),
                        movimentacao.getTipo(),
                        movimentacao.getQuantidade(),
                        movimentacao.getObservacao(),
                        movimentacao.getCriadoEm()))
                .toList();
    }

    @Transactional
    public InsumoResponseDTO criar(InsumoRequestDTO request) {
        var insumo = insumoRepository.save(new InsumoEstoque(
                request.nome().trim(), request.unidade().trim(),
                request.quantidadeInicial(), request.quantidadeMinima()));
        return paraResposta(insumo);
    }

    @Transactional
    public InsumoResponseDTO atualizar(Long id, InsumoRequestDTO request, Authentication authentication) {
        InsumoEstoque insumo = carregarComBloqueio(id);
        insumo.atualizar(request.nome().trim(), request.unidade().trim(), request.quantidadeMinima());
        BigDecimal diferenca = request.quantidadeInicial().subtract(insumo.getQuantidadeAtual());
        if (diferenca.signum() != 0) {
            registrarMovimentacao(insumo, usuarioAtual(authentication), null, TipoMovimentacaoEstoque.AJUSTE,
                    request.quantidadeInicial(), "Correção de quantidade durante atualização do insumo.");
            insumo.definirQuantidade(request.quantidadeInicial());
        }
        return paraResposta(insumo);
    }

    @Transactional
    public void desativar(Long id) {
        carregarComBloqueio(id).desativar();
    }

    @Transactional
    public InsumoResponseDTO movimentar(MovimentacaoEstoqueRequestDTO request, Authentication authentication) {
        Usuario usuario = usuarioAtual(authentication);
        InsumoEstoque insumo = carregarComBloqueio(request.insumoId());
        BigDecimal novaQuantidade = switch (request.tipo()) {
            case ENTRADA -> {
                exigirQuantidadePositiva(request.quantidade());
                yield insumo.getQuantidadeAtual().add(request.quantidade());
            }
            case SAIDA_MANUAL, SAIDA -> {
                exigirQuantidadePositiva(request.quantidade());
                BigDecimal resultado = insumo.getQuantidadeAtual().subtract(request.quantidade());
                if (resultado.signum() < 0) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Estoque insuficiente.");
                }
                yield resultado;
            }
            case AJUSTE -> request.quantidade();
            case BAIXA_PEDIDO -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Baixas de pedido são registradas automaticamente no checkout.");
        };
        registrarMovimentacao(insumo, usuario, null, request.tipo(), request.quantidade(), request.observacao());
        insumo.definirQuantidade(novaQuantidade);
        return paraResposta(insumo);
    }

    private void registrarMovimentacao(InsumoEstoque insumo, Usuario usuario,
                                       com.dahorta.api.entity.Pedido pedido,
                                       TipoMovimentacaoEstoque tipo, BigDecimal quantidade, String observacao) {
        movimentacaoRepository.save(new MovimentacaoEstoque(
                insumo, usuario, pedido, tipo, quantidade, observacao));
    }

    private InsumoEstoque carregarComBloqueio(Long id) {
        InsumoEstoque insumo = insumoRepository.findForUpdateById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Insumo não encontrado."));
        if (!insumo.isAtivo()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Insumo inativo.");
        }
        return insumo;
    }

    private Usuario usuarioAtual(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário autenticado necessário.");
        }
        return usuarioRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário inválido."));
    }

    private void exigirQuantidadePositiva(BigDecimal quantidade) {
        if (quantidade.signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantidade deve ser maior que zero.");
        }
    }

    private InsumoResponseDTO paraResposta(InsumoEstoque insumo) {
        return new InsumoResponseDTO(insumo.getId(), insumo.getNome(), insumo.getUnidade(),
                insumo.getQuantidadeAtual(), insumo.getQuantidadeMinima(), insumo.isAtivo());
    }
}
