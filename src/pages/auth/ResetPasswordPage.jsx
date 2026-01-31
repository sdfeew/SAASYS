import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updatePassword } = useAuth();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if we have a token from the reset link
  const token = searchParams.get('token');
  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const validateForm = () => {
    if (!formData.password?.trim()) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      // The updatePassword function should handle the token from the URL
      const { error: updateError } = await updatePassword(formData.password, token);
      
      if (updateError) {
        setError(updateError?.message || 'Failed to reset password');
      } else {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Password update error:', err);
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Create New Password</h2>
          <p className="text-slate-600 text-sm mb-6">
            Enter a strong password to secure your account.
          </p>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="CheckCircle2" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-900 text-sm font-medium">Password reset successful</p>
                  <p className="text-green-700 text-sm mt-1">
                    Your password has been updated. Redirecting to login...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          {!success && !error && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (error) setError(null);
                  }}
                  placeholder="Enter new password"
                  disabled={loading}
                  label="New Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-slate-500 hover:text-slate-700"
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (error) setError(null);
                  }}
                  placeholder="Confirm password"
                  disabled={loading}
                  label="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-10 text-slate-500 hover:text-slate-700"
                >
                  <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} className="w-5 h-5" />
                </button>
              </div>

              {/* Password Requirements */}
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-medium text-slate-900 mb-2">Password Requirements:</p>
                <ul className="space-y-1 text-xs text-slate-600">
                  <li className={formData.password?.length >= 8 ? 'text-green-600' : ''}>
                    ✓ At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                    ✓ One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                    ✓ One lowercase letter
                  </li>
                  <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                    ✓ One number
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                variant="default"
                className="w-full"
                disabled={loading}
                iconName={loading ? 'Loader2' : 'Lock'}
                iconPosition="left"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          )}

          {/* Back to Login Link */}
          {!success && (
            <div className="text-center mt-6">
              <p className="text-slate-600 text-sm">
                <a href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Back to login
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Need help?{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
