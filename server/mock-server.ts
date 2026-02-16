import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Contract Farming API is running" });
});

// Mock routes
app.get("/api/users", (req, res) => {
  res.json({ users: [] });
});

app.get("/api/contracts", (req, res) => {
  res.json({ contracts: [] });
});

app.get("/api/products", (req, res) => {
  res.json({ products: [] });
});

app.get("/api/market-prices", (req, res) => {
  res.json({ prices: [] });
});

app.get("/api/transactions", (req, res) => {
  res.json({ transactions: [] });
});

// Mock auth routes
app.post("/api/auth/login", (req, res) => {
  res.json({ 
    token: "mock-jwt-token",
    user: {
      id: "1",
      email: "admin@example.com",
      name: "Admin User",
      role: "ADMIN"
    }
  });
});

app.post("/api/auth/register", (req, res) => {
  res.json({ 
    message: "User registered successfully",
    user: {
      id: "2",
      email: req.body.email,
      name: req.body.name,
      role: req.body.role
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock server is running on port ${PORT}`);
});