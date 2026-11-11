package com.dahorta.api.repository;

import com.dahorta.api.entity.EnderecoSalvo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnderecoSalvoRepository extends JpaRepository<EnderecoSalvo, Long> {
    List<EnderecoSalvo> findAllByUsuarioIdOrderByIdAsc(Long usuarioId);
    Optional<EnderecoSalvo> findByIdAndUsuarioId(Long id, Long usuarioId);
}
