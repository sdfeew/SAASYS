import DashboardBuilderEnhanced from './DashboardBuilder';

export default DashboardBuilderEnhanced;
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from '../../components/ui/AdminSidebar';
import ModuleBreadcrumbs from '../../components/ui/ModuleBreadcrumbs';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import NotificationBadge from '../../components/ui/NotificationBadge';
import Icon from '../../components/AppIcon';
import WidgetLibrary from './components/WidgetLibrary';
import DashboardCanvas from './components/DashboardCanvas';
import WidgetConfigPanel from './components/WidgetConfigPanel';
import DashboardToolbar from './components/DashboardToolbar';
import NotificationDropdown from '../../components/ui/NotificationDropdown';
import { dashboardService } from '../../services/dashboardService';

const DashboardBuilderStudio = () => {
  const { tenantId } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [widgetLibraryCollapsed, setWidgetLibraryCollapsed] = useState(false);
  const [dashboardName, setDashboardName] = useState('');
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentDashboardId, setCurrentDashboardId] = useState(null);
  const [availableDashboards, setAvailableDashboards] = useState([]);

  useEffect(() => {
    if (tenantId) {
      loadDashboards();
    }
  }, [tenantId]);

  const loadDashboards = async () => {
    try {
      setLoading(true);
      // Pass tenantId to getAll
      const dashboards = await dashboardService?.getAll(tenantId);
      setAvailableDashboards(dashboards || []);
      
      if (dashboards?.length > 0) {
        const firstDashboard = dashboards?.[0];
        setDashboardName(firstDashboard?.name || 'New Dashboard');
        setWidgets(firstDashboard?.widgets || []);
        setCurrentDashboardId(firstDashboard?.id);
      } else {
        // Create a new empty dashboard
        const newDashboard = await dashboardService?.create({
          name: 'My Dashboard',
          widgets: []
        });
        setCurrentDashboardId(newDashboard?.id);
        setDashboardName('My Dashboard');
      }
    } catch (error) {
      console.error('Error loading dashboards:', error);
      setDashboardName('My Dashboard');
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
      setSaving(true);
      
      if (currentDashboardId) {
        // Update existing dashboard
        await dashboardService?.update(currentDashboardId, {
          name: dashboardName,
          layoutConfig: {
            widgets: widgets,
            savedAt: new Date().toISOString()
          },
          isPublished: false
        });
        alert('Dashboard saved successfully!');
      } else {
        // Create new dashboard
        const newDashboard = await dashboardService?.create({
          name: dashboardName,
          layoutConfig: {
            widgets: widgets,
            savedAt: new Date().toISOString()
          }
        });
        setCurrentDashboardId(newDashboard?.id);
        alert('Dashboard created and saved!');
      }
      
      // Reload dashboards list
      loadDashboards();
    } catch (error) {
      console.error('Error saving dashboard:', error);
      alert('Failed to save dashboard: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      
      if (currentDashboardId) {
        // First save, then publish
        await dashboardService?.update(currentDashboardId, {
          name: dashboardName,
          layoutConfig: {
            widgets: widgets,
            publishedAt: new Date().toISOString()
          },
          isPublished: true
        });
        alert('Dashboard published successfully!');
        loadDashboards();
      } else {
        alert('Please save the dashboard first');
      }
    } catch (error) {
      console.error('Error publishing dashboard:', error);
      alert('Failed to publish dashboard: ' + error.message);
    } finally {
      setSaving(false);
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
              <NotificationDropdown />
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