package com.dahorta.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CompraRequestDTO(
        @NotNull @Positive Long fornecedorId,
        @Size(max = 500) String observacao,
        @NotEmpty @Size(max = 100) List<@Valid ItemCompraRequestDTO> itens
) {}
