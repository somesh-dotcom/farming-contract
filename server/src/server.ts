import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Only load dotenv in local development, not on Vercel
let startRealTimePriceUpdates: (() => void) | null = null;
let startBangaloreAreaDateUpdates: (() => void) | null = null;
let startISTDailyAutomation: (() => void) | null = null;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  dotenv.config();
  // Dynamically import background tasks only in local development
  import('./realtimePrices').then((mod) => {
    startRealTimePriceUpdates = mod.startRealTimePriceUpdates;
  });
  import('./updateBangaloreAreaDates').then((mod) => {
    startBangaloreAreaDateUpdates = mod.startBangaloreAreaDateUpdates;
  });
  import('./istDailyAutomation').then((mod) => {
    startISTDailyAutomation = mod.startISTDailyAutomation;
  });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Prisma Client (singleton pattern for serverless)
// Imported from lib/prisma.ts

// Middleware - CORS configuration for production
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Contract Farming API is running' });
});

// Routes - wrap in try-catch to identify initialization errors
try {
  const { prisma } = require('./lib/prisma');
  console.log('Prisma loaded successfully');
  
  const authRoutes = require('./routes/auth').default;
  const userRoutes = require('./routes/users').default;
  const contractRoutes = require('./routes/contracts').default;
  const productRoutes = require('./routes/products').default;
  const marketPriceRoutes = require('./routes/marketPrices').default;
  const transactionRoutes = require('./routes/transactions').default;
  const paymentRoutes = require('./routes/payments').default;
  const contractRequestRoutes = require('./routes/contractRequests').default;
  const ratingRoutes = require('./routes/ratings').default;
  const testRoutes = require('./routes/test').default;
  
  console.log('All routes loaded successfully');
  
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/contracts', contractRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/market-prices', marketPriceRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/contract-requests', contractRequestRoutes);
  app.use('/api/ratings', ratingRoutes);
  app.use('/api/test', testRoutes);
} catch (error) {
  console.error('Failed to load routes:', error);
  app.get('/api/debug', (req, res) => {
    res.json({
      error: 'Routes failed to load',
      message: error instanceof Error ? error.message : String(error),
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      vercel: process.env.VERCEL
    });
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server (only if not running on Vercel/serverless)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
    // Start real-time price updates (general - keeps same prices, updates dates)
    if (startRealTimePriceUpdates) {
      startRealTimePriceUpdates();
    }
    
    // Start Bangalore area date updates (specific to all 20 Bangalore areas)
    if (startBangaloreAreaDateUpdates) {
      startBangaloreAreaDateUpdates();
    }
    
    // Start IST-based daily automation (primary - updates ALL prices at midnight IST)
    if (startISTDailyAutomation) {
      startISTDailyAutomation();
    }
  });
}

// Export the app for serverless deployment (Vercel)
export default app;

// Graceful shutdown
process.on('beforeExit', async () => {
  try {
    const { prisma } = require('./lib/prisma');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error disconnecting prisma:', error);
  }
});

