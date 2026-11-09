package com.dahorta.api.pattern.creational.notification;

/** Padrão GoF: Abstract Factory */
@FunctionalInterface
public interface Notificador {
    void enviar(String mensagem);
}
