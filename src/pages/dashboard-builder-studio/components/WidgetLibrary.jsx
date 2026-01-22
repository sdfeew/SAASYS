import React from 'react';
import Icon from '../../../components/AppIcon';

const WidgetLibrary = ({ onWidgetSelect, isCollapsed, onToggle }) => {
  const widgetCategories = [
    {
      id: 'metrics',
      name: 'Metrics',
      icon: 'TrendingUp',
      widgets: [
        {
          id: 'kpi-card',
          name: 'KPI Card',
          icon: 'SquareActivity',
          description: 'Display key performance indicators with trend indicators',
          type: 'kpi'
        },
        {
          id: 'metric-comparison',
          name: 'Metric Comparison',
          icon: 'GitCompare',
          description: 'Compare multiple metrics side by side',
          type: 'comparison'
        },
        {
          id: 'gauge-chart',
          name: 'Gauge Chart',
          icon: 'Gauge',
          description: 'Show progress towards goals with gauge visualization',
          type: 'gauge'
        }
      ]
    },
    {
      id: 'charts',
      name: 'Charts',
      icon: 'BarChart3',
      widgets: [
        {
          id: 'bar-chart',
          name: 'Bar Chart',
          icon: 'BarChart',
          description: 'Compare values across categories with vertical bars',
          type: 'bar'
        },
        {
          id: 'line-chart',
          name: 'Line Chart',
          icon: 'LineChart',
          description: 'Show trends over time with connected data points',
          type: 'line'
        },
        {
          id: 'pie-chart',
          name: 'Pie Chart',
          icon: 'PieChart',
          description: 'Display proportional data in circular segments',
          type: 'pie'
        },
        {
          id: 'area-chart',
          name: 'Area Chart',
          icon: 'AreaChart',
          description: 'Visualize cumulative totals over time',
          type: 'area'
        }
      ]
    },
    {
      id: 'tables',
      name: 'Tables',
      icon: 'Table',
      widgets: [
        {
          id: 'data-table',
          name: 'Data Table',
          icon: 'Table2',
          description: 'Display detailed records in sortable columns',
          type: 'table'
        },
        {
          id: 'pivot-table',
          name: 'Pivot Table',
          icon: 'Grid3x3',
          description: 'Summarize data with cross-tabulation',
          type: 'pivot'
        }
      ]
    },
    {
      id: 'maps',
      name: 'Maps',
      icon: 'Map',
      widgets: [
        {
          id: 'geo-map',
          name: 'Geo Map',
          icon: 'MapPin',
          description: 'Visualize geographic data on interactive maps',
          type: 'map'
        },
        {
          id: 'heat-map',
          name: 'Heat Map',
          icon: 'Flame',
          description: 'Show data density with color gradients',
          type: 'heatmap'
        }
      ]
    },
    {
      id: 'filters',
      name: 'Filters',
      icon: 'Filter',
      widgets: [
        {
          id: 'date-filter',
          name: 'Date Range',
          icon: 'Calendar',
          description: 'Filter dashboard by date range',
          type: 'dateFilter'
        },
        {
          id: 'dropdown-filter',
          name: 'Dropdown Filter',
          icon: 'ListFilter',
          description: 'Filter data by selected values',
          type: 'dropdownFilter'
        }
      ]
    }
  ];

  const handleDragStart = (e, widget) => {
    e?.dataTransfer?.setData('widget', JSON.stringify(widget));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside
      className={`fixed lg:relative top-0 left-0 h-full bg-card border-r border-border transition-smooth z-30 ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        {!isCollapsed && (
          <h2 className="text-base font-heading font-semibold text-foreground">
            Widget Library
          </h2>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-muted transition-smooth"
          aria-label={isCollapsed ? 'Expand widget library' : 'Collapse widget library'}
        >
          <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={20} />
        </button>
      </div>
      <div className="overflow-y-auto scrollbar-custom h-[calc(100%-65px)]">
        {!isCollapsed ? (
          <div className="p-4 space-y-6">
            {widgetCategories?.map((category) => (
              <div key={category?.id}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon name={category?.icon} size={16} className="text-primary" />
                  <h3 className="text-sm font-medium text-foreground">{category?.name}</h3>
                </div>
                <div className="space-y-2">
                  {category?.widgets?.map((widget) => (
                    <div
                      key={widget?.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, widget)}
                      onClick={() => onWidgetSelect(widget)}
                      className="p-3 bg-background border border-border rounded-md cursor-move hover:border-primary hover:shadow-elevation-1 transition-smooth"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name={widget?.icon} size={16} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground mb-1">
                            {widget?.name}
                          </p>
                          <p className="caption text-muted-foreground line-clamp-2">
                            {widget?.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2 space-y-4">
            {widgetCategories?.map((category) => (
              <div key={category?.id} className="space-y-2">
                <div className="flex justify-center py-2">
                  <Icon name={category?.icon} size={20} className="text-primary" />
                </div>
                {category?.widgets?.map((widget) => (
                  <button
                    key={widget?.id}
                    onClick={() => onWidgetSelect(widget)}
                    className="w-full p-2 rounded-md hover:bg-muted transition-smooth"
                    title={widget?.name}
                  >
                    <Icon name={widget?.icon} size={18} className="text-foreground" />
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default WidgetLibrary;