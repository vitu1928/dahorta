package com.dahorta.api.pattern.behavioral.interpreter;

/** Padrão GoF: Interpreter */
@FunctionalInterface
public interface ExpressaoRegra {
    boolean interpretar(ContextoRegraCupom contexto);
}
