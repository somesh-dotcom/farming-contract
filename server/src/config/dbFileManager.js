/**
 * Database File Manager
 * Manages database operations using JSON files instead of direct database connections
 * This allows storing and managing all data in separate files
 */

const fs = require('fs');
const path = require('path');
const { DATA_FILES, loadDataFromFile, saveDataToFile } = require('./index');

class DatabaseFileManager {
  constructor() {
    this.configDir = path.join(__dirname, '..', 'config');
    this.dataCache = new Map();
  }

  /**
   * Initialize all data files if they don't exist
   */
  initializeDataFiles() {
    const defaultData = {
      users: [
        {
          id: 'user_001',
          name: 'Admin User',
          email: 'admin@contractfarming.com',
          password: '$2b$10$YourHashedPasswordHere',
          role: 'ADMIN',
          phone: '+919876543210',
          location: 'Bangalore',
          createdAt: new Date().toISOString()
        }
      ],
      products: [],
      marketPrices: [],
      locations: [],
      contracts: [],
      transactions: []
    };

    Object.keys(DATA_FILES).forEach(type => {
      const filePath = DATA_FILES[type];
      if (!fs.existsSync(filePath)) {
        this.saveData(type, defaultData[type] || []);
        console.log(`✓ Created default data file: ${filePath}`);
      }
    });
  }

  /**
   * Find many (equivalent to Prisma's findMany)
   * @param {string} model - Model name (users, products, etc.)
   * @param {Object} where - Filter conditions
   * @returns {Array} Matching records
   */
  findMany(model, where = {}) {
    const data = this.loadData(model);
    
    if (!data || !Array.isArray(data)) {
      return [];
    }

    // Apply filters
    if (Object.keys(where).length === 0) {
      return data;
    }

    return data.filter(item => {
      return Object.entries(where).every(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Handle special operators like contains, equals, in
          if (value.equals !== undefined) {
            return item[key] === value.equals;
          }
          if (value.contains !== undefined) {
            return String(item[key]).includes(String(value.contains));
          }
          if (value.in !== undefined) {
            return value.in.includes(item[key]);
          }
          if (value.gt !== undefined) {
            return item[key] > value.gt;
          }
          if (value.gte !== undefined) {
            return item[key] >= value.gte;
          }
          if (value.lt !== undefined) {
            return item[key] < value.lt;
          }
          if (value.lte !== undefined) {
            return item[key] <= value.lte;
          }
        }
        return item[key] === value;
      });
    });
  }

  /**
   * Find first matching record
   * @param {string} model - Model name
   * @param {Object} where - Filter conditions
   * @returns {Object|null} Matching record or null
   */
  findFirst(model, where = {}) {
    const results = this.findMany(model, where);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Find unique record by ID
   * @param {string} model - Model name
   * @param {string} id - Record ID
   * @returns {Object|null} Matching record or null
   */
  findUnique(model, id) {
    return this.findFirst(model, { id });
  }

  /**
   * Create a new record
   * @param {string} model - Model name
   * @param {Object} data - Data to create
   * @returns {Object} Created record
   */
  create(model, data) {
    const records = this.loadData(model) || [];
    
    // Generate ID if not provided
    if (!data.id) {
      const prefix = model.slice(0, -1); // Remove 's' to get singular
      data.id = `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Add timestamps
    if (!data.createdAt) {
      data.createdAt = new Date().toISOString();
    }
    if (!data.updatedAt) {
      data.updatedAt = new Date().toISOString();
    }

    records.push(data);
    this.saveData(model, records);
    
    return data;
  }

  /**
   * Update existing record(s)
   * @param {string} model - Model name
   * @param {Object} where - Filter to find record
   * @param {Object} data - Data to update
   * @returns {Object|null} Updated record or null
   */
  update(model, where, data) {
    const records = this.loadData(model) || [];
    const index = records.findIndex(item => {
      return Object.entries(where).every(([key, value]) => item[key] === value);
    });

    if (index === -1) {
      return null;
    }

    // Update the record
    records[index] = {
      ...records[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.saveData(model, records);
    return records[index];
  }

  /**
   * Update many records
   * @param {string} model - Model name
   * @param {Object} where - Filter conditions
   * @param {Object} data - Data to update
   * @returns {Object} Statistics
   */
  updateMany(model, where, data) {
    const records = this.loadData(model) || [];
    let count = 0;

    records.forEach((item, index) => {
      const matches = Object.entries(where).every(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          if (value.equals !== undefined) return item[key] === value.equals;
          if (value.contains !== undefined) return String(item[key]).includes(String(value.contains));
          if (value.in !== undefined) return value.in.includes(item[key]);
        }
        return item[key] === value;
      });

      if (matches) {
        records[index] = {
          ...item,
          ...data,
          updatedAt: new Date().toISOString()
        };
        count++;
      }
    });

    this.saveData(model, records);
    return { count };
  }

  /**
   * Delete record
   * @param {string} model - Model name
   * @param {Object} where - Filter to find record
   * @returns {Object|null} Deleted record or null
   */
  delete(model, where) {
    const records = this.loadData(model) || [];
    const index = records.findIndex(item => {
      return Object.entries(where).every(([key, value]) => item[key] === value);
    });

    if (index === -1) {
      return null;
    }

    const deleted = records.splice(index, 1)[0];
    this.saveData(model, records);
    return deleted;
  }

  /**
   * Delete many records
   * @param {string} model - Model name
   * @param {Object} where - Filter conditions
   * @returns {Object} Statistics
   */
  deleteMany(model, where = {}) {
    const records = this.loadData(model) || [];
    const initialCount = records.length;

    const filtered = records.filter(item => {
      const matches = Object.entries(where).every(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          if (value.equals !== undefined) return item[key] === value.equals;
          if (value.contains !== undefined) return String(item[key]).includes(String(value.contains));
          if (value.in !== undefined) return value.in.includes(item[key]);
        }
        return item[key] === value;
      });
      return !matches;
    });

    const deletedCount = initialCount - filtered.length;
    this.saveData(model, filtered);
    return { count: deletedCount };
  }

  /**
   * Count records
   * @param {string} model - Model name
   * @param {Object} where - Filter conditions
   * @returns {number} Count of matching records
   */
  count(model, where = {}) {
    return this.findMany(model, where).length;
  }

  /**
   * Load data from file
   * @param {string} model - Model name
   * @returns {Array} Data array
   */
  loadData(model) {
    // Check cache first
    if (this.dataCache.has(model)) {
      return this.dataCache.get(model);
    }

    const data = loadDataFromFile(model);
    this.dataCache.set(model, data || []);
    return data || [];
  }

  /**
   * Save data to file
   * @param {string} model - Model name
   * @param {Array} data - Data to save
   */
  saveData(model, data) {
    saveDataToFile(model, data);
    this.dataCache.set(model, data);
  }

  /**
   * Clear cache (useful after external changes)
   */
  clearCache() {
    this.dataCache.clear();
  }

  /**
   * Reload all data from files
   */
  reloadAll() {
    this.clearCache();
    console.log('✓ All data reloaded from files');
  }

  /**
   * Export all data to a single backup file
   * @param {string} backupPath - Path to save backup
   */
  exportAll(backupPath) {
    const allData = {};
    Object.keys(DATA_FILES).forEach(type => {
      allData[type] = this.loadData(type);
    });

    fs.writeFileSync(backupPath, JSON.stringify(allData, null, 2), 'utf8');
    console.log(`✓ All data exported to: ${backupPath}`);
  }

  /**
   * Import all data from backup file
   * @param {string} backupPath - Path to backup file
   */
  importAll(backupPath) {
    try {
      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      
      Object.entries(backupData).forEach(([type, data]) => {
        if (DATA_FILES[type]) {
          this.saveData(type, data);
        }
      });

      console.log(`✓ All data imported from: ${backupPath}`);
    } catch (error) {
      console.error('✗ Error importing data:', error.message);
      throw error;
    }
  }

  /**
   * Get statistics about all data
   * @returns {Object} Statistics for each model
   */
  getStats() {
    const stats = {};
    Object.keys(DATA_FILES).forEach(type => {
      const data = this.loadData(type);
      stats[type] = {
        count: data ? data.length : 0,
        file: DATA_FILES[type]
      };
    });
    return stats;
  }
}

// Create singleton instance
const dbFileManager = new DatabaseFileManager();

module.exports = {
  DatabaseFileManager,
  dbFileManager
};
