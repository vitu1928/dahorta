package com.dahorta.api.dto;

import com.dahorta.api.entity.StatusPedido;

import java.time.Instant;

public record PedidoStatusEventoDTO(
        Long pedidoId,
        StatusPedido status,
        Long motoboyId,
        String motoboyNome,
        Instant atualizadoEm
) {
}
