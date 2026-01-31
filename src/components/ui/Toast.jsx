import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const Toast = ({ notifications, onClose }) => {
  return (
    <div className="fixed bottom-4 right-4 space-y-3 z-50">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg text-white max-w-sm flex items-start gap-3 ${
            notification.type === 'success' ? 'bg-green-600' :
            notification.type === 'error' ? 'bg-red-600' :
            notification.type === 'warning' ? 'bg-orange-600' :
            'bg-blue-600'
          }`}
        >
          <Icon
            name={
              notification.type === 'success' ? 'CheckCircle2' :
              notification.type === 'error' ? 'AlertCircle' :
              notification.type === 'warning' ? 'AlertTriangle' :
              'Info'
            }
            size={20}
            className="flex-shrink-0 mt-0.5"
          />
          <div className="flex-1">
            {notification.title && (
              <p className="font-semibold text-sm">{notification.title}</p>
            )}
            <p className="text-sm">{notification.message}</p>
          </div>
          <button
            onClick={() => onClose(notification.id)}
            className="flex-shrink-0 text-white hover:opacity-70"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
