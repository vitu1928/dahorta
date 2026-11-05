package com.dahorta.api.dto;

import com.dahorta.api.entity.PerfilUsuario;

public record UsuarioResponseDTO(Long id, String nome, String email, String telefone,
                                 PerfilUsuario perfil, boolean ativo) {
}
