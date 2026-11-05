package com.dahorta.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ConfirmarEntregaRequestDTO(
        @NotBlank @Pattern(regexp = "\\d{6}", message = "O código de entrega deve ter 6 dígitos.")
        String codigo
) {
}
