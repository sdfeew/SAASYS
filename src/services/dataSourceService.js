import { supabase } from '../lib/supabase';

export const dataSourceService = {
  async getAll(tenantId) {
    const { data, error } = await supabase
      ?.from('data_sources')
      ?.select('*')
      ?.eq('tenant_id', tenantId)
      ?.order('name');
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      ?.from('data_sources')
      ?.select('*')
      ?.eq('id', id)
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async create(tenantId, dataSource) {
    const { data, error } = await supabase
      ?.from('data_sources')
      ?.insert({
        tenant_id: tenantId,
        name: dataSource?.name,
        code: dataSource?.code?.toLowerCase(),
        type: dataSource?.type,
        config: dataSource?.config || {},
        field_mappings: dataSource?.fieldMappings || {}
      })
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async update(id, dataSource) {
    const { data, error } = await supabase
      ?.from('data_sources')
      ?.update({
        name: dataSource?.name,
        type: dataSource?.type,
        config: dataSource?.config,
        field_mappings: dataSource?.fieldMappings
      })
      ?.eq('id', id)
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      ?.from('data_sources')
      ?.delete()
      ?.eq('id', id);
    
    if (error) throw error;
  }
};
