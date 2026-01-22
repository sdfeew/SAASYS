import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ title, value, subtitle, icon, trend, trendValue, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
  };

  const trendColors = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="caption text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground">
            {value}
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center ${colorClasses?.[color]}`}>
          <Icon name={icon} size={20} className="md:w-6 md:h-6" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-2">
          <Icon 
            name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} 
            size={16} 
            className={trendColors?.[trend]}
          />
          <span className={`text-sm font-medium ${trendColors?.[trend]}`}>
            {trendValue}
          </span>
          <span className="text-sm text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;