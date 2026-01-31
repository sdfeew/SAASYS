import { errorHandler } from '../utils/errorHandler';

/**
 * API Integration Service
 * Handle third-party API integrations and webhooks
 */

export const apiIntegrationService = {
  // Create API integration
  async createIntegration(integration) {
    try {
      if (!integration.name) throw new Error('Integration name is required');
      if (!integration.type) throw new Error('Integration type is required');

      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: integration.name,
          type: integration.type,
          apiKey: integration.apiKey,
          apiSecret: integration.apiSecret,
          baseUrl: integration.baseUrl,
          headers: integration.headers || {},
          config: integration.config || {},
          enabled: true,
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to create integration');
      return await response.json();
    } catch (error) {
      errorHandler.logError('APIIntegrationService:createIntegration', error);
      throw error;
    }
  },

  // Update API integration
  async updateIntegration(integrationId, updates) {
    try {
      if (!integrationId) throw new Error('Integration ID is required');

      const response = await fetch(`/api/integrations/${integrationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update integration');
      return await response.json();
    } catch (error) {
      errorHandler.logError('APIIntegrationService:updateIntegration', error);
      throw error;
    }
  },

  // Delete API integration
  async deleteIntegration(integrationId) {
    try {
      if (!integrationId) throw new Error('Integration ID is required');

      const response = await fetch(`/api/integrations/${integrationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete integration');
      return true;
    } catch (error) {
      errorHandler.logError('APIIntegrationService:deleteIntegration', error);
      throw error;
    }
  },

  // Test API connection
  async testIntegration(integrationId) {
    try {
      if (!integrationId) throw new Error('Integration ID is required');

      const response = await fetch(`/api/integrations/${integrationId}/test`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Integration test failed');
      return await response.json();
    } catch (error) {
      errorHandler.logError('APIIntegrationService:testIntegration', error);
      throw error;
    }
  },

  // Create webhook
  async createWebhook(webhook) {
    try {
      if (!webhook.integrationId) throw new Error('Integration ID is required');
      if (!webhook.event) throw new Error('Event type is required');
      if (!webhook.url) throw new Error('Webhook URL is required');

      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integration_id: webhook.integrationId,
          event: webhook.event,
          url: webhook.url,
          headers: webhook.headers || {},
          retryPolicy: webhook.retryPolicy || { maxRetries: 3, delaySeconds: 60 },
          enabled: true,
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to create webhook');
      return await response.json();
    } catch (error) {
      errorHandler.logError('APIIntegrationService:createWebhook', error);
      throw error;
    }
  },

  // Update webhook
  async updateWebhook(webhookId, updates) {
    try {
      if (!webhookId) throw new Error('Webhook ID is required');

      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update webhook');
      return await response.json();
    } catch (error) {
      errorHandler.logError('APIIntegrationService:updateWebhook', error);
      throw error;
    }
  },

  // Delete webhook
  async deleteWebhook(webhookId) {
    try {
      if (!webhookId) throw new Error('Webhook ID is required');

      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete webhook');
      return true;
    } catch (error) {
      errorHandler.logError('APIIntegrationService:deleteWebhook', error);
      throw error;
    }
  },

  // Test webhook
  async testWebhook(webhookId) {
    try {
      if (!webhookId) throw new Error('Webhook ID is required');

      const response = await fetch(`/api/webhooks/${webhookId}/test`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Webhook test failed');
      return await response.json();
    } catch (error) {
      errorHandler.logError('APIIntegrationService:testWebhook', error);
      throw error;
    }
  },

  // Get webhook delivery logs
  async getWebhookLogs(webhookId, options = {}) {
    try {
      if (!webhookId) throw new Error('Webhook ID is required');

      const params = new URLSearchParams({
        limit: options.limit || 50,
        offset: options.offset || 0,
        status: options.status || 'all'
      });

      const response = await fetch(`/api/webhooks/${webhookId}/logs?${params}`);

      if (!response.ok) throw new Error('Failed to fetch webhook logs');
      return await response.json();
    } catch (error) {
      errorHandler.logError('APIIntegrationService:getWebhookLogs', error);
      throw error;
    }
  },

  // Call external API
  async callExternalAPI(integrationId, endpoint, method = 'GET', data = null) {
    try {
      if (!integrationId) throw new Error('Integration ID is required');
      if (!endpoint) throw new Error('Endpoint is required');

      const response = await fetch('/api/integrations/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationId,
          endpoint,
          method,
          data
        })
      });

      if (!response.ok) throw new Error('API call failed');
      return await response.json();
    } catch (error) {
      errorHandler.logError('APIIntegrationService:callExternalAPI', error);
      throw error;
    }
  },

  // Map API response to record fields
  mapAPIResponse(apiResponse, fieldMapping) {
    try {
      if (!apiResponse || typeof apiResponse !== 'object') {
        throw new Error('API response must be an object');
      }

      if (!fieldMapping || typeof fieldMapping !== 'object') {
        throw new Error('Field mapping must be an object');
      }

      const mapped = {};

      Object.entries(fieldMapping).forEach(([recordField, apiPath]) => {
        const value = this.getNestedValue(apiResponse, apiPath);
        if (value !== undefined) {
          mapped[recordField] = value;
        }
      });

      return mapped;
    } catch (error) {
      errorHandler.logError('APIIntegrationService:mapAPIResponse', error);
      throw error;
    }
  },

  // Get nested value from object
  getNestedValue(obj, path) {
    if (!path) return undefined;

    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  },

  // Transform record to API format
  transformToAPIFormat(record, fieldMapping) {
    try {
      if (!record || typeof record !== 'object') {
        throw new Error('Record must be an object');
      }

      if (!fieldMapping || typeof fieldMapping !== 'object') {
        throw new Error('Field mapping must be an object');
      }

      const transformed = {};

      Object.entries(fieldMapping).forEach(([apiField, recordField]) => {
        if (recordField in record) {
          transformed[apiField] = record[recordField];
        }
      });

      return transformed;
    } catch (error) {
      errorHandler.logError('APIIntegrationService:transformToAPIFormat', error);
      throw error;
    }
  },

  // Sync data from external API
  async syncFromAPI(integrationId, endpoint, fieldMapping, options = {}) {
    try {
      if (!integrationId) throw new Error('Integration ID is required');
      if (!endpoint) throw new Error('Endpoint is required');
      if (!fieldMapping) throw new Error('Field mapping is required');

      // Call external API
      const apiResponse = await this.callExternalAPI(integrationId, endpoint);

      // Handle array response
      const records = Array.isArray(apiResponse) ? apiResponse : [apiResponse];

      // Map each record
      const mappedRecords = records.map(record =>
        this.mapAPIResponse(record, fieldMapping)
      );

      return {
        syncedCount: mappedRecords.length,
        records: mappedRecords,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      errorHandler.logError('APIIntegrationService:syncFromAPI', error);
      throw error;
    }
  },

  // Sync data to external API
  async syncToAPI(integrationId, endpoint, records, fieldMapping, options = {}) {
    try {
      if (!integrationId) throw new Error('Integration ID is required');
      if (!endpoint) throw new Error('Endpoint is required');
      if (!Array.isArray(records)) throw new Error('Records must be an array');
      if (!fieldMapping) throw new Error('Field mapping is required');

      // Transform all records
      const transformedRecords = records.map(record =>
        this.transformToAPIFormat(record, fieldMapping)
      );

      // Send to API
      const response = await fetch('/api/integrations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationId,
          endpoint,
          records: transformedRecords,
          method: options.method || 'POST'
        })
      });

      if (!response.ok) throw new Error('Sync to API failed');

      return await response.json();
    } catch (error) {
      errorHandler.logError('APIIntegrationService:syncToAPI', error);
      throw error;
    }
  }
};

export default apiIntegrationService;
