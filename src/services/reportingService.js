import { supabase } from '../lib/supabase';
import { errorHandler } from '../utils/errorHandler';

/**
 * Advanced Reporting Service
 * Generates comprehensive reports and analytics
 */

export const reportingService = {
  // Generate record statistics
  async getRecordStats(moduleId, dateRange = null) {
    try {
      if (!moduleId) throw new Error('Module ID is required');

      let query = supabase
        .from('records')
        .select('*')
        .eq('module_id', moduleId);

      if (dateRange?.start && dateRange?.end) {
        query = query
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        total: data.length,
        byStatus: this.groupBy(data, 'status'),
        byDate: this.groupByDate(data, 'created_at'),
        avgFieldsPerRecord: data.reduce((sum, r) => sum + Object.keys(r).length, 0) / data.length
      };
    } catch (error) {
      errorHandler.logError('ReportingService:getRecordStats', error);
      throw error;
    }
  },

  // Generate user activity report
  async getUserActivityReport(userId, days = 30) {
    try {
      if (!userId) throw new Error('User ID is required');

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        totalActivities: data.length,
        byAction: this.groupBy(data, 'action'),
        byDay: this.groupByDate(data, 'created_at'),
        lastActivity: data[0],
        activityTrend: this.calculateTrend(data)
      };
    } catch (error) {
      errorHandler.logError('ReportingService:getUserActivityReport', error);
      throw error;
    }
  },

  // Generate workflow performance report
  async getWorkflowPerformanceReport(workflowId) {
    try {
      if (!workflowId) throw new Error('Workflow ID is required');

      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId);

      if (error) throw error;

      const durations = data
        .filter(e => e.completed_at && e.started_at)
        .map(e => new Date(e.completed_at) - new Date(e.started_at));

      return {
        totalExecutions: data.length,
        successfulExecutions: data.filter(e => e.status === 'completed').length,
        failedExecutions: data.filter(e => e.status === 'failed').length,
        averageDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
        successRate: data.length > 0 ? (data.filter(e => e.status === 'completed').length / data.length) * 100 : 0,
        byStatus: this.groupBy(data, 'status'),
        trend: this.calculateTrend(data)
      };
    } catch (error) {
      errorHandler.logError('ReportingService:getWorkflowPerformanceReport', error);
      throw error;
    }
  },

  // Generate module usage report
  async getModuleUsageReport(tenantId) {
    try {
      if (!tenantId) throw new Error('Tenant ID is required');

      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('id, name')
        .eq('tenant_id', tenantId);

      if (modulesError) throw modulesError;

      const report = await Promise.all(
        modules.map(async (mod) => {
          const { data: records } = await supabase
            .from('records')
            .select('id')
            .eq('module_id', mod.id);

          return {
            module: mod.name,
            recordCount: records?.length || 0
          };
        })
      );

      return report.sort((a, b) => b.recordCount - a.recordCount);
    } catch (error) {
      errorHandler.logError('ReportingService:getModuleUsageReport', error);
      throw error;
    }
  },

  // Generate data quality report
  async getDataQualityReport(moduleId) {
    try {
      if (!moduleId) throw new Error('Module ID is required');

      const { data: records, error: recordsError } = await supabase
        .from('records')
        .select('*')
        .eq('module_id', moduleId);

      if (recordsError) throw recordsError;

      const { data: fields } = await supabase
        .from('fields')
        .select('id, name, required')
        .eq('module_id', moduleId);

      const emptyFieldCounts = {};
      const duplicateRecords = [];

      fields?.forEach(field => {
        const emptyCount = records.filter(r => !r[field.name] || r[field.name] === '').length;
        emptyFieldCounts[field.name] = {
          empty: emptyCount,
          percentage: (emptyCount / records.length) * 100,
          required: field.required
        };
      });

      return {
        totalRecords: records.length,
        emptyFields: emptyFieldCounts,
        completeness: this.calculateCompleteness(records, fields),
        issues: this.identifyDataIssues(records, fields)
      };
    } catch (error) {
      errorHandler.logError('ReportingService:getDataQualityReport', error);
      throw error;
    }
  },

  // Export report to CSV
  async exportReportToCSV(reportData, fileName) {
    try {
      const csv = this.convertToCSV(reportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', fileName || 'report.csv');
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      errorHandler.logError('ReportingService:exportReportToCSV', error);
      throw error;
    }
  },

  // Helper: Group data by field
  groupBy(array, key) {
    return array.reduce((acc, obj) => {
      const group = obj[key] || 'unknown';
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});
  },

  // Helper: Group data by date
  groupByDate(array, dateKey) {
    const grouped = {};
    array.forEach(item => {
      const date = new Date(item[dateKey]).toLocaleDateString();
      grouped[date] = (grouped[date] || 0) + 1;
    });
    return grouped;
  },

  // Helper: Calculate trend
  calculateTrend(data) {
    const last7Days = data.filter(d => {
      const date = new Date(d.created_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return date > sevenDaysAgo;
    });

    const previous7Days = data.filter(d => {
      const date = new Date(d.created_at);
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return date > fourteenDaysAgo && date <= sevenDaysAgo;
    });

    return {
      last7Days: last7Days.length,
      previous7Days: previous7Days.length,
      change: last7Days.length - previous7Days.length,
      percentageChange: previous7Days.length > 0 
        ? ((last7Days.length - previous7Days.length) / previous7Days.length) * 100 
        : 0
    };
  },

  // Helper: Calculate completeness
  calculateCompleteness(records, fields) {
    if (!records.length || !fields.length) return 0;

    const totalFields = records.length * fields.length;
    const filledFields = records.reduce((count, record) => {
      return count + fields.filter(field => record[field.name]).length;
    }, 0);

    return (filledFields / totalFields) * 100;
  },

  // Helper: Identify data issues
  identifyDataIssues(records, fields) {
    const issues = [];

    // Check for required empty fields
    fields?.forEach(field => {
      if (field.required) {
        const emptyRecords = records.filter(r => !r[field.name] || r[field.name] === '');
        if (emptyRecords.length > 0) {
          issues.push({
            type: 'missing_required_field',
            field: field.name,
            count: emptyRecords.length,
            severity: 'high'
          });
        }
      }
    });

    // Check for duplicates
    const titleCounts = this.groupBy(records, 'title');
    Object.entries(titleCounts).forEach(([title, count]) => {
      if (count > 1) {
        issues.push({
          type: 'duplicate_record',
          value: title,
          count: count,
          severity: 'medium'
        });
      }
    });

    return issues;
  },

  // Helper: Convert to CSV
  convertToCSV(data) {
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0]);
      const csv = [headers.join(',')];

      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        });
        csv.push(values.join(','));
      });

      return csv.join('\n');
    } else {
      // Handle object data
      const csv = [];
      Object.entries(data).forEach(([key, value]) => {
        csv.push(`${key},${value}`);
      });
      return csv.join('\n');
    }
  }
};

export default reportingService;
