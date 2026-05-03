# 📌 Contract Farming System 🌾📜

## Overview  
The **Contract Farming System** is a full-stack application that connects **farmers and buyers** for **transparent and secure agricultural trade**. The platform allows **smart contract management, real-time market price tracking, payment processing, and localized delivery management**.  

Built with **React, Node.js, PostgreSQL, and Tailwind CSS** (with a Java Spring Boot alternative), it ensures **fair market access and stable income for farmers** while offering buyers a **reliable and efficient procurement process**.  

---

## ✨ Features 🚀  
✅ **User Registration & Authentication** – Farmers, buyers, and admins can register and log in securely.  
✅ **Smart Contract Management** – Buyers can send requests, and farmers can accept or negotiate direct contracts.  
✅ **Real-time Market Prices** – Track live price feeds and historical trends with automatic daily updates for specific areas.  
✅ **Integrated Payment Processing** – Track transactions with automated contract completion upon full payment.  
✅ **Admin Dashboard** – Allows admins to **manage users, contracts, transactions, and localized market data**.  

---

## 🛠 Technologies Used  
🔹 **Frontend:** React, TypeScript, Tailwind CSS, Vite  
🔹 **Backend:** Node.js, Express.js (TypeScript) / Java Spring Boot alternative  
🔹 **Database:** PostgreSQL / Prisma ORM (also supports JSON file storage for dev)  

---

## 🏗 Installation & Setup  

### 🔹 Prerequisites:  
- Node.js (v18+)  
- PostgreSQL Server (optional, can use file DB)  
- Git  

### 📌 Steps to Run the Project:  

1️⃣ **Clone the Repository:**  
```sh
git clone https://github.com/somesh-dotcom/farming-contract.git
cd farming-contract
```

2️⃣ **Install Dependencies:**  
```sh
npm run install:all
```

3️⃣ **Run Locally (Development Mode):**  
```sh
npm run dev
```
*(Starts the backend server on `localhost:5000` and frontend client on `localhost:3000`)*

---

### 🚀 **Live Demo**

🔗 [https://farming-contract.vercel.app](https://farming-contract.vercel.app)

---

### 3️⃣ **Deployment Options**

#### ✅ **Deploy on Vercel (Recommended)**  
- This project is fully configured for deployment on [Vercel](https://vercel.com).  
- The frontend is deployed via the root directory, while the backend API is deployed via the `server/` directory.

#### 🧪 **Run Java Backend Alternative**  
- Navigate to the `server-java/` directory.
- Run the Spring Boot application using Maven: `mvn spring-boot:run`.
- The React frontend connects to it seamlessly.

---

## 🤝 Contribution Guide  
We welcome contributions! Follow these steps:  

1️⃣ **Fork the Repository** and create a new branch.  
2️⃣ **Make your changes** and commit them with a descriptive message.  
3️⃣ **Push your changes** to the branch and create a **Pull Request**.  

---

## 📩 Contact & Support  
🔹 **GitHub:** [@somesh-dotcom](https://github.com/somesh-dotcom)  
