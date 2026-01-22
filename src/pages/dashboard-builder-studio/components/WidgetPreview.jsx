import React from 'react';
import Icon from '../../../components/AppIcon';

const WidgetPreview = ({ widget }) => {
  const renderKPIPreview = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="caption text-muted-foreground">Total Revenue</span>
        <div className="flex items-center gap-1 text-success">
          <Icon name="TrendingUp" size={14} />
          <span className="caption">+12.5%</span>
        </div>
      </div>
      <div className="text-2xl md:text-3xl font-heading font-semibold text-foreground">
        $124,563
      </div>
      <div className="caption text-muted-foreground">vs. last month: $110,723</div>
    </div>
  );

  const renderBarChartPreview = () => (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-2 h-32">
        {[65, 45, 80, 55, 70, 60]?.map((height, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-primary rounded-t transition-smooth"
              style={{ height: `${height}%` }}
            />
            <span className="caption text-muted-foreground">Q{idx + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLineChartPreview = () => (
    <div className="space-y-3">
      <div className="h-32 flex items-end">
        <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
          <polyline
            points="0,80 50,60 100,70 150,40 200,50 250,30 300,45"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
          />
          <polyline
            points="0,80 50,60 100,70 150,40 200,50 250,30 300,45 300,100 0,100"
            fill="var(--color-primary)"
            fillOpacity="0.1"
          />
        </svg>
      </div>
      <div className="flex justify-between caption text-muted-foreground">
        <span>Jan</span>
        <span>Jun</span>
        <span>Dec</span>
      </div>
    </div>
  );

  const renderTablePreview = () => (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 pb-2 border-b border-border">
        <span className="caption font-medium text-foreground">Name</span>
        <span className="caption font-medium text-foreground">Status</span>
        <span className="caption font-medium text-foreground">Value</span>
      </div>
      {[1, 2, 3]?.map((row) => (
        <div key={row} className="grid grid-cols-3 gap-2 py-1">
          <span className="caption text-foreground">Item {row}</span>
          <span className="caption">
            <span className="inline-flex px-2 py-0.5 rounded-full bg-success/10 text-success">
              Active
            </span>
          </span>
          <span className="caption text-foreground data-text">$1,234</span>
        </div>
      ))}
    </div>
  );

  const renderMapPreview = () => (
    <div className="relative h-32 bg-muted rounded overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon name="MapPin" size={32} className="text-primary" />
      </div>
      <div className="absolute bottom-2 left-2 right-2 bg-card/90 backdrop-blur-sm rounded p-2">
        <p className="caption text-foreground">Interactive Map View</p>
      </div>
    </div>
  );

  const renderPieChartPreview = () => (
    <div className="flex items-center justify-center h-32">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="var(--color-primary)" opacity="0.8" />
        <path
          d="M 60 60 L 60 10 A 50 50 0 0 1 95 85 Z"
          fill="var(--color-accent)"
          opacity="0.8"
        />
        <path
          d="M 60 60 L 95 85 A 50 50 0 0 1 25 85 Z"
          fill="var(--color-secondary)"
          opacity="0.8"
        />
      </svg>
    </div>
  );

  const renderFilterPreview = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-2 bg-muted rounded">
        <Icon name="Calendar" size={16} className="text-muted-foreground" />
        <span className="caption text-foreground">01/01/2026 - 01/05/2026</span>
      </div>
      <p className="caption text-muted-foreground text-center">
        Filter controls dashboard data
      </p>
    </div>
  );

  const renderPreview = () => {
    switch (widget?.type) {
      case 'kpi': case'comparison': case'gauge':
        return renderKPIPreview();
      case 'bar':
        return renderBarChartPreview();
      case 'line': case'area':
        return renderLineChartPreview();
      case 'table': case'pivot':
        return renderTablePreview();
      case 'map': case'heatmap':
        return renderMapPreview();
      case 'pie':
        return renderPieChartPreview();
      case 'dateFilter': case'dropdownFilter':
        return renderFilterPreview();
      default:
        return (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <Icon name="Layout" size={32} />
          </div>
        );
    }
  };

  return <div className="w-full">{renderPreview()}</div>;
};

export default WidgetPreview;