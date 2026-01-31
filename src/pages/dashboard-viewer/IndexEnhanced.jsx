import React, { useState, useEffect } from 'react';
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

const DashboardViewerEnhanced = () => {
  const { user, tenantId } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboards, setDashboards] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  useEffect(() => {
    loadDashboards();
  }, [tenantId]);

  const loadDashboards = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getAll(tenantId);
      const published = data.filter(d => d.status === 'published');
      setDashboards(published || []);
      if (published && published.length > 0) {
        setSelectedDashboard(published[0]);
      }
    } catch (err) {
      errorHandler.logError('DashboardViewer:loadDashboards', err);
      setError('Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Export logic here
      alert('Data exported successfully');
    } catch (err) {
      errorHandler.logError('DashboardViewer:exportData', err);
      setError('Failed to export data');
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="lg:hidden p-2 hover:bg-slate-100 rounded">
                <Icon name="Menu" size={24} />
              </button>
              <h1 className="text-2xl font-bold text-slate-900">Dashboards</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleExportData} variant="secondary" className="flex items-center gap-2">
                <Icon name="Download" size={18} />
                Export
              </Button>
              <UserProfileDropdown user={user} />
            </div>
          </div>

          {/* Dashboard Selector */}
          {dashboards.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dashboards.map(dashboard => (
                <button
                  key={dashboard.id}
                  onClick={() => setSelectedDashboard(dashboard)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedDashboard?.id === dashboard.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {dashboard.name}
                </button>
              ))}
            </div>
          )}
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
              title="No Dashboards Available"
              description="No published dashboards available to view"
            />
          ) : selectedDashboard ? (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">{selectedDashboard.name}</h2>
                {selectedDashboard.description && (
                  <p className="text-slate-600 mb-4">{selectedDashboard.description}</p>
                )}

                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">From Date</label>
                    <input
                      type="date"
                      value={dateRange.start.toISOString().split('T')[0]}
                      onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">To Date</label>
                    <input
                      type="date"
                      value={dateRange.end.toISOString().split('T')[0]}
                      onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dashboard Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-lg border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Widget {i}</h3>
                    <div className="h-40 bg-gradient-to-br from-blue-50 to-blue-100 rounded flex items-center justify-center">
                      <div className="text-center">
                        <Icon name="BarChart3" size={32} className="text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-blue-600">Widget Preview</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon="BarChart3"
              title="Select a Dashboard"
              description="Choose a dashboard from the list above to view"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardViewerEnhanced;
