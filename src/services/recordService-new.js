import { supabase } from '../lib/supabase';

export const recordService = {
  async getAll(subModuleId, filters = {}, limit = 100, offset = 0) {
    let query = supabase
      ?.from('sub_module_records')
      ?.select('*', { count: 'exact' })
      ?.eq('sub_module_id', subModuleId)
      ?.eq('status', 'active')
      ?.order('created_at', { ascending: false });

    // Apply filters if provided
    if (filters?.search) {
      query = query.ilike('data', `%${filters.search}%`);
    }

    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }

    const { data, error, count } = await query
      ?.range(offset, offset + limit - 1);
    
    if (error) throw error;
    return { data, count };
  },

  async getById(id) {
    const { data, error } = await supabase
      ?.from('sub_module_records')
      ?.select('*')
      ?.eq('id', id)
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async create(subModuleId, recordData) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get user's tenant_id
    const { data: userProfile } = await supabase
      ?.from('user_profiles')
      ?.select('tenant_id')
      ?.eq('id', user?.id)
      ?.single();

    if (!userProfile) throw new Error('User profile not found');

    const { data, error } = await supabase
      ?.from('sub_module_records')
      ?.insert({
        tenant_id: userProfile?.tenant_id,
        sub_module_id: subModuleId,
        data: recordData,
        created_by: user?.id,
        status: 'draft'
      })
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async update(id, recordData) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      ?.from('sub_module_records')
      ?.update({
        data: recordData,
        updated_by: user?.id
      })
      ?.eq('id', id)
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      ?.from('sub_module_records')
      ?.delete()
      ?.eq('id', id);
    
    if (error) throw error;
  },

  async updateStatus(id, status) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      ?.from('sub_module_records')
      ?.update({
        status,
        updated_by: user?.id
      })
      ?.eq('id', id)
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async assignTo(id, userId) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      ?.from('sub_module_records')
      ?.update({
        assigned_to: userId,
        updated_by: user?.id
      })
      ?.eq('id', id)
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async bulkUpdate(ids, updates) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      ?.from('sub_module_records')
      ?.update({
        ...updates,
        updated_by: user?.id
      })
      ?.in('id', ids)
      ?.select();
    
    if (error) throw error;
    return data;
  },

  async bulkDelete(ids) {
    const { error } = await supabase
      ?.from('sub_module_records')
      ?.delete()
      ?.in('id', ids);
    
    if (error) throw error;
  },

  // Search records with full text
  async search(subModuleId, query) {
    const { data, error } = await supabase
      ?.from('sub_module_records')
      ?.select('*')
      ?.eq('sub_module_id', subModuleId)
      ?.eq('status', 'active')
      ?.ilike('data', `%${query}%`)
      ?.limit(50);
    
    if (error) throw error;
    return data;
  },

  // Get records with related data (for detail views)
  async getWithRelations(id) {
    const { data, error } = await supabase
      ?.from('sub_module_records')
      ?.select(`
        *,
        created_by_user:created_by(id, full_name, avatar_url),
        updated_by_user:updated_by(id, full_name, avatar_url),
        assigned_to_user:assigned_to(id, full_name, avatar_url)
      `)
      ?.eq('id', id)
      ?.single();
    
    if (error) throw error;
    return data;
  }
};
