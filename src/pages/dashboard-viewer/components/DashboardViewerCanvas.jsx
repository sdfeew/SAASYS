import React, { useState, useEffect, useCallback, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import { widgetService } from '../../../services/widgetService';
import { isValidUUID } from '../../../utils/uuidHelper';

const DashboardViewerCanvas = ({ widgets, filters = {}, dashboard }) => {
  const [renderedWidgets, setRenderedWidgets] = useState([]);
  const [widgetErrors, setWidgetErrors] = useState({});
  const [widgetData, setWidgetData] = useState({});
  const [loadingWidgets, setLoadingWidgets] = useState({});
  const widgetsLoaded = useRef(new Set());

  const loadSingleWidget = useCallback(async (widget) => {
    try {
      // Skip if already loading or loaded
      if (widgetsLoaded.current.has(widget.id) || loadingWidgets[widget.id]) {
        return;
      }

      // Skip loading if widget ID is not a valid UUID
      if (!isValidUUID(widget.id)) {
        setWidgetErrors(prev => ({
          ...prev,
          [widget.id]: 'Invalid widget ID format (old timestamp ID). Please recreate this widget.'
        }));
        widgetsLoaded.current.add(widget.id);
        return;
      }

      // Mark as loading
      widgetsLoaded.current.add(widget.id);
      setLoadingWidgets(prev => ({ ...prev, [widget.id]: true }));
      
      // Set timeout to prevent hanging requests
      const loadPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Widget load timeout'));
        }, 30000); // 30 second timeout

        // Prepare filter parameters for this widget
        const widgetFilters = {};
        if (widget.filterFields) {
          widget.filterFields.forEach(field => {
            if (filters[field.name]) {
              widgetFilters[field.name] = filters[field.name];
            }
          });
        }

        // Call widget service with proper error handling
        if (widgetService?.getWidgetData) {
          widgetService.getWidgetData(widget.id, widgetFilters)
            .then(data => {
              clearTimeout(timeout);
              setWidgetData(prev => ({ ...prev, [widget.id]: data }));
              setWidgetErrors(prev => {
                const updated = { ...prev };
                delete updated[widget.id];
                return updated;
              });
              resolve(data);
            })
            .catch(error => {
              clearTimeout(timeout);
              console.error(`Error loading widget ${widget.id}:`, error);
              setWidgetErrors(prev => ({
                ...prev,
                [widget.id]: `Failed to load: ${error?.message || 'Unknown error'}`
              }));
              reject(error);
            });
        } else {
          clearTimeout(timeout);
          resolve(null);
        }
      });

      await loadPromise;
    } catch (error) {
      console.error('Error in loadSingleWidget:', error);
      setWidgetErrors(prev => ({
        ...prev,
        [widget.id]: error?.message || 'Failed to load widget data'
      }));
    } finally {
      setLoadingWidgets(prev => ({ ...prev, [widget.id]: false }));
    }
  }, [filters, loadingWidgets]);

  const loadWidgetData = useCallback((widgetsList) => {
    if (!widgetsList || widgetsList.length === 0) {
      return;
    }

    // Load widgets sequentially with a small delay to prevent overwhelming the server
    const loadSequentially = async () => {
      for (const widget of widgetsList) {
        await loadSingleWidget(widget);
        // Small delay between requests to prevent server overload
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    };

    loadSequentially().catch(err => {
      console.error('Error loading widget data:', err);
    });
  }, [loadSingleWidget]);

  useEffect(() => {
    if (widgets && widgets.length > 0) {
      setRenderedWidgets(widgets);
      loadWidgetData(widgets);
    } else {
      setRenderedWidgets([]);
    }
    
    // Cleanup on unmount
    return () => {
      widgetsLoaded.current.clear();
    };
  }, [widgets, loadWidgetData]);

  const handleWidgetError = (widgetId, error) => {
    setWidgetErrors(prev => ({
      ...prev,
      [widgetId]: error
    }));
  };

  const renderWidget = (widget) => {
    const isLoading = loadingWidgets[widget.id];
    const error = widgetErrors[widget.id];
    const data = widgetData[widget.id];

    if (error) {
      return (
        <div key={widget.id} className="bg-card border border-destructive/50 rounded-lg p-6 col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="AlertCircle" size={20} className="text-destructive" />
            <h3 className="text-base font-semibold text-foreground">{widget.title || widget.name}</h3>
          </div>
          <p className="text-sm text-destructive">{error}</p>
        </div>
      );
    }

    return (
      <div 
        key={widget.id} 
        className={`bg-card border border-border rounded-lg p-6 col-span-1 ${
          widget.size === 'large' ? 'md:col-span-2 lg:col-span-2' : 
          widget.size === 'wide' ? 'md:col-span-2 lg:col-span-2' : 
          'col-span-1'
        }`}
      >
        {/* Widget Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate">
              {widget.title || widget.name}
            </h3>
            {widget.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {widget.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <Icon name="Loader2" size={16} className="text-muted-foreground animate-spin" />
            )}
            {widget.refreshable && (
              <button 
                className="p-2 hover:bg-muted rounded transition-smooth flex-shrink-0 disabled:opacity-50"
                onClick={() => loadSingleWidget(widget)}
                disabled={isLoading}
                title="Refresh widget"
              >
                <Icon name="RefreshCw" size={16} className="text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Widget Content */}
        <div className="min-h-[200px] flex items-center justify-center bg-muted/30 rounded border border-dashed border-border">
          {isLoading ? (
            <div className="text-center">
              <Icon name="Loader2" size={32} className="mx-auto mb-2 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Loading widget...</p>
            </div>
          ) : data ? (
            <div className="w-full">
              {widget.type === 'metric' && (
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-2">Metric Value</p>
                  <p className="text-4xl font-bold text-primary">{data?.value || 0}</p>
                </div>
              )}
              {widget.type === 'table' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr>
                        {data?.headers?.map((header, idx) => (
                          <th key={idx} className="px-4 py-2 text-left font-medium text-muted-foreground">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data?.rows?.slice(0, 5)?.map((row, idx) => (
                        <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                          {row?.map((cell, cellIdx) => (
                            <td key={cellIdx} className="px-4 py-2 text-foreground">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data?.rows?.length > 5 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Showing 5 of {data?.rows?.length} rows
                    </p>
                  )}
                </div>
              )}
              {widget.type === 'chart' && (
                <div className="text-center text-muted-foreground">
                  <Icon name="BarChart3" size={24} className="mx-auto mb-2" />
                  <p className="text-sm">Chart visualization ({data?.dataPoints?.length} data points)</p>
                </div>
              )}
              {!['metric', 'table', 'chart']?.includes(widget?.type) && (
                <p className="text-sm text-muted-foreground text-center">
                  Widget data loaded ({Object?.keys(data)?.length} fields)
                </p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <Icon 
                name={widget.type === 'chart' ? 'BarChart3' : 
                      widget.type === 'table' ? 'Table2' : 
                      widget.type === 'metric' ? 'TrendingUp' : 
                      widget.type === 'map' ? 'Map' : 
                      'Package'} 
                size={32} 
                className="mx-auto mb-2 text-muted-foreground" 
              />
              <p className="text-sm text-muted-foreground mb-1">
                {widget.type === 'chart' ? 'Chart Widget' :
                 widget.type === 'table' ? 'Table Widget' :
                 widget.type === 'metric' ? 'Metric Widget' :
                 widget.type === 'map' ? 'Map Widget' :
                 'Data Widget'}
              </p>
              {widget.dataSource && (
                <p className="text-xs text-muted-foreground">
                  Data source: {widget.dataSource.name}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Widget Footer */}
        {widget.aggregations && widget.aggregations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Aggregations:</p>
            <div className="flex flex-wrap gap-2">
              {widget.aggregations.map((agg, idx) => (
                <span key={idx} className="px-2 py-1 text-xs bg-muted rounded text-foreground">
                  {agg.function}({agg.field})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Applied Filters */}
        {Object.keys(filters).length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => (
                <span key={key} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                  {key}: {value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!renderedWidgets || renderedWidgets.length === 0) {
    return (
      <div className="p-4 md:p-6 lg:p-8 min-h-full flex items-center justify-center">
        <div className="text-center">
          <Icon name="Layout" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Widgets Available</h3>
          <p className="text-sm text-muted-foreground">
            This dashboard doesn't contain any widgets yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-max">
        {renderedWidgets.map((widget) => renderWidget(widget))}
      </div>
    </div>
  );
};

export default DashboardViewerCanvas;
