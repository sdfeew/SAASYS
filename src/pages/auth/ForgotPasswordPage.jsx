import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email?.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await resetPassword(email);
      
      if (resetError) {
        setError(resetError?.message || 'Failed to send reset email');
      } else {
        setSuccess(true);
        setEmail('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Password reset error:', err);
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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h2>
          <p className="text-slate-600 text-sm mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="CheckCircle2" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-900 text-sm font-medium">Check your email</p>
                  <p className="text-green-700 text-sm mt-1">
                    We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
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
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="you@company.com"
                disabled={loading}
                label="Email Address"
              />

              <Button
                type="submit"
                variant="default"
                className="w-full"
                disabled={loading}
                iconName={loading ? 'Loader2' : 'Send'}
                iconPosition="left"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <Button
              onClick={() => navigate('/auth/login')}
              variant="default"
              className="w-full"
              iconName="ArrowLeft"
              iconPosition="left"
            >
              Back to Login
            </Button>
          )}

          {/* Back to Login Link */}
          <div className="text-center mt-6">
            <p className="text-slate-600 text-sm">
              Remember your password?{' '}
              <Link to="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
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

export default ForgotPasswordPage;
