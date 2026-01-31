import React from 'react';
import Icon from '../AppIcon';

const StatusBadge = ({ status, size = 'md', showLabel = true }) => {
  const statusConfig = {
    active: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      dot: 'bg-green-500',
      label: 'Active'
    },
    inactive: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      dot: 'bg-gray-500',
      label: 'Inactive'
    },
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      dot: 'bg-yellow-500',
      label: 'Pending'
    },
    archived: {
      bg: 'bg-slate-100',
      text: 'text-slate-800',
      dot: 'bg-slate-500',
      label: 'Archived'
    },
    success: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      dot: 'bg-green-500',
      label: 'Success'
    },
    error: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      dot: 'bg-red-500',
      label: 'Error'
    },
    warning: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      dot: 'bg-orange-500',
      label: 'Warning'
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      dot: 'bg-blue-500',
      label: 'Info'
    }
  };

  const config = statusConfig[status] || statusConfig.info;
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div className={`inline-flex items-center gap-2 ${config.bg} ${config.text} rounded-full ${sizeClasses[size]} font-medium`}>
      <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
      {showLabel && config.label}
    </div>
  );
};

export default StatusBadge;
