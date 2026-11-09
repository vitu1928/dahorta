package com.dahorta.api.pattern.structural.decorator;

import com.dahorta.api.pattern.creational.notification.Notificador;

import java.util.Objects;

/** Padrão GoF: Decorator */
public abstract class NotificadorDecorator implements Notificador {
    protected final Notificador decorado;

    protected NotificadorDecorator(Notificador decorado) {
        this.decorado = Objects.requireNonNull(decorado);
    }
}
