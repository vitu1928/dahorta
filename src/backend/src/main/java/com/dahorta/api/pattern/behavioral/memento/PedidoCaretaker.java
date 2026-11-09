package com.dahorta.api.pattern.behavioral.memento;

import com.dahorta.api.entity.Pedido;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/** Padrão GoF: Memento */
public final class PedidoCaretaker {
    private final Map<Long, Deque<PedidoMemento>> historico = new HashMap<>();

    public synchronized void salvar(Pedido pedido) {
        Objects.requireNonNull(pedido);
        if (pedido.getId() == null) {
            throw new IllegalArgumentException("O pedido precisa estar persistido para registrar histórico.");
        }
        historico.computeIfAbsent(pedido.getId(), ignorado -> new ArrayDeque<>())
                .push(pedido.criarMemento());
    }

    public synchronized boolean restaurarAnterior(Pedido pedido) {
        Objects.requireNonNull(pedido);
        if (pedido.getId() == null) {
            throw new IllegalArgumentException("O pedido precisa estar persistido para restaurar histórico.");
        }
        Deque<PedidoMemento> mementos = historico.get(pedido.getId());
        if (mementos == null || mementos.isEmpty()) {
            return false;
        }
        pedido.restaurar(mementos.pop());
        if (mementos.isEmpty()) {
            historico.remove(pedido.getId());
        }
        return true;
    }
}
