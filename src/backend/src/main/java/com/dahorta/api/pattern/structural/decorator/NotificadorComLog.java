package com.dahorta.api.pattern.structural.decorator;

import com.dahorta.api.pattern.creational.notification.Notificador;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Padrão GoF: Decorator */
public final class NotificadorComLog extends NotificadorDecorator {
    private static final Logger LOGGER = LoggerFactory.getLogger(NotificadorComLog.class);

    public NotificadorComLog(Notificador decorado) {
        super(decorado);
    }

    @Override
    public void enviar(String mensagem) {
        LOGGER.info("Enviando notificação: {}", mensagem);
        decorado.enviar(mensagem);
    }
}
