/**
 * Bangalore Market Price Updater
 * Updates real-time market prices for Bangalore areas only
 * Does not modify any existing project files - only updates price data
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG_FILE = path.join(__dirname, '..', 'config', 'marketPrices.json');
const BANGALORE_AREAS = [
  'Yeshwanthpur',
  'KR Market',
  'Majestic',
  'Jayanagar',
  'Indiranagar',
  'Koramangala',
  'Whitefield',
  'HSR Layout',
  'Electronic City',
  'Malleshwaram',
  'Rajajinagar',
  'BTM Layout'
];

// Sample products with base prices
const PRODUCTS = {
  'prod_001': { name: 'Wheat', basePrice: 2500, unit: 'kg' },
  'prod_002': { name: 'Rice', basePrice: 3500, unit: 'kg' },
  'prod_003': { name: 'Tomato', basePrice: 40, unit: 'kg' },
  'prod_004': { name: 'Potato', basePrice: 30, unit: 'kg' },
  'prod_005': { name: 'Mango', basePrice: 150, unit: 'kg' },
  'prod_006': { name: 'Onion', basePrice: 35, unit: 'kg' },
  'prod_007': { name: 'Chilli', basePrice: 120, unit: 'kg' },
  'prod_008': { name: 'Carrot', basePrice: 50, unit: 'kg' }
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
 * Get current timestamp in ISO format
 * @returns {string} ISO timestamp
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Load existing market prices from file
 * @returns {Array} Existing prices array
 */
function loadExistingPrices() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error loading existing prices:', error.message);
  }
  return [];
}

/**
 * Save updated prices to file
 * @param {Array} prices - Prices array to save
 */
function savePrices(prices) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(prices, null, 2), 'utf8');
    console.log(`✓ Saved ${prices.length} prices to ${CONFIG_FILE}`);
  } catch (error) {
    console.error('Error saving prices:', error.message);
  }
}

/**
 * Update Bangalore market prices
 * @param {boolean} appendOnly - If true, only add new prices without removing old ones
 */
function updateBangalorePrices(appendOnly = true) {
  console.log('========================================');
  console.log('Bangalore Market Price Updater');
  console.log('========================================\n');
  
  let existingPrices = loadExistingPrices();
  
  // If not append only, filter out old Bangalore prices
  if (!appendOnly) {
    existingPrices = existingPrices.filter(price => 
      !(price.location === 'Bangalore' && BANGALORE_AREAS.includes(price.area))
    );
    console.log('✓ Removed old Bangalore prices\n');
  }
  
  const newPrices = [];
  const timestamp = getCurrentTimestamp();
  
  // Generate prices for each product in each Bangalore area
  BANGALORE_AREAS.forEach(area => {
    Object.entries(PRODUCTS).forEach(([productId, product]) => {
      const price = generatePriceVariation(product.basePrice);
      
      newPrices.push({
        id: `price_${productId}_${area.replace(/\s/g, '')}_${Date.now()}`,
        productId: productId,
        productName: product.name,
        price: price,
        currency: 'INR',
        unit: product.unit,
        location: 'Bangalore',
        area: area,
        timestamp: timestamp
      });
    });
  });
  
  // Combine existing and new prices
  const allPrices = [...existingPrices, ...newPrices];
  
  // Save to file
  savePrices(allPrices);
  
  // Display summary
  console.log('\n📊 Price Update Summary:');
  console.log('----------------------------------------');
  console.log(`Areas Updated: ${BANGALORE_AREAS.length}`);
  console.log(`Products per Area: ${Object.keys(PRODUCTS).length}`);
  console.log(`Total New Prices: ${newPrices.length}`);
  console.log(`Total Prices in File: ${allPrices.length}`);
  console.log(`\nLast Updated: ${timestamp}`);
  
  // Display sample prices
  console.log('\n📋 Sample Updated Prices:');
  console.log('----------------------------------------');
  const samplePrices = newPrices.slice(0, 5);
  samplePrices.forEach(price => {
    console.log(`${price.productName.padEnd(10)} in ${price.area.padEnd(20)}: ₹${price.price.toLocaleString()} per ${price.unit}`);
  });
  
  console.log('\n✅ Bangalore market prices updated successfully!');
  console.log('\nNote: This script only updates the marketPrices.json file.');
  console.log('No other project files were modified.');
}

// Run the update
console.log('\nUsage:');
console.log('  node updateBangalorePrices.js              # Append new prices (keeps old ones)');
console.log('  node updateBangalorePrices.js --replace    # Replace old Bangalore prices');
console.log('');

const replaceMode = process.argv.includes('--replace');
updateBangalorePrices(!replaceMode);
