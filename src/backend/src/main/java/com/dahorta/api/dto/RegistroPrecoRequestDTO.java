package com.dahorta.api.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public record RegistroPrecoRequestDTO(
        @NotNull @Positive Long insumoId,
        @NotNull @Positive Long fornecedorId,
        @NotNull @Positive @Digits(integer = 8, fraction = 2) BigDecimal valor,
        @NotNull Instant data,
        @Size(max = 300) String observacao
) {
}
