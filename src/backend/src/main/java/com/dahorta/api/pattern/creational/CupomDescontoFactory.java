package com.dahorta.api.pattern.creational;

import com.dahorta.api.entity.TipoDesconto;
import java.util.Objects;

/** Padrão GoF: Factory Method */
public final class CupomDescontoFactory extends CupomFactory {
    private final TipoDesconto tipo;

    public CupomDescontoFactory(TipoDesconto tipo) {
        Objects.requireNonNull(tipo, "Tipo de desconto é obrigatório.");
        if (tipo == TipoDesconto.FRETE) {
            throw new IllegalArgumentException("Use CupomFreteGratisFactory para cupons de frete.");
        }
        this.tipo = tipo;
    }

    @Override
    protected TipoDesconto tipo() {
        return tipo;
    }
}
