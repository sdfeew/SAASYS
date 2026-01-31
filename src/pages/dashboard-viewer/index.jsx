import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from '../../components/ui/AdminSidebar';
import ModuleBreadcrumbs from '../../components/ui/ModuleBreadcrumbs';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import NotificationBadge from '../../components/ui/NotificationBadge';
import Icon from '../../components/AppIcon';
import DashboardViewerCanvas from './components/DashboardViewerCanvas';
import FilterPanel from './components/FilterPanel';
import NotificationDropdown from '../../components/ui/NotificationDropdown';
import { dashboardService } from '../../services/dashboardService';

const DashboardViewer = () => {
  const [searchParams] = useSearchParams();
  const { tenantId, user } = useAuth();
  const dashboardId = searchParams.get('id');
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filterPanelCollapsed, setFilterPanelCollapsed] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (dashboardId && tenantId) {
      loadDashboard();
    }
  }, [dashboardId, tenantId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard
      const dashboardData = await dashboardService.getById(dashboardId);
      
      if (!dashboardData) {
        setError('Dashboard not found');
        return;
      }

      // Check if dashboard is published
      if (!dashboardData.is_published) {
        setError('This dashboard is not published yet');
        return;
      }

      setDashboard(dashboardData);
      
      // Parse widgets from layout_config if stored there, or from separate field
      const dashboardWidgets = dashboardData.layout_config?.widgets || dashboardData.widgets || [];
      setWidgets(dashboardWidgets);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Refresh all widget data
      await loadDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Filters will be applied to widget queries
  };

  const handleExportDashboard = () => {
    if (!dashboard) return;
    
    // Export dashboard as JSON
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
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <AdminSidebar isCollapsed={sidebarCollapsed} />
        <div className={`flex-1 flex items-center justify-center transition-smooth ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
          <div className="text-center">
            <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <AdminSidebar isCollapsed={sidebarCollapsed} />
        <div className={`flex-1 flex items-center justify-center transition-smooth ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
          <div className="text-center">
            <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-destructive" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Unable to Load Dashboard</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar isCollapsed={sidebarCollapsed} />

      <div className={`flex-1 flex flex-col transition-smooth ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
        {/* Header */}
        <header className="bg-card border-b border-border px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-2 rounded-md hover:bg-muted transition-smooth"
              aria-label="Toggle sidebar"
            >
              <Icon name="PanelLeftClose" size={20} />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-heading font-semibold text-foreground truncate">
                {dashboard?.name || 'Dashboard'}
              </h1>
              {dashboard?.description && (
                <p className="caption text-muted-foreground hidden md:block line-clamp-1">
                  {dashboard.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-md hover:bg-muted transition-smooth disabled:opacity-50"
                aria-label="Refresh dashboard"
              >
                <Icon name={refreshing ? "Loader2" : "RefreshCw"} size={18} className={refreshing ? "animate-spin" : ""} />
              </button>
              
              <button
                onClick={handleExportDashboard}
                className="p-2 rounded-md hover:bg-muted transition-smooth"
                aria-label="Export dashboard"
                title="Export as JSON"
              >
                <Icon name="Download" size={18} />
              </button>

              <NotificationDropdown />
              <UserProfileDropdown />
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border bg-card">
          <ModuleBreadcrumbs />
        </div>

        {/* Toolbar */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border bg-muted/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {widgets.length} widget{widgets.length !== 1 ? 's' : ''}
            </span>
            {dashboard?.created_at && (
              <span className="text-xs text-muted-foreground px-2 py-1 bg-background rounded">
                Updated {new Date(dashboard.created_at).toLocaleDateString()}
              </span>
            )}
          </div>

          <button
            onClick={() => setFilterPanelCollapsed(!filterPanelCollapsed)}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-smooth text-sm"
          >
            <Icon name="Filter" size={16} />
            <span className="hidden sm:inline">Filters</span>
            {Object.keys(filters).length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded bg-primary text-primary-foreground text-xs font-medium">
                {Object.keys(filters).length}
              </span>
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Filter Panel */}
          {!filterPanelCollapsed && (
            <FilterPanel
              widgets={widgets}
              onFilterChange={handleFilterChange}
              isCollapsed={filterPanelCollapsed}
              onToggle={() => setFilterPanelCollapsed(!filterPanelCollapsed)}
            />
          )}

          {/* Dashboard Canvas */}
          <div className="flex-1 overflow-auto scrollbar-custom">
            <DashboardViewerCanvas
              widgets={widgets}
              filters={filters}
              dashboard={dashboard}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardViewer;
