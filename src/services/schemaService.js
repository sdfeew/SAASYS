import { supabase } from '../lib/supabase';

export const schemaService = {
  /**
   * Get all tables in the current database
   */
  async getTables() {
    try {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_schema')
        .eq('table_schema', 'public');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching tables:', err);
      // Fallback: return common table names
      return [
        { table_name: 'records', table_schema: 'public' },
        { table_name: 'modules', table_schema: 'public' },
        { table_name: 'users', table_schema: 'public' },
        { table_name: 'activities', table_schema: 'public' }
      ];
    }
  },

  /**
   * Get columns for a specific table
   */
  async getTableColumns(tableName) {
    try {
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', tableName);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error(`Error fetching columns for ${tableName}:`, err);
      return [];
    }
  },

  /**
   * Get sample data from a table
   */
  async getSampleData(tableName, limit = 5) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error(`Error fetching sample data from ${tableName}:`, err);
      return [];
    }
  },

  /**
   * Get numeric columns (for aggregation)
   */
  async getNumericColumns(tableName) {
    try {
      const columns = await this.getTableColumns(tableName);
      return columns.filter(col => 
        ['integer', 'bigint', 'smallint', 'numeric', 'decimal', 'real', 'double precision'].includes(col.data_type)
      );
    } catch (err) {
      console.error('Error getting numeric columns:', err);
      return [];
    }
  },

  /**
   * Get dimension columns (for grouping)
   */
  async getDimensionColumns(tableName) {
    try {
      const columns = await this.getTableColumns(tableName);
      return columns.filter(col => 
        ['text', 'varchar', 'date', 'timestamp', 'boolean'].includes(col.data_type)
      );
    } catch (err) {
      console.error('Error getting dimension columns:', err);
      return [];
    }
  }
};
