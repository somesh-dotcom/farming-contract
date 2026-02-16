import { PrismaClient } from '@prisma/client';
import { PRICE_RANGES, AREA_MULTIPLIERS } from './realtimePrices';

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