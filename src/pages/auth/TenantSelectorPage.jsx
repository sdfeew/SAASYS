import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { tenantService } from '../../services/tenantService';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { errorHandler } from '../../utils/errorHandler';

const TenantSelectorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setCurrentTenant } = useAuth();

  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantDesc, setNewTenantDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, fetch user's tenants
      // For now, we show create option since new user
      setTenants([]);
      setShowCreateForm(true);
    } catch (err) {
      errorHandler.logError('TenantSelector', err);
      setError('Failed to load tenants');
      setTenants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newTenantName?.trim()) {
      setError('Tenant name is required');
      return;
    }

    setIsCreating(true);
    try {
      const newTenant = await tenantService.create({
        name: newTenantName,
        description: newTenantDesc,
        status: 'active'
      });

      // Set as current tenant
      setCurrentTenant(newTenant);

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      errorHandler.logError('CreateTenant', err);
      setError(err?.message || 'Failed to create tenant');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectTenant = async (tenant) => {
    setSelectedTenant(tenant.id);
    setCurrentTenant(tenant);
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 mb-4">
            <Icon name="Building2" className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">TenantFlow</h1>
          <p className="text-slate-600 text-sm mt-2">Select or Create Your Organization</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="AlertCircle" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-900 text-sm font-medium">Error</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <Icon name="Loader2" size={32} className="animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600">Loading your organizations...</p>
            </div>
          )}

          {/* Existing Tenants */}
          {!isLoading && tenants.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Your Organizations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tenants.map((tenant) => (
                  <button
                    key={tenant.id}
                    onClick={() => handleSelectTenant(tenant)}
                    disabled={selectedTenant === tenant.id}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedTenant === tenant.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{tenant.name}</h3>
                        {tenant.description && (
                          <p className="text-sm text-slate-600 mb-2">{tenant.description}</p>
                        )}
                        <p className="text-xs text-slate-500">
                          Created {new Date(tenant.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedTenant === tenant.id && (
                        <Icon name="CheckCircle2" className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Icon name="Plus" size={20} />
                  Create New Organization
                </button>
              )}
            </div>
          )}

          {/* Create New Tenant Form */}
          {(showCreateForm || tenants.length === 0) && (
            <div className={tenants.length > 0 ? 'pt-8 border-t border-slate-200' : ''}>
              <h2 className="text-lg font-semibold text-slate-900 mb-6">
                {tenants.length === 0
                  ? 'Create Your First Organization'
                  : 'Create a New Organization'}
              </h2>

              <form onSubmit={handleCreateTenant} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={newTenantName}
                    onChange={(e) => setNewTenantName(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    disabled={isCreating}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <p className="text-xs text-slate-600 mt-1">
                    This is the name of your company or team
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newTenantDesc}
                    onChange={(e) => setNewTenantDesc(e.target.value)}
                    placeholder="e.g., Our main business unit"
                    rows="3"
                    disabled={isCreating}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isCreating || !newTenantName.trim()}
                    loading={isCreating}
                  >
                    Create Organization
                  </Button>
                  {tenants.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      disabled={isCreating}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <Icon name="Info" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 text-sm font-medium">What's an Organization?</p>
                <p className="text-blue-700 text-sm mt-1">
                  An organization is a separate workspace for managing your data, users, and
                  dashboards. You can create multiple organizations and switch between them.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Help */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 text-sm">
            Need help?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TenantSelectorPage;
