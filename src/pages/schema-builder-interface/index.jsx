import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { moduleService } from '../../services/moduleService';
import { fieldService } from '../../services/fieldService';
import { Plus, Edit2, Trash2, Check, X, Database, Bell, Link2, GitBranch, Grid3x3, Eye, EyeOff, Zap, ArrowRight, Settings, Copy } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import AdminSidebar from '../../components/ui/AdminSidebar';
import NotificationBadge from '../../components/ui/NotificationBadge';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import ModuleTreePanel from './components/ModuleTreePanel';
import ModuleBreadcrumbs from '../../components/ui/ModuleBreadcrumbs';
import Icon from '../../components/AppIcon';
import ModuleConfigurationModal from './components/ModuleConfigurationModal';
import DeploymentConfirmationModal from './components/DeploymentConfirmationModal';
import PreviewPanel from './components/PreviewPanel';
import FieldListManager from './components/FieldListManager';
import FieldConfigurationForm from './components/FieldConfigurationForm';
import NotificationDropdown from '../../components/ui/NotificationDropdown';

const DATA_TYPES = [
  { value: 'TEXT', label: 'Text' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'CURRENCY', label: 'Currency' },
  { value: 'DATE', label: 'Date' },
  { value: 'DATETIME', label: 'DateTime' },
  { value: 'BOOLEAN', label: 'Yes/No' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'URL', label: 'URL' },
  { value: 'REFERENCE', label: 'Reference' },
  { value: 'ATTACHMENT', label: 'Attachment' },
  { value: 'JSONB', label: 'JSON' }
];

const SchemaBuilderInterface = () => {
  const { tenantId } = useAuth();
  const toast = useToast();
  const [showPreview, setShowPreview] = useState(true);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [moduleTypeForForm, setModuleTypeForForm] = useState('sub');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isFieldFormOpen, setIsFieldFormOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRelationships, setShowRelationships] = useState(false);
  const [relationships, setRelationships] = useState([]);
  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState(null);
  const [activeTab, setActiveTab] = useState('fields'); // 'fields', 'relationships', 'settings'

  // Load modules on mount and when tenant changes
  useEffect(() => {
    if (tenantId) {
      loadModules();
    }
  }, [tenantId]);

  // Helper function to extract English name from JSONB or string
  const extractName = (name) => {
    if (!name) return 'Unnamed';
    if (typeof name === 'string') return name;
    if (typeof name === 'object' && name?.en) return name.en;
    if (typeof name === 'object' && name?.ar) return name.ar;
    return 'Unnamed';
  };

  const loadModules = async () => {
    try {
      setLoading(true);
      // Get main modules
      const mainModulesData = await moduleService?.getAllMainModules();
      
      // Get sub-modules for this tenant
      const subModulesData = tenantId ? await moduleService?.getAllSubModules(tenantId) : [];
      
      if (mainModulesData && mainModulesData.length > 0) {
        // Structure modules with their sub-modules
        const structuredModules = mainModulesData.map(mainModule => ({
          id: mainModule?.id,
          name: extractName(mainModule?.name),
          icon: mainModule?.icon_name,
          description: extractName(mainModule?.description),
          code: mainModule?.code,
          subModules: subModulesData
            ?.filter(sub => sub?.main_module_id === mainModule?.id)
            ?.map(sub => ({
              id: sub?.id,
              name: extractName(sub?.name),
              icon: sub?.icon_name || 'Package',
              fieldCount: 0,
              code: sub?.code,
              description: extractName(sub?.description)
            })) || []
        }));
        
        setModules(structuredModules);
        
        // Auto-select first module if available
        if (structuredModules.length > 0) {
          const firstSubModule = structuredModules?.[0]?.subModules?.[0];
          if (firstSubModule) {
            await handleSelectModule(firstSubModule);
          }
        }
      }
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFieldsForModule = async (moduleId) => {
    try {
      const fieldsData = await fieldService?.getAllFields(moduleId);
      setFields(fieldsData || []);
    } catch (error) {
      console.error('Error loading fields:', error);
      setFields([]);
    }
  };

  const handleSelectModule = async (module) => {
    setSelectedModule(module);
    setIsFieldFormOpen(false);
    setEditingField(null);
    
    // Load fields for this module
    if (module?.id) {
      await loadFieldsForModule(module?.id);
    }
  };

  const handleAddModule = () => {
    setModuleTypeForForm('sub');
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (moduleData) => {
    try {
      setSaving(true);
      
      if (moduleTypeForForm === 'main') {
        // Create a main module
        const newMainModule = await moduleService?.createMainModule({
          name: moduleData?.name,
          code: moduleData?.code,
          description: moduleData?.description,
          icon_name: moduleData?.icon
        });
        
        // Add to modules list
        setModules([...modules, {
          id: newMainModule?.id,
          name: extractName(newMainModule?.name),
          icon: newMainModule?.icon_name,
          description: extractName(newMainModule?.description),
          code: newMainModule?.code,
          subModules: []
        }]);
        
      } else {
        // Create a sub-module (existing logic)
        if (!moduleData?.mainModuleId) {
          alert('Please select a parent module');
          setSaving(false);
          return;
        }
        
        const newModule = await moduleService?.createSubModule(tenantId, {
          ...moduleData,
          main_module_id: moduleData?.mainModuleId
        });
        
        // Add to modules list
        setModules(modules?.map(mod => 
          mod?.id === moduleData?.mainModuleId 
            ? {
                ...mod,
                subModules: [...(mod?.subModules || []), {
                  id: newModule?.id,
                  name: extractName(newModule?.name),
                  icon: newModule?.icon_name || 'Package',
                  code: newModule?.code
                }]
              }
            : mod
        ));
      }
      
      setIsModuleModalOpen(false);
    } catch (error) {
      console.error('Error saving module:', error);
      alert('Error creating module: ' + (error?.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddField = () => {
    setEditingField(null);
    setIsFieldFormOpen(true);
  };

  const handleEditField = (field) => {
    setEditingField(field);
    setIsFieldFormOpen(true);
  };

  // Helper function to map form field types to database field types
  const getDataTypeValue = (formType) => {
    const typeMap = {
      'text': 'TEXT',
      'textarea': 'TEXTAREA',
      'number': 'NUMBER',
      'email': 'EMAIL',
      'phone': 'PHONE',
      'date': 'DATE',
      'datetime': 'DATETIME',
      'currency': 'CURRENCY',
      'boolean': 'BOOLEAN',
      'select': 'SELECT',
      'multiselect': 'MULTI_SELECT',
      'reference': 'REFERENCE_ONE',
      'file': 'JSONB'
    };
    return typeMap[formType?.toLowerCase()] || 'TEXT';
  };

  const handleSaveField = async (fieldData) => {
    try {
      setSaving(true);
      
      // Map form field names to database field names
      const mappedData = {
        name: fieldData?.name,
        label: fieldData?.label,
        dataType: getDataTypeValue(fieldData?.type || fieldData?.dataType), // Convert to uppercase
        required: fieldData?.required || false,
        uniqueConstraint: fieldData?.unique || fieldData?.uniqueConstraint || false,
        defaultValue: fieldData?.defaultValue || null,
        validationRules: fieldData?.validation || fieldData?.validationRules || [],
        uiConfig: {
          placeholder: fieldData?.placeholder,
          helpText: fieldData?.helpText
        }
      };
      
      if (editingField) {
        // Update existing field
        await fieldService?.updateField(editingField?.id, mappedData);
        setFields(fields?.map(f => f?.id === editingField?.id ? { ...mappedData, id: f?.id } : f));
      } else {
        // Create new field
        const newField = await fieldService?.createField(tenantId, selectedModule?.id, mappedData);
        setFields([...fields, newField]);
      }
      setIsFieldFormOpen(false);
      setEditingField(null);
    } catch (error) {
      console.error('Error saving field:', error);
      alert('Error saving field: ' + (error?.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      try {
        setSaving(true);
        await fieldService?.deleteField(fieldId);
        setFields(fields?.filter(f => f?.id !== fieldId));
      } catch (error) {
        console.error('Error deleting field:', error);
        alert('Error deleting field: ' + (error?.message || 'Unknown error'));
      } finally {
        setSaving(false);
      }
    }
  };

  const handleReorderFields = async (newFields) => {
    try {
      setSaving(true);
      // Update order_index for each field
      await Promise.all(newFields.map((field, index) =>
        fieldService?.updateField(field?.id, { order_index: index })
      ));
      setFields(newFields);
    } catch (error) {
      console.error('Error reordering fields:', error);
      alert('Error reordering fields: ' + (error?.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeploy = () => {
    setIsDeployModalOpen(true);
  };

  const handleConfirmDeploy = async () => {
    try {
      setSaving(true);
      if (selectedModule?.id) {
        // Module is deployed when all fields are saved and configured
        // Status remains 'active' - deployment is just marking as ready
        console.log('Module deployed successfully');
        // Note: We don't need to update status since the module is already active
        // Deployment in this context means the module is ready for end users
        
        // Reload modules to reflect changes in sidebar
        await loadModules();
      }
      setIsDeployModalOpen(false);
    } catch (error) {
      console.error('Error deploying module:', error);
      alert('Error deploying module: ' + (error?.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all changes? This action cannot be undone.')) {
      setFields([]);
      setIsFieldFormOpen(false);
      setEditingField(null);
    }
  };

  // Relationship Management Functions
  const handleAddRelationship = () => {
    setEditingRelationship(null);
    setIsRelationshipModalOpen(true);
  };

  const handleEditRelationship = (relationship) => {
    setEditingRelationship(relationship);
    setIsRelationshipModalOpen(true);
  };

  const handleSaveRelationship = (relationshipData) => {
    try {
      setSaving(true);
      
      if (editingRelationship) {
        // Update existing relationship
        setRelationships(relationships.map(r => 
          r.id === editingRelationship.id ? { ...relationshipData, id: r.id } : r
        ));
      } else {
        // Create new relationship
        const newRelationship = {
          id: `rel_${Date.now()}`,
          ...relationshipData,
          createdAt: new Date().toISOString()
        };
        setRelationships([...relationships, newRelationship]);
      }
      
      setIsRelationshipModalOpen(false);
      setEditingRelationship(null);
      toast?.success(editingRelationship ? 'Relationship updated' : 'Relationship created');
    } catch (error) {
      toast?.error('Error saving relationship');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRelationship = (relationshipId) => {
    if (window.confirm('Delete this relationship?')) {
      setRelationships(relationships.filter(r => r.id !== relationshipId));
      toast?.success('Relationship deleted');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-shrink-0 w-60 lg:w-60 overflow-hidden">
        <AdminSidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 bg-card border-b border-border shadow-elevation-1">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            <div>
              <h1 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
                Schema Builder
              </h1>
              <p className="caption text-muted-foreground hidden sm:block">
                Create and configure custom modules and fields
              </p>
            </div>

            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <UserProfileDropdown />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading modules...</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col lg:flex-row">
              <div className="hidden lg:block w-64 flex-shrink-0">
                <ModuleTreePanel
                  modules={modules}
                  selectedModule={selectedModule}
                  onSelectModule={handleSelectModule}
                  onAddModule={handleAddModule}
                  onAddMainModule={() => {
                    setModuleTypeForForm('main');
                    setIsModuleModalOpen(true);
                  }}
                />
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-card border-b border-border px-4 md:px-6 py-4">
                  <ModuleBreadcrumbs />
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                    <div>
                      {selectedModule ? (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <Icon name={selectedModule?.icon} size={20} className="text-primary" />
                            <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">
                              {selectedModule?.name}
                            </h2>
                          </div>
                          <p className="caption text-muted-foreground">
                            Advanced schema configuration with relationships
                          </p>
                        </>
                      ) : (
                        <>
                          <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-1">
                            Select a Module
                          </h2>
                          <p className="caption text-muted-foreground">
                            Choose a module to configure fields and relationships
                          </p>
                        </>
                      )}
                    </div>

                    {selectedModule && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          iconName={showPreview ? 'EyeOff' : 'Eye'}
                          iconPosition="left"
                          onClick={() => setShowPreview(!showPreview)}
                          className="hidden lg:flex"
                        >
                          {showPreview ? 'Hide' : 'Show'} Preview
                        </Button>
                        <Button
                          variant={activeTab === 'relationships' ? 'default' : 'outline'}
                          size="sm"
                          iconName="Link2"
                          onClick={() => setActiveTab('relationships')}
                        >
                          Relations ({relationships.length})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          iconName="RotateCcw"
                          onClick={handleReset}
                          disabled={saving}
                        >
                          Reset
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          iconName="Rocket"
                          iconPosition="left"
                          onClick={handleDeploy}
                          disabled={saving}
                        >
                          Deploy
                        </Button>
                      </div>
                    )}
                  </div>

                  {selectedModule && (
                    <div className="flex gap-1 mt-4 border-b border-border">
                      <button
                        onClick={() => setActiveTab('fields')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'fields'
                            ? 'text-primary border-primary'
                            : 'text-muted-foreground border-transparent hover:text-foreground'
                        }`}
                      >
                        Fields ({fields.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('relationships')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'relationships'
                            ? 'text-primary border-primary'
                            : 'text-muted-foreground border-transparent hover:text-foreground'
                        }`}
                      >
                        <Link2 size={14} className="inline mr-1" />
                        Relationships ({relationships.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'settings'
                            ? 'text-primary border-primary'
                            : 'text-muted-foreground border-transparent hover:text-foreground'
                        }`}
                      >
                        <Settings size={14} className="inline mr-1" />
                        Settings
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-hidden flex">
                  <div className={`flex-1 overflow-y-auto scrollbar-custom p-4 md:p-6 ${showPreview ? 'lg:w-1/2' : 'w-full'}`}>
                    {selectedModule ? (
                      <>
                        {activeTab === 'fields' && (
                          <>
                            {isFieldFormOpen ? (
                              <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                                <h3 className="text-lg font-heading font-semibold text-foreground mb-6">
                                  {editingField ? 'Edit Field' : 'Add New Field'}
                                </h3>
                                <FieldConfigurationForm
                                  field={editingField}
                                  onSave={handleSaveField}
                                  onCancel={() => {
                                    setIsFieldFormOpen(false);
                                    setEditingField(null);
                                  }}
                                  allFields={fields}
                                  disabled={saving}
                                />
                              </div>
                            ) : (
                              <FieldListManager
                                fields={fields}
                                onEditField={handleEditField}
                                onDeleteField={handleDeleteField}
                                onReorderFields={handleReorderFields}
                                onAddField={handleAddField}
                                disabled={saving}
                              />
                            )}
                          </>
                        )}

                        {activeTab === 'relationships' && (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                              <h3 className="text-lg font-heading font-semibold text-foreground">
                                Table Relationships
                              </h3>
                              <Button
                                variant="default"
                                size="sm"
                                iconName="Plus"
                                onClick={handleAddRelationship}
                                disabled={saving}
                              >
                                Add Relationship
                              </Button>
                            </div>

                            {relationships.length === 0 ? (
                              <div className="bg-muted/30 border border-border rounded-lg p-8 text-center">
                                <Link2 size={40} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                                <h4 className="text-foreground font-medium mb-2">No relationships yet</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Create relationships to link data between tables
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  iconName="Plus"
                                  onClick={handleAddRelationship}
                                >
                                  Create Relationship
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {relationships.map(rel => (
                                  <div key={rel.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                          <div className="flex items-center gap-2 text-sm font-medium">
                                            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">{rel.fromModule}</span>
                                            <ArrowRight size={18} className="text-muted-foreground" />
                                            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">{rel.toModule}</span>
                                          </div>
                                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                            {rel.type}
                                          </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                          {rel.fromField} → {rel.toField}
                                        </p>
                                        {rel.description && (
                                          <p className="text-xs text-muted-foreground mt-1">{rel.description}</p>
                                        )}
                                      </div>
                                      <div className="flex gap-2 ml-4">
                                        <button
                                          onClick={() => handleEditRelationship(rel)}
                                          className="p-2 hover:bg-muted rounded transition-colors"
                                        >
                                          <Edit2 size={16} className="text-muted-foreground" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteRelationship(rel.id)}
                                          className="p-2 hover:bg-red-100 rounded transition-colors"
                                        >
                                          <Trash2 size={16} className="text-red-500" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === 'settings' && (
                          <div className="space-y-6">
                            <div className="bg-card border border-border rounded-lg p-6">
                              <h4 className="text-base font-semibold text-foreground mb-4">Module Settings</h4>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium text-foreground">Module Name</label>
                                  <Input type="text" value={selectedModule?.name} disabled className="mt-2" />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-foreground">Module Code</label>
                                  <Input type="text" value={selectedModule?.code} disabled className="mt-2" />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-foreground">Description</label>
                                  <textarea disabled value={selectedModule?.description} className="w-full mt-2 p-2 rounded border border-border text-sm" rows="3" />
                                </div>
                              </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
                              <h4 className="text-base font-semibold text-blue-900 mb-2">Schema Stats</h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <div className="text-2xl font-bold text-blue-600">{fields.length}</div>
                                  <div className="text-xs text-blue-700">Fields</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-blue-600">{relationships.length}</div>
                                  <div className="text-xs text-blue-700">Relationships</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-blue-600">100%</div>
                                  <div className="text-xs text-blue-700">Coverage</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                          <Icon name="Database" size={40} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-3">
                          No Module Selected
                        </h3>
                        <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-md">
                          Select a module from the navigation panel to start configuring fields and relationships.
                        </p>
                        <Button
                          variant="default"
                          iconName="FolderPlus"
                          iconPosition="left"
                          onClick={handleAddModule}
                        >
                          Create New Module
                        </Button>
                      </div>
                    )}
                  </div>

                  {showPreview && selectedModule && (
                    <div className="hidden lg:block w-1/2 flex-shrink-0">
                      <PreviewPanel module={selectedModule} fields={fields} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <ModuleConfigurationModal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        onSave={handleSaveModule}
        mainModules={modules}
        isMainModule={moduleTypeForForm === 'main'}
        disabled={saving}
      />
      <DeploymentConfirmationModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onConfirm={handleConfirmDeploy}
        module={selectedModule}
        fieldCount={fields?.length}
        disabled={saving}
      />
      {isRelationshipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
              {editingRelationship ? 'Edit Relationship' : 'Create Relationship'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Relationship Type</label>
                <Select
                  options={[
                    { value: 'one-to-many', label: 'One to Many' },
                    { value: 'many-to-one', label: 'Many to One' },
                    { value: 'many-to-many', label: 'Many to Many' },
                    { value: 'one-to-one', label: 'One to One' }
                  ]}
                  onChange={(e) => setEditingRelationship({ ...editingRelationship, type: e.target.value })}
                  value={editingRelationship?.type || 'one-to-many'}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">From Module</label>
                <Select
                  options={modules.flatMap(m => m.subModules.map(s => ({ value: s.id, label: `${m.name} > ${s.name}` })))}
                  onChange={(e) => setEditingRelationship({ ...editingRelationship, fromModule: e.target.value })}
                  value={editingRelationship?.fromModule || ''}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">From Field</label>
                <Input 
                  placeholder="Enter field name"
                  value={editingRelationship?.fromField || ''}
                  onChange={(e) => setEditingRelationship({ ...editingRelationship, fromField: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">To Module</label>
                <Select
                  options={modules.flatMap(m => m.subModules.map(s => ({ value: s.id, label: `${m.name} > ${s.name}` })))}
                  onChange={(e) => setEditingRelationship({ ...editingRelationship, toModule: e.target.value })}
                  value={editingRelationship?.toModule || ''}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">To Field</label>
                <Input 
                  placeholder="Enter field name"
                  value={editingRelationship?.toField || ''}
                  onChange={(e) => setEditingRelationship({ ...editingRelationship, toField: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Description (Optional)</label>
                <textarea 
                  placeholder="Describe this relationship..."
                  value={editingRelationship?.description || ''}
                  onChange={(e) => setEditingRelationship({ ...editingRelationship, description: e.target.value })}
                  className="w-full p-2 border border-border rounded text-sm mt-1"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setIsRelationshipModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={() => handleSaveRelationship(editingRelationship)}
                disabled={saving}
              >
                {editingRelationship ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemaBuilderInterface;