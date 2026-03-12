package com.agri.trading.controller;

import com.agri.trading.model.Contract;
import com.agri.trading.repository.ContractRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin(origins = "*")
public class ContractController {

    private final ContractRepository contractRepository;

    public ContractController(ContractRepository contractRepository) {
        this.contractRepository = contractRepository;
    }

    @GetMapping
    public ResponseEntity<List<Contract>> getAllContracts() {
        return ResponseEntity.ok((List<Contract>) contractRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contract> getContractById(@PathVariable String id) {
        return contractRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<Contract>> getContractsByFarmer(@PathVariable String farmerId) {
        return ResponseEntity.ok(contractRepository.findByFarmerId(farmerId));
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<List<Contract>> getContractsByBuyer(@PathVariable String buyerId) {
        return ResponseEntity.ok(contractRepository.findByBuyerId(buyerId));
    }
}
