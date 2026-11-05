package com.dahorta.api.dto;

import com.dahorta.api.entity.TipoDesconto;

import java.math.BigDecimal;
import java.time.Instant;

public record CupomResponseDTO(Long id, String codigo, TipoDesconto tipo, BigDecimal valor,
                               BigDecimal valorMinimo, Integer limiteUsos, int usosRealizados,
                               Instant expiraEm, boolean ativo) {
}
