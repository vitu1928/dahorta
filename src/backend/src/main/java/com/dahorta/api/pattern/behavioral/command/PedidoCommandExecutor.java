package com.dahorta.api.pattern.behavioral.command;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Objects;

/** Padrão GoF: Command */
public final class PedidoCommandExecutor {
    private final Deque<Command> fila = new ArrayDeque<>();
    private final Deque<Command> executados = new ArrayDeque<>();

    public void enfileirar(Command command) {
        fila.addLast(Objects.requireNonNull(command));
    }

    public boolean executarProximo() {
        Command command = fila.peekFirst();
        if (command == null) {
            return false;
        }
        command.executar();
        fila.removeFirst();
        executados.push(command);
        return true;
    }

    public boolean desfazerUltimo() {
        Command command = executados.peekFirst();
        if (command == null) {
            return false;
        }
        command.desfazer();
        executados.removeFirst();
        return true;
    }
}
