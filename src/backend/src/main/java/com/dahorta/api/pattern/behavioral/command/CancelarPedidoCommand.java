package com.dahorta.api.pattern.behavioral.command;

import com.dahorta.api.entity.Pedido;
import com.dahorta.api.entity.StatusPedido;
import com.dahorta.api.pattern.behavioral.memento.PedidoMemento;

import java.time.Instant;
import java.util.Objects;

/** Padrão GoF: Command */
public final class CancelarPedidoCommand implements Command {
    private final Pedido pedido;
    private PedidoMemento memento;

    public CancelarPedidoCommand(Pedido pedido) {
        this.pedido = Objects.requireNonNull(pedido);
    }

    @Override
    public void executar() {
        memento = pedido.criarMemento();
        pedido.atualizarStatus(StatusPedido.CANCELADO, Instant.now());
    }

    @Override
    public void desfazer() {
        if (memento == null) {
            throw new IllegalStateException("O comando ainda não foi executado.");
        }
        pedido.restaurar(memento);
    }
}
