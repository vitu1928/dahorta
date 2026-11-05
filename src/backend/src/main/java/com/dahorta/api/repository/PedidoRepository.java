package com.dahorta.api.repository;

import com.dahorta.api.entity.Pedido;
import com.dahorta.api.entity.StatusPedido;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @Override
    @EntityGraph(attributePaths = {"cliente", "motoboy", "itens", "cupom"})
    List<Pedido> findAll();

    @EntityGraph(attributePaths = {"cliente", "motoboy", "itens", "cupom"})
    List<Pedido> findAllByClienteIdOrderByCriadoEmDesc(Long clienteId);

    @EntityGraph(attributePaths = {"cliente", "motoboy", "itens", "cupom"})
    List<Pedido> findAllByStatusOrderByCriadoEmAsc(StatusPedido status);

    @EntityGraph(attributePaths = {"cliente", "motoboy", "itens", "cupom"})
    List<Pedido> findAllByStatusInOrderByCriadoEmAsc(List<StatusPedido> statuses);

    @EntityGraph(attributePaths = {"cliente", "motoboy", "itens", "cupom"})
    List<Pedido> findAllByMotoboyIdOrderByCriadoEmDesc(Long motoboyId);

    @EntityGraph(attributePaths = {"cliente", "motoboy", "itens", "cupom"})
    List<Pedido> findAllByMotoboyIdAndStatusOrderByCriadoEmDesc(Long motoboyId, StatusPedido status);

    @Override
    @EntityGraph(attributePaths = {"cliente", "motoboy", "itens", "cupom"})
    Optional<Pedido> findById(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"cliente", "motoboy", "itens", "cupom"})
    @Query("select p from Pedido p where p.id = :id")
    Optional<Pedido> findForUpdateById(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Pedido p where p.motoboy.id = :motoboyId and p.status = :status")
    List<Pedido> findAllForUpdateByMotoboyAndStatus(
            @Param("motoboyId") Long motoboyId,
            @Param("status") StatusPedido status);
}
