# Payment Gateway - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Database Setup

Run this SQL command to create the payments table:

```sql
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id VARCHAR(255) NOT NULL,
    payment_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50),
    gateway_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**OR** if using Hibernate auto-DDL, the table will be created automatically when the backend starts.

---

### Step 2: Start Backend

```bash
cd server-java
mvn spring-boot:run
```

The payment endpoints will be available at:
- `http://localhost:5004/api/payments/initiate`
- `http://localhost:5004/api/payments/verify`
- `http://localhost:5004/api/payments/contract/{contractId}`

---

### Step 3: Start Frontend

```bash
cd client
npm run dev
```

Navigate to a contract with **ACTIVE** status and you'll see the **"Pay Now"** button!

---

## 🎯 Test the Payment System

### Test Success Flow:
1. Go to any contract with status = "ACTIVE"
2. Click **"Pay Now - ₹{amount}"** button
3. Click **"Pay Now"** in the modal
4. Wait 2 seconds (simulated processing)
5. See success message ✅
6. Contract data refreshes automatically

### Test Failure Flow:
1. Go to any contract with status = "ACTIVE"
2. Click **"Pay Now - ₹{amount}"** button
3. Click **"Simulate Payment Failure"**
4. See error message ❌
5. Click "Try Again" to retry

---

## 📋 API Testing with cURL

### Initiate Payment:
```bash
curl -X POST http://localhost:5004/api/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "contractId": "your-contract-id",
    "amount": 50000
  }'
```

### Verify Payment:
```bash
curl -X POST http://localhost:5004/api/payments/verify \
  -H "Content-Type: application/json" \
  -d '{
    "contractId": "your-contract-id",
    "paymentId": "pay_from_initiate_response",
    "amount": 50000,
    "paymentMethod": "mock_gateway",
    "status": "SUCCESS"
  }'
```

### Get Payments:
```bash
curl http://localhost:5004/api/payments/contract/your-contract-id
```

---

## ✅ What's New?

### Backend (4 new files):
- ✅ `Payment.java` - Payment model
- ✅ `PaymentRepository.java` - Database repository
- ✅ `PaymentDTO.java` - Request/Response DTO
- ✅ `PaymentController.java` - REST API endpoints

### Frontend (1 new file):
- ✅ `PaymentGateway.tsx` - Payment modal component

### Modified (1 file):
- ✏️ `ContractDetail.tsx` - Added "Pay Now" button

### Database (1 table):
- 🗄️ `payments` - Stores payment records

---

## 🔐 Security Features

- ✅ Prevents duplicate payments
- ✅ Validates contract existence
- ✅ Validates payment ID uniqueness
- ✅ Secure modal-based payment flow
- ✅ Backend verification of all requests

---

## 🎨 Features

- ✅ Beautiful payment modal UI
- ✅ Real-time payment processing animation
- ✅ Success/Failure feedback
- ✅ Automatic contract status update
- ✅ Payment history tracking
- ✅ Responsive design
- ✅ Mock payment system (no API keys needed)

---

## 📖 Full Documentation

See `PAYMENT_GATEWAY_INTEGRATION.md` for:
- Complete API documentation
- Database schema details
- Security implementation
- Testing scenarios
- Future enhancement guides
- Troubleshooting tips

---

**That's it! Your payment gateway is ready to use! 🎉**
