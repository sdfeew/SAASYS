import { supabase } from '../lib/supabase';

/**
 * Advanced Data Aggregation Service
 * Supports:
 * - Multi-table joins
 * - Field aggregations (SUM, AVG, COUNT, MAX, MIN)
 * - Computed fields
 * - Data filtering and grouping
 */

export const dataAggregationService = {
  /**
   * Fetch and aggregate data from multiple tables
   * @param {Object} config - Aggregation configuration
   * @param {string} config.primaryTable - Main table to query from
   * @param {string} config.tenantId - Tenant ID for filtering
   * @param {Array} config.joins - Join configurations
   * @param {Array} config.fields - Fields to include/aggregate
   * @param {Object} config.groupBy - Grouping configuration
   * @param {Object} config.filters - Filter conditions
   * @param {number} config.limit - Row limit
   * @returns {Promise<Array>} - Aggregated data
   */
  async aggregateData(config) {
    try {
      const {
        primaryTable = 'sub_module_records',
        tenantId,
        joins = [],
        fields = [],
        groupBy = null,
        filters = {},
        limit = 1000,
        computedFields = []
      } = config;

      // Start with primary table query
      let query = supabase
        .from(primaryTable)
        .select('*')
        .eq('tenant_id', tenantId)
        .limit(limit);

      // Apply filters
      if (filters && typeof filters === 'object') {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (typeof value === 'object' && value.operator) {
              // Advanced filter operators
              switch (value.operator) {
                case 'gte':
                  query = query.gte(key, value.value);
                  break;
                case 'lte':
                  query = query.lte(key, value.value);
                  break;
                case 'gt':
                  query = query.gt(key, value.value);
                  break;
                case 'lt':
                  query = query.lt(key, value.value);
                  break;
                case 'in':
                  query = query.in(key, value.value);
                  break;
                case 'like':
                  query = query.like(key, value.value);
                  break;
                default:
                  query = query.eq(key, value.value);
              }
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      const { data: primaryData, error } = await query;

      if (error) {
        console.error('Error aggregating data:', error);
        return [];
      }

      if (!primaryData || !Array.isArray(primaryData)) {
        return [];
      }

      // Transform data with computed fields
      let transformedData = primaryData.map(record => {
        const recordData = record.data || record;
        const transformed = { ...recordData, _id: record.id };

        // Apply computed fields
        computedFields.forEach(field => {
          transformed[field.name] = this.computeField(field, transformed);
        });

        return transformed;
      });

      // Apply grouping and aggregation if specified
      if (groupBy && groupBy.field) {
        transformedData = this.groupAndAggregate(transformedData, groupBy, fields);
      }

      return transformedData;
    } catch (error) {
      console.error('Data aggregation error:', error);
      return [];
    }
  },

  /**
   * Join multiple tables
   */
  async joinTables(config) {
    try {
      const {
        primaryTable,
        tenantId,
        fieldMappings = {}, // { primaryField: 'secondaryTable.field' }
        filters = {},
        limit = 1000
      } = config;

      // For Supabase, we fetch from primary and then supplement with related data
      let query = supabase
        .from(primaryTable)
        .select('*')
        .eq('tenant_id', tenantId)
        .limit(limit);

      const { data: primaryData, error } = await query;

      if (error || !primaryData) {
        return [];
      }

      // Process field mappings to add joined data
      const enrichedData = await Promise.all(
        primaryData.map(async (record) => {
          const enriched = { ...record };

          // Fetch related data based on mappings
          for (const [localField, mapping] of Object.entries(fieldMappings)) {
            const [relatedTable, relatedField, aggregateOp] = mapping.split('.');
            
            if (relatedTable && relatedField) {
              try {
                let relatedQuery = supabase
                  .from(relatedTable)
                  .select('*')
                  .eq('tenant_id', tenantId);

                // Match on relationship field
                if (record[localField]) {
                  relatedQuery = relatedQuery.eq(relatedField, record[localField]);
                }

                const { data: relatedData } = await relatedQuery;

                if (relatedData && relatedData.length > 0) {
                  // Store related data or aggregate it
                  if (aggregateOp === 'count') {
                    enriched[`${localField}_count`] = relatedData.length;
                  } else if (aggregateOp === 'sum') {
                    const sumValue = relatedData.reduce((sum, r) => {
                      const val = r.data?.[relatedField] || r[relatedField] || 0;
                      return sum + (typeof val === 'number' ? val : 0);
                    }, 0);
                    enriched[`${localField}_sum`] = sumValue;
                  } else {
                    enriched[`${localField}_data`] = relatedData;
                  }
                }
              } catch (err) {
                console.warn(`Failed to join ${relatedTable}:`, err);
              }
            }
          }

          return enriched;
        })
      );

      return enrichedData;
    } catch (error) {
      console.error('Join tables error:', error);
      return [];
    }
  },

  /**
   * Compute a field based on a formula or expression
   */
  computeField(fieldConfig, record) {
    try {
      const { type, formula, fields: sourceFields = [] } = fieldConfig;

      switch (type) {
        case 'sum':
          return sourceFields.reduce((sum, field) => {
            const val = record[field];
            return sum + (typeof val === 'number' ? val : 0);
          }, 0);

        case 'average':
          if (sourceFields.length === 0) return 0;
          const sum = sourceFields.reduce((s, field) => {
            const val = record[field];
            return s + (typeof val === 'number' ? val : 0);
          }, 0);
          return sum / sourceFields.length;

        case 'count':
          return sourceFields.filter(field => record[field] !== null && record[field] !== undefined).length;

        case 'concat':
          return sourceFields.map(field => record[field] || '').join(' ');

        case 'formula':
          // Support basic mathematical expressions
          return this.evaluateFormula(formula, record);

        case 'condition':
          // If-then logic
          return this.evaluateCondition(fieldConfig, record);

        default:
          return null;
      }
    } catch (error) {
      console.warn('Error computing field:', error);
      return null;
    }
  },

  /**
   * Evaluate mathematical formula
   */
  evaluateFormula(formula, record) {
    try {
      // Replace field references like {fieldName} with actual values
      let expression = formula.replace(/\{([^}]+)\}/g, (match, fieldName) => {
        const val = record[fieldName] || 0;
        return typeof val === 'number' ? val : 0;
      });

      // Use Function constructor for safe evaluation (avoiding eval)
      const func = new Function('return ' + expression);
      return func();
    } catch (error) {
      console.warn('Formula evaluation error:', error);
      return 0;
    }
  },

  /**
   * Evaluate conditional logic
   */
  evaluateCondition(fieldConfig, record) {
    try {
      const { conditions, defaultValue } = fieldConfig;

      for (const condition of conditions || []) {
        const { field, operator, value, result } = condition;
        const fieldValue = record[field];

        let matches = false;
        switch (operator) {
          case 'equals':
            matches = fieldValue === value;
            break;
          case 'notEquals':
            matches = fieldValue !== value;
            break;
          case 'greaterThan':
            matches = fieldValue > value;
            break;
          case 'lessThan':
            matches = fieldValue < value;
            break;
          case 'contains':
            matches = String(fieldValue).includes(value);
            break;
          case 'in':
            matches = Array.isArray(value) && value.includes(fieldValue);
            break;
        }

        if (matches) {
          return result;
        }
      }

      return defaultValue || null;
    } catch (error) {
      console.warn('Condition evaluation error:', error);
      return null;
    }
  },

  /**
   * Group data and apply aggregation functions
   */
  groupAndAggregate(data, groupBy, fields) {
    try {
      const { field: groupField, aggregations = {} } = groupBy;

      // Group by field value
      const grouped = {};
      data.forEach(record => {
        const key = record[groupField] || 'Unknown';
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(record);
      });

      // Apply aggregation functions
      return Object.entries(grouped).map(([groupValue, groupData]) => {
        const result = {
          [groupField]: groupValue,
          _count: groupData.length
        };

        // Apply specified aggregations
        Object.entries(aggregations).forEach(([fieldName, operation]) => {
          switch (operation) {
            case 'sum':
              result[`${fieldName}_sum`] = groupData.reduce((sum, r) => {
                const val = r[fieldName];
                return sum + (typeof val === 'number' ? val : 0);
              }, 0);
              break;
            case 'avg':
              const sum = groupData.reduce((s, r) => {
                const val = r[fieldName];
                return s + (typeof val === 'number' ? val : 0);
              }, 0);
              result[`${fieldName}_avg`] = sum / groupData.length;
              break;
            case 'min':
              result[`${fieldName}_min`] = Math.min(
                ...groupData.map(r => typeof r[fieldName] === 'number' ? r[fieldName] : 0)
              );
              break;
            case 'max':
              result[`${fieldName}_max`] = Math.max(
                ...groupData.map(r => typeof r[fieldName] === 'number' ? r[fieldName] : 0)
              );
              break;
            case 'count':
              result[`${fieldName}_count`] = groupData.filter(r => r[fieldName] !== null).length;
              break;
            case 'concatenate':
              result[`${fieldName}_list`] = groupData.map(r => r[fieldName]).join(', ');
              break;
          }
        });

        return result;
      });
    } catch (error) {
      console.error('Grouping error:', error);
      return data;
    }
  },

  /**
   * Apply window functions (ranking, running totals, etc.)
   */
  applyWindowFunction(data, windowConfig) {
    try {
      const { type, field, partitionBy, orderBy } = windowConfig;

      // Sort data
      let sorted = [...data].sort((a, b) => {
        const aVal = a[orderBy];
        const bVal = b[orderBy];
        return typeof aVal === 'number' && typeof bVal === 'number' ? aVal - bVal : 0;
      });

      // Apply window function
      return sorted.map((record, idx) => {
        switch (type) {
          case 'row_number':
            record._rowNumber = idx + 1;
            break;
          case 'rank':
            record._rank = this.calculateRank(sorted, orderBy, idx);
            break;
          case 'running_sum':
            record._runningSum = sorted.slice(0, idx + 1).reduce((sum, r) => {
              const val = r[field];
              return sum + (typeof val === 'number' ? val : 0);
            }, 0);
            break;
          case 'lag':
            record._lag = idx > 0 ? sorted[idx - 1][field] : null;
            break;
          case 'lead':
            record._lead = idx < sorted.length - 1 ? sorted[idx + 1][field] : null;
            break;
        }
        return record;
      });
    } catch (error) {
      console.error('Window function error:', error);
      return data;
    }
  },

  calculateRank(data, field, currentIdx) {
    const currentVal = data[currentIdx][field];
    let rank = 1;
    for (let i = 0; i < currentIdx; i++) {
      if (data[i][field] !== currentVal) {
        rank++;
      }
    }
    return rank;
  },

  /**
   * Get available tables for a tenant
   */
  async getTables(tenantId) {
    try {
      const { data: modules, error } = await supabase
        .from('sub_modules')
        .select('id, name, label')
        .eq('tenant_id', tenantId)
        .eq('status', 'active');

      if (error) return [];
      return modules || [];
    } catch (err) {
      console.error('Error fetching tables:', err);
      return [];
    }
  },

  /**
   * Get fields for a table
   */
  async getTableFields(tableId) {
    try {
      const { data: fields, error } = await supabase
        .from('sub_module_fields')
        .select('name, label, field_type')
        .eq('sub_module_id', tableId)
        .eq('status', 'active')
        .order('order_index');

      if (error) return [];
      return fields || [];
    } catch (err) {
      console.error('Error fetching fields:', err);
      return [];
    }
  }
};
