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
      ?.eq('id', id)
      ?.single();
    
    if (error) throw error;
    return data;
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
