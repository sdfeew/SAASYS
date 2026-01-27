import { supabase } from '../lib/supabase';

export const recordService = {
  async getAll(moduleId = null) {
    let query = supabase?.from('sub_module_records')?.select('*')?.order('created_at', { ascending: false });
    
    if (moduleId) {
      query = query?.eq('module_id', moduleId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase?.from('sub_module_records')?.select('*')?.eq('id', id)?.single();
    
    if (error) throw error;
    return data;
  },

  async create(record) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('sub_module_records')?.insert({
        id: record?.id,
        module_id: record?.moduleId,
        data: record?.data,
        created_by: user?.id
      })?.select()?.single();
    
    if (error) throw error;
    return data;
  },

  async update(id, record) {
    const { data, error } = await supabase?.from('sub_module_records')?.update({
        data: record?.data,
        updated_at: new Date()?.toISOString()
      })?.eq('id', id)?.select()?.single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase?.from('sub_module_records')?.delete()?.eq('id', id);
    
    if (error) throw error;
  },

  async bulkDelete(ids) {
    const { error } = await supabase?.from('sub_module_records')?.delete()?.in('id', ids);
    
    if (error) throw error;
  }
};