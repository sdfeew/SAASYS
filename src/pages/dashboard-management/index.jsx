import React, { useState, useEffect } from 'react';
import { Plus, Search, Layout, Share2, Trash2, Edit, Eye, Copy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import AdminSidebar from '../../components/ui/AdminSidebar';
import { PageContainer, PageCard, PageSection, PageGrid } from '../../components/layout/PageComponents';
import DashboardTable from './components/DashboardTable';
import DashboardModal from './components/DashboardModal';
import { dashboardService } from '../../services/dashboardService';

const DashboardManagement = () => {
  const { tenantId, user } = useAuth();
  const toast = useToast();
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const data = await dashboardService.getAll(tenantId);
      setDashboards(data || []);
    } catch (err) {
      console.error('Error loading dashboards:', err);
      const errorMsg = err?.message || 'Failed to load dashboards';
      toast.error(errorMsg);
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
        toast.success('Dashboard deleted successfully');
      } catch (err) {
        console.error('Error deleting dashboard:', err);
        toast.error('Failed to delete dashboard');
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
      toast.success('Dashboard published');
    } catch (err) {
      console.error('Error publishing dashboard:', err);
      toast.error('Failed to publish dashboard');
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
      toast.success('Dashboard unpublished');
    } catch (err) {
      console.error('Error unpublishing dashboard:', err);
      toast.error('Failed to unpublish dashboard');
    }
  };

  const handleShare = async (dashboard) => {
    const shareUrl = `${window.location.origin}/dashboard-viewer?id=${dashboard.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `View Dashboard: ${dashboard.name}`,
        text: `Check out this dashboard: ${dashboard.name}`,
        url: shareUrl
      }).catch(err => console.error('Share error:', err));
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success('Share link copied to clipboard');
      }).catch(err => {
        console.error('Copy error:', err);
        toast.error('Failed to copy link');
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
        toast.success('Dashboard created successfully');
      } else if (modalMode === 'edit') {
        await dashboardService.update(selectedDashboard.id, dashboardData);
        setDashboards(dashboards.map(d =>
          d.id === selectedDashboard.id ? { ...d, ...dashboardData } : d
        ));
        toast.success('Dashboard updated');
      } else if (modalMode === 'duplicate') {
        const newDashboard = await dashboardService.create({
          ...dashboardData,
          tenant_id: tenantId
        });
        setDashboards([newDashboard, ...dashboards]);
        toast.success('Dashboard duplicated');
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving dashboard:', err);
      toast.error('Failed to save dashboard');
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
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-3" />
            <p className="text-slate-600">Loading dashboards...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">Dashboards</h1>
              <p className="text-sm text-slate-600 mt-1">Create, edit, and manage your data dashboards</p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              New Dashboard
            </button>
          </div>
        </header>

        {/* Content */}
        <PageContainer>
          {/* Search & Filter */}
          <PageSection title="">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search dashboards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </PageSection>

          {/* Dashboards Grid */}
          {filteredDashboards.length === 0 ? (
            <PageCard>
              <div className="text-center py-8">
                <Layout className="mx-auto text-slate-400 mb-3" size={32} />
                <p className="text-slate-600">
                  {searchTerm || filterStatus !== 'all' ? 'No dashboards found' : 'No dashboards yet'}
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <button
                    onClick={handleCreate}
                    className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    Create Dashboard
                  </button>
                )}
              </div>
            </PageCard>
          ) : (
            <PageGrid cols={1}>
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
            </PageGrid>
          )}
        </PageContainer>
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
