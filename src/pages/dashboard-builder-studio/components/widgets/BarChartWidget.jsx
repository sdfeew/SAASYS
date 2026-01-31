import React, { useState, useEffect } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import Icon from '../../../../components/AppIcon';

const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const BarChartWidget = ({ widget, data, loading, error, onDrill, filters }) => {
  const [chartData, setChartData] = useState([]);
  const [selectedBar, setSelectedBar] = useState(null);

  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
    }
  }, [data]);

  const handleBarClick = (entry) => {
    setSelectedBar(entry);
    if (onDrill) {
      onDrill(entry);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded border border-dashed border-border">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="mx-auto mb-2 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-destructive/5 rounded border border-destructive/20">
        <div className="text-center">
          <Icon name="AlertCircle" size={32} className="mx-auto mb-2 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded border border-dashed border-border">
        <div className="text-center">
          <Icon name="BarChart3" size={32} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey={widget.xAxisField} />
          <YAxis />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Legend />
          {widget.metrics && widget.metrics.map((metric, idx) => (
            <Bar
              key={metric}
              dataKey={metric}
              fill={colors[idx % colors.length]}
              onClick={handleBarClick}
              radius={[8, 8, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartWidget;
