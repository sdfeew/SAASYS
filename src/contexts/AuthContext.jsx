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
        } else if (error?.code === 'PGRST116') {
          // Profile doesn't exist - create it with a default tenant
          console.log('Profile not found, creating new profile...');
          await this.createDefaultProfile(userId);
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

    async createDefaultProfile(userId) {
      try {
        const { data: { user } } = await supabase?.auth?.getUser();
        if (!user) return;

        // Use a deterministic tenant ID based on user ID
        const tenantId = user?.id;
        const userEmail = user?.email || '';
        const fullName = user?.user_metadata?.full_name || userEmail?.split('@')[0] || 'User';

        // Step 1: Ensure tenant exists - create one if it doesn't
        console.log('Checking if tenant exists:', tenantId);
        
        const { data: existingTenant, error: tenantCheckError } = await supabase
          ?.from('tenants')
          ?.select('id')
          ?.eq('id', tenantId)
          ?.single();

        if (!existingTenant && !tenantCheckError) {
          // Tenant doesn't exist, create it
          console.log('Creating new tenant for user:', tenantId);
          
          const { data: newTenant, error: tenantError } = await supabase
            ?.from('tenants')
            ?.insert([{
              id: tenantId,
              name: `${fullName}'s Workspace`,
              code: `tenant-${tenantId.slice(0, 8)}`,
              status: 'active',
              subscription_plan: 'professional'
            }])
            ?.select()
            ?.single();

          if (tenantError) {
            console.error('Failed to create tenant:', tenantError);
            setError('Failed to create workspace. Please contact support.');
            return;
          }
          console.log('Tenant created successfully:', newTenant.id);
        }

        // Step 2: Create user profile
        const newProfile = {
          id: userId,
          tenant_id: tenantId,
          email: userEmail,
          full_name: fullName,
          role_code: 'admin', // Default to admin for first user
          avatar_url: null,
          department: null,
          permissions: [],
          notification_preferences: {}
        };

        console.log('Creating profile with:', newProfile);

        // Insert and select only the columns we know exist
        const { data, error: insertError } = await supabase
          ?.from('user_profiles')
          ?.insert([newProfile])
          ?.select('id, tenant_id, email, full_name, role_code, avatar_url, department, permissions, notification_preferences, created_at, updated_at')
          ?.single();

        if (!insertError && data) {
          setUserProfile(data);
          setTenantId(data?.tenant_id);
          setRoleCode(data?.role_code);
          setPermissions(data?.permissions || []);
          console.log('Profile created successfully:', data);
        } else {
          console.error('Failed to create profile:', insertError);
          setError('Failed to create user profile. Please contact support.');
        }
      } catch (error) {
        console.error('Error creating default profile:', error);
        setError(error?.message || 'Failed to create user profile');
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

  const updatePassword = async (password, token) => {
    try {
      setError(null);
      // The token should be automatically handled by Supabase from the URL
      // Call updateUser with the new password
      const { data, error } = await supabase?.auth?.updateUser({
        password: password
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

  // Resend verification email
  const resendVerification = async (email) => {
    try {
      setError(null);
      const { data, error } = await supabase?.auth?.resend({
        type: 'signup',
        email: email
      });
      
      if (error) {
        setError(error?.message);
      }
      
      return { data, error };
    } catch (error) {
      const message = 'Failed to resend verification email. Please try again.';
      setError(message);
      return { data: null, error: { message } };
    }
  };

  // Get user by ID
  const getUserById = async (userId) => {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.eq('id', userId)
        ?.single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  };

  // Update user role
  const updateUserRole = async (userId, newRole) => {
    if (!user || roleCode !== 'admin') {
      return { data: null, error: { message: 'Unauthorized: Only admins can update user roles' } };
    }

    try {
      setError(null);
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.update({ role_code: newRole })
        ?.eq('id', userId)
        ?.select()
        ?.single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      const message = 'Failed to update user role';
      setError(message);
      return { data: null, error: { message } };
    }
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
    updatePassword,
    updateProfile,
    resendVerification,
    getUserById,
    updateUserRole,
    
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
