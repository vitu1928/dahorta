package com.dahorta.api.pattern.behavioral.state;

import com.dahorta.api.entity.StatusPedido;

import java.util.Map;

/** Padrão GoF: State */
public final class StatusPedidoStates {
    private static final Map<StatusPedido, StatusPedidoState> STATES = Map.of(
            StatusPedido.RECEBIDO, new PedidoPendenteState(),
            StatusPedido.EM_PREPARO, new PedidoEmPreparoState(),
            StatusPedido.PRONTO_ENTREGA, new PedidoProntoEntregaState(),
            StatusPedido.SAIU_ENTREGA, new PedidoEnviadoState(),
            StatusPedido.ENTREGUE, new PedidoEntregueState(),
            StatusPedido.CANCELADO, new PedidoCanceladoState());

    private StatusPedidoStates() {
    }

    public static StatusPedidoState para(StatusPedido status) {
        StatusPedidoState state = STATES.get(status);
        if (state == null) {
            throw new IllegalArgumentException("Status de pedido desconhecido: " + status);
        }
        return state;
    }
}
