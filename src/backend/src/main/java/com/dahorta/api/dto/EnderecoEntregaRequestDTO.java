package com.dahorta.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EnderecoEntregaRequestDTO(
        @Size(max = 60) String rotulo,
        @NotBlank @Size(max = 160) String rua,
        @NotBlank @Size(max = 20) String numero,
        @Size(max = 100) String complemento,
        @NotBlank @Size(max = 100) String bairro,
        @NotBlank @Size(max = 100) String cidade,
        @Size(max = 9) String cep
) {
}
