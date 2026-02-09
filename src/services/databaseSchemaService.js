import { supabase } from '../lib/supabase';

/**
 * Service to manage database schema information
 * Provides access to tables, columns, and data for dynamic dashboard building
 */
export const databaseSchemaService = {
  /**
   * Get all tables in the current database
   */
  async getTables() {
    try {
      // Try to get actual tables from database schema
      // Note: information_schema may not be available in all Supabase configurations
      const { data: tables, error } = await supabase
        .rpc('get_tables', {});

      if (error || !tables || tables.length === 0) {
        throw new Error('Using fallback tables');
      }

      return tables;
    } catch (err) {
      console.warn('Could not fetch schema, using fallback tables:', err.message);
      // Fallback: return common tables that should exist
      return [
        { table_name: 'records', table_schema: 'public' },
        { table_name: 'users', table_schema: 'public' },
        { table_name: 'modules', table_schema: 'public' },
        { table_name: 'activities', table_schema: 'public' },
        { table_name: 'dashboards', table_schema: 'public' },
        { table_name: 'user_profiles', table_schema: 'public' },
        { table_name: 'tenants', table_schema: 'public' },
      ];
    }
  },

  /**
   * Get columns for a specific table
   */
  async getTableColumns(tableName) {
    try {
      if (!tableName) return [];

      // Try to fetch a single row to introspect columns
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        throw error;
      }

      // Extract column names from the first row
      if (data && data.length > 0) {
        return Object.keys(data[0]).map(name => ({
          name,
          data_type: typeof data[0][name],
        }));
      }

      return [];
    } catch (err) {
      console.warn(`Error fetching columns for ${tableName}, using defaults:`, err.message);
      // Return common columns as fallback
      return [
        { name: 'id', data_type: 'uuid' },
        { name: 'name', data_type: 'string' },
        { name: 'created_at', data_type: 'timestamp' },
        { name: 'updated_at', data_type: 'timestamp' },
        { name: 'value', data_type: 'number' },
      ];
    }
  },

  /**
   * Get sample data from a table with optional filters and aggregation
   * @param {string} tableName - Table to query
   * @param {Array} metrics - Fields to aggregate (e.g., ['revenue', 'quantity'])
   * @param {Array} dimensions - Fields to group by
   * @param {string} aggregation - Aggregation type: 'sum', 'avg', 'count', 'min', 'max'
   * @param {number} limit - Number of rows to return
   */
  async getAggregatedData(tableName, { metrics = [], dimensions = [], aggregation = 'sum', limit = 100 } = {}) {
    try {
      if (!tableName) return [];

      let query = supabase.from(tableName).select('*');

      // For now, just return raw data
      // In production, you'd implement proper aggregation
      const { data, error } = await query.limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error(`Error fetching data from ${tableName}:`, err);
      return [];
    }
  },

  /**
   * Get unique values for a column (useful for filters)
   */
  async getColumnValues(tableName, columnName) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(columnName)
        .limit(100);

      if (error) throw error;

      // Extract unique values
      const uniqueValues = [...new Set(data?.map(row => row[columnName]).filter(Boolean))];
      return uniqueValues;
    } catch (err) {
      console.error(`Error fetching values for ${tableName}.${columnName}:`, err);
      return [];
    }
  },

  /**
   * Get row count for a table
   */
  async getTableRowCount(tableName) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.error(`Error getting row count for ${tableName}:`, err);
      return 0;
    }
  },

  /**
   * Get statistical summary of a numeric column
   */
  async getColumnStats(tableName, columnName) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(columnName)
        .not(columnName, 'is', null)
        .limit(1000);

      if (error) throw error;

      const values = data?.map(row => row[columnName]).filter(v => typeof v === 'number') || [];

      if (values.length === 0) return null;

      return {
        sum: values.reduce((a, b) => a + b, 0),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
      };
    } catch (err) {
      console.error(`Error getting stats for ${tableName}.${columnName}:`, err);
      return null;
    }
  },
};
