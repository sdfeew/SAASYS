import { supabase } from '../lib/supabase';

export const tenantService = {
  async getAll() {
    const { data, error } = await supabase
      ?.from('tenants')
      ?.select('*')
      ?.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      ?.from('tenants')
      ?.select('*')
      ?.eq('id', id)
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async create(tenant) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      ?.from('tenants')
      ?.insert({
        name: tenant?.name,
        code: tenant?.code?.toLowerCase(),
        status: tenant?.status || 'active',
        subscription_plan: tenant?.subscriptionPlan || 'starter',
        branding: tenant?.branding || {},
        admins: [user?.id]
      })
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async update(id, tenant) {
    const { data, error } = await supabase
      ?.from('tenants')
      ?.update({
        name: tenant?.name,
        status: tenant?.status,
        subscription_plan: tenant?.subscriptionPlan,
        branding: tenant?.branding,
        settings: tenant?.settings
      })
      ?.eq('id', id)
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      ?.from('tenants')
      ?.delete()
      ?.eq('id', id);
    
    if (error) throw error;
  },

  async addAdmin(tenantId, userId) {
    const tenant = await this.getById(tenantId);
    const admins = [...(tenant?.admins || []), userId];
    
    return this.update(tenantId, { ...tenant, admins });
  },

  async removeAdmin(tenantId, userId) {
    const tenant = await this.getById(tenantId);
    const admins = (tenant?.admins || []).filter(id => id !== userId);
    
    return this.update(tenantId, { ...tenant, admins });
  }
};
