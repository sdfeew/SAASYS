import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import WidgetPreview from './WidgetPreview';
import BarChartWidget from './widgets/BarChartWidget';
import LineChartWidget from './widgets/LineChartWidget';
import PieChartWidget from './widgets/PieChartWidget';
import TableWidget from './widgets/TableWidget';
import MetricWidget from './widgets/MetricWidget';
import AreaChartWidget from './widgets/AreaChartWidget';
import ScatterChartWidget from './widgets/ScatterChartWidget';
import GaugeWidget from './widgets/GaugeWidget';
import { widgetDataFetcher } from '../services/widgetDataFetcher';
import { useAuth } from '../../../contexts/AuthContext';

const DashboardCanvas = ({ widgets, onWidgetUpdate, onWidgetDelete, onWidgetSelect, selectedWidget, filters }) => {
  const { tenantId } = useAuth();
  const [widgetData, setWidgetData] = useState({});
  const [loadingWidgets, setLoadingWidgets] = useState({});
  const [errorWidgets, setErrorWidgets] = useState({});
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Fetch data for each widget
  useEffect(() => {
    if (!widgets || widgets.length === 0) return;

    const fetchAllWidgetData = async () => {
      const newWidgetData = {};
      const newLoadingWidgets = {};
      const newErrorWidgets = {};

      for (const widget of widgets) {
        if (!widget.dataSource?.moduleId) continue;

        newLoadingWidgets[widget.id] = true;
        
        try {
          const data = await widgetDataFetcher.fetchWidgetData(
            widget,
            tenantId,
            filters
          );
          
          const formattedData = widgetDataFetcher.formatForWidget(data, widget);
          newWidgetData[widget.id] = formattedData;
          newLoadingWidgets[widget.id] = false;
        } catch (error) {
          console.error(`Error fetching data for widget ${widget.id}:`, error);
          newErrorWidgets[widget.id] = error.message || 'Failed to load data';
          newLoadingWidgets[widget.id] = false;
        }
      }

      setWidgetData(newWidgetData);
      setLoadingWidgets(newLoadingWidgets);
      setErrorWidgets(newErrorWidgets);
    };

    fetchAllWidgetData();
  }, [widgets, tenantId, filters]);

  const renderWidget = (widget) => {
    const data = widgetData[widget.id] || [];
    const loading = loadingWidgets[widget.id] || false;
    const error = errorWidgets[widget.id];

    const commonProps = {
      widget,
      data,
      loading,
      error,
      filters: filters || {}
    };

    switch (widget.type) {
      case 'bar':
        return <BarChartWidget {...commonProps} />;
      case 'line':
        return <LineChartWidget {...commonProps} />;
      case 'area':
        return <AreaChartWidget {...commonProps} />;
      case 'pie':
        return <PieChartWidget {...commonProps} />;
      case 'scatter':
        return <ScatterChartWidget {...commonProps} />;
      case 'table':
        return <TableWidget {...commonProps} />;
      case 'metric':
        return <MetricWidget {...commonProps} />;
      case 'gauge':
        return <GaugeWidget {...commonProps} />;
      default:
        return <WidgetPreview widget={widget} />;
    }
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDraggingOver(false);
    
    const widgetData = JSON.parse(e?.dataTransfer?.getData('widget'));
    const newWidget = {
      id: `widget-${Date.now()}`,
      ...widgetData,
      position: { x: 0, y: widgets?.length * 200 },
      size: { width: 400, height: 300 },
      config: {
        title: widgetData?.name,
        dataSource: null,
        fields: [],
        filters: []
      }
    };
    
    onWidgetUpdate([...widgets, newWidget]);
  };

  const handleWidgetResize = (widgetId, newSize) => {
    const updatedWidgets = widgets?.map(w => 
      w?.id === widgetId ? { ...w, size: newSize } : w
    );
    onWidgetUpdate(updatedWidgets);
  };

  const handleWidgetMove = (widgetId, newPosition) => {
    const updatedWidgets = widgets?.map(w => 
      w?.id === widgetId ? { ...w, position: newPosition } : w
    );
    onWidgetUpdate(updatedWidgets);
  };

  return (
    <div
      className="flex-1 bg-muted/30 overflow-auto scrollbar-custom relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {widgets?.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className={`text-center p-8 rounded-lg border-2 border-dashed transition-smooth ${
            isDraggingOver ? 'border-primary bg-primary/5' : 'border-border'
          }`}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Icon name="Layout" size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
              Start Building Your Dashboard
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Drag widgets from the library to create your custom dashboard.\nCombine charts, tables, and metrics to visualize your data.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 md:p-6 lg:p-8 min-h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {widgets?.map((widget) => (
              <div
                key={widget?.id}
                className={`bg-card border rounded-lg shadow-elevation-1 transition-smooth cursor-pointer ${
                  selectedWidget?.id === widget?.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onWidgetSelect(widget)}
              >
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Icon name={widget?.icon} size={18} className="text-primary flex-shrink-0" />
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {widget?.config?.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        onWidgetSelect(widget);
                      }}
                      className="p-1.5 rounded hover:bg-muted transition-smooth"
                      title="Configure widget"
                    >
                      <Icon name="Settings" size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        onWidgetDelete(widget?.id);
                      }}
                      className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-smooth"
                      title="Delete widget"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  {widget.dataSource?.moduleId ? (
                    <div style={{ height: '250px' }}>
                      {renderWidget(widget)}
                    </div>
                  ) : (
                    <WidgetPreview widget={widget} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCanvas;