package com.dahorta.api.dto;

import com.dahorta.api.entity.MetodoPagamento;
import com.dahorta.api.entity.StatusPedido;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record PedidoResponseDTO(
        Long id,
        Long clienteId,
        String clienteNome,
        Long motoboyId,
        String motoboyNome,
        StatusPedido status,
        MetodoPagamento metodoPagamento,
        EnderecoEntregaRequestDTO enderecoEntrega,
        List<ItemPedidoResponseDTO> itens,
        BigDecimal subtotal,
        BigDecimal taxaEntrega,
        BigDecimal desconto,
        String cupomCodigo,
        BigDecimal total,
        String observacoes,
        Instant criadoEm,
        Instant atualizadoEm,
        String codigoEntrega
) {
}
