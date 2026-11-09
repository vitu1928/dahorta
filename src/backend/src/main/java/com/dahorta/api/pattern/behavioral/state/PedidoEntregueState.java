package com.dahorta.api.pattern.behavioral.state;

import com.dahorta.api.entity.StatusPedido;

/** Padrão GoF: State */
public final class PedidoEntregueState implements StatusPedidoState {
    @Override
    public StatusPedido status() {
        return StatusPedido.ENTREGUE;
    }

    @Override
    public boolean permite(StatusPedido proximo) {
        return false;
    }
}
