import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import WidgetPreview from './WidgetPreview';

const DashboardCanvas = ({ widgets, onWidgetUpdate, onWidgetDelete, onWidgetSelect, selectedWidget }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

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
                  <WidgetPreview widget={widget} />
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