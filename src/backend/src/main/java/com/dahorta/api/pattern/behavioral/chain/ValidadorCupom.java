package com.dahorta.api.pattern.behavioral.chain;

/** Padrão GoF: Chain of Responsibility */
public final class ValidadorCupom extends ValidadorCheckout {
    @Override
    protected void validarEtapa(ContextoCheckout contexto) {
        if (!contexto.cupomValido()) {
            throw new IllegalStateException("Cupom inválido para o checkout.");
        }
    }
}
