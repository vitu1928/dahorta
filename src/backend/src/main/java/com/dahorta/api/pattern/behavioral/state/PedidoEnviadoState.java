package com.dahorta.api.pattern.behavioral.state;

import com.dahorta.api.entity.StatusPedido;

/** Padrão GoF: State */
public final class PedidoEnviadoState implements StatusPedidoState {
    @Override
    public StatusPedido status() {
        return StatusPedido.SAIU_ENTREGA;
    }

    @Override
    public boolean permite(StatusPedido proximo) {
        return proximo == StatusPedido.ENTREGUE;
    }
}
