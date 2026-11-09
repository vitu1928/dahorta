package com.dahorta.api.pattern.structural.flyweight;

import com.dahorta.api.entity.StatusPedido;

/** Padrão GoF: Flyweight */
public record StatusPedidoMetadata(StatusPedido status, String descricao, boolean terminal) {
}
