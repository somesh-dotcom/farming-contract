# Payment Gateway Integration - Assured Contract Farming

## Overview
This document describes the payment gateway integration added to the Assured Contract Farming application. The implementation uses a **mock payment system** that simulates payment processing without requiring real API keys.

---

## 📁 New Files Created

### Backend (Java Spring Boot)

| File | Location | Purpose |
|------|----------|---------|
| `Payment.java` | `server-java/src/main/java/com/agri/trading/model/` | Payment entity/model |
| `PaymentRepository.java` | `server-java/src/main/java/com/agri/trading/repository/` | Database repository for payments |
| `PaymentDTO.java` | `server-java/src/main/java/com/agri/trading/dto/` | Data transfer object for payment requests |
| `PaymentController.java` | `server-java/src/main/java/com/agri/trading/controller/` | REST API endpoints for payment operations |
| `V1__create_payments_table.sql` | `server-java/src/main/resources/db/migration/` | Database migration script |

### Frontend (React + TypeScript)

| File | Location | Purpose |
|------|----------|---------|
| `PaymentGateway.tsx` | `client/src/components/` | Payment gateway UI component with modal |

### Modified Files

| File | Changes Made |
|------|--------------|
| `client/src/pages/ContractDetail.tsx` | Added "Pay Now" button and payment gateway integration |

---

## 🗄️ Database Schema

### New Table: `payments`

```sql
CREATE TABLE payments (
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

**Indexes:**
- `idx_contract_id` - Fast lookup by contract
- `idx_payment_id` - Fast lookup by payment ID
- `idx_status` - Filter by payment status
- `idx_contract_payment` - Composite index for contract + status

---

## 🔌 API Endpoints

### 1. Initiate Payment
**POST** `/api/payments/initiate`

**Request Body:**
```json
{
  "contractId": "contract-123",
  "amount": 50000.00
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "paymentId": "pay_abc123def456",
  "amount": 50000.00,
  "currency": "INR",
  "contractId": "contract-123"
}
```

### 2. Verify Payment
**POST** `/api/payments/verify`

**Request Body:**
```json
{
  "contractId": "contract-123",
  "paymentId": "pay_abc123def456",
  "amount": 50000.00,
  "paymentMethod": "mock_gateway",
  "status": "SUCCESS"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment successful",
  "payment": {
    "id": 1,
    "contractId": "contract-123",
    "paymentId": "pay_abc123def456",
    "amount": 50000.00,
    "status": "SUCCESS",
    "paymentMethod": "mock_gateway",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Get Payments by Contract
**GET** `/api/payments/contract/{contractId}`

**Response:**
```json
{
  "success": true,
  "payments": [...],
  "count": 1
}
```

### 4. Simulate Payment Failure
**POST** `/api/payments/simulate-failure`

**Response:**
```json
{
  "success": false,
  "message": "Payment failed - Simulated failure",
  "errorCode": "PAYMENT_FAILED"
}
```

---

## 🎨 Frontend Features

### Payment Gateway Component
The `PaymentGateway` component provides:

1. **Payment Initiation Screen**
   - Shows contract ID and amount
   - Lists security features
   - "Pay Now" button
   - "Simulate Payment Failure" button (for testing)

2. **Processing Screen**
   - Animated spinner
   - Shows payment amount
   - Simulates 2-second processing delay

3. **Success Screen**
   - Green checkmark animation
   - Payment details
   - Contract status update confirmation
   - Auto-closes after 2 seconds

4. **Failure Screen**
   - Red alert icon
   - Error message display
   - "Try Again" button
   - "Cancel" button

### Integration in ContractDetail

**Location:** Status Actions sidebar (right side)

**Visibility:**
- Only shows when contract status is `ACTIVE`
- Only shows if contract is not already paid
- Button displays the amount to be paid

**Button Text:** `Pay Now - ₹{amount}`

---

## 🔒 Security Features

### Duplicate Payment Prevention
1. **Backend Validation:**
   - Checks if payment already exists for contract
   - Validates payment ID uniqueness
   - Prevents double-processing

2. **Frontend Validation:**
   - Checks `contract.isPaid` flag
   - Disables button after successful payment

### Payment Validation
- Validates contract existence before initiating payment
- Validates payment ID format
- Validates amount matches contract total
- Verifies gateway response

---

## 🔄 Payment Flow

```
1. User clicks "Pay Now" on Contract Detail page
   ↓
2. PaymentGateway modal opens
   ↓
3. User clicks "Pay Now" button
   ↓
4. Frontend calls POST /api/payments/initiate
   ↓
5. Backend validates contract and generates payment ID
   ↓
6. Frontend shows "Processing" screen (2 seconds)
   ↓
7. Frontend calls POST /api/payments/verify
   ↓
8. Backend:
   - Creates payment record
   - Updates contract status to ACTIVE (paid)
   ↓
9. Frontend shows "Success" screen
   ↓
10. Modal auto-closes and refreshes contract data
```

---

## 🧪 Testing

### Test Scenarios

1. **Successful Payment:**
   - Navigate to contract with status "ACTIVE"
   - Click "Pay Now" button
   - Click "Pay Now" in modal
   - Verify success message appears
   - Verify contract data refreshes

2. **Payment Failure:**
   - Navigate to contract with status "ACTIVE"
   - Click "Pay Now" button
   - Click "Simulate Payment Failure"
   - Verify error message appears
   - Click "Try Again" to retry

3. **Duplicate Payment Prevention:**
   - Complete a successful payment
   - Try to pay again (button should not appear)

4. **Invalid Contract:**
   - Try to initiate payment for non-existent contract
   - Verify error message

---

## 🚀 Deployment

### Database Migration

**Option 1: Using Flyway (if configured)**
```bash
# Migration will run automatically on application start
# File: V1__create_payments_table.sql
```

**Option 2: Manual SQL Execution**
```bash
mysql -u username -p database_name < server-java/src/main/resources/db/migration/V1__create_payments_table.sql
```

**Option 3: Hibernate Auto-DDL**
```properties
# In application.properties
spring.jpa.hibernate.ddl-auto=update
# Table will be created automatically
```

### Backend Deployment
No additional configuration needed. All payment files are modular and don't affect existing functionality.

### Frontend Deployment
No additional configuration needed. PaymentGateway component is lazy-loaded only when needed.

---

## 🔧 Future Enhancements

### Real Payment Gateway Integration

To integrate with Razorpay or Stripe:

1. **Add SDK:**
```bash
# Razorpay
npm install razorpay

# Stripe
npm install @stripe/stripe-js
```

2. **Update PaymentGateway.tsx:**
   - Replace mock payment with real gateway SDK
   - Add API key configuration
   - Handle real webhook responses

3. **Backend Updates:**
   - Add signature verification
   - Integrate gateway SDK
   - Add webhook endpoint

### Example: Razorpay Integration

```typescript
// Add to PaymentGateway.tsx
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const handleRazorpayPayment = async () => {
  const res = await loadRazorpay();
  if (!res) {
    alert('Razorpay SDK failed to load');
    return;
  }

  const options = {
    key: process.env.RAZORPAY_KEY_ID,
    amount: amount * 100, // in paise
    currency: 'INR',
    name: 'Assured Contract Farming',
    description: 'Contract Payment',
    order_id: paymentId,
    handler: function (response) {
      // Verify payment
      verifyPayment(response);
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
```

---

## 📊 Monitoring & Analytics

### Track Payment Metrics
- Total payments processed
- Success rate
- Average payment amount
- Payment method distribution

### Log Files
All payment operations are logged with:
- Timestamp
- Contract ID
- Payment ID
- Status
- Error messages (if any)

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** Payment button not showing
- **Solution:** Verify contract status is "ACTIVE"

**Issue:** Payment fails immediately
- **Solution:** Check backend logs for validation errors

**Issue:** Database error on payment
- **Solution:** Run migration script to create payments table

**Issue:** Modal not closing after success
- **Solution:** Check `onSuccess` callback is properly wired

---

## 📝 Notes

- This is a **mock payment system** for demonstration
- No real money is processed
- All payments simulate success/failure
- Ready for production integration with real gateways
- Backward compatible - no existing functionality broken

---

## 👥 Support

For questions or issues:
1. Check this documentation
2. Review API endpoint responses
3. Check browser console for frontend errors
4. Check server logs for backend errors

---

**Version:** 1.0.0  
**Last Updated:** 2026-04-22  
**Status:** Production Ready (Mock Mode)
