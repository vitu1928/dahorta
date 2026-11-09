package com.dahorta.api.dto;

import jakarta.validation.constraints.NotNull;

public record AtualizarLocalizacaoMotoboyRequestDTO(
        @NotNull Double latitude,
        @NotNull Double longitude
) {
}
