'use client';
import Link from 'next/link';
import React from 'react';

import { Home, Search, ShoppingBag, ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center pt-24 pb-24">
      <div className="container mx-auto px-4 max-w-2xl text-center">

        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[180px] md:text-[220px] font-extrabold leading-none select-none"
            style={{ background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] flex items-center justify-center animate-float">
              <ShoppingBag className="w-12 h-12 text-[#164475]" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-[#0a1b2d] mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-[#64748b] text-lg mb-10 leading-relaxed">
          The page you're looking for seems to have been unplugged. 🔌<br />
          Let's get you back to the good stuff.
        </p>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Home,      label: 'Go Home',        to: '/',           color: 'bg-[#164475]' },
            { icon: Search,    label: 'Search Products', to: '/search',    color: 'bg-[#0a1b2d]' },
            { icon: ShoppingBag, label: 'Shop All',     to: '/category/all', color: 'bg-[#164475]' },
          ].map(({ icon: Icon, label, to, color }) => (
            <Link key={to} href={to}
              className={`${color} hover:opacity-90 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all hover:-translate-y-1 hover:shadow-xl`}>
              <Icon className="w-5 h-5" /> {label}
            </Link>
          ))}
        </div>

        {/* Popular links */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
          <p className="text-sm font-bold text-[#0a1b2d] mb-4 uppercase tracking-widest">Popular Pages</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: 'Gaming PCs',       to: '/category/all' },
              { label: 'Custom PC Builder', to: '/' },
              { label: 'About Us',         to: '/about' },
              { label: 'Contact',          to: '/contact' },
              { label: 'FAQ',              to: '/faq' },
              { label: 'Blog',             to: '/blog' },
            ].map(link => (
              <Link key={link.to} href={link.to}
                className="flex items-center gap-1 text-sm text-[#164475] hover:text-[#0a1b2d] font-semibold hover:underline transition-colors">
                {link.label} <ArrowRight className="w-3 h-3" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
