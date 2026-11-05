package com.dahorta.api.dto;

import com.dahorta.api.entity.PerfilUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CriarUsuarioEquipeRequestDTO(
        @NotBlank @Size(max = 120) String nome,
        @NotBlank @Email @Size(max = 190) String email,
        @NotBlank @Size(min = 8, max = 72) String senha,
        @NotNull PerfilUsuario perfil,
        @Size(max = 30) String telefone
) {
}
