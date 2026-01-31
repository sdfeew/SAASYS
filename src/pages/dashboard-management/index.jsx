import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from '../../components/ui/AdminSidebar';
import ModuleBreadcrumbs from '../../components/ui/ModuleBreadcrumbs';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import NotificationBadge from '../../components/ui/NotificationBadge';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import DashboardTable from './components/DashboardTable';
import DashboardModal from './components/DashboardModal';
import NotificationDropdown from '../../components/ui/NotificationDropdown';
import { dashboardService } from '../../services/dashboardService';

const DashboardManagement = () => {
  const { tenantId, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'duplicate'
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'published', 'draft'

  useEffect(() => {
    if (tenantId) {
      loadDashboards();
    }
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

  const handleCreate = () => {
    setSelectedDashboard(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (dashboard) => {
    setSelectedDashboard(dashboard);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleEditInBuilder = (dashboard) => {
    // Navigate to Dashboard Builder with the dashboard ID
    window.location.href = `/dashboard-builder-studio?id=${dashboard.id}`;
  };

  const handleDuplicate = (dashboard) => {
    setSelectedDashboard(dashboard);
    setModalMode('duplicate');
    setShowModal(true);
  };

  const handleView = (dashboard) => {
    window.location.href = `/dashboard-viewer?id=${dashboard.id}`;
  };

  const handleDelete = async (dashboard) => {
    if (window.confirm(`Are you sure you want to delete "${dashboard.name}"? This action cannot be undone.`)) {
      try {
        setDeleting(true);
        await dashboardService.delete(dashboard.id);
        setDashboards(dashboards.filter(d => d.id !== dashboard.id));
      } catch (err) {
        console.error('Error deleting dashboard:', err);
        setError('Failed to delete dashboard');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handlePublish = async (dashboard) => {
    try {
      await dashboardService.update(dashboard.id, {
        ...dashboard,
        is_published: true
      });
      setDashboards(dashboards.map(d =>
        d.id === dashboard.id ? { ...d, is_published: true } : d
      ));
    } catch (err) {
      console.error('Error publishing dashboard:', err);
      setError('Failed to publish dashboard');
    }
  };

  const handleUnpublish = async (dashboard) => {
    try {
      await dashboardService.update(dashboard.id, {
        ...dashboard,
        is_published: false
      });
      setDashboards(dashboards.map(d =>
        d.id === dashboard.id ? { ...d, is_published: false } : d
      ));
    } catch (err) {
      console.error('Error unpublishing dashboard:', err);
      setError('Failed to unpublish dashboard');
    }
  };

  const handleShare = async (dashboard) => {
    const shareUrl = `${window.location.origin}/dashboard-viewer?id=${dashboard.id}`;
    
    // Create share link object
    const shareLink = {
      url: shareUrl,
      dashboard: dashboard.name,
      createdAt: new Date().toISOString()
    };

    // Try to use native share API
    if (navigator.share) {
      navigator.share({
        title: `View Dashboard: ${dashboard.name}`,
        text: `Check out this dashboard: ${dashboard.name}`,
        url: shareUrl
      }).catch(err => console.error('Share error:', err));
    } else {
      // Fallback: copy to clipboard and show confirmation
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert(`Share link copied to clipboard!\n\n${shareUrl}`);
      }).catch(err => {
        console.error('Copy error:', err);
        alert('Copy link manually:\n\n' + shareUrl);
      });
    }
  };

  const handleSaveModal = async (dashboardData) => {
    try {
      if (modalMode === 'create') {
        const newDashboard = await dashboardService.create({
          ...dashboardData,
          tenant_id: tenantId
        });
        setDashboards([newDashboard, ...dashboards]);
      } else if (modalMode === 'edit') {
        await dashboardService.update(selectedDashboard.id, dashboardData);
        setDashboards(dashboards.map(d =>
          d.id === selectedDashboard.id ? { ...d, ...dashboardData } : d
        ));
      } else if (modalMode === 'duplicate') {
        const newDashboard = await dashboardService.create({
          ...dashboardData,
          tenant_id: tenantId
        });
        setDashboards([newDashboard, ...dashboards]);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving dashboard:', err);
      setError('Failed to save dashboard');
    }
  };

  // Filter dashboards
  const filteredDashboards = dashboards.filter(d => {
    const matchesSearch = d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'published' && d.is_published) ||
                         (filterStatus === 'draft' && !d.is_published);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <AdminSidebar isCollapsed={sidebarCollapsed} />
        <div className={`flex-1 flex items-center justify-center transition-smooth ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
          <div className="text-center">
            <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading dashboards...</p>
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
                Dashboard Management
              </h1>
              <p className="caption text-muted-foreground hidden md:block">
                Create, edit, and manage your dashboards
              </p>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
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
        <div className="px-4 md:px-6 py-4 border-b border-border bg-card space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search dashboards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Dashboards</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>

          {/* Action Buttons */}
          <Button
            onClick={handleCreate}
            iconName="Plus"
            iconPosition="left"
            className="whitespace-nowrap"
          >
            New Dashboard
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 md:px-6 py-3 bg-destructive/10 border-b border-destructive/20 flex items-center gap-3">
            <Icon name="AlertCircle" size={18} className="text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-destructive/20 rounded transition-smooth"
            >
              <Icon name="X" size={16} className="text-destructive" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto scrollbar-custom">
          {filteredDashboards.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Icon name="Layout" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchTerm || filterStatus !== 'all' ? 'No dashboards found' : 'No dashboards yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter'
                    : 'Create your first dashboard to get started'}
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Button
                    onClick={handleCreate}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Create Dashboard
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <DashboardTable
              dashboards={filteredDashboards}
              onView={handleView}
              onEdit={handleEdit}
              onEditInBuilder={handleEditInBuilder}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              onShare={handleShare}
              deleting={deleting}
            />
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <DashboardModal
          mode={modalMode}
          dashboard={selectedDashboard}
          onSave={handleSaveModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default DashboardManagement;
