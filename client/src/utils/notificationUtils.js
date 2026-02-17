// JavaScript utility for notifications and alerts

/**
 * Show a notification message
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('success', 'error', 'warning', 'info')
 * @param {number} duration - Duration in milliseconds (default: 3000)
 * @param {Function} onClose - Callback function when notification closes
 */
export const showNotification = (message, type = 'info', duration = 3000, onClose) => {
  // Create notification container if it doesn't exist
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
      width: calc(100% - 40px);
    `;
    document.body.appendChild(container);
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  // Style based on type
  const bgColor = {
    success: 'bg-green-100',
    error: 'bg-red-100',
    warning: 'bg-yellow-100',
    info: 'bg-blue-100'
  }[type] || 'bg-gray-100';
  
  const textColor = {
    success: 'text-green-700',
    error: 'text-red-700',
    warning: 'text-yellow-700',
    info: 'text-blue-700'
  }[type] || 'text-gray-700';
  
  notification.style.cssText = `
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 10px;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease-in-out;
    display: flex;
    justify-content: space-between;
    align-items: center;
    ${bgColor};
    ${textColor};
    border-left: 4px solid;
    border-color: ${
      { success: '#22c55e', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' }[type] || '#6b7280'
    };
  `;
  
  // Add content
  notification.innerHTML = `
    <span>${message}</span>
    <button class="notification-close" style="
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      margin-left: 10px;
      color: inherit;
      opacity: 0.7;
    ">&times;</button>
  `;
  
  // Add to container
  container.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  // Close button event
  const closeButton = notification.querySelector('.notification-close');
  closeButton.addEventListener('click', () => closeNotification(notification, onClose));
  
  // Auto close
  const timer = setTimeout(() => closeNotification(notification, onClose), duration);
  
  // Store timer for potential manual closure
  notification.dataset.timer = timer;
};

/**
 * Close a notification
 * @param {HTMLElement} notification - Notification element
 * @param {Function} onClose - Callback function
 */
const closeNotification = (notification, onClose) => {
  // Clear timer if exists
  if (notification.dataset.timer) {
    clearTimeout(parseInt(notification.dataset.timer));
  }
  
  // Animation out
  notification.style.opacity = '0';
  notification.style.transform = 'translateX(100%)';
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
    if (onClose) onClose();
  }, 300);
};

/**
 * Show a confirmation dialog
 * @param {string} message - Confirmation message
 * @param {string} title - Dialog title
 * @returns {Promise<boolean>} Promise that resolves with true/false
 */
export const showConfirmationDialog = (message, title = 'Confirm') => {
  return new Promise((resolve) => {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
    `;
    
    // Create dialog
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 8px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    `;
    
    dialog.innerHTML = `
      <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #374151;">${title}</h3>
      <p style="margin: 0 0 20px 0; color: #6b7280;">${message}</p>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="confirm-cancel" style="
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          color: #6b7280;
          cursor: pointer;
        ">Cancel</button>
        <button id="confirm-ok" style="
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background: #3b82f6;
          color: white;
          cursor: pointer;
        ">OK</button>
      </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    const okButton = document.getElementById('confirm-ok');
    const cancelButton = document.getElementById('confirm-cancel');
    
    const closeDialog = (result) => {
      document.body.removeChild(overlay);
      resolve(result);
    };
    
    okButton.addEventListener('click', () => closeDialog(true));
    cancelButton.addEventListener('click', () => closeDialog(false));
    
    // Allow closing with Escape key
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeDialog(false);
      }
    };
    
    document.addEventListener('keydown', handleEsc, { once: true });
  });
};

/**
 * Show a loading spinner
 * @param {string} message - Loading message
 * @returns {Function} Function to hide the loading spinner
 */
export const showLoadingSpinner = (message = 'Loading...') => {
  // Create loading overlay
  const overlay = document.createElement('div');
  overlay.id = 'loading-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    z-index: 10001;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 16px;
  `;
  
  // Create spinner
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;
  
  // Add CSS animation if not exists
  if (!document.getElementById('loading-spinner-style')) {
    const style = document.createElement('style');
    style.id = 'loading-spinner-style';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Create message
  const messageEl = document.createElement('div');
  messageEl.textContent = message;
  messageEl.style.color = '#374151';
  
  overlay.appendChild(spinner);
  overlay.appendChild(messageEl);
  document.body.appendChild(overlay);
  
  return () => {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  };
};

/**
 * Show a toast message
 * @param {string} message - Toast message
 * @param {string} type - Toast type ('success', 'error', 'warning', 'info')
 * @param {number} duration - Duration in milliseconds
 */
export const showToast = (message, type = 'info', duration = 3000) => {
  showNotification(message, type, duration);
};

/**
 * Show an error message
 * @param {string} message - Error message
 * @param {number} duration - Duration in milliseconds
 */
export const showError = (message, duration = 5000) => {
  showNotification(message, 'error', duration);
};

/**
 * Show a success message
 * @param {string} message - Success message
 * @param {number} duration - Duration in milliseconds
 */
export const showSuccess = (message, duration = 3000) => {
  showNotification(message, 'success', duration);
};

/**
 * Show a warning message
 * @param {string} message - Warning message
 * @param {number} duration - Duration in milliseconds
 */
export const showWarning = (message, duration = 4000) => {
  showNotification(message, 'warning', duration);
};

/**
 * Show an info message
 * @param {string} message - Info message
 * @param {number} duration - Duration in milliseconds
 */
export const showInfo = (message, duration = 3000) => {
  showNotification(message, 'info', duration);
};

/**
 * Show a system alert
 * @param {string} message - Alert message
 * @param {string} type - Alert type
 * @param {Object} options - Additional options
 */
export const showAlert = (message, type = 'info', options = {}) => {
  const {
    title = 'Alert',
    showIcon = true,
    persistent = false,
    onClose
  } = options;
  
  const fullMessage = showIcon 
    ? `${title}: ${message}`
    : message;
    
  const duration = persistent ? 0 : (type === 'error' ? 8000 : 5000);
  
  showNotification(fullMessage, type, duration, onClose);
};

export default {
  showNotification,
  showConfirmationDialog,
  showLoadingSpinner,
  showToast,
  showError,
  showSuccess,
  showWarning,
  showInfo,
  showAlert
};