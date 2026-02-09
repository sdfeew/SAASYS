import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { dataAggregationService } from '../../services/dataAggregationService';

/**
 * Advanced Data Configuration Builder
 * Allows users to build complex data aggregations with:
 * - Multi-table joins
 * - Field aggregations
 * - Computed fields
 * - Filtering and grouping
 */

export const AdvancedDataConfigBuilder = ({ 
  tenantId, 
  initialConfig = {}, 
  onChange = () => {},
  onPreview = () => {}
}) => {
  const [config, setConfig] = useState(initialConfig);
  const [tables, setTables] = useState([]);
  const [tableFields, setTableFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    joins: true,
    fields: true,
    computed: true,
    filters: true,
    grouping: true
  });
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Load available tables
  useEffect(() => {
    loadTables();
  }, [tenantId]);

  const loadTables = async () => {
    try {
      const tablesData = await dataAggregationService.getTables(tenantId);
      setTables(tablesData);

      // Pre-load fields for primary table
      if (config.primaryTable && !tableFields[config.primaryTable]) {
        loadFieldsForTable(config.primaryTable);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const loadFieldsForTable = async (tableId) => {
    if (!tableId || tableFields[tableId]) return;

    try {
      const fields = await dataAggregationService.getTableFields(tableId);
      setTableFields(prev => ({ ...prev, [tableId]: fields }));
    } catch (error) {
      console.error('Error loading fields:', error);
    }
  };

  const updateConfig = (updates) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addJoin = () => {
    const newJoins = [...(config.joins || []), {
      id: `join-${Date.now()}`,
      table: '',
      onField: '',
      withField: ''
    }];
    updateConfig({ joins: newJoins });
  };

  const removeJoin = (joinId) => {
    updateConfig({
      joins: config.joins.filter(j => j.id !== joinId)
    });
  };

  const updateJoin = (joinId, updates) => {
    const newJoins = config.joins.map(j =>
      j.id === joinId ? { ...j, ...updates } : j
    );
    updateConfig({ joins: newJoins });
  };

  const addComputedField = () => {
    const newFields = [...(config.computedFields || []), {
      id: `computed-${Date.now()}`,
      name: 'new_field',
      type: 'sum',
      fields: []
    }];
    updateConfig({ computedFields: newFields });
  };

  const removeComputedField = (fieldId) => {
    updateConfig({
      computedFields: config.computedFields.filter(f => f.id !== fieldId)
    });
  };

  const updateComputedField = (fieldId, updates) => {
    const newFields = config.computedFields.map(f =>
      f.id === fieldId ? { ...f, ...updates } : f
    );
    updateConfig({ computedFields: newFields });
  };

  const addFilter = () => {
    const newFilters = [...(config.filters || []), {
      id: `filter-${Date.now()}`,
      field: '',
      operator: 'equals',
      value: ''
    }];
    updateConfig({ filters: newFilters });
  };

  const removeFilter = (filterId) => {
    updateConfig({
      filters: config.filters.filter(f => f.id !== filterId)
    });
  };

  const updateFilter = (filterId, updates) => {
    const newFilters = config.filters.map(f =>
      f.id === filterId ? { ...f, ...updates } : f
    );
    updateConfig({ filters: newFilters });
  };

  const previewData_ = async () => {
    setLoading(true);
    try {
      const data = await dataAggregationService.aggregateData({
        ...config,
        tenantId,
        limit: 20
      });
      setPreviewData(data);
      onPreview?.(data);
    } catch (error) {
      console.error('Preview error:', error);
      setPreviewData([]);
    } finally {
      setLoading(false);
    }
  };

  const getFieldsForTable = (tableId) => {
    return tableFields[tableId] || [];
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Advanced Data Configuration</h3>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm transition"
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-0 divide-x divide-gray-200">
        {/* Left Panel - Configuration */}
        <div className="col-span-2 p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Primary Table Selection */}
          <Section
            title="Data Source"
            expanded={expandedSections.general}
            onToggle={() => toggleSection('general')}
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700">Primary Table</label>
                <select
                  value={config.primaryTable || ''}
                  onChange={(e) => {
                    const tableId = e.target.value;
                    loadFieldsForTable(tableId);
                    updateConfig({ primaryTable: tableId });
                  }}
                  className="w-full mt-1 p-2 border border-gray-300 rounded text-sm"
                >
                  <option value="">Select a table...</option>
                  {tables.map(table => (
                    <option key={table.id} value={table.id}>
                      {typeof table.label === 'string' ? table.label : table.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">Row Limit</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={config.limit || 1000}
                  onChange={(e) => updateConfig({ limit: parseInt(e.target.value) })}
                  className="w-full mt-1 p-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </Section>

          {/* Joins */}
          <Section
            title={`Joins (${(config.joins || []).length})`}
            expanded={expandedSections.joins}
            onToggle={() => toggleSection('joins')}
          >
            <div className="space-y-3">
              {(config.joins || []).map((join, idx) => (
                <JoinConfig
                  key={join.id}
                  join={join}
                  tables={tables}
                  tableFields={tableFields}
                  onUpdate={(updates) => updateJoin(join.id, updates)}
                  onRemove={() => removeJoin(join.id)}
                  primaryTableFields={getFieldsForTable(config.primaryTable)}
                />
              ))}
              <button
                onClick={addJoin}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded border border-blue-300 text-blue-700 hover:bg-blue-50 text-sm transition"
              >
                <Plus size={14} /> Add Join
              </button>
            </div>
          </Section>

          {/* Filters */}
          <Section
            title={`Filters (${(config.filters || []).length})`}
            expanded={expandedSections.filters}
            onToggle={() => toggleSection('filters')}
          >
            <div className="space-y-3">
              {(config.filters || []).map((filter, idx) => (
                <FilterConfig
                  key={filter.id}
                  filter={filter}
                  fields={getFieldsForTable(config.primaryTable)}
                  onUpdate={(updates) => updateFilter(filter.id, updates)}
                  onRemove={() => removeFilter(filter.id)}
                />
              ))}
              <button
                onClick={addFilter}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded border border-green-300 text-green-700 hover:bg-green-50 text-sm transition"
              >
                <Plus size={14} /> Add Filter
              </button>
            </div>
          </Section>

          {/* Computed Fields */}
          <Section
            title={`Computed Fields (${(config.computedFields || []).length})`}
            expanded={expandedSections.computed}
            onToggle={() => toggleSection('computed')}
          >
            <div className="space-y-3">
              {(config.computedFields || []).map((field, idx) => (
                <ComputedFieldConfig
                  key={field.id}
                  field={field}
                  availableFields={getFieldsForTable(config.primaryTable)}
                  onUpdate={(updates) => updateComputedField(field.id, updates)}
                  onRemove={() => removeComputedField(field.id)}
                />
              ))}
              <button
                onClick={addComputedField}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded border border-purple-300 text-purple-700 hover:bg-purple-50 text-sm transition"
              >
                <Plus size={14} /> Add Computed Field
              </button>
            </div>
          </Section>

          {/* Grouping */}
          <Section
            title="Grouping & Aggregation"
            expanded={expandedSections.grouping}
            onToggle={() => toggleSection('grouping')}
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700">Group By Field</label>
                <select
                  value={config.groupBy?.field || ''}
                  onChange={(e) => updateConfig({ groupBy: { ...config.groupBy, field: e.target.value } })}
                  className="w-full mt-1 p-2 border border-gray-300 rounded text-sm"
                >
                  <option value="">None</option>
                  {getFieldsForTable(config.primaryTable).map(field => (
                    <option key={field.name} value={field.name}>{field.label}</option>
                  ))}
                </select>
              </div>

              {config.groupBy?.field && (
                <div>
                  <label className="text-xs font-medium text-gray-700">Aggregations</label>
                  <div className="mt-1 space-y-2">
                    {getFieldsForTable(config.primaryTable)
                      .filter(f => f.field_type === 'number')
                      .map(field => (
                        <label key={field.name} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={config.groupBy?.aggregations?.[field.name] ? true : false}
                            onChange={(e) => {
                              const aggs = config.groupBy?.aggregations || {};
                              if (e.target.checked) {
                                aggs[field.name] = 'sum';
                              } else {
                                delete aggs[field.name];
                              }
                              updateConfig({ groupBy: { ...config.groupBy, aggregations: aggs } });
                            }}
                          />
                          <span>{field.label}</span>
                          {config.groupBy?.aggregations?.[field.name] && (
                            <select
                              value={config.groupBy.aggregations[field.name]}
                              onChange={(e) => {
                                const aggs = { ...config.groupBy.aggregations };
                                aggs[field.name] = e.target.value;
                                updateConfig({ groupBy: { ...config.groupBy, aggregations: aggs } });
                              }}
                              className="ml-auto p-1 border border-gray-300 rounded text-xs"
                            >
                              <option value="sum">Sum</option>
                              <option value="avg">Average</option>
                              <option value="min">Min</option>
                              <option value="max">Max</option>
                              <option value="count">Count</option>
                            </select>
                          )}
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* Right Panel - Preview */}
        {showPreview && (
          <div className="col-span-1 bg-gray-50 border-l border-gray-200 p-4 max-h-96 overflow-auto">
            <div className="mb-3">
              <button
                onClick={previewData_}
                disabled={loading || !config.primaryTable}
                className="w-full px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition"
              >
                {loading ? 'Loading...' : 'Load Preview'}
              </button>
            </div>

            {previewData.length > 0 && (
              <div className="text-xs">
                <p className="font-semibold mb-2 text-gray-700">{previewData.length} rows</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-200">
                        {Object.keys(previewData[0] || {}).slice(0, 5).map(key => (
                          <th key={key} className="border border-gray-300 p-1 text-left">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).slice(0, 5).map((val, vIdx) => (
                            <td key={vIdx} className="border border-gray-300 p-1">
                              {String(val).slice(0, 20)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center py-6 text-gray-500">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const Section = ({ title, expanded, onToggle, children }) => (
  <div className="border border-gray-200 rounded">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition"
    >
      <span className="font-medium text-sm text-gray-700">{title}</span>
      {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
    {expanded && <div className="p-3 space-y-2">{children}</div>}
  </div>
);

const JoinConfig = ({ join, tables, tableFields, onUpdate, onRemove, primaryTableFields }) => (
  <div className="p-3 border border-gray-200 rounded bg-gray-50 space-y-2">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium text-gray-700">Join Configuration</span>
      <button onClick={onRemove} className="text-red-600 hover:text-red-700">
        <Trash2 size={14} />
      </button>
    </div>

    <div>
      <label className="text-xs font-medium text-gray-700">Join Table</label>
      <select
        value={join.table || ''}
        onChange={(e) => onUpdate({ table: e.target.value })}
        className="w-full mt-1 p-2 border border-gray-300 rounded text-xs"
      >
        <option value="">Select table...</option>
        {tables.map(t => (
          <option key={t.id} value={t.id}>
            {typeof t.label === 'string' ? t.label : t.name}
          </option>
        ))}
      </select>
    </div>

    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="text-xs font-medium text-gray-700">On Field</label>
        <select
          value={join.onField || ''}
          onChange={(e) => onUpdate({ onField: e.target.value })}
          className="w-full mt-1 p-2 border border-gray-300 rounded text-xs"
        >
          <option value="">Select...</option>
          {primaryTableFields.map(f => (
            <option key={f.name} value={f.name}>{f.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-700">Match Field</label>
        <select
          value={join.withField || ''}
          onChange={(e) => onUpdate({ withField: e.target.value })}
          className="w-full mt-1 p-2 border border-gray-300 rounded text-xs"
        >
          <option value="">Select...</option>
          {(tableFields[join.table] || []).map(f => (
            <option key={f.name} value={f.name}>{f.label}</option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

const FilterConfig = ({ filter, fields, onUpdate, onRemove }) => (
  <div className="p-3 border border-gray-200 rounded bg-gray-50 space-y-2">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium text-gray-700">Filter Rule</span>
      <button onClick={onRemove} className="text-red-600 hover:text-red-700">
        <Trash2 size={14} />
      </button>
    </div>

    <div className="grid grid-cols-3 gap-2">
      <select
        value={filter.field || ''}
        onChange={(e) => onUpdate({ field: e.target.value })}
        className="p-2 border border-gray-300 rounded text-xs"
      >
        <option value="">Field...</option>
        {fields.map(f => (
          <option key={f.name} value={f.name}>{f.label}</option>
        ))}
      </select>

      <select
        value={filter.operator || 'equals'}
        onChange={(e) => onUpdate({ operator: e.target.value })}
        className="p-2 border border-gray-300 rounded text-xs"
      >
        <option value="equals">=</option>
        <option value="notEquals">≠</option>
        <option value="greaterThan">&gt;</option>
        <option value="lessThan">&lt;</option>
        <option value="contains">~</option>
      </select>

      <input
        type="text"
        value={filter.value || ''}
        onChange={(e) => onUpdate({ value: e.target.value })}
        placeholder="Value"
        className="p-2 border border-gray-300 rounded text-xs"
      />
    </div>
  </div>
);

const ComputedFieldConfig = ({ field, availableFields, onUpdate, onRemove }) => (
  <div className="p-3 border border-gray-200 rounded bg-purple-50 space-y-2">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium text-gray-700">Computed Field</span>
      <button onClick={onRemove} className="text-red-600">
        <Trash2 size={14} />
      </button>
    </div>

    <input
      type="text"
      value={field.name || ''}
      onChange={(e) => onUpdate({ name: e.target.value })}
      placeholder="Field name"
      className="w-full p-2 border border-gray-300 rounded text-xs"
    />

    <select
      value={field.type || 'sum'}
      onChange={(e) => onUpdate({ type: e.target.value })}
      className="w-full p-2 border border-gray-300 rounded text-xs"
    >
      <option value="sum">Sum</option>
      <option value="average">Average</option>
      <option value="count">Count</option>
      <option value="concat">Concatenate</option>
      <option value="formula">Formula</option>
      <option value="condition">Condition</option>
    </select>

    {['sum', 'average', 'count', 'concat'].includes(field.type) && (
      <div>
        <label className="text-xs font-medium text-gray-700">Source Fields</label>
        <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
          {availableFields.map(f => (
            <label key={f.name} className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={(field.fields || []).includes(f.name)}
                onChange={(e) => {
                  let fields = [...(field.fields || [])];
                  if (e.target.checked) {
                    fields.push(f.name);
                  } else {
                    fields = fields.filter(x => x !== f.name);
                  }
                  onUpdate({ fields });
                }}
              />
              {f.label}
            </label>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default AdvancedDataConfigBuilder;
