package com.dahorta.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ValidarCupomRequestDTO(
        @NotBlank String codigo,
        @NotEmpty @Size(max = 50) List<@Valid ItemPedidoRequestDTO> itens
) {
}
