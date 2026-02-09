import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, Download, AlertCircle, Loader2, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import AdminSidebar from '../../components/ui/AdminSidebar';
import { PageContainer, PageCard } from '../../components/layout/PageComponents';
import DashboardViewerCanvas from './components/DashboardViewerCanvas';
import FilterPanel from './components/FilterPanel';
import { dashboardService } from '../../services/dashboardService';

const DashboardViewer = () => {
  const [searchParams] = useSearchParams();
  const { tenantId, user } = useAuth();
  const toast = useToast();
  const dashboardId = searchParams.get('id');
  
  const [dashboard, setDashboard] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({});
  const [filtersPanelCollapsed, setFiltersPanelCollapsed] = useState(false);
  
  // Prevent infinite loops
  const loadAttempt = useRef(0);
  const maxLoadAttempts = 1;
  const isDashboardLoaded = useRef(false);

  // Use useCallback to prevent dependency changes
  const loadDashboard = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isDashboardLoaded.current || loadAttempt.current >= maxLoadAttempts) {
      return;
    }

    if (!dashboardId || !tenantId) {
      return;
    }

    loadAttempt.current += 1;

    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard with timeout protection
      const dashboardData = await Promise.race([
        dashboardService.getById(dashboardId),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 15000)
        )
      ]);
      
      if (!dashboardData) {
        setError('Dashboard not found');
        return;
      }

      // Check if dashboard is published
      if (!dashboardData.is_published) {
        setError('This dashboard is not published yet. Please publish it from Dashboard Management.');
        return;
      }

      setDashboard(dashboardData);
      
      // Safe widget extraction with fallbacks
      const dashboardWidgets = dashboardData?.layout_config?.widgets || 
                               dashboardData?.widgets || 
                               [];
      
      if (!Array.isArray(dashboardWidgets)) {
        console.warn('Widgets is not an array:', dashboardWidgets);
        setWidgets([]);
      } else {
        setWidgets(dashboardWidgets);
      }
      
      isDashboardLoaded.current = true;
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err?.message || 'Failed to load dashboard');
      toast?.error(err?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [dashboardId, tenantId, toast]);

  // Single useEffect with proper dependencies
  useEffect(() => {
    // Reset attempt counter when params change
    loadAttempt.current = 0;
    isDashboardLoaded.current = false;
    
    loadDashboard();
    
    // Cleanup function
    return () => {
      // Cancel any pending requests on unmount
      dashboardService.clearCache?.();
    };
  }, [dashboardId, loadDashboard]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      // Reset loaded state to allow refresh
      isDashboardLoaded.current = false;
      loadAttempt.current = 0;
      
      // Clear cache before refresh
      dashboardService.clearCache?.();
      
      await loadDashboard();
      toast?.success('Dashboard refreshed');
    } catch (err) {
      toast?.error('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  }, [loadDashboard, toast]);

  const handleExportDashboard = useCallback(() => {
    if (!dashboard) return;
    
    try {
      const dataStr = JSON.stringify({
        name: dashboard.name,
        description: dashboard.description,
        widgets: widgets,
        exportedAt: new Date().toISOString()
      }, null, 2);
      
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dashboard.name}-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast?.success('Dashboard exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      toast?.error('Failed to export dashboard');
    }
  }, [dashboard, widgets, toast]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-3" />
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Unable to Load Dashboard</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />

      <div className="flex flex-1 overflow-hidden">
        {/* Filters Sidebar */}
        <FilterPanel
          widgets={widgets}
          onFilterChange={setFilters}
          isCollapsed={filtersPanelCollapsed}
          onToggle={() => setFiltersPanelCollapsed(!filtersPanelCollapsed)}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-slate-900 truncate">
                  {dashboard?.name || 'Dashboard'}
                </h1>
                {dashboard?.description && (
                  <p className="text-sm text-slate-600 mt-1 truncate">
                    {dashboard.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!filtersPanelCollapsed && widgets.length > 0 && (
                  <button
                    onClick={() => setFilters({})}
                    className="px-3 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700"
                    title="Clear all filters"
                  >
                    Clear Filters
                  </button>
                )}

                <button
                  onClick={() => setFiltersPanelCollapsed(!filtersPanelCollapsed)}
                  className={`p-2 rounded-lg transition-colors ${
                    filtersPanelCollapsed
                      ? 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                  title="Toggle filters"
                >
                  <Filter className="h-5 w-5" />
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors"
                  title="Refresh dashboard"
                >
                  <RefreshCw className={`h-5 w-5 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                
                <button
                  onClick={handleExportDashboard}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Export as JSON"
                >
                  <Download className="h-5 w-5 text-slate-600" />
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <PageContainer>
            <DashboardViewerCanvas
              widgets={widgets}
              dashboard={dashboard}
              filters={filters}
            />
          </PageContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardViewer;
