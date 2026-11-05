package com.dahorta.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ItemPedidoRequestDTO(
        @NotNull @Positive Long produtoId,
        @Positive @Max(50) int quantidade
) {
}
