package com.dahorta.api.pattern.behavioral.observer;

import com.dahorta.api.dto.PedidoStatusEventoDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** Padrão GoF: Observer */
@Component
public final class PedidoStatusLogObserver implements PedidoObserver {
    private static final Logger LOGGER = LoggerFactory.getLogger(PedidoStatusLogObserver.class);

    @Override
    public void aoAlterarStatus(PedidoStatusEventoDTO evento) {
        LOGGER.info("Pedido {} alterado para {}", evento.pedidoId(), evento.status());
    }
}
