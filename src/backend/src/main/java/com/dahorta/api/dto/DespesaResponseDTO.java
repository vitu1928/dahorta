package com.dahorta.api.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record DespesaResponseDTO(Long id, String categoria, String descricao, BigDecimal valor,
                                 LocalDate data, boolean recorrente, String status, Instant criadoEm) {}
