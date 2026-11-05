package com.dahorta.api.dto;

import java.math.BigDecimal;

public record IngredienteProdutoResponseDTO(Long insumoId, String nome, String unidade, BigDecimal quantidade) {
}
