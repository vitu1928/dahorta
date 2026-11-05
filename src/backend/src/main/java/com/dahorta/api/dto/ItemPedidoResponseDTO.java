package com.dahorta.api.dto;

import java.math.BigDecimal;

public record ItemPedidoResponseDTO(
        String nomeProduto,
        BigDecimal precoUnitario,
        int quantidade,
        BigDecimal subtotal
) {
}
