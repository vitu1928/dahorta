package com.dahorta.api.pattern.behavioral.strategy;

import com.dahorta.api.entity.Cupom;
import com.dahorta.api.entity.TipoDesconto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/** Padrão GoF: Strategy */
@Component
public final class DescontoFreteStrategy implements CalculoDescontoStrategy {
    @Override
    public TipoDesconto tipo() {
        return TipoDesconto.FRETE;
    }

    @Override
    public BigDecimal calcular(Cupom cupom, BigDecimal subtotal, BigDecimal taxaEntrega) {
        return taxaEntrega;
    }
}
