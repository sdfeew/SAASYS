import React, { useState, useEffect } from 'react';
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
  const [successMessage, setSuccessMessage] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setLocalError(null);
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.tenant.trim()) {
      setLocalError('Organization name or ID is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.email) {
      setLocalError('Email address is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.password) {
      setLocalError('Password is required');
      setIsSubmitting(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      // Step 1: Sign in with email and password
      setSuccessMessage('Verifying credentials...');
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        setLocalError(error?.message || 'Invalid email or password');
        setSuccessMessage(null);
        setIsSubmitting(false);
        return;
      }

      if (!data?.user) {
        setLocalError('Sign in failed. Please try again.');
        setSuccessMessage(null);
        setIsSubmitting(false);
        return;
      }

      // Step 2: Verify and resolve tenant (by name or ID)
      setSuccessMessage('Looking up organization...');
      let tenantData = null;
      const tenantInput = formData.tenant.trim();

      // Try to find tenant by ID first
      const { data: tenantById } = await supabase
        ?.from('tenants')
        ?.select('id, name')
        ?.eq('id', tenantInput)
        ?.single();

      if (tenantById) {
        tenantData = tenantById;
      } else {
        // Try to find tenant by name or code
        const { data: tenantByName } = await supabase
          ?.from('tenants')
          ?.select('id, name')
          ?.or(`name.ilike.%${tenantInput}%,code.ilike.%${tenantInput}%`)
          ?.limit(1)
          ?.single();

        if (tenantByName) {
          tenantData = tenantByName;
        }
      }

      if (!tenantData) {
        setLocalError('Organization not found. Please check the name and try again.');
        setSuccessMessage(null);
        setIsSubmitting(false);
        return;
      }

      // Step 3: Verify user belongs to this tenant
      setSuccessMessage('Verifying access...');
      const { data: userProfile, error: profileError } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.eq('id', data.user.id)
        ?.eq('tenant_id', tenantData.id)
        ?.single();

      if (profileError || !userProfile) {
        setLocalError('You do not have access to this organization.');
        setSuccessMessage(null);
        setIsSubmitting(false);
        return;
      }

      // Step 4: Update profile to set current tenant and redirect
      setSuccessMessage('Welcome back! Redirecting...');
      await updateProfile({ tenant_id: tenantData.id });
      
      // Small delay for UX
      setTimeout(() => {
        navigate('/');
      }, 800);
    } catch (err) {
      console.error('Login error:', err);
      setLocalError(err?.message || 'An error occurred. Please try again.');
      setSuccessMessage(null);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>

      <div className="w-full max-w-md mx-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Icon name="Building2" className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            TenantFlow
          </h1>
          <p className="text-slate-600 text-base font-medium">Enterprise SaaS Platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-8 border border-white/20 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500 text-sm">Sign in to your organization account</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-slide-down">
              <div className="flex gap-3 items-center">
                <Icon name="CheckCircle2" className="w-5 h-5 text-green-600 flex-shrink-0 animate-bounce" />
                <p className="text-green-700 text-sm font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {(localError || error) && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl animate-shake">
              <div className="flex gap-3">
                <Icon name="AlertCircle" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-900 text-sm font-semibold">Authentication Error</p>
                  <p className="text-red-700 text-sm mt-1">{localError || error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Organization Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-900 mb-2 transition-colors group-focus-within:text-blue-600">
                <span className="flex items-center gap-2">
                  <Icon name="Building" className="w-4 h-4" />
                  Organization
                </span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  name="tenant"
                  value={formData.tenant}
                  onChange={handleChange}
                  onFocus={() => handleFocus('tenant')}
                  onBlur={handleBlur}
                  placeholder="Acme Corp, Tech Startup, or ID..."
                  disabled={isSubmitting}
                  className="pl-4 transition-all duration-200"
                />
                {focusedField === 'tenant' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b-lg"></div>}
              </div>
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                <Icon name="Info" className="w-3 h-3" /> Case-insensitive search
              </p>
            </div>

            {/* Email Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-900 mb-2 transition-colors group-focus-within:text-blue-600">
                <span className="flex items-center gap-2">
                  <Icon name="Mail" className="w-4 h-4" />
                  Email Address
                </span>
              </label>
              <div className="relative">
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  placeholder="you@company.com"
                  disabled={isSubmitting}
                  className="pl-4 transition-all duration-200"
                />
                {focusedField === 'email' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b-lg"></div>}
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-900 transition-colors group-focus-within:text-blue-600">
                  <span className="flex items-center gap-2">
                    <Icon name="Lock" className="w-4 h-4" />
                    Password
                  </span>
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className="pl-4 transition-all duration-200"
                />
                {focusedField === 'password' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b-lg"></div>}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || loading}
              loading={isSubmitting || loading}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-500 font-medium">New to TenantFlow?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link
            to="/auth/register"
            className="block w-full text-center py-3 border-2 border-slate-200 rounded-xl text-slate-900 font-semibold hover:border-blue-600 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Account
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-8">
          By signing in, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
            Terms of Service
          </a>
          {' '}and{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
            Privacy Policy
          </a>
        </p>

        {/* Debug Info - Remove in production */}
        <div className="mt-6 p-3 bg-slate-100 rounded-lg text-xs text-slate-600">
          <p className="font-semibold mb-1">Demo Credentials:</p>
          <p>Org: <strong>Acme Corp</strong></p>
          <p>Email: <strong>admin.f499d800@acmecorporation477506.test</strong></p>
          <p>Password: <strong>TestPassword@123456</strong></p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
