'use client';

import React, { useState } from 'react';
import { X, KeyRound, ArrowRight, CheckCircle2, AlertCircle, Mail, Lock } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose, onSuccess }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'email' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(data.message || 'Reset code sent to your email.');
        setStep('reset');
      } else {
        setError(data.message || 'Could not process password reset for this email.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: resetCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStep('success');
        if (onSuccess) onSuccess();
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('An error occurred while resetting password.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModalState = () => {
    setStep('email');
    setEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white w-full max-w-[440px] rounded-[28px] shadow-2xl border border-gray-100 p-8 flex flex-col relative z-10 animate-scale-in">
        
        {/* Close Button */}
        <button 
          onClick={resetModalState} 
          disabled={isLoading}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition cursor-pointer border-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Header */}
        <div className="w-14 h-14 bg-gradient-to-br from-[#164475] to-[#0a1b2d] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#164475]/20">
          <KeyRound className="w-7 h-7 text-white" />
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-[#0a1b2d] tracking-tight">
            {step === 'email' && 'Forgot Password'}
            {step === 'reset' && 'Set New Password'}
            {step === 'success' && 'Password Reset Successful!'}
          </h2>
          <p className="text-[#64748b] text-sm mt-1 font-medium">
            {step === 'email' && 'Enter your registered email address to receive password reset instructions.'}
            {step === 'reset' && `Verification code sent to ${email}. Enter your new password below.`}
            {step === 'success' && 'Your password has been updated permanently. You can now log in.'}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-xs font-bold text-red-800">{error}</p>
          </div>
        )}

        {message && step === 'reset' && (
          <div className="mb-5 p-4 bg-blue-50 border-l-4 border-[#164475] rounded-r-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#164475] flex-shrink-0" />
            <p className="text-xs font-bold text-[#164475]">{message}</p>
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 'email' && (
          <form onSubmit={handleSendCode} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#164475]/30 focus:border-[#164475] outline-none transition text-sm font-semibold text-[#0a1b2d]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#164475] hover:bg-[#0a1b2d] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Send Reset Code <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Reset Form */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">Verification Code</label>
              <input
                type="text"
                required
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#164475]/30 focus:border-[#164475] outline-none transition text-sm font-mono font-bold text-[#0a1b2d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#164475]/30 focus:border-[#164475] outline-none transition text-sm font-medium text-[#0a1b2d]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#164475]/30 focus:border-[#164475] outline-none transition text-sm font-medium text-[#0a1b2d]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#164475] hover:bg-[#0a1b2d] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-none mt-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Save & Reset Password'
              )}
            </button>
          </form>
        )}

        {/* Step 3: Success Screen */}
        {step === 'success' && (
          <div className="text-center space-y-5">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border-2 border-green-200 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <button
              onClick={resetModalState}
              className="w-full bg-[#0a1b2d] hover:bg-[#164475] text-white font-black py-3.5 rounded-xl transition-all shadow-md border-none cursor-pointer text-sm"
            >
              Continue to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
