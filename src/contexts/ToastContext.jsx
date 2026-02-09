import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration
    };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration = 3000) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const error = useCallback((message, duration = 4000) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const warning = useCallback((message, duration = 3500) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  const info = useCallback((message, duration = 3000) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};
