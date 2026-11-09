package com.dahorta.api.service;

import com.dahorta.api.dto.CriarPedidoRequestDTO;
import com.dahorta.api.dto.PedidoResponseDTO;
import com.dahorta.api.dto.PedidoStatusEventoDTO;
import com.dahorta.api.pattern.behavioral.template.ProcessadorCheckoutTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Objects;

/** Padrão GoF: Facade, Template Method */
@Service
public class CheckoutFacade extends ProcessadorCheckoutTemplate<CheckoutFacade.Entrada, PedidoResponseDTO> {
    private final PedidoService pedidoService;
    private final PedidoEventPublisher pedidoEventPublisher;

    public CheckoutFacade(PedidoService pedidoService, PedidoEventPublisher pedidoEventPublisher) {
        this.pedidoService = Objects.requireNonNull(pedidoService);
        this.pedidoEventPublisher = Objects.requireNonNull(pedidoEventPublisher);
    }

    public PedidoResponseDTO finalizarCompra(CriarPedidoRequestDTO request, Authentication authentication) {
        return processar(new Entrada(request, authentication));
    }

    @Override
    protected Entrada validar(Entrada entrada) {
        Objects.requireNonNull(entrada.request(), "Pedido é obrigatório.");
        Objects.requireNonNull(entrada.authentication(), "Autenticação é obrigatória.");
        if (entrada.request().itens() == null || entrada.request().itens().isEmpty()) {
            throw new IllegalArgumentException("Pedido deve conter ao menos um item.");
        }
        return entrada;
    }

    @Override
    protected Entrada calcular(Entrada entrada) {
        // Preços e estoque são calculados sob lock na transação do PedidoService.
        return entrada;
    }

    @Override
    protected PedidoResponseDTO efetivar(Entrada entrada) {
        return pedidoService.criar(entrada.request(), entrada.authentication());
    }

    @Override
    protected void notificar(Entrada entrada, PedidoResponseDTO pedido) {
        pedidoEventPublisher.publicarDepoisDoCommit(new PedidoStatusEventoDTO(
                pedido.id(), pedido.status(), pedido.motoboyId(), pedido.motoboyNome(), pedido.atualizadoEm()));
    }

    /** Padrão GoF: Facade, Template Method */
    record Entrada(CriarPedidoRequestDTO request, Authentication authentication) {
    }
}
