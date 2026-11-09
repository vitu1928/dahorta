package com.dahorta.api.pattern.behavioral.state;

import com.dahorta.api.entity.StatusPedido;

/** Padrão GoF: State */
public final class PedidoPendenteState implements StatusPedidoState {
    @Override
    public StatusPedido status() {
        return StatusPedido.RECEBIDO;
    }

    @Override
    public boolean permite(StatusPedido proximo) {
        return proximo == StatusPedido.EM_PREPARO || proximo == StatusPedido.CANCELADO;
    }
}
