import { supabase } from '../lib/supabase';
import { errorHandler } from '../utils/errorHandler';

export const tenantService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        ?.from('tenants')
        ?.select('*')
        ?.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('tenantService.getAll', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase
        ?.from('tenants')
        ?.select('*')
        ?.eq('id', id)
        ?.single();
      
      if (error) {
        if (errorHandler.isNotFoundError(error)) {
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      errorHandler.logError('tenantService.getById', error, { id });
      throw error;
    }
  },

  async create(tenant) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!tenant?.name?.trim()) {
        throw new Error('Tenant name is required');
      }

      const { data, error } = await supabase
        ?.from('tenants')
        ?.insert({
          name: tenant?.name,
          code: tenant?.code?.toLowerCase() || tenant?.name?.toLowerCase()?.replace(/\s+/g, '-'),
          status: tenant?.status || 'active',
          subscription_plan: tenant?.subscriptionPlan || 'starter',
          branding: tenant?.branding || {},
          admins: [user?.id]
        })
        ?.select()
        ?.single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('tenantService.create', error, { tenant });
      throw error;
    }
  },

  async update(id, tenant) {
    try {
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
    } catch (error) {
      errorHandler.logError('tenantService.update', error, { id, tenant });
      throw error;
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        ?.from('tenants')
        ?.delete()
        ?.eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      errorHandler.logError('tenantService.delete', error, { id });
      throw error;
    }
  },

  async addAdmin(tenantId, userId) {
    try {
      const tenant = await this.getById(tenantId);
      if (!tenant) throw new Error('Tenant not found');
      
      const admins = [...(tenant?.admins || []), userId];
      return this.update(tenantId, { ...tenant, admins });
    } catch (error) {
      errorHandler.logError('tenantService.addAdmin', error, { tenantId, userId });
      throw error;
    }
  },

  async removeAdmin(tenantId, userId) {
    try {
      const tenant = await this.getById(tenantId);
      if (!tenant) throw new Error('Tenant not found');
      
      const admins = (tenant?.admins || []).filter(id => id !== userId);
      return this.update(tenantId, { ...tenant, admins });
    } catch (error) {
      errorHandler.logError('tenantService.removeAdmin', error, { tenantId, userId });
      throw error;
    }
  }
};
