package com.dahorta.api.repository;

import com.dahorta.api.entity.MovimentacaoEstoque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;

public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, Long> {
    @EntityGraph(attributePaths = {"insumo", "usuario", "pedido"})
    List<MovimentacaoEstoque> findAllByOrderByCriadoEmDesc();
}
