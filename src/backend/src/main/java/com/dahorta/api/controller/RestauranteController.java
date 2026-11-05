package com.dahorta.api.controller;

import com.dahorta.api.dto.AtualizarLojaRequestDTO;
import com.dahorta.api.service.RestauranteService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/restaurante")
public class RestauranteController {

    private final RestauranteService restauranteService;

    public RestauranteController(RestauranteService restauranteService) {
        this.restauranteService = restauranteService;
    }

    @GetMapping
    public Map<String, Boolean> estado() {
        return Map.of("aberto", restauranteService.estaAberto());
    }

    @PatchMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COZINHA')")
    public Map<String, Boolean> atualizar(@Valid @RequestBody AtualizarLojaRequestDTO request) {
        return Map.of("aberto", restauranteService.atualizar(request));
    }
}
