package com.dahorta.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class OptimisticLockVersionInitializer implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(OptimisticLockVersionInitializer.class);

    private final JdbcTemplate jdbcTemplate;

    public OptimisticLockVersionInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        int insumos = jdbcTemplate.update("UPDATE insumos_estoque SET versao = 0 WHERE versao IS NULL");
        int cupons = jdbcTemplate.update("UPDATE cupons SET versao = 0 WHERE versao IS NULL");
        int pedidos = jdbcTemplate.update("UPDATE pedidos SET versao = 0 WHERE versao IS NULL");
        int configuracoes = jdbcTemplate.update(
                "UPDATE configuracao_restaurante SET versao = 0 WHERE versao IS NULL");

        if (insumos + cupons + pedidos + configuracoes > 0) {
            logger.info("Versoes de bloqueio otimista inicializadas: {} insumos, {} cupons, "
                    + "{} pedidos e {} configuracoes.", insumos, cupons, pedidos, configuracoes);
        }
    }
}
