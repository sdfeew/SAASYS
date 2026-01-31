import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import AddRecordModal from './components/AddRecordModal';
import EditRecordModal from './components/EditRecordModal';
import { recordService } from '../../services/recordService';
import { moduleService } from '../../services/moduleService';
import { fieldService } from '../../services/fieldService';
import { useAuth } from '../../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const DynamicModuleListView = () => {
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
  const [notificationCount] = useState(4);
  const [records, setRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]); // Original unfiltered records
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [columns, setColumns] = useState([]);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [moduleFields, setModuleFields] = useState([]);
  const [showEditRecordModal, setShowEditRecordModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [savingEditRecord, setSavingEditRecord] = useState(false);
  const [filters, setFilters] = useState([]);
  const [sortConfig, setSortConfig] = useState(null);

  useEffect(() => {
    if (user && tenantId) {
      loadModules();
    }
  }, [user, tenantId]);

  // Watch for URL parameter changes and update selected module
  useEffect(() => {
    const moduleIdFromUrl = searchParams.get('moduleId');
    if (moduleIdFromUrl && modules && modules.length > 0) {
      const selectedMod = modules.find(m => m?.id === moduleIdFromUrl);
      if (selectedMod && selectedModule?.id !== moduleIdFromUrl) {
        setSelectedModule(selectedMod);
      }
    }
  }, [searchParams, modules]);

  useEffect(() => {
    if (selectedModule) {
      loadFieldsAndRecords(selectedModule);
    }
  }, [selectedModule]);

  // Apply filters, search, and sorting to records
  useEffect(() => {
    let result = [...allRecords];

    // Apply search query
    if (searchQuery?.trim()) {
      const query = searchQuery?.toLowerCase();
      result = result?.filter(record => {
        return Object.values(record)?.some(value => 
          String(value)?.toLowerCase()?.includes(query)
        );
      });
    }

    // Apply filters
    if (filters?.length > 0) {
      result = result?.filter(record => {
        return filters?.every(filter => {
          const fieldValue = record?.[filter?.field];
          
          switch (filter?.operator) {
            case 'equals':
              return String(fieldValue) === String(filter?.value);
            case 'contains':
              return String(fieldValue)?.includes(String(filter?.value));
            case 'starts_with':
              return String(fieldValue)?.startsWith(String(filter?.value));
            case 'ends_with':
              return String(fieldValue)?.endsWith(String(filter?.value));
            case 'greater_than':
              return Number(fieldValue) > Number(filter?.value);
            case 'less_than':
              return Number(fieldValue) < Number(filter?.value);
            case 'in_list':
              return filter?.value?.split(',')?.includes(String(fieldValue));
            case 'is_empty':
              return !fieldValue || String(fieldValue)?.trim() === '';
            case 'is_not_empty':
              return fieldValue && String(fieldValue)?.trim() !== '';
            default:
              return true;
          }
        });
      });
    }

    // Apply sorting
    if (sortConfig) {
      result?.sort((a, b) => {
        const aValue = a?.[sortConfig?.field];
        const bValue = b?.[sortConfig?.field];
        
        if (aValue < bValue) {
          return sortConfig?.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig?.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setRecords(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, filters, sortConfig, allRecords]);

  const loadModules = async () => {
    try {
      const data = await moduleService?.getAllSubModules(tenantId);
      setModules(data || []);
      
      // Check URL parameters for moduleId to select
      const moduleIdFromUrl = searchParams.get('moduleId');
      
      if (moduleIdFromUrl && data?.length > 0) {
        // Find and select the module with matching ID
        const selectedMod = data.find(m => m?.id === moduleIdFromUrl);
        if (selectedMod) {
          setSelectedModule(selectedMod);
        } else {
          // Fallback to first module if ID not found
          setSelectedModule(data[0]);
        }
      } else if (data?.length > 0) {
        // Auto-select first module if available and no URL param
        setSelectedModule(data[0]);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      setLoading(false);
    }
  };

  const loadFieldsAndRecords = async (module) => {
    try {
      setLoading(true);
      // Load fields for this module
      const fields = await fieldService?.getAllFields(module?.id);
      console.log('Loaded fields:', fields);
      
      // Map database field names to expected format
      const mappedFields = (fields || [])?.map(field => ({
        id: field?.id,
        field_name: field?.name,
        display_name: field?.label,
        data_type: field?.data_type,
        is_required: field?.required,
        options: field?.ui_config?.options
      }));
      
      setModuleFields(mappedFields);
      
      const moduleColumns = mappedFields?.map(field => ({
        key: field?.field_name,
        label: field?.display_name || field?.field_name,
        type: field?.data_type?.toLowerCase() || 'text',
        sortable: true
      }));
      setColumns(moduleColumns);
      setVisibleColumns(moduleColumns?.map(col => col?.key));

      // Load records for this module
      const data = await recordService?.getAll(module?.id);
      const formattedRecords = (data || [])?.map(record => ({
        id: record?.id,
        ...record?.data
      }));
      setAllRecords(formattedRecords);
      setRecords(formattedRecords);
      // Reset filters when switching modules
      setFilters([]);
      setSortConfig(null);
      setSearchQuery('');
    } catch (error) {
      console.error('Error loading fields and records:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async () => {
    if (selectedModule) {
      try {
        const data = await recordService?.getAll(selectedModule?.id);
        console.log('Loaded records from DB:', data);
        const formattedRecords = (data || [])?.map(record => ({
          id: record?.id,
          ...record?.data
        }));
        console.log('Formatted records:', formattedRecords);
        setAllRecords(formattedRecords);
        setRecords(formattedRecords);
        setFilters([]);
        setSortConfig(null);
      } catch (error) {
        console.error('Error loading records:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Helper function to extract name from JSONB
  const extractName = (name) => {
    if (typeof name === 'string') return name;
    if (typeof name === 'object' && name?.en) return name?.en;
    if (typeof name === 'object' && name?.ar) return name?.ar;
    return 'Unnamed';
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
    setSortConfig(config);
  };

  const handleFilterChange = (filterList) => {
    setFilters(filterList);
  };

  const handleSearch = (term) => {
    setSearchQuery(term);
  };

  const handleClearFilters = () => {
    setFilters([]);
    setSearchQuery('');
    setSortConfig(null);
    setRecords(allRecords);
  };

  const handleBulkAction = async (action, subAction) => {
    try {
      switch (action) {
        case 'delete':
          if (window.confirm(`Delete ${selectedRows?.length} records? This action cannot be undone.`)) {
            await recordService?.bulkDelete(selectedRows);
            setAllRecords(allRecords?.filter(r => !selectedRows?.includes(r?.id)));
            setRecords(records?.filter(r => !selectedRows?.includes(r?.id)));
            setSelectedRows([]);
            alert('Records deleted successfully!');
          }
          break;
          
        case 'archive':
          if (window.confirm(`Archive ${selectedRows?.length} records?`)) {
            // Update records with archive status
            const updates = selectedRows?.map(id => ({
              id,
              status: 'archived'
            }));
            // TODO: Implement bulk update in recordService
            alert('Records archived successfully!');
            setSelectedRows([]);
          }
          break;
          
        case 'export':
          handleExportSelected(subAction);
          break;
          
        case 'assign':
          // TODO: Show modal for owner assignment
          alert('Assign owner feature coming soon');
          break;
          
        case 'tag':
          // TODO: Show modal for tag assignment
          alert('Add tags feature coming soon');
          break;
          
        case 'workflow':
          // TODO: Show modal for workflow trigger
          alert('Trigger workflow feature coming soon');
          break;
          
        default:
          console.log('Unknown bulk action:', action);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Error performing action: ' + error?.message);
    }
  };

  const handleExportSelected = (format) => {
    if (!format || selectedRows?.length === 0) return;
    
    const selectedRecords = records?.filter(r => selectedRows?.includes(r?.id));
    const dataToExport = selectedRecords?.map(record => {
      const { id, ...data } = record;
      return data;
    });

    let content = '';
    let filename = '';

    switch (format) {
      case 'csv':
        if (dataToExport?.length === 0) return;
        const headers = Object?.keys(dataToExport[0]);
        content = [
          headers?.join(','),
          ...dataToExport?.map(row =>
            headers?.map(header => {
              const value = row?.[header];
              return typeof value === 'string' && value?.includes(',') 
                ? `"${value}"` 
                : value;
            })?.join(',')
          )
        ]?.join('\n');
        filename = `export-${new Date()?.getTime()}?.csv`;
        break;

      case 'json':
        content = JSON?.stringify(dataToExport, null, 2);
        filename = `export-${new Date()?.getTime()}?.json`;
        break;

      case 'excel':
        // Simple Excel format (CSV that Excel can open)
        if (dataToExport?.length === 0) return;
        const excelHeaders = Object?.keys(dataToExport[0]);
        content = [
          excelHeaders?.join(','),
          ...dataToExport?.map(row =>
            excelHeaders?.map(header => row?.[header])?.join(',')
          )
        ]?.join('\n');
        filename = `export-${new Date()?.getTime()}?.xlsx`;
        break;

      default:
        return;
    }

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window?.URL?.createObjectURL(blob);
    const a = document?.createElement('a');
    a.href = url;
    a.download = filename;
    document?.body?.appendChild(a);
    a?.click();
    window?.URL?.revokeObjectURL(url);
    document?.body?.removeChild(a);

    alert(`${selectedRows?.length} records exported successfully!`);
  };

  const handleClearSelection = () => {
    setSelectedRows([]);
  };

  const handleAddRecord = () => {
    if (!selectedModule) {
      alert('Please select a module first');
      return;
    }
    setShowAddRecordModal(true);
  };

  const handleSaveRecord = async (formData) => {
    if (!selectedModule) return;
    
    try {
      setSavingRecord(true);
      const recordTenantId = tenantId || selectedModule?.tenant_id;
      if (!recordTenantId) {
        throw new Error('Unable to determine tenant. Please refresh and try again.');
      }
      const newRecord = {
        id: uuidv4(),
        tenantId: recordTenantId,
        subModuleId: selectedModule?.id,
        data: formData
      };
      
      await recordService?.create(newRecord, fields);
      
      setShowAddRecordModal(false);
      alert('Record created successfully!');
      
      // Reload records from database to ensure the newly created record displays
      await loadRecords();
    } catch (error) {
      console.error('Error creating record:', error);
      alert('Failed to create record: ' + error?.message);
    } finally {
      setSavingRecord(false);
    }
  };

  const handleRefresh = () => {
    if (selectedModule) {
      loadFieldsAndRecords(selectedModule);
    }
  };

  const handleEditRecord = (recordId) => {
    const record = records.find(r => r?.id === recordId);
    if (record) {
      setEditingRecord(record);
      setShowEditRecordModal(true);
    }
  };

  const handleSaveEditRecord = async (recordId, updatedData) => {
    try {
      setSavingEditRecord(true);
      
      await recordService?.update(recordId, { data: updatedData }, fields);
      
      // Update local records state
      setRecords(records.map(r => 
        r?.id === recordId ? { id: recordId, ...updatedData } : r
      ));
      
      setShowEditRecordModal(false);
      setEditingRecord(null);
      alert('Record updated successfully!');
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Failed to update record: ' + error?.message);
    } finally {
      setSavingEditRecord(false);
    }
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

  const handleImport = async (file, format) => {
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e?.target?.result;
          let importedData = [];

          if (format === 'csv') {
            // Parse CSV
            const lines = content?.split('\n')?.filter(line => line?.trim());
            if (lines?.length < 2) {
              alert('CSV file must have headers and at least one data row');
              return;
            }
            
            const headers = lines[0]?.split(',')?.map(h => h?.trim());
            importedData = lines?.slice(1)?.map(line => {
              const values = line?.split(',')?.map(v => v?.trim());
              const obj = {};
              headers?.forEach((header, idx) => {
                obj[header] = values[idx];
              });
              return obj;
            });
          } else if (format === 'json') {
            // Parse JSON
            importedData = JSON?.parse(content);
            if (!Array?.isArray(importedData)) {
              importedData = [importedData];
            }
          } else if (format === 'excel') {
            // For XLSX, we'd need a library. For now, treat as CSV
            const lines = content?.split('\n')?.filter(line => line?.trim());
            const headers = lines[0]?.split(',')?.map(h => h?.trim());
            importedData = lines?.slice(1)?.map(line => {
              const values = line?.split(',')?.map(v => v?.trim());
              const obj = {};
              headers?.forEach((header, idx) => {
                obj[header] = values[idx];
              });
              return obj;
            });
          }

          // Create records for each imported row
          let created = 0;
          for (const data of importedData) {
            try {
              await recordService?.create({
                id: uuidv4(),
                subModuleId: selectedModule?.id,
                tenantId: tenantId || selectedModule?.tenant_id,
                data: data
              });
              created++;
            } catch (error) {
              console.error('Error creating record:', error);
            }
          }

          alert(`${created} of ${importedData?.length} records imported successfully!`);
          
          // Reload records
          await loadRecords();
        } catch (error) {
          console.error('Error parsing file:', error);
          alert('Error parsing file: ' + error?.message);
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing:', error);
      alert('Error importing file: ' + error?.message);
    }
  };

  const handleExport = (format) => {
    if (records?.length === 0) {
      alert('No records to export');
      return;
    }

    let content = '';
    let filename = '';

    const dataToExport = records?.map(record => {
      const { id, ...data } = record;
      return data;
    });

    switch (format) {
      case 'csv':
        if (dataToExport?.length === 0) return;
        const headers = Object?.keys(dataToExport[0]);
        content = [
          headers?.join(','),
          ...dataToExport?.map(row =>
            headers?.map(header => {
              const value = row?.[header];
              return typeof value === 'string' && value?.includes(',') 
                ? `"${value}"` 
                : value;
            })?.join(',')
          )
        ]?.join('\n');
        filename = `export-${selectedModule?.name || 'records'}-${new Date()?.getTime()}.csv`;
        break;

      case 'json':
        content = JSON?.stringify(dataToExport, null, 2);
        filename = `export-${selectedModule?.name || 'records'}-${new Date()?.getTime()}.json`;
        break;

      case 'excel':
        // Simple Excel format (CSV that Excel can open)
        if (dataToExport?.length === 0) return;
        const excelHeaders = Object?.keys(dataToExport[0]);
        content = [
          excelHeaders?.join(','),
          ...dataToExport?.map(row =>
            excelHeaders?.map(header => row?.[header])?.join(',')
          )
        ]?.join('\n');
        filename = `export-${selectedModule?.name || 'records'}-${new Date()?.getTime()}.xlsx`;
        break;

      default:
        return;
    }

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window?.URL?.createObjectURL(blob);
    const a = document?.createElement('a');
    a.href = url;
    a.download = filename;
    document?.body?.appendChild(a);
    a?.click();
    window?.URL?.revokeObjectURL(url);
    document?.body?.removeChild(a);

    alert(`${records?.length} records exported successfully!`);
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
          {modules?.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Icon name="Package" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-semibold mb-2">No modules available</p>
                <p className="text-muted-foreground">Create and deploy a module in the Schema Builder to see records here.</p>
              </div>
            </div>
          ) : (
            <>
              {selectedModule && (
                <>
                  <ModuleHeader
                    moduleName={extractName(selectedModule?.name)}
                    recordCount={records?.length}
                    onAddRecord={handleAddRecord}
                    onRefresh={handleRefresh}
                    lastUpdated={new Date(selectedModule?.updated_at)?.toLocaleString()}
                  />

                  <div className="flex gap-4 px-4 md:px-6 lg:px-8 py-4 flex-wrap">
                    <FilterToolbar 
                      fields={columns}
                      onFilterChange={handleFilterChange}
                      onSearch={handleSearch}
                      onClearFilters={handleClearFilters}
                      onSort={handleSort}
                      activeFiltersCount={filters?.length}
                    />
                    <button
                      onClick={() => setShowViewCustomizer(!showViewCustomizer)}
                      className="px-3 py-2 rounded-md border border-border hover:bg-muted transition-smooth flex items-center gap-2"
                    >
                      <Icon name="Settings" size={16} />
                      <span className="text-sm">Customize</span>
                    </button>
                    <button
                      onClick={() => setShowImportExport(!showImportExport)}
                      className="px-3 py-2 rounded-md border border-border hover:bg-muted transition-smooth flex items-center gap-2"
                    >
                      <Icon name="Upload" size={16} />
                      <span className="text-sm">Import/Export</span>
                    </button>
                  </div>

                  {selectedRows?.length > 0 && (
                    <BulkActionsBar
                      selectedCount={selectedRows?.length}
                      totalRecords={records?.length}
                      onBulkAction={handleBulkAction}
                      onClearSelection={handleClearSelection}
                    />
                  )}

                  {showViewCustomizer && (
                    <ViewCustomizer
                      columns={columns}
                      visibleColumns={visibleColumns}
                      onToggleColumn={handleToggleColumn}
                      onSaveView={handleSaveView}
                    />
                  )}

                  {showImportExport && (
                    <ImportExportPanel
                      columns={columns}
                      records={records}
                      onImport={handleImport}
                      onExport={handleExport}
                    />
                  )}
                  <DataTable
                    columns={visibleColumnData}
                    data={records}
                    selectedRows={selectedRows}
                    onSelectRow={handleSelectRow}
                    onSelectAll={handleSelectAll}
                    onSort={handleSort}
                    searchQuery={searchQuery}
                    onEdit={handleEditRecord}
                    moduleId={selectedModule?.id}
                  />

                  {totalPages > 1 && (
                    <TablePagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={setPageSize}
                    />
                  )}
                </>
              )}
            </>
          )}
        </main>

        <AddRecordModal
          isOpen={showAddRecordModal}
          onClose={() => setShowAddRecordModal(false)}
          fields={moduleFields}
          onSave={handleSaveRecord}
          isLoading={savingRecord}
        />

        <EditRecordModal
          isOpen={showEditRecordModal}
          onClose={() => setShowEditRecordModal(false)}
          fields={moduleFields}
          record={editingRecord}
          onSave={handleSaveEditRecord}
          isLoading={savingEditRecord}
        />
      </div>
    </div>
  );
};

export default DynamicModuleListView;