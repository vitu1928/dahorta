package com.dahorta.api.pattern.structural.composite;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import com.dahorta.api.pattern.behavioral.visitor.VisitorPedido;

/** Padrão GoF: Composite */
public final class ComboKitItem implements ItemEstrutura {
    private final String nome;
    private final List<ItemEstrutura> itens = new ArrayList<>();

    public ComboKitItem(String nome, List<ItemEstrutura> itens) {
        this.nome = Objects.requireNonNull(nome);
        if (itens == null || itens.isEmpty()) {
            throw new IllegalArgumentException("Um combo deve conter ao menos um item.");
        }
        this.itens.addAll(itens);
    }

    public void adicionar(ItemEstrutura item) {
        itens.add(Objects.requireNonNull(item));
    }

    public List<ItemEstrutura> itens() {
        return List.copyOf(itens);
    }

    @Override
    public BigDecimal valorTotal() {
        return itens.stream().map(ItemEstrutura::valorTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public String descricao() {
        return nome + " [" + itens.stream().map(ItemEstrutura::descricao)
                .reduce((a, b) -> a + ", " + b).orElse("") + "]";
    }

    @Override
    public void aceitar(VisitorPedido visitor) {
        visitor.visitar(this);
    }
}
