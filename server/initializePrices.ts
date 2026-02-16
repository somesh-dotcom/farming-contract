import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Realistic price ranges for different product categories (in INR)
const PRICE_RANGES: Record<string, { min: number; max: number }> = {
  'GRAINS': { min: 25, max: 80 },      // per kg
  'VEGETABLES': { min: 15, max: 150 }, // per kg
  'FRUITS': { min: 30, max: 200 },     // per kg
  'SPICES': { min: 100, max: 800 },    // per kg
  'PULSES': { min: 40, max: 120 },     // per kg
  'OTHERS': { min: 20, max: 300 },     // per kg
};

// Bangalore area multipliers for location-based pricing
const AREA_MULTIPLIERS: Record<string, number> = {
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

const prisma = new PrismaClient();

async function initializeMarketPrices() {
  try {
    console.log('🌱 Initializing market prices...');
    
    // Get all products
    const products = await prisma.product.findMany();
    
    if (products.length === 0) {
      console.log('No products found. Please seed products first.');
      return;
    }
    
    // Bangalore areas
    const bangaloreAreas = Object.keys(AREA_MULTIPLIERS);
    
    let createdCount = 0;
    
    for (const product of products) {
      const range = PRICE_RANGES[product.category] || PRICE_RANGES.OTHERS;
      
      // Create initial prices for different areas
      for (let i = 0; i < 5; i++) { // 5 random areas per product
        const randomArea = bangaloreAreas[Math.floor(Math.random() * bangaloreAreas.length)];
        const areaMultiplier = AREA_MULTIPLIERS[randomArea];
        
        // Generate realistic initial price
        const basePrice = range.min + Math.random() * (range.max - range.min);
        const finalPrice = Math.round(basePrice * areaMultiplier * 100) / 100;
        
        await prisma.marketPrice.create({
          data: {
            productId: product.id,
            price: finalPrice,
            unit: product.unit,
            location: `Bangalore - ${randomArea}`
          }
        });
        
        createdCount++;
        console.log(`✅ Created price for ${product.name} in ${randomArea}: ₹${finalPrice}/${product.unit}`);
      }
      
      // Create one price without location (general market price)
      const generalPrice = range.min + Math.random() * (range.max - range.min);
      await prisma.marketPrice.create({
        data: {
          productId: product.id,
          price: Math.round(generalPrice * 100) / 100,
          unit: product.unit,
          location: null
        }
      });
      
      createdCount++;
      console.log(`✅ Created general price for ${product.name}: ₹${Math.round(generalPrice * 100) / 100}/${product.unit}`);
    }
    
    console.log(`🎉 Successfully initialized ${createdCount} market prices!`);
    
    // Show summary
    const priceStats = await prisma.marketPrice.aggregate({
      _count: { id: true },
      _avg: { price: true },
      _min: { price: true },
      _max: { price: true }
    });
    
    console.log('\n📊 Price Statistics:');
    console.log(`Total Prices: ${priceStats._count.id}`);
    console.log(`Average Price: ₹${priceStats._avg.price?.toFixed(2)}`);
    console.log(`Min Price: ₹${priceStats._min.price?.toFixed(2)}`);
    console.log(`Max Price: ₹${priceStats._max.price?.toFixed(2)}`);
    
  } catch (error) {
    console.error('❌ Error initializing market prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
initializeMarketPrices();