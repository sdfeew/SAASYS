import React from 'react';

const NotificationBadge = ({ count = 0, variant = 'default', className = '' }) => {
  if (count <= 0) {
    return null;
  }

  const displayCount = count > 99 ? '99+' : count;

  const variantStyles = {
    default: 'bg-primary text-primary-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    error: 'bg-error text-error-foreground',
  };

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium caption ${
        variantStyles?.[variant] || variantStyles?.default
      } ${className}`}
      aria-label={`${count} notifications`}
    >
      {displayCount}
    </span>
  );
};

export default NotificationBadge;