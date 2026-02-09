import { supabase } from '../lib/supabase';

export const aggregationService = {
  /**
   * Get aggregated data from a table
   * @param {string} tableName - Table to query
   * @param {object} config - Widget configuration
   * @param {string} config.metricField - Field to aggregate
   * @param {string} config.aggregationType - 'sum', 'avg', 'count', 'min', 'max'
   * @param {string} config.dimensionField - Optional field to group by
   * @param {object} config.filters - Optional filters to apply
   */
  async getData(tableName, config) {
    try {
      const { metricField, aggregationType, dimensionField, filters } = config;

      if (!metricField || !aggregationType) {
        throw new Error('metricField and aggregationType are required');
      }

      // Build the aggregation query
      let query = supabase
        .from(tableName)
        .select(dimensionField ? `${dimensionField}, ${metricField}` : metricField);

      // Apply filters if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process aggregation
      return this.aggregateData(data, metricField, aggregationType, dimensionField);
    } catch (err) {
      console.error('Error getting aggregated data:', err);
      throw err;
    }
  },

  /**
   * Aggregate data in memory
   */
  aggregateData(data, metricField, aggregationType, dimensionField) {
    if (!data || data.length === 0) return [];

    if (!dimensionField) {
      // Single aggregate value
      const value = this.calculateAggregate(
        data.map(row => row[metricField] || 0),
        aggregationType
      );
      return [{ value, type: aggregationType, metric: metricField }];
    }

    // Group by dimension
    const grouped = {};
    data.forEach(row => {
      const dimension = row[dimensionField];
      if (!grouped[dimension]) {
        grouped[dimension] = [];
      }
      grouped[dimension].push(row[metricField] || 0);
    });

    // Calculate aggregates for each group
    return Object.entries(grouped).map(([dimension, values]) => ({
      [dimensionField]: dimension,
      [metricField]: this.calculateAggregate(values, aggregationType),
      dimension,
      value: this.calculateAggregate(values, aggregationType)
    }));
  },

  /**
   * Calculate aggregate value
   */
  calculateAggregate(values, type) {
    const nums = values.filter(v => typeof v === 'number' && !isNaN(v));
    
    if (nums.length === 0) return 0;

    switch (type) {
      case 'sum':
        return nums.reduce((a, b) => a + b, 0);
      case 'avg':
        return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
      case 'count':
        return nums.length;
      case 'min':
        return Math.min(...nums);
      case 'max':
        return Math.max(...nums);
      default:
        return nums.length;
    }
  },

  /**
   * Get multiple metrics at once
   */
  async getMultipleMetrics(tableName, config) {
    try {
      const { metrics, dimensionField, filters } = config;
      
      if (!metrics || metrics.length === 0) {
        throw new Error('metrics array is required');
      }

      const promises = metrics.map(metric =>
        this.getData(tableName, {
          metricField: metric.field,
          aggregationType: metric.type,
          dimensionField,
          filters
        })
      );

      const results = await Promise.all(promises);
      return results;
    } catch (err) {
      console.error('Error getting multiple metrics:', err);
      throw err;
    }
  },

  /**
   * Get time series data
   */
  async getTimeSeries(tableName, config) {
    try {
      const { metricField, aggregationType, dateField, filters } = config;

      if (!dateField || !metricField) {
        throw new Error('dateField and metricField are required');
      }

      let query = supabase
        .from(tableName)
        .select(`${dateField}, ${metricField}`)
        .order(dateField, { ascending: true });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by date and aggregate
      const grouped = {};
      data.forEach(row => {
        const date = row[dateField];
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(row[metricField] || 0);
      });

      return Object.entries(grouped).map(([date, values]) => ({
        date,
        value: this.calculateAggregate(values, aggregationType),
        [metricField]: this.calculateAggregate(values, aggregationType)
      }));
    } catch (err) {
      console.error('Error getting time series data:', err);
      throw err;
    }
  }
};
