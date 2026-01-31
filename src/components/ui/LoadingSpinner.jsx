import React from 'react';
import Icon from '../AppIcon';

const LoadingSpinner = ({ 
  size = 'md', 
  message = 'Loading...', 
  fullScreen = false,
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinnerContent = (
    <div className="flex flex-col items-center gap-4">
      <Icon 
        name="Loader2" 
        size={size === 'sm' ? 24 : size === 'lg' ? 48 : 32}
        className="animate-spin text-blue-600"
      />
      {message && (
        <p className={`text-${size === 'sm' ? 'sm' : 'base'} text-slate-600`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm z-50">
        {spinnerContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      {spinnerContent}
    </div>
  );
};

export default LoadingSpinner;
