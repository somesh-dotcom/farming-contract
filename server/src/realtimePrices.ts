import { prisma } from './lib/prisma';
import { ProductCategory } from '@prisma/client';

// Realistic price ranges for different product categories (in INR)
export const PRICE_RANGES: Record<ProductCategory, { min: number; max: number }> = {
  GRAINS: { min: 25, max: 80 },      // per kg
  VEGETABLES: { min: 15, max: 150 }, // per kg
  FRUITS: { min: 30, max: 200 },     // per kg
  SPICES: { min: 100, max: 800 },    // per kg
  PULSES: { min: 40, max: 120 },     // per kg
  OTHERS: { min: 20, max: 300 },     // per kg
};

// Bangalore area multipliers for location-based pricing
export const AREA_MULTIPLIERS: Record<string, number> = {
  'Indiranagar': 1.25,
  'Koramangala': 1.20,
  'Whitefield': 1.15,
  'HSR Layout': 1.18,
  'BTM Layout': 1.10,
  'Jayanagar': 1.22,
  'Malleshwaram': 1.28,
  'Electronic City': 1.05,
  'Marathahalli': 1.17,
  'Bannerghatta': 1.08,
  'Hebbal': 1.12,
  'Yelahanka': 1.06,
  'Frazer Town': 1.19,
  'RT Nagar': 1.07,
  'Peenya': 1.04,
  'Banashankari': 1.13,
  'Basavanagudi': 1.26,
  'Wilson Garden': 1.21,
  'Ulsoor': 1.23,
  'KR Puram': 1.09,
};

// Time-based price fluctuations (morning surge, evening dip)
const getTimeMultiplier = (): number => {
  const hour = new Date().getHours();
  
  // Morning peak (6-10 AM): 5% increase
  if (hour >= 6 && hour < 10) return 1.05;
  
  // Evening dip (6-9 PM): 3% decrease
  if (hour >= 18 && hour < 21) return 0.97;
  
  // Night low (10 PM - 5 AM): 5% decrease
  if (hour >= 22 || hour < 6) return 0.95;
  
  // Normal hours: no change
  return 1.0;
};

// Seasonal multipliers (simplified - you can expand this)
const getSeasonalMultiplier = (category: ProductCategory): number => {
  const month = new Date().getMonth();
  
  switch (category) {
    case 'VEGETABLES':
      // Winter months (Dec-Feb): higher prices due to lower supply
      if (month >= 11 || month <= 1) return 1.15;
      // Summer months (Mar-May): lower prices due to higher supply
      if (month >= 2 && month <= 4) return 0.9;
      break;
    case 'FRUITS':
      // Summer harvest season (Apr-Jun): lower prices
      if (month >= 3 && month <= 5) return 0.85;
      // Monsoon season (Jul-Sep): higher prices
      if (month >= 6 && month <= 8) return 1.2;
      break;
  }
  
  return 1.0;
};

// Generate realistic price fluctuation
const generatePriceFluctuation = (currentPrice: number, category: ProductCategory): number => {
  // Base fluctuation: ±2-8% depending on category
  const maxFluctuation = category === 'GRAINS' ? 0.02 : 
                        category === 'VEGETABLES' ? 0.08 : 
                        category === 'FRUITS' ? 0.06 : 0.04;
  
  const fluctuation = (Math.random() * 2 - 1) * maxFluctuation;
  return currentPrice * (1 + fluctuation);
};

// Update prices for all products - creates new entries with today's date
export const updateAllPrices = async () => {
  try {
    console.log('🔄 Updating market price dates to today...');
    
    // Get all products
    const products = await prisma.product.findMany();
    
    if (products.length === 0) {
      console.log('No products found to update prices for');
      return;
    }
    
    let updatedCount = 0;
    
    for (const product of products) {
      // Get the latest price for this product
      const latestPrice = await prisma.marketPrice.findFirst({
        where: { productId: product.id },
        orderBy: { date: 'desc' }
      });
      
      if (!latestPrice) continue;
      
      // Create a new entry with today's date but SAME price
      await prisma.marketPrice.create({
        data: {
          productId: product.id,
          price: latestPrice.price,  // Keep the same price
          unit: latestPrice.unit,
          location: latestPrice.location,
          date: new Date()  // Update to current date/time
        }
      });
      
      updatedCount++;
      console.log(`📅 Updated ${product.name} date to today - Price: ₹${latestPrice.price}`);
    }
    
    console.log(`✅ Market price date update completed. Updated ${updatedCount} products to today's date.`);
    
  } catch (error) {
    console.error('❌ Error updating market price dates:', error);
  }
};

// Initialize daily date updates
export const startRealTimePriceUpdates = () => {
  console.log('🚀 Starting daily market price date updates...');
  
  // Update dates immediately on startup
  updateAllPrices();
  
  // Update dates once per day at midnight (calculate time until next midnight)
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const msUntilMidnight = tomorrow.getTime() - now.getTime();
  
  console.log(`⏰ Next date update scheduled at midnight (${msUntilMidnight / 1000 / 60} minutes from now)`);
  
  // First update at next midnight
  setTimeout(() => {
    updateAllPrices();
    // Then update every 24 hours
    setInterval(updateAllPrices, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
};

// Get price trend indicator
export const getPriceTrend = (prices: any[], hours: number = 24) => {
  if (prices.length < 2) return 'stable';
  
  const recentPrices = prices.slice(0, Math.min(prices.length, hours));
  const firstPrice = recentPrices[recentPrices.length - 1].price;
  const lastPrice = recentPrices[0].price;
  
  const change = ((lastPrice - firstPrice) / firstPrice) * 100;
  
  if (change > 2) return 'up';
  if (change < -2) return 'down';
  return 'stable';
};