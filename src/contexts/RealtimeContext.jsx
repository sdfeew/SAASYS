import React, { createContext, useContext, useState, useEffect } from 'react';
import { realtimeService } from '../services/realtimeService';
import { errorHandler } from '../utils/errorHandler';

const RealtimeContext = createContext();

export const RealtimeProvider = ({ children }) => {
  const [activeNotifications, setActiveNotifications] = useState([]);
  const [recordUpdates, setRecordUpdates] = useState({});
  const [userPresence, setUserPresence] = useState({});

  const subscribeToRecordUpdates = (moduleId, callback) => {
    try {
      const unsubscribe = realtimeService.subscribeToRecords(moduleId, (event) => {
        setRecordUpdates(prev => ({
          ...prev,
          [event.data?.id]: event
        }));
        callback?.(event);
      });
      return unsubscribe;
    } catch (error) {
      errorHandler.logError('RealtimeContext:subscribeToRecordUpdates', error);
    }
  };

  const subscribeToNotifications = (userId, callback) => {
    try {
      const unsubscribe = realtimeService.subscribeToNotifications(userId, (event) => {
        setActiveNotifications(prev => [event.data, ...prev].slice(0, 50));
        callback?.(event);
      });
      return unsubscribe;
    } catch (error) {
      errorHandler.logError('RealtimeContext:subscribeToNotifications', error);
    }
  };

  const subscribeToComments = (recordId, callback) => {
    try {
      return realtimeService.subscribeToComments(recordId, callback);
    } catch (error) {
      errorHandler.logError('RealtimeContext:subscribeToComments', error);
    }
  };

  const subscribeToActivity = (recordId, callback) => {
    try {
      return realtimeService.subscribeToActivity(recordId, callback);
    } catch (error) {
      errorHandler.logError('RealtimeContext:subscribeToActivity', error);
    }
  };

  const subscribeToWorkflows = (workflowId, callback) => {
    try {
      return realtimeService.subscribeToWorkflows(workflowId, callback);
    } catch (error) {
      errorHandler.logError('RealtimeContext:subscribeToWorkflows', error);
    }
  };

  const clearNotifications = () => {
    setActiveNotifications([]);
  };

  const removeNotification = (notificationId) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  useEffect(() => {
    return () => {
      realtimeService.unsubscribeAll();
    };
  }, []);

  const value = {
    activeNotifications,
    recordUpdates,
    userPresence,
    subscribeToRecordUpdates,
    subscribeToNotifications,
    subscribeToComments,
    subscribeToActivity,
    subscribeToWorkflows,
    clearNotifications,
    removeNotification
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
};
