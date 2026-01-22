import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/ui/AdminSidebar';
import ModuleBreadcrumbs from '../../components/ui/ModuleBreadcrumbs';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';

import Icon from '../../components/AppIcon';
import ModuleHeader from './components/ModuleHeader';
import FilterToolbar from './components/FilterToolbar';
import BulkActionsBar from './components/BulkActionsBar';
import DataTable from './components/DataTable';
import TablePagination from './components/TablePagination';
import ViewCustomizer from './components/ViewCustomizer';
import ImportExportPanel from './components/ImportExportPanel';
import { recordService } from '../../services/recordService';

const DynamicModuleListView = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showViewCustomizer, setShowViewCustomizer] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(['fullName', 'email', 'department', 'position', 'hireDate', 'salary', 'status', 'performanceRating']);
  const [notificationCount] = useState(4);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { key: 'fullName', label: 'Full Name', type: 'text', sortable: true },
    { key: 'email', label: 'Email', type: 'email', sortable: true },
    { key: 'department', label: 'Department', type: 'text', sortable: true },
    { key: 'position', label: 'Position', type: 'text', sortable: true },
    { key: 'hireDate', label: 'Hire Date', type: 'date', sortable: true },
    { key: 'salary', label: 'Salary', type: 'number', sortable: true },
    { key: 'status', label: 'Status', type: 'text', sortable: true },
    { key: 'performanceRating', label: 'Performance', type: 'number', sortable: true }
  ];

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const data = await recordService?.getAll();
      const formattedRecords = data?.map(record => ({
        id: record?.id,
        ...record?.data
      }));
      setRecords(formattedRecords);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRow = (rowId, checked) => {
    if (checked) {
      setSelectedRows([...selectedRows, rowId]);
    } else {
      setSelectedRows(selectedRows?.filter(id => id !== rowId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(records?.map(record => record?.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSort = (config) => {
    console.log('Sort config:', config);
  };

  const handleFilterChange = (filter) => {
    console.log('Filter change:', filter);
  };

  const handleSearch = (term) => {
    setSearchQuery(term);
  };

  const handleClearFilters = () => {
    console.log('Clear filters');
  };

  const handleBulkAction = async (action) => {
    if (action === 'delete') {
      try {
        await recordService?.bulkDelete(selectedRows);
        setRecords(records?.filter(r => !selectedRows?.includes(r?.id)));
        setSelectedRows([]);
      } catch (error) {
        console.error('Error deleting records:', error);
      }
    }
    console.log('Bulk action:', action, selectedRows);
  };

  const handleClearSelection = () => {
    setSelectedRows([]);
  };

  const handleAddRecord = () => {
    console.log('Add new record');
  };

  const handleRefresh = () => {
    console.log('Refresh data');
  };

  const handleToggleColumn = (columnKey, visible) => {
    if (visible) {
      setVisibleColumns([...visibleColumns, columnKey]);
    } else {
      setVisibleColumns(visibleColumns?.filter(key => key !== columnKey));
    }
  };

  const handleSaveView = (viewName, columns) => {
    console.log('Save view:', viewName, 'Columns:', columns);
  };

  const handleImport = (file, format) => {
    console.log('Import file:', file?.name, 'Format:', format);
  };

  const handleExport = (format) => {
    console.log('Export format:', format);
  };

  const visibleColumnData = columns?.filter(col => visibleColumns?.includes(col?.key));
  const totalPages = Math.ceil(records?.length / pageSize);

  const fieldOptions = columns?.map(col => ({
    value: col?.key,
    label: col?.label
  }));

  if (loading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <AdminSidebar isCollapsed={sidebarCollapsed} />
        <div className={`flex-1 flex items-center justify-center transition-smooth ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
          <div className="text-center">
            <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading records...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar isCollapsed={sidebarCollapsed} />
      <div className={`flex-1 flex flex-col transition-smooth ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
        <header className="bg-card border-b border-border px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-md hover:bg-muted transition-smooth"
              aria-label="Toggle sidebar"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            
            <div className="flex-1 lg:flex-none">
              <ModuleBreadcrumbs />
            </div>
            
            <UserProfileDropdown />
          </div>
        </header>

        <main className="min-h-[calc(100vh-73px)]">
          <ModuleHeader
            moduleName="Employee Records"
            recordCount={records?.length}
            onAddRecord={handleAddRecord}
            onRefresh={handleRefresh}
            lastUpdated="January 5, 2026 at 9:42 PM"
          />

          <div className="bg-card border-b border-border px-4 md:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2">
                <ViewCustomizer
                  columns={columns}
                  visibleColumns={visibleColumns}
                  onToggleColumn={handleToggleColumn}
                  onSaveView={handleSaveView}
                />
              </div>
              
              <ImportExportPanel
                onImport={handleImport}
                onExport={handleExport}
              />
            </div>
          </div>

          <FilterToolbar
            fields={fieldOptions}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onClearFilters={handleClearFilters}
            activeFiltersCount={0}
          />

          <BulkActionsBar
            selectedCount={selectedRows?.length}
            onBulkAction={handleBulkAction}
            onClearSelection={handleClearSelection}
            totalRecords={records?.length}
          />

          <DataTable
            columns={visibleColumnData}
            data={records}
            selectedRows={selectedRows}
            onSelectRow={handleSelectRow}
            onSelectAll={handleSelectAll}
          />

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalRecords={records?.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </main>
      </div>
    </div>
  );
};

export default DynamicModuleListView;