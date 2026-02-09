import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, updateProfile, loading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenant: ''
  });
  
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    if (!formData.email || !formData.password || !formData.tenant) {
      setLocalError('Please fill in all fields including tenant');
      setIsSubmitting(false);
      return;
    }

    try {
      // Step 1: Sign in with email and password
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        setLocalError(error?.message || 'Failed to sign in');
        setIsSubmitting(false);
        return;
      }

      if (!data?.user) {
        setLocalError('Sign in failed');
        setIsSubmitting(false);
        return;
      }

      // Step 2: Verify and resolve tenant (by name or ID)
      let tenantData = null;
      const tenantInput = formData.tenant.trim();

      // Try to find tenant by ID first
      const { data: tenantById, error: tenantByIdError } = await supabase
        ?.from('tenants')
        ?.select('id, name')
        ?.eq('id', tenantInput)
        ?.single();

      if (tenantById) {
        tenantData = tenantById;
      } else {
        // Try to find tenant by name or code
        const { data: tenantByName, error: tenantByNameError } = await supabase
          ?.from('tenants')
          ?.select('id, name')
          ?.or(`name.eq.${tenantInput},code.eq.${tenantInput}`)
          ?.single();

        if (tenantByName) {
          tenantData = tenantByName;
        }
      }

      if (!tenantData) {
        setLocalError('Tenant not found. Please check the tenant name or ID.');
        setIsSubmitting(false);
        return;
      }

      // Step 3: Verify user belongs to this tenant
      const { data: userProfile, error: profileError } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.eq('id', data.user.id)
        ?.eq('tenant_id', tenantData.id)
        ?.single();

      if (profileError || !userProfile) {
        setLocalError('You do not have access to this tenant.');
        setIsSubmitting(false);
        return;
      }

      // Step 4: Update profile to set current tenant and redirect
      await updateProfile({ tenant_id: tenantData.id });
      
      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setLocalError(err?.message || 'An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 mb-4">
            <Icon name="Building2" className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">TenantFlow</h1>
          <p className="text-slate-600 text-sm mt-2">Enterprise SaaS Platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign In</h2>
          <p className="text-slate-600 text-sm mb-6">
            Enter your organization, email, and password to access your workspace
          </p>

          {/* Error Messages */}
          {(localError || error) && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex gap-3">
                <Icon name="AlertCircle" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 text-sm font-medium">Login Failed</p>
                  <p className="text-red-700 text-sm mt-1">{localError || error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Organization Name or ID
              </label>
              <Input
                type="text"
                name="tenant"
                value={formData.tenant}
                onChange={handleChange}
                placeholder="e.g., Acme Corp or tenant-id"
                disabled={isSubmitting}
              />
              <p className="text-xs text-slate-500 mt-1">
                Enter your organization's name or identifier
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-900">
                  Password
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isSubmitting || loading}
              loading={isSubmitting || loading}
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Don't have an account?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link
            to="/auth/register"
            className="block w-full text-center py-2 border border-slate-300 rounded-lg text-slate-900 font-medium hover:bg-slate-50 transition-colors"
          >
            Create Account
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          By signing in, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
