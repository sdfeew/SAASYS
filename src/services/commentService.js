import { supabase } from '../lib/supabase';

export const commentService = {
  // Add a comment
  async add(recordId, moduleId, commentText, tenantId, authorId, mentions = []) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          record_id: recordId,
          module_id: moduleId,
          tenant_id: tenantId,
          comment_text: commentText,
          author_id: authorId,
          mentions: mentions
        })
        .select(`
          *,
          author:author_id(id, full_name, avatar_url, email)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Reply to a comment (threaded)
  async reply(recordId, moduleId, commentText, tenantId, authorId, parentCommentId, mentions = []) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          record_id: recordId,
          module_id: moduleId,
          tenant_id: tenantId,
          comment_text: commentText,
          author_id: authorId,
          parent_comment_id: parentCommentId,
          mentions: mentions
        })
        .select(`
          *,
          author:author_id(id, full_name, avatar_url, email)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error replying to comment:', error);
      throw error;
    }
  },

  // Get all comments for a record (with replies)
  async getByRecord(recordId, tenantId) {
    try {
      // Get root comments and their replies
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('record_id', recordId)
        .eq('tenant_id', tenantId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get all author IDs
      const authorIds = new Set();
      const allCommentIds = [];
      
      data?.forEach(comment => {
        authorIds.add(comment.author_id);
        allCommentIds.push(comment.id);
      });

      // Get replies for all root comments
      const { data: replies } = await supabase
        .from('comments')
        .select('*')
        .in('parent_comment_id', allCommentIds);

      replies?.forEach(reply => authorIds.add(reply.author_id));

      // Fetch all user profiles
      let userProfiles = {};
      if (authorIds.size > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, full_name, avatar_url, email')
          .in('id', Array.from(authorIds));
        
        profiles?.forEach(profile => {
          userProfiles[profile.id] = profile;
        });
      }

      // Build comment tree with user info
      return (data || []).map(comment => ({
        ...comment,
        author: userProfiles[comment.author_id] || { id: comment.author_id },
        replies: (replies || [])
          .filter(r => r.parent_comment_id === comment.id)
          .map(reply => ({
            ...reply,
            author: userProfiles[reply.author_id] || { id: reply.author_id }
          }))
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  // Legacy method for compatibility
  async getByRecordLegacy(recordId) {
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

  // Update a comment
  async update(commentId, newText, mentions = []) {
    try {
      const { data, error } = await supabase
        .from('record_comments')
        .update({
          comment_text: newText,
          is_edited: true,
          edited_at: new Date().toISOString(),
          mentions: mentions
        })
        .eq('id', commentId)
        .select(`
          *,
          author:author_id(id, full_name, avatar_url, email)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  // Delete a comment
  async delete(commentId) {
    try {
      const { error } = await supabase
        .from('record_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  // Get comment count for a record
  async getCount(recordId, tenantId) {
    try {
      const { count, error } = await supabase
        .from('record_comments')
        .select('*', { count: 'exact', head: true })
        .eq('record_id', recordId)
        .eq('tenant_id', tenantId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting comment count:', error);
      return 0;
    }
  },

  // Search comments
  async search(recordId, tenantId, searchTerm) {
    try {
      const { data, error } = await supabase
        .from('record_comments')
        .select(`
          *,
          author:author_id(id, full_name, avatar_url, email)
        `)
        .eq('record_id', recordId)
        .eq('tenant_id', tenantId)
        .ilike('comment_text', `%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching comments:', error);
      throw error;
    }
  },

  async notifyMentions(tenantId, mentions, commentId, recordId) {
    // Placeholder for notification logic
    console.log('Notifying mentions:', mentions);
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
