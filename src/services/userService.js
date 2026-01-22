import { supabase } from '../lib/supabase';

export const userService = {
  async getAll() {
    const { data, error } = await supabase?.from('user_profiles')?.select('*')?.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(user => ({
      id: user?.id,
      name: user?.full_name,
      email: user?.email,
      role: user?.role,
      status: user?.status,
      department: user?.department,
      jobTitle: user?.job_title,
      phone: user?.phone,
      avatarUrl: user?.avatar_url,
      lastLogin: user?.last_login ? new Date(user.last_login) : null,
      createdAt: user?.created_at,
      updatedAt: user?.updated_at
    }));
  },

  async getById(id) {
    const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', id)?.single();
    
    if (error) throw error;
    
    return {
      id: data?.id,
      name: data?.full_name,
      email: data?.email,
      role: data?.role,
      status: data?.status,
      department: data?.department,
      jobTitle: data?.job_title,
      phone: data?.phone,
      avatarUrl: data?.avatar_url,
      lastLogin: data?.last_login ? new Date(data.last_login) : null
    };
  },

  async update(id, userData) {
    const { data, error } = await supabase?.from('user_profiles')?.update({
        full_name: userData?.name,
        role: userData?.role,
        status: userData?.status,
        department: userData?.department,
        job_title: userData?.jobTitle,
        phone: userData?.phone,
        avatar_url: userData?.avatarUrl
      })?.eq('id', id)?.select()?.single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase?.from('user_profiles')?.delete()?.eq('id', id);
    
    if (error) throw error;
  },

  async updateLastLogin(id) {
    const { error } = await supabase?.from('user_profiles')?.update({ last_login: new Date()?.toISOString() })?.eq('id', id);
    
    if (error) throw error;
  }
};