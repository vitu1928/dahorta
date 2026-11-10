package com.dahorta.api.service;

import com.dahorta.api.dto.AvaliacaoRequestDTO;
import com.dahorta.api.dto.AvaliacaoResponseDTO;
import com.dahorta.api.entity.Avaliacao;
import com.dahorta.api.entity.PerfilUsuario;
import com.dahorta.api.entity.StatusPedido;
import com.dahorta.api.repository.AvaliacaoRepository;
import com.dahorta.api.repository.PedidoRepository;
import com.dahorta.api.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AvaliacaoService {
    private final AvaliacaoRepository avaliacaoRepository;
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;

    public AvaliacaoService(AvaliacaoRepository avaliacaoRepository, PedidoRepository pedidoRepository,
                            UsuarioRepository usuarioRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoResponseDTO> listar() {
        return avaliacaoRepository.findAllByOrderByCriadoEmDesc().stream().map(this::response).toList();
    }

    @Transactional(readOnly = true)
    public AvaliacaoResponseDTO buscarDoPedido(Long pedidoId) {
        return avaliacaoRepository.findByPedidoId(pedidoId).map(this::response)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Avaliação não encontrada."));
    }

    @Transactional
    public AvaliacaoResponseDTO criar(AvaliacaoRequestDTO request, Authentication authentication) {
        var usuario = usuarioRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário inválido."));
        if (usuario.getPerfil() != PerfilUsuario.CLIENTE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Somente clientes podem avaliar pedidos.");
        }
        var pedido = pedidoRepository.findById(request.pedidoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));
        if (!pedido.getCliente().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode avaliar este pedido.");
        }
        if (pedido.getStatus() != StatusPedido.ENTREGUE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Só é possível avaliar pedidos entregues.");
        }
        if (avaliacaoRepository.findByPedidoId(pedido.getId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este pedido já foi avaliado.");
        }
        return response(avaliacaoRepository.save(new Avaliacao(
                pedido, request.estrelas(), normalizar(request.comentario()))));
    }

    private String normalizar(String comentario) {
        return comentario == null || comentario.isBlank() ? null : comentario.trim();
    }

    private AvaliacaoResponseDTO response(Avaliacao avaliacao) {
        return new AvaliacaoResponseDTO(avaliacao.getId(), avaliacao.getPedido().getId(),
                avaliacao.getEstrelas(), avaliacao.getComentario(), avaliacao.getCriadoEm(),
                avaliacao.getPedido().getCliente().getId(), avaliacao.getPedido().getCliente().getNome());
    }
}
