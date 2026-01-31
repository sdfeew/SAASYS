import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/ui/AdminSidebar';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorAlert from '../../components/ui/ErrorAlert';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { tenantService } from '../../services/tenantService';
import { useAuth } from '../../contexts/AuthContext';
import { errorHandler } from '../../utils/errorHandler';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const TenantAdminDashboardEnhanced = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantDesc, setNewTenantDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingTenant, setEditingTenant] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingDesc, setEditingDesc] = useState('');
  const [editingSaving, setEditingSaving] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tenantService.getAll();
      setTenants(data || []);
    } catch (err) {
      errorHandler.logError('TenantAdminDashboard:loadTenants', err);
      setError('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async () => {
    if (!newTenantName.trim()) {
      setError('Tenant name is required');
      return;
    }

    setSaving(true);
    try {
      const newTenant = await tenantService.create({
        name: newTenantName,
        description: newTenantDesc,
        status: 'active'
      });
      setTenants([...tenants, newTenant]);
      setNewTenantName('');
      setNewTenantDesc('');
      setShowCreateModal(false);
    } catch (err) {
      errorHandler.logError('TenantAdminDashboard:createTenant', err);
      setError('Failed to create tenant');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTenant = async () => {
    if (!editingName.trim()) {
      setError('Tenant name is required');
      return;
    }

    setEditingSaving(true);
    try {
      const updated = await tenantService.update(editingTenant.id, {
        name: editingName,
        description: editingDesc
      });
      setTenants(tenants.map(t => t.id === editingTenant.id ? updated : t));
      setEditingTenant(null);
    } catch (err) {
      errorHandler.logError('TenantAdminDashboard:updateTenant', err);
      setError('Failed to update tenant');
    } finally {
      setEditingSaving(false);
    }
  };

  const handleDeleteTenant = async () => {
    try {
      await tenantService.delete(deleteConfirm.id);
      setTenants(tenants.filter(t => t.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      errorHandler.logError('TenantAdminDashboard:deleteTenant', err);
      setError('Failed to delete tenant');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading tenants..." />;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="lg:hidden p-2 hover:bg-slate-100 rounded">
                <Icon name="Menu" size={24} />
              </button>
              <h1 className="text-2xl font-bold text-slate-900">Tenant Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
                <Icon name="Plus" size={18} />
                New Tenant
              </Button>
              <UserProfileDropdown user={user} />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-slate-100">
            <ErrorAlert error={error} onDismiss={() => setError(null)} />
          </div>
        )}

        <div className="flex-1 overflow-auto p-6">
          {tenants.length === 0 ? (
            <EmptyState
              icon="Building2"
              title="No Tenants"
              description="Create your first tenant to get started"
              action={<Button onClick={() => setShowCreateModal(true)}>Create Tenant</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tenants.map(tenant => (
                <div key={tenant.id} className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{tenant.name}</h3>
                      {tenant.description && <p className="text-sm text-slate-600 mt-1">{tenant.description}</p>}
                    </div>
                    <StatusBadge status={tenant.status || 'active'} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 mb-4">ID: {tenant.id}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setEditingTenant(tenant);
                        setEditingName(tenant.name);
                        setEditingDesc(tenant.description || '');
                      }}
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => setDeleteConfirm(tenant)}
                      size="sm"
                      variant="secondary"
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Tenant</h2>
            <input
              type="text"
              value={newTenantName}
              onChange={(e) => setNewTenantName(e.target.value)}
              placeholder="Tenant name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={newTenantDesc}
              onChange={(e) => setNewTenantDesc(e.target.value)}
              placeholder="Description (optional)"
              rows="3"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <Button onClick={handleCreateTenant} loading={saving} className="flex-1">
                Create
              </Button>
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Tenant</h2>
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              placeholder="Tenant name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={editingDesc}
              onChange={(e) => setEditingDesc(e.target.value)}
              placeholder="Description (optional)"
              rows="3"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <Button onClick={handleUpdateTenant} loading={editingSaving} className="flex-1">
                Save
              </Button>
              <button
                onClick={() => setEditingTenant(null)}
                disabled={editingSaving}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Tenant?"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        actionLabel="Delete"
        onConfirm={handleDeleteTenant}
        onCancel={() => setDeleteConfirm(null)}
        severity="danger"
      />
    </div>
  );
};

export default TenantAdminDashboardEnhanced;
