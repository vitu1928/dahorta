package com.dahorta.api.pattern.behavioral.chain;

/** Padrão GoF: Chain of Responsibility */
public final class ValidadorCredito extends ValidadorCheckout {
    @Override
    protected void validarEtapa(ContextoCheckout contexto) {
        if (contexto.total() == null || contexto.creditoDisponivel() == null
                || contexto.creditoDisponivel().compareTo(contexto.total()) < 0) {
            throw new IllegalStateException("Crédito insuficiente para finalizar o checkout.");
        }
    }
}
