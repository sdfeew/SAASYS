import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/ui/AdminSidebar';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorAlert from '../../components/ui/ErrorAlert';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { dashboardService } from '../../services/dashboardService';
import { widgetService } from '../../services/widgetService';
import { useAuth } from '../../contexts/AuthContext';
import { errorHandler } from '../../utils/errorHandler';

const DashboardBuilderStudioEnhanced = () => {
  const { user, tenantId } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [newWidget, setNewWidget] = useState({
    title: '',
    type: 'chart',
    width: 1,
    height: 1,
    config: {}
  });
  const [editingWidget, setEditingWidget] = useState(null);
  const [dashboardName, setDashboardName] = useState('');

  useEffect(() => {
    const dashboardId = new URLSearchParams(window.location.search).get('id');
    if (dashboardId) {
      loadDashboard(dashboardId);
    }
  }, []);

  const loadDashboard = async (dashboardId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getById(dashboardId);
      setDashboard(data);
      setDashboardName(data.name);
      
      const widgetsData = await widgetService.getByDashboard(dashboardId);
      setWidgets(widgetsData || []);
    } catch (err) {
      errorHandler.logError('DashboardBuilder:loadDashboard', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWidget = async () => {
    if (!newWidget.title.trim()) {
      setError('Widget title is required');
      return;
    }

    setSaving(true);
    try {
      const created = await widgetService.create({
        dashboard_id: dashboard.id,
        ...newWidget,
        order: widgets.length + 1
      });
      setWidgets([...widgets, created]);
      setNewWidget({ title: '', type: 'chart', width: 1, height: 1, config: {} });
      setShowWidgetModal(false);
    } catch (err) {
      errorHandler.logError('DashboardBuilder:addWidget', err);
      setError('Failed to add widget');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateWidget = async (widgetId, updates) => {
    try {
      const updated = await widgetService.update(widgetId, updates);
      setWidgets(widgets.map(w => w.id === widgetId ? updated : w));
    } catch (err) {
      errorHandler.logError('DashboardBuilder:updateWidget', err);
      setError('Failed to update widget');
    }
  };

  const handleDeleteWidget = async (widgetId) => {
    try {
      await widgetService.delete(widgetId);
      setWidgets(widgets.filter(w => w.id !== widgetId));
    } catch (err) {
      errorHandler.logError('DashboardBuilder:deleteWidget', err);
      setError('Failed to delete widget');
    }
  };

  const handleSaveDashboard = async () => {
    setSaving(true);
    try {
      await dashboardService.update(dashboard.id, {
        name: dashboardName
      });
      setDashboard({ ...dashboard, name: dashboardName });
    } catch (err) {
      errorHandler.logError('DashboardBuilder:saveDashboard', err);
      setError('Failed to save dashboard');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorAlert error={error} title="Dashboard Not Found" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="lg:hidden p-2 hover:bg-slate-100 rounded">
                <Icon name="Menu" size={24} />
              </button>
              <input
                type="text"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                placeholder="Dashboard name"
                className="text-2xl font-bold px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleSaveDashboard} loading={saving}>
                <Icon name="Save" size={18} />
                Save
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
          <div className="mb-6">
            <Button onClick={() => setShowWidgetModal(true)} className="flex items-center gap-2">
              <Icon name="Plus" size={18} />
              Add Widget
            </Button>
          </div>

          {widgets.length === 0 ? (
            <EmptyState
              icon="Layers"
              title="No Widgets"
              description="Add your first widget to build your dashboard"
              action={<Button onClick={() => setShowWidgetModal(true)}>Add Widget</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgets.map(widget => (
                <div key={widget.id} className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">{widget.title}</h3>
                    <button
                      onClick={() => handleDeleteWidget(widget.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">Type: {widget.type}</p>
                  <div className="h-40 bg-slate-50 rounded border border-slate-200 flex items-center justify-center">
                    <p className="text-slate-500 text-sm">Widget Preview</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showWidgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add Widget</h2>
            <input
              type="text"
              value={newWidget.title}
              onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
              placeholder="Widget title"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newWidget.type}
              onChange={(e) => setNewWidget({ ...newWidget, type: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="chart">Chart</option>
              <option value="table">Table</option>
              <option value="metric">Metric</option>
              <option value="list">List</option>
              <option value="custom">Custom</option>
            </select>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Width</label>
                <input
                  type="number"
                  value={newWidget.width}
                  onChange={(e) => setNewWidget({ ...newWidget, width: parseInt(e.target.value) })}
                  min="1"
                  max="4"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Height</label>
                <input
                  type="number"
                  value={newWidget.height}
                  onChange={(e) => setNewWidget({ ...newWidget, height: parseInt(e.target.value) })}
                  min="1"
                  max="4"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAddWidget} loading={saving} className="flex-1">
                Add Widget
              </Button>
              <button
                onClick={() => setShowWidgetModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBuilderStudioEnhanced;
