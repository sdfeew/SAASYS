import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';

const MetricWidget = ({ widget, data, loading, error, filters }) => {
  const [metric, setMetric] = useState(null);
  const [previousMetric, setPreviousMetric] = useState(null);
  const [trend, setTrend] = useState(null);

  useEffect(() => {
    if (data && data.length > 0) {
      const value = data[0]?.[widget.metricField] || 0;
      setMetric(value);

      // Calculate trend if available
      if (data.length > 1 && data[1]?.[widget.metricField]) {
        const prev = data[1][widget.metricField];
        const change = ((value - prev) / prev) * 100;
        setTrend({
          value: change,
          direction: change >= 0 ? 'up' : 'down'
        });
        setPreviousMetric(prev);
      }
    }
  }, [data, widget.metricField]);

  const formatValue = (val) => {
    if (widget.format === 'currency') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    }
    if (widget.format === 'percent') {
      return `${val.toFixed(1)}%`;
    }
    if (widget.format === 'number') {
      return new Intl.NumberFormat('en-US').format(val);
    }
    return val;
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

  return (
    <div className="w-full h-full p-6 flex flex-col justify-between">
      {/* Label */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">{widget.label || widget.metricField}</p>
      </div>

      {/* Main Value */}
      <div>
        <div className="text-4xl font-bold text-foreground mb-2">
          {metric !== null ? formatValue(metric) : '-'}
        </div>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
              trend.direction === 'up' 
                ? 'bg-success/10 text-success' 
                : 'bg-destructive/10 text-destructive'
            }`}>
              <Icon 
                name={trend.direction === 'up' ? 'TrendingUp' : 'TrendingDown'} 
                size={16} 
              />
              <span>{Math.abs(trend.value).toFixed(1)}%</span>
            </div>
            <span className="text-xs text-muted-foreground">vs previous</span>
          </div>
        )}
      </div>

      {/* Comparison */}
      {previousMetric !== null && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">Previous: {formatValue(previousMetric)}</p>
          <p className="text-xs text-muted-foreground">
            {widget.label || widget.metricField}
          </p>
        </div>
      )}
    </div>
  );
};

export default MetricWidget;
