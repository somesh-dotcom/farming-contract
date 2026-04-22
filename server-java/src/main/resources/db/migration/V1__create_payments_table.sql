-- Payment Gateway Integration
-- Creates payments table to track all payment transactions

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id VARCHAR(255) NOT NULL,
    payment_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50),
    gateway_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_contract_id (contract_id),
    INDEX idx_payment_id (payment_id),
    INDEX idx_status (status)
);

-- Optional: Add index for faster lookups
CREATE INDEX idx_contract_payment ON payments(contract_id, status);
