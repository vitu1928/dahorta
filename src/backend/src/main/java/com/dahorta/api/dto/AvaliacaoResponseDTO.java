package com.dahorta.api.dto;

import java.time.Instant;

public record AvaliacaoResponseDTO(
        Long id,
        Long pedidoId,
        int estrelas,
        String comentario,
        Instant criadoEm,
        Long clienteId,
        String clienteNome
) {}
