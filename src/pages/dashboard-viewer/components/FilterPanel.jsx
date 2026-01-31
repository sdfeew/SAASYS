import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { getLangText } from '../../../utils/languageUtils';

const FilterPanel = ({ widgets, onFilterChange, isCollapsed, onToggle }) => {
  const [localFilters, setLocalFilters] = useState({});
  const [expandedFilters, setExpandedFilters] = useState({});

  // Extract available filter fields from widgets
  const getAvailableFilters = () => {
    const filters = {};
    widgets?.forEach(widget => {
      if (widget.filterFields) {
        widget.filterFields.forEach(field => {
          if (!filters[field.name]) {
            filters[field.name] = {
              name: field.name,
              label: getLangText(field.label, 'en'),
              type: field.type || 'text',
              operators: field.operators || ['equals', 'contains'],
              values: field.values || []
            };
          }
        });
      }
    });
    return filters;
  };

  const availableFilters = getAvailableFilters();

  const handleFilterChange = (fieldName, value) => {
    const updated = { ...localFilters, [fieldName]: value };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleClearAll = () => {
    setLocalFilters({});
    onFilterChange({});
  };

  const toggleFilter = (fieldName) => {
    setExpandedFilters(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  return (
    <div className={`bg-card border-r border-border overflow-hidden flex flex-col transition-smooth ${
      isCollapsed ? 'w-0' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Icon name="Filter" size={18} />
          Filters
        </h3>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-muted rounded transition-smooth"
          aria-label="Close filters"
        >
          <Icon name="X" size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        {Object.keys(availableFilters).length === 0 ? (
          <div className="p-4 text-center">
            <Icon name="FilterX" size={32} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No filters available</p>
          </div>
        ) : (
          <div className="space-y-1">
            {Object.entries(availableFilters).map(([fieldName, filter]) => (
              <div key={fieldName} className="border-b border-border/50">
                <button
                  onClick={() => toggleFilter(fieldName)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-smooth text-sm"
                >
                  <span className="font-medium text-foreground text-left">
                    {filter.label || fieldName}
                  </span>
                  <Icon
                    name={expandedFilters[fieldName] ? 'ChevronUp' : 'ChevronDown'}
                    size={16}
                    className="text-muted-foreground"
                  />
                </button>

                {expandedFilters[fieldName] && (
                  <div className="px-4 py-3 bg-muted/20 border-t border-border/50 space-y-3">
                    {filter.type === 'select' || filter.values.length > 0 ? (
                      <div className="space-y-2">
                        {filter.values.map((value, idx) => (
                          <label key={idx} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              value={value}
                              checked={localFilters[fieldName]?.includes(value) || false}
                              onChange={(e) => {
                                const current = localFilters[fieldName] || [];
                                const updated = e.target.checked
                                  ? [...current, value]
                                  : current.filter(v => v !== value);
                                handleFilterChange(fieldName, updated);
                              }}
                              className="rounded border-input"
                            />
                            <span className="text-foreground">{value}</span>
                          </label>
                        ))}
                      </div>
                    ) : filter.type === 'date' ? (
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={localFilters[fieldName] || ''}
                          onChange={(e) => handleFilterChange(fieldName, e.target.value)}
                          className="w-full px-3 py-2 rounded border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    ) : filter.type === 'range' ? (
                      <div className="space-y-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={localFilters[fieldName]?.min || ''}
                          onChange={(e) => {
                            const range = localFilters[fieldName] || {};
                            handleFilterChange(fieldName, { ...range, min: e.target.value });
                          }}
                          className="w-full px-3 py-2 rounded border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={localFilters[fieldName]?.max || ''}
                          onChange={(e) => {
                            const range = localFilters[fieldName] || {};
                            handleFilterChange(fieldName, { ...range, max: e.target.value });
                          }}
                          className="w-full px-3 py-2 rounded border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter value..."
                        value={localFilters[fieldName] || ''}
                        onChange={(e) => handleFilterChange(fieldName, e.target.value)}
                        className="w-full px-3 py-2 rounded border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {Object.keys(localFilters).length > 0 && (
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={handleClearAll}
            className="w-full px-3 py-2 rounded border border-border hover:bg-muted transition-smooth text-sm text-foreground"
          >
            Clear All Filters
          </button>
          <p className="text-xs text-muted-foreground text-center">
            {Object.keys(localFilters).length} filter{Object.keys(localFilters).length !== 1 ? 's' : ''} active
          </p>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
