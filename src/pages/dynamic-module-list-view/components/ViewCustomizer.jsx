import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const ViewCustomizer = ({ columns, visibleColumns, onToggleColumn, onSaveView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewName, setViewName] = useState('');

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSave = () => {
    if (viewName?.trim()) {
      onSaveView(viewName, visibleColumns);
      setViewName('');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="default"
        iconName="Settings2"
        iconPosition="left"
        onClick={handleToggle}
      >
        <span className="hidden sm:inline">Customize View</span>
      </Button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={handleToggle}
            aria-hidden="true"
          />
          
          <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-elevation-3 z-50 overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-heading font-semibold text-popover-foreground">
                  Customize Columns
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="X"
                  onClick={handleToggle}
                />
              </div>
              <p className="caption text-muted-foreground">
                Select columns to display in the table
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto scrollbar-custom p-4 space-y-2">
              {columns?.map((column) => (
                <div
                  key={column?.key}
                  className="flex items-center justify-between p-2 hover:bg-muted rounded-md transition-smooth"
                >
                  <Checkbox
                    label={column?.label}
                    checked={visibleColumns?.includes(column?.key)}
                    onChange={(e) => onToggleColumn(column?.key, e?.target?.checked)}
                  />
                  <Icon
                    name={column?.type === 'text' ? 'Type' : column?.type === 'number' ? 'Hash' : column?.type === 'date' ? 'Calendar' : 'Database'}
                    size={16}
                    className="text-muted-foreground"
                  />
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border space-y-3">
              <input
                type="text"
                placeholder="Save as custom view..."
                value={viewName}
                onChange={(e) => setViewName(e?.target?.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggle}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={!viewName?.trim()}
                  fullWidth
                >
                  Save View
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewCustomizer;