import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActionsBar = ({ 
  selectedCount, 
  onBulkAction, 
  onClearSelection,
  totalRecords 
}) => {
  const bulkActionOptions = [
    { value: 'export', label: 'Export Selected' },
    { value: 'delete', label: 'Delete Selected' },
    { value: 'archive', label: 'Archive Selected' },
    { value: 'assign', label: 'Assign Owner' },
    { value: 'tag', label: 'Add Tags' },
    { value: 'workflow', label: 'Trigger Workflow' }
  ];

  const exportOptions = [
    { value: 'csv', label: 'Export as CSV' },
    { value: 'excel', label: 'Export as Excel' },
    { value: 'json', label: 'Export as JSON' },
    { value: 'pdf', label: 'Export as PDF' }
  ];

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 md:px-6 lg:px-8 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon name="CheckSquare" size={20} className="text-primary" />
          <span className="text-sm md:text-base font-medium text-foreground">
            {selectedCount} of {totalRecords} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            placeholder="Bulk Actions"
            options={bulkActionOptions}
            value=""
            onChange={(value) => onBulkAction(value)}
            className="w-full sm:w-48"
          />
          
          <Select
            placeholder="Export"
            options={exportOptions}
            value=""
            onChange={(value) => onBulkAction('export', value)}
            className="w-full sm:w-40"
          />
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;