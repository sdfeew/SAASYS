import { supabase } from '../lib/supabase';

export const commentService = {
  async getByRecord(recordId) {
    const { data, error } = await supabase
      ?.from('comments')
      ?.select('*, author:author_id(id, full_name, avatar_url)')
      ?.eq('record_id', recordId)
      ?.eq('parent_comment_id', null)
      ?.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getReplies(parentCommentId) {
    const { data, error } = await supabase
      ?.from('comments')
      ?.select('*, author:author_id(id, full_name, avatar_url)')
      ?.eq('parent_comment_id', parentCommentId)
      ?.order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      ?.from('comments')
      ?.select('*, author:author_id(id, full_name, avatar_url)')
      ?.eq('id', id)
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async create(tenantId, recordId, content, mentions = [], isInternal = false) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: record } = await supabase
      ?.from('sub_module_records')
      ?.select('sub_module_id')
      ?.eq('id', recordId)
      ?.single();

    const { data, error } = await supabase
      ?.from('comments')
      ?.insert({
        tenant_id: tenantId,
        sub_module_id: record?.sub_module_id,
        record_id: recordId,
        author_id: user?.id,
        content,
        mentions: mentions || [],
        is_internal: isInternal
      })
      ?.select('*, author:author_id(id, full_name, avatar_url)')
      ?.single();
    
    if (error) throw error;

    // Create notifications for mentioned users
    if (mentions && mentions.length > 0) {
      await this.notifyMentions(tenantId, mentions, data?.id, recordId);
    }

    return data;
  },

  async reply(tenantId, recordId, parentCommentId, content, mentions = []) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: record } = await supabase
      ?.from('sub_module_records')
      ?.select('sub_module_id')
      ?.eq('id', recordId)
      ?.single();

    const { data, error } = await supabase
      ?.from('comments')
      ?.insert({
        tenant_id: tenantId,
        sub_module_id: record?.sub_module_id,
        record_id: recordId,
        parent_comment_id: parentCommentId,
        author_id: user?.id,
        content,
        mentions: mentions || []
      })
      ?.select('*, author:author_id(id, full_name, avatar_url)')
      ?.single();
    
    if (error) throw error;

    // Create notifications for mentioned users
    if (mentions && mentions.length > 0) {
      await this.notifyMentions(tenantId, mentions, data?.id, recordId);
    }

    return data;
  },

  async update(id, content) {
    const { data, error } = await supabase
      ?.from('comments')
      ?.update({ content })
      ?.eq('id', id)
      ?.select('*, author:author_id(id, full_name, avatar_url)')
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      ?.from('comments')
      ?.delete()
      ?.eq('id', id);
    
    if (error) throw error;
  },

  // Create notifications for mentioned users
  async notifyMentions(tenantId, mentionedUserIds, commentId, recordId) {
    if (!Array.isArray(mentionedUserIds) || mentionedUserIds.length === 0) return;

    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) return;

    const { data: userProfile } = await supabase
      ?.from('user_profiles')
      ?.select('full_name')
      ?.eq('id', user?.id)
      ?.single();

    const notifications = mentionedUserIds.map(userId => ({
      tenant_id: tenantId,
      user_id: userId,
      type: 'COMMENT_MENTION',
      title: `${userProfile?.full_name} mentioned you`,
      message: 'You were mentioned in a comment',
      link_url: `/record/${recordId}`,
      data: { commentId, recordId }
    }));

    const { error } = await supabase
      ?.from('notifications')
      ?.insert(notifications);
    
    if (error) {
      console.error('Error creating mention notifications:', error);
    }
  }
};
