package com.dahorta.api.pattern.behavioral.state;

import com.dahorta.api.entity.StatusPedido;

/** Padrão GoF: State */
public final class PedidoEmPreparoState implements StatusPedidoState {
    @Override
    public StatusPedido status() {
        return StatusPedido.EM_PREPARO;
    }

    @Override
    public boolean permite(StatusPedido proximo) {
        return proximo == StatusPedido.PRONTO_ENTREGA || proximo == StatusPedido.CANCELADO;
    }
}
