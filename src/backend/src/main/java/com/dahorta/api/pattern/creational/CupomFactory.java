package com.dahorta.api.pattern.creational;

import com.dahorta.api.entity.Cupom;
import java.math.BigDecimal;
import java.time.Instant;

/** Padrão GoF: Factory Method */
public abstract class CupomFactory {
    public final Cupom criar(String codigo, BigDecimal valor, BigDecimal valorMinimo,
                             Integer limiteUsos, Instant expiraEm, boolean ativo) {
        return new Cupom(codigo, tipo(), valor, valorMinimo, limiteUsos, expiraEm, ativo);
    }

    protected abstract com.dahorta.api.entity.TipoDesconto tipo();
}
