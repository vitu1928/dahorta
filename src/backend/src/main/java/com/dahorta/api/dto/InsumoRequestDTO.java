package com.dahorta.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Digits;

import java.math.BigDecimal;

public record InsumoRequestDTO(
        @NotBlank @Size(max = 120) String nome,
        @NotBlank @Size(max = 30) String unidade,
        @NotNull @PositiveOrZero @Digits(integer = 9, fraction = 3) BigDecimal quantidadeInicial,
        @NotNull @PositiveOrZero @Digits(integer = 9, fraction = 3) BigDecimal quantidadeMinima,
        @Size(max = 80) String categoria,
        @Size(max = 1000) String observacoes
) {
}
