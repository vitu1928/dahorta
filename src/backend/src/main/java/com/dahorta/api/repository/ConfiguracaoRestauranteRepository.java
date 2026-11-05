package com.dahorta.api.repository;

import com.dahorta.api.entity.ConfiguracaoRestaurante;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ConfiguracaoRestauranteRepository extends JpaRepository<ConfiguracaoRestaurante, Long> {
    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("select c from ConfiguracaoRestaurante c where c.id = :id")
    Optional<ConfiguracaoRestaurante> findForReadById(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from ConfiguracaoRestaurante c where c.id = :id")
    Optional<ConfiguracaoRestaurante> findForUpdateById(@Param("id") Long id);
}
