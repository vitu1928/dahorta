package com.dahorta.api.dto;

import com.dahorta.api.entity.MetodoPagamento;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CriarPedidoRequestDTO(
        @NotEmpty @Size(max = 50) List<@Valid ItemPedidoRequestDTO> itens,
        @NotNull MetodoPagamento metodoPagamento,
        @NotNull @Valid EnderecoEntregaRequestDTO enderecoEntrega,
        @Size(max = 500) String observacoes,
        @Size(max = 40) String cupomCodigo
) {
}
