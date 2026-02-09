import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { schemaService } from '../../../services/schemaService';
import { generateUUID } from '../../../utils/uuidHelper';

const DataSourceSelector = ({ tables, onSelect, onClose }) => {
  const [step, setStep] = useState(1); // 1: select table, 2: configure widget
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableSchema, setTableSchema] = useState(null);
  const [widgetConfig, setWidgetConfig] = useState({
    title: '',
    type: 'bar',
    tableName: '',
    dimensionField: '',
    metricField: '',
    aggregationType: 'count',
    filters: {}
  });

  const chartTypes = [
    { id: 'bar', label: '📊 Bar Chart' },
    { id: 'line', label: '📈 Line Chart' },
    { id: 'pie', label: '🥧 Pie Chart' },
    { id: 'table', label: '📋 Table' }
  ];

  const aggregationTypes = ['count', 'sum', 'avg', 'min', 'max'];

  const handleSelectTable = async (tableName) => {
    try {
      setSelectedTable(tableName);
      const schema = await schemaService.getTableSchema(tableName);
      setTableSchema(schema);
      setWidgetConfig(prev => ({
        ...prev,
        tableName,
        title: `${tableName} Analysis`
      }));
      setStep(2);
    } catch (err) {
      console.error('Error loading table schema:', err);
    }
  };

  const handleCreateWidget = () => {
    if (!widgetConfig.title || !widgetConfig.tableName || !widgetConfig.metricField) {
      alert('Please fill in all required fields');
      return;
    }

    onSelect({
      ...widgetConfig,
      id: generateUUID()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold">
            {step === 1 ? 'Select Data Source' : 'Configure Widget'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            // Step 1: Select Table
            <div className="grid grid-cols-2 gap-4">
              {tables.map(table => {
                const tableName = table.table_name || table.name;
                return (
                  <button
                    key={tableName}
                    onClick={() => handleSelectTable(tableName)}
                    className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
                  >
                    <h3 className="font-semibold text-slate-900 capitalize">{tableName}</h3>
                    <p className="text-sm text-slate-600 mt-1">Click to select</p>
                  </button>
                );
              })}
            </div>
          ) : (
            // Step 2: Configure Widget
            <div className="space-y-6">
              {/* Widget Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Widget Title
                </label>
                <input
                  type="text"
                  value={widgetConfig.title}
                  onChange={(e) => setWidgetConfig(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Monthly Sales"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Chart Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Chart Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {chartTypes.map(ct => (
                    <button
                      key={ct.id}
                      onClick={() => setWidgetConfig(prev => ({ ...prev, type: ct.id }))}
                      className={`p-3 rounded-lg border-2 transition ${
                        widgetConfig.type === ct.id
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dimension (Group By)
                </label>
                <select
                  value={widgetConfig.dimensionField}
                  onChange={(e) => setWidgetConfig(prev => ({ ...prev, dimensionField: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a field...</option>
                  {tableSchema?.dimensions.map(dim => (
                    <option key={dim.name} value={dim.name}>{dim.name}</option>
                  ))}
                </select>
              </div>

              {/* Metric Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Metric (Value)
                </label>
                <select
                  value={widgetConfig.metricField}
                  onChange={(e) => setWidgetConfig(prev => ({ ...prev, metricField: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a field...</option>
                  {tableSchema?.measures.map(measure => (
                    <option key={measure.name} value={measure.name}>{measure.name}</option>
                  ))}
                  {tableSchema?.allColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>

              {/* Aggregation Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Aggregation
                </label>
                <select
                  value={widgetConfig.aggregationType}
                  onChange={(e) => setWidgetConfig(prev => ({ ...prev, aggregationType: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {aggregationTypes.map(agg => (
                    <option key={agg} value={agg}>{agg.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex gap-3 justify-end">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Back
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          {step === 2 && (
            <button
              onClick={handleCreateWidget}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Widget
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataSourceSelector;
