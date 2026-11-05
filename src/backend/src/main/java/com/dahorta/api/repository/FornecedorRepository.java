package com.dahorta.api.repository;

import com.dahorta.api.entity.Fornecedor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FornecedorRepository extends JpaRepository<Fornecedor, Long> {
    List<Fornecedor> findAllByAtivoTrueOrderByNomeAsc();
    Optional<Fornecedor> findByEmailIgnoreCase(String email);
}
