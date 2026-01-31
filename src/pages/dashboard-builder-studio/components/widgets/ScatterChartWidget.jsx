import React, { useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import Icon from '../../../../components/AppIcon';

const ScatterChartWidget = ({ widget, data, loading, error, onDrill }) => {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
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
          <Icon name="Scatter" size={32} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  const series = widget.seriesConfig || [
    {
      xField: widget.xAxisField,
      yField: widget.yAxisField,
      label: widget.label
    }
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={series[0]?.xField || 'x'} 
          type="number"
          label={{ value: widget.xAxisLabel || 'X Axis', position: 'insideBottomRight', offset: -5 }}
        />
        <YAxis 
          type="number"
          label={{ value: widget.yAxisLabel || 'Y Axis', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', border: 'none', borderRadius: '4px', color: '#fff' }}
          cursor={{ strokeDasharray: '3 3' }}
        />
        <Legend />
        {series.map((s, idx) => (
          <Scatter 
            key={idx}
            name={s.label || `Series ${idx + 1}`}
            data={data}
            dataKey={s.yField}
            fill={colors[idx % colors.length]}
            onClick={(data) => onDrill && onDrill(data)}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default ScatterChartWidget;
