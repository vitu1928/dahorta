package com.dahorta.api.pattern.structural.decorator;

import com.dahorta.api.pattern.creational.notification.Notificador;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Padrão GoF: Decorator */
public final class NotificadorComAuditoria extends NotificadorDecorator {
    private static final Logger LOGGER = LoggerFactory.getLogger(NotificadorComAuditoria.class);

    public NotificadorComAuditoria(Notificador decorado) {
        super(decorado);
    }

    @Override
    public void enviar(String mensagem) {
        decorado.enviar(mensagem);
        LOGGER.info("Notificação processada para auditoria.");
    }
}
