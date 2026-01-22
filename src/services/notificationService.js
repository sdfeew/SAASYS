import { supabase } from '../lib/supabase';

export const notificationService = {
  async getUnread(userId) {
    const { data, error } = await supabase
      ?.from('notifications')
      ?.select('*')
      ?.eq('user_id', userId)
      ?.eq('is_read', false)
      ?.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getAll(userId, limit = 50, offset = 0) {
    const { data, error } = await supabase
      ?.from('notifications')
      ?.select('*', { count: 'exact' })
      ?.eq('user_id', userId)
      ?.order('created_at', { ascending: false })
      ?.range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      ?.from('notifications')
      ?.select('*')
      ?.eq('id', id)
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async markAsRead(id) {
    const { data, error } = await supabase
      ?.from('notifications')
      ?.update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      ?.eq('id', id)
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async markAllAsRead(userId) {
    const { data, error } = await supabase
      ?.from('notifications')
      ?.update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      ?.eq('user_id', userId)
      ?.eq('is_read', false)
      ?.select();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      ?.from('notifications')
      ?.delete()
      ?.eq('id', id);
    
    if (error) throw error;
  },

  async deleteAll(userId) {
    const { error } = await supabase
      ?.from('notifications')
      ?.delete()
      ?.eq('user_id', userId);
    
    if (error) throw error;
  },

  // Create notification (used internally)
  async create(tenantId, userId, notification) {
    const { data, error } = await supabase
      ?.from('notifications')
      ?.insert({
        tenant_id: tenantId,
        user_id: userId,
        type: notification?.type,
        title: notification?.title,
        message: notification?.message,
        link_url: notification?.linkUrl,
        data: notification?.data || {}
      })
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  },

  // Subscribe to notifications in real-time
  subscribeToNotifications(userId, callback) {
    return supabase
      ?.from(`notifications:user_id=eq.${userId}`)
      ?.on('*', payload => {
        callback(payload);
      })
      ?.subscribe();
  }
};
