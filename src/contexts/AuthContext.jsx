import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [roleCode, setRoleCode] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState(null);

  // Isolated async operations - never called from auth callbacks
  const profileOperations = {
    async load(userId) {
      if (!userId) return;
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          ?.from('user_profiles')
          ?.select('*')
          ?.eq('id', userId)
          ?.single();
        
        if (!error && data) {
          setUserProfile(data);
          setTenantId(data?.tenant_id);
          setRoleCode(data?.role_code);
          setPermissions(data?.permissions || []);
        } else {
          console.error('Profile load error:', error);
          setError(error?.message || 'Failed to load user profile');
        }
      } catch (error) {
        console.error('Profile load error:', error);
        setError(error?.message || 'Failed to load user profile');
      } finally {
        setProfileLoading(false);
      }
    },

    clear() {
      setUserProfile(null);
      setTenantId(null);
      setRoleCode(null);
      setPermissions([]);
      setProfileLoading(false);
    }
  };

  // Auth state handlers - PROTECTED from async modification
  const authStateHandlers = {
    // This handler MUST remain synchronous - Supabase requirement
    onChange: (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        profileOperations?.load(session?.user?.id); // Fire-and-forget
      } else {
        profileOperations?.clear();
      }
    }
  };

  useEffect(() => {
    // Initial session check
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
      authStateHandlers?.onChange(null, session);
    });

    // CRITICAL: This must remain synchronous
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      authStateHandlers?.onChange
    );

    return () => subscription?.unsubscribe();
  }, []);

  // Auth methods
  const signUp = async (email, password, fullName) => {
    try {
      setError(null);
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      
      if (error) {
        setError(error?.message);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      const message = 'Network error. Please try again.';
      setError(message);
      return { data: null, error: { message } };
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      const { data, error } = await supabase?.auth?.signInWithPassword({ email, password });
      
      if (error) {
        setError(error?.message);
      }
      
      return { data, error };
    } catch (error) {
      const message = 'Network error. Please try again.';
      setError(message);
      return { data: null, error: { message } };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase?.auth?.signOut();
      
      if (!error) {
        setUser(null);
        profileOperations?.clear();
      } else {
        setError(error?.message);
      }
      
      return { error };
    } catch (error) {
      const message = 'Network error. Please try again.';
      setError(message);
      return { error: { message } };
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      const { data, error } = await supabase?.auth?.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      
      if (error) {
        setError(error?.message);
      }
      
      return { data, error };
    } catch (error) {
      const message = 'Network error. Please try again.';
      setError(message);
      return { data: null, error: { message } };
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return { data: null, error: { message: 'No user logged in' } };
    
    try {
      setError(null);
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.update(updates)
        ?.eq('id', user?.id)
        ?.select()
        ?.single();
      
      if (!error && data) {
        setUserProfile(data);
        setRoleCode(data?.role_code);
        setPermissions(data?.permissions || []);
      } else {
        setError(error?.message);
      }
      
      return { data, error };
    } catch (error) {
      const message = 'Network error. Please try again.';
      setError(message);
      return { data: null, error: { message } };
    }
  };

  // Helper function to check if user has permission
  const hasPermission = (permission) => {
    if (roleCode === 'admin') return true; // Admins have all permissions
    return Array.isArray(permissions) && permissions.includes(permission);
  };

  // Helper function to check if user has role
  const hasRole = (role) => {
    if (Array.isArray(role)) {
      return role.includes(roleCode);
    }
    return roleCode === role;
  };

  const value = {
    // User data
    user,
    userProfile,
    tenantId,
    roleCode,
    permissions,
    
    // Auth methods
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    
    // Loading states
    loading,
    profileLoading,
    error,
    
    // Helper methods
    hasPermission,
    hasRole,
    
    // Utility
    isAuthenticated: !!user,
    isAdmin: roleCode === 'admin',
    isManager: roleCode === 'manager'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
