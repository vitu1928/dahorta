package com.dahorta.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Digits;

import java.math.BigDecimal;
import java.util.List;

public record ProdutoRequestDTO(
        @NotBlank @Size(max = 150) String nome,
        @Size(max = 1000) String descricao,
        @Size(max = 500) String imagem,
        @Size(max = 80) String categoria,
        @NotNull @Positive @Digits(integer = 8, fraction = 2) BigDecimal preco,
        @NotNull Boolean disponivel,
        @Size(max = 100) List<@Valid IngredienteProdutoRequestDTO> ingredientes
) {
}
