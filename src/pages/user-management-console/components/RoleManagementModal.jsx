import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const RoleManagementModal = ({ onClose }) => {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Administrator',
      description: 'Full system access with all permissions',
      userCount: 3,
      permissions: {
        viewDashboard: true,
        createRecords: true,
        editRecords: true,
        deleteRecords: true,
        manageUsers: true,
        configureModules: true,
        viewReports: true,
        exportData: true
      }
    },
    {
      id: 2,
      name: 'Manager',
      description: 'Team management and reporting access',
      userCount: 8,
      permissions: {
        viewDashboard: true,
        createRecords: true,
        editRecords: true,
        deleteRecords: false,
        manageUsers: false,
        configureModules: false,
        viewReports: true,
        exportData: true
      }
    },
    {
      id: 3,
      name: 'User',
      description: 'Standard user access for daily operations',
      userCount: 24,
      permissions: {
        viewDashboard: true,
        createRecords: true,
        editRecords: true,
        deleteRecords: false,
        manageUsers: false,
        configureModules: false,
        viewReports: true,
        exportData: false
      }
    },
    {
      id: 4,
      name: 'Viewer',
      description: 'Read-only access to data and reports',
      userCount: 12,
      permissions: {
        viewDashboard: true,
        createRecords: false,
        editRecords: false,
        deleteRecords: false,
        manageUsers: false,
        configureModules: false,
        viewReports: true,
        exportData: false
      }
    }
  ]);

  const [selectedRole, setSelectedRole] = useState(roles?.[0]);
  const [isEditing, setIsEditing] = useState(false);

  const permissionLabels = {
    viewDashboard: 'View Dashboard',
    createRecords: 'Create Records',
    editRecords: 'Edit Records',
    deleteRecords: 'Delete Records',
    manageUsers: 'Manage Users',
    configureModules: 'Configure Modules',
    viewReports: 'View Reports',
    exportData: 'Export Data'
  };

  const handlePermissionChange = (permission, checked) => {
    setSelectedRole({
      ...selectedRole,
      permissions: {
        ...selectedRole?.permissions,
        [permission]: checked
      }
    });
  };

  const handleSaveRole = () => {
    setRoles(roles?.map(role => role?.id === selectedRole?.id ? selectedRole : role));
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-elevation-4 w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Shield" size={20} className="text-primary" />
            </div>
            <h2 className="text-lg font-heading font-semibold text-foreground">Role Management</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} iconName="X" iconSize={20}>
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border overflow-y-auto scrollbar-custom">
            <div className="p-4">
              <Button
                variant="outline"
                fullWidth
                iconName="Plus"
                iconPosition="left"
                iconSize={16}
                className="mb-4"
              >
                Create New Role
              </Button>
              <div className="space-y-2">
                {roles?.map((role) => (
                  <button
                    key={role?.id}
                    onClick={() => {
                      setSelectedRole(role);
                      setIsEditing(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-smooth ${
                      selectedRole?.id === role?.id
                        ? 'bg-primary/10 border border-primary' :'bg-muted/50 border border-transparent hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground">{role?.name}</p>
                      <span className="caption text-muted-foreground">{role?.userCount} users</span>
                    </div>
                    <p className="caption text-muted-foreground line-clamp-2">{role?.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-custom p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-heading font-semibold text-foreground">{selectedRole?.name}</h3>
                <p className="caption text-muted-foreground mt-1">{selectedRole?.description}</p>
              </div>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  iconName="Edit"
                  iconPosition="left"
                  iconSize={16}
                >
                  Edit Role
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRole(roles?.find(r => r?.id === selectedRole?.id));
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveRole}
                    iconName="Save"
                    iconPosition="left"
                    iconSize={16}
                  >
                    Save
                  </Button>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="space-y-4 mb-6">
                <Input
                  label="Role Name"
                  value={selectedRole?.name}
                  onChange={(e) => setSelectedRole({ ...selectedRole, name: e?.target?.value })}
                />
                <Input
                  label="Description"
                  value={selectedRole?.description}
                  onChange={(e) => setSelectedRole({ ...selectedRole, description: e?.target?.value })}
                />
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h4 className="text-base font-medium text-foreground mb-3">Module Access</h4>
                <div className="space-y-3">
                  <Checkbox
                    label={permissionLabels?.viewDashboard}
                    description="Access to main dashboard and analytics"
                    checked={selectedRole?.permissions?.viewDashboard}
                    onChange={(e) => handlePermissionChange('viewDashboard', e?.target?.checked)}
                    disabled={!isEditing}
                  />
                  <Checkbox
                    label={permissionLabels?.viewReports}
                    description="Access to reporting and data visualization"
                    checked={selectedRole?.permissions?.viewReports}
                    onChange={(e) => handlePermissionChange('viewReports', e?.target?.checked)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-base font-medium text-foreground mb-3">Data Operations</h4>
                <div className="space-y-3">
                  <Checkbox
                    label={permissionLabels?.createRecords}
                    description="Ability to create new records in modules"
                    checked={selectedRole?.permissions?.createRecords}
                    onChange={(e) => handlePermissionChange('createRecords', e?.target?.checked)}
                    disabled={!isEditing}
                  />
                  <Checkbox
                    label={permissionLabels?.editRecords}
                    description="Ability to modify existing records"
                    checked={selectedRole?.permissions?.editRecords}
                    onChange={(e) => handlePermissionChange('editRecords', e?.target?.checked)}
                    disabled={!isEditing}
                  />
                  <Checkbox
                    label={permissionLabels?.deleteRecords}
                    description="Ability to permanently delete records"
                    checked={selectedRole?.permissions?.deleteRecords}
                    onChange={(e) => handlePermissionChange('deleteRecords', e?.target?.checked)}
                    disabled={!isEditing}
                  />
                  <Checkbox
                    label={permissionLabels?.exportData}
                    description="Ability to export data to external formats"
                    checked={selectedRole?.permissions?.exportData}
                    onChange={(e) => handlePermissionChange('exportData', e?.target?.checked)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-base font-medium text-foreground mb-3">Administrative</h4>
                <div className="space-y-3">
                  <Checkbox
                    label={permissionLabels?.manageUsers}
                    description="Create, edit, and manage user accounts"
                    checked={selectedRole?.permissions?.manageUsers}
                    onChange={(e) => handlePermissionChange('manageUsers', e?.target?.checked)}
                    disabled={!isEditing}
                  />
                  <Checkbox
                    label={permissionLabels?.configureModules}
                    description="Access to schema builder and module configuration"
                    checked={selectedRole?.permissions?.configureModules}
                    onChange={(e) => handlePermissionChange('configureModules', e?.target?.checked)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagementModal;