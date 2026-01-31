import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { getLangText } from '../../../utils/languageUtils';

const FilterToolbar = ({ 
  fields, 
  onFilterChange, 
  onSearch, 
  onClearFilters,
  onSort,
  activeFiltersCount 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState([]);
  const [selectedField, setSelectedField] = useState('');
  const [filterOperator, setFilterOperator] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const operatorOptions = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'between', label: 'Between' },
    { value: 'in_list', label: 'In List' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' }
  ];

  const fieldOptions = (fields || [])?.map(f => ({
    value: f?.id || f?.field_name,
    label: getLangText(f?.display_name || f?.label, 'en') || f?.field_name
  })) || [];

  const sortOptions = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' }
  ];

  const handleSearchChange = (e) => {
    const value = e?.target?.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleApplyFilter = () => {
    if (selectedField && filterOperator && (filterValue || filterOperator === 'is_empty' || filterOperator === 'is_not_empty')) {
      const newFilter = {
        id: Date.now(),
        field: selectedField,
        operator: filterOperator,
        value: filterValue
      };
      
      const updatedFilters = [...filters, newFilter];
      setFilters(updatedFilters);
      onFilterChange(updatedFilters);
      
      // Reset form
      setSelectedField('');
      setFilterOperator('');
      setFilterValue('');
    }
  };

  const handleRemoveFilter = (filterId) => {
    const updatedFilters = filters?.filter(f => f?.id !== filterId);
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleApplySort = () => {
    if (sortField) {
      onSort({
        field: sortField,
        direction: sortDirection
      });
    }
  };

  const handleClearAll = () => {
    setSearchTerm('');
    setFilters([]);
    setSelectedField('');
    setFilterOperator('');
    setFilterValue('');
    setSortField('');
    setSortDirection('asc');
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
              iconName="Search"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={showAdvanced ? "default" : "outline"}
              size="default"
              iconName="Filter"
              iconPosition="left"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span className="hidden sm:inline">Filters</span>
              {(filters?.length + (activeFiltersCount || 0)) > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                  {filters?.length + (activeFiltersCount || 0)}
                </span>
              )}
            </Button>
            
            {(filters?.length + (activeFiltersCount || 0)) > 0 && (
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                onClick={handleClearAll}
              >
                <span className="hidden sm:inline">Clear All</span>
              </Button>
            )}
          </div>
        </div>

        {/* Applied Filters Pills */}
        {filters?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters?.map(filter => (
              <div key={filter?.id} className="bg-primary/10 text-primary text-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                <span className="text-xs">
                  {fieldOptions?.find(f => f?.value === filter?.field)?.label}: {filter?.operator} {filter?.value}
                </span>
                <button
                  onClick={() => handleRemoveFilter(filter?.id)}
                  className="hover:opacity-70 transition-smooth"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="bg-muted rounded-lg p-4 space-y-4">
            {/* Add Filters Section */}
            <div className="space-y-3 pb-4 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Add Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <Select
                  label="Field"
                  placeholder="Select field"
                  options={fieldOptions}
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
                
                {filterOperator && filterOperator !== 'is_empty' && filterOperator !== 'is_not_empty' && (
                  <Input
                    label="Value"
                    type="text"
                    placeholder="Enter value"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e?.target?.value)}
                  />
                )}
                
                <div className={filterOperator && filterOperator !== 'is_empty' && filterOperator !== 'is_not_empty' ? '' : 'col-span-2'}>
                  {(!filterOperator || filterOperator === 'is_empty' || filterOperator === 'is_not_empty') && (
                    <div className="h-14" />
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    iconName="Plus"
                    iconPosition="left"
                    onClick={handleApplyFilter}
                    fullWidth
                  >
                    Add Filter
                  </Button>
                </div>
              </div>
            </div>

            {/* Sort Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Sort Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select
                  label="Sort by Field"
                  placeholder="Select field"
                  options={fieldOptions}
                  value={sortField}
                  onChange={setSortField}
                  searchable
                />
                
                <Select
                  label="Direction"
                  options={sortOptions}
                  value={sortDirection}
                  onChange={setSortDirection}
                />
                
                <div>
                  <div className="h-14" />
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="ArrowUpDown"
                    iconPosition="left"
                    onClick={handleApplySort}
                    fullWidth
                  >
                    Apply Sort
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterToolbar;