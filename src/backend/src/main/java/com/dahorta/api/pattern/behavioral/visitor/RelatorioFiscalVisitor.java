package com.dahorta.api.pattern.behavioral.visitor;

import com.dahorta.api.entity.Cupom;
import com.dahorta.api.pattern.structural.composite.ComboKitItem;
import com.dahorta.api.pattern.structural.composite.ProdutoItem;

/** Padrão GoF: Visitor */
public final class RelatorioFiscalVisitor implements VisitorPedido {
    private final StringBuilder relatorio = new StringBuilder();

    @Override
    public void visitar(ProdutoItem item) {
        relatorio.append(item.descricao()).append(" | ").append(item.valorTotal()).append('\n');
    }

    @Override
    public void visitar(ComboKitItem combo) {
        relatorio.append(combo.descricao()).append(" | ").append(combo.valorTotal()).append('\n');
        combo.itens().forEach(item -> item.aceitar(this));
    }

    @Override
    public void visitar(Cupom cupom) {
        relatorio.append("Cupom ").append(cupom.getCodigo()).append(" | ")
                .append(cupom.getTipo()).append(" | ").append(cupom.getValor()).append('\n');
    }

    public String resultado() {
        return relatorio.toString();
    }
}
