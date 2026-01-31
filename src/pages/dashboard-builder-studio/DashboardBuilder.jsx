import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Eye, Share2, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';

const DashboardBuilderEnhanced = () => {
  const { tenantId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [dashboards, setDashboards] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [dashboardName, setDashboardName] = useState('');
  const [dashboardDescription, setDashboardDescription] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    loadDashboards();
  }, [tenantId]);

  const loadDashboards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getAll(tenantId);
      setDashboards(data || []);
    } catch (err) {
      console.error('Error loading dashboards:', err);
      setError('Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    if (!dashboardName.trim()) {
      setError('Please enter a dashboard name');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const newDashboard = await dashboardService.create({
        name: dashboardName,
        description: dashboardDescription,
        layoutConfig: {
          widgets: [],
          createdAt: new Date().toISOString()
        }
      });

      setDashboards([newDashboard, ...dashboards]);
      setDashboardName('');
      setDashboardDescription('');
      setShowNewForm(false);
      alert('Dashboard created! Now navigate to Dashboard Builder to add widgets.');
    } catch (err) {
      console.error('Error creating dashboard:', err);
      setError('Failed to create dashboard: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDashboard = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dashboard?')) return;

    try {
      setSaving(true);
      setError(null);
      await dashboardService.delete(id);
      setDashboards(dashboards.filter(d => d.id !== id));
    } catch (err) {
      console.error('Error deleting dashboard:', err);
      setError('Failed to delete dashboard');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishDashboard = async (id, isPublished) => {
    try {
      setSaving(true);
      setError(null);

      const dashboard = dashboards.find(d => d.id === id);
      await dashboardService.update(id, {
        ...dashboard,
        isPublished: !isPublished
      });

      setDashboards(dashboards.map(d =>
        d.id === id ? { ...d, is_published: !isPublished } : d
      ));
    } catch (err) {
      console.error('Error updating dashboard:', err);
      setError('Failed to update dashboard');
    } finally {
      setSaving(false);
    }
  };

  const handleViewDashboard = (id) => {
    window.location.href = `/dashboard-viewer?id=${id}`;
  };

  const handleShareDashboard = (id) => {
    const shareUrl = `${window.location.origin}/dashboard-viewer?id=${id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <BarChart3 size={32} />
              Dashboard Management
            </h1>
            <p className="text-gray-600">Create, manage, and publish your dashboards</p>
          </div>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Create Dashboard
          </button>
        </div>

        {error && <ErrorAlert message={error} severity="error" className="mb-8" />}

        {/* Create New Dashboard Form */}
        {showNewForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Dashboard</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dashboard Name</label>
                <input
                  type="text"
                  value={dashboardName}
                  onChange={(e) => setDashboardName(e.target.value)}
                  placeholder="e.g., Sales Dashboard"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={dashboardDescription}
                  onChange={(e) => setDashboardDescription(e.target.value)}
                  placeholder="Describe what this dashboard is for..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateNew}
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save size={20} />
                  Create Dashboard
                </button>
                <button
                  onClick={() => setShowNewForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.length > 0 ? (
            dashboards.map((dashboard) => (
              <div key={dashboard.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <BarChart3 size={48} className="text-blue-200" />
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{dashboard.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {dashboard.description || 'No description'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-gray-200">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      dashboard.is_published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {dashboard.is_published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs text-gray-600">
                      {new Date(dashboard.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleViewDashboard(dashboard.id)}
                      title="View"
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded-lg transition"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={() => handlePublishDashboard(dashboard.id, dashboard.is_published)}
                      title={dashboard.is_published ? 'Unpublish' : 'Publish'}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 hover:bg-green-100 py-2 rounded-lg transition"
                    >
                      <Save size={18} />
                    </button>

                    <button
                      onClick={() => handleShareDashboard(dashboard.id)}
                      title="Share"
                      className="flex-1 flex items-center justify-center gap-2 bg-purple-50 text-purple-600 hover:bg-purple-100 py-2 rounded-lg transition"
                    >
                      <Share2 size={18} />
                    </button>

                    <button
                      onClick={() => handleDeleteDashboard(dashboard.id)}
                      title="Delete"
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg transition disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
              <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No dashboards yet</p>
              <button
                onClick={() => setShowNewForm(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                Create Your First Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardBuilderEnhanced;
