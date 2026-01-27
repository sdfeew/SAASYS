import { supabase } from '../lib/supabase';

export const moduleService = {
  // Main Modules - System-wide (read-only from frontend)
  async getAllMainModules() {
    const { data, error } = await supabase
      ?.from('main_modules')
      ?.select('*')
      ?.eq('status', 'active')
      ?.order('code');
    
    if (error) throw error;
    return data;
  },

  async getMainModuleByCode(code) {
    const { data, error } = await supabase
      ?.from('main_modules')
      ?.select('*')
      ?.eq('code', code)
      ?.eq('status', 'active')
      ?.single();
    
    if (error) throw error;
    return data;
  },

  // Sub-modules - Tenant-specific
  async getAllSubModules(tenantId) {
    const { data, error } = await supabase
      ?.from('sub_modules')
      ?.select('*')
      ?.eq('tenant_id', tenantId)
      ?.eq('status', 'active')
      ?.order('order_index');
    
    if (error) throw error;
    return data;
  },

  async getSubModuleByCode(tenantId, code) {
    const { data, error } = await supabase
      ?.from('sub_modules')
      ?.select('*')
      ?.eq('tenant_id', tenantId)
      ?.eq('code', code)
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async getSubModuleById(id) {
    const { data, error } = await supabase
      ?.from('sub_modules')
      ?.select('*')
      ?.eq('id', id)
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async createSubModule(tenantId, subModule) {
    const { data, error } = await supabase
      ?.from('sub_modules')
      ?.insert({
        tenant_id: tenantId,
        main_module_id: subModule?.mainModuleId,
        code: subModule?.code?.toUpperCase(),
        name: subModule?.name,
        description: subModule?.description || {},
        icon: subModule?.icon,
        status: 'active'
      })
      ?.select('*')
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async updateSubModule(id, subModule) {
    const { data, error } = await supabase
      ?.from('sub_modules')
      ?.update({
        name: subModule?.name,
        description: subModule?.description,
        icon: subModule?.icon,
        status: subModule?.status
      })
      ?.eq('id', id)
      ?.select('*')
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async deleteSubModule(id) {
    const { error } = await supabase
      ?.from('sub_modules')
      ?.delete()
      ?.eq('id', id);
    
    if (error) throw error;
  },

  // Get all sub-modules for a main module
  async getSubModulesByMainModule(tenantId, mainModuleId) {
    const { data, error } = await supabase
      ?.from('sub_modules')
      ?.select('*')
      ?.eq('tenant_id', tenantId)
      ?.eq('main_module_id', mainModuleId)
      ?.eq('status', 'active')
      ?.order('order_index');
    
    if (error) throw error;
    return data;
  }
};
