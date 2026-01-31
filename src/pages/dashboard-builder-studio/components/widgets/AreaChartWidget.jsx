import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import Icon from '../../../../components/AppIcon';

const AreaChartWidget = ({ widget, data, loading, error, onDrill, filters }) => {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316'  // orange
  ];

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Icon name="Loader2" size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-destructive/5 rounded border border-destructive/20">
        <div className="text-center">
          <Icon name="AlertCircle" size={24} className="mx-auto mb-2 text-destructive" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded border border-border">
        <div className="text-center">
          <Icon name="BarChart3" size={32} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  const metricFields = widget.metricFields || (widget.metrics ? widget.metrics.map(m => m.field) : []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
        <defs>
          {metricFields.map((_, idx) => (
            <linearGradient key={`gradient-${idx}`} id={`color-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[idx % colors.length]} stopOpacity={0.8} />
              <stop offset="95%" stopColor={colors[idx % colors.length]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={widget.xAxisField || 'name'} />
        <YAxis />
        <Tooltip 
          contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', border: 'none', borderRadius: '4px', color: '#fff' }}
        />
        <Legend />
        {metricFields.map((field, idx) => (
          <Area
            key={field}
            type="monotone"
            dataKey={field}
            stroke={colors[idx % colors.length]}
            fillOpacity={1}
            fill={`url(#color-${idx})`}
            name={widget.metrics?.[idx]?.label || field}
            onClick={(data) => onDrill && onDrill(data)}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChartWidget;
