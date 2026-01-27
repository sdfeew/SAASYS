import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load unread notifications
  const loadUnreadNotifications = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const unreadNotifications = await notificationService?.getUnread(userId);
      setNotifications(unreadNotifications || []);
      setUnreadCount((unreadNotifications || []).length);
      setError(null);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load all notifications
  const loadAllNotifications = useCallback(async (limit = 50, offset = 0) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const allNotifications = await notificationService?.getAll(userId, limit, offset);
      setNotifications(allNotifications || []);
      setError(null);
    } catch (err) {
      console.error('Error loading all notifications:', err);
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService?.markAsRead(notificationId);
      setNotifications(notifications?.map(n =>
        n?.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [notifications, unreadCount]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    
    try {
      await notificationService?.markAllAsRead(userId);
      setNotifications(notifications?.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [userId, notifications]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService?.delete(notificationId);
      setNotifications(notifications?.filter(n => n?.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [notifications]);

  // Initial load
  useEffect(() => {
    if (userId) {
      loadUnreadNotifications();
    }
  }, [userId, loadUnreadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadUnreadNotifications,
    loadAllNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};
