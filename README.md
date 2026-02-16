# Agricultural Commodity Trading Platform

A comprehensive full-stack application for managing agricultural commodity trading between farmers and buyers, featuring real-time market price tracking, contract management, and payment processing. The platform ensures transparent and efficient transactions in the agricultural supply chain.

## 🌾 Features

### Core Functionality
- **Multi-role User Management**: Role-based authentication (Farmer, Buyer, Admin)
- **Smart Contract Management**: Create, negotiate, and track agricultural contracts
- **Real-time Market Price Tracking**: Live price feeds and historical trend analysis
- **Integrated Payment System**: Transaction management and payment tracking
- **Analytics Dashboard**: Comprehensive statistics and business insights
- **Location-based Pricing**: Geographic price variations and delivery management
- **Bilingual Support**: Full English and Kannada language support for wider accessibility
- **Enhanced Admin Controls**: Advanced transaction management with status toggling and deletion capabilities
- **Bangalore-Specific Locations**: Focused location selection for improved logistics and delivery management

### Key Benefits
- ✅ **Market Transparency**: Real-time pricing data for informed decision-making
- ✅ **Risk Mitigation**: Fixed-price contracts protect against market volatility
- ✅ **Direct Trade**: Eliminate middlemen for better profit distribution
- ✅ **Efficient Operations**: Streamlined digital workflow for all stakeholders
- ✅ **Data-driven Insights**: Analytics for strategic planning
- ✅ **Multilingual Support**: Accessible in both English and Kannada for broader reach
- ✅ **Enhanced Admin Controls**: Advanced transaction management capabilities
- ✅ **Localized Delivery**: Bangalore-area-specific location selection for improved logistics

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for enhanced type safety
- **Prisma ORM** for robust database management
- **PostgreSQL** for reliable data persistence
- **JWT** for secure authentication
- **BcryptJS** for secure password hashing
- **Zod** for schema validation
- **Express Validator** for request validation

### Frontend
- **React 18** with **TypeScript** for type-safe development
- **Vite** for lightning-fast development builds
- **React Router** for dynamic client-side routing
- **TanStack Query** for advanced data fetching and caching
- **Tailwind CSS** for responsive, utility-first styling
- **Recharts** for interactive data visualization
- **Lucide React** for consistent iconography
- **React Hook Form** for form management
- **Date-FNS** for date manipulation
- **React-i18next** for multilingual support (English/Kannada)

### Database Schema
- **User**: Farmers, Buyers, and Admin accounts with role-based access
- **Product**: Agricultural commodities with categorization
- **Contract**: Structured agreements with lifecycle management
- **MarketPrice**: Real-time pricing with geographic variations
- **Transaction**: Payment tracking with multiple payment methods

## 📁 Project Structure

```
agricultural-commodity-platform/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── PrivateRoute.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── contexts/          # React Context providers
│   │   │   └── AuthContext.tsx
│   │   ├── pages/             # Page components
│   │   │   ├── ContractDetail.tsx
│   │   │   ├── Contracts.tsx
│   │   │   ├── CreateContract.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── MarketPrices.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Transactions.tsx
│   │   │   └── Users.tsx
│   │   ├── types/             # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── lib/               # Utility libraries
│   │   │   └── queryClient.ts
│   │   ├── App.tsx            # Main application component
│   │   ├── main.tsx           # Application entry point
│   │   └── index.css          # Global styles
│   ├── public/
│   └── package.json
├── server/                    # Backend API server
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   │   ├── auth.ts
│   │   │   ├── contracts.ts
│   │   │   ├── marketPrices.ts
│   │   │   ├── products.ts
│   │   │   ├── transactions.ts
│   │   │   └── users.ts
│   │   ├── middleware/        # Express middleware
│   │   │   └── auth.ts
│   │   ├── utils/             # Utility functions
│   │   │   └── jwt.ts
│   │   ├── server.ts          # Main server file
│   │   ├── seed.ts            # Data seeding script
│   │   ├── addSample*.ts      # Sample data addition scripts
│   │   └── update*.ts         # Data update scripts
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema definition
│   │   └── migrations/        # Database migration files
│   └── package.json
├── .env                       # Environment variables
├── .gitignore
├── package.json               # Root package configuration
├── run.sh                     # Setup and execution script
├── README.md                  # Project documentation
└── QUICK_START.md             # Quick setup guide
```

**Empowering farmers and buyers with transparent, efficient agricultural trade**
