package com.dahorta.api.pattern.behavioral.chain;

/** Padrão GoF: Chain of Responsibility */
public abstract class ValidadorCheckout {
    private ValidadorCheckout proximo;

    public ValidadorCheckout encadear(ValidadorCheckout proximo) {
        this.proximo = proximo;
        return proximo;
    }

    public final void validar(ContextoCheckout contexto) {
        validarEtapa(contexto);
        if (proximo != null) {
            proximo.validar(contexto);
        }
    }

    protected abstract void validarEtapa(ContextoCheckout contexto);
}
