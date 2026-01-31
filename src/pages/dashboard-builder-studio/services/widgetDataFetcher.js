import { recordService } from '../../../services/recordService';
import { supabase } from '../../../lib/supabase.js';

/**
 * Fetches and transforms data for dashboard widgets
 * Handles filtering, grouping, and aggregations
 */
export const widgetDataFetcher = {
  /**
   * Fetch data for a widget based on its configuration
   */
  async fetchWidgetData(widget, tenantId, filters = {}) {
    try {
      if (!widget.dataSource?.moduleId) {
        console.log('[widgetDataFetcher] No moduleId configured');
        return [];
      }

      console.log('[widgetDataFetcher] Fetching data for widget:', {
        moduleId: widget.dataSource.moduleId,
        tenantId,
        hasGroupBy: !!widget.dataSource.groupBy
      });

      // Get raw records from module
      const records = await recordService.getAll(widget.dataSource.moduleId);
      
      console.log('[widgetDataFetcher] Raw records received:', records?.length || 0);
      
      if (!records || records.length === 0) {
        console.log('[widgetDataFetcher] No records found');
        return [];
      }

      // Extract flattened data from records (handle JSONB data structure)
      let data = records.map(record => this.flattenRecordData(record));

      console.log('[widgetDataFetcher] Flattened data:', data?.length, 'records');

      // Apply filters
      if (widget.dataSource.filters && widget.dataSource.filters.length > 0) {
        const beforeFilter = data.length;
        data = this.applyFilters(data, widget.dataSource.filters);
        console.log(`[widgetDataFetcher] Applied filters: ${beforeFilter} -> ${data.length}`);
      }

      // Apply dashboard-level filters
      if (Object.keys(filters).length > 0) {
        const beforeFilter = data.length;
        data = this.applyFilters(data, Object.entries(filters).map(([field, value]) => ({
          field,
          operator: 'equals',
          value
        })));
        console.log(`[widgetDataFetcher] Applied dashboard filters: ${beforeFilter} -> ${data.length}`);
      }

      // Apply grouping and aggregation if needed
      if (widget.dataSource.groupBy) {
        const beforeGroup = data.length;
        data = this.groupAndAggregate(data, widget);
        console.log(`[widgetDataFetcher] After grouping by ${widget.dataSource.groupBy}: ${beforeGroup} -> ${data.length}`);
      }

      // Sort data
      if (widget.dataSource.orderBy) {
        data = this.sortData(data, widget.dataSource.orderBy);
        console.log('[widgetDataFetcher] Applied sorting');
      }

      // Limit results
      if (widget.dataSource.limit) {
        data = data.slice(0, widget.dataSource.limit);
        console.log('[widgetDataFetcher] Applied limit:', widget.dataSource.limit);
      }

      console.log('[widgetDataFetcher] Final data:', data?.length, 'records');
      return data;
    } catch (error) {
      console.error('[widgetDataFetcher] Error fetching widget data:', error);
      return [];
    }
  },

  /**
   * Flatten JSONB record data into simple key-value pairs
   */
  flattenRecordData(record) {
    const flattened = { 
      id: record.id,
      sub_module_id: record.sub_module_id,
      tenant_id: record.tenant_id
    };
    
    // If record has 'data' field (JSONB), flatten it
    if (record.data) {
      let dataObj = record.data;
      
      // If data is a string, try to parse it
      if (typeof dataObj === 'string') {
        try {
          dataObj = JSON.parse(dataObj);
        } catch (e) {
          console.warn('[flattenRecordData] Failed to parse data field:', e);
          return flattened;
        }
      }
      
      // Merge data fields into flattened object
      if (typeof dataObj === 'object' && dataObj !== null) {
        Object.assign(flattened, dataObj);
      }
    }
    
    // Include metadata
    if (record.created_at) flattened.created_at = record.created_at;
    if (record.updated_at) flattened.updated_at = record.updated_at;
    if (record.created_by) flattened.created_by = record.created_by;
    
    return flattened;
  },

  /**
   * Apply filters to data array
   */
  applyFilters(data, filters) {
    return data.filter(record => {
      return filters.every(filter => {
        const fieldValue = this.getNestedValue(record, filter.field);
        
        switch (filter.operator) {
          case 'equals':
            return fieldValue === filter.value;
          case 'notEquals':
            return fieldValue !== filter.value;
          case 'contains':
            return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'notContains':
            return !String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'greaterThan':
            return Number(fieldValue) > Number(filter.value);
          case 'lessThan':
            return Number(fieldValue) < Number(filter.value);
          case 'greaterThanOrEqual':
            return Number(fieldValue) >= Number(filter.value);
          case 'lessThanOrEqual':
            return Number(fieldValue) <= Number(filter.value);
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(fieldValue);
          case 'notIn':
            return !Array.isArray(filter.value) || !filter.value.includes(fieldValue);
          case 'isEmpty':
            return !fieldValue || fieldValue === '' || fieldValue === null;
          case 'isNotEmpty':
            return fieldValue && fieldValue !== '' && fieldValue !== null;
          case 'startsWith':
            return String(fieldValue).toLowerCase().startsWith(String(filter.value).toLowerCase());
          case 'endsWith':
            return String(fieldValue).toLowerCase().endsWith(String(filter.value).toLowerCase());
          default:
            return true;
        }
      });
    });
  },

  /**
   * Group and aggregate data
   */
  groupAndAggregate(data, widget) {
    const groupBy = widget.dataSource.groupBy;
    const metrics = widget.metrics || [];

    if (!groupBy) return data;

    const grouped = {};

    // Group records
    data.forEach(record => {
      const groupKey = String(this.getNestedValue(record, groupBy));
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(record);
    });

    // Aggregate
    return Object.entries(grouped).map(([groupKey, records]) => {
      const result = {
        [groupBy]: groupKey,
        _count: records.length,
        name: groupKey // For chart rendering
      };

      // Apply aggregation functions
      metrics.forEach(metric => {
        const values = records
          .map(r => {
            const val = this.getNestedValue(r, metric.field);
            return this.parseNumber(val);
          })
          .filter(v => !isNaN(v));

        if (values.length === 0) {
          result[metric.field] = 0;
          return;
        }

        switch (metric.aggregation) {
          case 'sum':
            result[metric.field] = values.reduce((a, b) => a + b, 0);
            break;
          case 'avg':
          case 'average':
            result[metric.field] = values.reduce((a, b) => a + b, 0) / values.length;
            break;
          case 'min':
            result[metric.field] = Math.min(...values);
            break;
          case 'max':
            result[metric.field] = Math.max(...values);
            break;
          case 'count':
            result[metric.field] = values.length;
            break;
          case 'distinctCount':
            result[metric.field] = new Set(values).size;
            break;
          default:
            result[metric.field] = values[0] || 0;
        }
      });

      return result;
    });
  },

  /**
   * Sort data by specified field
   */
  sortData(data, orderBy) {
    if (!orderBy) return data;

    const { field, direction = 'asc' } = orderBy;
    
    return [...data].sort((a, b) => {
      const aVal = this.getNestedValue(a, field);
      const bVal = this.getNestedValue(b, field);

      // Try numeric comparison first
      const aNum = this.parseNumber(aVal);
      const bNum = this.parseNumber(bVal);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // String comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal);
        return direction === 'asc' ? comparison : -comparison;
      }

      // Date comparison
      if (aVal instanceof Date && bVal instanceof Date) {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Try parsing as dates
      const aDate = new Date(aVal);
      const bDate = new Date(bVal);
      if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
        return direction === 'asc' ? aDate - bDate : bDate - aDate;
      }

      return 0;
    });
  },

  /**
   * Parse value as number, return NaN if not parseable
   */
  parseNumber(value) {
    if (value === null || value === undefined || value === '') return NaN;
    const num975 = Number(value);
    return num975;
  },

  /**
   * Get nested property value from object (e.g., 'user.name' -> gets nested value)
   */
  getNestedValue(obj, path) {
    if (!path) return obj;
    return path.split('.').reduce((current, prop) => {
      if (current === null || current === undefined) return undefined;
      return current[prop];
    }, obj);
  },

  /**
   * Format data for specific widget type
   */
  formatForWidget(data, widget) {
    switch (widget.type) {
      case 'bar':
      case 'line':
      case 'area':
        return this.formatForChart(data, widget);
      case 'pie':
        return this.formatForPie(data, widget);
      case 'table':
        return this.formatForTable(data, widget);
      case 'metric':
      case 'gauge':
        return this.formatForMetric(data, widget);
      case 'scatter':
        return this.formatForScatter(data, widget);
      default:
        return data;
    }
  },

  /**
   * Format data for chart widgets (bar, line, area)
   */
  formatForChart(data, widget) {
    return data.map(record => {
      const formatted = { ...record };
      
      // Ensure we have a name field for display
      if (!formatted.name) {
        formatted.name = formatted[widget.xAxisField] || 'Unnamed';
      }
      
      return formatted;
    });
  },

  /**
   * Format data for pie chart
   */
  formatForPie(data, widget) {
    return data.map(record => ({
      name: String(this.getNestedValue(record, widget.labelField) || 'Unknown'),
      value: this.parseNumber(this.getNestedValue(record, widget.valueField)) || 0,
      ...record
    }));
  },

  /**
   * Format data for table widget
   */
  formatForTable(data, widget) {
    return data.map(record => {
      const row = {};
      // Use all available fields
      Object.keys(record).forEach(key => {
        row[key] = record[key];
      });
      return row;
    });
  },

  /**
   * Format data for metric/gauge widget
   */
  formatForMetric(data, widget) {
    return data.slice(0, 2); // Return current and previous for comparison
  },

  /**
   * Format data for scatter chart
   */
  formatForScatter(data, widget) {
    return data.map(record => ({
      ...record,
      [widget.xAxisField || 'x']: this.parseNumber(this.getNestedValue(record, widget.xAxisField || 'x')) || 0,
      [widget.yAxisField || 'y']: this.parseNumber(this.getNestedValue(record, widget.yAxisField || 'y')) || 0,
    }));
  },

  /**
   * Get available fields from a module for configuration
   */
  async getModuleFields(moduleId, tenantId) {
    try {
      console.log('[getModuleFields] Fetching fields for module:', { moduleId, tenantId });
      
      // Fetch field definitions from sub_module_fields table
      const { data: fields, error } = await supabase
        ?.from('sub_module_fields')
        ?.select('id, name, label, data_type, required, is_filter, order_index')
        ?.eq('sub_module_id', moduleId)
        ?.eq('tenant_id', tenantId)
        ?.eq('status', 'active')
        ?.order('order_index', { ascending: true });
      
      if (error) {
        console.error('[getModuleFields] Query error:', error);
        // Fallback: extract from first record
        return this.getFieldsFromRecords(moduleId);
      }
      
      console.log('[getModuleFields] Retrieved fields:', fields?.length || 0);
      
      if (!fields || fields.length === 0) {
        console.log('[getModuleFields] No fields defined, extracting from records');
        return this.getFieldsFromRecords(moduleId);
      }
      
      // Format fields for UI - ensure label is a string, not an object
      return fields.map(field => {
        let labelText = field.name;
        
        // Extract label string properly
        if (field.label) {
          if (typeof field.label === 'string') {
            labelText = field.label;
          } else if (typeof field.label === 'object' && field.label.en) {
            labelText = field.label.en;
          }
        }
        
        return {
          name: field.name,
          label: labelText,
          type: field.data_type?.toLowerCase() || 'text',
          required: field.required || false,
          isFilter: field.is_filter || false
        };
      });
    } catch (error) {
      console.error('[getModuleFields] Error getting module fields:', error);
      // Fallback to extracting from records
      return this.getFieldsFromRecords(moduleId);
    }
  },

  async getFieldsFromRecords(moduleId) {
    try {
      console.log('[getFieldsFromRecords] Extracting fields from records for module:', moduleId);
      const records = await recordService.getAll(moduleId);
      
      if (!records || records.length === 0) {
        return [];
      }

      const fieldSet = new Set();
      const fields = [];

      records.forEach(record => {
        const data = record.data || record;
        Object.keys(data).forEach(key => {
          if (!fieldSet.has(key) && key !== 'id' && key !== 'sub_module_id' && key !== 'tenant_id') {
            fieldSet.add(key);
            fields.push({
              name: key,
              label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
              type: this.inferType(data[key])
            });
          }
        });
      });

      console.log('[getFieldsFromRecords] Extracted fields:', fields.length);
      return fields;
    } catch (error) {
      console.error('[getFieldsFromRecords] Error:', error);
      return [];
    }
  },

  /**
   * Infer data type from value
   */
  inferType(value) {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    
    // Try to parse as date
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime()) && value.includes('-')) {
        return 'date';
      }
      // Try to parse as number
      if (!isNaN(Number(value)) && value.trim() !== '') {
        return 'number';
      }
      return 'string';
    }
    
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    
    return 'string';
  }
};

export default widgetDataFetcher;
