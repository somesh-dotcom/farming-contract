// JavaScript utility for data processing and analytics

/**
 * Calculate statistical measures for a dataset
 * @param {Array} data - Array of numerical values
 * @returns {Object} Statistical measures
 */
export const calculateStatistics = (data) => {
  if (!data || data.length === 0) {
    return {
      count: 0,
      sum: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      range: 0,
      variance: 0,
      stdDev: 0
    };
  }
  
  // Convert to numbers and filter out invalid values
  const numericData = data
    .map(val => typeof val === 'number' ? val : Number(val))
    .filter(val => !isNaN(val));
  
  if (numericData.length === 0) {
    return {
      count: 0,
      sum: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      range: 0,
      variance: 0,
      stdDev: 0
    };
  }
  
  const sortedData = [...numericData].sort((a, b) => a - b);
  const count = sortedData.length;
  const sum = sortedData.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;
  
  // Calculate median
  let median;
  if (count % 2 === 0) {
    median = (sortedData[count / 2 - 1] + sortedData[count / 2]) / 2;
  } else {
    median = sortedData[Math.floor(count / 2)];
  }
  
  const min = sortedData[0];
  const max = sortedData[count - 1];
  const range = max - min;
  
  // Calculate variance and standard deviation
  const squaredDiffs = sortedData.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / count;
  const stdDev = Math.sqrt(variance);
  
  return {
    count,
    sum,
    mean,
    median,
    min,
    max,
    range,
    variance,
    stdDev
  };
};

/**
 * Group data by a specific property
 * @param {Array} data - Array of objects
 * @param {string} key - Property name to group by
 * @returns {Object} Grouped data
 */
export const groupBy = (data, key) => {
  if (!data || !Array.isArray(data)) return {};
  
  return data.reduce((groups, item) => {
    const groupKey = item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
};

/**
 * Calculate percentage distribution of values
 * @param {Array} data - Array of values
 * @returns {Object} Distribution percentages
 */
export const calculateDistribution = (data) => {
  if (!data || data.length === 0) return {};
  
  const counts = {};
  let total = 0;
  
  data.forEach(value => {
    const strValue = String(value);
    counts[strValue] = (counts[strValue] || 0) + 1;
    total++;
  });
  
  const percentages = {};
  Object.keys(counts).forEach(key => {
    percentages[key] = (counts[key] / total) * 100;
  });
  
  return percentages;
};

/**
 * Find outliers in a dataset using IQR method
 * @param {Array} data - Array of numerical values
 * @returns {Array} Outlier values
 */
export const findOutliers = (data) => {
  if (!data || data.length < 4) return [];
  
  const numericData = data
    .map(val => typeof val === 'number' ? val : Number(val))
    .filter(val => !isNaN(val))
    .sort((a, b) => a - b);
  
  if (numericData.length < 4) return [];
  
  const q1Index = Math.floor(numericData.length * 0.25);
  const q3Index = Math.floor(numericData.length * 0.75);
  const q1 = numericData[q1Index];
  const q3 = numericData[q3Index];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return data.filter(val => {
    const numVal = typeof val === 'number' ? val : Number(val);
    return !isNaN(numVal) && (numVal < lowerBound || numVal > upperBound);
  });
};

/**
 * Normalize data to 0-1 range
 * @param {Array} data - Array of numerical values
 * @returns {Array} Normalized values
 */
export const normalizeData = (data) => {
  if (!data || data.length === 0) return [];
  
  const numericData = data
    .map(val => typeof val === 'number' ? val : Number(val))
    .filter(val => !isNaN(val));
  
  if (numericData.length === 0) return data.map(() => 0);
  
  const min = Math.min(...numericData);
  const max = Math.max(...numericData);
  const range = max - min;
  
  if (range === 0) {
    return data.map(() => 0.5); // If all values are the same, return 0.5
  }
  
  return data.map(val => {
    const numVal = typeof val === 'number' ? val : Number(val);
    return isNaN(numVal) ? 0 : (numVal - min) / range;
  });
};

/**
 * Calculate correlation coefficient between two datasets
 * @param {Array} xData - First dataset
 * @param {Array} yData - Second dataset
 * @returns {number} Correlation coefficient (-1 to 1)
 */
export const calculateCorrelation = (xData, yData) => {
  if (!xData || !yData || xData.length !== yData.length || xData.length < 2) {
    return 0;
  }
  
  const xNumeric = xData
    .map(val => typeof val === 'number' ? val : Number(val))
    .filter(val => !isNaN(val));
  
  const yNumeric = yData
    .map(val => typeof val === 'number' ? val : Number(val))
    .filter(val => !isNaN(val));
  
  if (xNumeric.length !== yNumeric.length || xNumeric.length < 2) {
    return 0;
  }
  
  const n = xNumeric.length;
  const sumX = xNumeric.reduce((sum, val) => sum + val, 0);
  const sumY = yNumeric.reduce((sum, val) => sum + val, 0);
  const sumXY = xNumeric.reduce((sum, val, i) => sum + val * yNumeric[i], 0);
  const sumX2 = xNumeric.reduce((sum, val) => sum + val * val, 0);
  const sumY2 = yNumeric.reduce((sum, val) => sum + val * val, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  if (denominator === 0) return 0;
  
  return numerator / denominator;
};

/**
 * Smooth data using moving average
 * @param {Array} data - Array of numerical values
 * @param {number} windowSize - Size of the moving average window
 * @returns {Array} Smoothed data
 */
export const smoothData = (data, windowSize = 3) => {
  if (!data || data.length < windowSize) return [...data];
  
  const numericData = data
    .map(val => typeof val === 'number' ? val : Number(val))
    .filter(val => !isNaN(val));
  
  if (numericData.length < windowSize) return [...data];
  
  const smoothed = [];
  
  for (let i = 0; i < numericData.length; i++) {
    if (i < windowSize - 1) {
      // For early points, use available data
      const slice = numericData.slice(0, i + 1);
      smoothed.push(slice.reduce((sum, val) => sum + val, 0) / slice.length);
    } else {
      // Use full window size
      const slice = numericData.slice(i - windowSize + 1, i + 1);
      smoothed.push(slice.reduce((sum, val) => sum + val, 0) / slice.length);
    }
  }
  
  return smoothed;
};

/**
 * Calculate moving average
 * @param {Array} data - Array of numerical values
 * @param {number} windowSize - Size of the moving average window
 * @returns {Array} Moving averages
 */
export const calculateMovingAverage = (data, windowSize = 3) => {
  if (!data || data.length < windowSize) return [];
  
  const numericData = data
    .map(val => typeof val === 'number' ? val : Number(val))
    .filter(val => !isNaN(val));
  
  if (numericData.length < windowSize) return [];
  
  const result = [];
  
  for (let i = windowSize - 1; i < numericData.length; i++) {
    const sum = numericData.slice(i - windowSize + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / windowSize);
  }
  
  return result;
};

/**
 * Calculate exponential moving average
 * @param {Array} data - Array of numerical values
 * @param {number} smoothingFactor - Smoothing factor (0-1)
 * @returns {Array} Exponential moving averages
 */
export const calculateExponentialMovingAverage = (data, smoothingFactor = 0.3) => {
  if (!data || data.length === 0) return [];
  
  const numericData = data
    .map(val => typeof val === 'number' ? val : Number(val))
    .filter(val => !isNaN(val));
  
  if (numericData.length === 0) return [];
  
  const ema = [];
  ema[0] = numericData[0]; // First value is the same
  
  for (let i = 1; i < numericData.length; i++) {
    ema[i] = smoothingFactor * numericData[i] + (1 - smoothingFactor) * ema[i - 1];
  }
  
  return ema;
};

/**
 * Detect trends in data
 * @param {Array} data - Array of numerical values
 * @returns {Array} Trend indicators ('up', 'down', 'stable')
 */
export const detectTrends = (data) => {
  if (!data || data.length < 2) return data.map(() => 'stable');
  
  const trends = ['stable']; // First point has no trend
  
  for (let i = 1; i < data.length; i++) {
    const prev = typeof data[i - 1] === 'number' ? data[i - 1] : Number(data[i - 1]);
    const curr = typeof data[i] === 'number' ? data[i] : Number(data[i]);
    
    if (isNaN(prev) || isNaN(curr)) {
      trends.push('stable');
    } else if (curr > prev) {
      trends.push('up');
    } else if (curr < prev) {
      trends.push('down');
    } else {
      trends.push('stable');
    }
  }
  
  return trends;
};

/**
 * Calculate percentage change between values
 * @param {Array} data - Array of numerical values
 * @returns {Array} Percentage changes
 */
export const calculatePercentChanges = (data) => {
  if (!data || data.length < 2) return [];
  
  const changes = [0]; // First value has no change
  
  for (let i = 1; i < data.length; i++) {
    const prev = typeof data[i - 1] === 'number' ? data[i - 1] : Number(data[i - 1]);
    const curr = typeof data[i] === 'number' ? data[i] : Number(data[i]);
    
    if (isNaN(prev) || isNaN(curr) || prev === 0) {
      changes.push(0);
    } else {
      changes.push(((curr - prev) / prev) * 100);
    }
  }
  
  return changes;
};

/**
 * Format large numbers with appropriate units
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatLargeNumber = (num, decimals = 2) => {
  if (typeof num !== 'number' || isNaN(num)) return String(num);
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1e12) {
    return (num / 1e12).toFixed(decimals) + 'T';
  } else if (absNum >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B';
  } else if (absNum >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M';
  } else if (absNum >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K';
  } else {
    return num.toFixed(decimals);
  }
};

/**
 * Sort data by multiple criteria
 * @param {Array} data - Array of objects to sort
 * @param {Array} sortCriteria - Array of {field, direction} objects
 * @returns {Array} Sorted data
 */
export const multiSort = (data, sortCriteria) => {
  if (!data || !Array.isArray(data) || !sortCriteria || !Array.isArray(sortCriteria)) {
    return [...(data || [])];
  }
  
  return [...data].sort((a, b) => {
    for (const criterion of sortCriteria) {
      const { field, direction = 'asc' } = criterion;
      const aVal = a[field];
      const bVal = b[field];
      
      let comparison = 0;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        // Convert to strings for comparison
        comparison = String(aVal).localeCompare(String(bVal));
      }
      
      if (comparison !== 0) {
        return direction.toLowerCase() === 'desc' ? -comparison : comparison;
      }
    }
    
    return 0;
  });
};

export default {
  calculateStatistics,
  groupBy,
  calculateDistribution,
  findOutliers,
  normalizeData,
  calculateCorrelation,
  smoothData,
  calculateMovingAverage,
  calculateExponentialMovingAverage,
  detectTrends,
  calculatePercentChanges,
  formatLargeNumber,
  multiSort
};