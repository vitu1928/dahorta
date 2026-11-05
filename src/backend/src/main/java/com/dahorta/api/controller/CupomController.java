package com.dahorta.api.controller;

import com.dahorta.api.dto.CupomRequestDTO;
import com.dahorta.api.dto.CupomResponseDTO;
import com.dahorta.api.dto.ValidarCupomRequestDTO;
import com.dahorta.api.dto.ValidarCupomResponseDTO;
import com.dahorta.api.service.CupomService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/cupons")
public class CupomController {

    private final CupomService cupomService;
    private final BigDecimal taxaEntrega;

    public CupomController(CupomService cupomService,
                           @Value("${dahorta.pedidos.taxa-entrega}") BigDecimal taxaEntrega) {
        this.cupomService = cupomService;
        this.taxaEntrega = taxaEntrega;
    }

    @PostMapping("/validacao")
    @PreAuthorize("hasRole('CLIENTE')")
    public ValidarCupomResponseDTO validar(@Valid @RequestBody ValidarCupomRequestDTO request) {
        return cupomService.validar(request, taxaEntrega);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<CupomResponseDTO> listar() {
        return cupomService.listar();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public CupomResponseDTO criar(@Valid @RequestBody CupomRequestDTO request) {
        return cupomService.criar(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public CupomResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody CupomRequestDTO request) {
        return cupomService.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desativar(@PathVariable Long id) {
        cupomService.desativar(id);
    }
}
