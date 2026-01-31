import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminSidebar from '../../components/ui/AdminSidebar';
import ModuleBreadcrumbs from '../../components/ui/ModuleBreadcrumbs';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorAlert from '../../components/ui/ErrorAlert';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ModuleHeader from './components/ModuleHeader';
import FilterToolbar from './components/FilterToolbar';
import BulkActionsBar from './components/BulkActionsBar';
import DataTable from './components/DataTable';
import TablePagination from './components/TablePagination';
import ViewCustomizer from './components/ViewCustomizer';
import ImportExportPanel from './components/ImportExportPanel';
import AddRecordModal from './components/AddRecordModal';
import EditRecordModal from './components/EditRecordModal';
import { recordService } from '../../services/recordService';
import { moduleService } from '../../services/moduleService';
import { fieldService } from '../../services/fieldService';
import { useAuth } from '../../contexts/AuthContext';
import { errorHandler } from '../../utils/errorHandler';
import { v4 as uuidv4 } from 'uuid';

const DynamicModuleListViewEnhanced = () => {
  const { user, tenantId } = useAuth();
  const [searchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showViewCustomizer, setShowViewCustomizer] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([]);
  
  // State management
  const [records, setRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [columns, setColumns] = useState([]);
  const [moduleFields, setModuleFields] = useState([]);
  const [filters, setFilters] = useState([]);
  const [sortConfig, setSortConfig] = useState(null);
  const [notificationCount] = useState(4);

  // Modal states
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [showEditRecordModal, setShowEditRecordModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [savingEditRecord, setSavingEditRecord] = useState(false);

  // Load modules on mount
  useEffect(() => {
    loadModules();
  }, [tenantId]);

  // Load records when module changes
  useEffect(() => {
    if (selectedModule) {
      loadRecords();
      loadModuleFields();
    }
  }, [selectedModule]);

  const loadModules = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await moduleService.getAllMainModules(tenantId);
      setModules(data || []);
      
      // Auto-select first module if available
      if (data && data.length > 0) {
        setSelectedModule(data[0]);
      }
    } catch (err) {
      errorHandler.logError('DynamicModuleListView:loadModules', err);
      setError('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async () => {
    if (!selectedModule) return;

    setLoading(true);
    setError(null);
    try {
      const data = await recordService.getAll(selectedModule.id, tenantId);
      setAllRecords(data || []);
      setRecords(data || []);
      setSelectedRows([]);
      setCurrentPage(1);
    } catch (err) {
      errorHandler.logError('DynamicModuleListView:loadRecords', err);
      setError('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const loadModuleFields = async () => {
    if (!selectedModule) return;

    try {
      const fields = await fieldService.getAllFields(selectedModule.id);
      setModuleFields(fields || []);
      
      // Set visible columns (first 5 fields by default)
      const defaultColumns = fields?.slice(0, 5).map(f => f.id) || [];
      setVisibleColumns(defaultColumns);
    } catch (err) {
      errorHandler.logError('DynamicModuleListView:loadModuleFields', err);
    }
  };

  const handleAddRecord = async (recordData) => {
    if (!selectedModule) return;

    setSavingRecord(true);
    try {
      const newRecord = await recordService.create(selectedModule.id, {
        ...recordData,
        tenant_id: tenantId,
        status: 'draft'
      });

      setAllRecords([newRecord, ...allRecords]);
      setRecords([newRecord, ...records]);
      setShowAddRecordModal(false);
    } catch (err) {
      errorHandler.logError('DynamicModuleListView:handleAddRecord', err);
      setError('Failed to add record');
    } finally {
      setSavingRecord(false);
    }
  };

  const handleEditRecord = async (recordData) => {
    if (!editingRecord) return;

    setSavingEditRecord(true);
    try {
      const updated = await recordService.update(editingRecord.id, recordData);
      
      // Update records
      const updatedAllRecords = allRecords.map(r => 
        r.id === editingRecord.id ? updated : r
      );
      setAllRecords(updatedAllRecords);
      setRecords(records.map(r => 
        r.id === editingRecord.id ? updated : r
      ));

      setShowEditRecordModal(false);
      setEditingRecord(null);
    } catch (err) {
      errorHandler.logError('DynamicModuleListView:handleEditRecord', err);
      setError('Failed to update record');
    } finally {
      setSavingEditRecord(false);
    }
  };

  const handleDeleteRecords = async () => {
    if (selectedRows.length === 0) return;

    setLoading(true);
    try {
      for (const recordId of selectedRows) {
        await recordService.delete(recordId);
      }

      const updatedRecords = allRecords.filter(r => !selectedRows.includes(r.id));
      setAllRecords(updatedRecords);
      setRecords(updatedRecords);
      setSelectedRows([]);
    } catch (err) {
      errorHandler.logError('DynamicModuleListView:handleDeleteRecords', err);
      setError('Failed to delete records');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...allRecords];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(record =>
        Object.values(record).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply filters
    filters.forEach(filter => {
      filtered = filtered.filter(record => {
        const value = record[filter.field];
        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'gt':
            return value > filter.value;
          case 'lt':
            return value < filter.value;
          default:
            return true;
        }
      });
    });

    // Apply sort
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setRecords(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFiltersAndSort();
  }, [searchQuery, filters, sortConfig]);

  // Pagination
  const paginatedRecords = records.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(records.length / pageSize);

  if (loading && !selectedModule) {
    return <LoadingSpinner fullScreen message="Loading modules..." />;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded"
              >
                <Icon name="Menu" size={24} />
              </button>
              <h1 className="text-2xl font-bold text-slate-900">
                {selectedModule?.name || 'Select Module'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {records.length} records
                </span>
              </div>
              <UserProfileDropdown user={user} />
            </div>
          </div>

          {/* Breadcrumbs */}
          <ModuleBreadcrumbs 
            module={selectedModule}
            modules={modules}
            onModuleSelect={setSelectedModule}
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-slate-100">
            <ErrorAlert
              error={error}
              title="Error"
              onRetry={loadRecords}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <LoadingSpinner message="Loading records..." />
          ) : records.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <EmptyState
                icon="Database"
                title={searchQuery ? "No records found" : "No records yet"}
                description={
                  searchQuery
                    ? `No records match "${searchQuery}". Try a different search.`
                    : `Start by adding your first record to ${selectedModule?.name}`
                }
                action={
                  <Button
                    onClick={() => setShowAddRecordModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Icon name="Plus" size={18} />
                    Add First Record
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Toolbar */}
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button
                  onClick={() => setShowAddRecordModal(true)}
                  className="flex items-center gap-2"
                >
                  <Icon name="Plus" size={18} />
                  Add Record
                </Button>
              </div>

              {/* Bulk Actions */}
              {selectedRows.length > 0 && (
                <BulkActionsBar
                  selectedCount={selectedRows.length}
                  onDelete={handleDeleteRecords}
                  onClearSelection={() => setSelectedRows([])}
                />
              )}

              {/* Data Table */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
                <DataTable
                  records={paginatedRecords}
                  columns={moduleFields}
                  selectedRows={selectedRows}
                  onSelectRows={setSelectedRows}
                  onEditRecord={(record) => {
                    setEditingRecord(record);
                    setShowEditRecordModal(true);
                  }}
                  onDeleteRecord={async (recordId) => {
                    setSelectedRows([recordId]);
                    await handleDeleteRecords();
                  }}
                  visibleColumns={visibleColumns}
                  sortConfig={sortConfig}
                  onSort={setSortConfig}
                />
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalRecords={records.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddRecordModal
        isOpen={showAddRecordModal}
        onClose={() => setShowAddRecordModal(false)}
        onSave={handleAddRecord}
        moduleFields={moduleFields}
        module={selectedModule}
        isLoading={savingRecord}
      />

      <EditRecordModal
        isOpen={showEditRecordModal}
        onClose={() => {
          setShowEditRecordModal(false);
          setEditingRecord(null);
        }}
        onSave={handleEditRecord}
        record={editingRecord}
        moduleFields={moduleFields}
        module={selectedModule}
        isLoading={savingEditRecord}
      />
    </div>
  );
};

export default DynamicModuleListViewEnhanced;
