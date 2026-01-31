import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  actionLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  severity = 'warning',
  children
}) => {
  const severityConfig = {
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'AlertTriangle',
      iconColor: 'text-orange-600',
      button: 'bg-orange-600 hover:bg-orange-700'
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'AlertCircle',
      iconColor: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'CheckCircle2',
      iconColor: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'Info',
      iconColor: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const config = severityConfig[severity];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        {/* Icon & Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-10 h-10 rounded-full ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0`}>
            <Icon name={config.icon} className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          </div>
        </div>

        {/* Message */}
        {message && (
          <p className="text-slate-600 text-sm mb-6">{message}</p>
        )}

        {/* Custom Content */}
        {children && (
          <div className="mb-6">
            {children}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 ${config.button} text-white font-medium rounded-lg disabled:opacity-50 transition-colors`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Icon name="Loader2" size={16} className="animate-spin" />
                Please wait...
              </span>
            ) : (
              actionLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
