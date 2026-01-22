import { supabase } from '../lib/supabase';

export const dashboardService = {
  async getAll(tenantId, scope = null) {
    let query = supabase
      .from('dashboards')
      .select('*, created_by_user:created_by(id, full_name, avatar_url)')
      .eq('tenant_id', tenantId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (scope) {
      query = query.eq('scope', scope);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('dashboards')
      .select(`
        *,
        created_by_user:created_by(id, full_name, avatar_url),
        widgets:dashboard_widgets(
          *,
          data_source:data_sources(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(dashboard) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get user's tenant_id
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!userProfile) throw new Error('User profile not found');

    const { data, error } = await supabase
      .from('dashboards')
      .insert({
        tenant_id: userProfile.tenant_id,
        scope: dashboard.scope || 'GLOBAL',
        sub_module_id: dashboard.subModuleId,
        supplier_record_id: dashboard.supplierRecordId,
        name: dashboard.name,
        description: dashboard.description,
        layout_config: dashboard.layoutConfig || {},
        is_published: false,
        created_by: user.id
      })
      .select('*, created_by_user:created_by(id, full_name, avatar_url)')
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, dashboard) {
    const { data, error } = await supabase
      .from('dashboards')
      .update({
        name: dashboard.name,
        description: dashboard.description,
        layout_config: dashboard.layoutConfig,
        is_published: dashboard.isPublished
      })
      .eq('id', id)
      .select('*, created_by_user:created_by(id, full_name, avatar_url)')
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('dashboards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async publish(id) {
    return this.update(id, { isPublished: true });
  },

  async unpublish(id) {
    return this.update(id, { isPublished: false });
  },

  // Get dashboards for a specific module
  async getByModule(tenantId, subModuleId) {
    const { data, error } = await supabase
      .from('dashboards')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('scope', 'MODULE')
      .eq('sub_module_id', subModuleId)
      .eq('is_published', true);
    
    if (error) throw error;
    return data;
  },

  // Get supplier dashboard
  async getSupplierDashboard(tenantId, supplierId) {
    const { data, error } = await supabase
      .from('dashboards')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('scope', 'SUPPLIER')
      .eq('supplier_record_id', supplierId)
      .eq('is_published', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data || null;
  }
};