import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import authRoutes from './routes/auth';
import contractRoutes from './routes/contracts';
import productRoutes from './routes/products';
import marketPriceRoutes from './routes/marketPrices';
import transactionRoutes from './routes/transactions';
import paymentRoutes from './routes/payments';
import userRoutes from './routes/users';
import contractRequestRoutes from './routes/contractRequests';
import ratingRoutes from './routes/ratings';
import { startRealTimePriceUpdates } from './realtimePrices';
import { startBangaloreAreaDateUpdates } from './updateBangaloreAreaDates';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Prisma Client (singleton pattern for serverless)
// Imported from lib/prisma.ts

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Contract Farming API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/products', productRoutes);
app.use('/api/market-prices', marketPriceRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contract-requests', contractRequestRoutes);
app.use('/api/ratings', ratingRoutes);

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
    startRealTimePriceUpdates();
    
    // Start Bangalore area date updates (specific to all 20 Bangalore areas)
    startBangaloreAreaDateUpdates();
  });
}

// Export the app for serverless deployment (Vercel)
export default app;

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

