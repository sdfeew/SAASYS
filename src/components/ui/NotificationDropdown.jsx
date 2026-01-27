import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import Icon from '../AppIcon';
import Button from './Button';

const NotificationDropdown = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loadAllNotifications } = useNotifications(user?.id);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event?.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      // Load all notifications when opening
      loadAllNotifications();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, loadAllNotifications]);

  const getNotificationIcon = (type) => {
    const iconMap = {
      'success': 'CheckCircle2',
      'error': 'AlertCircle',
      'warning': 'AlertTriangle',
      'info': 'Info',
      'system': 'Bell'
    };
    return iconMap[type] || 'Bell';
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      'success': 'text-green-500',
      'error': 'text-red-500',
      'warning': 'text-yellow-500',
      'info': 'text-blue-500',
      'system': 'text-slate-500'
    };
    return colorMap[type] || 'text-slate-500';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-muted rounded-md transition-smooth"
        aria-expanded={isOpen}
        aria-label={`Notifications - ${unreadCount} unread`}
      >
        <Icon name="Bell" size={20} className="text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs font-semibold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-popover border border-border rounded-lg shadow-elevation-3 z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto scrollbar-custom flex-1">
            {notifications?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                <Icon name="Bell" size={32} className="text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications?.map((notification, index) => (
                <div
                  key={notification?.id || index}
                  className={`p-4 border-b border-border hover:bg-muted/50 transition-smooth cursor-pointer last:border-b-0 ${
                    !notification?.is_read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => {
                    if (!notification?.is_read) {
                      markAsRead(notification?.id);
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 mt-1 ${getNotificationColor(notification?.type)}`}>
                      <Icon name={getNotificationIcon(notification?.type)} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">
                        {notification?.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification?.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {new Date(notification?.created_at).toLocaleDateString()} {' '}
                        {new Date(notification?.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification?.id);
                      }}
                      className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-smooth"
                      aria-label="Delete notification"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications?.length > 0 && (
            <div className="p-4 border-t border-border bg-muted/50">
              <a href="/notifications" className="text-sm font-medium text-primary hover:underline">
                View all notifications →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
