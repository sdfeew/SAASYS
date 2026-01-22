import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp, loading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setLocalError('Please fill in all fields');
      return false;
    }

    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    const { data, error } = await signUp(
      formData.email,
      formData.password,
      formData.fullName
    );

    if (error) {
      setLocalError(error?.message || 'Failed to create account');
    } else if (data?.user) {
      // Show success message or redirect
      navigate('/auth/verify-email', { 
        state: { email: formData.email } 
      });
    }
    
    setIsSubmitting(false);
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
          <p className="text-slate-600 text-sm mt-2">Create Your Organization</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Create Account</h2>

          {/* Error Messages */}
          {(localError || error) && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{localError || error}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={isSubmitting}
              />
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
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Password
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isSubmitting}
              />
              <p className="text-xs text-slate-600 mt-1">
                Must be at least 8 characters
              </p>
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
                disabled={isSubmitting}
              />
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3 py-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 rounded border-slate-300"
                required
                disabled={isSubmitting}
              />
              <label htmlFor="terms" className="text-xs text-slate-600">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isSubmitting || loading}
              loading={isSubmitting || loading}
            >
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link
            to="/auth/login"
            className="block w-full text-center py-2 border border-slate-300 rounded-lg text-slate-900 font-medium hover:bg-slate-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
