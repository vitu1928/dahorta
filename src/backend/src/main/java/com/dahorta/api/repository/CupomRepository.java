package com.dahorta.api.repository;

import com.dahorta.api.entity.Cupom;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CupomRepository extends JpaRepository<Cupom, Long> {
    Optional<Cupom> findByCodigoIgnoreCase(String codigo);
    List<Cupom> findAllByOrderByCodigoAsc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Cupom c where upper(c.codigo) = upper(:codigo)")
    Optional<Cupom> findForUpdateByCodigo(@Param("codigo") String codigo);
}
