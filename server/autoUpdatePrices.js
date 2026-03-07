/**
 * Bangalore Market Price Auto-Updater
 * Automatically updates prices at regular intervals
 * Only updates config/marketPrices.json - no other files modified
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '..', 'config', 'marketPrices.json');

// Bangalore areas to update
const BANGALORE_AREAS = [
  'Yeshwanthpur', 'KR Market', 'Majestic', 'Jayanagar',
  'Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout',
  'Electronic City', 'Malleshwaram', 'Rajajinagar', 'BTM Layout'
];

// Products with realistic base prices for Bangalore
const PRODUCTS = {
  'prod_001': { name: 'Wheat', basePrice: 2500, variance: 8 },
  'prod_002': { name: 'Rice', basePrice: 3500, variance: 10 },
  'prod_003': { name: 'Tomato', basePrice: 40, variance: 15 },
  'prod_004': { name: 'Potato', basePrice: 30, variance: 12 },
  'prod_005': { name: 'Mango', basePrice: 150, variance: 20 },
  'prod_006': { name: 'Onion', basePrice: 35, variance: 15 },
  'prod_007': { name: 'Chilli', basePrice: 120, variance: 10 },
  'prod_008': { name: 'Carrot', basePrice: 50, variance: 12 },
  'prod_009': { name: 'Beans', basePrice: 60, variance: 15 },
  'prod_010': { name: 'Cabbage', basePrice: 35, variance: 12 }
};

/**
 * Generate price with time-based variation
 * Prices change slightly based on time of day (higher during peak hours)
 */
function generateRealtimePrice(basePrice, variance) {
  const hour = new Date().getHours();
  
  // Peak hours (9 AM - 12 PM and 5 PM - 8 PM) have slightly higher prices
  const isPeakHour = (hour >= 9 && hour <= 12) || (hour >= 17 && hour <= 20);
  const peakMultiplier = isPeakHour ? 1.02 : 0.98;
  
  // Random daily variation
  const randomVariation = (Math.random() * variance * 2 - variance) / 100;
  
  // Calculate final price
  const finalPrice = basePrice * peakMultiplier * (1 + randomVariation);
  
  return Math.round(finalPrice);
}

/**
 * Update prices in the JSON file
 */
function updatePrices() {
  console.log('\n========================================');
  console.log(`Auto-Update: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log('========================================');
  
  // Load existing prices
  let existingPrices = [];
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf8');
      existingPrices = JSON.parse(content);
    }
  } catch (error) {
    console.error('Error loading prices:', error.message);
    return;
  }
  
  // Remove old Bangalore prices (older than 1 hour)
  const oneHourAgo = new Date(Date.now() - (60 * 60 * 1000)).toISOString();
  existingPrices = existingPrices.filter(price => {
    const isBangalore = !(price.location === 'Bangalore' && BANGALORE_AREAS.includes(price.area));
    const isOld = price.timestamp < oneHourAgo;
    return !isBangalore || !isOld;
  });
  
  // Generate new prices
  const timestamp = new Date().toISOString();
  const newPrices = [];
  
  BANGALORE_AREAS.forEach(area => {
    Object.entries(PRODUCTS).forEach(([productId, product]) => {
      const price = generateRealtimePrice(product.basePrice, product.variance);
      
      newPrices.push({
        id: `price_${productId}_${area.replace(/\s/g, '')}_${Date.now()}`,
        productId: productId,
        productName: product.name,
        price: price,
        currency: 'INR',
        unit: 'kg',
        location: 'Bangalore',
        area: area,
        timestamp: timestamp
      });
    });
  });
  
  // Combine and save
  const allPrices = [...existingPrices, ...newPrices];
  
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(allPrices, null, 2), 'utf8');
    
    console.log(`✓ Updated ${newPrices.length} prices for ${BANGALORE_AREAS.length} Bangalore areas`);
    console.log(`✓ Total prices in file: ${allPrices.length}`);
    
    // Show sample updates
    console.log('\nSample Updates:');
    newPrices.slice(0, 3).forEach(p => {
      console.log(`  ${p.productName} in ${p.area}: ₹${p.price.toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('✗ Error saving prices:', error.message);
  }
}

// Configuration
const UPDATE_INTERVAL_MINUTES = process.env.PRICE_UPDATE_INTERVAL || 60; // Default: every 60 minutes
const ENABLE_AUTO_UPDATE = process.env.ENABLE_AUTO_UPDATE !== 'false'; // Default: enabled

if (ENABLE_AUTO_UPDATE) {
  console.log('\n🕐 Bangalore Market Price Auto-Updater Started');
  console.log(`   Update Interval: Every ${UPDATE_INTERVAL_MINUTES} minutes`);
  console.log(`   Areas: ${BANGALORE_AREAS.length} Bangalore locations`);
  console.log(`   Products: ${Object.keys(PRODUCTS).length} commodities`);
  console.log('\nPress Ctrl+C to stop\n');
  
  // Run immediately
  updatePrices();
  
  // Schedule regular updates
  setInterval(updatePrices, UPDATE_INTERVAL_MINUTES * 60 * 1000);
} else {
  console.log('Auto-update is disabled. Set ENABLE_AUTO_UPDATE=true to enable.');
}
