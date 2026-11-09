package com.dahorta.api.pattern.behavioral.state;

import com.dahorta.api.entity.StatusPedido;

/** Padrão GoF: State */
public interface StatusPedidoState {
    StatusPedido status();

    boolean permite(StatusPedido proximo);
}
