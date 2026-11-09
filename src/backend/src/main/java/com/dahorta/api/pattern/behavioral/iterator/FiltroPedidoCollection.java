package com.dahorta.api.pattern.behavioral.iterator;

import com.dahorta.api.entity.Pedido;

import java.util.List;
import java.util.function.Predicate;

/** Padrão GoF: Iterator */
public final class FiltroPedidoCollection {
    private final List<Pedido> filtrados;

    public FiltroPedidoCollection(List<Pedido> pedidos, Predicate<Pedido> filtro) {
        filtrados = pedidos.stream().filter(filtro).toList();
    }

    public PedidoIterator iterator() {
        return new PedidoIterator(filtrados);
    }
}
