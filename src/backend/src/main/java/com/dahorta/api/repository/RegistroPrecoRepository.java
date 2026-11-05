package com.dahorta.api.repository;

import com.dahorta.api.entity.RegistroPreco;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistroPrecoRepository extends JpaRepository<RegistroPreco, Long> {
    List<RegistroPreco> findAllByOrderByDataDesc();
}
