import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/ui/AdminSidebar';
import ModuleBreadcrumbs from '../../components/ui/ModuleBreadcrumbs';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import NotificationBadge from '../../components/ui/NotificationBadge';
import Icon from '../../components/AppIcon';
import WidgetLibrary from './components/WidgetLibrary';
import DashboardCanvas from './components/DashboardCanvas';
import WidgetConfigPanel from './components/WidgetConfigPanel';
import DashboardToolbar from './components/DashboardToolbar';
import { dashboardService } from '../../services/dashboardService';

const DashboardBuilderStudio = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [widgetLibraryCollapsed, setWidgetLibraryCollapsed] = useState(false);
  const [dashboardName, setDashboardName] = useState('Sales Performance Dashboard');
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [notificationCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [currentDashboardId, setCurrentDashboardId] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const dashboards = await dashboardService?.getAll();
      if (dashboards?.length > 0) {
        const dashboard = dashboards?.[0];
        setDashboardName(dashboard?.name);
        setWidgets(dashboard?.widgets || []);
        setCurrentDashboardId(dashboard?.id);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWidgetSelect = (widget) => {
    setSelectedWidget(widget);
  };

  const handleWidgetUpdate = (updatedWidgets) => {
    setWidgets(updatedWidgets);
  };

  const handleWidgetConfigUpdate = (updatedWidget) => {
    const updatedWidgets = widgets?.map(w => 
      w?.id === updatedWidget?.id ? updatedWidget : w
    );
    setWidgets(updatedWidgets);
    setSelectedWidget(null);
  };

  const handleWidgetDelete = (widgetId) => {
    setWidgets(widgets?.filter(w => w?.id !== widgetId));
    if (selectedWidget?.id === widgetId) {
      setSelectedWidget(null);
    }
  };

  const handleSave = async () => {
    try {
      if (currentDashboardId) {
        await dashboardService?.update(currentDashboardId, {
          name: dashboardName,
          widgets: widgets
        });
      } else {
        const newDashboard = await dashboardService?.create({
          name: dashboardName,
          widgets: widgets
        });
        setCurrentDashboardId(newDashboard?.id);
      }
      console.log('Dashboard saved successfully');
    } catch (error) {
      console.error('Error saving dashboard:', error);
    }
  };

  const handlePublish = async () => {
    try {
      if (currentDashboardId) {
        await dashboardService?.update(currentDashboardId, {
          name: dashboardName,
          widgets: widgets,
          isPublished: true
        });
        console.log('Dashboard published successfully');
      }
    } catch (error) {
      console.error('Error publishing dashboard:', error);
    }
  };

  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar isCollapsed={sidebarCollapsed} />

      <div className={`flex-1 flex flex-col transition-smooth ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
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
                Dashboard Builder Studio
              </h1>
              <p className="caption text-muted-foreground hidden md:block">
                Create interactive analytics dashboards with drag-and-drop widgets
              </p>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button className="relative p-2 rounded-md hover:bg-muted transition-smooth">
                <Icon name="Bell" size={20} />
                <NotificationBadge count={notificationCount} className="absolute -top-1 -right-1" />
              </button>
              <UserProfileDropdown />
            </div>
          </div>
        </header>

        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border bg-card">
          <ModuleBreadcrumbs />
        </div>

        <DashboardToolbar
          dashboardName={dashboardName}
          onNameChange={setDashboardName}
          onSave={handleSave}
          onPublish={handlePublish}
          onPreview={handlePreview}
          isPreviewMode={isPreviewMode}
        />

        <div className="flex-1 flex overflow-hidden">
          {!isPreviewMode && (
            <WidgetLibrary
              isCollapsed={widgetLibraryCollapsed}
              onToggle={() => setWidgetLibraryCollapsed(!widgetLibraryCollapsed)}
              onWidgetSelect={handleWidgetSelect}
            />
          )}

          <DashboardCanvas
            widgets={widgets}
            onWidgetUpdate={handleWidgetUpdate}
            onWidgetDelete={handleWidgetDelete}
            onWidgetSelect={handleWidgetSelect}
            selectedWidget={selectedWidget}
          />

          {selectedWidget && !isPreviewMode && (
            <WidgetConfigPanel
              widget={selectedWidget}
              onUpdate={handleWidgetConfigUpdate}
              onClose={() => setSelectedWidget(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardBuilderStudio;