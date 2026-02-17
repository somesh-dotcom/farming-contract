// JavaScript utility for data visualization and chart preparation

/**
 * Prepare data for line chart visualization
 * @param {Array} prices - Array of price objects with {price, date}
 * @param {string} dateField - Field name for date (default: 'date')
 * @param {string} valueField - Field name for value (default: 'price')
 * @returns {Array} Formatted data for line chart
 */
export const prepareLineChartData = (prices, dateField = 'date', valueField = 'price') => {
  if (!prices) return [];
  
  return prices.map(item => ({
    name: new Date(item[dateField]).toLocaleDateString(),
    [valueField]: item[valueField]
  }));
};

/**
 * Prepare data for bar chart visualization
 * @param {Array} data - Array of data objects
 * @param {string} categoryField - Field name for category
 * @param {string} valueField - Field name for value
 * @returns {Array} Formatted data for bar chart
 */
export const prepareBarChartData = (data, categoryField, valueField) => {
  if (!data) return [];
  
  return data.map(item => ({
    name: item[categoryField],
    [valueField]: item[valueField]
  }));
};

/**
 * Prepare data for pie chart visualization
 * @param {Array} data - Array of data objects
 * @param {string} nameField - Field name for name
 * @param {string} valueField - Field name for value
 * @returns {Array} Formatted data for pie chart
 */
export const preparePieChartData = (data, nameField, valueField) => {
  if (!data) return [];
  
  return data.map(item => ({
    name: item[nameField],
    value: item[valueField]
  }));
};

/**
 * Prepare comparison data for multiple series chart
 * @param {Array} seriesData - Array of series data arrays
 * @param {Array} seriesNames - Array of series names
 * @param {string} dateField - Field name for date
 * @param {Array} valueFields - Array of field names for values
 * @returns {Array} Formatted data for comparison chart
 */
export const prepareComparisonChartData = (seriesData, seriesNames, dateField = 'date', valueFields) => {
  if (!seriesData || !seriesNames || !valueFields) return [];
  
  // Assuming all series have the same dates for simplicity
  const result = [];
  
  if (seriesData.length > 0 && seriesData[0].length > 0) {
    for (let i = 0; i < seriesData[0].length; i++) {
      const dataPoint = {
        name: new Date(seriesData[0][i][dateField]).toLocaleDateString()
      };
      
      seriesData.forEach((series, idx) => {
        if (series[i]) {
          dataPoint[seriesNames[idx]] = series[i][valueFields[idx]];
        }
      });
      
      result.push(dataPoint);
    }
  }
  
  return result;
};

/**
 * Get chart color palette
 * @param {number} index - Index for color selection
 * @param {number} total - Total number of items
 * @returns {string} Hex color code
 */
export const getChartColor = (index, total) => {
  const colors = [
    '#3b82f6', // blue-500
    '#10b981', // green-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
    '#f97316', // orange-500
    '#6366f1'  // indigo-500
  ];
  
  return colors[index % colors.length];
};

/**
 * Format chart tooltip
 * @param {number} value - Value to format
 * @param {string} prefix - Prefix for the value
 * @param {string} suffix - Suffix for the value
 * @returns {string} Formatted tooltip value
 */
export const formatTooltipValue = (value, prefix = '', suffix = '') => {
  if (typeof value === 'number') {
    return `${prefix}${value.toLocaleString()}${suffix}`;
  }
  return `${prefix}${value}${suffix}`;
};

/**
 * Calculate chart domain for Y-axis
 * @param {Array} data - Chart data
 * @param {string} valueField - Field name for value
 * @returns {Array} Domain array [min, max]
 */
export const calculateDomain = (data, valueField) => {
  if (!data || data.length === 0) return [0, 100];
  
  const values = data.map(item => item[valueField]).filter(v => typeof v === 'number');
  if (values.length === 0) return [0, 100];
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Add some padding to the domain
  const padding = (max - min) * 0.1 || 10;
  
  return [Math.max(0, min - padding), max + padding];
};

/**
 * Prepare data for area chart (cumulative)
 * @param {Array} data - Array of data objects
 * @param {string} dateField - Field name for date
 * @param {string} valueField - Field name for value
 * @returns {Array} Formatted data for area chart
 */
export const prepareAreaChartData = (data, dateField = 'date', valueField = 'price') => {
  if (!data) return [];
  
  let cumulative = 0;
  return data.map(item => {
    cumulative += item[valueField];
    return {
      name: new Date(item[dateField]).toLocaleDateString(),
      [valueField]: item[valueField],
      cumulative: cumulative
    };
  });
};

/**
 * Generate chart config for different chart types
 * @param {string} chartType - Type of chart ('line', 'bar', 'pie', 'area')
 * @param {Array} data - Chart data
 * @param {Object} options - Chart options
 * @returns {Object} Chart configuration
 */
export const generateChartConfig = (chartType, data, options = {}) => {
  const config = {
    width: options.width || 600,
    height: options.height || 400,
    margin: options.margin || { top: 20, right: 30, left: 20, bottom: 5 }
  };
  
  switch (chartType) {
    case 'line':
      return {
        ...config,
        data,
        connectNulls: true,
        strokeWidth: options.strokeWidth || 2,
        dot: options.dot || false,
        activeDot: options.activeDot || { r: 8 }
      };
    
    case 'bar':
      return {
        ...config,
        data,
        layout: options.layout || 'vertical',
        barSize: options.barSize || 20
      };
    
    case 'pie':
      return {
        ...config,
        data,
        cx: options.cx || '50%',
        cy: options.cy || '50%',
        innerRadius: options.innerRadius || 0,
        outerRadius: options.outerRadius || 80,
        label: options.label || true
      };
    
    case 'area':
      return {
        ...config,
        data,
        stroke: options.stroke || '#3b82f6',
        fill: options.fill || '#3b82f6',
        fillOpacity: options.fillOpacity || 0.3
      };
    
    default:
      return config;
  }
};

/**
 * Prepare time series data for different intervals
 * @param {Array} data - Array of time series data
 * @param {string} interval - Interval ('day', 'week', 'month', 'year')
 * @param {string} dateField - Field name for date
 * @param {string} valueField - Field name for value
 * @returns {Array} Aggregated time series data
 */
export const prepareTimeSeriesData = (data, interval, dateField = 'date', valueField = 'price') => {
  if (!data) return [];
  
  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a[dateField]) - new Date(b[dateField]));
  
  const groupedData = {};
  
  sortedData.forEach(item => {
    const date = new Date(item[dateField]);
    let key;
    
    switch (interval) {
      case 'day':
        key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week
        // Calculate week number of year
        const yearStart = new Date(weekStart.getFullYear(), 0, 1);
        const weekNumber = Math.ceil((((weekStart - yearStart) / 86400000) + yearStart.getDay() + 1) / 7);
        key = `${weekStart.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        key = `${date.getFullYear()}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    if (!groupedData[key]) {
      groupedData[key] = { values: [], dates: [] };
    }
    
    groupedData[key].values.push(item[valueField]);
    groupedData[key].dates.push(date);
  });
  
  // Aggregate values for each group
  return Object.entries(groupedData).map(([period, { values, dates }]) => {
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return {
      period,
      [valueField]: avg,
      min: min,
      max: max,
      sum: sum,
      count: values.length,
      startDate: new Date(Math.min(...dates.map(d => d.getTime()))),
      endDate: new Date(Math.max(...dates.map(d => d.getTime())))
    };
  }).sort((a, b) => a.startDate - b.startDate);
};

/**
 * Get chart legend configuration
 * @param {Array} dataKeys - Array of data keys to show in legend
 * @param {Object} options - Legend options
 * @returns {Object} Legend configuration
 */
export const getLegendConfig = (dataKeys, options = {}) => {
  return {
    layout: options.layout || 'horizontal',
    verticalAlign: options.verticalAlign || 'bottom',
    align: options.align || 'center',
    payload: dataKeys.map((key, index) => ({
      value: key,
      type: 'square',
      id: key,
      color: getChartColor(index, dataKeys.length)
    }))
  };
};

/**
 * Format chart axis labels
 * @param {any} value - Axis value
 * @param {string} format - Format type ('date', 'currency', 'percentage', 'number')
 * @returns {string} Formatted axis label
 */
export const formatAxisLabel = (value, format = 'number') => {
  switch (format) {
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'currency':
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    case 'percentage':
      return `${value}%`;
    case 'number':
    default:
      return value.toLocaleString();
  }
};

export default {
  prepareLineChartData,
  prepareBarChartData,
  preparePieChartData,
  prepareComparisonChartData,
  getChartColor,
  formatTooltipValue,
  calculateDomain,
  prepareAreaChartData,
  generateChartConfig,
  prepareTimeSeriesData,
  getLegendConfig,
  formatAxisLabel
};