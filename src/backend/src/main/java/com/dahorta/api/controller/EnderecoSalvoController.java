package com.dahorta.api.controller;

import com.dahorta.api.dto.EnderecoEntregaRequestDTO;
import com.dahorta.api.dto.EnderecoSalvoResponseDTO;
import com.dahorta.api.service.EnderecoSalvoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/enderecos")
@PreAuthorize("hasRole('CLIENTE')")
public class EnderecoSalvoController {

    private final EnderecoSalvoService enderecoService;

    public EnderecoSalvoController(EnderecoSalvoService enderecoService) {
        this.enderecoService = enderecoService;
    }

    @GetMapping
    public List<EnderecoSalvoResponseDTO> listar(Authentication authentication) {
        return enderecoService.listar(authentication);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EnderecoSalvoResponseDTO criar(
            @Valid @RequestBody EnderecoEntregaRequestDTO request, Authentication authentication) {
        return enderecoService.criar(request, authentication);
    }

    @PutMapping("/{id}")
    public EnderecoSalvoResponseDTO atualizar(
            @PathVariable Long id,
            @Valid @RequestBody EnderecoEntregaRequestDTO request,
            Authentication authentication) {
        return enderecoService.atualizar(id, request, authentication);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id, Authentication authentication) {
        enderecoService.excluir(id, authentication);
    }
}
