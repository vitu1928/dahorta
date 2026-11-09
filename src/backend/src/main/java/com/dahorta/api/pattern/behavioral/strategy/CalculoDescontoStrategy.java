package com.dahorta.api.pattern.behavioral.strategy;

import com.dahorta.api.entity.Cupom;
import com.dahorta.api.entity.TipoDesconto;

import java.math.BigDecimal;

/** Padrão GoF: Strategy */
public interface CalculoDescontoStrategy {
    TipoDesconto tipo();

    BigDecimal calcular(Cupom cupom, BigDecimal subtotal, BigDecimal taxaEntrega);
}
