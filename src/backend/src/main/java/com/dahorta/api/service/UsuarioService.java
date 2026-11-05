package com.dahorta.api.service;

import com.dahorta.api.dto.AtualizarPerfilRequestDTO;
import com.dahorta.api.dto.AtualizarUsuarioEquipeRequestDTO;
import com.dahorta.api.dto.AlterarSenhaRequestDTO;
import com.dahorta.api.dto.CriarUsuarioEquipeRequestDTO;
import com.dahorta.api.dto.TokenResponseDTO;
import com.dahorta.api.dto.UsuarioResponseDTO;
import com.dahorta.api.entity.PerfilUsuario;
import com.dahorta.api.entity.Usuario;
import com.dahorta.api.repository.UsuarioRepository;
import com.dahorta.api.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class UsuarioService {

    private static final Set<PerfilUsuario> PERFIS_EQUIPE = Set.of(PerfilUsuario.COZINHA, PerfilUsuario.MOTOBOY);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO perfilAtual(Authentication authentication) {
        return paraResposta(usuarioAtual(authentication));
    }

    @Transactional
    public TokenResponseDTO atualizarPerfil(Authentication authentication, AtualizarPerfilRequestDTO request) {
        Usuario usuario = usuarioAtual(authentication);
        String email = normalizarEmail(request.email());
        usuarioRepository.findByEmailIgnoreCase(email)
                .filter(outro -> !outro.getId().equals(usuario.getId()))
                .ifPresent(outro -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado.");
                });
        usuario.atualizarDadosPessoais(request.nome().trim(), email, request.telefone());
        return new TokenResponseDTO(jwtService.gerarToken(usuario), "Bearer",
                jwtService.getExpirationSeconds(), usuario.getId(), usuario.getNome(),
                usuario.getEmail(), usuario.getPerfil());
    }

    @Transactional
    public void alterarSenha(Authentication authentication, AlterarSenhaRequestDTO request) {
        Usuario usuario = usuarioAtual(authentication);
        if (!passwordEncoder.matches(request.senhaAtual(), usuario.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha atual incorreta.");
        }
        usuario.atualizarSenha(passwordEncoder.encode(request.novaSenha()));
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarEquipe() {
        return usuarioRepository.findAllByPerfilInOrderByNomeAsc(PERFIS_EQUIPE)
                .stream().map(this::paraResposta).toList();
    }

    @Transactional
    public UsuarioResponseDTO criarMembro(CriarUsuarioEquipeRequestDTO request) {
        validarPerfilEquipe(request.perfil());
        String email = normalizarEmail(request.email());
        if (usuarioRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado.");
        }
        Usuario usuario = usuarioRepository.save(new Usuario(
                request.nome().trim(), email, passwordEncoder.encode(request.senha()),
                request.perfil(), request.telefone()));
        return paraResposta(usuario);
    }

    @Transactional
    public UsuarioResponseDTO atualizarMembro(Long id, AtualizarUsuarioEquipeRequestDTO request) {
        validarPerfilEquipe(request.perfil());
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        if (!PERFIS_EQUIPE.contains(usuario.getPerfil())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Somente membros operacionais podem ser editados por esta rota.");
        }
        usuario.atualizarPerfil(request.nome().trim(), request.telefone(), request.perfil(), request.ativo());
        return paraResposta(usuario);
    }

    @Transactional
    public void desativarMembro(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        if (!PERFIS_EQUIPE.contains(usuario.getPerfil())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Somente membros operacionais podem ser removidos por esta rota.");
        }
        usuario.desativar();
    }

    private void validarPerfilEquipe(PerfilUsuario perfil) {
        if (!PERFIS_EQUIPE.contains(perfil)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "O papel deve ser COZINHA ou MOTOBOY.");
        }
    }

    private Usuario usuarioAtual(Authentication authentication) {
        return usuarioRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário autenticado inválido."));
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private UsuarioResponseDTO paraResposta(Usuario usuario) {
        return new UsuarioResponseDTO(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getTelefone(),
                usuario.getPerfil(), usuario.isAtivo());
    }
}
