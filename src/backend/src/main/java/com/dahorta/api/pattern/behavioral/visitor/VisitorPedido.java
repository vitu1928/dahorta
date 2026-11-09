package com.dahorta.api.pattern.behavioral.visitor;

import com.dahorta.api.entity.Cupom;
import com.dahorta.api.pattern.structural.composite.ComboKitItem;
import com.dahorta.api.pattern.structural.composite.ProdutoItem;

/** Padrão GoF: Visitor */
public interface VisitorPedido {
    void visitar(ProdutoItem item);

    void visitar(ComboKitItem combo);

    void visitar(Cupom cupom);
}
