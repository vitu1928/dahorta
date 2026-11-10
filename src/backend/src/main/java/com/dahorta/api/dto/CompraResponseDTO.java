package com.dahorta.api.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record CompraResponseDTO(Long id, Long fornecedorId, String fornecedorNome,
                                Long usuarioId, String usuarioNome, Instant criadaEm,
                                Instant recebidaEm, String observacao, BigDecimal total,
                                List<Item> itens) {
    public record Item(Long insumoId, String insumoNome, String unidade,
                       BigDecimal quantidade, BigDecimal precoUnitario, BigDecimal subtotal) {}
}
