// JavaScript utility for form validation

/**
 * Validate an email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

/**
 * Validate a phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone number is valid
 */
export const validatePhone = (phone) => {
  // Indian phone number format: 10 digits, optionally with country code
  const re = /^(\+91|91|0)?[6-9]\d{9}$/;
  return re.test(phone.replace(/\s+/g, '').replace(/[-+()]/g, ''));
};

/**
 * Validate a strong password
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {Array} Array of validation errors
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true
  } = options;
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors;
};

/**
 * Validate a required field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Array} Array of validation errors
 */
export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return [`${fieldName || 'Field'} is required`];
  }
  return [];
};

/**
 * Validate a numeric value
 * @param {string|number} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {Array} Array of validation errors
 */
export const validateNumber = (value, options = {}) => {
  const {
    min = -Infinity,
    max = Infinity,
    allowNegative = true,
    integerOnly = false
  } = options;
  
  const errors = [];
  
  if (value === '' || value === null || value === undefined) {
    return errors; // Allow empty values, use validateRequired for required numbers
  }
  
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    errors.push('Value must be a number');
    return errors;
  }
  
  if (!allowNegative && numValue < 0) {
    errors.push('Value must be positive');
  }
  
  if (numValue < min) {
    errors.push(`Value must be at least ${min}`);
  }
  
  if (numValue > max) {
    errors.push(`Value must be no more than ${max}`);
  }
  
  if (integerOnly && !Number.isInteger(numValue)) {
    errors.push('Value must be a whole number');
  }
  
  return errors;
};

/**
 * Validate a date
 * @param {string|Date} date - Date to validate
 * @param {Object} options - Validation options
 * @returns {Array} Array of validation errors
 */
export const validateDate = (date, options = {}) => {
  const {
    minDate,
    maxDate,
    required = false
  } = options;
  
  const errors = [];
  
  if (!date) {
    if (required) {
      errors.push('Date is required');
    }
    return errors;
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    errors.push('Invalid date format');
    return errors;
  }
  
  if (minDate && dateObj < new Date(minDate)) {
    errors.push(`Date must be after ${new Date(minDate).toDateString()}`);
  }
  
  if (maxDate && dateObj > new Date(maxDate)) {
    errors.push(`Date must be before ${new Date(maxDate).toDateString()}`);
  }
  
  return errors;
};

/**
 * Validate a URL
 * @param {string} url - URL to validate
 * @returns {Array} Array of validation errors
 */
export const validateUrl = (url) => {
  if (!url) return [];
  
  const re = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  if (!re.test(url.trim())) {
    return ['Please enter a valid URL'];
  }
  return [];
};

/**
 * Validate a string length
 * @param {string} value - String to validate
 * @param {Object} options - Validation options
 * @returns {Array} Array of validation errors
 */
export const validateStringLength = (value, options = {}) => {
  const {
    minLength = 0,
    maxLength = Infinity
  } = options;
  
  const errors = [];
  
  if (value === null || value === undefined) {
    return errors;
  }
  
  if (value.length < minLength) {
    errors.push(`Must be at least ${minLength} characters`);
  }
  
  if (value.length > maxLength) {
    errors.push(`Must be no more than ${maxLength} characters`);
  }
  
  return errors;
};

/**
 * Validate an array
 * @param {Array} array - Array to validate
 * @param {Object} options - Validation options
 * @returns {Array} Array of validation errors
 */
export const validateArray = (array, options = {}) => {
  const {
    minLength = 0,
    maxLength = Infinity,
    required = false
  } = options;
  
  const errors = [];
  
  if (!Array.isArray(array)) {
    if (required) {
      errors.push('Field must be an array');
    }
    return errors;
  }
  
  if (required && array.length === 0) {
    errors.push('At least one item is required');
  }
  
  if (array.length < minLength) {
    errors.push(`At least ${minLength} items are required`);
  }
  
  if (array.length > maxLength) {
    errors.push(`No more than ${maxLength} items are allowed`);
  }
  
  return errors;
};

/**
 * Validate a field based on multiple rules
 * @param {any} value - Value to validate
 * @param {Array} rules - Array of validation rules
 * @returns {Array} Array of validation errors
 */
export const validateField = (value, rules) => {
  let errors = [];
  
  for (const rule of rules) {
    if (typeof rule === 'function') {
      const result = rule(value);
      if (Array.isArray(result)) {
        errors = errors.concat(result);
      } else if (result) {
        errors.push(result);
      }
    } else if (typeof rule === 'object' && rule.validator) {
      const result = rule.validator(value, rule.params);
      if (Array.isArray(result)) {
        errors = errors.concat(result);
      } else if (result) {
        errors.push(result);
      }
    }
  }
  
  return errors;
};

/**
 * Validate an entire form
 * @param {Object} formData - Form data object
 * @param {Object} validationRules - Validation rules for each field
 * @returns {Object} Object with field names as keys and error arrays as values
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  for (const [field, rules] of Object.entries(validationRules)) {
    const value = formData[field];
    const fieldErrors = validateField(value, rules);
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  }
  
  return errors;
};

/**
 * Check if a form has errors
 * @param {Object} errors - Form errors object
 * @returns {boolean} True if form has errors
 */
export const hasFormErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Get the first error message for a field
 * @param {Object} errors - Form errors object
 * @param {string} field - Field name
 * @returns {string|undefined} First error message or undefined
 */
export const getFieldError = (errors, field) => {
  if (errors[field] && errors[field].length > 0) {
    return errors[field][0];
  }
  return undefined;
};

/**
 * Check if a field has errors
 * @param {Object} errors - Form errors object
 * @param {string} field - Field name
 * @returns {boolean} True if field has errors
 */
export const hasFieldError = (errors, field) => {
  return errors[field] && errors[field].length > 0;
};

/**
 * Create a validator function for a specific rule
 * @param {string} ruleName - Name of the rule
 * @param {any} params - Parameters for the rule
 * @returns {Function} Validator function
 */
export const createValidator = (ruleName, params) => {
  switch (ruleName) {
    case 'required':
      return (value) => validateRequired(value, params.fieldName || 'Field');
    case 'email':
      return (value) => validateEmail(value) ? [] : ['Please enter a valid email address'];
    case 'phone':
      return (value) => validatePhone(value) ? [] : ['Please enter a valid phone number'];
    case 'number':
      return (value) => validateNumber(value, params);
    case 'date':
      return (value) => validateDate(value, params);
    case 'url':
      return (value) => validateUrl(value);
    case 'minLength':
      return (value) => validateStringLength(value, { minLength: params.minLength });
    case 'maxLength':
      return (value) => validateStringLength(value, { maxLength: params.maxLength });
    case 'password':
      return (value) => validatePassword(value, params);
    case 'array':
      return (value) => validateArray(value, params);
    default:
      return () => [];
  }
};

/**
 * Validate an Indian pincode
 * @param {string} pincode - Pincode to validate
 * @returns {boolean} True if pincode is valid
 */
export const validatePincode = (pincode) => {
  if (!pincode) return true; // Allow empty pincodes
  const re = /^\d{6}$/; // Indian pincode is 6 digits
  return re.test(pincode.toString());
};

/**
 * Validate a PAN card number
 * @param {string} pan - PAN to validate
 * @returns {boolean} True if PAN is valid
 */
export const validatePan = (pan) => {
  if (!pan) return true; // Allow empty PAN
  const re = /^([A-Z]){5}([0-9]){4}([A-Z]){1}?$/;
  return re.test(pan.toUpperCase());
};

/**
 * Validate an Aadhaar number
 * @param {string} aadhaar - Aadhaar to validate
 * @returns {boolean} True if Aadhaar is valid
 */
export const validateAadhaar = (aadhaar) => {
  if (!aadhaar) return true; // Allow empty Aadhaar
  const re = /^\d{12}$/; // Aadhaar is 12 digits
  return re.test(aadhaar.toString());
};

export default {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired,
  validateNumber,
  validateDate,
  validateUrl,
  validateStringLength,
  validateArray,
  validateField,
  validateForm,
  hasFormErrors,
  getFieldError,
  hasFieldError,
  createValidator,
  validatePincode,
  validatePan,
  validateAadhaar
};