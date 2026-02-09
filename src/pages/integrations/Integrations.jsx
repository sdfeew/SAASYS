import React, { useState } from 'react';
import { Plug, Plus, Check, Trash2, Settings, Copy, Eye, EyeOff, ExternalLink, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { PageContainer, PageCard, PageSection } from '../../components/layout/PageComponents';
import AdminSidebar from '../../components/ui/AdminSidebar';
import Icon from '../../components/AppIcon';

const IntegrationsPage = () => {
  const toast = useToast();
  const [integrations, setIntegrations] = useState([
    { 
      id: 1, 
      name: 'Slack', 
      enabled: true,
      category: 'Communication',
      description: 'Send notifications and messages to Slack channels',
      icon: '💬',
      apiKey: 'xoxb-123456789-***',
      lastSync: Date.now() - 3600000,
      status: 'connected'
    },
    { 
      id: 2, 
      name: 'Google Sheets', 
      enabled: false,
      category: 'Data',
      description: 'Sync data with Google Sheets in real-time',
      icon: '📊',
      apiKey: null,
      lastSync: null,
      status: 'disconnected'
    },
    { 
      id: 3, 
      name: 'Webhooks', 
      enabled: true,
      category: 'Developer',
      description: 'Send events to external URLs',
      icon: '🔗',
      apiKey: '***.****.***.****',
      lastSync: Date.now() - 7200000,
      status: 'connected'
    },
    { 
      id: 4, 
      name: 'Zapier', 
      enabled: false,
      category: 'Automation',
      description: 'Connect with 1000+ apps through Zapier',
      icon: '⚡',
      apiKey: null,
      lastSync: null,
      status: 'disconnected'
    },
    { 
      id: 5, 
      name: 'Stripe', 
      enabled: false,
      category: 'Payment',
      description: 'Accept payments and manage transactions',
      icon: '💳',
      apiKey: null,
      lastSync: null,
      status: 'error'
    }
  ]);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showApiKey, setShowApiKey] = useState({});
  const [configForm, setConfigForm] = useState({ apiKey: '', webhookUrl: '' });

  const handleToggle = (id) => {
    setIntegrations(
      integrations.map(int =>
        int.id === id ? { 
          ...int,
          enabled: !int.enabled,
          status: !int.enabled ? 'connected' : 'disconnected',
          lastSync: !int.enabled ? Date.now() : int.lastSync
        } : int
      )
    );
    const int = integrations.find(i => i.id === id);
    toast.success(`${int.name} ${!int.enabled ? 'connected' : 'disconnected'}`);
  };

  const handleRemove = (id) => {
    const int = integrations.find(i => i.id === id);
    setIntegrations(integrations.filter(i => i.id !== id));
    setSelectedIntegration(null);
    toast.success(`${int.name} removed`);
  };

  const handleCopyApiKey = (apiKey) => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API Key copied to clipboard');
  };

  const handleSaveConfig = () => {
    if (!configForm.apiKey) {
      toast.warning('Please enter an API key');
      return;
    }
    toast.success('Configuration saved successfully');
    setConfigForm({ apiKey: '', webhookUrl: '' });
    setSelectedIntegration(null);
  };

  const categories = [...new Set(integrations.map(i => i.category))];
  
  const stats = [
    { label: 'Connected', value: integrations.filter(i => i.enabled).length, icon: 'CheckCircle2', color: 'green' },
    { label: 'Disconnected', value: integrations.filter(i => !i.enabled).length, icon: 'AlertCircle', color: 'yellow' },
    { label: 'Total Integrations', value: integrations.length, icon: 'Plug', color: 'blue' }
  ];

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border shadow-elevation-1">
          <div className="px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plug className="text-primary" size={20} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-semibold text-foreground">Integrations</h1>
                <p className="text-sm text-muted-foreground">Connect and manage external services</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <PageContainer>
            {/* Stats */}
            <PageSection>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                {stats.map((stat, idx) => (
                  <PageCard key={idx}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-3xl font-heading font-bold text-foreground">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}>
                        <Icon name={stat.icon} size={24} />
                      </div>
                    </div>
                  </PageCard>
                ))}
              </div>
            </PageSection>

            {/* Integrations by Category */}
            {categories.map(category => (
              <PageSection key={category} title={category}>
                <div className="space-y-3">
                  {integrations.filter(int => int.category === category).map((int) => (
                    <PageCard key={int.id} className="hover:shadow-elevation-2 transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="text-2xl flex-shrink-0">{int.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-semibold text-foreground">{int.name}</h3>
                              <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                                int.status === 'connected'
                                  ? 'bg-success/10 text-success'
                                  : int.status === 'error'
                                  ? 'bg-destructive/10 text-destructive'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {int.status === 'connected' ? '✓ Connected' : int.status === 'error' ? '⚠ Error' : 'Disconnected'}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{int.description}</p>
                            {int.lastSync && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Last sync: {formatDate(int.lastSync)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {int.enabled && int.apiKey && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs">
                              <span>Key:</span>
                              <span className="font-mono text-muted-foreground">
                                {showApiKey[int.id] ? int.apiKey : '•••••••••••••••'}
                              </span>
                              <button
                                onClick={() => setShowApiKey(prev => ({ ...prev, [int.id]: !prev[int.id] }))}
                                className="ml-1 text-muted-foreground hover:text-foreground"
                              >
                                {showApiKey[int.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => handleToggle(int.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-smooth ${
                              int.enabled
                                ? 'bg-success/10 text-success hover:bg-success/20'
                                : 'bg-muted text-foreground hover:bg-muted/80'
                            }`}
                          >
                            {int.enabled ? 'Disable' : 'Enable'}
                          </button>

                          {int.enabled && (
                            <button
                              onClick={() => setSelectedIntegration(int.id)}
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-smooth"
                              title="Configure"
                            >
                              <Settings size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => handleRemove(int.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-smooth"
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </PageCard>
                  ))}
                </div>
              </PageSection>
            ))}

            {/* Configuration Modal */}
            {selectedIntegration && (
              <PageSection>
                <PageCard className="border-2 border-primary">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">
                        Configure {integrations.find(i => i.id === selectedIntegration)?.name}
                      </h3>
                      <button
                        onClick={() => setSelectedIntegration(null)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">API Key</label>
                      <input
                        type="password"
                        placeholder="Enter your API key"
                        value={configForm.apiKey}
                        onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Webhook URL (optional)</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={configForm.webhookUrl}
                        onChange={(e) => setConfigForm({ ...configForm, webhookUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-border">
                      <button
                        onClick={() => setSelectedIntegration(null)}
                        className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-smooth"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveConfig}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth flex items-center gap-2"
                      >
                        <Check size={16} />
                        Save Configuration
                      </button>
                    </div>
                  </div>
                </PageCard>
              </PageSection>
            )}
          </PageContainer>
        </main>
      </div>
    </div>
  );
};

export default IntegrationsPage;
