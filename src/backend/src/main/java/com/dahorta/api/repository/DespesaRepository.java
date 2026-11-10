package com.dahorta.api.repository;

import com.dahorta.api.entity.Despesa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DespesaRepository extends JpaRepository<Despesa, Long> {
    List<Despesa> findAllByOrderByDataDesc();
}
