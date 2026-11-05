package com.dahorta.api.dto;

import com.dahorta.api.entity.TipoMovimentacaoEstoque;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Digits;

import java.math.BigDecimal;

public record MovimentacaoEstoqueRequestDTO(
        @NotNull @Positive Long insumoId,
        @NotNull TipoMovimentacaoEstoque tipo,
        @NotNull @PositiveOrZero @Digits(integer = 9, fraction = 3) BigDecimal quantidade,
        @Size(max = 300) String observacao
) {
}
