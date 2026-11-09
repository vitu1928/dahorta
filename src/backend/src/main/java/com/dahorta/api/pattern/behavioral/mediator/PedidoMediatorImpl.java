package com.dahorta.api.pattern.behavioral.mediator;

import java.util.Objects;
import java.util.function.Consumer;

/** Padrão GoF: Mediator */
public final class PedidoMediatorImpl implements PedidoMediator {
    private final Consumer<Long> atualizarEstoque;
    private final Consumer<Long> atualizarEntrega;
    private final Consumer<Long> notificar;

    public PedidoMediatorImpl(Consumer<Long> atualizarEstoque,
                              Consumer<Long> atualizarEntrega,
                              Consumer<Long> notificar) {
        this.atualizarEstoque = Objects.requireNonNull(atualizarEstoque);
        this.atualizarEntrega = Objects.requireNonNull(atualizarEntrega);
        this.notificar = Objects.requireNonNull(notificar);
    }

    @Override
    public void pedidoAtualizado(Long pedidoId) {
        Objects.requireNonNull(pedidoId);
        atualizarEstoque.accept(pedidoId);
        atualizarEntrega.accept(pedidoId);
        notificar.accept(pedidoId);
    }
}
