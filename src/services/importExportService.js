import { recordService } from './recordService';
import { errorHandler } from '../utils/errorHandler';

/**
 * Import/Export Service
 * Handles CSV/Excel import and export operations
 */

export const importExportService = {
  // Export records to CSV
  async exportToCSV(records, moduleFields, fileName = 'export.csv') {
    try {
      if (!records || records.length === 0) {
        throw new Error('No records to export');
      }

      if (!moduleFields || moduleFields.length === 0) {
        throw new Error('No fields defined for export');
      }

      // Create header row
      const headers = moduleFields.map(field => field.label).join(',');

      // Create data rows
      const rows = records.map(record => {
        return moduleFields
          .map(field => {
            const value = record[field.name] || '';
            // Escape quotes and wrap in quotes if contains comma
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',');
      });

      // Combine header and rows
      const csvContent = [headers, ...rows].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      errorHandler.logError('ImportExportService:exportToCSV', error);
      throw error;
    }
  },

  // Export records to JSON
  async exportToJSON(records, fileName = 'export.json') {
    try {
      if (!records || records.length === 0) {
        throw new Error('No records to export');
      }

      const jsonContent = JSON.stringify(records, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      errorHandler.logError('ImportExportService:exportToJSON', error);
      throw error;
    }
  },

  // Parse CSV file
  async parseCSV(file) {
    try {
      if (!file) throw new Error('No file provided');
      if (!file.name.endsWith('.csv')) throw new Error('File must be a CSV');

      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
          try {
            const content = event.target.result;
            const lines = content.split('\n');

            if (lines.length < 2) {
              throw new Error('CSV must have at least header and one data row');
            }

            const headers = lines[0].split(',').map(h => h.trim());
            const data = [];

            for (let i = 1; i < lines.length; i++) {
              if (lines[i].trim() === '') continue;

              const values = lines[i].split(',').map(v => v.trim());
              const row = {};

              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });

              data.push(row);
            }

            resolve({ headers, data });
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
      });
    } catch (error) {
      errorHandler.logError('ImportExportService:parseCSV', error);
      throw error;
    }
  },

  // Import records from parsed data
  async importRecords(moduleId, records, fieldMapping = null) {
    try {
      if (!moduleId) throw new Error('Module ID is required');
      if (!records || records.length === 0) throw new Error('No records to import');

      const results = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (let i = 0; i < records.length; i++) {
        try {
          const record = fieldMapping
            ? this.mapRecord(records[i], fieldMapping)
            : records[i];

          // Validate record
          if (!this.validateRecord(record)) {
            results.failed++;
            results.errors.push({
              row: i + 2, // +1 for header, +1 for 1-based indexing
              error: 'Record validation failed'
            });
            continue;
          }

          // Create record
          await recordService.create(moduleId, {
            ...record,
            status: 'draft'
          });

          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: i + 2,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      errorHandler.logError('ImportExportService:importRecords', error);
      throw error;
    }
  },

  // Map record fields according to mapping rules
  mapRecord(record, fieldMapping) {
    try {
      if (!fieldMapping || typeof fieldMapping !== 'object') {
        return record;
      }

      const mapped = {};

      Object.entries(fieldMapping).forEach(([sourceField, targetField]) => {
        if (record.hasOwnProperty(sourceField)) {
          mapped[targetField] = record[sourceField];
        }
      });

      return mapped;
    } catch (error) {
      errorHandler.logError('ImportExportService:mapRecord', error);
      return record;
    }
  },

  // Validate record
  validateRecord(record) {
    try {
      if (!record || typeof record !== 'object') {
        return false;
      }

      // Check for required fields (title at minimum)
      if (!record.title && !record.name && !record.label) {
        return false;
      }

      return true;
    } catch (error) {
      errorHandler.logError('ImportExportService:validateRecord', error);
      return false;
    }
  },

  // Generate import template
  async generateTemplate(moduleFields) {
    try {
      if (!moduleFields || moduleFields.length === 0) {
        throw new Error('No fields defined');
      }

      const headers = moduleFields.map(field => field.label).join(',');
      const exampleRow = moduleFields
        .map(field => {
          const examples = {
            'text': 'Sample text',
            'number': '123',
            'email': 'example@test.com',
            'date': new Date().toISOString().split('T')[0],
            'select': 'Option 1',
            'checkbox': 'true'
          };
          return examples[field.type] || 'Sample value';
        })
        .join(',');

      const csvContent = [headers, exampleRow].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', 'import_template.csv');
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      errorHandler.logError('ImportExportService:generateTemplate', error);
      throw error;
    }
  }
};

export default importExportService;
