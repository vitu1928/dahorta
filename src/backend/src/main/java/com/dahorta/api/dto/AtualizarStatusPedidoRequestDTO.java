package com.dahorta.api.dto;

import com.dahorta.api.entity.StatusPedido;
import jakarta.validation.constraints.NotNull;

public record AtualizarStatusPedidoRequestDTO(
        @NotNull StatusPedido status
) {
}
