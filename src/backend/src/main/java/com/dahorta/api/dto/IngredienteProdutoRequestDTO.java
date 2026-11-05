package com.dahorta.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Digits;

import java.math.BigDecimal;

public record IngredienteProdutoRequestDTO(
        @NotNull @Positive Long insumoId,
        @NotNull @Positive @Digits(integer = 9, fraction = 3) BigDecimal quantidade
) {
}
