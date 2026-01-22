import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const UserTableRow = ({ user, onViewDetails, onToggleStatus, onRoleChange }) => {
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
    <tr className="border-b border-border hover:bg-muted/50 transition-smooth">
      <td className="px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="User" size={20} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
            <p className="caption text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 md:px-6 md:py-4">
        <div className="w-40">
          <Select
            options={roleOptions}
            value={user?.role}
            onChange={(value) => onRoleChange(user?.id, value)}
            className="text-sm"
          />
        </div>
      </td>
      <td className="px-4 py-3 md:px-6 md:py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium caption ${getStatusColor(user?.status)}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          {user?.status?.charAt(0)?.toUpperCase() + user?.status?.slice(1)}
        </span>
      </td>
      <td className="px-4 py-3 md:px-6 md:py-4">
        <p className="text-sm text-muted-foreground">{formatLastLogin(user?.lastLogin)}</p>
      </td>
      <td className="px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetails(user)}
            iconName="Eye"
            iconSize={16}
          >
            <span className="sr-only">View details</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleStatus(user?.id, user?.status)}
            iconName={user?.status === 'active' ? 'UserX' : 'UserCheck'}
            iconSize={16}
          >
            <span className="sr-only">Toggle status</span>
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default UserTableRow;