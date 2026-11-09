package com.dahorta.api.controller;

import com.dahorta.api.dto.AtualizarStatusPedidoRequestDTO;
import com.dahorta.api.dto.ConfirmarEntregaRequestDTO;
import com.dahorta.api.dto.CriarPedidoRequestDTO;
import com.dahorta.api.dto.PedidoResponseDTO;
import com.dahorta.api.service.CheckoutFacade;
import com.dahorta.api.service.PedidoEventPublisher;
import com.dahorta.api.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/** Padrão GoF: Facade */
@RestController
@RequestMapping("/api/v1/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;
    private final CheckoutFacade checkoutFacade;
    private final PedidoEventPublisher pedidoEventPublisher;

    public PedidoController(PedidoService pedidoService, CheckoutFacade checkoutFacade,
                            PedidoEventPublisher pedidoEventPublisher) {
        this.pedidoService = pedidoService;
        this.checkoutFacade = checkoutFacade;
        this.pedidoEventPublisher = pedidoEventPublisher;
    }

    @PostMapping
    public ResponseEntity<PedidoResponseDTO> criar(
            @Valid @RequestBody CriarPedidoRequestDTO request,
            Authentication authentication) {
        PedidoResponseDTO response = checkoutFacade.finalizarCompra(request, authentication);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    public List<PedidoResponseDTO> listar(Authentication authentication) {
        return pedidoService.listar(authentication);
    }

    @GetMapping("/{id}")
    public PedidoResponseDTO buscar(@PathVariable Long id, Authentication authentication) {
        return pedidoService.buscar(id, authentication);
    }

    @GetMapping(path = "/{id}/eventos", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter acompanharEventos(@PathVariable Long id, Authentication authentication) {
        pedidoService.estadoParaEventos(id, authentication);
        SseEmitter emitter = pedidoEventPublisher.assinar(id);
        try {
            var estadoAtual = pedidoService.estadoParaEventos(id, authentication);
            pedidoEventPublisher.enviarEstadoInicial(emitter, estadoAtual);
            return emitter;
        } catch (RuntimeException exception) {
            emitter.completeWithError(exception);
            throw exception;
        }
    }

    @PatchMapping("/{id}/status")
    public PedidoResponseDTO atualizarStatus(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarStatusPedidoRequestDTO request,
            Authentication authentication) {
        return pedidoService.atualizarStatus(id, request, authentication);
    }

    @PostMapping("/{id}/entrega/confirmacao")
    public ResponseEntity<Void> confirmarEntrega(
            @PathVariable Long id,
            @Valid @RequestBody ConfirmarEntregaRequestDTO request,
            Authentication authentication) {
        pedidoService.confirmarEntrega(id, request.codigo(), authentication);
        return ResponseEntity.noContent().build();
    }
}
