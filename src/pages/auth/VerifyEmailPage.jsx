import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const emailFromState = searchParams.get('email');
    if (emailFromState) {
      setEmail(emailFromState);
    }
  }, [searchParams]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);

    if (!code?.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    try {
      // In a real implementation, you would call Supabase's verifyOtp or similar
      // For now, we'll simulate verification
      
      // After verification, redirect to tenant selection
      setSuccess(true);
      setTimeout(() => {
        navigate('/tenant-selector', { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err?.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!email?.trim()) {
      setError('Email is required');
      return;
    }

    setResendLoading(true);
    setResendSuccess(false);
    try {
      // In a real implementation, call resendVerification from AuthContext
      setResendSuccess(true);
      setTimeout(() => {
        setResendSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err?.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Icon name="CheckCircle2" size={32} className="text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Email Verified!</h2>
            <p className="text-green-700 mb-6">
              Your email has been verified successfully. Redirecting to tenant selection...
            </p>
            <div className="flex justify-center">
              <Icon name="Loader2" size={24} className="animate-spin text-green-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 mb-4">
            <Icon name="Mail" className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">TenantFlow</h1>
          <p className="text-slate-600 text-sm mt-2">Verify Your Email</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Email Address</h2>
          <p className="text-slate-600 text-sm mb-6">
            We've sent a verification code to your email. Please enter it below.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {resendSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="CheckCircle2" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-900 text-sm font-medium">Code sent</p>
                  <p className="text-green-700 text-sm mt-1">
                    Check your email for the verification code.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                disabled={isVerifying || resendLoading}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                maxLength="6"
                disabled={isVerifying}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-center text-2xl letter-spacing tracking-widest"
              />
              <p className="text-xs text-slate-600 mt-2">
                Check your email for the code (valid for 15 minutes)
              </p>
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isVerifying || resendLoading || !code.trim()}
              loading={isVerifying}
            >
              Verify Email
            </Button>
          </form>

          {/* Resend Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm mb-4">Didn't receive a code?</p>
            <button
              onClick={handleResendCode}
              disabled={resendLoading || isVerifying}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
          </div>

          {/* Help Link */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-xs text-slate-600">
              Need help?{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
