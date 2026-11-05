package com.dahorta.api.dto;

import com.dahorta.api.entity.TipoDesconto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Digits;

import java.math.BigDecimal;
import java.time.Instant;

public record CupomRequestDTO(
        @NotBlank @Size(max = 40) String codigo,
        @NotNull TipoDesconto tipo,
        @NotNull @Positive @Digits(integer = 8, fraction = 2) BigDecimal valor,
        @PositiveOrZero @Digits(integer = 8, fraction = 2) BigDecimal valorMinimo,
        @Positive Integer limiteUsos,
        Instant expiraEm,
        @NotNull Boolean ativo
) {
}
