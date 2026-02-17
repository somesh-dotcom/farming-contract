// JavaScript utility functions for the agricultural commodity trading platform

/**
 * Format currency in Indian Rupees with proper separators
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format date in a readable format
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Calculate percentage difference between two values
 * @param {number} oldValue - The old value
 * @param {number} newValue - The new value
 * @returns {number} Percentage difference
 */
export const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Generate a random ID
 * @param {number} length - Length of the ID to generate
 * @returns {string} Random ID
 */
export const generateRandomId = (length = 8) => {
  return Math.random().toString(36).substring(2, 2 + length);
};

/**
 * Debounce function to limit the rate at which a function can fire
 * @param {Function} func - The function to debounce
 * @param {number} wait - The time to wait in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to ensure a function is called at most once per specified interval
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} True if email is valid
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if phone number is valid
 */
export const validatePhone = (phone) => {
  const re = /^(\+91|91|0)?[6-9]\d{9}$/;
  return re.test(phone.replace(/\s+/g, ''));
};

/**
 * Format weight/quantity with proper units
 * @param {number} value - The value to format
 * @param {string} unit - The unit of measurement
 * @returns {string} Formatted quantity string
 */
export const formatQuantity = (value, unit) => {
  const units = {
    kg: 'kg',
    g: 'g',
    lb: 'lbs',
    ton: 'tons',
    quintal: 'quintals',
    bag: 'bags',
    box: 'boxes',
    piece: 'pieces',
    dozen: 'dozen'
  };
  
  const displayUnit = units[unit] || unit;
  return `${value.toLocaleString()} ${displayUnit}`;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

/**
 * Get trending indicator based on percentage change
 * @param {number} change - Percentage change
 * @returns {string} Trend indicator ('up', 'down', 'stable')
 */
export const getTrendIndicator = (change) => {
  if (change > 2) return 'up';
  if (change < -2) return 'down';
  return 'stable';
};

/**
 * Capitalize first letter of each word in a string
 * @param {string} str - The string to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeWords = (str) => {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

/**
 * Generate a color based on a value for charts and visualizations
 * @param {number} value - The value to generate color for
 * @param {number} maxValue - The maximum possible value
 * @returns {string} Color in hex format
 */
export const getColorFromValue = (value, maxValue) => {
  const ratio = value / maxValue;
  if (ratio < 0.3) return '#ef4444'; // Red for low values
  if (ratio < 0.7) return '#f59e0b'; // Yellow for medium values
  return '#10b981'; // Green for high values
};

/**
 * Extract initials from a name
 * @param {string} name - The name to extract initials from
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substr(0, 2);
};

/**
 * Generate a unique color for an entity based on its ID
 * @param {string} id - The ID to generate color for
 * @returns {string} Color in hex format
 */
export const getColorById = (id) => {
  if (!id) return '#6b7280'; // Gray for undefined IDs
  
  // Simple hash function to generate consistent color
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to hex color
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
};

export default {
  formatCurrency,
  formatDate,
  calculatePercentageChange,
  generateRandomId,
  debounce,
  throttle,
  validateEmail,
  validatePhone,
  formatQuantity,
  calculateDistance,
  getTrendIndicator,
  capitalizeWords,
  getColorFromValue,
  getInitials,
  getColorById
};