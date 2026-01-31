import React, { useState, useEffect } from 'react';
import { Plug, Plus, Settings, Trash2, Check, AlertCircle, Code } from 'lucide-react';
import { apiIntegrationService } from '../../services/apiIntegrationService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const IntegrationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [integrations, setIntegrations] = useState([
    {
      id: 1,
      name: 'Slack Integration',
      type: 'slack',
      status: 'connected',
      icon: '💬',
      connected: true,
      lastSync: new Date(Date.now() - 3600000)
    },
    {
      id: 2,
      name: 'Google Sheets',
      type: 'google_sheets',
      status: 'connected',
      icon: '📊',
      connected: true,
      lastSync: new Date(Date.now() - 7200000)
    },
    {
      id: 3,
      name: 'Webhook Integration',
      type: 'webhook',
      status: 'pending',
      icon: '🔗',
      connected: false,
      lastSync: null
    }
  ]);
  const [webhooks, setWebhooks] = useState([
    {
      id: 1,
      integrationId: 1,
      event: 'record.created',
      url: 'https://api.example.com/webhook',
      enabled: true,
      lastFired: new Date(Date.now() - 1800000),
      successCount: 145,
      failureCount: 2
    },
    {
      id: 2,
      integrationId: 1,
      event: 'record.updated',
      url: 'https://api.example.com/webhook',
      enabled: true,
      lastFired: new Date(Date.now() - 900000),
      successCount: 98,
      failureCount: 1
    }
  ]);
  const [showNewIntegration, setShowNewIntegration] = useState(false);
  const [showNewWebhook, setShowNewWebhook] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'slack',
    apiKey: '',
    apiSecret: '',
    baseUrl: ''
  });
  const [webhookForm, setWebhookForm] = useState({
    integrationId: '',
    event: 'record.created',
    url: '',
    retryCount: 3
  });
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        setLoading(true);
        setError(null);
        // Load integrations from service
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadIntegrations();
  }, []);

  const handleCreateIntegration = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Call service to create integration
      const newIntegration = {
        ...formData,
        id: Date.now(),
        status: 'pending',
        icon: '🔌',
        connected: false
      };

      setIntegrations([...integrations, newIntegration]);
      setShowNewIntegration(false);
      setFormData({ name: '', type: 'slack', apiKey: '', apiSecret: '', baseUrl: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (integrationId) => {
    try {
      setLoading(true);
      setError(null);

      // Test integration
      const result = await apiIntegrationService.testIntegration(integrationId);

      setIntegrations(integrations.map(i =>
        i.id === integrationId
          ? { ...i, status: 'connected', connected: true }
          : i
      ));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIntegration = async (integrationId) => {
    try {
      setLoading(true);
      setError(null);

      // Delete integration
      await apiIntegrationService.deleteIntegration(integrationId);

      setIntegrations(integrations.filter(i => i.id !== integrationId));
      setConfirmDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWebhook = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Create webhook
      const newWebhook = {
        ...webhookForm,
        id: Date.now(),
        enabled: true,
        lastFired: null,
        successCount: 0,
        failureCount: 0
      };

      setWebhooks([...webhooks, newWebhook]);
      setShowNewWebhook(false);
      setWebhookForm({
        integrationId: '',
        event: 'record.created',
        url: '',
        retryCount: 3
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async (webhookId) => {
    try {
      setLoading(true);

      // Test webhook
      await apiIntegrationService.testWebhook(webhookId);

      setWebhooks(webhooks.map(w =>
        w.id === webhookId
          ? { ...w, lastFired: new Date() }
          : w
      ));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return 'Never';
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  if (loading && integrations.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center">
              <Plug className="mr-3" size={32} />
              Integrations
            </h1>
            <p className="text-gray-600 mt-2">Connect your tools and automate workflows</p>
          </div>
          <button
            onClick={() => setShowNewIntegration(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            New Integration
          </button>
        </div>

        {error && (
          <ErrorAlert
            message={error}
            severity="error"
            className="mb-6"
          />
        )}

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {integrations.map(integration => (
            <div key={integration.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{integration.icon}</div>
                  <div className="flex gap-2">
                    {integration.connected && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        <Check size={14} />
                        Connected
                      </div>
                    )}
                    {integration.status === 'pending' && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                        <AlertCircle size={14} />
                        Pending
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{integration.name}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Type: <span className="font-medium capitalize">{integration.type}</span>
                </p>

                {integration.lastSync && (
                  <p className="text-xs text-gray-500 mb-4">
                    Last sync: {formatTime(integration.lastSync)}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTestConnection(integration.id)}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => setSelectedIntegration(integration)}
                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <Settings size={16} />
                    Config
                  </button>
                  <button
                    onClick={() => setConfirmDelete(integration.id)}
                    className="px-3 py-2 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Integration Card */}
          <button
            onClick={() => setShowNewIntegration(true)}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6 flex flex-col items-center justify-center h-full text-center">
              <Plus size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium">Add New Integration</p>
              <p className="text-sm text-gray-500 mt-1">Connect external services</p>
            </div>
          </button>
        </div>

        {/* Webhooks Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Webhooks</h2>
            <button
              onClick={() => setShowNewWebhook(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus size={20} />
              New Webhook
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Event</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">URL</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Success</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Failed</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Last Fired</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {webhooks.map(webhook => (
                  <tr key={webhook.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900 font-medium">{webhook.event}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">{webhook.url}</code>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className="text-green-600 font-semibold">{webhook.successCount}</span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className="text-red-600 font-semibold">{webhook.failureCount}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{formatTime(webhook.lastFired)}</td>
                    <td className="px-6 py-3 text-sm space-x-2">
                      <button
                        onClick={() => handleTestWebhook(webhook.id)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Test
                      </button>
                      <button className="text-gray-600 hover:text-gray-700 font-medium">
                        View Logs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* API Documentation */}
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Code size={20} />
            API Documentation
          </h3>
          <p className="text-gray-600 mb-4">
            Learn how to integrate with our API and build custom integrations
          </p>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            View Documentation
          </button>
        </div>
      </div>

      {/* New Integration Modal */}
      {showNewIntegration && (
        <Modal
          title="Create New Integration"
          onClose={() => setShowNewIntegration(false)}
        >
          <form onSubmit={handleCreateIntegration} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Integration Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Slack Integration"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Integration Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="slack">Slack</option>
                <option value="google_sheets">Google Sheets</option>
                <option value="zapier">Zapier</option>
                <option value="github">GitHub</option>
                <option value="webhook">Custom Webhook</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter API key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Secret
              </label>
              <input
                type="password"
                value={formData.apiSecret}
                onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter API secret"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Create Integration
              </button>
              <button
                type="button"
                onClick={() => setShowNewIntegration(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Integration"
          message="Are you sure you want to delete this integration? This action cannot be undone."
          onConfirm={() => handleDeleteIntegration(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
          severity="error"
        />
      )}
    </div>
  );
};

export default IntegrationsPage;
