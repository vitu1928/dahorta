package com.dahorta.api.dto;

import com.dahorta.api.entity.PerfilUsuario;

public record TokenResponseDTO(
        String accessToken,
        String tokenType,
        long expiresIn,
        Long usuarioId,
        String nome,
        String email,
        PerfilUsuario perfil
) {
}
