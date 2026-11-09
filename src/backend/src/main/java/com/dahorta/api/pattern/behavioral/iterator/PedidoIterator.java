package com.dahorta.api.pattern.behavioral.iterator;

import com.dahorta.api.entity.Pedido;

import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;

/** Padrão GoF: Iterator */
public final class PedidoIterator implements Iterator<Pedido> {
    private final List<Pedido> pedidos;
    private int indice;

    PedidoIterator(List<Pedido> pedidos) {
        this.pedidos = List.copyOf(pedidos);
    }

    @Override
    public boolean hasNext() {
        return indice < pedidos.size();
    }

    @Override
    public Pedido next() {
        if (!hasNext()) {
            throw new NoSuchElementException("Não há mais pedidos na coleção.");
        }
        return pedidos.get(indice++);
    }
}
