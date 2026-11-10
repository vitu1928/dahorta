package com.dahorta.api.repository;

import com.dahorta.api.entity.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    List<Avaliacao> findAllByOrderByCriadoEmDesc();
    Optional<Avaliacao> findByPedidoId(Long pedidoId);
}
