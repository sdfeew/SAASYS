import { supabase } from '../lib/supabase';

export const taskService = {
  async getAll() {
    const { data, error } = await supabase?.from('tasks')?.select(`
        *,
        assigned_user:user_profiles!tasks_assigned_to_fkey(full_name, avatar_url),
        created_user:user_profiles!tasks_created_by_fkey(full_name)
      `)?.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(task => ({
      id: task?.id,
      title: task?.title,
      description: task?.description,
      priority: task?.priority,
      status: task?.status,
      dueDate: task?.due_date,
      assignedTo: task?.assigned_to,
      assignedUserName: task?.assigned_user?.full_name,
      assignedUserAvatar: task?.assigned_user?.avatar_url,
      createdBy: task?.created_by,
      createdAt: task?.created_at
    }));
  },

  async create(task) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('tasks')?.insert({
        title: task?.title,
        description: task?.description,
        priority: task?.priority,
        status: task?.status,
        due_date: task?.dueDate,
        assigned_to: task?.assignedTo,
        created_by: user?.id
      })?.select()?.single();
    
    if (error) throw error;
    return data;
  },

  async update(id, task) {
    const { data, error } = await supabase?.from('tasks')?.update({
        title: task?.title,
        description: task?.description,
        priority: task?.priority,
        status: task?.status,
        due_date: task?.dueDate,
        assigned_to: task?.assignedTo
      })?.eq('id', id)?.select()?.single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase?.from('tasks')?.delete()?.eq('id', id);
    
    if (error) throw error;
  }
};