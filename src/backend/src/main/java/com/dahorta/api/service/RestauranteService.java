package com.dahorta.api.service;

import com.dahorta.api.dto.AtualizarLojaRequestDTO;
import com.dahorta.api.repository.ConfiguracaoRestauranteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RestauranteService {

    private final ConfiguracaoRestauranteRepository repository;

    public RestauranteService(ConfiguracaoRestauranteRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public boolean estaAberto() {
        return repository.findById(1L).map(configuracao -> configuracao.isAberto()).orElse(true);
    }

    @Transactional
    public boolean atualizar(AtualizarLojaRequestDTO request) {
        var configuracao = repository.findForUpdateById(1L)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE, "Configuração do restaurante não inicializada."));
        configuracao.definirAberto(request.aberto());
        return configuracao.isAberto();
    }
}
