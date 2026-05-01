import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { updateBangaloreAreaDates } from '../updateBangaloreAreaDates';

const router = express.Router();

// Get market prices (with filters)
router.get('/', async (req, res) => {
  try {
    const { productId, location, startDate, endDate, latest } = req.query;

    const filters: any = {};

    if (productId) filters.productId = productId;
    if (location) filters.location = location;

    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.gte = new Date(startDate as string);
      if (endDate) filters.date.lte = new Date(endDate as string);
    }

    let orderBy: any = { date: 'desc' };
    let take: number | undefined;

    if (latest === 'true') {
      // Get latest price per product per location
      const prices = await prisma.marketPrice.findMany({
        where: filters,
        include: {
          product: true
        },
        orderBy: { date: 'desc' }
      });

      // Group by product AND location to get latest price for each combination
      const latestPrices = prices.reduce((acc: any, price) => {
        // Always create a unique key: productId-location
        const key = `${price.productId}-${price.location || 'all'}`;
        
        if (!acc[key] || acc[key].date < price.date) {
          acc[key] = price;
        }
        return acc;
      }, {});

      return res.json({ prices: Object.values(latestPrices) });
    }

    const prices = await prisma.marketPrice.findMany({
      where: filters,
      include: {
        product: true
      },
      orderBy,
      take
    });

    res.json({ prices });
  } catch (error: any) {
    console.error('Get market prices error:', error);
    res.status(500).json({ message: 'Failed to fetch market prices', error: error.message });
  }
});

// Trigger daily date update (admin only)
router.post('/update-dates', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res) => {
  try {
    console.log('🔄 Manual trigger: Updating Bangalore area dates (forced)...');
    await updateBangaloreAreaDates(true);
    res.json({ 
      message: 'Daily date update triggered successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error triggering date update:', error);
    res.status(500).json({ message: 'Failed to update dates', error: error.message });
  }
});

// Get price history for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { days = 30, location } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    const filters: any = {
      productId,
      date: {
        gte: startDate
      }
    };

    if (location) {
      filters.location = location;
    }

    const prices = await prisma.marketPrice.findMany({
      where: filters,
      orderBy: { date: 'asc' },
      include: {
        product: {
          select: {
            name: true,
            unit: true
          }
        }
      }
    });

    res.json({ prices });
  } catch (error: any) {
    console.error('Get price history error:', error);
    res.status(500).json({ message: 'Failed to fetch price history', error: error.message });
  }
});

// Add market price (Admin or Buyer)
router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.BUYER), async (req: AuthRequest, res) => {
  try {
    const { productId, price, unit, location } = req.body;

    if (!productId || !price || !unit) {
      return res.status(400).json({ message: 'Product ID, price, and unit are required' });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const marketPrice = await prisma.marketPrice.create({
      data: {
        productId,
        price: parseFloat(price),
        unit,
        location
      },
      include: {
        product: true
      }
    });

    res.status(201).json({ message: 'Market price added successfully', marketPrice });
  } catch (error: any) {
    console.error('Add market price error:', error);
    res.status(500).json({ message: 'Failed to add market price', error: error.message });
  }
});

// Update market price (Admin only)
router.put('/:id', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res) => {
  try {
    const priceId = req.params.id;
    const updates = req.body;

    const marketPrice = await prisma.marketPrice.findUnique({
      where: { id: priceId }
    });

    if (!marketPrice) {
      return res.status(404).json({ message: 'Market price not found' });
    }

    // Convert price to float if provided
    if (updates.price) {
      updates.price = parseFloat(updates.price);
    }

    const updatedPrice = await prisma.marketPrice.update({
      where: { id: priceId },
      data: updates,
      include: {
        product: true
      }
    });

    res.json({ message: 'Market price updated successfully', marketPrice: updatedPrice });
  } catch (error: any) {
    console.error('Update market price error:', error);
    res.status(500).json({ message: 'Failed to update market price', error: error.message });
  }
});

// Delete market price (Admin only)
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res) => {
  try {
    const priceId = req.params.id;

    const marketPrice = await prisma.marketPrice.findUnique({
      where: { id: priceId }
    });

    if (!marketPrice) {
      return res.status(404).json({ message: 'Market price not found' });
    }

    await prisma.marketPrice.delete({
      where: { id: priceId }
    });

    res.json({ message: 'Market price deleted successfully' });
  } catch (error: any) {
    console.error('Delete market price error:', error);
    res.status(500).json({ message: 'Failed to delete market price', error: error.message });
  }
});

export default router;

