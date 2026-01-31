/**
 * Error Handler Utility
 * Provides consistent error handling across the application
 */

export const errorHandler = {
  // Parse error message from various error sources
  getErrorMessage(error) {
    if (!error) return 'An unknown error occurred';
    
    // Supabase error
    if (error?.message) return error.message;
    
    // Standard JavaScript error
    if (typeof error === 'string') return error;
    
    // Default error message
    return 'An unexpected error occurred. Please try again.';
  },

  // Log error with context
  logError(context, error, additionalInfo = {}) {
    const errorData = {
      context,
      message: this.getErrorMessage(error),
      timestamp: new Date().toISOString(),
      ...additionalInfo
    };
    
    console.error(`[${context}]`, errorData);
    return errorData;
  },

  // Handle Supabase RLS errors
  isRLSError(error) {
    return error?.message?.includes('RLS') || error?.code === 'PGRST301';
  },

  // Handle authentication errors
  isAuthError(error) {
    const message = this.getErrorMessage(error);
    return message.includes('auth') || message.includes('login') || message.includes('password');
  },

  // Handle not found errors
  isNotFoundError(error) {
    return error?.code === 'PGRST116' || this.getErrorMessage(error).includes('not found');
  },

  // Handle validation errors
  isValidationError(error) {
    const message = this.getErrorMessage(error);
    return message.includes('validation') || message.includes('required') || message.includes('invalid');
  },

  // Handle network errors
  isNetworkError(error) {
    const message = this.getErrorMessage(error);
    return message.includes('network') || message.includes('offline') || message.includes('fetch');
  },

  // Create user-friendly error message
  getUserMessage(error, context = 'Operation') {
    const message = this.getErrorMessage(error);
    
    if (this.isAuthError(error)) {
      return 'Authentication failed. Please log in again.';
    }
    
    if (this.isRLSError(error)) {
      return 'You do not have permission to perform this action.';
    }
    
    if (this.isNotFoundError(error)) {
      return 'The requested item was not found.';
    }
    
    if (this.isNetworkError(error)) {
      return 'Network error. Please check your connection and try again.';
    }
    
    return `${context} failed: ${message}`;
  },

  // Validate form data
  validateRequired(data, requiredFields) {
    const errors = {};
    
    requiredFields.forEach(field => {
      if (!data?.[field?.name] || String(data[field?.name])?.trim() === '') {
        errors[field?.name] = `${field?.label || field?.name} is required`;
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Validate email format
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // Validate URL format
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

export default errorHandler;
