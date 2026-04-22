package com.agri.trading.repository;

import com.agri.trading.model.Payment;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends CrudRepository<Payment, Long> {
    List<Payment> findByContractId(String contractId);
    Optional<Payment> findByPaymentId(String paymentId);
    boolean existsByContractId(String contractId);
}
