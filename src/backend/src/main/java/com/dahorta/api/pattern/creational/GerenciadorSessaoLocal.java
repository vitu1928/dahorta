package com.dahorta.api.pattern.creational;

import java.security.SecureRandom;
import java.util.Locale;

/** Padrão GoF: Singleton */
public enum GerenciadorSessaoLocal {
    INSTANCIA;

    private final SecureRandom aleatorio = new SecureRandom();

    public String gerarCodigoEntrega() {
        return String.format(Locale.ROOT, "%06d", aleatorio.nextInt(1_000_000));
    }
}
