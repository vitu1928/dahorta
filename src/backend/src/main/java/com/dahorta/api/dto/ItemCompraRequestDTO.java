package com.dahorta.api.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ItemCompraRequestDTO(
        @NotNull @Positive Long insumoId,
        @NotNull @Positive @Digits(integer = 9, fraction = 3) BigDecimal quantidade,
        @NotNull @Positive @Digits(integer = 8, fraction = 2) BigDecimal precoUnitario
) {}
