# Razorpay Payment Gateway Integration Guide

## Overview
This guide explains how to integrate Razorpay payment gateway into your Assured Contract Farming application using **TEST MODE** API keys.

---

## 📋 Prerequisites

1. **Razorpay Account** - Sign up at https://dashboard.razorpay.com
2. **Test API Keys** - Get from Dashboard → Settings → API Keys
3. **Java 17+** and **Maven** installed
4. **Node.js** and **npm** installed

---

## 🚀 Step-by-Step Setup

### **STEP 1: Get Razorpay Test API Keys**

1. Go to https://dashboard.razorpay.com/app/dashboard
2. Sign up or login
3. Navigate to **Settings** → **API Keys** → **Test Mode**
4. Click **"Generate Key"** or copy existing keys
5. You'll get:
   - **Key ID**: `rzp_test_XXXXXXXXXX`
   - **Key Secret**: `Your_Secret_Key_Here`

**IMPORTANT:** Always use TEST keys during development. NEVER use LIVE keys in development!

---

### **STEP 2: Configure Backend**

#### 2.1 Update .env File

Edit `server-java/.env`:

```bash
# Razorpay Test API Keys
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
RAZORPAY_KEY_SECRET=Your_Secret_Key_Here

# Database Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/contract_farming
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password
```

#### 2.2 Verify application.properties

The file `server-java/src/main/resources/application.properties` should have:

```properties
# Razorpay Configuration
razorpay.key.id=${RAZORPAY_KEY_ID:rzp_test_demo}
razorpay.key.secret=${RAZORPAY_KEY_SECRET:demo_secret}
```

---

### **STEP 3: Install Dependencies**

The `pom.xml` has been updated with Razorpay dependencies:

```xml
<!-- Razorpay Java SDK -->
<dependency>
    <groupId>com.razorpay</groupId>
    <artifactId>razorpay-java</artifactId>
    <version>1.4.3</version>
</dependency>
```

Maven will automatically download these when you build the project.

---

### **STEP 4: Database Setup**

The `payments` table will be created automatically by Hibernate (`spring.jpa.hibernate.ddl-auto=update`).

**OR** manually run:

```sql
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
    INDEX idx_payment_id (payment_id)
);
```

---

### **STEP 5: Start Backend**

```bash
cd server-java
mvn clean install
mvn spring-boot:run
```

Backend will start on: `http://localhost:8090`

---

### **STEP 6: Start Frontend**

```bash
cd client
npm install
npm run dev
```

Frontend will start on: `http://localhost:3000` or `http://localhost:3001`

---

## 🎯 Testing the Payment

### **Test Card Details (Razorpay Test Mode)**

Use these card details for testing:

| Field | Value |
|-------|-------|
| **Card Number** | `4111 1111 1111 1111` |
| **Expiry** | Any future date (e.g., 12/25) |
| **CVV** | Any 3 digits (e.g., 123) |
| **Name** | Any name |

### **Test Payment Flow**

1. Navigate to a contract with **ACTIVE** status
2. Click **"Pay Now - ₹{amount}"** button
3. Razorpay payment modal will open
4. Enter test card details
5. Complete the payment
6. Success message will appear
7. Contract status updates to **ACTIVE (Paid)**

### **Test Payment Failure**

1. Use invalid card details
2. Or close the Razorpay modal
3. Error message will display
4. Click "Try Again" to retry

---

## 📁 Files Created/Modified

### **Backend Files**

| File | Location | Purpose |
|------|----------|---------|
| `RazorpayConfig.java` | `server-java/src/main/java/com/agri/trading/config/` | Razorpay client configuration |
| `RazorpayPaymentController.java` | `server-java/src/main/java/com/agri/trading/controller/` | Payment API endpoints |
| `.env` | `server-java/` | Environment variables (API keys) |
| `application.properties` | `server-java/src/main/resources/` | Updated with Razorpay config |
| `pom.xml` | `server-java/` | Added Razorpay dependency |

### **Frontend Files**

| File | Location | Purpose |
|------|----------|---------|
| `PaymentGateway.tsx` | `client/src/components/` | Razorpay checkout integration |
| `ContractDetail.tsx` | `client/src/pages/` | Modified - Added Pay Now button |

### **Database**

- **Table:** `payments` (auto-created by Hibernate)

---

## 🔌 API Endpoints

### **1. Create Order**
**POST** `/api/payments/create-order`

**Request:**
```json
{
  "contractId": "contract-123",
  "amount": 50000
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_XXXXXXXXXX",
  "amount": 5000000,
  "currency": "INR",
  "keyId": "rzp_test_XXXXXXXXXX",
  "contractId": "contract-123"
}
```

### **2. Verify Payment**
**POST** `/api/payments/verify`

**Request:**
```json
{
  "razorpay_order_id": "order_XXXXXXXXXX",
  "razorpay_payment_id": "pay_XXXXXXXXXX",
  "razorpay_signature": "signature_from_razorpay",
  "contractId": "contract-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "paymentId": "pay_XXXXXXXXXX",
  "amount": 50000
}
```

### **3. Get Payment Details**
**GET** `/api/payments/contract/{contractId}`

**Response:**
```json
{
  "success": true,
  "payments": [...],
  "count": 1
}
```

---

## 🔒 Security Features

### **1. Payment Signature Verification**
- Backend verifies Razorpay signature using `Utils.verifyWebhookSignature()`
- Prevents tampering with payment data
- Ensures payment is genuine

### **2. Duplicate Payment Prevention**
- Backend checks `existsByContractId` before creating order
- Checks `findByPaymentId` before processing verification
- Database enforces unique `payment_id` constraint

### **3. Amount Validation**
- Amount is fetched from database (contract.totalPrice)
- Frontend cannot manipulate the amount
- Razorpay order created with server-side amount

### **4. Secure API Keys**
- API keys stored in `.env` file
- Never exposed to frontend (except public Key ID)
- Key Secret remains on server only

---

## 💳 Payment Methods Supported

Razorpay supports:
- ✅ Credit/Debit Cards
- ✅ UPI (Google Pay, PhonePe, Paytm, etc.)
- ✅ Net Banking
- ✅ Wallets (Paytm, MobiKwik, etc.)
- ✅ EMI
- ✅ QR Code

All payment methods work in TEST MODE with test card details.

---

## 🐛 Troubleshooting

### **Issue: Razorpay SDK not loading**
**Solution:**
- Check internet connection
- Verify script URL: `https://checkout.razorpay.com/v1/checkout.js`
- Check browser console for errors

### **Issue: Order creation fails**
**Solution:**
- Verify API keys in `.env` file
- Check backend logs for errors
- Ensure contract exists in database

### **Issue: Payment verification fails**
**Solution:**
- Check signature verification logic
- Verify all 3 parameters are sent (order_id, payment_id, signature)
- Check Razorpay dashboard for payment status

### **Issue: Duplicate payment error**
**Solution:**
- Payment already processed for this contract
- Check `payments` table in database
- Contract status should be ACTIVE

### **Issue: Amount mismatch**
**Solution:**
- Amount sent to Razorpay is in **paise** (multiply by 100)
- ₹500 = 50000 paise
- Verify conversion in backend code

---

## 📊 Razorpay Dashboard

Monitor all transactions at:
https://dashboard.razorpay.com/app/payments

**Features:**
- View all payments (success/failed)
- Refund payments
- Download reports
- Webhook configuration
- Settlement details

---

## 🔄 Payment Flow

```
1. User clicks "Pay Now" on Contract Detail page
   ↓
2. Frontend loads Razorpay SDK
   ↓
3. Frontend calls POST /api/payments/create-order
   ↓
4. Backend creates Razorpay order
   ↓
5. Razorpay Checkout modal opens
   ↓
6. User enters payment details
   ↓
7. Razorpay processes payment
   ↓
8. Razorpay returns response (order_id, payment_id, signature)
   ↓
9. Frontend calls POST /api/payments/verify
   ↓
10. Backend verifies signature
    ↓
11. Backend saves payment record
    ↓
12. Backend updates contract status to ACTIVE
    ↓
13. Frontend shows success message
    ↓
14. Contract data refreshes
```

---

## 🧪 Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads Razorpay SDK
- [ ] Pay Now button appears on ACTIVE contracts
- [ ] Razorpay modal opens on click
- [ ] Test card payment succeeds
- [ ] Payment verification passes
- [ ] Payment record saved in database
- [ ] Contract status updates to ACTIVE
- [ ] Success message displays
- [ ] Duplicate payment prevented
- [ ] Payment failure handled gracefully
- [ ] Razorpay dashboard shows test payment

---

## 📝 Important Notes

1. **TEST MODE ONLY** - Do not use LIVE keys in development
2. **No real money** is charged in test mode
3. **Test cards** only work in test mode
4. **API keys** should be kept secure
5. **Never commit** `.env` file to Git
6. **Use environment variables** in production

---

## 🚀 Going to Production

When ready for production:

1. **Get LIVE API Keys** from Razorpay Dashboard
2. **Update `.env`** with LIVE keys
3. **Test thoroughly** in staging environment
4. **Enable webhooks** for automatic payment updates
5. **Implement error logging** for failed payments
6. **Set up monitoring** for payment failures
7. **Add refund functionality** if needed

---

## 📖 Additional Resources

- **Razorpay Docs:** https://razorpay.com/docs/
- **Java SDK:** https://github.com/razorpay/razorpay-java
- **Test Cards:** https://razorpay.com/docs/payments/payments/test-card-upi-details/
- **Integration Guide:** https://razorpay.com/docs/payment-gateway/web-integration/

---

## 🆘 Support

For issues:
1. Check this documentation
2. Review Razorpay docs
3. Check backend/frontend logs
4. Contact Razorpay support: https://razorpay.com/support/

---

**Version:** 2.0.0 (Razorpay Integration)  
**Last Updated:** 2026-04-22  
**Status:** Production Ready (Test Mode Active)
