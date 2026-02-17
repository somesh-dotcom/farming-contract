// JavaScript utility for API interactions and data handling

/**
 * Make an authenticated API request
 * @param {string} url - API endpoint
 * @param {Object} options - Request options
 * @param {string} token - Authentication token
 * @returns {Promise} Promise with response
 */
export const authenticatedRequest = async (url, options = {}, token) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * Fetch contracts with error handling
 * @param {string} token - Authentication token
 * @param {Object} filters - Filter options
 * @returns {Promise} Promise with contracts data
 */
export const fetchContracts = async (token, filters = {}) => {
  try {
    let url = '/api/contracts';
    const queryParams = new URLSearchParams(filters);
    if (queryParams.toString()) {
      url += `?${queryParams}`;
    }
    
    const data = await authenticatedRequest(url, {}, token);
    return data.contracts || [];
  } catch (error) {
    console.error('Error fetching contracts:', error);
    throw error;
  }
};

/**
 * Fetch market prices with error handling
 * @param {string} token - Authentication token
 * @param {Object} filters - Filter options
 * @returns {Promise} Promise with market prices data
 */
export const fetchMarketPrices = async (token, filters = {}) => {
  try {
    let url = '/api/market-prices';
    const queryParams = new URLSearchParams(filters);
    if (queryParams.toString()) {
      url += `?${queryParams}`;
    }
    
    const data = await authenticatedRequest(url, {}, token);
    return data.prices || [];
  } catch (error) {
    console.error('Error fetching market prices:', error);
    throw error;
  }
};

/**
 * Fetch transactions with error handling
 * @param {string} token - Authentication token
 * @param {Object} filters - Filter options
 * @returns {Promise} Promise with transactions data
 */
export const fetchTransactions = async (token, filters = {}) => {
  try {
    let url = '/api/transactions';
    const queryParams = new URLSearchParams(filters);
    if (queryParams.toString()) {
      url += `?${queryParams}`;
    }
    
    const data = await authenticatedRequest(url, {}, token);
    return data.transactions || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * Fetch users with error handling
 * @param {string} token - Authentication token
 * @param {Object} filters - Filter options
 * @returns {Promise} Promise with users data
 */
export const fetchUsers = async (token, filters = {}) => {
  try {
    let url = '/api/users';
    const queryParams = new URLSearchParams(filters);
    if (queryParams.toString()) {
      url += `?${queryParams}`;
    }
    
    const data = await authenticatedRequest(url, {}, token);
    return data.users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Create a new contract
 * @param {string} token - Authentication token
 * @param {Object} contractData - Contract data
 * @returns {Promise} Promise with created contract
 */
export const createContract = async (token, contractData) => {
  try {
    const response = await authenticatedRequest('/api/contracts', {
      method: 'POST',
      body: JSON.stringify(contractData)
    }, token);
    
    return response.contract;
  } catch (error) {
    console.error('Error creating contract:', error);
    throw error;
  }
};

/**
 * Update contract status
 * @param {string} token - Authentication token
 * @param {string} contractId - Contract ID
 * @param {string} status - New status
 * @returns {Promise} Promise with updated contract
 */
export const updateContractStatus = async (token, contractId, status) => {
  try {
    const response = await authenticatedRequest(`/api/contracts/${contractId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }, token);
    
    return response.contract;
  } catch (error) {
    console.error('Error updating contract status:', error);
    throw error;
  }
};

/**
 * Create a new transaction
 * @param {string} token - Authentication token
 * @param {Object} transactionData - Transaction data
 * @returns {Promise} Promise with created transaction
 */
export const createTransaction = async (token, transactionData) => {
  try {
    const response = await authenticatedRequest('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    }, token);
    
    return response.transaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

/**
 * Update transaction status
 * @param {string} token - Authentication token
 * @param {string} transactionId - Transaction ID
 * @param {string} status - New status
 * @returns {Promise} Promise with updated transaction
 */
export const updateTransactionStatus = async (token, transactionId, status) => {
  try {
    const response = await authenticatedRequest(`/api/transactions/${transactionId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }, token);
    
    return response.transaction;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  };
};

/**
 * Delete a transaction
 * @param {string} token - Authentication token
 * @param {string} transactionId - Transaction ID
 * @returns {Promise} Promise with response
 */
export const deleteTransaction = async (token, transactionId) => {
  try {
    const response = await authenticatedRequest(`/api/transactions/${transactionId}`, {
      method: 'DELETE'
    }, token);
    
    return response;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

/**
 * Get user profile
 * @param {string} token - Authentication token
 * @returns {Promise} Promise with user profile
 */
export const getUserProfile = async (token) => {
  try {
    const response = await authenticatedRequest('/api/auth/me', {}, token);
    return response.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} token - Authentication token
 * @param {Object} userData - User data to update
 * @returns {Promise} Promise with updated user
 */
export const updateUserProfile = async (token, userData) => {
  try {
    const response = await authenticatedRequest('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    }, token);
    
    return response.user;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Format API error messages
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export const formatApiError = (error) => {
  if (error.message.includes('Network Error')) {
    return 'Network error. Please check your connection.';
  }
  
  if (error.message.includes('401')) {
    return 'Unauthorized. Please log in again.';
  }
  
  if (error.message.includes('403')) {
    return 'Access denied. You do not have permission to perform this action.';
  }
  
  if (error.message.includes('404')) {
    return 'Resource not found.';
  }
  
  if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  }
  
  return error.message || 'An error occurred. Please try again.';
};

/**
 * Handle API response with loading states
 * @param {Function} apiCall - API call function
 * @param {Function} setLoading - Set loading state function
 * @param {Function} setError - Set error state function
 * @returns {Promise} Promise with response
 */
export const handleApiResponse = async (apiCall, setLoading, setError) => {
  try {
    setLoading(true);
    setError(null);
    
    const result = await apiCall();
    return result;
  } catch (error) {
    const errorMessage = formatApiError(error);
    setError(errorMessage);
    throw error;
  } finally {
    setLoading(false);
  }
};

/**
 * Debounce API calls to prevent excessive requests
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounceApiCall = (func, wait) => {
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
 * Retry failed API calls
 * @param {Function} apiCall - API call function
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise} Promise with response
 */
export const retryApiCall = async (apiCall, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Cache API responses
 * @param {Object} cache - Cache object
 * @param {string} key - Cache key
 * @param {Function} apiCall - API call function
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Promise} Promise with response
 */
export const cachedApiCall = async (cache, key, apiCall, ttl = 5 * 60 * 1000) => { // 5 minutes default
  const cached = cache[key];
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const data = await apiCall();
  cache[key] = {
    data,
    timestamp: Date.now()
  };
  
  return data;
};

/**
 * Transform contract data for display
 * @param {Array} contracts - Raw contracts data
 * @returns {Array} Transformed contracts data
 */
export const transformContractData = (contracts) => {
  return contracts.map(contract => ({
    ...contract,
    startDate: new Date(contract.startDate),
    deliveryDate: new Date(contract.deliveryDate),
    totalValue: Number(contract.totalValue),
    quantity: Number(contract.quantity),
    pricePerUnit: Number(contract.pricePerUnit)
  }));
};

/**
 * Transform market price data for display
 * @param {Array} prices - Raw prices data
 * @returns {Array} Transformed prices data
 */
export const transformPriceData = (prices) => {
  return prices.map(price => ({
    ...price,
    price: Number(price.price),
    date: new Date(price.date)
  }));
};

/**
 * Transform transaction data for display
 * @param {Array} transactions - Raw transactions data
 * @returns {Array} Transformed transactions data
 */
export const transformTransactionData = (transactions) => {
  return transactions.map(transaction => ({
    ...transaction,
    amount: Number(transaction.amount),
    transactionDate: new Date(transaction.transactionDate),
    createdAt: new Date(transaction.createdAt),
    updatedAt: new Date(transaction.updatedAt)
  }));
};

export default {
  authenticatedRequest,
  fetchContracts,
  fetchMarketPrices,
  fetchTransactions,
  fetchUsers,
  createContract,
  updateContractStatus,
  createTransaction,
  updateTransactionStatus,
  deleteTransaction,
  getUserProfile,
  updateUserProfile,
  formatApiError,
  handleApiResponse,
  debounceApiCall,
  retryApiCall,
  cachedApiCall,
  transformContractData,
  transformPriceData,
  transformTransactionData
};