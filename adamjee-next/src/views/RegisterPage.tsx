'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { useSEO } from '../hooks/useSEO';
import { UserPlus, ArrowRight } from 'lucide-react';
import GoogleLoginModal from '../components/GoogleLoginModal';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  useSEO({
    title: "Create Account | Join Adamjee Computers",
    description: "Register a new customer account at Adamjee Computers Pakistan to place orders, save PC builds, receive member-exclusive discount alerts, and check order statuses.",
    keywords: "register account, signup tech store, member portal, Adamjee Computers"
  });
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const router = useRouter();
  const { isLoggedIn, login } = useAuth();

  const [error, setError] = useState('');

  // Redirect already-logged-in users away from register page
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/account');
    }
  }, [isLoggedIn, router]);

  const handleGoogleSuccess = (userData: any) => {
    setIsGoogleModalOpen(false);
    login({
      token: userData.token,
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    });
    router.push('/account');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (res.ok) {
        login({
          token: data.token,
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
        });
        router.push('/account');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render form while redirecting
  if (isLoggedIn) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#fafbfc] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#164475] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#fafbfc] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background 3D Elements */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#164475] rounded-full blur-[120px] opacity-20 animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#164475] rounded-full blur-[120px] opacity-20 animate-float" style={{ animationDelay: '1.5s' }} />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-8 relative z-10 animate-scale-in">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#0a1b2d] to-[#164475] rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6 transform rotate-6 hover:rotate-0 transition-transform duration-300">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#0a1b2d] tracking-tight">Create Account</h1>
          <p className="text-[#64748b] mt-2 font-medium">Join Adamjee Computers today</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
            <p className="text-sm font-bold text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="group">
            <label className="block text-xs font-bold text-[#64748b] uppercase tracking-widest mb-2 group-focus-within:text-[#164475] transition-colors">Full Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-5 py-3.5 rounded-xl border border-[#e2e8f0] bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#164475]/30 focus:border-[#164475] outline-none transition-all text-[#0a1b2d] font-medium"
              placeholder="John Doe"
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-[#64748b] uppercase tracking-widest mb-2 group-focus-within:text-[#164475] transition-colors">Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-5 py-3.5 rounded-xl border border-[#e2e8f0] bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#164475]/30 focus:border-[#164475] outline-none transition-all text-[#0a1b2d] font-medium"
              placeholder="you@example.com"
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-[#64748b] uppercase tracking-widest mb-2 group-focus-within:text-[#164475] transition-colors">Password</label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-5 py-3.5 rounded-xl border border-[#e2e8f0] bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#164475]/30 focus:border-[#164475] outline-none transition-all text-[#0a1b2d] font-medium"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#0a1b2d] to-[#164475] hover:from-[#164475] hover:to-[#0a1b2d] text-white font-extrabold py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-[#164475]/30 disabled:opacity-70 mt-6 flex items-center justify-center group hover:-translate-y-1"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
            )}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e2e8f0]"></div>
          </div>
          <span className="relative px-3 bg-white text-xs font-bold text-[#64748b] uppercase tracking-wider">or</span>
        </div>

        <button
          type="button"
          onClick={() => setIsGoogleModalOpen(true)}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-extrabold py-3.5 px-4 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
        >
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="w-[18px] h-[18px]">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-1.14 2.77-2.4 3.61v3h3.86c2.26-2.09 3.59-5.17 3.59-8.46z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.86-3c-1.08.72-2.45 1.16-4.1 1.16-3.15 0-5.81-2.13-6.76-5.01H1.32v3.1C3.3 22.28 7.37 24 12 24z"/>
            <path fill="#FBBC05" d="M5.24 14.24a8.4 8.4 0 0 1 0-2.48V8.66H1.32a11.96 11.96 0 0 0 0 6.68l3.92-3.1z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.96 1.19 15.24 0 12 0 7.37 0 3.3 1.72 1.32 4.75l3.92 3.1c.95-2.88 3.61-5.1 6.76-5.1z"/>
          </svg>
          Sign up with Google
        </button>

        <div className="mt-6 pt-6 border-t border-[#e2e8f0] text-center">
          <p className="text-[#64748b] text-sm font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-[#164475] font-extrabold hover:text-[#0a1b2d] transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <GoogleLoginModal 
        isOpen={isGoogleModalOpen} 
        onClose={() => setIsGoogleModalOpen(false)} 
        onSuccess={handleGoogleSuccess} 
      />
    </div>
  );
}
