package com.dahorta.api.service;

import com.dahorta.api.entity.ConfiguracaoRestaurante;
import com.dahorta.api.repository.ConfiguracaoRestauranteRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class ConfiguracaoRestauranteInitializer implements ApplicationRunner {

    private final ConfiguracaoRestauranteRepository repository;

    public ConfiguracaoRestauranteInitializer(ConfiguracaoRestauranteRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!repository.existsById(1L)) {
            repository.save(new ConfiguracaoRestaurante(1L, true));
        }
    }
}
