package com.dahorta.api.controller;

import com.dahorta.api.dto.AvaliacaoRequestDTO;
import com.dahorta.api.dto.AvaliacaoResponseDTO;
import com.dahorta.api.service.AvaliacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/avaliacoes")
public class AvaliacaoController {
    private final AvaliacaoService service;

    public AvaliacaoController(AvaliacaoService service) { this.service = service; }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AvaliacaoResponseDTO> listar() { return service.listar(); }

    @GetMapping("/pedido/{pedidoId}")
    public AvaliacaoResponseDTO buscar(@PathVariable Long pedidoId) { return service.buscarDoPedido(pedidoId); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AvaliacaoResponseDTO criar(@Valid @RequestBody AvaliacaoRequestDTO request,
                                     Authentication authentication) {
        return service.criar(request, authentication);
    }
}
