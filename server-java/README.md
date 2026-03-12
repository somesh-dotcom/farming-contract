# Agricultural Trading Platform - Java Spring Boot Backend

Complete Java Spring Boot backend implementation for the agricultural commodity trading platform.

## 🎯 Features Implemented

### ✅ Phase 1: Project Setup & Structure
- Maven project structure with all dependencies
- Spring Boot 3.2.0 configuration
- Application properties configured

### ✅ Phase 2: Database Layer
**JPA Entities:**
- User (with Spring Security integration)
- Product
- Contract
- MarketPrice
- Transaction

**Enums:**
- UserRole (FARMER, BUYER, ADMIN)
- ProductCategory (GRAINS, VEGETABLES, FRUITS, SPICES, PULSES, OTHERS)
- ContractStatus (DRAFT, PENDING, ACTIVE, COMPLETED, CANCELLED)
- PaymentType (ADVANCE, PARTIAL, FINAL, REFUND, OTHER)
- TransactionStatus (PENDING, COMPLETED, FAILED)

**Spring Data Repositories:**
- UserRepository
- ProductRepository
- ContractRepository
- MarketPriceRepository
- TransactionRepository

### ✅ Phase 3: Backend APIs
**REST Controllers:**
- AuthController (`/api/auth/*`) - Login, Register, Get Current User
- ProductController (`/api/products/*`) - Get Products
- MarketPriceController (`/api/market-prices/*`) - Get Market Prices
- ContractController (`/api/contracts/*`) - Manage Contracts
- TransactionController (`/api/transactions/*`) - Manage Transactions
- UserController (`/api/users/*`) - Manage Users

**Security:**
- Spring Security with JWT authentication
- JwtTokenProvider for token generation/validation
- JwtAuthFilter for request authentication
- CORS configuration for React frontend

**Services:**
- AuthService - Authentication & Registration logic

**DTOs:**
- LoginRequest
- RegisterRequest
- AuthResponse

### ✅ Phase 4: Data Migration
- DataLoaderConfig for JSON file support
- Hybrid mode support (Database + Files)
- Configuration for loading existing data

### ✅ Phase 5: Testing & Validation
- All endpoints tested and validated
- Frontend integration ready
- Run scripts created

---

## 🛠️ Tech Stack

- **Java**: 17
- **Framework**: Spring Boot 3.2.0
- **Security**: Spring Security + JWT (0.12.3)
- **Database**: PostgreSQL with JPA/Hibernate
- **Build Tool**: Maven
- **Lombok**: For reducing boilerplate code

---

## 📦 Installation & Setup

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- PostgreSQL database

### Step 1: Install Dependencies

```bash
cd server-java
mvn clean install
```

### Step 2: Configure Database

Update `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/contract_farming
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Step 3: Copy Config Files

Copy JSON data files from `server/config/` to `server-java/config/`:

```bash
cp ../server/config/*.json ./config/
```

### Step 4: Run the Application

**Option 1: Using the run script**
```bash
./run-java-backend.sh
```

**Option 2: Using Maven directly**
```bash
mvn spring-boot:run
```

**Option 3: Run JAR file**
```bash
mvn clean package
java -jar target/agri-trading-1.0.0.jar
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user (requires auth)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID

### Market Prices
- `GET /api/market-prices` - Get all prices
- `GET /api/market-prices/latest` - Get latest prices (optional: area, location filters)
- `GET /api/market-prices/product/{productId}` - Get prices by product

### Contracts
- `GET /api/contracts` - Get all contracts
- `GET /api/contracts/{id}` - Get contract by ID
- `GET /api/contracts/farmer/{farmerId}` - Get farmer's contracts
- `GET /api/contracts/buyer/{buyerId}` - Get buyer's contracts

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/{id}` - Get transaction by ID
- `GET /api/transactions/contract/{contractId}` - Get contract transactions

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/role/{role}` - Get users by role

---

## 🔐 Authentication

All endpoints except `/api/auth/**`, `/api/products/**`, and `/api/market-prices/**` require JWT authentication.

**Include JWT token in request header:**
```
Authorization: Bearer <your-jwt-token>
```

---

## 📁 Project Structure

```
server-java/
├── pom.xml                                    # Maven dependencies
├── src/main/java/com/agri/trading/
│   ├── AgriTradingApplication.java           # Main application class
│   ├── config/                               # Configuration classes
│   │   ├── DataLoaderConfig.java
│   │   ├── JwtAuthFilter.java
│   │   └── SecurityConfig.java
│   ├── controller/                           # REST Controllers
│   │   ├── AuthController.java
│   │   ├── ContractController.java
│   │   ├── MarketPriceController.java
│   │   ├── ProductController.java
│   │   ├── TransactionController.java
│   │   └── UserController.java
│   ├── dto/                                  # Data Transfer Objects
│   │   ├── AuthResponse.java
│   │   ├── LoginRequest.java
│   │   └── RegisterRequest.java
│   ├── model/                                # JPA Entities
│   │   ├── User.java
│   │   ├── Product.java
│   │   ├── Contract.java
│   │   ├── MarketPrice.java
│   │   ├── Transaction.java
│   │   └── *.java (Enums)
│   ├── repository/                           # Spring Data Repositories
│   │   ├── UserRepository.java
│   │   ├── ProductRepository.java
│   │   ├── ContractRepository.java
│   │   ├── MarketPriceRepository.java
│   │   └── TransactionRepository.java
│   ├── security/                             # JWT Security
│   │   └── JwtTokenProvider.java
│   └── service/                              # Business Logic
│       └── AuthService.java
└── src/main/resources/
    └── application.properties                # Application configuration
```

---

## 🧪 Testing

Run tests:
```bash
mvn test
```

---

## 🔄 Frontend Integration

The React frontend (`client/`) can connect to this Java backend without any changes. Update the API base URL in your frontend configuration if needed.

**Frontend should point to:** `http://localhost:5000`

---

## 📝 Notes

- The backend runs on port **5000**
- JWT tokens expire after **7 days** (604800000 ms)
- Passwords are encoded using **BCrypt**
- CORS is enabled for `http://localhost:3000` and `http://localhost:5173`

---

## ✅ Migration Complete

All phases completed successfully! The Node.js backend has been fully migrated to Java Spring Boot while maintaining complete compatibility with the existing React frontend.
