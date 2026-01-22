import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ModuleConfigurationModal = ({ isOpen, onClose, onSave, module = null }) => {
  const [formData, setFormData] = useState(module || {
    name: '',
    code: '',
    description: '',
    icon: 'Folder',
    parentModule: '',
    permissions: []
  });

  const iconOptions = [
    { value: 'Folder', label: 'Folder' },
    { value: 'Users', label: 'Users' },
    { value: 'Briefcase', label: 'Briefcase' },
    { value: 'ShoppingCart', label: 'Shopping Cart' },
    { value: 'Package', label: 'Package' },
    { value: 'Truck', label: 'Truck' },
    { value: 'FileText', label: 'File Text' },
    { value: 'Database', label: 'Database' },
    { value: 'Settings', label: 'Settings' },
    { value: 'Grid3x3', label: 'Grid' }
  ];

  const parentModuleOptions = [
    { value: '', label: 'None (Top Level)' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'crm', label: 'Customer Relations' },
    { value: 'inventory', label: 'Inventory Management' },
    { value: 'logistics', label: 'Logistics' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-elevation-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="FolderPlus" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">
                {module ? 'Edit Module' : 'Create New Module'}
              </h2>
              <p className="caption text-muted-foreground">
                Configure module properties and settings
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" iconName="X" onClick={onClose} />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-custom p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Input
                label="Module Name"
                type="text"
                placeholder="e.g., Employee Records"
                value={formData?.name}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                description="Display name for the module"
                required
              />
              <Input
                label="Module Code"
                type="text"
                placeholder="e.g., employee_records"
                value={formData?.code}
                onChange={(e) => handleInputChange('code', e?.target?.value)}
                description="Unique identifier (no spaces)"
                required
              />
            </div>

            <Input
              label="Description"
              type="text"
              placeholder="Brief description of the module"
              value={formData?.description}
              onChange={(e) => handleInputChange('description', e?.target?.value)}
              description="Explain what this module is used for"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Select
                label="Icon"
                options={iconOptions}
                value={formData?.icon}
                onChange={(value) => handleInputChange('icon', value)}
                description="Visual icon for the module"
              />
              <Select
                label="Parent Module"
                options={parentModuleOptions}
                value={formData?.parentModule}
                onChange={(value) => handleInputChange('parentModule', value)}
                description="Organize under a parent module"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
              <Button type="submit" variant="default" iconName="Save" iconPosition="left">
                {module ? 'Update Module' : 'Create Module'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModuleConfigurationModal;