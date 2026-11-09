package com.dahorta.api.pattern.creational;

import com.dahorta.api.entity.TipoDesconto;

import java.util.Map;

/** Padrão GoF: Factory Method */
public final class CupomFactories {
    private static final Map<TipoDesconto, CupomFactory> FACTORIES = Map.of(
            TipoDesconto.PERCENTUAL, new CupomDescontoFactory(TipoDesconto.PERCENTUAL),
            TipoDesconto.FIXO, new CupomDescontoFactory(TipoDesconto.FIXO),
            TipoDesconto.FRETE, new CupomFreteGratisFactory());

    private CupomFactories() {
    }

    public static CupomFactory para(TipoDesconto tipo) {
        CupomFactory factory = FACTORIES.get(tipo);
        if (factory == null) {
            throw new IllegalArgumentException("Tipo de desconto sem factory: " + tipo);
        }
        return factory;
    }
}
