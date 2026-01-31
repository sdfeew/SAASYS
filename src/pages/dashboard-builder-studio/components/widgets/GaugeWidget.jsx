import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Icon from '../../../../components/AppIcon';

const GaugeWidget = ({ widget, data, loading, error }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (data && data.length > 0) {
      const val = data[0]?.[widget.metricField] || 0;
      setValue(Math.min(Math.max(val, 0), widget.max || 100));
    }
  }, [data, widget.metricField, widget.max]);

  const gaugeData = [
    { name: 'Used', value: value },
    { name: 'Remaining', value: (widget.max || 100) - value }
  ];

  const percentage = ((value / (widget.max || 100)) * 100).toFixed(0);
  
  const getColor = (percentage) => {
    if (percentage >= 80) return '#ef4444'; // red
    if (percentage >= 60) return '#f59e0b'; // amber
    if (percentage >= 40) return '#eab308'; // yellow
    return '#10b981'; // green
  };

  const getThresholdLabel = (percentage) => {
    if (percentage >= 80) return 'Critical';
    if (percentage >= 60) return 'Warning';
    if (percentage >= 40) return 'Moderate';
    return 'Healthy';
  };

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

  const colors = ['#ef4444', '#e5e7eb'];

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-6">
      {/* Label */}
      <div className="text-center mb-2">
        <p className="text-sm text-muted-foreground">{widget.label || 'Gauge'}</p>
      </div>

      {/* Gauge Chart */}
      <div className="w-full flex-1 flex items-center justify-center -my-4">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={0}
              dataKey="value"
            >
              {gaugeData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === 0 ? getColor(percentage) : colors[1]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Percentage and Status */}
      <div className="text-center">
        <div className="text-3xl font-bold mb-1" style={{ color: getColor(percentage) }}>
          {percentage}%
        </div>
        <div className="flex items-center gap-2 justify-center">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            getColor(percentage) === '#ef4444' ? 'bg-destructive/10 text-destructive' :
            getColor(percentage) === '#f59e0b' ? 'bg-yellow-500/10 text-yellow-600' :
            getColor(percentage) === '#eab308' ? 'bg-yellow-400/10 text-yellow-700' :
            'bg-success/10 text-success'
          }`}>
            {getThresholdLabel(percentage)}
          </span>
        </div>
        {widget.minLabel && widget.maxLabel && (
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{widget.minLabel}</span>
            <span>{widget.maxLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GaugeWidget;
