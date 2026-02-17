// JavaScript utility for date and time operations

/**
 * Format date to local format
 * @param {Date|string} date - Date to format
 * @param {Object} options - Format options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return new Date(date).toLocaleDateString(undefined, formatOptions);
  } catch (e) {
    return String(date);
  }
};

/**
 * Format time to local format
 * @param {Date|string} date - Date to format
 * @param {Object} options - Format options
 * @returns {string} Formatted time string
 */
export const formatTime = (date, options = {}) => {
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return new Date(date).toLocaleTimeString(undefined, formatOptions);
  } catch (e) {
    return String(date);
  }
};

/**
 * Format date and time together
 * @param {Date|string} date - Date to format
 * @param {Object} options - Format options
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date, options = {}) => {
  const dateOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const fullOptions = { ...dateOptions, ...timeOptions, ...options };
  
  try {
    return new Date(date).toLocaleString(undefined, fullOptions);
  } catch (e) {
    return String(date);
  }
};

/**
 * Get the difference between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {Object} Object containing differences in various units
 */
export const getDateDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));
  const diffSeconds = Math.ceil(diffTime / 1000);
  
  return {
    milliseconds: diffTime,
    seconds: diffSeconds,
    minutes: diffMinutes,
    hours: diffHours,
    days: diffDays
  };
};

/**
 * Add time to a date
 * @param {Date|string} date - Original date
 * @param {number} amount - Amount of time to add
 * @param {string} unit - Unit of time ('days', 'hours', 'minutes', 'seconds')
 * @returns {Date} New date with added time
 */
export const addTime = (date, amount, unit) => {
  const d = new Date(date);
  
  switch (unit) {
    case 'milliseconds':
      d.setMilliseconds(d.getMilliseconds() + amount);
      break;
    case 'seconds':
      d.setSeconds(d.getSeconds() + amount);
      break;
    case 'minutes':
      d.setMinutes(d.getMinutes() + amount);
      break;
    case 'hours':
      d.setHours(d.getHours() + amount);
      break;
    case 'days':
      d.setDate(d.getDate() + amount);
      break;
    case 'weeks':
      d.setDate(d.getDate() + (amount * 7));
      break;
    case 'months':
      d.setMonth(d.getMonth() + amount);
      break;
    case 'years':
      d.setFullYear(d.getFullYear() + amount);
      break;
    default:
      throw new Error('Invalid unit. Use milliseconds, seconds, minutes, hours, days, weeks, months, or years.');
  }
  
  return d;
};

/**
 * Subtract time from a date
 * @param {Date|string} date - Original date
 * @param {number} amount - Amount of time to subtract
 * @param {string} unit - Unit of time ('days', 'hours', 'minutes', 'seconds')
 * @returns {Date} New date with subtracted time
 */
export const subtractTime = (date, amount, unit) => {
  return addTime(date, -amount, unit);
};

/**
 * Check if a date is between two other dates
 * @param {Date|string} date - Date to check
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {boolean} True if date is between start and end dates
 */
export const isBetweenDates = (date, startDate, endDate) => {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return d >= start && d <= end;
};

/**
 * Get the start of the day for a given date
 * @param {Date|string} date - Date to process
 * @returns {Date} Date at the start of the day
 */
export const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the end of the day for a given date
 * @param {Date|string} date - Date to process
 * @returns {Date} Date at the end of the day
 */
export const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get the start of the month for a given date
 * @param {Date|string} date - Date to process
 * @returns {Date} Date at the start of the month
 */
export const startOfMonth = (date) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the end of the month for a given date
 * @param {Date|string} date - Date to process
 * @returns {Date} Date at the end of the month
 */
export const endOfMonth = (date) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0); // Last day of the month
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get the start of the year for a given date
 * @param {Date|string} date - Date to process
 * @returns {Date} Date at the start of the year
 */
export const startOfYear = (date) => {
  const d = new Date(date);
  d.setMonth(0, 1); // January 1st
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the end of the year for a given date
 * @param {Date|string} date - Date to process
 * @returns {Date} Date at the end of the year
 */
export const endOfYear = (date) => {
  const d = new Date(date);
  d.setMonth(11, 31); // December 31st
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get the day of the week for a given date
 * @param {Date|string} date - Date to process
 * @returns {number} Day of the week (0-6, Sunday-Saturday)
 */
export const getDayOfWeek = (date) => {
  return new Date(date).getDay();
};

/**
 * Get the week number of the year for a given date
 * @param {Date|string} date - Date to process
 * @returns {number} Week number of the year
 */
export const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7)); // Thursday of the current week
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

/**
 * Format a date as ISO string
 * @param {Date|string} date - Date to format
 * @returns {string} ISO string representation
 */
export const toISOString = (date) => {
  try {
    return new Date(date).toISOString();
  } catch (e) {
    return String(date);
  }
};

/**
 * Check if a year is a leap year
 * @param {number} year - Year to check
 * @returns {boolean} True if leap year
 */
export const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

/**
 * Get the number of days in a month
 * @param {number} month - Month (0-11)
 * @param {number} year - Year
 * @returns {number} Number of days in the month
 */
export const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Get the quarter of the year for a given date
 * @param {Date|string} date - Date to process
 * @returns {number} Quarter of the year (1-4)
 */
export const getQuarter = (date) => {
  const month = new Date(date).getMonth();
  return Math.floor(month / 3) + 1;
};

/**
 * Format duration in milliseconds to human-readable format
 * @param {number} duration - Duration in milliseconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (duration) => {
  if (typeof duration !== 'number' || duration < 0) return '0 seconds';
  
  const seconds = Math.floor(duration / 1000) % 60;
  const minutes = Math.floor(duration / (1000 * 60)) % 60;
  const hours = Math.floor(duration / (1000 * 60 * 60)) % 24;
  const days = Math.floor(duration / (1000 * 60 * 60 * 24));
  
  const parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
  
  if (parts.length === 0) return '0 seconds';
  
  return parts.join(', ');
};

/**
 * Check if two dates are on the same day
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if dates are on the same day
 */
export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  return isSameDay(date, new Date());
};

/**
 * Check if a date is yesterday
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is yesterday
 */
export const isYesterday = (date) => {
  return isSameDay(date, addTime(new Date(), -1, 'days'));
};

/**
 * Check if a date is tomorrow
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is tomorrow
 */
export const isTomorrow = (date) => {
  return isSameDay(date, addTime(new Date(), 1, 'days'));
};

/**
 * Get age from birth date
 * @param {Date|string} birthDate - Birth date
 * @returns {number} Age in years
 */
export const getAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Parse a date string with flexible formats
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Parsed date or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Try standard Date.parse first
  const parsed = new Date(dateString);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  // Try various formats
  const formats = [
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
    /^(\d{2})-(\d{2})-(\d{4})$/,   // MM-DD-YYYY
    /^(\d{4})\/(\d{2})\/(\d{2})$/, // YYYY/MM/DD
    /^(\d{4})-(\d{2})-(\d{2})$/    // YYYY-MM-DD
  ];
  
  for (const format of formats) {
    const match = dateString.match(format);
    if (match) {
      const [, part1, part2, part3] = match;
      
      // For formats like MM/DD/YYYY or MM-DD-YYYY
      if (format.source.includes('d{2})/(d{2})/(d{4}') || format.source.includes('d{2})-(d{2})-(d{4}')) {
        const date = new Date(part3, part1 - 1, part2);
        if (!isNaN(date.getTime())) return date;
      }
      
      // For formats like YYYY/MM/DD or YYYY-MM-DD
      if (format.source.includes('d{4})/(d{2})/(d{2}') || format.source.includes('d{4})-(d{2})-(d{2}')) {
        const date = new Date(part1, part2 - 1, part3);
        if (!isNaN(date.getTime())) return date;
      }
    }
  }
  
  return null;
};

export default {
  formatDate,
  formatTime,
  formatDateTime,
  getDateDifference,
  addTime,
  subtractTime,
  isBetweenDates,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  getDayOfWeek,
  getWeekNumber,
  toISOString,
  isLeapYear,
  getDaysInMonth,
  getQuarter,
  formatDuration,
  isSameDay,
  isToday,
  isYesterday,
  isTomorrow,
  getAge,
  parseDate
};