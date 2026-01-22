import { supabase } from '../lib/supabase';

export const activityService = {
  async getAll(limit = 50) {
    const { data, error } = await supabase?.from('activities')?.select(`
        *,
        user_profiles!activities_user_id_fkey(full_name, avatar_url)
      `)?.order('created_at', { ascending: false })?.limit(limit);
    
    if (error) throw error;
    
    return data?.map(activity => ({
      id: activity?.id,
      userId: activity?.user_id,
      userName: activity?.user_profiles?.full_name || 'Unknown User',
      userAvatar: activity?.user_profiles?.avatar_url,
      action: activity?.action,
      entityType: activity?.entity_type,
      entityId: activity?.entity_id,
      details: activity?.details,
      createdAt: activity?.created_at
    }));
  },

  async create(activity) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('activities')?.insert({
        user_id: user?.id,
        action: activity?.action,
        entity_type: activity?.entityType,
        entity_id: activity?.entityId,
        details: activity?.details
      })?.select()?.single();
    
    if (error) throw error;
    return data;
  }
};