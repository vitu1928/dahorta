package com.dahorta.api.dto;

import jakarta.validation.constraints.NotNull;

public record AtualizarDisponibilidadeProdutoRequestDTO(@NotNull Boolean disponivel) {
}
