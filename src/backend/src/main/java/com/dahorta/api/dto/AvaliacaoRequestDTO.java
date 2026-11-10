package com.dahorta.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AvaliacaoRequestDTO(
        @NotNull Long pedidoId,
        @Min(1) @Max(5) int estrelas,
        @Size(max = 1000) String comentario
) {}
