package com.dahorta.api.pattern.creational.notification;

import java.util.Objects;
import java.util.function.Consumer;

/** Padrão GoF: Abstract Factory */
public final class SseNotificacaoFactory implements NotificacaoAbstractFactory {
    private final Consumer<String> publicador;

    public SseNotificacaoFactory(Consumer<String> publicador) {
        this.publicador = Objects.requireNonNull(publicador);
    }

    @Override
    public Notificador criarNotificador() {
        return publicador::accept;
    }

    @Override
    public FormatoMensagem criarFormatoMensagem() {
        return (titulo, conteudo) -> "event: " + titulo + "\ndata: " + conteudo + "\n\n";
    }
}
