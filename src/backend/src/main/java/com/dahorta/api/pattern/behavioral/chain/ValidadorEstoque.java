package com.dahorta.api.pattern.behavioral.chain;

import java.util.Objects;

/** Padrão GoF: Chain of Responsibility */
public final class ValidadorEstoque extends ValidadorCheckout {
    @Override
    protected void validarEtapa(ContextoCheckout contexto) {
        Objects.requireNonNull(contexto);
        if (contexto.quantidadeDisponivel() == null || contexto.quantidadeNecessaria() == null
                || contexto.quantidadeDisponivel().compareTo(contexto.quantidadeNecessaria()) < 0) {
            throw new IllegalStateException("Estoque insuficiente para finalizar o checkout.");
        }
    }
}
