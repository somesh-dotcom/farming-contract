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

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **Git** for version control

### Automated Setup

For the quickest setup, use the provided script:

```bash
chmod +x run.sh
./run.sh
```

Follow the interactive prompts to set up, seed, and start the application.

### Manual Installation

#### 1. Clone and Navigate to Project

```bash
cd agricultural-commodity-platform
```

#### 2. Install Dependencies

Install all dependencies for root, server, and client:

```bash
npm run install:all
```

#### 3. Database Setup

1. **Create PostgreSQL Database**

```sql
CREATE DATABASE contract_farming;
```

2. **Configure Environment Variables**

Create `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your database credentials:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/contract_farming?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
```

3. **Run Database Migrations**

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

This will:
- Generate Prisma Client
- Create database tables
- Set up the schema

**(Optional)** Open Prisma Studio to view/edit database:

```bash
npm run prisma:studio
```

#### 4. Seed Initial Data

```bash
cd server
npm run seed
```

This creates:
- Admin user: `admin@contractfarming.com` / `admin123`
- Sample products (Wheat, Rice, Tomato, Potato, Mango, etc.)
- Sample market prices

#### 5. Start the Application

**Development Mode** (Runs both server and client):

```bash
npm run dev
```

This starts:
- Backend server on `http://localhost:5000`
- Frontend client on `http://localhost:3000`

**Or run separately**:

Backend only:
```bash
cd server
npm run dev
```

Frontend only:
```bash
cd client
npm run dev
```

## 👥 Usage

### 1. Registration

1. Open `http://localhost:3000`
2. Click "Sign up" or navigate to `/register`
3. Choose your role:
   - **Farmer**: Can create contracts, track production
   - **Buyer**: Can accept contracts, manage purchases
   - **Admin**: Full system access, user management
4. Fill in your details and create an account

> **Default Accounts**:
>
> **Admin Account**:
> - Email: `admin@contractfarming.com`
> - Password: `admin123`
>
> **Test Buyer Account**:
> - Email: `buyer@test.com`
> - Password: `buyer123`
>
> You can use these accounts to access the system. For security, consider changing the passwords after first login.

### 2. Creating a Contract (Farmer)

1. Login as a Farmer
2. Navigate to "Create Contract" from the sidebar
3. Select a buyer
4. Enter contract details:
   - Product selection from available commodities
   - Quantity and unit of measurement
   - Price per unit
   - Start and delivery dates
   - Delivery location (now with Bangalore-specific area selection)
   - Terms and conditions
5. Submit to create the contract

### 3. Managing Contracts

- **Farmers** can:
  - Create new contracts
  - View all their contracts
  - Update contract status (Draft → Pending → Active → Completed)
  - Negotiate terms with buyers

- **Buyers** can:
  - View contracts offered to them
  - Approve/reject pending contracts
  - Track active contracts
  - Initiate payments

- **Admins** can:
  - View all contracts
  - Manage users
  - Add/update market prices
  - Toggle transaction statuses (Pending ↔ Complete)
  - Delete transactions as needed
  - Manage Bangalore-specific location assignments

### 4. Market Prices

- View latest market prices for various commodities
- Check price history with interactive charts
- Filter by time period (daily, weekly, monthly)
- See price trends and geographic variations
- Compare prices across different locations
- **Bilingual Interface**: Full support for English and Kannada languages throughout the application

### 5. Transactions

- Track all payments related to contracts
- View transaction status (Pending/Completed/Failed)
- Monitor total amounts and pending payments
- Record different payment types (Advance, Partial, Final, Refund)
- **Admin Features**: Administrators can now toggle transaction status between Pending and Complete, and delete transactions as needed

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Contracts
- `GET /api/contracts` - Get all contracts (filtered by role)
- `GET /api/contracts/:id` - Get contract details
- `POST /api/contracts` - Create new contract
- `PUT /api/contracts/:id` - Update contract
- `PATCH /api/contracts/:id/status` - Update contract status
- `GET /api/contracts/user/:userId` - Get contracts for specific user

### Market Prices
- `GET /api/market-prices` - Get market prices
- `GET /api/market-prices?latest=true` - Get latest prices
- `GET /api/market-prices/product/:productId` - Get price history for product
- `POST /api/market-prices` - Add market price (Admin/Buyer)
- `GET /api/market-prices/trends` - Get price trends

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create new product (Admin)
- `PUT /api/products/:id` - Update product (Admin)

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/contract/:contractId` - Get transactions for contract
- `POST /api/transactions` - Create transaction
- `PATCH /api/transactions/:id/status` - Update transaction status
- `DELETE /api/transactions/:id` - Delete transaction (Admin only)
- `GET /api/transactions/user/:userId` - Get transactions for user

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/by-role/:role` - Get users by role
- `GET /api/users/stats/:userId` - Get user statistics
- `PUT /api/users/:id` - Update user profile

## 🗄️ Database Schema

### Main Entities

- **User**: Stores farmer, buyer, and admin information with authentication
- **Product**: Agricultural commodities with categorization and units
- **Contract**: Structured agreements with lifecycle management
- **MarketPrice**: Real-time pricing with geographic and temporal data
- **Transaction**: Payment records with status tracking

### Enum Definitions

- **UserRole**: `FARMER`, `BUYER`, `ADMIN`
- **ContractStatus**: `DRAFT`, `PENDING`, `ACTIVE`, `COMPLETED`, `CANCELLED`
- **TransactionStatus**: `PENDING`, `COMPLETED`, `FAILED`
- **PaymentType**: `ADVANCE`, `PARTIAL`, `FINAL`, `REFUND`, `OTHER`
- **ProductCategory**: `GRAINS`, `VEGETABLES`, `FRUITS`, `SPICES`, `PULSES`, `OTHERS`

### Contract Status Flow

```
DRAFT → PENDING → ACTIVE → COMPLETED
              ↓
         CANCELLED
```

## 🛠️ Development

### Available Scripts

**Root directory**:
- `npm run dev` - Start both server and client in development mode
- `npm run build` - Build both server and client for production
- `npm run install:all` - Install dependencies for all packages

**Server directory**:
- `npm run dev` - Start backend server with hot reloading
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start compiled server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio UI
- `npm run seed` - Seed database with sample data
- `npm run add-prices` - Add sample market prices
- `npm run add-contracts` - Add sample contracts
- `npm run add-transactions` - Add sample transactions
- `npm run analyze-prices` - Analyze market price trends
- `npm run update-prices` - Update market prices

**Client directory**:
- `npm run dev` - Start frontend development server
- `npm run build` - Build static assets for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Lint TypeScript files

### Building for Production

```bash
# Build everything
npm run build

# Build server only
cd server
npm run build

# Build client only
cd client
npm run build
```

### Database Management

```bash
# Create a new migration
cd server
npx prisma migrate dev --name migration_name

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# View database in browser
npm run prisma:studio

# Pull schema from database
npx prisma db pull

# Push schema to database
npx prisma db push
```

### Environment Variables

**Server (.env)**:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/contract_farming"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
```

## 🐞 Troubleshooting

### Common Issues

**Database Connection Issues**:
- Verify PostgreSQL is running
- Check DATABASE_URL in `server/.env`
- Ensure database exists: `CREATE DATABASE contract_farming;`
- Confirm PostgreSQL service is active

**Port Already in Use**:
- Change PORT in `server/.env`
- Update proxy in `client/vite.config.ts` if needed
- Check for existing processes using the same port

**Prisma Client Issues**:
```bash
cd server
npm run prisma:generate
```

**Module Not Found Errors**:
```bash
# Reinstall dependencies
npm run install:all
```

**Authentication Problems**:
- Verify JWT_SECRET is set correctly
- Check that tokens are not expired
- Clear browser cache and cookies if needed

**API Request Failures**:
- Confirm server is running on specified port
- Check CORS settings in server configuration
- Verify API endpoint URLs

### Development Tips

- Always run database migrations after schema changes
- Use the seed script to populate sample data during development
- Check the browser console and server logs for detailed error messages
- Use Prisma Studio to inspect database contents

## 🤝 Contributing

We welcome contributions to enhance the agricultural commodity trading platform!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Test thoroughly
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a pull request

### Development Guidelines

- Follow the existing code style and patterns
- Write clear, descriptive commit messages
- Update documentation as needed
- Add tests for new functionality
- Ensure all tests pass before submitting

## 📄 License

MIT License - Feel free to use, modify, and distribute this software.

## 🆘 Support

For issues, questions, or suggestions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common solutions

---

**Empowering farmers and buyers with transparent, efficient agricultural trade**