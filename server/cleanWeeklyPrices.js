/**
 * Weekly Market Price Cleaner
 * Removes daily prices and keeps only ONE price per product per area (latest weekly snapshot)
 * Only modifies config/marketPrices.json - no other project files changed
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '..', 'config', 'marketPrices.json');

/**
 * Load existing prices from file
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
 * Save cleaned prices to file
 */
function savePrices(prices) {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(prices, null, 2), 'utf8');
    console.log(`✓ Saved ${prices.length} prices to ${CONFIG_FILE}`);
  } catch (error) {
    console.error('Error saving prices:', error.message);
  }
}

/**
 * Keep only latest price per product per area (weekly snapshot)
 */
function keepOnlyWeeklyPrices() {
  console.log('========================================');
  console.log('Weekly Market Price Cleaner');
  console.log('========================================\n');
  
  let allPrices = loadExistingPrices();
  
  console.log(`📊 Current Status:`);
  console.log(`   Total prices in file: ${allPrices.length}`);
  console.log(`   Date range: ${allPrices.length > 0 ? 'Various dates' : 'No data'}`);
  console.log('');
  
  // Group by product + area combination
  const priceMap = new Map();
  
  allPrices.forEach(price => {
    const key = `${price.productId}_${price.area}`;
    const existing = priceMap.get(key);
    
    // Keep the latest price for each product+area combination
    if (!existing || new Date(price.timestamp) > new Date(existing.timestamp)) {
      priceMap.set(key, price);
    }
  });
  
  // Convert map back to array
  const weeklyPrices = Array.from(priceMap.values());
  
  // Sort by area and product
  weeklyPrices.sort((a, b) => {
    if (a.area !== b.area) return a.area.localeCompare(b.area);
    return a.productName.localeCompare(b.productName);
  });
  
  // Calculate statistics
  const uniqueAreas = [...new Set(weeklyPrices.map(p => p.area))];
  const uniqueProducts = [...new Set(weeklyPrices.map(p => p.productId))];
  
  console.log(`📈 CLEANING RESULTS:`);
  console.log(`========================================`);
  console.log(`❌ Removed: ${allPrices.length - weeklyPrices.length} duplicate/daily prices`);
  console.log(`✅ Kept: ${weeklyPrices.length} weekly snapshot prices`);
  console.log(`📍 Unique Areas: ${uniqueAreas.length}`);
  console.log(`📦 Unique Products: ${uniqueProducts.length}`);
  console.log(`📅 Snapshot Date: ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log('');
  
  // Category breakdown
  const categories = {};
  weeklyPrices.forEach(p => {
    const cat = p.category || 'OTHER';
    categories[cat] = (categories[cat] || 0) + 1;
  });
  
  console.log(`📊 WEEKLY SNAPSHOT BY CATEGORY:`);
  console.log(`----------------------------------------`);
  Object.entries(categories).forEach(([category, count]) => {
    console.log(`${category.padEnd(15)}: ${count} prices (${Math.round(count/uniqueAreas.length)} products × ${uniqueAreas.length} areas)`);
  });
  console.log('');
  
  // Sample prices
  console.log(`📋 SAMPLE WEEKLY PRICES (Latest Snapshot):`);
  console.log(`----------------------------------------`);
  const samplePrices = weeklyPrices.slice(0, 10);
  samplePrices.forEach(p => {
    console.log(`${p.productName.padEnd(15)} in ${p.area.padEnd(25)}: ₹${p.price.toLocaleString()} per ${p.unit}`);
  });
  console.log('');
  
  // Save cleaned prices
  savePrices(weeklyPrices);
  
  console.log(`✅ Weekly price cleanup complete!`);
  console.log(`\n📝 What changed:`);
  console.log(`   • Removed all daily price variations`);
  console.log(`   • Kept only LATEST price per product per area`);
  console.log(`   • One snapshot per week (current week's prices)`);
  console.log(`   • No historical daily data retained`);
  console.log(`\n📝 Note: This script ONLY updates config/marketPrices.json`);
  console.log(`   No database, routes, components, or other files modified!`);
}

// Main execution
console.log('\n🧹 Weekly Market Price Cleaner\n');
console.log('This will remove daily prices and keep only ONE latest price per product per area.\n');

keepOnlyWeeklyPrices();
