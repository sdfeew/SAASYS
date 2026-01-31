/**
 * useFormValidation Hook
 * Provides form field validation utilities
 */

import { useCallback } from 'react';

export const useFormValidation = () => {
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : 'Invalid email address';
  }, []);

  const validatePassword = useCallback((password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return null;
  }, []);

  const validateRequired = useCallback((value, fieldName) => {
    if (!value || String(value).trim() === '') {
      return `${fieldName} is required`;
    }
    return null;
  }, []);

  const validateUrl = useCallback((url) => {
    try {
      new URL(url);
      return null;
    } catch {
      return 'Invalid URL';
    }
  }, []);

  const validatePhone = useCallback((phone) => {
    const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
    return phoneRegex.test(phone.replace(/\s/g, '')) ? null : 'Invalid phone number';
  }, []);

  const validateNumber = useCallback((value, min = null, max = null) => {
    const num = Number(value);
    if (isNaN(num)) return 'Must be a valid number';
    if (min !== null && num < min) return `Must be at least ${min}`;
    if (max !== null && num > max) return `Must be no more than ${max}`;
    return null;
  }, []);

  const validateMinLength = useCallback((value, minLength) => {
    if (String(value).length < minLength) {
      return `Must be at least ${minLength} characters`;
    }
    return null;
  }, []);

  const validateMaxLength = useCallback((value, maxLength) => {
    if (String(value).length > maxLength) {
      return `Must be no more than ${maxLength} characters`;
    }
    return null;
  }, []);

  const validateMatch = useCallback((value1, value2, fieldName) => {
    if (value1 !== value2) {
      return `${fieldName} do not match`;
    }
    return null;
  }, []);

  const validateDate = useCallback((dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return null;
  }, []);

  return {
    validateEmail,
    validatePassword,
    validateRequired,
    validateUrl,
    validatePhone,
    validateNumber,
    validateMinLength,
    validateMaxLength,
    validateMatch,
    validateDate
  };
};

export default useFormValidation;
