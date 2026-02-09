import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const TenantInvitePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, signIn, loading: authLoading } = useAuth();
  
  const invitationCode = searchParams.get('code');
  const invitedEmail = searchParams.get('email');
  
  const [step, setStep] = useState('verify'); // verify, register, or login
  const [tenantInfo, setTenantInfo] = useState(null);
  const [invitationInfo, setInvitationInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: ''
  });
  
  const [credentials, setCredentials] = useState({
    email: invitedEmail || '',
    password: ''
  });

  // Verify invitation code
  useEffect(() => {
    const verifyInvitation = async () => {
      if (!invitationCode) {
        setError('No invitation code provided');
        setLoading(false);
        return;
      }

      try {
        // First, get the invitation info WITHOUT RLS (use admin key or bypass)
        const { data: invitation, error: invError } = await supabase
          .from('tenant_invitations')
          .select('id, tenant_id, email, status, expires_at, role_code')
          .eq('code', invitationCode)
          .single();

        if (invError || !invitation) {
          setError('Invalid or expired invitation code');
          setLoading(false);
          return;
        }

        // Check if invitation is still valid
        if (invitation.status !== 'pending' && invitation.status !== 'sent') {
          setError('This invitation has already been used or is no longer valid');
          setLoading(false);
          return;
        }

        // Check expiration
        if (new Date(invitation.expires_at) < new Date()) {
          setError('This invitation has expired');
          setLoading(false);
          return;
        }

        // Get tenant info
        const { data: tenant, error: tenantError } = await supabase
          .from('tenants')
          .select('id, name, logo_url')
          .eq('id', invitation.tenant_id)
          .single();

        if (tenantError || !tenant) {
          setError('Tenant not found');
          setLoading(false);
          return;
        }

        setInvitationInfo(invitation);
        setTenantInfo(tenant);
        setCredentials(prev => ({ ...prev, email: invitation.email }));
        setFormData(prev => ({ ...prev, fullName: '' }));
        
        // Determine next step
        if (invitedEmail) {
          setStep('register'); // New user - show registration
        } else {
          setStep('login'); // Existing email - show login
        }
      } catch (err) {
        console.error('Error verifying invitation:', err);
        setError('Failed to verify invitation');
      } finally {
        setLoading(false);
      }
    };

    verifyInvitation();
  }, [invitationCode, invitedEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (step === 'register') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setCredentials(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError(null);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.fullName || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Sign up the new user
      const { data, error: signUpError } = await signUp(
        credentials.email,
        formData.password,
        formData.fullName
      );

      if (signUpError) {
        setError(signUpError?.message || 'Failed to create account');
        return;
      }

      if (data?.user?.id) {
        // Create user profile with tenant info
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            tenant_id: invitationInfo.tenant_id,
            email: credentials.email,
            full_name: formData.fullName,
            role_code: invitationInfo.role_code || 'user',
            permissions: getPermissionsForRole(invitationInfo.role_code)
          });

        if (profileError) {
          setError('Failed to create user profile');
          return;
        }

        // Mark invitation as accepted
        await supabase
          .from('tenant_invitations')
          .update({ status: 'accepted', accepted_at: new Date().toISOString() })
          .eq('id', invitationInfo.id);

        // Redirect to dashboard
        navigate('/');
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setError(err?.message || 'An error occurred');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!credentials.email || !credentials.password) {
      setError('Please enter email and password');
      return;
    }

    try {
      const { data, error: signInError } = await signIn(
        credentials.email,
        credentials.password
      );

      if (signInError) {
        setError(signInError?.message || 'Invalid credentials');
        return;
      }

      if (data?.user?.id) {
        // Check if user has profile for this tenant
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', data.user.id)
          .eq('tenant_id', invitationInfo.tenant_id)
          .single();

        if (profileError || !profile) {
          // Create profile for this tenant
          const { error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              tenant_id: invitationInfo.tenant_id,
              email: credentials.email,
              full_name: data.user.user_metadata?.full_name || 'User',
              role_code: invitationInfo.role_code || 'user',
              permissions: getPermissionsForRole(invitationInfo.role_code)
            });

          if (createError) {
            setError('Failed to set up tenant access');
            return;
          }
        }

        // Mark invitation as accepted
        await supabase
          .from('tenant_invitations')
          .update({ status: 'accepted', accepted_at: new Date().toISOString() })
          .eq('id', invitationInfo.id);

        // Redirect to dashboard
        navigate('/');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError(err?.message || 'Login failed');
    }
  };

  const getPermissionsForRole = (role) => {
    const rolePermissions = {
      admin: ['*'],
      owner: ['*'],
      editor: ['module:create', 'module:read', 'module:update', 'record:create', 'record:read', 'record:update'],
      viewer: ['module:read', 'record:read'],
      user: ['record:create', 'record:read', 'record:update']
    };
    return rolePermissions[role] || ['record:read'];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Icon name="Loader2" className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          {tenantInfo?.logo_url ? (
            <img src={tenantInfo.logo_url} alt={tenantInfo.name} className="h-12 mx-auto mb-4" />
          ) : (
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 mb-4">
              <Icon name="Building2" className="w-6 h-6 text-white" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-slate-900">{tenantInfo?.name || 'TenantFlow'}</h1>
          <p className="text-slate-600 text-sm mt-2">You've been invited to join</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {step === 'register' && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Create Your Account</h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={credentials.email}
                    disabled
                    className="bg-slate-100"
                  />
                  <p className="text-xs text-slate-600 mt-1">From your invitation</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-slate-600 mt-1">At least 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={authLoading}
                  loading={authLoading}
                >
                  Create Account & Join
                </Button>
              </form>
            </>
          )}

          {step === 'login' && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Sign In to Join</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={authLoading}
                  loading={authLoading}
                >
                  Sign In & Join Organization
                </Button>
              </form>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              Having trouble? Contact your administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantInvitePage;
