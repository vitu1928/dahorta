package com.dahorta.api.service;

import com.dahorta.api.dto.EnderecoEntregaRequestDTO;
import com.dahorta.api.dto.EnderecoSalvoResponseDTO;
import com.dahorta.api.entity.EnderecoEntrega;
import com.dahorta.api.entity.EnderecoSalvo;
import com.dahorta.api.entity.PerfilUsuario;
import com.dahorta.api.entity.Usuario;
import com.dahorta.api.repository.EnderecoSalvoRepository;
import com.dahorta.api.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class EnderecoSalvoService {

    private final EnderecoSalvoRepository enderecoRepository;
    private final UsuarioRepository usuarioRepository;

    public EnderecoSalvoService(EnderecoSalvoRepository enderecoRepository, UsuarioRepository usuarioRepository) {
        this.enderecoRepository = enderecoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<EnderecoSalvoResponseDTO> listar(Authentication authentication) {
        Usuario usuario = usuarioAtual(authentication);
        return enderecoRepository.findAllByUsuarioIdOrderByIdAsc(usuario.getId()).stream()
                .map(this::paraResposta).toList();
    }

    @Transactional
    public EnderecoSalvoResponseDTO criar(EnderecoEntregaRequestDTO request, Authentication authentication) {
        Usuario usuario = usuarioAtual(authentication);
        return paraResposta(enderecoRepository.save(new EnderecoSalvo(usuario, paraEndereco(request))));
    }

    @Transactional
    public EnderecoSalvoResponseDTO atualizar(
            Long id, EnderecoEntregaRequestDTO request, Authentication authentication) {
        Usuario usuario = usuarioAtual(authentication);
        EnderecoSalvo endereco = buscarDoUsuario(id, usuario);
        endereco.atualizar(paraEndereco(request));
        return paraResposta(endereco);
    }

    @Transactional
    public void excluir(Long id, Authentication authentication) {
        Usuario usuario = usuarioAtual(authentication);
        enderecoRepository.delete(buscarDoUsuario(id, usuario));
    }

    private EnderecoSalvo buscarDoUsuario(Long id, Usuario usuario) {
        return enderecoRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endereço não encontrado."));
    }

    private Usuario usuarioAtual(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário autenticado necessário.");
        }
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário inválido."));
        if (usuario.getPerfil() != PerfilUsuario.CLIENTE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Somente clientes podem gerenciar endereços salvos.");
        }
        return usuario;
    }

    private EnderecoEntrega paraEndereco(EnderecoEntregaRequestDTO request) {
        return new EnderecoEntrega(request.rotulo(), request.rua().trim(), request.numero().trim(),
                request.complemento(), request.bairro().trim(), request.cidade().trim(),
                request.cep() == null ? "" : request.cep().trim());
    }

    private EnderecoSalvoResponseDTO paraResposta(EnderecoSalvo salvo) {
        EnderecoEntrega endereco = salvo.getEndereco();
        return new EnderecoSalvoResponseDTO(salvo.getId(), endereco.getRotulo(), endereco.getRua(),
                endereco.getNumero(), endereco.getComplemento(), endereco.getBairro(),
                endereco.getCidade(), endereco.getCep());
    }
}
