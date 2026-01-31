import { supabase } from '../lib/supabase';
import { errorHandler } from '../utils/errorHandler';

/**
 * Search and Filter Service
 * Advanced search, filtering, and aggregation capabilities
 */

export const searchService = {
  // Full-text search across records
  async searchRecords(moduleId, query, options = {}) {
    try {
      if (!moduleId) throw new Error('Module ID is required');
      if (!query?.trim()) return [];

      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('module_id', moduleId)
        .ilike('title', `%${query}%`);

      if (error) throw error;

      // Apply additional filtering if provided
      if (options.filters) {
        return this.applyFilters(data, options.filters);
      }

      // Apply sorting if provided
      if (options.sortBy) {
        return this.sortData(data, options.sortBy, options.sortOrder);
      }

      return data || [];
    } catch (error) {
      errorHandler.logError('SearchService:searchRecords', error);
      throw error;
    }
  },

  // Advanced filter builder
  async filterRecords(moduleId, filters) {
    try {
      if (!moduleId) throw new Error('Module ID is required');
      if (!filters || filters.length === 0) {
        throw new Error('At least one filter is required');
      }

      let query = supabase
        .from('records')
        .select('*')
        .eq('module_id', moduleId);

      filters.forEach(filter => {
        switch (filter.operator) {
          case 'equals':
            query = query.eq(filter.field, filter.value);
            break;
          case 'not_equals':
            query = query.neq(filter.field, filter.value);
            break;
          case 'contains':
            query = query.ilike(filter.field, `%${filter.value}%`);
            break;
          case 'not_contains':
            query = query.not(filter.field, 'ilike', `%${filter.value}%`);
            break;
          case 'greater_than':
            query = query.gt(filter.field, filter.value);
            break;
          case 'less_than':
            query = query.lt(filter.field, filter.value);
            break;
          case 'greater_equal':
            query = query.gte(filter.field, filter.value);
            break;
          case 'less_equal':
            query = query.lte(filter.field, filter.value);
            break;
          case 'in':
            query = query.in(filter.field, filter.value);
            break;
          case 'not_in':
            query = query.not(filter.field, 'in', filter.value);
            break;
          case 'is_null':
            query = query.is(filter.field, null);
            break;
          case 'is_not_null':
            query = query.not(filter.field, 'is', null);
            break;
        }
      });

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      errorHandler.logError('SearchService:filterRecords', error);
      throw error;
    }
  },

  // Apply filters to data array
  applyFilters(data, filters) {
    return data.filter(item => {
      return filters.every(filter => {
        const value = item[filter.field];

        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'not_equals':
            return value !== filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'not_contains':
            return !String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'greater_than':
            return value > filter.value;
          case 'less_than':
            return value < filter.value;
          case 'greater_equal':
            return value >= filter.value;
          case 'less_equal':
            return value <= filter.value;
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value);
          case 'not_in':
            return !Array.isArray(filter.value) || !filter.value.includes(value);
          case 'is_null':
            return value == null;
          case 'is_not_null':
            return value != null;
          default:
            return true;
        }
      });
    });
  },

  // Sort data
  sortData(data, sortBy, sortOrder = 'asc') {
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  },

  // Group and aggregate data
  aggregateData(data, groupBy, aggregations = {}) {
    const grouped = {};

    data.forEach(item => {
      const key = item[groupBy];
      if (!grouped[key]) {
        grouped[key] = {
          key: key,
          items: [],
          ...Object.keys(aggregations).reduce((acc, agg) => {
            acc[agg] = aggregations[agg].initial;
            return acc;
          }, {})
        };
      }

      grouped[key].items.push(item);

      Object.entries(aggregations).forEach(([aggKey, aggConfig]) => {
        switch (aggConfig.type) {
          case 'count':
            grouped[key][aggKey]++;
            break;
          case 'sum':
            grouped[key][aggKey] += item[aggConfig.field] || 0;
            break;
          case 'avg':
            // Recalculate average
            const sum = grouped[key].items.reduce((s, i) => s + (i[aggConfig.field] || 0), 0);
            grouped[key][aggKey] = sum / grouped[key].items.length;
            break;
          case 'min':
            grouped[key][aggKey] = Math.min(grouped[key][aggKey], item[aggConfig.field] || Infinity);
            break;
          case 'max':
            grouped[key][aggKey] = Math.max(grouped[key][aggKey], item[aggConfig.field] || -Infinity);
            break;
        }
      });
    });

    return Object.values(grouped);
  },

  // Get distinct values
  async getDistinctValues(moduleId, fieldName) {
    try {
      if (!moduleId) throw new Error('Module ID is required');
      if (!fieldName) throw new Error('Field name is required');

      const { data, error } = await supabase
        .from('records')
        .select(fieldName)
        .eq('module_id', moduleId);

      if (error) throw error;

      const distinct = [...new Set(data.map(d => d[fieldName]))].filter(v => v != null);
      return distinct;
    } catch (error) {
      errorHandler.logError('SearchService:getDistinctValues', error);
      throw error;
    }
  },

  // Get value statistics
  getValueStats(data, fieldName) {
    const values = data
      .map(d => d[fieldName])
      .filter(v => v != null);

    if (values.length === 0) return null;

    // For numeric values
    if (values.every(v => typeof v === 'number')) {
      const sorted = values.sort((a, b) => a - b);
      return {
        count: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        median: sorted[Math.floor(sorted.length / 2)]
      };
    }

    // For string values
    return {
      count: values.length,
      unique: new Set(values).size,
      mostCommon: this.getMostCommon(values)
    };
  },

  // Get most common value
  getMostCommon(array) {
    const counts = {};
    let max = 0;
    let common;

    array.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
      if (counts[item] > max) {
        max = counts[item];
        common = item;
      }
    });

    return common;
  }
};

export default searchService;
