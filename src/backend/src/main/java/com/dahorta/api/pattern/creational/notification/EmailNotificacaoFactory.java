package com.dahorta.api.pattern.creational.notification;

import java.util.Objects;
import java.util.function.Consumer;

/** Padrão GoF: Abstract Factory */
public final class EmailNotificacaoFactory implements NotificacaoAbstractFactory {
    private final Consumer<String> entregador;

    public EmailNotificacaoFactory(Consumer<String> entregador) {
        this.entregador = Objects.requireNonNull(entregador);
    }

    @Override
    public Notificador criarNotificador() {
        return entregador::accept;
    }

    @Override
    public FormatoMensagem criarFormatoMensagem() {
        return (titulo, conteudo) -> titulo + System.lineSeparator() + conteudo;
    }
}
