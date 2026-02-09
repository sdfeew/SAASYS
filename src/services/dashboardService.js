import { supabase } from '../lib/supabase';
import { errorHandler } from '../utils/errorHandler';

// Simple cache untuk dashboard requests
const dashboardCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (id) => `dashboard_${id}`;

export const dashboardService = {
  clearCache() {
    dashboardCache.clear();
  },

  async getAll(tenantId, scope = null) {
    // Build query without relationships
    let query = supabase
      .from('dashboards')
      .select('*')
      .order('created_at', { ascending: false });

    // Only filter by tenant if provided
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    if (scope) {
      query = query.eq('scope', scope);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    // Check cache first
    const cacheKey = getCacheKey(id);
    const cached = dashboardCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Fetch from API with timeout using Promise.race
      const { data, error } = await Promise.race([
        supabase
          .from('dashboards')
          .select('*')
          .eq('id', id)
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]);
      
      if (error) {
        console.error('Dashboard fetch error:', error);
        throw error;
      }

      // Cache the result
      if (data) {
        dashboardCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }

      return data;
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      throw err;
    }
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
        layout: dashboard.layout || 'grid',
        layout_config: dashboard.layoutConfig || dashboard.layout_config || {},
        is_published: dashboard.is_published || false,
        status: dashboard.status || 'draft',
        created_by: user.id
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    // Invalidate cache
    dashboardCache.clear();
    
    return data;
  },

  async update(id, dashboard) {
    const updateData = {
      name: dashboard.name,
      description: dashboard.description,
      layout_config: dashboard.layout_config || dashboard.layoutConfig,
      is_published: dashboard.is_published !== undefined ? dashboard.is_published : dashboard.isPublished,
      layout: dashboard.layout || 'grid',
      status: dashboard.status || 'draft'
    };

    const { data, error } = await supabase
      .from('dashboards')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    
    // Invalidate cache
    const cacheKey = getCacheKey(id);
    dashboardCache.delete(cacheKey);
    
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('dashboards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Invalidate cache
    const cacheKey = getCacheKey(id);
    dashboardCache.delete(cacheKey);
  },

  async publish(id) {
    // First fetch the dashboard to get current data
    const dashboard = await this.getById(id);
    if (!dashboard) throw new Error('Dashboard not found');
    
    // Update with is_published flag
    return this.update(id, {
      ...dashboard,
      is_published: true,
      status: 'published'
    });
  },

  async unpublish(id) {
    // First fetch the dashboard to get current data
    const dashboard = await this.getById(id);
    if (!dashboard) throw new Error('Dashboard not found');
    
    // Update with is_published flag
    return this.update(id, {
      ...dashboard,
      is_published: false,
      status: 'draft'
    });
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