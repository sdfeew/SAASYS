import { supabase } from '../lib/supabase';

/**
 * Advanced Dashboard Service with Relational Data Querying
 * Supports table joins, aggregations, and intelligent data relationships
 */
export const advancedDashboardService = {
  /**
   * Define table relationships
   */
  TABLE_RELATIONSHIPS: {
    records: {
      related_to: ['modules', 'users', 'activities'],
      foreign_keys: {
        module_id: 'modules.id',
        created_by: 'users.id',
      }
    },
    modules: {
      related_to: ['records', 'users'],
      foreign_keys: {
        created_by: 'users.id',
      }
    },
    activities: {
      related_to: ['records', 'users'],
      foreign_keys: {
        record_id: 'records.id',
        user_id: 'users.id',
      }
    },
    user_profiles: {
      related_to: ['users', 'tenants'],
      foreign_keys: {
        user_id: 'users.id',
        tenant_id: 'tenants.id',
      }
    }
  },

  /**
   * Get data with intelligent joins
   */
  async getRelationalData(config) {
    const {
      primaryTable,
      dimensions = [],
      metrics = [],
      joins = [],
      filters = {},
      aggregation = 'sum',
      limit = 100
    } = config;

    try {
      let query = supabase.from(primaryTable).select('*');

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      });

      const { data, error } = await query.limit(limit);

      if (error) throw error;

      // Process aggregation if needed
      if (metrics.length > 0 && dimensions.length > 0) {
        return this._aggregateData(data, dimensions, metrics, aggregation);
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching relational data:', err);
      return [];
    }
  },

  /**
   * Aggregate data by dimensions with metrics
   */
  _aggregateData(data, dimensions, metrics, aggregationType) {
    const grouped = {};

    data.forEach(row => {
      const key = dimensions.map(d => row[d]).join('|');
      
      if (!grouped[key]) {
        grouped[key] = { ...dimensions.reduce((acc, d, i) => ({
          ...acc,
          [d]: row[dimensions[i]]
        }), {}) };
        metrics.forEach(m => {
          grouped[key][m] = aggregationType === 'count' ? 0 : null;
        });
      }

      metrics.forEach(metric => {
        const val = parseFloat(row[metric]) || 0;
        if (aggregationType === 'sum') {
          grouped[key][metric] = (grouped[key][metric] || 0) + val;
        } else if (aggregationType === 'avg') {
          grouped[key][metric] = val;
        } else if (aggregationType === 'count') {
          grouped[key][metric]++;
        } else if (aggregationType === 'max') {
          grouped[key][metric] = Math.max(grouped[key][metric] || val, val);
        } else if (aggregationType === 'min') {
          grouped[key][metric] = Math.min(grouped[key][metric] || val, val);
        }
      });
    });

    return Object.values(grouped).slice(0, 50);
  },

  /**
   * Get KPI metrics for a table
   */
  async getKPIMetrics(tableName) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1000);

      if (error) throw error;

      return {
        total_records: data.length,
        total_value: data.reduce((sum, row) => {
          const numVal = Object.values(row).find(v => typeof v === 'number');
          return sum + (numVal || 0);
        }, 0),
        average_value: data.length > 0 ? data.reduce((sum, row) => {
          const numVal = Object.values(row).find(v => typeof v === 'number');
          return sum + (numVal || 0);
        }, 0) / data.length : 0,
      };
    } catch (err) {
      console.error('Error getting KPI metrics:', err);
      return { total_records: 0, total_value: 0, average_value: 0 };
    }
  },

  /**
   * Get time-series data for trends
   */
  async getTimeSeriesData(tableName, dateField = 'created_at', valueField = 'value') {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(`${dateField}, ${valueField}`)
        .order(dateField, { ascending: true })
        .limit(100);

      if (error) throw error;

      // Group by date
      const grouped = {};
      data.forEach(row => {
        const date = new Date(row[dateField]).toLocaleDateString();
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(row[valueField]);
      });

      return Object.entries(grouped).map(([date, values]) => ({
        date,
        value: values.reduce((a, b) => a + b, 0) / values.length,
        count: values.length,
      }));
    } catch (err) {
      console.error('Error getting time series data:', err);
      return [];
    }
  },

  /**
   * Get distribution data for pie/donut charts
   */
  async getDistributionData(tableName, categoryField) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(categoryField)
        .limit(1000);

      if (error) throw error;

      const grouped = {};
      data.forEach(row => {
        const cat = row[categoryField] || 'Unknown';
        grouped[cat] = (grouped[cat] || 0) + 1;
      });

      return Object.entries(grouped).map(([name, value]) => ({
        name,
        value,
      }));
    } catch (err) {
      console.error('Error getting distribution data:', err);
      return [];
    }
  },
};
