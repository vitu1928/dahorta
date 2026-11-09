package com.dahorta.api.pattern.behavioral.state;

import com.dahorta.api.entity.StatusPedido;

/** Padrão GoF: State */
public final class PedidoProntoEntregaState implements StatusPedidoState {
    @Override
    public StatusPedido status() {
        return StatusPedido.PRONTO_ENTREGA;
    }

    @Override
    public boolean permite(StatusPedido proximo) {
        return proximo == StatusPedido.SAIU_ENTREGA || proximo == StatusPedido.CANCELADO;
    }
}
