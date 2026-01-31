/**
 * useAsync Hook
 * Handles loading, error, and data states for async operations
 */

import { useState, useEffect, useCallback } from 'react';

export const useAsync = (asyncFunction, immediate = true) => {
  const [state, setState] = useState({
    status: 'idle',
    data: null,
    error: null
  });

  // The execute function wraps asyncFunction and handles setting state
  const execute = useCallback(async (...args) => {
    setState({ status: 'pending', data: null, error: null });
    try {
      const response = await asyncFunction(...args);
      setState({ status: 'success', data: response, error: null });
      return response;
    } catch (error) {
      setState({ status: 'error', data: null, error });
      throw error;
    }
  }, [asyncFunction]);

  // Call execute if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
};

export default useAsync;
