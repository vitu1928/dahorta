package com.dahorta.api.pattern.behavioral.command;

/** Padrão GoF: Command */
public interface Command {
    void executar();

    void desfazer();
}
