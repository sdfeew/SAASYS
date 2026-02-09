import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart as RechartLineChart, Line, PieChart as RechartPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trash2, Settings } from 'lucide-react';
import { aggregationService } from '../../../services/aggregationService';

const CHART_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const DashboardBuilderCanvas = ({ widgets, selectedWidget, onSelectWidget, onDeleteWidget, previewMode }) => {
  const [widgetData, setWidgetData] = useState({});
  const [loadingWidgets, setLoadingWidgets] = useState({});

  useEffect(() => {
    // Load data for all widgets
    widgets.forEach(widget => {
      loadWidgetData(widget);
    });
  }, [widgets]);

  const loadWidgetData = async (widget) => {
    try {
      setLoadingWidgets(prev => ({ ...prev, [widget.id]: true }));

      const data = await aggregationService.getAggregatedData(
        widget.tableName,
        {
          dimension: widget.dimensionField,
          metric: widget.metricField,
          aggregationType: widget.aggregationType || 'count',
          filters: widget.filters || {},
          limit: 100
        }
      );

      setWidgetData(prev => ({ ...prev, [widget.id]: data }));
    } catch (err) {
      console.error(`Error loading data for widget ${widget.id}:`, err);
    } finally {
      setLoadingWidgets(prev => ({ ...prev, [widget.id]: false }));
    }
  };

  const renderChart = (widget) => {
    const data = widgetData[widget.id] || [];
    const isLoading = loadingWidgets[widget.id];

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin">⏳</div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          No data available
        </div>
      );
    }

    switch (widget.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={widget.dimensionField} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={widget.metricField} fill={CHART_COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartLineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={widget.dimensionField} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={widget.metricField} stroke={CHART_COLORS[0]} />
            </RechartLineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartPieChart>
              <Pie
                data={data}
                dataKey={widget.metricField}
                nameKey={widget.dimensionField}
                cx="50%"
                cy="50%"
                outerRadius={50}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartPieChart>
          </ResponsiveContainer>
        );

      case 'table':
        return (
          <div className="overflow-auto h-full">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 sticky top-0">
                <tr>
                  <th className="px-2 py-1 text-left font-semibold">{widget.dimensionField}</th>
                  <th className="px-2 py-1 text-left font-semibold">{widget.metricField}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="px-2 py-1">{row[widget.dimensionField]}</td>
                    <td className="px-2 py-1">{row[widget.metricField]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return <div className="text-gray-400">Unknown chart type</div>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {widgets.map(widget => (
        <div
          key={widget.id}
          onClick={() => !previewMode && onSelectWidget(widget)}
          className={`bg-white rounded-lg shadow p-4 border-2 overflow-hidden flex flex-col transition ${
            selectedWidget?.id === widget.id && !previewMode
              ? 'border-blue-500 ring-2 ring-blue-200'
              : 'border-slate-200 hover:border-slate-300'
          } ${!previewMode ? 'cursor-pointer' : ''}`}
          style={{ height: '400px' }}
        >
          <div className="flex items-start justify-between mb-3 flex-shrink-0">
            <h3 className="font-semibold text-slate-900 truncate flex-1">{widget.title}</h3>
            {!previewMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteWidget(widget.id);
                }}
                className="p-1 hover:bg-red-100 text-red-600 rounded flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            {renderChart(widget)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardBuilderCanvas;
