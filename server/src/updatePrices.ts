import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// More realistic price ranges for agricultural products in India (as of 2025)
// Focused on affordable prices for small-scale farmers
const realisticPriceRanges: { [key: string]: { min: number; max: number } } = {
  GRAINS: { min: 1500, max: 2500 },      // per quintal (Affordable range for farmers)
  VEGETABLES: { min: 15, max: 50 },       // per kg
  FRUITS: { min: 30, max: 100 },          // per kg
  SPICES: { min: 150, max: 500 },         // per kg
  PULSES: { min: 60, max: 120 },          // per kg
  OTHERS: { min: 40, max: 120 },          // per kg
};

// Bangalore area multipliers (slightly higher due to urban demand)
const bangaloreMultiplier = 1.15;

async function updateMarketPrices() {
  console.log('🔄 Updating market prices to realistic values...');
  
  // Get all products
  const products = await prisma.product.findMany();
  console.log(`📦 Found ${products.length} products`);
  
  let updatedCount = 0;
  
  // Update prices for each product
  for (const product of products) {
    const range = realisticPriceRanges[product.category] || realisticPriceRanges.OTHERS;
    
    // Get all prices for this product
    const productPrices = await prisma.marketPrice.findMany({
      where: {
        productId: product.id
      }
    });
    
    console.log(`\nUpdating prices for ${product.name} (${product.category}) - ${productPrices.length} records`);
    
    // Update each price with a realistic value
    for (const price of productPrices) {
      // Base price from realistic range
      const basePrice = range.min + Math.random() * (range.max - range.min);
      
      // Adjust for Bangalore areas (slightly higher)
      let adjustedPrice = basePrice;
      if (price.location && price.location.includes('Bangalore')) {
        adjustedPrice = basePrice * bangaloreMultiplier;
      }
      
      // Add some variation (-10% to +10%)
      const variation = (Math.random() * 0.2 - 0.1); // -10% to +10%
      const finalPrice = Math.round(adjustedPrice * (1 + variation));
      
      // Ensure price is positive
      const priceValue = Math.max(1, finalPrice);
      
      await prisma.marketPrice.update({
        where: { id: price.id },
        data: { price: priceValue }
      });
      
      updatedCount++;
      if (updatedCount % 1000 === 0) {
        console.log(`✅ Updated ${updatedCount} market prices`);
      }
    }
  }
  
  console.log(`✅ Successfully updated ${updatedCount} market prices with realistic values`);
}

async function main() {
  console.log('🌱 Starting price update to realistic values...');
  
  try {
    await updateMarketPrices();
    console.log('🎉 All prices successfully updated to realistic values!');
    
    // Show some statistics after update
    const priceStats = await prisma.marketPrice.aggregate({
      _avg: {
        price: true
      },
      _min: {
        price: true
      },
      _max: {
        price: true
      },
      _count: {
        price: true
      }
    });
    
    console.log('\n📊 Updated Price Statistics:');
    console.log('----------------------------------------');
    console.log(`Average Price: ₹${priceStats._avg.price?.toFixed(2)}`);
    console.log(`Minimum Price: ₹${priceStats._min.price?.toFixed(2)}`);
    console.log(`Maximum Price: ₹${priceStats._max.price?.toFixed(2)}`);
    console.log(`Total Records: ${priceStats._count.price}`);
    
  } catch (error) {
    console.error('❌ Error updating prices:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();