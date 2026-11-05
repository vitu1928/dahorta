package com.dahorta.api.service;

import com.dahorta.api.dto.CriarContaRequestDTO;
import com.dahorta.api.dto.TokenResponseDTO;
import com.dahorta.api.entity.PerfilUsuario;
import com.dahorta.api.entity.Usuario;
import com.dahorta.api.repository.UsuarioRepository;
import com.dahorta.api.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public TokenResponseDTO registrarCliente(CriarContaRequestDTO request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (usuarioRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado.");
        }
        Usuario usuario = usuarioRepository.save(new Usuario(
                request.nome().trim(), email, passwordEncoder.encode(request.senha()),
                PerfilUsuario.CLIENTE, request.telefone()));
        return tokenResponse(usuario);
    }

    @Transactional(readOnly = true)
    public TokenResponseDTO autenticar(String email, String senha) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email.trim().toLowerCase(Locale.ROOT), senha));
            Usuario usuario = (Usuario) authentication.getPrincipal();
            return tokenResponse(usuario);
        } catch (AuthenticationException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos.");
        }
    }

    private TokenResponseDTO tokenResponse(Usuario usuario) {
        return new TokenResponseDTO(
                jwtService.gerarToken(usuario),
                "Bearer",
                jwtService.getExpirationSeconds(),
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil());
    }
}
