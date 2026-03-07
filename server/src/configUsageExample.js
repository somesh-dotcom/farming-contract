/**
 * Configuration Usage Example Script
 * This script demonstrates how to use the configuration system
 */

const { config, loadDataFromFile, saveDataToFile, getAvailableDataTypes } = require('./config/index');

console.log('========================================');
console.log('CONFIGURATION MANAGEMENT SYSTEM DEMO');
console.log('========================================\n');

// 1. Display loaded configuration from environment variables
console.log('1. Current Configuration (from .env):');
console.log('----------------------------------------');
console.log(`Database URL: ${config.database.url}`);
console.log(`JWT Secret: ${config.jwt.secret.substring(0, 10)}...`);
console.log(`Server Port: ${config.server.port}`);
console.log(`Node Env: ${config.server.nodeEnv}`);
console.log(`App Name: ${config.app.name}`);
console.log(`Default Currency: ${config.app.defaultCurrency}`);
console.log(`Supported Languages: ${config.app.supportedLanguages.join(', ')}`);
console.log(`Bangalore Locations Enabled: ${config.locations.enabled}`);
console.log(`Contract Auto Complete: ${config.contract.autoCompleteEnabled}`);
console.log(`Buyer Transaction Visibility: ${config.transaction.buyerVisibility}`);
console.log(`Price Update Interval: ${config.marketPrice.updateInterval / 60000} minutes`);
console.log('');

// 2. Display available data types
console.log('2. Available Data Types:');
console.log('----------------------------------------');
const dataTypes = getAvailableDataTypes();
dataTypes.forEach(type => {
  console.log(`   - ${type}`);
});
console.log('');

// 3. Load data from JSON files
console.log('3. Loading Data from Config Files:');
console.log('----------------------------------------');

// Load products
const products = loadDataFromFile('products');
if (products) {
  console.log(`✓ Loaded ${products.length} products from config/products.json`);
  console.log('   Sample products:', products.slice(0, 2).map(p => p.name).join(', '));
} else {
  console.log('✗ No products file found or error loading');
}

// Load market prices
const marketPrices = loadDataFromFile('marketPrices');
if (marketPrices) {
  console.log(`✓ Loaded ${marketPrices.length} market prices from config/marketPrices.json`);
} else {
  console.log('✗ No market prices file found or error loading');
}

// Load locations
const locations = loadDataFromFile('locations');
if (locations) {
  console.log(`✓ Loaded ${locations.length} locations from config/locations.json`);
  console.log('   Sample locations:', locations.slice(0, 2).map(l => `${l.area}, ${l.city}`).join(', '));
} else {
  console.log('✗ No locations file found or error loading');
}
console.log('');

// 4. Save new data example
console.log('4. Saving New Data Example:');
console.log('----------------------------------------');
const newProduct = {
  id: `prod_${Date.now()}`,
  name: 'Test Product',
  category: 'GRAINS',
  unit: 'kg',
  description: 'Test product for demonstration',
  minQuantity: 100,
  active: true
};

const currentProducts = loadDataFromFile('products') || [];
currentProducts.push(newProduct);
const saved = saveDataToFile('products', currentProducts);
console.log(saved ? '✓ Successfully saved new product' : '✗ Failed to save product');
console.log('');

// 5. Configuration usage in routes
console.log('5. How to Use in Routes:');
console.log('----------------------------------------');
console.log(`
// In your route files (e.g., src/routes/products.ts):

const { config, loadDataFromFile } = require('../config/index');

// Get configuration
const port = config.server.port;
const currency = config.app.defaultCurrency;

// Load data from file if enabled
let products = [];
if (process.env.LOAD_PRODUCTS_FROM_FILE === 'true') {
  products = loadDataFromFile('products');
}

// Or merge with database data
const dbProducts = await prisma.product.findMany();
products = config.mergeData('products', dbProducts);
`);
console.log('');

// 6. Environment variable flags
console.log('6. Environment Variable Flags:');
console.log('----------------------------------------');
console.log('Set these in your .env file to enable/disable features:');
console.log('   LOAD_PRODUCTS_FROM_FILE=true    # Load products from config/products.json');
console.log('   LOAD_PRICES_FROM_FILE=true      # Load prices from config/marketPrices.json');
console.log('   LOAD_LOCATIONS_FROM_FILE=true   # Load locations from config/locations.json');
console.log('   LOAD_USERS_FROM_FILE=true       # Load users from config/users.json');
console.log('   LOAD_CONTRACTS_FROM_FILE=true   # Load contracts from config/contracts.json');
console.log('');

console.log('========================================');
console.log('Demo Complete!');
console.log('========================================');
console.log('\nNext Steps:');
console.log('1. Edit the .env file to configure which data to load from files');
console.log('2. Modify the JSON files in server/config/ directory');
console.log('3. Integrate the config system into your routes');
console.log('4. Run this script anytime to verify configuration: node src/configUsageExample.js');
