import { supabase } from '../lib/supabase';

export const activityService = {
  // Log an activity
  async log(recordId, moduleId, activityType, tenantId, userId, userName, userEmail, description, changes = {}, metadata = {}) {
    try {
      const { data, error } = await supabase
        .from('record_activity')
        .insert({
          record_id: recordId,
          module_id: moduleId,
          tenant_id: tenantId,
          activity_type: activityType,
          user_id: userId,
          user_name: userName,
          user_email: userEmail,
          description,
          changes,
          metadata
        })
        .select(`
          *,
          user:user_id(id, full_name, avatar_url, email)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  },

  // Log field change
  async logFieldChange(recordId, moduleId, tenantId, userId, userName, userEmail, fieldName, oldValue, newValue, metadata = {}) {
    return this.log(
      recordId,
      moduleId,
      'field_changed',
      tenantId,
      userId,
      userName,
      userEmail,
      `Changed ${fieldName} from "${oldValue}" to "${newValue}"`,
      {
        fieldName,
        oldValue,
        newValue
      },
      metadata
    );
  },

  // Log attachment added
  async logAttachmentAdded(recordId, moduleId, tenantId, userId, userName, userEmail, fileName, metadata = {}) {
    return this.log(
      recordId,
      moduleId,
      'attachment_added',
      tenantId,
      userId,
      userName,
      userEmail,
      `Uploaded file: ${fileName}`,
      { fileName },
      metadata
    );
  },

  // Log attachment removed
  async logAttachmentRemoved(recordId, moduleId, tenantId, userId, userName, userEmail, fileName, metadata = {}) {
    return this.log(
      recordId,
      moduleId,
      'attachment_removed',
      tenantId,
      userId,
      userName,
      userEmail,
      `Removed file: ${fileName}`,
      { fileName },
      metadata
    );
  },

  // Log comment added
  async logCommentAdded(recordId, moduleId, tenantId, userId, userName, userEmail, commentPreview, metadata = {}) {
    return this.log(
      recordId,
      moduleId,
      'comment_added',
      tenantId,
      userId,
      userName,
      userEmail,
      `Added comment: ${commentPreview}`,
      { commentPreview },
      metadata
    );
  },

  // Log status change
  async logStatusChange(recordId, moduleId, tenantId, userId, userName, userEmail, oldStatus, newStatus, metadata = {}) {
    return this.log(
      recordId,
      moduleId,
      'status_changed',
      tenantId,
      userId,
      userName,
      userEmail,
      `Changed status from "${oldStatus}" to "${newStatus}"`,
      { oldStatus, newStatus },
      metadata
    );
  },

  // Get activity timeline for a record
  async getByRecord(recordId, tenantId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('record_activity')
        .select('*')
        .eq('record_id', recordId)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      
      // Activities already have user_name, user_email in the data
      // No need to fetch additional user profiles
      return data || [];
    } catch (error) {
      console.error('Error fetching activity:', error);
      return [];
    }
  },

  // Get activity by type
  async getByType(recordId, tenantId, activityType, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('record_activity')
        .select(`
          *,
          user:user_id(id, full_name, avatar_url, email)
        `)
        .eq('record_id', recordId)
        .eq('tenant_id', tenantId)
        .eq('activity_type', activityType)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching activity by type:', error);
      return [];
    }
  },

  // Get activity count
  async getCount(recordId, tenantId) {
    try {
      const { count, error } = await supabase
        .from('record_activity')
        .select('*', { count: 'exact', head: true })
        .eq('record_id', recordId)
        .eq('tenant_id', tenantId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting activity count:', error);
      return 0;
    }
  },

  // Get activity types summary
  async getSummary(recordId, tenantId) {
    try {
      const { data, error } = await supabase
        .from('record_activity')
        .select('activity_type')
        .eq('record_id', recordId)
        .eq('tenant_id', tenantId);

      if (error) throw error;

      const summary = {};
      data?.forEach(activity => {
        summary[activity.activity_type] = (summary[activity.activity_type] || 0) + 1;
      });

      return summary;
    } catch (error) {
      console.error('Error getting activity summary:', error);
      return {};
    }
  },

  // Search activities
  async search(recordId, tenantId, searchTerm) {
    try {
      const { data, error } = await supabase
        .from('record_activity')
        .select(`
          *,
          user:user_id(id, full_name, avatar_url, email)
        `)
        .eq('record_id', recordId)
        .eq('tenant_id', tenantId)
        .ilike('description', `%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching activities:', error);
      return [];
    }
  },

  // Legacy method for compatibility
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