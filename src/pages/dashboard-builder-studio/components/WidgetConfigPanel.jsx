import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const WidgetConfigPanel = ({ widget, onUpdate, onClose }) => {
  const [config, setConfig] = useState(widget?.config || {});

  const dataSources = [
    { value: 'sales', label: 'Sales Data' },
    { value: 'customers', label: 'Customer Records' },
    { value: 'inventory', label: 'Inventory Levels' },
    { value: 'employees', label: 'Employee Data' },
    { value: 'suppliers', label: 'Supplier Information' }
  ];

  const aggregationTypes = [
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'count', label: 'Count' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' }
  ];

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'area', label: 'Area Chart' }
  ];

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate({ ...widget, config });
    onClose();
  };

  if (!widget) return null;

  return (
    <aside className="fixed lg:relative top-0 right-0 w-full lg:w-80 h-full bg-card border-l border-border shadow-elevation-3 lg:shadow-none z-40 overflow-y-auto scrollbar-custom">
      <div className="sticky top-0 bg-card border-b border-border px-4 py-4 flex items-center justify-between z-10">
        <h3 className="text-base font-heading font-semibold text-foreground">
          Widget Configuration
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-muted transition-smooth"
          aria-label="Close configuration panel"
        >
          <Icon name="X" size={20} />
        </button>
      </div>
      <div className="p-4 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
              <Icon name={widget?.icon} size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{widget?.name}</p>
              <p className="caption text-muted-foreground">{widget?.type}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Widget Title"
            type="text"
            value={config?.title || ''}
            onChange={(e) => handleConfigChange('title', e?.target?.value)}
            placeholder="Enter widget title"
          />

          <Select
            label="Data Source"
            options={dataSources}
            value={config?.dataSource || ''}
            onChange={(value) => handleConfigChange('dataSource', value)}
            placeholder="Select data source"
          />

          {(widget?.type === 'bar' || widget?.type === 'line' || widget?.type === 'pie') && (
            <>
              <Select
                label="Chart Type"
                options={chartTypes}
                value={config?.chartType || widget?.type}
                onChange={(value) => handleConfigChange('chartType', value)}
              />

              <Input
                label="X-Axis Field"
                type="text"
                value={config?.xAxisField || ''}
                onChange={(e) => handleConfigChange('xAxisField', e?.target?.value)}
                placeholder="e.g., date, category"
              />

              <Input
                label="Y-Axis Field"
                type="text"
                value={config?.yAxisField || ''}
                onChange={(e) => handleConfigChange('yAxisField', e?.target?.value)}
                placeholder="e.g., revenue, count"
              />

              <Select
                label="Aggregation"
                options={aggregationTypes}
                value={config?.aggregation || 'sum'}
                onChange={(value) => handleConfigChange('aggregation', value)}
              />
            </>
          )}

          {widget?.type === 'kpi' && (
            <>
              <Input
                label="Metric Field"
                type="text"
                value={config?.metricField || ''}
                onChange={(e) => handleConfigChange('metricField', e?.target?.value)}
                placeholder="e.g., total_revenue"
              />

              <Select
                label="Comparison Period"
                options={[
                  { value: 'previous_month', label: 'Previous Month' },
                  { value: 'previous_quarter', label: 'Previous Quarter' },
                  { value: 'previous_year', label: 'Previous Year' }
                ]}
                value={config?.comparisonPeriod || 'previous_month'}
                onChange={(value) => handleConfigChange('comparisonPeriod', value)}
              />
            </>
          )}

          {widget?.type === 'table' && (
            <>
              <Input
                label="Columns (comma-separated)"
                type="text"
                value={config?.columns || ''}
                onChange={(e) => handleConfigChange('columns', e?.target?.value)}
                placeholder="name, status, value"
              />

              <Input
                label="Rows Per Page"
                type="number"
                value={config?.rowsPerPage || 10}
                onChange={(e) => handleConfigChange('rowsPerPage', parseInt(e?.target?.value))}
                min={5}
                max={100}
              />
            </>
          )}

          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-3">Display Options</h4>
            
            <Input
              label="Refresh Interval (seconds)"
              type="number"
              value={config?.refreshInterval || 60}
              onChange={(e) => handleConfigChange('refreshInterval', parseInt(e?.target?.value))}
              min={10}
              max={3600}
              description="How often to refresh widget data"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button onClick={handleSave} fullWidth>
            Save Changes
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default WidgetConfigPanel;