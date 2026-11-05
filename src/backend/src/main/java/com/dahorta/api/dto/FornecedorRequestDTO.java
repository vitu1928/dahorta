package com.dahorta.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FornecedorRequestDTO(
        @NotBlank @Size(max = 120) String nome,
        @Size(max = 20) String cnpj,
        @NotBlank @Size(max = 30) String telefone,
        @NotBlank @Email @Size(max = 190) String email,
        @NotBlank @Size(max = 300) String endereco
) {
}
