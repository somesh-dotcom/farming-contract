import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { PRICE_RANGES, AREA_MULTIPLIERS } from './realtimePrices';

dotenv.config();

const prisma = new PrismaClient();

// Generate historical price data for better date range coverage
async function generateHistoricalData() {
  console.log('🌱 Generating historical price data for better coverage...');
  
  const products = await prisma.product.findMany();
  const bangaloreAreas = Object.keys(AREA_MULTIPLIERS);
  
  let createdCount = 0;
  
  // Generate data for different time periods
  const timePeriods = [
    { days: 7, frequency: 1 },    // Every day for last 7 days
    { days: 30, frequency: 2 },   // Every 2 days for last 30 days  
    { days: 90, frequency: 5 },   // Every 5 days for last 90 days
    { days: 180, frequency: 10 }  // Every 10 days for last 180 days
  ];
  
  for (const product of products) {
    const range = PRICE_RANGES[product.category] || PRICE_RANGES.OTHERS;
    
    for (const area of bangaloreAreas) {
      const areaMultiplier = AREA_MULTIPLIERS[area];
      
      // Generate base price for this area
      const basePrice = range.min + Math.random() * (range.max - range.min);
      let currentPrice = basePrice * areaMultiplier;
      
      // Generate data for each time period
      for (const period of timePeriods) {
        const daysAgo = period.days;
        const frequency = period.frequency;
        
        // Generate multiple price points for better coverage
        for (let i = 0; i < Math.floor(daysAgo / frequency); i++) {
          const date = new Date();
          date.setDate(date.getDate() - (i * frequency));
          
          // Add realistic price variation
          const variation = (Math.random() * 0.1 - 0.05); // ±5% variation
          const price = Math.round(currentPrice * (1 + variation) * 100) / 100;
          
          // Ensure price stays within reasonable bounds
          const minPrice = range.min * 0.7;
          const maxPrice = range.max * 1.5;
          const finalPrice = Math.max(minPrice, Math.min(maxPrice, price));
          
          await prisma.marketPrice.create({
            data: {
              productId: product.id,
              price: finalPrice,
              unit: product.unit,
              location: `Bangalore - ${area}`,
              date: date
            }
          });
          
          createdCount++;
          
          // Update price for next iteration (small trend)
          currentPrice = currentPrice * (1 + (Math.random() * 0.02 - 0.01));
        }
      }
    }
    
    console.log(`✅ Generated historical data for ${product.name}`);
  }
  
  console.log(`🎉 Successfully created ${createdCount} historical price records!`);
  
  // Show updated statistics
  const stats = await prisma.marketPrice.aggregate({
    _count: { id: true },
    _avg: { price: true }
  });
  
  console.log(`\n📊 New Statistics:`);
  console.log(`Total Records: ${stats._count.id}`);
  console.log(`Average Price: ₹${stats._avg.price?.toFixed(2)}`);
}

// Improve existing data by adding more recent entries
async function enhanceRecentData() {
  console.log('📈 Enhancing recent data for better 7-30 day coverage...');
  
  const products = await prisma.product.findMany();
  const bangaloreAreas = Object.keys(AREA_MULTIPLIERS);
  
  let enhancedCount = 0;
  
  // Add more recent data points for each area
  for (const product of products) {
    const range = PRICE_RANGES[product.category] || PRICE_RANGES.OTHERS;
    
    for (const area of bangaloreAreas) {
      const areaMultiplier = AREA_MULTIPLIERS[area];
      const basePrice = range.min + Math.random() * (range.max - range.min);
      
      // Add 5-10 recent price entries for better 7-30 day coverage
      for (let i = 0; i < 5 + Math.floor(Math.random() * 6); i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random within last 30 days
        
        const variation = (Math.random() * 0.1 - 0.05);
        const price = Math.round(basePrice * areaMultiplier * (1 + variation) * 100) / 100;
        
        await prisma.marketPrice.create({
          data: {
            productId: product.id,
            price: price,
            unit: product.unit,
            location: `Bangalore - ${area}`,
            date: date
          }
        });
        
        enhancedCount++;
      }
    }
  }
  
  console.log(`✅ Enhanced recent data with ${enhancedCount} new records`);
}

// Main function
async function improveDataCoverage() {
  try {
    console.log('🚀 Improving market price data coverage...\n');
    
    // First, generate comprehensive historical data
    await generateHistoricalData();
    
    // Then enhance recent data for better short-term coverage
    await enhanceRecentData();
    
    // Verify improvements
    console.log('\n🔍 Verifying improvements...');
    
    const verificationData = await prisma.marketPrice.groupBy({
      by: ['location'],
      _count: { id: true },
      where: {
        date: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      }
    });
    
    console.log('\n📅 7-Day Coverage After Improvement:');
    verificationData
      .filter(item => item.location?.includes('Bangalore'))
      .forEach(item => {
        console.log(`${item.location}: ${item._count.id} records`);
      });
      
  } catch (error) {
    console.error('❌ Error improving data coverage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

improveDataCoverage();