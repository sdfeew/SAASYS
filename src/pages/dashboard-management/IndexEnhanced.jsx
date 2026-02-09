import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/ui/AdminSidebar';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorAlert from '../../components/ui/ErrorAlert';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../contexts/AuthContext';
import { errorHandler } from '../../utils/errorHandler';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const DashboardManagementEnhanced = () => {
  const navigate = useNavigate();
  const { user, tenantId } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDashboard, setNewDashboard] = useState({ name: '', description: '', layout: 'grid' });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingDashboard, setEditingDashboard] = useState(null);
  const [publishingId, setPublishingId] = useState(null);

  useEffect(() => {
    loadDashboards();
  }, [tenantId]);

  const loadDashboards = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getAll(tenantId);
      setDashboards(data || []);
    } catch (err) {
      errorHandler.logError('DashboardManagement:loadDashboards', err);
      setError('Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDashboard = async () => {
    if (!newDashboard.name.trim()) {
      setError('Dashboard name is required');
      return;
    }

    setSaving(true);
    try {
      const created = await dashboardService.create({
        ...newDashboard,
        tenant_id: tenantId,
        status: 'draft'
      });
      setDashboards([...dashboards, created]);
      setNewDashboard({ name: '', description: '', layout: 'grid' });
      setShowCreateModal(false);
    } catch (err) {
      errorHandler.logError('DashboardManagement:createDashboard', err);
      setError('Failed to create dashboard');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDashboard = async () => {
    setSaving(true);
    try {
      const updated = await dashboardService.update(editingDashboard.id, {
        name: editingDashboard.name,
        description: editingDashboard.description,
        layout: editingDashboard.layout
      });
      setDashboards(dashboards.map(d => d.id === editingDashboard.id ? updated : d));
      setEditingDashboard(null);
    } catch (err) {
      errorHandler.logError('DashboardManagement:updateDashboard', err);
      setError('Failed to update dashboard');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDashboard = async () => {
    try {
      await dashboardService.delete(deleteConfirm.id);
      setDashboards(dashboards.filter(d => d.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      errorHandler.logError('DashboardManagement:deleteDashboard', err);
      setError('Failed to delete dashboard');
    }
  };

  const handlePublishDashboard = async (dashboardId) => {
    setPublishingId(dashboardId);
    try {
      const updated = await dashboardService.publish(dashboardId);
      setDashboards(dashboards.map(d => d.id === dashboardId ? updated : d));
    } catch (err) {
      errorHandler.logError('DashboardManagement:publishDashboard', err);
      setError('Failed to publish dashboard');
    } finally {
      setPublishingId(null);
    }
  };

  const handleUnpublishDashboard = async (dashboardId) => {
    setPublishingId(dashboardId);
    try {
      const updated = await dashboardService.unpublish(dashboardId);
      setDashboards(dashboards.map(d => d.id === dashboardId ? updated : d));
    } catch (err) {
      errorHandler.logError('DashboardManagement:unpublishDashboard', err);
      setError('Failed to unpublish dashboard');
    } finally {
      setPublishingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading dashboards..." />;
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
              <h1 className="text-2xl font-bold text-slate-900">Dashboard Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
                <Icon name="Plus" size={18} />
                New Dashboard
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
          {dashboards.length === 0 ? (
            <EmptyState
              icon="BarChart3"
              title="No Dashboards"
              description="Create your first dashboard to visualize your data"
              action={<Button onClick={() => setShowCreateModal(true)}>Create Dashboard</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboards.map(dashboard => (
                <div key={dashboard.id} className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{dashboard.name}</h3>
                      {dashboard.description && <p className="text-sm text-slate-600 mt-1">{dashboard.description}</p>}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dashboard.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {dashboard.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Layout: {dashboard.layout || 'Grid'}</p>
                  <div className="flex gap-2">
                    {dashboard.status === 'published' && (
                      <Button
                        onClick={() => navigate(`/dashboard-viewer?id=${dashboard.id}`)}
                        size="sm"
                        variant="default"
                        className="flex-1"
                      >
                        View
                      </Button>
                    )}
                    <Button
                      onClick={() => navigate(`/dashboard-builder-studio?id=${dashboard.id}`)}
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    {dashboard.status === 'draft' ? (
                      <Button
                        onClick={() => handlePublishDashboard(dashboard.id)}
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        loading={publishingId === dashboard.id}
                      >
                        Publish
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleUnpublishDashboard(dashboard.id)}
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        loading={publishingId === dashboard.id}
                      >
                        Unpublish
                      </Button>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(dashboard)}
                      className="px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
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
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Dashboard</h2>
            <input
              type="text"
              value={newDashboard.name}
              onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
              placeholder="Dashboard name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={newDashboard.description}
              onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
              placeholder="Description (optional)"
              rows="3"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newDashboard.layout}
              onChange={(e) => setNewDashboard({ ...newDashboard, layout: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="grid">Grid Layout</option>
              <option value="list">List Layout</option>
              <option value="kanban">Kanban Layout</option>
            </select>
            <div className="flex gap-3">
              <Button onClick={handleCreateDashboard} loading={saving} className="flex-1">
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

      {editingDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Dashboard</h2>
            <input
              type="text"
              value={editingDashboard.name}
              onChange={(e) => setEditingDashboard({ ...editingDashboard, name: e.target.value })}
              placeholder="Dashboard name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={editingDashboard.description}
              onChange={(e) => setEditingDashboard({ ...editingDashboard, description: e.target.value })}
              placeholder="Description (optional)"
              rows="3"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={editingDashboard.layout}
              onChange={(e) => setEditingDashboard({ ...editingDashboard, layout: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="grid">Grid Layout</option>
              <option value="list">List Layout</option>
              <option value="kanban">Kanban Layout</option>
            </select>
            <div className="flex gap-3">
              <Button onClick={handleUpdateDashboard} loading={saving} className="flex-1">
                Save
              </Button>
              <button
                onClick={() => setEditingDashboard(null)}
                disabled={saving}
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
        title="Delete Dashboard?"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        actionLabel="Delete"
        onConfirm={handleDeleteDashboard}
        onCancel={() => setDeleteConfirm(null)}
        severity="danger"
      />
    </div>
  );
};

export default DashboardManagementEnhanced;
