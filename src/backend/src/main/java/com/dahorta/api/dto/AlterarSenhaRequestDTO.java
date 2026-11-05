package com.dahorta.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AlterarSenhaRequestDTO(
        @NotBlank String senhaAtual,
        @NotBlank @Size(min = 8, max = 72) String novaSenha
) {
}
