package com.dahorta.api.dto;

import com.dahorta.api.entity.TipoMovimentacaoEstoque;

import java.math.BigDecimal;
import java.time.Instant;

public record MovimentacaoEstoqueResponseDTO(Long id, Long insumoId, String insumoNome,
                                             Long usuarioId, String usuarioNome, Long pedidoId,
                                             TipoMovimentacaoEstoque tipo, BigDecimal quantidade,
                                             String observacao, Instant criadoEm) {
}
