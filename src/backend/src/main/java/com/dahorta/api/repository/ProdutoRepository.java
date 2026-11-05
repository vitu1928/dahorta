package com.dahorta.api.repository;

import com.dahorta.api.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;
import java.util.Optional;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    @EntityGraph(attributePaths = "ingredientes.insumo")
    List<Produto> findAllByDisponivelTrueOrderByNomeAsc();

    @EntityGraph(attributePaths = "ingredientes.insumo")
    List<Produto> findAllByOrderByNomeAsc();

    @Override
    @EntityGraph(attributePaths = "ingredientes.insumo")
    Optional<Produto> findById(Long id);
}
