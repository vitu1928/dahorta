package com.dahorta.api.pattern.behavioral.memento;

import com.dahorta.api.entity.StatusPedido;
import com.dahorta.api.entity.Usuario;

import java.time.Instant;

/** Padrão GoF: Memento */
public record PedidoMemento(StatusPedido status, Instant atualizadoEm, Usuario motoboy) {
}
