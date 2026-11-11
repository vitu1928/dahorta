package com.dahorta.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProdutoResponseDTO(
        Long id,
        String nome,
        String descricao,
        String imagem,
        String categoria,
        BigDecimal preco,
        boolean disponivel,
        List<IngredienteProdutoResponseDTO> ingredientes,
        List<ComboSlotDTO> comboSlots,
        int tempoPreparo,
        List<String> alergicos
) {
}
