import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { moduleService } from '../../../services/moduleService';
import { useAuth } from '../../../contexts/AuthContext';
import { widgetDataFetcher } from '../services/widgetDataFetcher';

const WidgetConfigPanel = ({ widget, onUpdate, onClose }) => {
  const { user, tenantId } = useAuth();
  const [config, setConfig] = useState(widget?.config || {});
  const [modules, setModules] = useState([]);
  const [fields, setFields] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);

  // Helper to ensure label is always a string
  const getFieldLabel = (field) => {
    if (typeof field?.label === 'string') return field.label;
    if (typeof field?.label === 'object' && field?.label?.en) return String(field.label.en);
    if (typeof field?.name === 'string') return field.name;
    return String(field?.name || 'Field');
  };

  // Helper to ensure field name is always a string
  const getFieldName = (field) => {
    if (typeof field?.name === 'string') return field.name;
    return String(field?.name || '');
  };

  useEffect(() => {
    loadModules();
  }, [tenantId]);

  const loadModules = async () => {
    console.log('[WidgetConfigPanel] loadModules called');
    console.log('[WidgetConfigPanel] user:', user);
    console.log('[WidgetConfigPanel] tenantId from context:', tenantId);
    
    if (!tenantId) {
      console.log('[WidgetConfigPanel] No tenantId available, aborting');
      return;
    }
    
    setLoadingModules(true);
    try {
      console.log('[WidgetConfigPanel] Calling moduleService.getAllSubModules with tenantId:', tenantId);
      const allModules = await moduleService.getAllSubModules(tenantId);
      console.log('[WidgetConfigPanel] Received modules:', allModules);
      console.log('[WidgetConfigPanel] Modules length:', allModules?.length);
      setModules(allModules || []);
    } catch (error) {
      console.error('[WidgetConfigPanel] Error loading modules:', error);
      setModules([]);
    }
    setLoadingModules(false);
  };

  const handleModuleChange = async (moduleId) => {
    setConfig(prev => ({
      ...prev,
      dataSource: {
        ...prev.dataSource,
        moduleId
      }
    }));

    // Load fields from selected module using widgetDataFetcher
    if (moduleId) {
      try {
        console.log('Loading fields for module:', moduleId);
        const moduleFields = await widgetDataFetcher.getModuleFields(moduleId, tenantId);
        console.log('Loaded fields:', moduleFields);
        setFields(moduleFields || []);
      } catch (error) {
        console.error('Error loading fields:', error);
        setFields([]);
      }
    }
  };

  const aggregationTypes = [
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'count', label: 'Count' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' },
    { value: 'distinctCount', label: 'Distinct Count' }
  ];

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'area', label: 'Area Chart' },
    { value: 'scatter', label: 'Scatter Chart' }
  ];

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleDataSourceChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      dataSource: {
        ...prev.dataSource,
        [field]: value
      }
    }));
  };

  const handleMetricChange = (index, field, value) => {
    const metrics = [...(config.metrics || [])];
    metrics[index] = { ...metrics[index], [field]: value };
    setConfig(prev => ({ ...prev, metrics }));
  };

  const addMetric = () => {
    setConfig(prev => ({
      ...prev,
      metrics: [...(prev.metrics || []), { field: '', aggregation: 'sum', label: '' }]
    }));
  };

  const removeMetric = (index) => {
    setConfig(prev => ({
      ...prev,
      metrics: prev.metrics.filter((_, i) => i !== index)
    }));
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

          {/* Data Source Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Data Source Module</label>
            {loadingModules ? (
              <div className="flex items-center gap-2 p-2 border border-border rounded text-sm text-muted-foreground">
                <Icon name="Loader2" size={14} className="animate-spin" />
                Loading modules...
              </div>
            ) : modules.length === 0 ? (
              <div className="p-3 border border-amber-200 bg-amber-50 rounded text-sm text-amber-800">
                <p className="font-medium mb-1">No modules available</p>
                <p className="text-xs">Create a module first in the Schema Builder before configuring widgets.</p>
              </div>
            ) : (
              <Select
                options={modules.map(m => {
                  // Handle JSONB name field
                  const moduleName = typeof m.name === 'string' 
                    ? m.name 
                    : (m.name?.en || JSON.stringify(m.name) || 'Unnamed');
                  return { value: m.id, label: moduleName };
                })}
                value={config?.dataSource?.moduleId || ''}
                onChange={handleModuleChange}
                placeholder="Select a module"
                disabled={loadingModules}
              />
            )}
          </div>

          {config?.dataSource?.moduleId && (
            <>
              {/* X-Axis / Group By */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Group By Field</label>
                <Select
                  options={fields.map(f => ({ value: f.name, label: getFieldLabel(f) }))}
                  value={config?.dataSource?.groupBy || ''}
                  onChange={(value) => handleDataSourceChange('groupBy', value)}
                  placeholder="Select grouping field"
                />
              </div>

              {/* Metrics */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-foreground">Metrics</label>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={addMetric}
                    className="h-7 gap-1"
                  >
                    <Icon name="Plus" size={14} />
                    Add
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {config?.metrics?.map((metric, idx) => (
                    <div key={idx} className="p-3 border border-border rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <Select
                          options={fields.map(f => ({ value: f.name, label: getFieldLabel(f) }))}
                          value={metric.field || ''}
                          onChange={(value) => handleMetricChange(idx, 'field', value)}
                          placeholder="Field"
                          size="sm"
                        />
                        <button
                          onClick={() => removeMetric(idx)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                        >
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <Select
                          options={aggregationTypes}
                          value={metric.aggregation || 'sum'}
                          onChange={(value) => handleMetricChange(idx, 'aggregation', value)}
                          placeholder="Aggregation"
                          size="sm"
                        />
                        <Input
                          type="text"
                          value={metric.label || ''}
                          onChange={(e) => handleMetricChange(idx, 'label', e.target.value)}
                          placeholder="Label (optional)"
                          className="text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* X-Axis for Charts */}
              {['bar', 'line', 'area', 'scatter'].includes(widget?.type) && (
                <>
                  <Select
                    label="X-Axis Field"
                    options={fields.map(f => ({ value: getFieldName(f), label: getFieldLabel(f) }))}
                    value={config?.xAxisField || ''}
                    onChange={(value) => handleConfigChange('xAxisField', value)}
                    placeholder="Select X-axis field"
                  />
                </>
              )}

              {/* Sort and Limit */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Sort By</label>
                  <Select
                    options={fields.map(f => ({ value: getFieldName(f), label: getFieldLabel(f) }))}
                    value={config?.dataSource?.orderBy?.field || ''}
                    onChange={(value) => handleDataSourceChange('orderBy', { field: value, direction: 'asc' })}
                    placeholder="Field"
                    size="sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Direction</label>
                  <Select
                    options={[
                      { value: 'asc', label: 'Ascending' },
                      { value: 'desc', label: 'Descending' }
                    ]}
                    value={config?.dataSource?.orderBy?.direction || 'asc'}
                    onChange={(value) => {
                      const orderBy = config?.dataSource?.orderBy || { field: '' };
                      handleDataSourceChange('orderBy', { ...orderBy, direction: value });
                    }}
                    size="sm"
                  />
                </div>
              </div>

              <Input
                label="Result Limit"
                type="number"
                value={config?.dataSource?.limit || 100}
                onChange={(e) => handleDataSourceChange('limit', parseInt(e?.target?.value))}
                min={10}
                max={10000}
              />
            </>
          )}

          {/* Pie Chart Specific */}
          {widget?.type === 'pie' && config?.dataSource?.moduleId && (
            <>
              <Select
                label="Label Field"
                options={fields.map(f => ({ value: getFieldName(f), label: getFieldLabel(f) }))}
                value={config?.labelField || ''}
                onChange={(value) => handleConfigChange('labelField', value)}
                placeholder="Field for labels"
              />
              <Select
                label="Value Field"
                options={fields.map(f => ({ value: getFieldName(f), label: getFieldLabel(f) }))}
                value={config?.valueField || ''}
                onChange={(value) => handleConfigChange('valueField', value)}
                placeholder="Field for values"
              />
            </>
          )}

          {/* Metric Widget Specific */}
          {widget?.type === 'metric' && config?.dataSource?.moduleId && (
            <>
              <Select
                label="Metric Field"
                options={fields.map(f => ({ value: getFieldName(f), label: getFieldLabel(f) }))}
                value={config?.metricField || ''}
                onChange={(value) => handleConfigChange('metricField', value)}
                placeholder="Select metric field"
              />
              <Select
                label="Format"
                options={[
                  { value: 'number', label: 'Number' },
                  { value: 'currency', label: 'Currency' },
                  { value: 'percent', label: 'Percentage' }
                ]}
                value={config?.format || 'number'}
                onChange={(value) => handleConfigChange('format', value)}
              />
            </>
          )}

          {/* Gauge Widget Specific */}
          {widget?.type === 'gauge' && config?.dataSource?.moduleId && (
            <>
              <Select
                label="Metric Field"
                options={fields.map(f => ({ value: getFieldName(f), label: getFieldLabel(f) }))}
                value={config?.metricField || ''}
                onChange={(value) => handleConfigChange('metricField', value)}
                placeholder="Select metric field"
              />
              <Input
                label="Maximum Value"
                type="number"
                value={config?.max || 100}
                onChange={(e) => handleConfigChange('max', parseInt(e?.target?.value))}
              />
            </>
          )}

          {/* Table Widget Specific */}
          {widget?.type === 'table' && config?.dataSource?.moduleId && (
            <Input
              label="Rows Per Page"
              type="number"
              value={config?.rowsPerPage || 10}
              onChange={(e) => handleConfigChange('rowsPerPage', parseInt(e?.target?.value))}
              min={5}
              max={100}
            />
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