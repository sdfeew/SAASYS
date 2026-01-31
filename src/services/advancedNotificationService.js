import { supabase } from '../lib/supabase';
import { errorHandler } from '../utils/errorHandler';

/**
 * Advanced Notification System
 * In-app notifications, email alerts, and notification preferences
 */

export const advancedNotificationService = {
  // Create notification
  async createNotification(notification) {
    try {
      if (!notification.userId) throw new Error('User ID is required');
      if (!notification.type) throw new Error('Notification type is required');

      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data || {},
          read: false,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      errorHandler.logError('AdvancedNotificationService:createNotification', error);
      throw error;
    }
  },

  // Bulk create notifications (e.g., for workflow completion)
  async createBulkNotifications(notifications) {
    try {
      if (!Array.isArray(notifications) || notifications.length === 0) {
        throw new Error('At least one notification is required');
      }

      const formattedNotifications = notifications.map(n => ({
        user_id: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data || {},
        read: false,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('notifications')
        .insert(formattedNotifications)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('AdvancedNotificationService:createBulkNotifications', error);
      throw error;
    }
  },

  // Get user notifications
  async getUserNotifications(userId, options = {}) {
    try {
      if (!userId) throw new Error('User ID is required');

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Filter by read status
      if (options.unreadOnly) {
        query = query.eq('read', false);
      }

      // Limit results
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      errorHandler.logError('AdvancedNotificationService:getUserNotifications', error);
      throw error;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      if (!notificationId) throw new Error('Notification ID is required');

      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      errorHandler.logError('AdvancedNotificationService:markAsRead', error);
      throw error;
    }
  },

  // Mark multiple notifications as read
  async markMultipleAsRead(notificationIds) {
    try {
      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        throw new Error('At least one notification ID is required');
      }

      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .in('id', notificationIds)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('AdvancedNotificationService:markMultipleAsRead', error);
      throw error;
    }
  },

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      if (!notificationId) throw new Error('Notification ID is required');

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      errorHandler.logError('AdvancedNotificationService:deleteNotification', error);
      throw error;
    }
  },

  // Clear all read notifications
  async clearReadNotifications(userId) {
    try {
      if (!userId) throw new Error('User ID is required');

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .eq('read', true);

      if (error) throw error;
      return true;
    } catch (error) {
      errorHandler.logError('AdvancedNotificationService:clearReadNotifications', error);
      throw error;
    }
  },

  // Get notification preferences
  async getNotificationPreferences(userId) {
    try {
      if (!userId) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Return default preferences if none exist
      return data || {
        userId,
        emailNotifications: true,
        inAppNotifications: true,
        recordUpdates: true,
        commentNotifications: true,
        workflowNotifications: true,
        dailyDigest: false,
        weeklyReport: true,
        quietHours: false,
        quietStart: '22:00',
        quietEnd: '08:00'
      };
    } catch (error) {
      errorHandler.logError('AdvancedNotificationService:getNotificationPreferences', error);
      throw error;
    }
  },

  // Update notification preferences
  async updateNotificationPreferences(userId, preferences) {
    try {
      if (!userId) throw new Error('User ID is required');

      const existingPrefs = await this.getNotificationPreferences(userId);

      const updated = {
        ...existingPrefs,
        ...preferences,
        user_id: userId
      };

      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert([updated], { onConflict: 'user_id' })
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      errorHandler.logError('AdvancedNotificationService:updateNotificationPreferences', error);
      throw error;
    }
  },

  // Send email notification
  async sendEmailNotification(email, subject, message, data = {}) {
    try {
      if (!email) throw new Error('Email is required');
      if (!subject) throw new Error('Subject is required');
      if (!message) throw new Error('Message is required');

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message, data })
      });

      if (!response.ok) throw new Error('Failed to send email');
      return await response.json();
    } catch (error) {
      errorHandler.logError('AdvancedNotificationService:sendEmailNotification', error);
      throw error;
    }
  },

  // Create notification template
  async createNotificationTemplate(template) {
    try {
      if (!template.name) throw new Error('Template name is required');
      if (!template.type) throw new Error('Template type is required');
      if (!template.message) throw new Error('Template message is required');

      const { data, error } = await supabase
        .from('notification_templates')
        .insert([{
          name: template.name,
          type: template.type,
          message: template.message,
          subject: template.subject,
          variables: template.variables || [],
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      errorHandler.logError('AdvancedNotificationService:createNotificationTemplate', error);
      throw error;
    }
  },

  // Use notification template
  async useNotificationTemplate(templateId, variables = {}) {
    try {
      if (!templateId) throw new Error('Template ID is required');

      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;

      // Replace variables in message
      let message = data.message;
      let subject = data.subject;

      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        message = message.replace(regex, value);
        subject = subject.replace(regex, value);
      });

      return {
        ...data,
        message,
        subject
      };
    } catch (error) {
      errorHandler.logError('AdvancedNotificationService:useNotificationTemplate', error);
      throw error;
    }
  },

  // Get notification statistics
  async getNotificationStats(userId) {
    try {
      if (!userId) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const unread = data.filter(n => !n.read).length;
      const byType = {};

      data.forEach(n => {
        byType[n.type] = (byType[n.type] || 0) + 1;
      });

      return {
        total: data.length,
        unread,
        byType,
        oldestUnread: data.find(n => !n.read)?.created_at
      };
    } catch (error) {
      errorHandler.logError('AdvancedNotificationService:getNotificationStats', error);
      throw error;
    }
  }
};

export default advancedNotificationService;
