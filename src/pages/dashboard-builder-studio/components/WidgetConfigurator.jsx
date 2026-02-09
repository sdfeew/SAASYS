import React, { useState, useEffect } from 'react';
import { schemaService } from '../../../services/schemaService';

const WidgetConfigurator = ({ widget, tables, onUpdate }) => {
  const [tableSchema, setTableSchema] = useState(null);

  useEffect(() => {
    if (widget?.tableName) {
      loadSchema();
    }
  }, [widget?.tableName]);

  const loadSchema = async () => {
    try {
      const schema = await schemaService.getTableSchema(widget.tableName);
      setTableSchema(schema);
    } catch (err) {
      console.error('Error loading schema:', err);
    }
  };

  const chartTypes = [
    { id: 'bar', label: '📊 Bar Chart' },
    { id: 'line', label: '📈 Line Chart' },
    { id: 'pie', label: '🥧 Pie Chart' },
    { id: 'table', label: '📋 Table' }
  ];

  const aggregationTypes = ['count', 'sum', 'avg', 'min', 'max'];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
        <input
          type="text"
          value={widget.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Chart Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Chart Type</label>
        <div className="grid grid-cols-2 gap-2">
          {chartTypes.map(ct => (
            <button
              key={ct.id}
              onClick={() => onUpdate({ type: ct.id })}
              className={`p-2 rounded-lg border-2 transition text-sm ${
                widget.type === ct.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dimension Field */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Dimension</label>
        <select
          value={widget.dimensionField || ''}
          onChange={(e) => onUpdate({ dimensionField: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select field...</option>
          {tableSchema?.dimensions.map(dim => (
            <option key={dim.name} value={dim.name}>{dim.name}</option>
          ))}
        </select>
      </div>

      {/* Metric Field */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Metric</label>
        <select
          value={widget.metricField || ''}
          onChange={(e) => onUpdate({ metricField: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select field...</option>
          {tableSchema?.allColumns.map(col => (
            <option key={col.name} value={col.name}>{col.name}</option>
          ))}
        </select>
      </div>

      {/* Aggregation */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Aggregation</label>
        <select
          value={widget.aggregationType || 'count'}
          onChange={(e) => onUpdate({ aggregationType: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {aggregationTypes.map(agg => (
            <option key={agg} value={agg}>{agg.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* Filters */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Filters (JSON)</label>
        <textarea
          value={JSON.stringify(widget.filters || {}, null, 2)}
          onChange={(e) => {
            try {
              onUpdate({ filters: JSON.parse(e.target.value) });
            } catch (err) {
              // Invalid JSON
            }
          }}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          rows="3"
        />
      </div>
    </div>
  );
};

export default WidgetConfigurator;
