const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generate180DaysPriceHistory() {
  try {
    console.log('🌱 Generating 180 days of price history with daily updates...');
    
    // Get all products
    const products = await prisma.product.findMany();
    
    if (products.length === 0) {
      console.log('No products found');
      return;
    }
    
    // All Bangalore areas
    const bangaloreAreas = [
      'Bangalore - Indiranagar', 'Bangalore - Koramangala', 'Bangalore - Whitefield',
      'Bangalore - HSR Layout', 'Bangalore - BTM Layout', 'Bangalore - Jayanagar',
      'Bangalore - Malleshwaram', 'Bangalore - Electronic City', 'Bangalore - Marathahalli',
      'Bangalore - Bannerghatta', 'Bangalore - Hebbal', 'Bangalore - Yelahanka',
      'Bangalore - Frazer Town', 'Bangalore - RT Nagar', 'Bangalore - Peenya',
      'Bangalore - Banashankari', 'Bangalore - Basavanagudi', 'Bangalore - Wilson Garden',
      'Bangalore - Ulsoor', 'Bangalore - KR Puram', 'Bangalore'
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
    
    // Area multipliers (different pricing for different areas)
    const areaMultipliers = {
      'Bangalore - Indiranagar': 1.25,
      'Bangalore - Koramangala': 1.20,
      'Bangalore - Whitefield': 1.15,
      'Bangalore - HSR Layout': 1.18,
      'Bangalore - BTM Layout': 1.10,
      'Bangalore - Jayanagar': 1.22,
      'Bangalore - Malleshwaram': 1.28,
      'Bangalore - Electronic City': 1.05,
      'Bangalore - Marathahalli': 1.17,
      'Bangalore - Bannerghatta': 1.08,
      'Bangalore - Hebbal': 1.12,
      'Bangalore - Yelahanka': 1.06,
      'Bangalore - Frazer Town': 1.19,
      'Bangalore - RT Nagar': 1.07,
      'Bangalore - Peenya': 1.04,
      'Bangalore - Banashankari': 1.13,
      'Bangalore - Basavanagudi': 1.26,
      'Bangalore - Wilson Garden': 1.21,
      'Bangalore - Ulsoor': 1.23,
      'Bangalore - KR Puram': 1.09,
      'Bangalore': 1.12
    };
    
    const today = new Date();
    const pricesToAdd = [];
    
    console.log('Generating daily prices for 180 days...');
    
    // Generate daily prices for each area and product
    for (const area of bangaloreAreas) {
      const areaMultiplier = areaMultipliers[area] || 1.12;
      
      for (const product of products) {
        const range = priceRanges[product.category] || priceRanges.OTHERS;
        let currentPrice = (range.min + range.max) / 2 * areaMultiplier;
        
        // Generate 180 daily prices (one per day for 180 days)
        for (let day = 0; day < 180; day++) {
          const date = new Date(today);
          date.setDate(date.getDate() - day);
          
          // Apply daily fluctuation (±2-5% random variation)
          const dailyChange = (Math.random() * 0.10 - 0.05); // -5% to +5%
          currentPrice = currentPrice * (1 + dailyChange);
          
          // Ensure price stays within reasonable bounds
          const minPrice = range.min * 0.7 * areaMultiplier;
          const maxPrice = range.max * 1.5 * areaMultiplier;
          currentPrice = Math.max(minPrice, Math.min(maxPrice, currentPrice));
          
          // Round to 2 decimal places
          const price = Math.round(currentPrice * 100) / 100;
          
          pricesToAdd.push({
            productId: product.id,
            price: price,
            unit: product.unit,
            location: area,
            date: date
          });
        }
        
        console.log(`✅ Generated 180 days for ${product.name} in ${area}`);
      }
    }
    
    console.log(`\n📦 Creating ${pricesToAdd.length} prices for 180 days history...`);
    
    // Insert in batches to avoid memory issues
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < pricesToAdd.length; i += batchSize) {
      const batch = pricesToAdd.slice(i, i + batchSize);
      await prisma.marketPrice.createMany({
        data: batch,
        skipDuplicates: true
      });
      
      insertedCount += batch.length;
      if (i % 1000 === 0) {
        console.log(`✅ Processed ${i}/${pricesToAdd.length} prices...`);
      }
    }
    
    console.log(`✅ Successfully added ${insertedCount} prices for 180 days history!`);
    
    // Verify the results
    console.log('\n📊 Verification:');
    const totalPrices = await prisma.marketPrice.count();
    const oldestPrice = await prisma.marketPrice.findFirst({ orderBy: { date: 'asc' } });
    const newestPrice = await prisma.marketPrice.findFirst({ orderBy: { date: 'desc' } });
    
    console.log(`Total prices in database: ${totalPrices}`);
    console.log(`Date range: ${Math.floor((new Date(newestPrice?.date) - new Date(oldestPrice?.date)) / (1000 * 60 * 60 * 24))} days`);
    console.log(`Oldest price date: ${oldestPrice?.date}`);
    console.log(`Newest price date: ${newestPrice?.date}`);
    
    // Check if we have 180 days for each area
    for (const area of bangaloreAreas.slice(0, 5)) { // Check first 5 areas
      const areaCount = await prisma.marketPrice.count({
        where: { location: area }
      });
      console.log(`${area}: ${areaCount} prices`);
    }
    
  } catch (error) {
    console.error('❌ Error generating price history:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generate180DaysPriceHistory();