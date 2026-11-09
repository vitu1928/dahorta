package com.dahorta.api.pattern.behavioral.template;

import java.util.Objects;

/** Padrão GoF: Template Method */
public abstract class ProcessadorCheckoutTemplate<C, R> {
    public final R processar(C contexto) {
        C validado = validar(Objects.requireNonNull(contexto));
        C calculado = calcular(validado);
        R resultado = efetivar(calculado);
        notificar(calculado, resultado);
        return resultado;
    }

    protected abstract C validar(C contexto);

    protected abstract C calcular(C contexto);

    protected abstract R efetivar(C contexto);

    protected abstract void notificar(C contexto, R resultado);
}
