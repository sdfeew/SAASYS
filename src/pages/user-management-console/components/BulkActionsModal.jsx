import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActionsModal = ({ selectedUsers, onClose, onApply }) => {
  const [action, setAction] = useState('');
  const [targetRole, setTargetRole] = useState('');

  const actionOptions = [
    { value: 'activate', label: 'Activate Users', description: 'Enable selected user accounts' },
    { value: 'deactivate', label: 'Deactivate Users', description: 'Disable selected user accounts' },
    { value: 'changeRole', label: 'Change Role', description: 'Assign new role to selected users' },
    { value: 'delete', label: 'Delete Users', description: 'Permanently remove selected users' }
  ];

  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'user', label: 'User' },
    { value: 'viewer', label: 'Viewer' }
  ];

  const handleApply = () => {
    if (!action) return;
    onApply({ action, targetRole, userIds: selectedUsers?.map(u => u?.id) });
  };

  const getActionIcon = () => {
    switch (action) {
      case 'activate':
        return 'UserCheck';
      case 'deactivate':
        return 'UserX';
      case 'changeRole':
        return 'Shield';
      case 'delete':
        return 'Trash2';
      default:
        return 'Users';
    }
  };

  const isDestructive = action === 'delete';

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-elevation-4 w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Users" size={20} className="text-primary" />
            </div>
            <h2 className="text-lg font-heading font-semibold text-foreground">Bulk Actions</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} iconName="X" iconSize={20}>
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Icon name="Info" size={20} className="text-primary flex-shrink-0" />
              <p className="text-sm text-foreground">
                {selectedUsers?.length} user{selectedUsers?.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>

          <Select
            label="Select Action"
            options={actionOptions}
            value={action}
            onChange={setAction}
            placeholder="Choose an action to perform"
            required
          />

          {action === 'changeRole' && (
            <Select
              label="Target Role"
              options={roleOptions}
              value={targetRole}
              onChange={setTargetRole}
              placeholder="Select new role"
              required
            />
          )}

          {isDestructive && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Warning: Destructive Action</p>
                  <p className="caption text-destructive/80 mt-1">
                    This action cannot be undone. All user data and access will be permanently removed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'default'}
            onClick={handleApply}
            disabled={!action || (action === 'changeRole' && !targetRole)}
            iconName={getActionIcon()}
            iconPosition="left"
            iconSize={16}
          >
            Apply Action
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsModal;