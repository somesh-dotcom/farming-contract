package com.agri.trading.repository;

import com.agri.trading.model.Transaction;
import com.agri.trading.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByContract(Contract contract);
    List<Transaction> findByContractId(String contractId);
}
