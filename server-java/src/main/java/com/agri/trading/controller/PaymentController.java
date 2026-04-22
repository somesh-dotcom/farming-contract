package com.agri.trading.controller;

import com.agri.trading.dto.PaymentDTO;
import com.agri.trading.model.Contract;
import com.agri.trading.model.ContractStatus;
import com.agri.trading.model.Payment;
import com.agri.trading.model.PaymentType;
import com.agri.trading.model.Transaction;
import com.agri.trading.model.TransactionStatus;
import com.agri.trading.repository.ContractRepository;
import com.agri.trading.repository.PaymentRepository;
import com.agri.trading.repository.TransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final ContractRepository contractRepository;
    private final TransactionRepository transactionRepository;

    public PaymentController(PaymentRepository paymentRepository, ContractRepository contractRepository, TransactionRepository transactionRepository) {
        this.paymentRepository = paymentRepository;
        this.contractRepository = contractRepository;
        this.transactionRepository = transactionRepository;
    }

    /**
     * Process mock payment - Simulates payment success/failure
     */
    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody PaymentDTO paymentDTO) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate contract exists
            Contract contract = contractRepository.findById(paymentDTO.getContractId())
                .orElseThrow(() -> new RuntimeException("Contract not found"));
            
            // Check if already paid
            if (paymentRepository.existsByContractId(paymentDTO.getContractId())) {
                response.put("success", false);
                response.put("message", "Contract is already paid");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Simulate payment processing
            boolean paymentSuccess = simulatePayment();
            
            if (!paymentSuccess) {
                response.put("success", false);
                response.put("message", "Payment failed - Insufficient funds");
                response.put("errorCode", "PAYMENT_FAILED");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Generate mock payment ID
            String paymentId = "PAY_" + UUID.randomUUID().toString().replace("-", "").substring(0, 15).toUpperCase();
            
            // Save payment record
            Payment payment = new Payment();
            payment.setContractId(paymentDTO.getContractId());
            payment.setPaymentId(paymentId);
            payment.setAmount(paymentDTO.getAmount());
            payment.setStatus("SUCCESS");
            payment.setPaymentMethod("mock_payment");
            payment.setGatewayResponse("{\"simulated\": true, \"status\": \"success\"}");
            
            paymentRepository.save(payment);
            
            // Create Transaction record for the transaction page
            Transaction transaction = new Transaction();
            transaction.setId("TXN_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase());
            
            // Load contract and set it
            transaction.setContract(contract);
            transaction.setAmount(paymentDTO.getAmount());
            transaction.setPaymentType(PaymentType.FINAL);
            transaction.setStatus(TransactionStatus.COMPLETED);
            transaction.setNotes("Payment processed via mock payment gateway. Payment ID: " + paymentId);
            
            transactionRepository.save(transaction);
            
            // Update contract status to ACTIVE (paid)
            contract.setStatus(ContractStatus.ACTIVE);
            contractRepository.save(contract);
            
            response.put("success", true);
            response.put("message", "Payment successful");
            response.put("paymentId", paymentId);
            response.put("amount", paymentDTO.getAmount());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Simulate payment - 80% success rate for testing
     */
    private boolean simulatePayment() {
        // Simulate 80% success rate
        return Math.random() < 0.8;
    }

    /**
     * Get payment details for a contract
     */
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<Map<String, Object>> getPaymentByContractId(@PathVariable String contractId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Payment> payments = paymentRepository.findByContractId(contractId);
            
            response.put("success", true);
            response.put("payments", payments);
            response.put("count", payments.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
