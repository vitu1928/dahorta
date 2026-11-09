package com.dahorta.api.pattern.behavioral.strategy;

import com.dahorta.api.entity.Cupom;
import com.dahorta.api.entity.TipoDesconto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Padrão GoF: Strategy */
@Component
public final class DescontoPercentualStrategy implements CalculoDescontoStrategy {
    @Override
    public TipoDesconto tipo() {
        return TipoDesconto.PERCENTUAL;
    }

    @Override
    public BigDecimal calcular(Cupom cupom, BigDecimal subtotal, BigDecimal taxaEntrega) {
        if (cupom.getValor().compareTo(new BigDecimal("100")) > 0) {
            throw new IllegalArgumentException("Cupom percentual inválido.");
        }
        return subtotal.multiply(cupom.getValor()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
    }
}
