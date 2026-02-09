import { supabase } from '../lib/supabase';

export const widgetService = {
  async getByDashboard(dashboardId) {
    const { data, error } = await supabase
      ?.from('dashboard_widgets')
      ?.select('*, data_source:data_sources(*)')
      ?.eq('dashboard_id', dashboardId)
      ?.eq('is_visible', true)
      ?.order('position_y, position_x');
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      ?.from('dashboard_widgets')
      ?.select('*, data_source:data_sources(*)')
      ?.eq('id', id);
    
    if (error) throw error;
    
    // Return first match or null if not found
    return data?.[0] || null;
  },

  async create(dashboardId, widget) {
    const { data, error } = await supabase
      ?.from('dashboard_widgets')
      ?.insert({
        dashboard_id: dashboardId,
        type: widget?.type,
        title: widget?.title,
        description: widget?.description,
        data_source_id: widget?.dataSourceId,
        dimension_fields: widget?.dimensionFields || [],
        metric_fields: widget?.metricFields || [],
        filters: widget?.filters || [],
        sort_config: widget?.sortConfig || {},
        ui_config: widget?.uiConfig || {},
        position_x: widget?.positionX || 0,
        position_y: widget?.positionY || 0,
        width: widget?.width || 4,
        height: widget?.height || 3,
        refresh_interval: widget?.refreshInterval,
        is_visible: true
      })
      ?.select('*, data_source:data_sources(*)')
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async update(id, widget) {
    const { data, error } = await supabase
      ?.from('dashboard_widgets')
      ?.update({
        type: widget?.type,
        title: widget?.title,
        description: widget?.description,
        data_source_id: widget?.dataSourceId,
        dimension_fields: widget?.dimensionFields,
        metric_fields: widget?.metricFields,
        filters: widget?.filters,
        sort_config: widget?.sortConfig,
        ui_config: widget?.uiConfig,
        position_x: widget?.positionX,
        position_y: widget?.positionY,
        width: widget?.width,
        height: widget?.height,
        refresh_interval: widget?.refreshInterval
      })
      ?.eq('id', id)
      ?.select('*, data_source:data_sources(*)')
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      ?.from('dashboard_widgets')
      ?.delete()
      ?.eq('id', id);
    
    if (error) throw error;
  },

  async getWidgetData(widgetId, filters = {}) {
    try {
      // Get widget configuration
      const widget = await this.getById(widgetId);
      if (!widget) {
        throw new Error('Widget not found or has been deleted');
      }

      // Get data source
      const dataSource = widget?.data_source;
      if (!dataSource) {
        return null; // No data source configured
      }

      // Fetch data from the configured data source table
      let query = supabase
        ?.from(dataSource?.table_name)
        ?.select('*');

      // Apply filters
      Object?.keys(filters)?.forEach(fieldName => {
        const filterValue = filters?.[fieldName];
        if (filterValue) {
          query = query?.eq(fieldName, filterValue);
        }
      });

      const { data, error } = await query;
      
      if (error) throw error;

      // Format data based on widget type
      if (widget?.type === 'metric') {
        // For metric widgets, calculate aggregation
        const metricField = widget?.metric_fields?.[0];
        if (metricField && data?.length > 0) {
          const values = data?.map(row => Number(row?.[metricField]));
          return {
            value: values?.reduce((a, b) => a + b, 0)
          };
        }
        return { value: 0 };
      } else if (widget?.type === 'table') {
        // For table widgets, return rows
        return {
          headers: Object?.keys(data?.[0] || {}),
          rows: data?.map(row => Object?.values(row))
        };
      } else if (widget?.type === 'chart') {
        // For chart widgets, return data points
        return {
          dataPoints: data?.length
        };
      }

      return data;
    } catch (error) {
      console.error('Error fetching widget data:', error);
      throw error;
    }
  },

  async reorder(widgets) {
    const updates = widgets.map(widget => ({
      id: widget.id,
      position_x: widget.positionX || widget.position_x,
      position_y: widget.positionY || widget.position_y
    }));

    const { error } = await supabase
      ?.from('dashboard_widgets')
      ?.upsert(updates);
    
    if (error) throw error;
  }
};
