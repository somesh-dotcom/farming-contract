// JavaScript utility for localization and internationalization

/**
 * Get localized text based on current language
 * @param {string} key - Translation key
 * @param {string} lang - Language code ('en' or 'kn')
 * @param {Object} fallback - Fallback translations
 * @returns {string} Localized text
 */
export const getLocalizedText = (key, lang = 'en', fallback = {}) => {
  const translations = {
    en: {
      // Common terms
      'dashboard': 'Dashboard',
      'contracts': 'Contracts',
      'transactions': 'Transactions',
      'marketPrices': 'Market Prices',
      'users': 'Users',
      'profile': 'Profile',
      'logout': 'Logout',
      'login': 'Login',
      'register': 'Register',
      'home': 'Home',
      'settings': 'Settings',
      
      // Contract statuses
      'draft': 'Draft',
      'pending': 'Pending',
      'active': 'Active',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      
      // Transaction statuses
      'transaction.pending': 'Pending',
      'transaction.completed': 'Completed',
      'transaction.failed': 'Failed',
      'transaction.refunded': 'Refunded',
      
      // Payment types
      'transaction.advance': 'Advance',
      'transaction.partial': 'Partial',
      'transaction.final': 'Final',
      'transaction.refund': 'Refund',
      'transaction.other': 'Other',
      
      // Payment methods
      'transaction.cash': 'Cash',
      'transaction.bankTransfer': 'Bank Transfer',
      'transaction.upi': 'UPI',
      'transaction.cheque': 'Cheque',
      'transaction.neft': 'NEFT',
      'transaction.rtgs': 'RTGS',
      'transaction.imps': 'IMPS',
      'transaction.card': 'Card',
      'transaction.digitalWallet': 'Digital Wallet',
      'transaction.paytm': 'PayTM',
      'transaction.googlePay': 'Google Pay',
      'transaction.amazonPay': 'Amazon Pay',
      'transaction.phonePe': 'PhonePe',
      
      // Common actions
      'create': 'Create',
      'edit': 'Edit',
      'delete': 'Delete',
      'save': 'Save',
      'cancel': 'Cancel',
      'update': 'Update',
      'approve': 'Approve',
      'reject': 'Reject',
      'confirm': 'Confirm',
      
      // Common fields
      'name': 'Name',
      'email': 'Email',
      'phone': 'Phone',
      'address': 'Address',
      'city': 'City',
      'state': 'State',
      'pincode': 'Pincode',
      'product': 'Product',
      'quantity': 'Quantity',
      'unit': 'Unit',
      'price': 'Price',
      'total': 'Total',
      'date': 'Date',
      'status': 'Status',
      'amount': 'Amount',
      'method': 'Method',
      'type': 'Type',
      
      // Specific to agriculture
      'farmer': 'Farmer',
      'buyer': 'Buyer',
      'admin': 'Admin',
      'commodity': 'Commodity',
      'agriculture': 'Agriculture',
      'farming': 'Farming',
      'harvest': 'Harvest',
      'season': 'Season',
      'yield': 'Yield',
      'quality': 'Quality',
      'grade': 'Grade',
      'variety': 'Variety',
      
      // Market related
      'market': 'Market',
      'priceTrend': 'Price Trend',
      'supply': 'Supply',
      'demand': 'Demand',
      'region': 'Region',
      'location': 'Location',
      'delivery': 'Delivery',
      
      // Navigation
      'navigation.dashboard': 'Dashboard',
      'navigation.contracts': 'Contracts',
      'navigation.transactions': 'Transactions',
      'navigation.marketPrices': 'Market Prices',
      'navigation.users': 'Users',
      'navigation.profile': 'Profile',
      
      // Contract related
      'contract.createContract': 'Create Contract',
      'contract.manage': 'Manage',
      'contract.farming': 'Farming Contracts',
      'contract.noContractsFound': 'No Contracts Found',
      'contract.createFirstContract': 'Create your first contract',
      'contract.noContractsAvailable': 'No contracts available',
      'contract.quantity': 'Quantity',
      'contract.pricePerUnit': 'Price Per Unit',
      'contract.totalValue': 'Total Value',
      'contract.deliveryDate': 'Delivery Date',
      'contract.startDate': 'Start Date',
      'contract.terms': 'Terms & Conditions',
      'contract.location': 'Delivery Location',
      
      // Transaction related
      'transaction.transactionList': 'Transaction List',
      'transaction.transactionManagement': 'Transaction Management',
      'transaction.amount': 'Amount',
      'transaction.paymentMethod': 'Payment Method',
      'transaction.paymentType': 'Payment Type',
      'transaction.contractWith': 'Contract with ',
      'transaction.totalTransactions': 'Total Transactions',
      'transaction.pendingPayment': 'Pending Payment',
      'transaction.confirmDelete': 'Are you sure you want to delete this transaction?',
      'transaction.delete': 'Delete',
      
      // Contract request messages
      'contract.failedToCreateRequest': 'Failed to create contract request',
      'contract.requestSentSuccessfully': 'Contract request sent successfully! The farmer will review your request.',
      
      // Common messages
      'common.loading': 'Loading...',
      'common.error': 'Error occurred',
      'common.success': 'Success',
      'common.na': 'N/A',
      'common.all': 'All',
      'common.filter': 'Filter',
      'common.search': 'Search',
      'common.reset': 'Reset',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.ok': 'OK',
      'common.close': 'Close'
    },
    kn: {
      // Kannada translations
      'dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      'contracts': 'ಒಪ್ಪಂದಗಳು',
      'transactions': 'ವಹಿವಾಟುಗಳು',
      'marketPrices': 'ಮಾರುಕಟ್ಟು ಬೆಲೆಗಳು',
      'users': 'ಬಳಕೆದಾರರು',
      'profile': 'ಪ್ರೊಫೈಲ್',
      'logout': 'ಲಾಗ್ ಔಟ್',
      'login': 'ಲಾಗ್ ಇನ್',
      'register': 'ನೋಂದಾಯಿಸಿ',
      'home': 'ಮುಖಪುಟ',
      'settings': 'ಸೆಟ್ಟಿಂಗ್ಸ್',
      
      // Contract statuses
      'draft': 'ಕರಡು',
      'pending': 'ಬಾಕಿ',
      'active': 'ಸಕ್ರಿಯ',
      'completed': 'ಪೂರ್ಣಗೊಂಡ',
      'cancelled': 'ರದ್ದುಗೊಂಡ',
      
      // Transaction statuses
      'transaction.pending': 'ಬಾಕಿ',
      'transaction.completed': 'ಪೂರ್ಣಗೊಂಡ',
      'transaction.failed': 'ವಿಫಲಗೊಂಡ',
      'transaction.refunded': 'ಹಣ ಮರಳಿಸಲಾಗಿದೆ',
      
      // Payment types
      'transaction.advance': 'ಮುಂಗಡ',
      'transaction.partial': 'ಭಾಗಶಃ',
      'transaction.final': 'ಅಂತಿಮ',
      'transaction.refund': 'ಹಣ ಮರಳಿಸುವಿಕೆ',
      'transaction.other': 'ಇತರೆ',
      
      // Payment methods
      'transaction.cash': 'ನಗದು',
      'transaction.bankTransfer': 'ಬ್ಯಾಂಕ್ ವರ್ಗಾವಣೆ',
      'transaction.upi': 'ಯುಪಿಐ',
      'transaction.cheque': 'ಚೆಕ್',
      'transaction.neft': 'ಎನ್‌ಇಎಫ್‌ಟಿ',
      'transaction.rtgs': 'ಆರ್‌ಟಿಜಿಎಸ್',
      'transaction.imps': 'ಐಎಂಪಿಎಸ್',
      'transaction.card': 'ಕಾರ್ಡ್',
      'transaction.digitalWallet': 'ಡಿಜಿಟಲ್ ವಾಲೆಟ್',
      'transaction.paytm': 'ಪೇಟಿಎಂ',
      'transaction.googlePay': 'ಗೂಗಲ್ ಪೇ',
      'transaction.amazonPay': 'ಅಮೆಜಾನ್ ಪೇ',
      'transaction.phonePe': 'ಫೋನ್‌ಪೇ',
      
      // Common actions
      'create': 'ರಚಿಸಿ',
      'edit': 'ಸಂಪಾದಿಸಿ',
      'delete': 'ಅಳಿಸಿ',
      'save': 'ಉಳಿಸಿ',
      'cancel': 'ರದ್ದುಮಾಡಿ',
      'update': 'ನವೀಕರಿಸಿ',
      'approve': 'ಅನುಮೋದಿಸಿ',
      'reject': 'ತಿರಸ್ಕರಿಸಿ',
      'confirm': 'ದೃಢೀಕರಿಸಿ',
      
      // Common fields
      'name': 'ಹೆಸರು',
      'email': 'ಇಮೇಲ್',
      'phone': 'ದೂರವಾಣಿ',
      'address': 'ವಿಳಾಸ',
      'city': 'ನಗರ',
      'state': 'ರಾಜ್ಯ',
      'pincode': 'ಪಿನ್‌ಕೋಡ್',
      'product': 'ಉತ್ಪನ್ನ',
      'quantity': 'ಪ್ರಮಾಣ',
      'unit': 'ಏಕಮಾನ',
      'price': 'ಬೆಲೆ',
      'total': 'ಒಟ್ಟು',
      'date': 'ದಿನಾಂಕ',
      'status': 'ಸ್ಥಿತಿ',
      'amount': 'ಮೊತ್ತ',
      'method': 'ವಿಧಾನ',
      'type': 'ಬಗೆ',
      
      // Specific to agriculture
      'farmer': 'ರೈತ',
      'buyer': 'ಖರೀದಿದಾರ',
      'admin': 'ನಿರ್ವಾಹಕ',
      'commodity': 'ವಸ್ತು',
      'agriculture': 'ಕೃಷಿ',
      'farming': 'ಕೃಷಿ ಚಟುವಟಿಕೆ',
      'harvest': 'ಬೆಳೆ ಕಡಿ',
      'season': 'ಋತು',
      'yield': 'ಬೆಳೆ ಉತ್ಪನ್ನ',
      'quality': 'ಗುಣಮಟ್ಟ',
      'grade': 'ಗ್ರೇಡ್',
      'variety': 'ಬಗೆ',
      
      // Market related
      'market': 'ಮಾರುಕಟ್ಟು',
      'priceTrend': 'ಬೆಲೆ ಪ್ರವೃತ್ತಿ',
      'supply': 'ಪೂರೈಕೆ',
      'demand': 'ಬೇಡಿಕೆ',
      'region': 'ಪ್ರದೇಶ',
      'location': 'ಸ್ಥಳ',
      'delivery': 'ವಿತರಣೆ',
      
      // Navigation
      'navigation.dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      'navigation.contracts': 'ಒಪ್ಪಂದಗಳು',
      'navigation.transactions': 'ವಹಿವಾಟುಗಳು',
      'navigation.marketPrices': 'ಮಾರುಕಟ್ಟು ಬೆಲೆಗಳು',
      'navigation.users': 'ಬಳಕೆದಾರರು',
      'navigation.profile': 'ಪ್ರೊಫೈಲ್',
      
      // Contract related
      'contract.createContract': 'ಒಪ್ಪಂದ ರಚಿಸಿ',
      'contract.manage': 'ನಿರ್ವಹಿಸಿ',
      'contract.farming': 'ಕೃಷಿ ಒಪ್ಪಂದಗಳು',
      'contract.noContractsFound': 'ಯಾವುದೇ ಒಪ್ಪಂದಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
      'contract.createFirstContract': 'ನಿಮ್ಮ ಮೊದಲ ಒಪ್ಪಂದ ರಚಿಸಿ',
      'contract.noContractsAvailable': 'ಯಾವುದೇ ಒಪ್ಪಂದಗಳು ಲಭ್ಯವಿಲ್ಲ',
      'contract.quantity': 'ಪ್ರಮಾಣ',
      'contract.pricePerUnit': 'ಏಕಕಕ್ಕೆ ಬೆಲೆ',
      'contract.totalValue': 'ಒಟ್ಟು ಮೌಲ್ಯ',
      'contract.deliveryDate': 'ವಿತರಣಾ ದಿನಾಂಕ',
      'contract.startDate': 'ಆರಂಭ ದಿನಾಂಕ',
      'contract.terms': 'ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು',
      'contract.location': 'ವಿತರಣಾ ಸ್ಥಳ',
      
      // Transaction related
      'transaction.transactionList': 'ವಹಿವಾಟು ಪಟ್ಟಿ',
      'transaction.transactionManagement': 'ವಹಿವಾಟು ನಿರ್ವಹಣೆ',
      'transaction.amount': 'ಮೊತ್ತ',
      'transaction.paymentMethod': 'ಪಾವತಿ ವಿಧಾನ',
      'transaction.paymentType': 'ಪಾವತಿ ಬಗೆ',
      'transaction.contractWith': 'ಒಪ್ಪಂದ ಯಾರೊಂದಿಗೆ ',
      'transaction.totalTransactions': 'ಒಟ್ಟು ವಹಿವಾಟುಗಳು',
      'transaction.pendingPayment': 'ಬಾಕಿ ಪಾವತಿ',
      'transaction.confirmDelete': 'ಈ ವಹಿವಾಟನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತಪಡಿಸುತ್ತೀರಾ?',
      'transaction.delete': 'ಅಳಿಸಿ',
      
      // Contract request messages
      'contract.failedToCreateRequest': 'ಒಪ್ಪಂದ ಮನವಿಯನ್ನು ರಚಿಸಲು ವಿಫಲಗೊಂಡಿದೆ',
      'contract.requestSentSuccessfully': 'ಒಪ್ಪಂದ ಮನವಿ ಕಳುಹಿಸಲಾಗಿದೆ! ರೈತರು ನಿಮ್ಮ ಮನವಿಯನ್ನು ಪರಿಶೀಲಿಸುವರು.',
      
      // Common messages
      'common.loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      'common.error': 'ದೋಷ ಸಂಭವಿಸಿದೆ',
      'common.success': 'ಯಶಸ್ಸು',
      'common.na': 'ಅನ್ವಯಿಸುವುದಿಲ್ಲ',
      'common.all': 'ಎಲ್ಲಾ',
      'common.filter': 'ಫಿಲ್ಟರ್',
      'common.search': 'ಹುಡುಕಿ',
      'common.reset': 'ಮರುಹೊಂದಿಸಿ',
      'common.yes': 'ಹೌದು',
      'common.no': 'ಇಲ್ಲ',
      'common.ok': 'ಸರಿ',
      'common.close': 'ಮುಚ್ಚಿ'
    }
  };
  
  const langTranslations = translations[lang] || translations.en;
  const fallbackTranslations = fallback[lang] || fallback.en || {};
  
  return langTranslations[key] || fallbackTranslations[key] || key;
};

/**
 * Get language direction (LTR/RTL)
 * @param {string} lang - Language code
 * @returns {string} Text direction ('ltr' or 'rtl')
 */
export const getLanguageDirection = (lang = 'en') => {
  // Kannada uses LTR direction
  const rtlLanguages = ['ar', 'he', 'fa', 'ur']; // Add RTL languages here if needed
  return rtlLanguages.includes(lang) ? 'rtl' : 'ltr';
};

/**
 * Format number based on locale
 * @param {number} number - Number to format
 * @param {string} lang - Language code
 * @param {Object} options - Formatting options
 * @returns {string} Formatted number
 */
export const formatNumber = (number, lang = 'en', options = {}) => {
  const formatOptions = {
    style: options.style || 'decimal',
    minimumFractionDigits: options.minimumFractionDigits || 0,
    maximumFractionDigits: options.maximumFractionDigits || 2,
    ...options
  };
  
  return new Intl.NumberFormat(lang === 'kn' ? 'en-IN' : lang, formatOptions).format(number);
};

/**
 * Format date based on locale
 * @param {Date|string} date - Date to format
 * @param {string} lang - Language code
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date
 */
export const formatDate = (date, lang = 'en', options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat(lang === 'kn' ? 'kn-IN' : lang, defaultOptions).format(new Date(date));
};

/**
 * Format currency based on locale
 * @param {number} amount - Amount to format
 * @param {string} lang - Language code
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, lang = 'en', currency = 'INR') => {
  return new Intl.NumberFormat(lang === 'kn' ? 'kn-IN' : lang, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Get available languages
 * @returns {Array} Array of available language codes
 */
export const getAvailableLanguages = () => {
  return ['en', 'kn']; // English and Kannada
};

/**
 * Get language name
 * @param {string} code - Language code
 * @returns {string} Language name
 */
export const getLanguageName = (code) => {
  const languages = {
    en: 'English',
    kn: 'ಕನ್ನಡ'
  };
  
  return languages[code] || code;
};

/**
 * Check if language is RTL
 * @param {string} lang - Language code
 * @returns {boolean} True if language is RTL
 */
export const isRtlLanguage = (lang) => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(lang);
};

/**
 * Switch language
 * @param {string} lang - New language code
 */
export const switchLanguage = (lang) => {
  // In a real implementation, this would update the app's language context
  // For now, we'll just return the language
  return lang;
};

/**
 * Get browser language
 * @returns {string} Browser language code
 */
export const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  const availableLangs = getAvailableLanguages();
  
  // Check if browser language is available in our app
  if (availableLangs.includes(browserLang.substring(0, 2))) {
    return browserLang.substring(0, 2);
  }
  
  // Default to English
  return 'en';
};

export default {
  getLocalizedText,
  getLanguageDirection,
  formatNumber,
  formatDate,
  formatCurrency,
  getAvailableLanguages,
  getLanguageName,
  isRtlLanguage,
  switchLanguage,
  getBrowserLanguage
};