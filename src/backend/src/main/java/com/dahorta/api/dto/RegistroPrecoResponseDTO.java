package com.dahorta.api.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record RegistroPrecoResponseDTO(
        Long id,
        Long insumoId,
        String fornecedorId,
        BigDecimal valor,
        Instant data,
        String observacao
) {
}
