/**
 * Update Bangalore Market Prices
 * Updates prices for specific Bangalore areas with ingredient/product values
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Bangalore areas to update (from checkBangaloreAreas.js lines 8-15)
const BANGALORE_AREAS = [
  'Bangalore - Indiranagar',
  'Bangalore - Koramangala',
  'Bangalore - Whitefield',
  'Bangalore - HSR Layout',
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
  'Bangalore - KR Puram',
  'Bangalore' // General Bangalore
];

// Products/Ingredients with base prices
const INGREDIENTS = {
  'Wheat': { basePrice: 2500, unit: 'kg', category: 'GRAINS' },
  'Rice': { basePrice: 3500, unit: 'kg', category: 'GRAINS' },
  'Tomato': { basePrice: 40, unit: 'kg', category: 'VEGETABLES' },
  'Potato': { basePrice: 30, unit: 'kg', category: 'VEGETABLES' },
  'Mango': { basePrice: 150, unit: 'kg', category: 'FRUITS' },
  'Onion': { basePrice: 35, unit: 'kg', category: 'VEGETABLES' },
  'Chilli': { basePrice: 120, unit: 'kg', category: 'VEGETABLES' },
  'Carrot': { basePrice: 50, unit: 'kg', category: 'VEGETABLES' },
  'Beans': { basePrice: 60, unit: 'kg', category: 'VEGETABLES' },
  'Banana': { basePrice: 50, unit: 'kg', category: 'FRUITS' },
  'Apple': { basePrice: 150, unit: 'kg', category: 'FRUITS' },
  'Turmeric': { basePrice: 1100, unit: 'kg', category: 'SPICES' },
  'Lentil': { basePrice: 160, unit: 'kg', category: 'PULSES' },
  'Bengal Gram': { basePrice: 165, unit: 'kg', category: 'PULSES' },
  'Black Gram': { basePrice: 170, unit: 'kg', category: 'PULSES' },
  'Groundnut': { basePrice: 420, unit: 'kg', category: 'OILSEEDS' },
  'Maize': { basePrice: 110, unit: 'kg', category: 'GRAINS' },
  'Mustard': { basePrice: 410, unit: 'kg', category: 'OILSEEDS' },
  'Ginger': { basePrice: 1100, unit: 'kg', category: 'SPICES' },
  'Green Gram': { basePrice: 170, unit: 'kg', category: 'PULSES' },
  'Jowar': { basePrice: 110, unit: 'kg', category: 'GRAINS' },
  'Ragi': { basePrice: 110, unit: 'kg', category: 'GRAINS' },
  'Sesamum': { basePrice: 415, unit: 'kg', category: 'OILSEEDS' },
  'Bajra': { basePrice: 110, unit: 'kg', category: 'GRAINS' }
};

/**
 * Generate realistic price variation
 * @param {number} basePrice - Base price
 * @param {number} variance - Percentage variance (e.g., 10 for ±10%)
 * @returns {number} New price with variation
 */
function generatePriceVariation(basePrice, variance = 10) {
  const variation = (Math.random() * variance * 2 - variance) / 100;
  return Math.round(basePrice * (1 + variation));
}

/**
 * Update prices for Bangalore areas
 */
async function updateBangalorePrices() {
  console.log('========================================');
  console.log('Updating Bangalore Market Prices');
  console.log('========================================\n');
  
  let totalUpdated = 0;
  const timestamp = new Date();
  
  for (const area of BANGALORE_AREAS) {
    console.log(`\n📍 Updating ${area}...`);
    
    for (const [ingredientName, data] of Object.entries(INGREDIENTS)) {
      try {
        // Find product by name
        const product = await prisma.product.findFirst({
          where: { name: ingredientName }
        });
        
        if (!product) {
          console.log(`  ⚠️  Product ${ingredientName} not found in database`);
          continue;
        }
        
        // Generate price with variation
        const price = generatePriceVariation(data.basePrice);
        
        // Create market price entry
        await prisma.marketPrice.create({
          data: {
            productId: product.id,
            location: area,
            price: price,
            unit: data.unit,
            date: timestamp
          }
        });
        
        totalUpdated++;
        
        // Log sample updates
        if (totalUpdated <= 5 || totalUpdated % 50 === 0) {
          console.log(`  ✅ ${ingredientName}: ₹${price}/${data.unit}`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error updating ${ingredientName}: ${error.message}`);
      }
    }
  }
  
  console.log('\n========================================');
  console.log('✅ Update Complete!');
  console.log('========================================');
  console.log(`Total prices updated: ${totalUpdated}`);
  console.log(`Areas covered: ${BANGALORE_AREAS.length}`);
  console.log(`Ingredients per area: ${Object.keys(INGREDIENTS).length}`);
  console.log(`Timestamp: ${timestamp.toISOString()}`);
}

// Run the update
updateBangalorePrices()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
