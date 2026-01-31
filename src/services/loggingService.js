import { supabase } from '../lib/supabase';

/**
 * Advanced Logging Service
 * Comprehensive logging for debugging, monitoring, and auditing
 */

export const loggingService = {
  LOG_LEVELS: {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    CRITICAL: 'CRITICAL'
  },

  LOG_CATEGORIES: {
    AUTH: 'AUTH',
    DATABASE: 'DATABASE',
    API: 'API',
    VALIDATION: 'VALIDATION',
    PERMISSION: 'PERMISSION',
    WORKFLOW: 'WORKFLOW',
    PERFORMANCE: 'PERFORMANCE',
    ERROR: 'ERROR',
    AUDIT: 'AUDIT'
  },

  // Store logs in memory (for development)
  logs: [],
  MAX_LOGS: 1000,

  // Log a message
  log(level, category, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      category,
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Add to in-memory store
    this.logs.push(logEntry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      const style = this.getLogStyle(level);
      console.log(
        `%c[${level}] ${category}`,
        style,
        message,
        data
      );
    }

    // Send to server if critical
    if (level === this.LOG_LEVELS.ERROR || level === this.LOG_LEVELS.CRITICAL) {
      this.sendLogToServer(logEntry);
    }

    return logEntry;
  },

  debug(category, message, data) {
    return this.log(this.LOG_LEVELS.DEBUG, category, message, data);
  },

  info(category, message, data) {
    return this.log(this.LOG_LEVELS.INFO, category, message, data);
  },

  warn(category, message, data) {
    return this.log(this.LOG_LEVELS.WARN, category, message, data);
  },

  error(category, message, data) {
    return this.log(this.LOG_LEVELS.ERROR, category, message, data);
  },

  critical(category, message, data) {
    return this.log(this.LOG_LEVELS.CRITICAL, category, message, data);
  },

  // Get console style for different log levels
  getLogStyle(level) {
    const styles = {
      DEBUG: 'color: #7c3aed; font-weight: bold;',
      INFO: 'color: #0084ff; font-weight: bold;',
      WARN: 'color: #ff9500; font-weight: bold;',
      ERROR: 'color: #ff3b30; font-weight: bold;',
      CRITICAL: 'color: #ff0000; font-weight: bold; font-size: 14px;'
    };
    return styles[level] || '';
  },

  // Send log to server
  async sendLogToServer(logEntry) {
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      });

      if (!response.ok) {
        console.error('Failed to send log to server');
      }
    } catch (error) {
      console.error('Error sending log:', error);
    }
  },

  // Get logs by level
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  },

  // Get logs by category
  getLogsByCategory(category) {
    return this.logs.filter(log => log.category === category);
  },

  // Get logs in time range
  getLogsByTimeRange(startTime, endTime) {
    return this.logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= startTime && logTime <= endTime;
    });
  },

  // Get recent logs
  getRecentLogs(count = 50) {
    return this.logs.slice(-count).reverse();
  },

  // Clear logs
  clearLogs() {
    this.logs = [];
  },

  // Export logs as JSON
  exportLogsAsJSON() {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `logs-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },

  // Export logs as CSV
  exportLogsAsCSV() {
    const headers = ['Timestamp', 'Level', 'Category', 'Message', 'Data'];
    const rows = this.logs.map(log => [
      log.timestamp,
      log.level,
      log.category,
      log.message,
      JSON.stringify(log.data)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileDefaultName = `logs-${new Date().toISOString().split('T')[0]}.csv`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },

  // Log API request
  logAPIRequest(method, url, status, duration, data = {}) {
    return this.log(
      status >= 400 ? this.LOG_LEVELS.WARN : this.LOG_LEVELS.INFO,
      this.LOG_CATEGORIES.API,
      `${method} ${url}`,
      {
        status,
        duration,
        ...data
      }
    );
  },

  // Log database operation
  logDatabaseOperation(operation, table, duration, rowsAffected = 0, error = null) {
    return this.log(
      error ? this.LOG_LEVELS.ERROR : this.LOG_LEVELS.DEBUG,
      this.LOG_CATEGORIES.DATABASE,
      `${operation} on ${table}`,
      {
        duration,
        rowsAffected,
        error: error?.message
      }
    );
  },

  // Log permission check
  logPermissionCheck(userId, resource, allowed, reason = '') {
    return this.log(
      allowed ? this.LOG_LEVELS.DEBUG : this.LOG_LEVELS.WARN,
      this.LOG_CATEGORIES.PERMISSION,
      `Permission ${allowed ? 'granted' : 'denied'} for user on ${resource}`,
      {
        userId,
        resource,
        allowed,
        reason
      }
    );
  },

  // Log workflow execution
  logWorkflowExecution(workflowId, status, duration, error = null) {
    return this.log(
      error ? this.LOG_LEVELS.ERROR : this.LOG_LEVELS.INFO,
      this.LOG_CATEGORIES.WORKFLOW,
      `Workflow ${workflowId} ${status}`,
      {
        duration,
        error: error?.message
      }
    );
  },

  // Log performance metric
  logPerformanceMetric(operation, duration, threshold = 1000) {
    const level = duration > threshold ? this.LOG_LEVELS.WARN : this.LOG_LEVELS.DEBUG;
    return this.log(
      level,
      this.LOG_CATEGORIES.PERFORMANCE,
      `${operation} took ${duration}ms`,
      {
        duration,
        threshold,
        slowness: duration > threshold
      }
    );
  },

  // Get performance statistics
  getPerformanceStats() {
    const performanceLogs = this.getLogsByCategory(this.LOG_CATEGORIES.PERFORMANCE);
    
    if (performanceLogs.length === 0) return null;

    const durations = performanceLogs.map(log => log.data.duration);
    const sorted = durations.sort((a, b) => a - b);

    return {
      count: durations.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: sorted[0],
      maxDuration: sorted[sorted.length - 1],
      medianDuration: sorted[Math.floor(sorted.length / 2)],
      p95Duration: sorted[Math.floor(sorted.length * 0.95)],
      p99Duration: sorted[Math.floor(sorted.length * 0.99)]
    };
  },

  // Get error summary
  getErrorSummary() {
    const errorLogs = this.logs.filter(log =>
      log.level === this.LOG_LEVELS.ERROR || log.level === this.LOG_LEVELS.CRITICAL
    );

    const summary = {};
    errorLogs.forEach(log => {
      if (!summary[log.category]) {
        summary[log.category] = 0;
      }
      summary[log.category]++;
    });

    return summary;
  },

  // Search logs
  searchLogs(query) {
    const queryLower = query.toLowerCase();
    return this.logs.filter(log =>
      log.message.toLowerCase().includes(queryLower) ||
      log.category.toLowerCase().includes(queryLower) ||
      JSON.stringify(log.data).toLowerCase().includes(queryLower)
    );
  }
};

export default loggingService;
