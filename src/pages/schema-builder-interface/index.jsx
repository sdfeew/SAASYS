import React, { useState } from 'react';
import AdminSidebar from '../../components/ui/AdminSidebar';
import ModuleBreadcrumbs from '../../components/ui/ModuleBreadcrumbs';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import NotificationBadge from '../../components/ui/NotificationBadge';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ModuleTreePanel from './components/ModuleTreePanel';
import FieldConfigurationForm from './components/FieldConfigurationForm';
import FieldListManager from './components/FieldListManager';
import PreviewPanel from './components/PreviewPanel';
import ModuleConfigurationModal from './components/ModuleConfigurationModal';
import DeploymentConfirmationModal from './components/DeploymentConfirmationModal';

const SchemaBuilderInterface = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isFieldFormOpen, setIsFieldFormOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const [modules, setModules] = useState([
    {
      id: 'hr',
      name: 'Human Resources',
      icon: 'Users',
      subModules: [
        { id: 'hr-employees', name: 'Employees', icon: 'User', fieldCount: 12 },
        { id: 'hr-attendance', name: 'Attendance', icon: 'Calendar', fieldCount: 8 },
        { id: 'hr-payroll', name: 'Payroll', icon: 'DollarSign', fieldCount: 15 }
      ]
    },
    {
      id: 'crm',
      name: 'Customer Relations',
      icon: 'Briefcase',
      subModules: [
        { id: 'crm-contacts', name: 'Contacts', icon: 'UserCircle', fieldCount: 10 },
        { id: 'crm-deals', name: 'Deals', icon: 'TrendingUp', fieldCount: 14 },
        { id: 'crm-activities', name: 'Activities', icon: 'Activity', fieldCount: 7 }
      ]
    },
    {
      id: 'inventory',
      name: 'Inventory Management',
      icon: 'Package',
      subModules: [
        { id: 'inv-products', name: 'Products', icon: 'Box', fieldCount: 18 },
        { id: 'inv-stock', name: 'Stock Levels', icon: 'BarChart3', fieldCount: 9 }
      ]
    },
    {
      id: 'logistics',
      name: 'Logistics',
      icon: 'Truck',
      subModules: [
        { id: 'log-shipments', name: 'Shipments', icon: 'Package', fieldCount: 11 }
      ]
    }
  ]);

  const [selectedModule, setSelectedModule] = useState(null);
  const [fields, setFields] = useState([
    {
      id: 'field-1',
      name: 'employee_id',
      label: 'Employee ID',
      type: 'text',
      required: true,
      unique: true,
      placeholder: 'Enter employee ID',
      helpText: 'Unique identifier for the employee',
      validation: { pattern: '^EMP[0-9]{4}$' }
    },
    {
      id: 'field-2',
      name: 'full_name',
      label: 'Full Name',
      type: 'text',
      required: true,
      unique: false,
      placeholder: 'Enter full name',
      helpText: 'Employee\'s complete legal name',
      validation: { minLength: '3', maxLength: '100' }
    },
    {
      id: 'field-3',
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      unique: true,
      placeholder: 'employee@company.com',
      helpText: 'Official company email address',
      validation: {}
    },
    {
      id: 'field-4',
      name: 'department',
      label: 'Department',
      type: 'select',
      required: true,
      unique: false,
      placeholder: 'Select department',
      helpText: 'Employee\'s assigned department',
      validation: {}
    },
    {
      id: 'field-5',
      name: 'salary',
      label: 'Annual Salary',
      type: 'currency',
      required: false,
      unique: false,
      placeholder: 'Enter salary amount',
      helpText: 'Annual compensation in USD',
      validation: { min: '0', max: '1000000' }
    },
    {
      id: 'field-6',
      name: 'hire_date',
      label: 'Hire Date',
      type: 'date',
      required: true,
      unique: false,
      placeholder: 'Select hire date',
      helpText: 'Date when employee joined the company',
      validation: {}
    },
    {
      id: 'field-7',
      name: 'is_active',
      label: 'Active Status',
      type: 'boolean',
      required: false,
      unique: false,
      helpText: 'Whether the employee is currently active',
      validation: {}
    }
  ]);

  const handleSelectModule = (module) => {
    setSelectedModule(module);
    setIsFieldFormOpen(false);
    setEditingField(null);
  };

  const handleAddModule = () => {
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = (moduleData) => {
    console.log('Saving module:', moduleData);
    setIsModuleModalOpen(false);
  };

  const handleAddField = () => {
    setEditingField(null);
    setIsFieldFormOpen(true);
  };

  const handleEditField = (field) => {
    setEditingField(field);
    setIsFieldFormOpen(true);
  };

  const handleSaveField = (fieldData) => {
    if (editingField) {
      setFields(fields?.map(f => f?.id === editingField?.id ? { ...fieldData, id: f?.id } : f));
    } else {
      setFields([...fields, { ...fieldData, id: `field-${Date.now()}` }]);
    }
    setIsFieldFormOpen(false);
    setEditingField(null);
  };

  const handleDeleteField = (fieldId) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      setFields(fields?.filter(f => f?.id !== fieldId));
    }
  };

  const handleReorderFields = (newFields) => {
    setFields(newFields);
  };

  const handleDeploy = () => {
    setIsDeployModalOpen(true);
  };

  const handleConfirmDeploy = () => {
    console.log('Deploying module configuration...');
    setIsDeployModalOpen(false);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all changes? This action cannot be undone.')) {
      setFields([]);
      setIsFieldFormOpen(false);
      setEditingField(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar isCollapsed={isSidebarCollapsed} />
      <div className={`flex-1 flex flex-col transition-smooth ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
        <header className="sticky top-0 z-30 bg-card border-b border-border shadow-elevation-1">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                iconName={isSidebarCollapsed ? 'PanelLeftOpen' : 'PanelLeftClose'}
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex"
                aria-label="Toggle sidebar"
              />
              <div>
                <h1 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
                  Schema Builder
                </h1>
                <p className="caption text-muted-foreground hidden sm:block">
                  Create and configure custom modules and fields
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-muted rounded-md transition-smooth">
                <Icon name="Bell" size={20} className="text-foreground" />
                <NotificationBadge count={3} className="absolute -top-1 -right-1" />
              </button>
              <UserProfileDropdown />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col lg:flex-row">
            <div className="hidden lg:block w-64 flex-shrink-0">
              <ModuleTreePanel
                modules={modules}
                selectedModule={selectedModule}
                onSelectModule={handleSelectModule}
                onAddModule={handleAddModule}
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
                          Configure fields and validation rules
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-1">
                          Select a Module
                        </h2>
                        <p className="caption text-muted-foreground">
                          Choose a module from the left panel to start building
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
                        variant="outline"
                        size="sm"
                        iconName="RotateCcw"
                        onClick={handleReset}
                      >
                        Reset
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        iconName="Rocket"
                        iconPosition="left"
                        onClick={handleDeploy}
                      >
                        Deploy
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex">
                <div className={`flex-1 overflow-y-auto scrollbar-custom p-4 md:p-6 ${showPreview ? 'lg:w-1/2' : 'w-full'}`}>
                  {selectedModule ? (
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
                          />
                        </div>
                      ) : (
                        <FieldListManager
                          fields={fields}
                          onEditField={handleEditField}
                          onDeleteField={handleDeleteField}
                          onReorderFields={handleReorderFields}
                          onAddField={handleAddField}
                        />
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
                        Select a module from the navigation panel to start configuring fields and validation rules.
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
        </main>
      </div>
      <ModuleConfigurationModal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        onSave={handleSaveModule}
      />
      <DeploymentConfirmationModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onConfirm={handleConfirmDeploy}
        module={selectedModule}
        fieldCount={fields?.length}
      />
    </div>
  );
};

export default SchemaBuilderInterface;