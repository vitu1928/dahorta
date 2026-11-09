package com.dahorta.api.controller;

import com.dahorta.api.dto.AtualizarLocalizacaoMotoboyRequestDTO;
import com.dahorta.api.dto.LocalizacaoMotoboyResponseDTO;
import com.dahorta.api.entity.StatusPedido;
import com.dahorta.api.service.LocalizacaoMotoboyService;
import com.dahorta.api.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1")
public class LocalizacaoMotoboyController {
    private final PedidoService pedidoService;
    private final LocalizacaoMotoboyService localizacaoService;

    public LocalizacaoMotoboyController(
            PedidoService pedidoService,
            LocalizacaoMotoboyService localizacaoService) {
        this.pedidoService = pedidoService;
        this.localizacaoService = localizacaoService;
    }

    @PostMapping("/motoboys/me/localizacao")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void atualizar(
            Authentication authentication,
            @Valid @RequestBody AtualizarLocalizacaoMotoboyRequestDTO request) {
        localizacaoService.atualizar(authentication, request);
    }

    @GetMapping("/pedidos/{pedidoId}/localizacao")
    public LocalizacaoMotoboyResponseDTO buscar(
            @PathVariable Long pedidoId,
            Authentication authentication) {
        var pedido = pedidoService.buscar(pedidoId, authentication);
        if (pedido.status() != StatusPedido.SAIU_ENTREGA || pedido.motoboyId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Localização não disponível para este pedido.");
        }
        return localizacaoService.buscar(pedido.motoboyId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "O motoboy ainda não transmitiu uma localização recente."));
    }
}
