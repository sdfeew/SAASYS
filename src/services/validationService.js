import { errorHandler } from '../utils/errorHandler';

/**
 * Data Validation Service
 * Comprehensive validation for all data types and formats
 */

export const validationService = {
  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Phone validation
  isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone?.replace(/\s/g, ''));
  },

  // URL validation
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Number validation
  isValidNumber(value, min = null, max = null) {
    const num = Number(value);
    if (isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
  },

  // Date validation
  isValidDate(date) {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
  },

  // Date range validation
  isValidDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.isValidDate(startDate) && this.isValidDate(endDate) && start <= end;
  },

  // String length validation
  isValidLength(value, min = 0, max = null) {
    const length = String(value).length;
    if (length < min) return false;
    if (max !== null && length > max) return false;
    return true;
  },

  // Pattern validation
  isValidPattern(value, pattern) {
    if (typeof pattern === 'string') {
      pattern = new RegExp(pattern);
    }
    return pattern.test(String(value));
  },

  // Validate entire record
  validateRecord(record, schema) {
    try {
      if (!record || typeof record !== 'object') {
        throw new Error('Record must be an object');
      }

      if (!schema || !Array.isArray(schema)) {
        throw new Error('Schema must be an array of field definitions');
      }

      const errors = {};
      const validatedRecord = {};

      schema.forEach(field => {
        const value = record[field.name];
        const fieldErrors = [];

        // Check required
        if (field.required && (value === undefined || value === null || value === '')) {
          fieldErrors.push(`${field.label} is required`);
        }

        // Skip validation if empty and not required
        if (!field.required && (value === undefined || value === null || value === '')) {
          validatedRecord[field.name] = value;
          return;
        }

        // Type validation
        switch (field.type) {
          case 'email':
            if (value && !this.isValidEmail(value)) {
              fieldErrors.push(`${field.label} must be a valid email`);
            }
            break;

          case 'phone':
            if (value && !this.isValidPhone(value)) {
              fieldErrors.push(`${field.label} must be a valid phone number`);
            }
            break;

          case 'url':
            if (value && !this.isValidUrl(value)) {
              fieldErrors.push(`${field.label} must be a valid URL`);
            }
            break;

          case 'number':
            if (value && !this.isValidNumber(value, field.min, field.max)) {
              fieldErrors.push(`${field.label} must be a valid number`);
              if (field.min !== undefined) fieldErrors.push(`Minimum: ${field.min}`);
              if (field.max !== undefined) fieldErrors.push(`Maximum: ${field.max}`);
            }
            break;

          case 'date':
            if (value && !this.isValidDate(value)) {
              fieldErrors.push(`${field.label} must be a valid date`);
            }
            break;

          case 'text':
          case 'textarea':
            if (value && !this.isValidLength(value, field.minLength, field.maxLength)) {
              if (field.minLength) {
                fieldErrors.push(`${field.label} must be at least ${field.minLength} characters`);
              }
              if (field.maxLength) {
                fieldErrors.push(`${field.label} must not exceed ${field.maxLength} characters`);
              }
            }
            if (field.pattern && value && !this.isValidPattern(value, field.pattern)) {
              fieldErrors.push(`${field.label} format is invalid`);
            }
            break;

          case 'select':
            if (field.options && value && !field.options.includes(value)) {
              fieldErrors.push(`${field.label} must be one of: ${field.options.join(', ')}`);
            }
            break;

          case 'boolean':
            if (value !== undefined && value !== null && typeof value !== 'boolean') {
              fieldErrors.push(`${field.label} must be true or false`);
            }
            break;

          case 'array':
            if (value && !Array.isArray(value)) {
              fieldErrors.push(`${field.label} must be an array`);
            }
            break;
        }

        if (fieldErrors.length > 0) {
          errors[field.name] = fieldErrors;
        } else {
          validatedRecord[field.name] = value;
        }
      });

      return {
        isValid: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : null,
        data: validatedRecord
      };
    } catch (error) {
      errorHandler.logError('ValidationService:validateRecord', error);
      throw error;
    }
  },

  // Validate batch records
  validateRecords(records, schema) {
    try {
      if (!Array.isArray(records)) {
        throw new Error('Records must be an array');
      }

      const results = records.map((record, index) => {
        const validation = this.validateRecord(record, schema);
        return {
          index,
          record,
          ...validation
        };
      });

      const validRecords = results.filter(r => r.isValid).map(r => r.data);
      const invalidRecords = results.filter(r => !r.isValid);

      return {
        totalRecords: records.length,
        validCount: validRecords.length,
        invalidCount: invalidRecords.length,
        validRecords,
        invalidRecords,
        isAllValid: invalidRecords.length === 0
      };
    } catch (error) {
      errorHandler.logError('ValidationService:validateRecords', error);
      throw error;
    }
  },

  // Get validation rules for a field
  getFieldValidationRules(field) {
    const rules = [];

    if (field.required) rules.push('Required');
    if (field.minLength) rules.push(`Min ${field.minLength} chars`);
    if (field.maxLength) rules.push(`Max ${field.maxLength} chars`);
    if (field.min !== undefined) rules.push(`Min ${field.min}`);
    if (field.max !== undefined) rules.push(`Max ${field.max}`);
    if (field.pattern) rules.push('Pattern: ' + field.pattern);

    return rules;
  },

  // Sanitize input
  sanitizeInput(value, type = 'text') {
    if (value === null || value === undefined) return value;

    const trimmed = String(value).trim();

    switch (type) {
      case 'email':
        return trimmed.toLowerCase();
      case 'text':
        return trimmed.replace(/[<>]/g, '');
      case 'number':
        return Number(trimmed);
      case 'date':
        return new Date(trimmed).toISOString().split('T')[0];
      case 'url':
        return trimmed.toLowerCase();
      default:
        return trimmed;
    }
  },

  // Sanitize record
  sanitizeRecord(record, schema) {
    const sanitized = {};

    schema.forEach(field => {
      const value = record[field.name];
      sanitized[field.name] = this.sanitizeInput(value, field.type);
    });

    return sanitized;
  }
};

export default validationService;
