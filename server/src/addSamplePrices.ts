import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adding sample market prices with state-specific variations...');

  // Get all products
  const products = await prisma.product.findMany();
  
  if (products.length === 0) {
    console.log('❌ No products found. Please run seed first.');
    return;
  }

  // State-specific price multipliers (based on Indian market variations)
  const stateMultipliers: { [key: string]: number } = {
    'Punjab': 0.95,           // Lower prices (agricultural hub)
    'Haryana': 0.97,
    'Uttar Pradesh': 0.92,    // Lower prices
    'Maharashtra': 1.05,      // Higher prices (urban demand)
    'Karnataka': 1.03,
    'Tamil Nadu': 1.08,       // Higher prices
    'Gujarat': 1.00,          // Base price
    'West Bengal': 1.02,
    'Rajasthan': 0.98,
    'Madhya Pradesh': 0.94,
    'Andhra Pradesh': 1.01,
    'Telangana': 1.04,
    'Kerala': 1.10,           // Highest prices (high demand)
    'Delhi': 1.15,            // Highest (urban premium)
    'Bihar': 0.90,            // Lower prices
    'Odisha': 0.96,
    'Assam': 1.06,
    'Jharkhand': 0.93,
    'Chhattisgarh': 0.91,
  };

  // Add Bangalore with a higher multiplier (metropolitan area)
  const bangaloreMultiplier = 1.12; // Higher than Delhi due to tech hub status
  
  // Base price ranges for different categories (in ₹)
  const basePriceRanges: { [key: string]: { min: number; max: number } } = {
    GRAINS: { min: 1800, max: 2800 },      // per quintal
    VEGETABLES: { min: 25, max: 75 },      // per kg
    FRUITS: { min: 50, max: 140 },         // per kg
    SPICES: { min: 250, max: 450 },        // per kg
    PULSES: { min: 70, max: 140 },         // per kg
    OTHERS: { min: 60, max: 180 },         // per kg
  };

  const states = Object.keys(stateMultipliers);
  // Add Bangalore as a separate entry
  const locations = [...states, 'Bangalore'];
  
  const today = new Date();
  const pricesToAdd: any[] = [];

  for (const product of products) {
    const range = basePriceRanges[product.category] || basePriceRanges.OTHERS;
    const basePrice = (range.min + range.max) / 2;

    // Generate prices for each location over last 90 days
    for (const location of locations) {
      // Use state multiplier for the base, or Bangalore multiplier
      const multiplier = location === 'Bangalore' 
        ? bangaloreMultiplier 
        : stateMultipliers[location] || 1.0;
        
      let locationBasePrice = basePrice * multiplier;

      // Generate prices for this location (every 4-7 days)
      for (let daysAgo = 0; daysAgo < 90; daysAgo += Math.floor(Math.random() * 4) + 4) {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);

        // Add some random variation (±8-15%)
        const variation = (Math.random() * 0.15 - 0.075); // -7.5% to +7.5%
        const price = Math.round(locationBasePrice * (1 + variation) * 100) / 100;

        pricesToAdd.push({
          productId: product.id,
          price: price,
          unit: product.unit,
          location: location,
          date: date,
        });

        // Update base price slightly for next iteration (trend)
        locationBasePrice += (Math.random() * 0.04 - 0.02) * locationBasePrice;
      }
    }
    
    // Also add some specific Bangalore area prices with slight variations
    const bangaloreAreas = [
      'Bangalore - Indiranagar', 
      'Bangalore - Koramangala', 
      'Bangalore - Whitefield',
      'Bangalore - HSR Layout'
    ];
    
    for (const area of bangaloreAreas) {
      // Slightly higher prices for specific areas
      const areaMultiplier = bangaloreMultiplier * (1 + Math.random() * 0.05); // 0-5% higher
      let areaBasePrice = basePrice * areaMultiplier;

      // Generate fewer prices for areas (every 7-10 days)
      for (let daysAgo = 0; daysAgo < 90; daysAgo += Math.floor(Math.random() * 4) + 7) {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);

        // Add some random variation (±8-15%)
        const variation = (Math.random() * 0.15 - 0.075); // -7.5% to +7.5%
        const price = Math.round(areaBasePrice * (1 + variation) * 100) / 100;

        pricesToAdd.push({
          productId: product.id,
          price: price,
          unit: product.unit,
          location: area,
          date: date,
        });

        // Update base price slightly for next iteration (trend)
        areaBasePrice += (Math.random() * 0.04 - 0.02) * areaBasePrice;
      }
    }
  }

  // Insert all prices
  console.log(`📦 Inserting ${pricesToAdd.length} prices...`);
  for (const priceData of pricesToAdd) {
    await prisma.marketPrice.create({
      data: priceData,
    });
  }

  console.log(`✅ Added ${pricesToAdd.length} market prices for ${products.length} products`);
  console.log(`📍 Prices distributed across ${locations.length} locations including Bangalore and its areas`);
  console.log('📊 Price history spans the last 90 days with location-specific variations');
}

main()
  .catch((e) => {
    console.error('❌ Failed to add sample prices:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
