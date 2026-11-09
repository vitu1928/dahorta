package com.dahorta.api.pattern.structural.proxy;

import com.dahorta.api.entity.Pedido;
import com.dahorta.api.repository.PedidoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Objects;
import java.util.Optional;

/** Padrão GoF: Proxy */
public final class PedidoRepositoryProxy {
    private static final Logger LOGGER = LoggerFactory.getLogger(PedidoRepositoryProxy.class);
    private final PedidoRepository repositorio;

    public PedidoRepositoryProxy(PedidoRepository repositorio) {
        this.repositorio = Objects.requireNonNull(repositorio);
    }

    public Optional<Pedido> buscar(Long id) {
        Objects.requireNonNull(id, "Id do pedido é obrigatório.");
        LOGGER.debug("Consulta controlada do pedido {}", id);
        return repositorio.findById(id);
    }

    public Pedido salvar(Pedido pedido) {
        Objects.requireNonNull(pedido, "Pedido é obrigatório.");
        LOGGER.debug("Persistência controlada do pedido {}", pedido.getId());
        return repositorio.save(pedido);
    }
}
