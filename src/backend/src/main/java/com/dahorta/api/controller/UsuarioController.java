package com.dahorta.api.controller;

import com.dahorta.api.dto.AtualizarPerfilRequestDTO;
import com.dahorta.api.dto.AtualizarUsuarioEquipeRequestDTO;
import com.dahorta.api.dto.AlterarSenhaRequestDTO;
import com.dahorta.api.dto.CriarUsuarioEquipeRequestDTO;
import com.dahorta.api.dto.TokenResponseDTO;
import com.dahorta.api.dto.UsuarioResponseDTO;
import com.dahorta.api.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/usuarios/me")
    public UsuarioResponseDTO perfil(Authentication authentication) {
        return usuarioService.perfilAtual(authentication);
    }

    @PatchMapping("/usuarios/me")
    public TokenResponseDTO atualizarPerfil(Authentication authentication,
                                            @Valid @RequestBody AtualizarPerfilRequestDTO request) {
        return usuarioService.atualizarPerfil(authentication, request);
    }

    @PatchMapping("/usuarios/me/senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void alterarSenha(Authentication authentication, @Valid @RequestBody AlterarSenhaRequestDTO request) {
        usuarioService.alterarSenha(authentication, request);
    }

    @GetMapping("/admin/equipe")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UsuarioResponseDTO> listarEquipe() {
        return usuarioService.listarEquipe();
    }

    @PostMapping("/admin/equipe")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponseDTO criarMembro(@Valid @RequestBody CriarUsuarioEquipeRequestDTO request) {
        return usuarioService.criarMembro(request);
    }

    @PutMapping("/admin/equipe/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UsuarioResponseDTO atualizarMembro(@PathVariable Long id,
                                              @Valid @RequestBody AtualizarUsuarioEquipeRequestDTO request) {
        return usuarioService.atualizarMembro(id, request);
    }

    @DeleteMapping("/admin/equipe/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desativarMembro(@PathVariable Long id) {
        usuarioService.desativarMembro(id);
    }
}
