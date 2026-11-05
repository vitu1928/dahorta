package com.dahorta.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AtualizarPerfilRequestDTO(
        @NotBlank @Size(max = 120) String nome,
        @NotBlank @Email @Size(max = 190) String email,
        @Size(max = 30) String telefone
) {
}
