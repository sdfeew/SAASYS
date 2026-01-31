import React from 'react';
import Icon from '../AppIcon';

const ErrorAlert = ({ 
  error, 
  title = 'Error', 
  onRetry = null,
  onDismiss = null,
  severity = 'error'
}) => {
  const severityConfig = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'AlertCircle',
      iconColor: 'text-red-600',
      title: 'text-red-900',
      text: 'text-red-700',
      button: 'bg-red-100 hover:bg-red-200 text-red-700'
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'AlertTriangle',
      iconColor: 'text-orange-600',
      title: 'text-orange-900',
      text: 'text-orange-700',
      button: 'bg-orange-100 hover:bg-orange-200 text-orange-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'Info',
      iconColor: 'text-blue-600',
      title: 'text-blue-900',
      text: 'text-blue-700',
      button: 'bg-blue-100 hover:bg-blue-200 text-blue-700'
    }
  };

  const config = severityConfig[severity];

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4`}>
      <div className="flex gap-3">
        <Icon 
          name={config.icon} 
          className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`}
        />
        <div className="flex-1">
          <h3 className={`font-semibold ${config.title} mb-1`}>{title}</h3>
          <p className={`text-sm ${config.text}`}>
            {typeof error === 'string' ? error : error?.message || 'An error occurred'}
          </p>
          
          {(onRetry || onDismiss) && (
            <div className="flex gap-2 mt-4">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`text-sm px-3 py-1.5 rounded font-medium ${config.button} transition-colors`}
                >
                  Try Again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`text-sm px-3 py-1.5 rounded font-medium ${config.button} transition-colors`}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>

        {onDismiss && !onRetry && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 p-1 rounded hover:opacity-70`}
          >
            <Icon name="X" className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
