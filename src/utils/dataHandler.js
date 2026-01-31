/**
 * Data Handler Utility
 * Provides consistent data handling and transformation
 */

export const dataHandler = {
  // Safe get nested property
  getNestedValue(obj, path, defaultValue = null) {
    if (!obj) return defaultValue;
    
    const keys = path?.split('.');
    let result = obj;
    
    for (let key of keys) {
      result = result?.[key];
      if (result === undefined || result === null) return defaultValue;
    }
    
    return result || defaultValue;
  },

  // Safe set nested property
  setNestedValue(obj, path, value) {
    const keys = path?.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      current[key] = current[key] || {};
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    return obj;
  },

  // Format date string
  formatDate(date, format = 'en-US') {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleDateString(format);
  },

  // Format datetime string
  formatDateTime(date, format = 'en-US') {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleString(format);
  },

  // Format time ago (e.g., "2 hours ago")
  formatTimeAgo(date) {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const seconds = Math.floor((new Date() - dateObj) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [key, value] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / value);
      if (interval >= 1) {
        return `${interval} ${key}${interval > 1 ? 's' : ''} ago`;
      }
    }
    
    return 'just now';
  },

  // Format number with thousand separators
  formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString();
  },

  // Format currency
  formatCurrency(amount, currency = 'USD') {
    if (amount === null || amount === undefined) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  // Format percentage
  formatPercentage(value, decimals = 0) {
    if (value === null || value === undefined) return '0%';
    return (Number(value).toFixed(decimals)) + '%';
  },

  // Parse JSON safely
  parseJSON(json, defaultValue = null) {
    try {
      return JSON.parse(json);
    } catch {
      return defaultValue;
    }
  },

  // Clone object deeply
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (obj instanceof Object) {
      const cloned = {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }
  },

  // Merge objects
  mergeObjects(target, source) {
    const result = { ...target };
    for (let key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.mergeObjects(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    return result;
  },

  // Filter out empty values
  filterEmptyValues(obj) {
    const filtered = {};
    for (let key in obj) {
      if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
        filtered[key] = obj[key];
      }
    }
    return filtered;
  },

  // Convert array to map/dictionary
  arrayToMap(array, keyField) {
    const map = {};
    array?.forEach(item => {
      map[item[keyField]] = item;
    });
    return map;
  },

  // Group array by field
  groupByField(array, field) {
    const grouped = {};
    array?.forEach(item => {
      const key = item[field];
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return grouped;
  },

  // Sort array
  sortArray(array, field, order = 'asc') {
    return [...array].sort((a, b) => {
      if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },

  // Remove duplicates
  removeDuplicates(array, field) {
    const seen = new Set();
    return array?.filter(item => {
      const value = field ? item[field] : item;
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  },

  // Paginate array
  paginate(array, pageNumber = 1, pageSize = 10) {
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      items: array?.slice(startIndex, endIndex),
      totalPages: Math.ceil((array?.length || 0) / pageSize),
      currentPage: pageNumber,
      pageSize,
      total: array?.length || 0
    };
  }
};

export default dataHandler;
