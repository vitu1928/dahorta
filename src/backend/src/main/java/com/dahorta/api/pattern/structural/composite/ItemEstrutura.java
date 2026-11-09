package com.dahorta.api.pattern.structural.composite;

import java.math.BigDecimal;
import com.dahorta.api.pattern.behavioral.visitor.VisitorPedido;

/** Padrão GoF: Composite */
public interface ItemEstrutura {
    BigDecimal valorTotal();

    String descricao();

    void aceitar(VisitorPedido visitor);
}
