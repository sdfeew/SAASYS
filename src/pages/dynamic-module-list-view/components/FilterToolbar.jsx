import React, { useState } from 'react';

import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const FilterToolbar = ({ 
  fields, 
  onFilterChange, 
  onSearch, 
  onClearFilters,
  activeFiltersCount 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [filterOperator, setFilterOperator] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const operatorOptions = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'between', label: 'Between' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' }
  ];

  const handleSearchChange = (e) => {
    const value = e?.target?.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleApplyFilter = () => {
    if (selectedField && filterOperator) {
      onFilterChange({
        field: selectedField,
        operator: filterOperator,
        value: filterValue
      });
    }
  };

  const handleClearAll = () => {
    setSearchTerm('');
    setSelectedField('');
    setFilterOperator('');
    setFilterValue('');
    onClearFilters();
  };

  return (
    <div className="bg-card border-b border-border px-4 md:px-6 lg:px-8 py-4">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search across all fields..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="default"
              iconName="Filter"
              iconPosition="left"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span className="hidden sm:inline">Advanced</span>
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="default"
                iconName="X"
                onClick={handleClearAll}
              >
                <span className="hidden sm:inline">Clear</span>
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select
                label="Field"
                placeholder="Select field"
                options={fields}
                value={selectedField}
                onChange={setSelectedField}
                searchable
              />
              
              <Select
                label="Operator"
                placeholder="Select operator"
                options={operatorOptions}
                value={filterOperator}
                onChange={setFilterOperator}
              />
              
              <Input
                label="Value"
                type="text"
                placeholder="Enter value"
                value={filterValue}
                onChange={(e) => setFilterValue(e?.target?.value)}
                disabled={filterOperator === 'is_empty' || filterOperator === 'is_not_empty'}
              />
              
              <div className="flex items-end">
                <Button
                  variant="default"
                  size="default"
                  iconName="Plus"
                  onClick={handleApplyFilter}
                  fullWidth
                >
                  Add Filter
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterToolbar;