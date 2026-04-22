package com.agri.trading.controller;

import com.agri.trading.model.Contract;
import com.agri.trading.model.Transaction;
import com.agri.trading.model.TransactionStatus;
import com.agri.trading.model.PaymentType;
import com.agri.trading.repository.ContractRepository;
import com.agri.trading.repository.TransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final ContractRepository contractRepository;

    public TransactionController(TransactionRepository transactionRepository, ContractRepository contractRepository) {
        this.transactionRepository = transactionRepository;
        this.contractRepository = contractRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllTransactions(
            @RequestParam(required = false) String contractId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) String paymentType) {
        
        List<Transaction> transactions;
        
        if (contractId != null) {
            transactions = transactionRepository.findByContractId(contractId);
        } else {
            transactions = (List<Transaction>) transactionRepository.findAll();
        }
        
        // Filter by status if provided
        if (status != null) {
            transactions = transactions.stream()
                .filter(t -> t.getStatus().name().equals(status))
                .toList();
        }
        
        // Filter by paymentType if provided
        if (paymentType != null) {
            transactions = transactions.stream()
                .filter(t -> t.getPaymentType() != null && t.getPaymentType().name().equals(paymentType))
                .toList();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("transactions", transactions);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable String id) {
        return transactionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<Transaction>> getTransactionsByContract(@PathVariable String contractId) {
        return ResponseEntity.ok(transactionRepository.findByContractId(contractId));
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createTransaction(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String contractId = (String) request.get("contractId");
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String paymentMethod = (String) request.get("paymentMethod");
            String paymentTypeStr = (String) request.get("paymentType");
            
            if (contractId == null || amount == null) {
                response.put("message", "Contract ID and amount are required");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Verify contract exists
            Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));
            
            // Create transaction
            Transaction transaction = new Transaction();
            transaction.setId(UUID.randomUUID().toString());
            transaction.setContract(contract);
            transaction.setAmount(amount);
            transaction.setPaymentType(paymentTypeStr != null ? PaymentType.valueOf(paymentTypeStr) : PaymentType.OTHER);
            
            // Cash payments are automatically completed
            transaction.setStatus("cash".equals(paymentMethod) ? TransactionStatus.COMPLETED : TransactionStatus.PENDING);
            transaction.setNotes(paymentMethod != null ? "Payment method: " + paymentMethod : null);
            transaction.setCreatedAt(Instant.now());
            transaction.setUpdatedAt(Instant.now());
            
            transaction = transactionRepository.save(transaction);
            
            response.put("message", "Transaction created successfully");
            response.put("transaction", transaction);
            
            return ResponseEntity.status(201).body(response);
        } catch (Exception e) {
            response.put("message", "Failed to create transaction: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateTransactionStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String statusStr = request.get("status");
            if (statusStr == null) {
                response.put("message", "Status is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            TransactionStatus newStatus = TransactionStatus.valueOf(statusStr);
            
            Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
            
            transaction.setStatus(newStatus);
            transaction.setUpdatedAt(Instant.now());
            transaction = transactionRepository.save(transaction);
            
            response.put("message", "Transaction status updated");
            response.put("transaction", transaction);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to update transaction: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTransaction(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (!transactionRepository.existsById(id)) {
                response.put("message", "Transaction not found");
                return ResponseEntity.status(404).body(response);
            }
            
            transactionRepository.deleteById(id);
            
            response.put("message", "Transaction deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to delete transaction: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
