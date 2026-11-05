package com.dahorta.api.dto;

import java.math.BigDecimal;

public record InsumoResponseDTO(Long id, String nome, String unidade, BigDecimal quantidadeAtual,
                                BigDecimal quantidadeMinima, boolean ativo) {
}
