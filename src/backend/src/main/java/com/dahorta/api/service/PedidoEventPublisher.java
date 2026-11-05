package com.dahorta.api.service;

import com.dahorta.api.dto.PedidoStatusEventoDTO;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class PedidoEventPublisher {

    private final ConcurrentHashMap<Long, Set<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter assinar(Long pedidoId) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);
        Set<SseEmitter> assinantes = emitters.computeIfAbsent(
                pedidoId, ignored -> new CopyOnWriteArraySet<>());
        assinantes.add(emitter);
        emitter.onCompletion(() -> remover(pedidoId, emitter));
        emitter.onTimeout(() -> {
            remover(pedidoId, emitter);
            emitter.complete();
        });
        emitter.onError(ignored -> remover(pedidoId, emitter));
        return emitter;
    }

    public void publicarDepoisDoCommit(PedidoStatusEventoDTO evento) {
        Runnable publicar = () -> publicar(evento);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    publicar.run();
                }
            });
        } else {
            publicar.run();
        }
    }

    public void enviarEstadoInicial(SseEmitter emitter, PedidoStatusEventoDTO evento) {
        enviar(emitter, evento);
    }

    private void publicar(PedidoStatusEventoDTO evento) {
        Set<SseEmitter> assinantes = emitters.get(evento.pedidoId());
        if (assinantes == null) {
            return;
        }
        assinantes.forEach(emitter -> enviar(emitter, evento));
    }

    private void enviar(SseEmitter emitter, PedidoStatusEventoDTO evento) {
        try {
            emitter.send(SseEmitter.event()
                    .name("pedido-status")
                    .id(evento.atualizadoEm().toString())
                    .data(evento));
        } catch (IOException | IllegalStateException exception) {
            emitter.completeWithError(exception);
            removerDeTodos(evento.pedidoId(), emitter);
        }
    }

    private void remover(Long pedidoId, SseEmitter emitter) {
        Set<SseEmitter> assinantes = emitters.get(pedidoId);
        if (assinantes != null) {
            assinantes.remove(emitter);
            if (assinantes.isEmpty()) {
                emitters.remove(pedidoId, assinantes);
            }
        }
    }

    private void removerDeTodos(Long pedidoId, SseEmitter emitter) {
        remover(pedidoId, emitter);
    }
}
