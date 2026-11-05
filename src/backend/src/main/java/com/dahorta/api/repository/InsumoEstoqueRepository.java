package com.dahorta.api.repository;

import com.dahorta.api.entity.InsumoEstoque;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InsumoEstoqueRepository extends JpaRepository<InsumoEstoque, Long> {
    List<InsumoEstoque> findAllByAtivoTrueOrderByNomeAsc();

    @Query("select i from InsumoEstoque i where i.ativo = true "
            + "and i.quantidadeAtual <= i.quantidadeMinima order by i.nome asc")
    List<InsumoEstoque> findAllAtOrBelowMinimum();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from InsumoEstoque i where i.id = :id")
    Optional<InsumoEstoque> findForUpdateById(@Param("id") Long id);
}
