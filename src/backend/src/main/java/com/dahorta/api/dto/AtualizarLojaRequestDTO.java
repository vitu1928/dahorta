package com.dahorta.api.dto;

import jakarta.validation.constraints.NotNull;

public record AtualizarLojaRequestDTO(@NotNull Boolean aberto) {
}
