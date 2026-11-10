package com.dahorta.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DespesaRequestDTO(
        @NotBlank @Size(max = 80) String categoria,
        @NotBlank @Size(max = 180) String descricao,
        @NotNull @DecimalMin(value = "0.01") BigDecimal valor,
        @NotNull LocalDate data,
        boolean recorrente,
        @NotBlank @Size(max = 20) String status
) {}
