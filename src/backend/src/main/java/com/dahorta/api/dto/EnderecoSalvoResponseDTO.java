package com.dahorta.api.dto;

public record EnderecoSalvoResponseDTO(
        Long id,
        String rotulo,
        String rua,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String cep
) {
}
