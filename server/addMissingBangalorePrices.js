const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMissingBangalorePrices() {
  try {
    console.log('🌱 Adding prices for missing Bangalore areas...');
    
    // Get all products
    const products = await prisma.product.findMany();
    
    if (products.length === 0) {
      console.log('No products found');
      return;
    }
    
    // All Bangalore areas that need prices
    const missingAreas = [
      'Bangalore - BTM Layout',
      'Bangalore - Jayanagar', 
      'Bangalore - Malleshwaram',
      'Bangalore - Electronic City',
      'Bangalore - Marathahalli',
      'Bangalore - Bannerghatta',
      'Bangalore - Hebbal',
      'Bangalore - Yelahanka',
      'Bangalore - Frazer Town',
      'Bangalore - RT Nagar',
      'Bangalore - Peenya',
      'Bangalore - Banashankari',
      'Bangalore - Basavanagudi',
      'Bangalore - Wilson Garden',
      'Bangalore - Ulsoor',
      'Bangalore - KR Puram'
    ];
    
    // Price ranges by category
    const priceRanges = {
      GRAINS: { min: 1800, max: 2800 },      // per quintal
      VEGETABLES: { min: 25, max: 75 },      // per kg
      FRUITS: { min: 50, max: 140 },         // per kg
      SPICES: { min: 250, max: 450 },        // per kg
      PULSES: { min: 70, max: 140 },         // per kg
      OTHERS: { min: 60, max: 180 }          // per kg
    };
    
    const today = new Date();
    const pricesToAdd = [];
    
    // Generate 10-15 prices per area per product
    for (const area of missingAreas) {
      for (const product of products) {
        const range = priceRanges[product.category] || priceRanges.OTHERS;
        const basePrice = (range.min + range.max) / 2;
        
        // Generate 12-18 prices per product per area (different time periods)
        const numPrices = Math.floor(Math.random() * 7) + 12;
        
        for (let i = 0; i < numPrices; i++) {
          // Random date within last 90 days
          const daysAgo = Math.floor(Math.random() * 90);
          const date = new Date(today);
          date.setDate(date.getDate() - daysAgo);
          
          // Apply Bangalore area multiplier (slightly higher than base)
          const areaMultiplier = 1.05 + (Math.random() * 0.15); // 1.05-1.20
          const price = Math.round(basePrice * areaMultiplier * (0.85 + Math.random() * 0.3) * 100) / 100;
          
          pricesToAdd.push({
            productId: product.id,
            price: price,
            unit: product.unit,
            location: area,
            date: date
          });
        }
      }
    }
    
    console.log(`📦 Creating ${pricesToAdd.length} prices for ${missingAreas.length} Bangalore areas...`);
    
    // Insert in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < pricesToAdd.length; i += batchSize) {
      const batch = pricesToAdd.slice(i, i + batchSize);
      await prisma.marketPrice.createMany({
        data: batch,
        skipDuplicates: true
      });
      
      if (i % 500 === 0) {
        console.log(`✅ Processed ${i}/${pricesToAdd.length} prices...`);
      }
    }
    
    console.log(`✅ Successfully added ${pricesToAdd.length} prices for missing Bangalore areas!`);
    
    // Verify the results
    console.log('\n📊 Verification:');
    for (const area of missingAreas) {
      const count = await prisma.marketPrice.count({
        where: { location: area }
      });
      console.log(`${area}: ${count} prices`);
    }
    
  } catch (error) {
    console.error('❌ Error adding prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingBangalorePrices();