# 🚀 Quick Start - Java Spring Boot Backend

## ⚡ 3-Step Setup

### Step 1: Install Maven (if not already installed)

**macOS:**
```bash
brew install maven
```

**Linux:**
```bash
sudo apt-get install maven
```

**Windows:**
Download from https://maven.apache.org/download.cgi

### Step 2: Configure Database

Edit `server-java/src/main/resources/application.properties`:

```properties
spring.datasource.password=YOUR_PASSWORD_HERE
```

### Step 3: Run the Application

```bash
cd server-java
./run-java-backend.sh
```

That's it! Your Java backend will start on **http://localhost:5000**

---

## 📋 Verify Installation

Test if the backend is running:

```bash
curl http://localhost:5000/api/products
```

You should see a list of products in JSON format.

---

## 🔧 Optional: Build JAR File

```bash
cd server-java
mvn clean package
java -jar target/agri-trading-1.0.0.jar
```

---

## 🎯 Test Authentication

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

**Register New User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "email":"john@example.com",
    "password":"password123",
    "role":"FARMER"
  }'
```

---

## 📁 Project Structure Created

```
server-java/
├── pom.xml                          ✅ Maven config
├── src/main/java/com/agri/trading/
│   ├── AgriTradingApplication.java  ✅ Main class
│   ├── config/                      ✅ Security & Config
│   ├── controller/                  ✅ REST APIs (6 controllers)
│   ├── dto/                         ✅ Request/Response objects
│   ├── model/                       ✅ Database entities
│   ├── repository/                  ✅ Data access layer
│   ├── security/                    ✅ JWT utilities
│   └── service/                     ✅ Business logic
├── src/main/resources/
│   └── application.properties       ✅ Configuration
├── config/                          ✅ JSON data files
├── run-java-backend.sh             ✅ Run script
├── README.md                        ✅ Full documentation
└── MIGRATION_COMPLETE.md           ✅ Migration summary
```

---

## 🎉 You're Ready!

The Java Spring Boot backend is now running and ready to serve your React frontend!

**Frontend URL:** http://localhost:5173  
**Backend URL:** http://localhost:5000

All existing features work exactly as before! 🎊
