import React from 'react';
import Icon from '../AppIcon';

const EmptyState = ({
  icon = 'Package',
  title = 'No Data',
  description = 'There is no data to display',
  action = null,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: { icon: 32, padding: 'py-6' },
    md: { icon: 48, padding: 'py-12' },
    lg: { icon: 64, padding: 'py-16' }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center ${sizes.padding} px-4`}>
      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon 
          name={icon} 
          size={sizes.icon} 
          className="text-slate-400"
        />
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-center max-w-md mb-6">{description}</p>

      {action && (
        <div className="flex gap-2">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
