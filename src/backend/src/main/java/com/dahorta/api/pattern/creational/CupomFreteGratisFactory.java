package com.dahorta.api.pattern.creational;

import com.dahorta.api.entity.TipoDesconto;

/** Padrão GoF: Factory Method */
public final class CupomFreteGratisFactory extends CupomFactory {
    @Override
    protected TipoDesconto tipo() {
        return TipoDesconto.FRETE;
    }
}
