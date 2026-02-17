// JavaScript utility for contract management and analysis

/**
 * Calculate contract completion percentage based on payment status
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Completion percentage
 */
export const calculateContractCompletion = (transactions) => {
  if (!transactions || transactions.length === 0) return 0;
  
  const completedTransactions = transactions.filter(t => t.status === 'COMPLETED');
  return (completedTransactions.length / transactions.length) * 100;
};

/**
 * Get contract status color for UI styling
 * @param {string} status - Contract status
 * @returns {string} Tailwind CSS color class
 */
export const getContractStatusColor = (status) => {
  switch (status.toUpperCase()) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-700';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700';
    case 'ACTIVE':
      return 'bg-green-100 text-green-700';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-700';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/**
 * Get transaction status color for UI styling
 * @param {string} status - Transaction status
 * @returns {string} Tailwind CSS color class
 */
export const getTransactionStatusColor = (status) => {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700';
    case 'COMPLETED':
      return 'bg-green-100 text-green-700';
    case 'FAILED':
      return 'bg-red-100 text-red-700';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/**
 * Calculate remaining amount for a contract based on transactions
 * @param {number} totalValue - Total contract value
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Remaining amount
 */
export const calculateRemainingAmount = (totalValue, transactions) => {
  if (!transactions || transactions.length === 0) return totalValue;
  
  const paidAmount = transactions
    .filter(t => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return totalValue - paidAmount;
};

/**
 * Get payment progress percentage for a contract
 * @param {number} totalValue - Total contract value
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Payment progress percentage
 */
export const getPaymentProgress = (totalValue, transactions) => {
  if (totalValue === 0) return 0;
  
  const paidAmount = calculateRemainingAmount(totalValue, transactions);
  return ((totalValue - paidAmount) / totalValue) * 100;
};

/**
 * Format contract duration in human-readable format
 * @param {Date} startDate - Contract start date
 * @param {Date} endDate - Contract end date
 * @returns {string} Formatted duration
 */
export const formatContractDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''}`;
  }
};

/**
 * Get contract urgency level based on delivery date
 * @param {Date} deliveryDate - Contract delivery date
 * @returns {string} Urgency level ('low', 'medium', 'high', 'critical')
 */
export const getContractUrgency = (deliveryDate) => {
  const today = new Date();
  const delivery = new Date(deliveryDate);
  const diffTime = delivery - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'critical'; // Overdue
  if (diffDays <= 3) return 'critical';
  if (diffDays <= 7) return 'high';
  if (diffDays <= 30) return 'medium';
  return 'low';
};

/**
 * Validate contract data
 * @param {Object} contract - Contract object to validate
 * @returns {Array} Array of validation errors
 */
export const validateContract = (contract) => {
  const errors = [];
  
  if (!contract.buyerId) errors.push('Buyer is required');
  if (!contract.productId) errors.push('Product is required');
  if (!contract.quantity || contract.quantity <= 0) errors.push('Valid quantity is required');
  if (!contract.unit) errors.push('Unit is required');
  if (!contract.pricePerUnit || contract.pricePerUnit <= 0) errors.push('Valid price per unit is required');
  if (!contract.startDate) errors.push('Start date is required');
  if (!contract.deliveryDate) errors.push('Delivery date is required');
  if (new Date(contract.deliveryDate) < new Date(contract.startDate)) {
    errors.push('Delivery date must be after start date');
  }
  
  return errors;
};

/**
 * Get contract timeline status
 * @param {Object} contract - Contract object
 * @returns {Object} Timeline status object
 */
export const getContractTimelineStatus = (contract) => {
  const now = new Date();
  const startDate = new Date(contract.startDate);
  const deliveryDate = new Date(contract.deliveryDate);
  
  if (now < startDate) {
    return {
      phase: 'upcoming',
      message: 'Contract period not started yet',
      progress: 0
    };
  } else if (now >= startDate && now <= deliveryDate) {
    const totalDuration = deliveryDate - startDate;
    const elapsedDuration = now - startDate;
    const progress = (elapsedDuration / totalDuration) * 100;
    
    return {
      phase: 'active',
      message: 'Contract is currently active',
      progress: Math.min(progress, 100)
    };
  } else {
    return {
      phase: 'expired',
      message: 'Contract period has ended',
      progress: 100
    };
  }
};

/**
 * Calculate contract profitability
 * @param {number} costPrice - Cost price of the product
 * @param {number} sellingPrice - Selling price of the product
 * @param {number} quantity - Quantity of the product
 * @returns {Object} Profitability analysis
 */
export const calculateProfitability = (costPrice, sellingPrice, quantity) => {
  const totalCost = costPrice * quantity;
  const totalRevenue = sellingPrice * quantity;
  const profit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  
  return {
    totalCost,
    totalRevenue,
    profit,
    profitMargin: Math.round(profitMargin * 100) / 100
  };
};

/**
 * Get contract risk level based on various factors
 * @param {Object} contract - Contract object
 * @param {Array} transactions - Array of transaction objects
 * @returns {string} Risk level ('low', 'medium', 'high')
 */
export const getContractRiskLevel = (contract, transactions) => {
  let riskScore = 0;
  
  // Check payment completion
  const completionPercentage = calculateContractCompletion(transactions);
  if (completionPercentage < 50) riskScore += 2;
  else if (completionPercentage < 80) riskScore += 1;
  
  // Check contract duration
  const duration = new Date(contract.deliveryDate) - new Date(contract.startDate);
  if (duration > 365 * 24 * 60 * 60 * 1000) riskScore += 1; // More than 1 year
  
  // Check urgency
  if (getContractUrgency(contract.deliveryDate) === 'critical') riskScore += 1;
  
  if (riskScore >= 3) return 'high';
  if (riskScore >= 1) return 'medium';
  return 'low';
};

/**
 * Format contract summary for display
 * @param {Object} contract - Contract object
 * @returns {Object} Formatted contract summary
 */
export const formatContractSummary = (contract) => {
  return {
    id: contract.id,
    productName: contract.product?.name || 'Unknown Product',
    buyerName: contract.buyer?.name || 'Unknown Buyer',
    farmerName: contract.farmer?.name || 'Unknown Farmer',
    totalValue: contract.totalValue,
    quantity: contract.quantity,
    unit: contract.unit,
    status: contract.status,
    startDate: new Date(contract.startDate),
    deliveryDate: new Date(contract.deliveryDate),
    location: contract.location || 'Not specified',
    duration: formatContractDuration(contract.startDate, contract.deliveryDate),
    urgency: getContractUrgency(contract.deliveryDate),
    timeline: getContractTimelineStatus(contract)
  };
};

export default {
  calculateContractCompletion,
  getContractStatusColor,
  getTransactionStatusColor,
  calculateRemainingAmount,
  getPaymentProgress,
  formatContractDuration,
  getContractUrgency,
  validateContract,
  getContractTimelineStatus,
  calculateProfitability,
  getContractRiskLevel,
  formatContractSummary
};