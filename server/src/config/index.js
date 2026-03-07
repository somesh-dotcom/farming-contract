/**
 * Configuration Management System
 * Loads configuration from environment variables and JSON files
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration file paths
const CONFIG_DIR = path.join(__dirname, '..', 'config');
const DATA_FILES = {
  products: path.join(CONFIG_DIR, 'products.json'),
  marketPrices: path.join(CONFIG_DIR, 'marketPrices.json'),
  locations: path.join(CONFIG_DIR, 'locations.json'),
  users: path.join(CONFIG_DIR, 'users.json'),
  contracts: path.join(CONFIG_DIR, 'contracts.json')
};

/**
 * Load configuration from environment variables
 */
const config = {
  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/contract_farming',
    schema: process.env.DB_SCHEMA || 'public'
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*'
  },
  
  // Application Configuration
  app: {
    name: process.env.APP_NAME || 'Agricultural Commodity Trading Platform',
    defaultCurrency: process.env.DEFAULT_CURRENCY || 'INR',
    defaultLanguage: process.env.DEFAULT_LANGUAGE || 'en',
    supportedLanguages: (process.env.SUPPORTED_LANGUAGES || 'en,kn').split(',')
  },
  
  // Bangalore Locations Configuration
  locations: {
    enabled: process.env.BANGALORE_LOCATIONS_ENABLED === 'true',
    defaultCity: process.env.DEFAULT_CITY || 'Bangalore',
    defaultState: process.env.DEFAULT_STATE || 'Karnataka'
  },
  
  // Contract Configuration
  contract: {
    autoCompleteEnabled: process.env.CONTRACT_AUTO_COMPLETE === 'true',
    adminOnlyStatusChange: process.env.ADMIN_ONLY_STATUS_CHANGE === 'true',
    allowedStatuses: (process.env.CONTRACT_STATUSES || 'DRAFT,PENDING,ACTIVE,COMPLETED,CANCELLED').split(',')
  },
  
  // Transaction Configuration
  transaction: {
    buyerVisibility: process.env.BUYER_TRANSACTION_VISIBILITY === 'true',
    adminDeleteEnabled: process.env.ADMIN_DELETE_TRANSACTIONS === 'true',
    paymentTypes: (process.env.PAYMENT_TYPES || 'ADVANCE,PARTIAL,FINAL,REFUND,OTHER').split(',')
  },
  
  // Market Price Configuration
  marketPrice: {
    updateInterval: parseInt(process.env.PRICE_UPDATE_INTERVAL || '3600000', 10), // 1 hour in ms
    historyDays: parseInt(process.env.PRICE_HISTORY_DAYS || '180', 10),
    analyzeTrends: process.env.ANALYZE_PRICE_TRENDS === 'true'
  }
};

/**
 * Load data from JSON files
 * @param {string} dataType - Type of data to load (products, marketPrices, etc.)
 * @returns {Array|null} Loaded data or null if file doesn't exist
 */
function loadDataFromFile(dataType) {
  const filePath = DATA_FILES[dataType];
  
  if (!filePath) {
    console.error(`Unknown data type: ${dataType}`);
    return null;
  }
  
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    } else {
      console.log(`Data file not found: ${filePath}`);
      return null;
    }
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Save data to JSON files
 * @param {string} dataType - Type of data to save
 * @param {Array} data - Data to save
 * @returns {boolean} Success status
 */
function saveDataToFile(dataType, data) {
  const filePath = DATA_FILES[dataType];
  
  if (!filePath) {
    console.error(`Unknown data type: ${dataType}`);
    return false;
  }
  
  try {
    // Ensure config directory exists
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Get all available data types
 * @returns {Array<string>} Array of available data type keys
 */
function getAvailableDataTypes() {
  return Object.keys(DATA_FILES);
}

/**
 * Check if a data file exists
 * @param {string} dataType - Type of data to check
 * @returns {boolean} Whether the file exists
 */
function dataFileExists(dataType) {
  const filePath = DATA_FILES[dataType];
  return filePath && fs.existsSync(filePath);
}

/**
 * Delete a data file
 * @param {string} dataType - Type of data to delete
 * @returns {boolean} Success status
 */
function deleteDataFile(dataType) {
  const filePath = DATA_FILES[dataType];
  
  if (!filePath) {
    console.error(`Unknown data type: ${dataType}`);
    return false;
  }
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting data file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Merge data from file with runtime data
 * @param {string} dataType - Type of data to merge
 * @param {Array} runtimeData - Data from runtime/database
 * @returns {Array} Merged data
 */
function mergeData(dataType, runtimeData) {
  const fileData = loadDataFromFile(dataType);
  
  if (!fileData) {
    return runtimeData;
  }
  
  // File data takes precedence over runtime data
  return [...fileData, ...runtimeData.filter(item => 
    !fileData.some(fileItem => fileItem.id === item.id)
  )];
}

module.exports = {
  config,
  loadDataFromFile,
  saveDataToFile,
  getAvailableDataTypes,
  dataFileExists,
  deleteDataFile,
  mergeData,
  DATA_FILES,
  CONFIG_DIR
};
