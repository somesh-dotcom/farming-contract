package com.agri.trading.repository;

import com.agri.trading.model.Contract;
import com.agri.trading.model.ContractStatus;
import com.agri.trading.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, String> {
    List<Contract> findByFarmer(User farmer);
    List<Contract> findByBuyer(User buyer);
    List<Contract> findByStatus(ContractStatus status);
    List<Contract> findByFarmerId(String farmerId);
    List<Contract> findByBuyerId(String buyerId);
}
