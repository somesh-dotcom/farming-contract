// JavaScript utility for market price analysis and calculations

/**
 * Calculate average price for a product over a period
 * @param {Array} prices - Array of price objects with {price, date}
 * @returns {number} Average price
 */
export const calculateAveragePrice = (prices) => {
  if (!prices || prices.length === 0) return 0;
  const total = prices.reduce((sum, price) => sum + price.price, 0);
  return total / prices.length;
};

/**
 * Calculate price volatility (standard deviation)
 * @param {Array} prices - Array of price objects with {price, date}
 * @returns {number} Price volatility
 */
export const calculatePriceVolatility = (prices) => {
  if (!prices || prices.length < 2) return 0;
  
  const avgPrice = calculateAveragePrice(prices);
  const squaredDifferences = prices.map(price => 
    Math.pow(price.price - avgPrice, 2)
  );
  const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / prices.length;
  
  return Math.sqrt(variance);
};

/**
 * Get the highest price from a set of prices
 * @param {Array} prices - Array of price objects with {price, date}
 * @returns {Object} Object containing highest price and date
 */
export const getHighestPrice = (prices) => {
  if (!prices || prices.length === 0) return null;
  
  return prices.reduce((max, current) => 
    current.price > max.price ? current : max
  );
};

/**
 * Get the lowest price from a set of prices
 * @param {Array} prices - Array of price objects with {price, date}
 * @returns {Object} Object containing lowest price and date
 */
export const getLowestPrice = (prices) => {
  if (!prices || prices.length === 0) return null;
  
  return prices.reduce((min, current) => 
    current.price < min.price ? current : min
  );
};

/**
 * Calculate price trend over time
 * @param {Array} prices - Array of price objects with {price, date}
 * @returns {string} Trend indicator ('increasing', 'decreasing', 'stable')
 */
export const calculatePriceTrend = (prices) => {
  if (!prices || prices.length < 2) return 'stable';
  
  const firstPrice = prices[prices.length - 1].price; // Oldest
  const lastPrice = prices[0].price; // Newest
  
  const change = ((lastPrice - firstPrice) / firstPrice) * 100;
  
  if (change > 2) return 'increasing';
  if (change < -2) return 'decreasing';
  return 'stable';
};

/**
 * Filter prices by date range
 * @param {Array} prices - Array of price objects with {price, date}
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Filtered prices
 */
export const filterPricesByDateRange = (prices, startDate, endDate) => {
  if (!prices) return [];
  
  return prices.filter(price => {
    const priceDate = new Date(price.date);
    return priceDate >= new Date(startDate) && priceDate <= new Date(endDate);
  });
};

/**
 * Group prices by date (for charting)
 * @param {Array} prices - Array of price objects with {price, date}
 * @returns {Array} Array of grouped price objects
 */
export const groupPricesByDate = (prices) => {
  if (!prices) return [];
  
  // Group by date (remove time component)
  const grouped = {};
  
  prices.forEach(price => {
    const dateStr = new Date(price.date).toISOString().split('T')[0];
    if (!grouped[dateStr]) {
      grouped[dateStr] = [];
    }
    grouped[dateStr].push(price);
  });
  
  // Calculate average price for each date
  return Object.keys(grouped).map(date => {
    const datePrices = grouped[date];
    const avgPrice = datePrices.reduce((sum, p) => sum + p.price, 0) / datePrices.length;
    
    return {
      date: new Date(date),
      price: avgPrice,
      minPrice: Math.min(...datePrices.map(p => p.price)),
      maxPrice: Math.max(...datePrices.map(p => p.price)),
      volume: datePrices.length
    };
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Calculate moving average for prices
 * @param {Array} prices - Array of price objects with {price, date}
 * @param {number} windowSize - Size of the moving average window
 * @returns {Array} Array of prices with moving average
 */
export const calculateMovingAverage = (prices, windowSize = 7) => {
  if (!prices || prices.length < windowSize) return prices.map(p => ({ ...p, movingAvg: p.price }));
  
  return prices.map((price, index) => {
    if (index < windowSize - 1) {
      // Not enough data points for moving average
      return { ...price, movingAvg: price.price };
    }
    
    // Calculate average of previous windowSize prices
    const window = prices.slice(index - windowSize + 1, index + 1);
    const avg = window.reduce((sum, p) => sum + p.price, 0) / window.length;
    
    return { ...price, movingAvg: avg };
  });
};

/**
 * Predict next price based on linear regression
 * @param {Array} prices - Array of price objects with {price, date}
 * @returns {number} Predicted next price
 */
export const predictNextPrice = (prices) => {
  if (!prices || prices.length < 2) return prices && prices.length > 0 ? prices[0].price : 0;
  
  // Simple linear regression for prediction
  const n = prices.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  prices.forEach((price, i) => {
    const x = i; // Index as x coordinate
    const y = price.price;
    
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Predict next price (at index n)
  return slope * n + intercept;
};

/**
 * Get price alert level based on deviation from average
 * @param {number} currentPrice - Current price
 * @param {number} averagePrice - Average price
 * @returns {string} Alert level ('normal', 'high', 'low', 'very-high', 'very-low')
 */
export const getPriceAlertLevel = (currentPrice, averagePrice) => {
  if (!averagePrice || averagePrice === 0) return 'normal';
  
  const deviation = ((currentPrice - averagePrice) / averagePrice) * 100;
  
  if (deviation > 10) return 'very-high';
  if (deviation > 5) return 'high';
  if (deviation < -10) return 'very-low';
  if (deviation < -5) return 'low';
  
  return 'normal';
};

/**
 * Calculate price seasonality index
 * @param {Array} prices - Array of price objects with {price, date}
 * @returns {Object} Seasonality analysis
 */
export const calculateSeasonality = (prices) => {
  if (!prices || prices.length === 0) return {};
  
  // Group prices by month
  const monthlyPrices = {};
  
  prices.forEach(price => {
    const month = new Date(price.date).getMonth(); // 0-11
    
    if (!monthlyPrices[month]) {
      monthlyPrices[month] = [];
    }
    monthlyPrices[month].push(price.price);
  });
  
  // Calculate average price per month
  const monthlyAverages = {};
  Object.keys(monthlyPrices).forEach(month => {
    const monthPrices = monthlyPrices[month];
    monthlyAverages[month] = monthPrices.reduce((sum, price) => sum + price, 0) / monthPrices.length;
  });
  
  return monthlyAverages;
};

/**
 * Normalize prices to a 0-100 scale
 * @param {Array} prices - Array of price objects with {price, date}
 * @returns {Array} Array of normalized prices
 */
export const normalizePrices = (prices) => {
  if (!prices || prices.length === 0) return [];
  
  const pricesOnly = prices.map(p => p.price);
  const minPrice = Math.min(...pricesOnly);
  const maxPrice = Math.max(...pricesOnly);
  const range = maxPrice - minPrice;
  
  if (range === 0) {
    return prices.map(p => ({ ...p, normalized: 50 })); // If all prices are same, set to 50
  }
  
  return prices.map(p => ({
    ...p,
    normalized: ((p.price - minPrice) / range) * 100
  }));
};

export default {
  calculateAveragePrice,
  calculatePriceVolatility,
  getHighestPrice,
  getLowestPrice,
  calculatePriceTrend,
  filterPricesByDateRange,
  groupPricesByDate,
  calculateMovingAverage,
  predictNextPrice,
  getPriceAlertLevel,
  calculateSeasonality,
  normalizePrices
};