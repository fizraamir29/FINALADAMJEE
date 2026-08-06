'use client';
import React, { useState } from 'react';
import { X, ArrowLeft, Loader2, UserPlus } from 'lucide-react';

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { token: string; _id: string; name: string; email: string; role: string }) => void;
}

export default function GoogleLoginModal({ isOpen, onClose, onSuccess }: GoogleLoginModalProps) {
  const [view, setView] = useState<'picker' | 'custom'>('picker');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const preconfiguredAccounts = [
    { name: 'Fizra Amir', email: 'fizra.amir@gmail.com', avatarBg: 'bg-rose-100 text-rose-600' },
    { name: 'Aisha Amir', email: 'aisha.amir@gmail.com', avatarBg: 'bg-indigo-100 text-indigo-600' }
  ];

  const handleGoogleAuth = async (email: string, name: string) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess({
          token: data.token,
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role
        });
      } else {
        setError(data.message || 'Failed to authenticate with Google');
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setError('Connection error. Please ensure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    handleGoogleAuth(customEmail, customName || customEmail.split('@')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white w-full max-w-[400px] rounded-[28px] shadow-2xl border border-gray-100 p-8 flex flex-col relative z-10 animate-scale-in">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          disabled={isLoading}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition cursor-pointer border-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Header Logo */}
        <div className="flex justify-center mb-6">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" className="w-8 h-8">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-1.14 2.77-2.4 3.61v3h3.86c2.26-2.09 3.59-5.17 3.59-8.46z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.86-3c-1.08.72-2.45 1.16-4.1 1.16-3.15 0-5.81-2.13-6.76-5.01H1.32v3.1C3.3 22.28 7.37 24 12 24z"/>
            <path fill="#FBBC05" d="M5.24 14.24a8.4 8.4 0 0 1 0-2.48V8.66H1.32a11.96 11.96 0 0 0 0 6.68l3.92-3.1z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.96 1.19 15.24 0 12 0 7.37 0 3.3 1.72 1.32 4.75l3.92 3.1c.95-2.88 3.61-5.1 6.76-5.1z"/>
          </svg>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-[22px] font-semibold text-[#202124] tracking-tight">
            {view === 'picker' ? 'Choose an account' : 'Sign in with Google'}
          </h2>
          <p className="text-[#5f6368] text-sm mt-1">
            to continue to <span className="font-semibold text-gray-800">Adamjee Computers</span>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-left">
            <p className="text-xs font-bold text-red-800">{error}</p>
          </div>
        )}

        {/* Loader Overlap */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="w-10 h-10 text-[#4285F4] animate-spin" />
            <p className="text-sm font-semibold text-[#5f6368]">Connecting to Google Accounts...</p>
          </div>
        )}

        {!isLoading && view === 'picker' && (
          <div className="flex-1 flex flex-col">
            {/* Account List */}
            <div className="border border-gray-200 rounded-[16px] overflow-hidden mb-6">
              {preconfiguredAccounts.map((account, index) => (
                <button
                  key={account.email}
                  onClick={() => handleGoogleAuth(account.email, account.name)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50/80 active:bg-gray-100 transition text-left border-none bg-white cursor-pointer"
                  style={{ borderBottom: index < preconfiguredAccounts.length - 1 ? '1px solid #f1f3f4' : 'none' }}
                >
                  <div className={`w-9 h-9 rounded-full ${account.avatarBg} flex items-center justify-center text-sm font-extrabold`}>
                    {account.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#3c4043] truncate">{account.name}</p>
                    <p className="text-xs text-[#5f6368] truncate">{account.email}</p>
                  </div>
                </button>
              ))}
              
              {/* Use Another Account Option */}
              <button
                onClick={() => setView('custom')}
                className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50/80 active:bg-gray-100 transition text-left border-t border-gray-200 bg-white cursor-pointer border-none"
              >
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1a73e8] hover:text-[#174ea6]">Use another account</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {!isLoading && view === 'custom' && (
          <form onSubmit={handleCustomSubmit} className="flex-1 flex flex-col space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email address</label>
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="email@gmail.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] outline-none transition text-sm font-medium text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Name (Optional)</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] outline-none transition text-sm font-medium text-gray-800"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setView('picker')}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition bg-transparent border-none cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer border-none"
              >
                Continue
              </button>
            </div>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-8 text-[11px] text-[#5f6368] text-center leading-relaxed">
          To continue, Google will share your name, email address, language preference, and profile picture with Adamjee Computers.
        </div>
      </div>
    </div>
  );
}
