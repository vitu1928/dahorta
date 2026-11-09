package com.dahorta.api.dto;

public record LocalizacaoMotoboyResponseDTO(
        double latitude,
        double longitude,
        long updatedAt
) {
}
