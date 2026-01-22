import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const UserDetailsPanel = ({ user, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name,
    email: user?.email,
    phone: user?.phone || '',
    department: user?.department || '',
    jobTitle: user?.jobTitle || ''
  });

  const [permissions, setPermissions] = useState({
    viewDashboard: true,
    createRecords: true,
    editRecords: true,
    deleteRecords: false,
    manageUsers: false,
    configureModules: false,
    viewReports: true,
    exportData: true
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'User' },
    { id: 'permissions', label: 'Permissions', icon: 'Shield' },
    { id: 'activity', label: 'Activity', icon: 'Activity' }
  ];

  const activityLog = [
    { id: 1, action: 'Logged in', timestamp: new Date(Date.now() - 3600000), ip: '192.168.1.100' },
    { id: 2, action: 'Updated customer record #1234', timestamp: new Date(Date.now() - 7200000), ip: '192.168.1.100' },
    { id: 3, action: 'Created new invoice', timestamp: new Date(Date.now() - 86400000), ip: '192.168.1.101' },
    { id: 4, action: 'Changed password', timestamp: new Date(Date.now() - 172800000), ip: '192.168.1.100' },
    { id: 5, action: 'Exported sales report', timestamp: new Date(Date.now() - 259200000), ip: '192.168.1.102' }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e?.target?.name]: e?.target?.value
    });
  };

  const handlePermissionChange = (permission, checked) => {
    setPermissions({
      ...permissions,
      [permission]: checked
    });
  };

  const handleSave = () => {
    onSave({ ...user, ...formData, permissions });
  };

  const formatTimestamp = (date) => {
    return date?.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-elevation-4 w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="User" size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-semibold text-foreground">{user?.name}</h2>
              <p className="caption text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} iconName="X" iconSize={20}>
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="border-b border-border">
          <div className="flex gap-1 px-6 overflow-x-auto scrollbar-custom">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-smooth border-b-2 flex-shrink-0 ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-custom p-6">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                value={formData?.name}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData?.email}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                name="phone"
                value={formData?.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 000-0000"
              />
              <Input
                label="Department"
                name="department"
                value={formData?.department}
                onChange={handleInputChange}
                placeholder="e.g., Sales, Engineering"
              />
              <Input
                label="Job Title"
                name="jobTitle"
                value={formData?.jobTitle}
                onChange={handleInputChange}
                placeholder="e.g., Senior Manager"
              />
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium text-foreground mb-3">Module Access</h3>
                <div className="space-y-3">
                  <Checkbox
                    label="View Dashboard"
                    description="Access to main dashboard and analytics"
                    checked={permissions?.viewDashboard}
                    onChange={(e) => handlePermissionChange('viewDashboard', e?.target?.checked)}
                  />
                  <Checkbox
                    label="View Reports"
                    description="Access to reporting and data visualization"
                    checked={permissions?.viewReports}
                    onChange={(e) => handlePermissionChange('viewReports', e?.target?.checked)}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-base font-medium text-foreground mb-3">Data Operations</h3>
                <div className="space-y-3">
                  <Checkbox
                    label="Create Records"
                    description="Ability to create new records in modules"
                    checked={permissions?.createRecords}
                    onChange={(e) => handlePermissionChange('createRecords', e?.target?.checked)}
                  />
                  <Checkbox
                    label="Edit Records"
                    description="Ability to modify existing records"
                    checked={permissions?.editRecords}
                    onChange={(e) => handlePermissionChange('editRecords', e?.target?.checked)}
                  />
                  <Checkbox
                    label="Delete Records"
                    description="Ability to permanently delete records"
                    checked={permissions?.deleteRecords}
                    onChange={(e) => handlePermissionChange('deleteRecords', e?.target?.checked)}
                  />
                  <Checkbox
                    label="Export Data"
                    description="Ability to export data to external formats"
                    checked={permissions?.exportData}
                    onChange={(e) => handlePermissionChange('exportData', e?.target?.checked)}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-base font-medium text-foreground mb-3">Administrative</h3>
                <div className="space-y-3">
                  <Checkbox
                    label="Manage Users"
                    description="Create, edit, and manage user accounts"
                    checked={permissions?.manageUsers}
                    onChange={(e) => handlePermissionChange('manageUsers', e?.target?.checked)}
                  />
                  <Checkbox
                    label="Configure Modules"
                    description="Access to schema builder and module configuration"
                    checked={permissions?.configureModules}
                    onChange={(e) => handlePermissionChange('configureModules', e?.target?.checked)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              {activityLog?.map((activity) => (
                <div key={activity?.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon name="Activity" size={20} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity?.action}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="caption text-muted-foreground">{formatTimestamp(activity?.timestamp)}</p>
                      <span className="caption text-muted-foreground">•</span>
                      <p className="caption text-muted-foreground">IP: {activity?.ip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSave} iconName="Save" iconPosition="left" iconSize={16}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPanel;