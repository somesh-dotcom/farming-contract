# Contract Request API Debugging Guide

## Issues Fixed ✅

### 1. **Misleading Error Message (FIXED)**
- **Problem**: Backend was sending "your request is succesfuly sent" even when there was an error
- **Location**: `server/src/routes/contractRequests.ts` line 291
- **Fix**: Changed to "Failed to create contract request. Please try again."

### 2. **Enhanced Frontend Error Logging (FIXED)**
- **Problem**: Insufficient logging to debug API failures
- **Location**: `client/src/pages/SendRequest.tsx`
- **Fix**: Added comprehensive logging for:
  - Request data being sent
  - User authentication status
  - Full error responses
  - Error status codes

### 3. **Better Error Display (FIXED)**
- **Problem**: Users only saw inline error messages
- **Fix**: Added browser alert for both success and error messages

## How to Test the Contract Request Flow

### Step 1: Check Backend is Running
```bash
# Backend should be running on port 5004
curl http://localhost:5004/api/health
```

### Step 2: Check Frontend is Running
```bash
# Frontend should be running on port 3000
# Open browser: http://localhost:3000
```

### Step 3: Test Authentication
1. Login as a **BUYER** (only buyers can create contract requests)
2. Open browser console (F12)
3. Check if token is set:
   ```javascript
   console.log(localStorage.getItem('token'))
   ```

### Step 4: Send a Contract Request
1. Navigate to "Send Request" page
2. Fill in the form:
   - Select a Farmer (must exist in database)
   - Select a Product (must exist in database)
   - Enter quantity, price, dates, location
3. Open browser console (F12) before submitting
4. Click "Send Request to Farmer"

### Step 5: Check Console Logs

#### Frontend Console (Browser F12):
You should see:
```
===== SUBMITTING CONTRACT REQUEST =====
Form data: {...}
Request data being sent: {...}
Current user: {...}
Auth token exists: true

[SendRequest] Sending contract request data: {...}
[SendRequest] Response: {...}
```

If there's an error:
```
===== CONTRACT REQUEST ERROR =====
Error object: {...}
Error response: {...}
Error response data: {...}
Error status: 400/401/403/500
Error message: "..."
Displaying error message: "..."
```

#### Backend Console (Terminal):
You should see:
```
[ContractRequest] Creating request with data: {...}
[ContractRequest] Creating contract request in database...
[ContractRequest] Contract request created successfully: <uuid>
```

If there's an error:
```
[ContractRequest] Missing required fields: {...}
[ContractRequest] User is not a buyer. Role: FARMER
[ContractRequest] Product not found: <id>
[ContractRequest] Farmer not found or not a farmer role: <id>
[ContractRequest] CREATE ERROR: {...}
[ContractRequest] Error details: {...}
```

## Common Issues and Solutions

### Issue 1: "Authentication required" (401 Error)
**Cause**: No token or invalid token being sent
**Solution**:
1. Logout and login again
2. Check browser console for auth errors
3. Verify token exists: `localStorage.getItem('token')`
4. Check axios header: `axios.defaults.headers.common['Authorization']`

### Issue 2: "Only buyers can create contract requests" (403 Error)
**Cause**: Logged in user is not a BUYER
**Solution**:
1. Check your user role: `JSON.parse(localStorage.getItem('user')).role`
2. Login as a buyer account
3. If no buyer exists, register a new account with BUYER role

### Issue 3: "Farmer not found or invalid role" (404 Error)
**Cause**: Selected farmer doesn't exist or isn't a FARMER
**Solution**:
1. Check if farmers exist: Call `GET /api/users/by-role/FARMER`
2. Register a farmer account if none exist
3. Verify farmer ID is valid

### Issue 4: "Product not found" (404 Error)
**Cause**: Selected product doesn't exist
**Solution**:
1. Check if products exist: Call `GET /api/products`
2. Seed the database with products if needed
3. Run: `cd server && npx prisma db seed`

### Issue 5: "All required fields must be provided" (400 Error)
**Cause**: Missing required fields in request
**Solution**:
Check these fields are present:
- `farmerId` (string, UUID)
- `productId` (string, UUID)
- `quantity` (number, > 0)
- `unit` (string, e.g., "kg")
- `proposedPrice` (number, > 0)
- `startDate` (ISO date string)
- `deliveryDate` (ISO date string)

### Issue 6: Database/Prisma Error (500 Error)
**Cause**: Database connection or validation error
**Solution**:
1. Check database is running
2. Run migrations: `cd server && npx prisma migrate dev`
3. Check backend terminal for detailed error
4. Verify all foreign keys reference valid records

## API Endpoint Details

### Create Contract Request
```
POST /api/contract-requests
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "farmerId": "uuid-string",
  "productId": "uuid-string",
  "quantity": 100,
  "unit": "kg",
  "proposedPrice": 2500.00,
  "startDate": "2026-04-15T00:00:00Z",
  "deliveryDate": "2026-05-15T00:00:00Z",
  "location": "Bangalore - Indiranagar",
  "area": "Indiranagar",
  "terms": "Premium quality required"
}

Success Response (201):
{
  "message": "Contract request sent successfully. Waiting for farmer approval.",
  "request": { ... }
}

Error Response (400/401/403/500):
{
  "message": "Error description",
  "error": "Detailed error (dev mode only)"
}
```

## Quick Diagnostic Commands

### Check Backend Health
```bash
curl http://localhost:5004/api/health
```

### Check Authentication
```bash
TOKEN=$(cat something) # Get your token
curl http://localhost:5004/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### List Available Farmers
```bash
curl http://localhost:5004/api/users/by-role/FARMER \
  -H "Authorization: Bearer $TOKEN"
```

### List Available Products
```bash
curl http://localhost:5004/api/products
```

### Test Contract Request Creation
```bash
curl -X POST http://localhost:5004/api/contract-requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "farmerId": "farmer-uuid",
    "productId": "product-uuid",
    "quantity": 100,
    "unit": "kg",
    "proposedPrice": 2500,
    "startDate": "2026-04-15",
    "deliveryDate": "2026-05-15",
    "location": "Bangalore - Indiranagar"
  }'
```

## Data Flow Diagram

```
Frontend (SendRequest.tsx)
    ↓
1. User fills form
    ↓
2. handleSubmit() validates data
    ↓
3. createRequestMutation.mutate(requestData)
    ↓
4. axios.post('/api/contract-requests', data)
   - Includes Authorization header
    ↓
[Proxy: Vite dev server proxies /api → http://localhost:5004]
    ↓
Backend (contractRequests.ts)
    ↓
5. authenticate middleware validates token
    ↓
6. POST / handler receives request
    ↓
7. Validates required fields
    ↓
8. Verifies user is BUYER
    ↓
9. Checks product exists
    ↓
10. Checks farmer exists and has FARMER role
    ↓
11. Creates ContractRequest in database
    ↓
12. Creates notification for farmer
    ↓
13. Returns success response (201)
    ↓
Frontend receives response
    ↓
14. Shows success alert
    ↓
15. Navigates to /contracts
```

## Next Steps

1. **Test the flow** with browser console open
2. **Check the logs** in both frontend and backend
3. **Identify the exact error** from the console output
4. **Use the solutions** above to fix the specific issue

If you still encounter issues, share:
- Frontend console logs (F12)
- Backend terminal output
- The exact error message you see
- Network tab request/response (F12 → Network → contract-requests)
