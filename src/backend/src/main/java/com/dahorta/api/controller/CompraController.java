package com.dahorta.api.controller;

import com.dahorta.api.dto.CompraRequestDTO;
import com.dahorta.api.dto.CompraResponseDTO;
import com.dahorta.api.service.CompraService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/compras")
@PreAuthorize("hasRole('ADMIN')")
public class CompraController {
    private final CompraService service;
    public CompraController(CompraService service) { this.service = service; }
    @GetMapping
    public List<CompraResponseDTO> listar() { return service.listar(); }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CompraResponseDTO receber(@Valid @RequestBody CompraRequestDTO request, Authentication authentication) {
        return service.receber(request, authentication);
    }
}
