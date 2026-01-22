import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const UserCard = ({ user, onViewDetails, onToggleStatus, onRoleChange }) => {
  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'user', label: 'User' },
    { value: 'viewer', label: 'Viewer' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-success bg-success/10';
      case 'inactive':
        return 'text-muted-foreground bg-muted';
      case 'suspended':
        return 'text-warning bg-warning/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const formatLastLogin = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const loginDate = new Date(date);
    const diffMs = now - loginDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return loginDate?.toLocaleDateString();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-elevation-1 hover:shadow-elevation-2 transition-smooth">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon name="User" size={24} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-foreground truncate">{user?.name}</h3>
          <p className="caption text-muted-foreground truncate">{user?.email}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium caption flex-shrink-0 ${getStatusColor(user?.status)}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          {user?.status?.charAt(0)?.toUpperCase() + user?.status?.slice(1)}
        </span>
      </div>
      <div className="space-y-3 mb-4">
        <div>
          <p className="caption text-muted-foreground mb-1">Role</p>
          <Select
            options={roleOptions}
            value={user?.role}
            onChange={(value) => onRoleChange(user?.id, value)}
            className="text-sm"
          />
        </div>
        <div>
          <p className="caption text-muted-foreground mb-1">Last Login</p>
          <p className="text-sm text-foreground">{formatLastLogin(user?.lastLogin)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(user)}
          iconName="Eye"
          iconPosition="left"
          iconSize={16}
          fullWidth
        >
          View Details
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleStatus(user?.id, user?.status)}
          iconName={user?.status === 'active' ? 'UserX' : 'UserCheck'}
          iconPosition="left"
          iconSize={16}
          fullWidth
        >
          {user?.status === 'active' ? 'Deactivate' : 'Activate'}
        </Button>
      </div>
    </div>
  );
};

export default UserCard;