package com.dahorta.api.pattern.behavioral.chain;

import java.math.BigDecimal;

/** Padrão GoF: Chain of Responsibility */
public record ContextoCheckout(
        BigDecimal quantidadeNecessaria,
        BigDecimal quantidadeDisponivel,
        boolean cupomValido,
        BigDecimal total,
        BigDecimal creditoDisponivel) {
}
