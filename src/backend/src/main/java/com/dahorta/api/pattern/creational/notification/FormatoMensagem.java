package com.dahorta.api.pattern.creational.notification;

/** Padrão GoF: Abstract Factory */
@FunctionalInterface
public interface FormatoMensagem {
    String formatar(String titulo, String conteudo);
}
