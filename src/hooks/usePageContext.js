import { useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for common page functionality
 * Provides toast notifications, auth context, and common handlers
 */
export const usePageContext = () => {
  const toast = useToast();
  const auth = useAuth();

  // Success notification
  const notifySuccess = useCallback((message) => {
    toast.success(message);
  }, [toast]);

  // Error notification with auto-logging
  const notifyError = useCallback((message, error = null) => {
    if (error) {
      console.error(message, error);
    }
    toast.error(message);
  }, [toast]);

  // Warning notification
  const notifyWarning = useCallback((message) => {
    toast.warning(message);
  }, [toast]);

  // Info notification
  const notifyInfo = useCallback((message) => {
    toast.info(message);
  }, [toast]);

  // Handle async operations with loading state
  const handleAsync = useCallback(async (asyncFn, successMsg, errorMsg) => {
    try {
      const result = await asyncFn();
      if (successMsg) notifySuccess(successMsg);
      return result;
    } catch (error) {
      const message = error?.message || errorMsg || 'An error occurred';
      notifyError(message, error);
      throw error;
    }
  }, [notifySuccess, notifyError]);

  return {
    toast,
    auth,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    handleAsync
  };
};

export default usePageContext;
