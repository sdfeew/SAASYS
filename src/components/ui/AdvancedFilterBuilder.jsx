import React, { useState, useCallback } from 'react';
import { X, Plus, ChevronDown } from 'lucide-react';

const OPERATORS = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Not Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' }
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'greater_equal', label: 'Greater Or Equal' },
    { value: 'less_equal', label: 'Less Or Equal' }
  ],
  date: [
    { value: 'equals', label: 'Equals' },
    { value: 'greater_than', label: 'After' },
    { value: 'less_than', label: 'Before' },
    { value: 'greater_equal', label: 'On Or After' },
    { value: 'less_equal', label: 'On Or Before' }
  ],
  select: [
    { value: 'equals', label: 'Is' },
    { value: 'not_equals', label: 'Is Not' },
    { value: 'in', label: 'Is Any Of' },
    { value: 'not_in', label: 'Is None Of' }
  ],
  boolean: [
    { value: 'equals', label: 'Is' },
    { value: 'is_null', label: 'Is Empty' },
    { value: 'is_not_null', label: 'Is Not Empty' }
  ]
};

const AdvancedFilterBuilder = ({
  fields = [],
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  theme = 'light'
}) => {
  const [filters, setFilters] = useState([]);
  const [logicMode, setLogicMode] = useState('AND'); // AND or OR

  const addFilter = useCallback(() => {
    const newFilter = {
      id: Date.now(),
      field: fields[0]?.name || '',
      operator: 'contains',
      value: '',
      fieldType: fields[0]?.type || 'text'
    };
    const updatedFilters = [...filters, newFilter];
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  }, [filters, fields, onFiltersChange]);

  const updateFilter = useCallback((id, updates) => {
    const updatedFilters = filters.map(f => f.id === id ? { ...f, ...updates } : f);
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  }, [filters, onFiltersChange]);

  const removeFilter = useCallback((id) => {
    const updatedFilters = filters.filter(f => f.id !== id);
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  }, [filters, onFiltersChange]);

  const handleFieldChange = useCallback((id, fieldName) => {
    const field = fields.find(f => f.name === fieldName);
    updateFilter(id, {
      field: fieldName,
      fieldType: field?.type || 'text',
      operator: 'contains',
      value: ''
    });
  }, [fields, updateFilter]);

  const getOperators = (fieldType) => {
    return OPERATORS[fieldType] || OPERATORS.text;
  };

  const renderValueInput = (filter) => {
    const field = fields.find(f => f.name === filter.field);
    const baseClasses = 'w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

    if (filter.fieldType === 'boolean') {
      return (
        <select
          value={filter.value}
          onChange={(e) => updateFilter(filter.id, { value: e.target.value === 'true' })}
          className={baseClasses}
        >
          <option value="">Select...</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    }

    if (filter.fieldType === 'select' && field?.options) {
      return (
        <select
          value={filter.value}
          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
          className={baseClasses}
        >
          <option value="">Select...</option>
          {field.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (filter.fieldType === 'date') {
      return (
        <input
          type="date"
          value={filter.value}
          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
          className={baseClasses}
        />
      );
    }

    if (filter.fieldType === 'number') {
      return (
        <input
          type="number"
          value={filter.value}
          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
          className={baseClasses}
          placeholder="Enter number"
        />
      );
    }

    return (
      <input
        type="text"
        value={filter.value}
        onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
        className={baseClasses}
        placeholder="Enter value"
      />
    );
  };

  return (
    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="space-y-4">
        {/* Logic Mode Selector */}
        {filters.length > 1 && (
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Match:
            </span>
            <button
              onClick={() => setLogicMode('AND')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                logicMode === 'AND'
                  ? 'bg-blue-500 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ALL conditions
            </button>
            <button
              onClick={() => setLogicMode('OR')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                logicMode === 'OR'
                  ? 'bg-blue-500 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ANY condition
            </button>
          </div>
        )}

        {/* Filter Rules */}
        {filters.length === 0 ? (
          <div className={`text-center py-8 rounded border-2 border-dashed ${
            theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'
          }`}>
            <p className="text-sm">No filters added yet</p>
            <p className="text-xs mt-2">Click "Add Filter" to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filters.map((filter, index) => (
              <div
                key={filter.id}
                className={`flex items-end gap-2 p-3 rounded border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                {index > 0 && (
                  <div className={`text-xs font-medium px-2 py-1 rounded ${
                    theme === 'dark'
                      ? 'bg-gray-600 text-gray-300'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {logicMode}
                  </div>
                )}

                {/* Field Select */}
                <select
                  value={filter.field}
                  onChange={(e) => handleFieldChange(filter.id, e.target.value)}
                  className={`flex-1 px-3 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">Select field...</option>
                  {fields.map(field => (
                    <option key={field.name} value={field.name}>
                      {field.label}
                    </option>
                  ))}
                </select>

                {/* Operator Select */}
                <select
                  value={filter.operator}
                  onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                  className={`flex-1 px-3 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {getOperators(filter.fieldType).map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>

                {/* Value Input */}
                {!['is_null', 'is_not_null'].includes(filter.operator) && (
                  <div className="flex-1">
                    {renderValueInput(filter)}
                  </div>
                )}

                {/* Remove Button */}
                <button
                  onClick={() => removeFilter(filter.id)}
                  className={`p-2 rounded transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-600 text-red-400'
                      : 'hover:bg-gray-200 text-red-500'
                  }`}
                  title="Remove filter"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-300 dark:border-gray-600">
          <button
            onClick={addFilter}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            Add Filter
          </button>

          {filters.length > 0 && (
            <>
              <button
                onClick={() => onApplyFilters?.(filters, logicMode)}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
              >
                Apply Filters
              </button>

              <button
                onClick={() => {
                  setFilters([]);
                  setLogicMode('AND');
                  onClearFilters?.();
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilterBuilder;
