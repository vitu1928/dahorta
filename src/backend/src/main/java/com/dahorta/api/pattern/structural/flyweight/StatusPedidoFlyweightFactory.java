package com.dahorta.api.pattern.structural.flyweight;

import com.dahorta.api.entity.StatusPedido;

import java.util.EnumMap;
import java.util.Map;

/** Padrão GoF: Flyweight */
public final class StatusPedidoFlyweightFactory {
    private static final Map<StatusPedido, StatusPedidoMetadata> METADADOS = criarMetadados();

    private StatusPedidoFlyweightFactory() {
    }

    public static StatusPedidoMetadata obter(StatusPedido status) {
        StatusPedidoMetadata metadata = METADADOS.get(status);
        if (metadata == null) {
            throw new IllegalArgumentException("Status de pedido desconhecido: " + status);
        }
        return metadata;
    }

    private static Map<StatusPedido, StatusPedidoMetadata> criarMetadados() {
        Map<StatusPedido, StatusPedidoMetadata> metadados = new EnumMap<>(StatusPedido.class);
        metadados.put(StatusPedido.RECEBIDO, new StatusPedidoMetadata(StatusPedido.RECEBIDO, "Pedido recebido", false));
        metadados.put(StatusPedido.EM_PREPARO, new StatusPedidoMetadata(StatusPedido.EM_PREPARO, "Em preparo", false));
        metadados.put(StatusPedido.PRONTO_ENTREGA, new StatusPedidoMetadata(StatusPedido.PRONTO_ENTREGA, "Pronto para entrega", false));
        metadados.put(StatusPedido.SAIU_ENTREGA, new StatusPedidoMetadata(StatusPedido.SAIU_ENTREGA, "Saiu para entrega", false));
        metadados.put(StatusPedido.ENTREGUE, new StatusPedidoMetadata(StatusPedido.ENTREGUE, "Entregue", true));
        metadados.put(StatusPedido.CANCELADO, new StatusPedidoMetadata(StatusPedido.CANCELADO, "Cancelado", true));
        return Map.copyOf(metadados);
    }
}
