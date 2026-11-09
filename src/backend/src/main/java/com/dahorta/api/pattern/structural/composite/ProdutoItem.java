package com.dahorta.api.pattern.structural.composite;

import java.math.BigDecimal;
import java.util.Objects;
import com.dahorta.api.pattern.behavioral.visitor.VisitorPedido;

/** Padrão GoF: Composite */
public record ProdutoItem(String nome, BigDecimal precoUnitario, int quantidade) implements ItemEstrutura {
    public ProdutoItem {
        Objects.requireNonNull(nome);
        Objects.requireNonNull(precoUnitario);
        if (precoUnitario.signum() < 0 || quantidade <= 0) {
            throw new IllegalArgumentException("Preço não negativo e quantidade positiva são obrigatórios.");
        }
    }

    @Override
    public BigDecimal valorTotal() {
        return precoUnitario.multiply(BigDecimal.valueOf(quantidade));
    }

    @Override
    public String descricao() {
        return quantidade + "x " + nome;
    }

    @Override
    public void aceitar(VisitorPedido visitor) {
        visitor.visitar(this);
    }
}
