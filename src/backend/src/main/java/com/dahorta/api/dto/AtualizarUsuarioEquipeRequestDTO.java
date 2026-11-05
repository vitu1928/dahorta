package com.dahorta.api.dto;

import com.dahorta.api.entity.PerfilUsuario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AtualizarUsuarioEquipeRequestDTO(
        @NotBlank @Size(max = 120) String nome,
        @NotNull PerfilUsuario perfil,
        @NotNull Boolean ativo,
        @Size(max = 30) String telefone
) {
}
