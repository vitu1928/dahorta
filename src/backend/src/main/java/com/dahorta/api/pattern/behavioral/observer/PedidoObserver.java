package com.dahorta.api.pattern.behavioral.observer;

import com.dahorta.api.dto.PedidoStatusEventoDTO;

/** Padrão GoF: Observer */
@FunctionalInterface
public interface PedidoObserver {
    void aoAlterarStatus(PedidoStatusEventoDTO evento);
}
