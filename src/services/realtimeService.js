/**
 * Advanced Real-time Sync Service
 * Handles WebSocket connections and real-time data synchronization
 */

import { supabase } from '../lib/supabase';
import { errorHandler } from '../utils/errorHandler';

export const realtimeService = {
  subscriptions: new Map(),

  // Subscribe to record changes
  subscribeToRecords(moduleId, callback) {
    try {
      const channel = `records:${moduleId}`;
      
      const subscription = supabase
        .channel(channel)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'records',
            filter: `module_id=eq.${moduleId}`
          },
          (payload) => {
            callback({
              type: payload.eventType,
              data: payload.new || payload.old,
              timestamp: new Date()
            });
          }
        )
        .subscribe();

      this.subscriptions.set(channel, subscription);
      return () => this.unsubscribe(channel);
    } catch (error) {
      errorHandler.logError('RealtimeService:subscribeToRecords', error);
      throw error;
    }
  },

  // Subscribe to comments
  subscribeToComments(recordId, callback) {
    try {
      const channel = `comments:${recordId}`;
      
      const subscription = supabase
        .channel(channel)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'comments',
            filter: `record_id=eq.${recordId}`
          },
          (payload) => {
            callback({
              type: payload.eventType,
              data: payload.new || payload.old,
              timestamp: new Date()
            });
          }
        )
        .subscribe();

      this.subscriptions.set(channel, subscription);
      return () => this.unsubscribe(channel);
    } catch (error) {
      errorHandler.logError('RealtimeService:subscribeToComments', error);
      throw error;
    }
  },

  // Subscribe to notifications
  subscribeToNotifications(userId, callback) {
    try {
      const channel = `notifications:${userId}`;
      
      const subscription = supabase
        .channel(channel)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            callback({
              type: 'new',
              data: payload.new,
              timestamp: new Date()
            });
          }
        )
        .subscribe();

      this.subscriptions.set(channel, subscription);
      return () => this.unsubscribe(channel);
    } catch (error) {
      errorHandler.logError('RealtimeService:subscribeToNotifications', error);
      throw error;
    }
  },

  // Subscribe to workflow executions
  subscribeToWorkflows(workflowId, callback) {
    try {
      const channel = `workflows:${workflowId}`;
      
      const subscription = supabase
        .channel(channel)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'workflow_executions',
            filter: `workflow_id=eq.${workflowId}`
          },
          (payload) => {
            callback({
              type: payload.eventType,
              data: payload.new || payload.old,
              timestamp: new Date()
            });
          }
        )
        .subscribe();

      this.subscriptions.set(channel, subscription);
      return () => this.unsubscribe(channel);
    } catch (error) {
      errorHandler.logError('RealtimeService:subscribeToWorkflows', error);
      throw error;
    }
  },

  // Subscribe to activity logs
  subscribeToActivity(recordId, callback) {
    try {
      const channel = `activity:${recordId}`;
      
      const subscription = supabase
        .channel(channel)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activities',
            filter: `record_id=eq.${recordId}`
          },
          (payload) => {
            callback({
              type: 'new',
              data: payload.new,
              timestamp: new Date()
            });
          }
        )
        .subscribe();

      this.subscriptions.set(channel, subscription);
      return () => this.unsubscribe(channel);
    } catch (error) {
      errorHandler.logError('RealtimeService:subscribeToActivity', error);
      throw error;
    }
  },

  // Unsubscribe from channel
  async unsubscribe(channel) {
    try {
      const subscription = this.subscriptions.get(channel);
      if (subscription) {
        await supabase.removeChannel(subscription);
        this.subscriptions.delete(channel);
      }
    } catch (error) {
      errorHandler.logError('RealtimeService:unsubscribe', error);
    }
  },

  // Unsubscribe all
  async unsubscribeAll() {
    try {
      for (const [channel, subscription] of this.subscriptions.entries()) {
        await supabase.removeChannel(subscription);
        this.subscriptions.delete(channel);
      }
    } catch (error) {
      errorHandler.logError('RealtimeService:unsubscribeAll', error);
    }
  },

  // Get active subscriptions count
  getActiveSubscriptions() {
    return this.subscriptions.size;
  }
};

export default realtimeService;
