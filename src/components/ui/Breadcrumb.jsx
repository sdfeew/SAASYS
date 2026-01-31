import React from 'react';
import Icon from '../AppIcon';

const Breadcrumb = ({ items, onNavigate }) => {
  return (
    <nav className="flex items-center gap-2" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          {index > 0 && (
            <Icon name="ChevronRight" size={16} className="text-slate-400" />
          )}
          <button
            onClick={() => onNavigate?.(item)}
            className={`text-sm ${
              index === items.length - 1
                ? 'text-slate-900 font-medium'
                : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            {item.label}
          </button>
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
