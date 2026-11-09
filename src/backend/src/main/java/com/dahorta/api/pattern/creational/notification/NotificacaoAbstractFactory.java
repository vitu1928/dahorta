package com.dahorta.api.pattern.creational.notification;

/** Padrão GoF: Abstract Factory */
public interface NotificacaoAbstractFactory {
    Notificador criarNotificador();

    FormatoMensagem criarFormatoMensagem();
}
