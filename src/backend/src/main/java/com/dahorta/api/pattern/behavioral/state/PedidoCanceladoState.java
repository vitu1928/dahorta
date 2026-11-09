package com.dahorta.api.pattern.behavioral.state;

import com.dahorta.api.entity.StatusPedido;

/** Padrão GoF: State */
public final class PedidoCanceladoState implements StatusPedidoState {
    @Override
    public StatusPedido status() {
        return StatusPedido.CANCELADO;
    }

    @Override
    public boolean permite(StatusPedido proximo) {
        return false;
    }
}
