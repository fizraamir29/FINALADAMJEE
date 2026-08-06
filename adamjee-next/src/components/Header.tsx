'use client';

import React, { useState, useEffect, useRef } from "react";
import { Search, ShoppingCart, User, Menu, X, LogOut, Package, LayoutDashboard, ChevronDown } from "lucide-react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  cartCount: number;
  onCartToggle: () => void;
  onBuildPcOpen: () => void;
}

export default function Header({ cartCount, onCartToggle, onBuildPcOpen }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    router.push('/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const getFirstName = () => {
    if (!user?.name) return 'User';
    return user.name.split(' ')[0];
  };

  return (
    <>
      <header
        id="main-navigation"
        className={`sticky top-0 z-50 w-full px-4 md:px-12 py-4 flex justify-between items-center text-gray-800 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200/70 shadow-[0_4px_24px_rgba(0,0,0,0.06)]'
            : 'bg-white border-b border-gray-100'
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer select-none flex-shrink-0">
          <img
            src="/images/Mask group.png"
            alt="AC"
            className="h-8 md:h-9 w-auto object-contain"
          />
          <img
            src="/images/Mask group (1).png"
            alt="Adamjee Computers"
            className="h-6 md:h-7 w-auto object-contain hidden sm:block"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 text-[13px] font-medium tracking-wide text-gray-600">
          {[
            { href: '/category/all', label: 'Shop' },
            { href: '/category/best-sellers', label: 'Best Sellers' },
            { href: '/build-your-pc', label: 'Build Your Custom PC' },
            { href: '/benchmarks', label: 'Benchmarks' },
            { href: '/about', label: 'Why Us' }
          ].map((link) => {
            const active = link.href === '/category/all' 
              ? (pathname === '/category/all' || (pathname.startsWith('/category/') && pathname !== '/category/best-sellers') || pathname.startsWith('/product/'))
              : (pathname === link.href || pathname.startsWith(link.href));

            return (
              <Link 
                key={link.href}
                href={link.href}
                className={`group relative inline-flex items-center gap-1.5 transition-all duration-300 font-semibold text-sm ${
                  active ? 'text-[#164475] font-bold' : 'text-gray-600 hover:text-[#164475]'
                }`}
              >
                {/* Dot indicator next to link */}
                <span 
                  className={`w-1.5 h-1.5 rounded-full bg-[#164475] transition-all duration-300 shrink-0 ${
                    active 
                      ? 'opacity-100 scale-100 w-1.5' 
                      : 'opacity-0 scale-0 w-0 group-hover:opacity-100 group-hover:scale-100 group-hover:w-1.5'
                  }`}
                  style={{ marginTop: '1px' }}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-4 text-gray-800">
          <Link href="/search" className="icon-hover-scale hover:text-[#164475] transition-colors cursor-pointer bg-transparent border-none p-0 flex items-center justify-center">
            <Search className="w-5 h-5 font-light" strokeWidth={1.5} />
          </Link>

          <button
            onClick={onCartToggle}
            className="icon-hover-scale relative hover:text-[#164475] transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            <ShoppingCart className="w-5 h-5 font-light" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#164475] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {/* Auth Area — Desktop */}
          <div className="hidden sm:flex items-center">
            {isLoggedIn && user ? (
              /* Logged-in: Avatar + Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  id="user-profile-btn"
                  onClick={() => setProfileDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2 group focus:outline-none"
                  aria-label="User profile menu"
                >
                  {/* Avatar circle */}
                  <div className="relative">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-[#164475]/20 group-hover:border-[#164475] transition-all shadow-sm"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#164475] to-[#0a1b2d] flex items-center justify-center text-white font-black text-sm border-2 border-[#164475]/20 group-hover:border-[#164475] transition-all shadow-sm">
                        {getUserInitials()}
                      </div>
                    )}
                    {/* Online indicator */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-[#164475] transition-colors max-w-[80px] truncate hidden xl:block">
                    {getFirstName()}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-scale-in origin-top-right">
                    {/* User Info Header */}
                    <div className="bg-gradient-to-br from-[#0a1b2d] to-[#164475] p-4 text-white">
                      <div className="flex items-center gap-3">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-white/20"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-lg">
                            {getUserInitials()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-black text-white text-sm truncate">{user.name}</p>
                          <p className="text-white/60 text-xs truncate">{user.email}</p>
                          <span className="inline-flex items-center gap-1 mt-1 bg-white/10 text-white/80 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {user.role === 'admin' ? '⚡ Admin' : '✦ Standard Customer'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Links */}
                    <div className="p-2">
                      <Link
                        href="/account"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-[#f0f7ff] hover:text-[#164475] transition-all text-sm font-semibold group"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#164475] group-hover:scale-110 transition-transform" />
                        My Dashboard
                      </Link>
                      <Link
                        href="/account?tab=orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-[#f0f7ff] hover:text-[#164475] transition-all text-sm font-semibold group"
                      >
                        <Package className="w-4 h-4 text-[#164475] group-hover:scale-110 transition-transform" />
                        My Orders
                      </Link>
                      <Link
                        href="/account?tab=cart"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-[#f0f7ff] hover:text-[#164475] transition-all text-sm font-semibold group"
                      >
                        <ShoppingCart className="w-4 h-4 text-[#164475] group-hover:scale-110 transition-transform" />
                        My Cart
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-purple-700 hover:bg-purple-50 transition-all text-sm font-semibold group"
                        >
                          <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          Admin Panel
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-bold group"
                      >
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in: User icon → /login */
              <Link
                href="/login"
                className="icon-hover-scale hover:text-[#164475] transition-colors cursor-pointer bg-transparent border-none p-0 items-center justify-center flex"
              >
                <User className="w-5 h-5 font-light" strokeWidth={1.5} />
              </Link>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            className="lg:hidden p-1 text-gray-700 hover:text-[#164475] transition-colors"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer panel */}
          <div className="fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col lg:hidden">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <img src="/images/Mask group.png" alt="AC" className="h-7 w-auto" />
                <img src="/images/Mask group (1).png" alt="Adamjee" className="h-5 w-auto" />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Mobile User Profile Strip */}
            {isLoggedIn && user && (
              <div className="mx-3 mt-3 bg-gradient-to-r from-[#0a1b2d] to-[#164475] rounded-2xl p-4 text-white flex items-center gap-3">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-xl object-cover border border-white/20 flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-black flex-shrink-0">
                    {getUserInitials()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-black text-sm truncate">{user.name}</p>
                  <p className="text-white/60 text-xs truncate">{user.email}</p>
                </div>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {[
                { href: '/category/all', label: 'Shop', highlight: true },
                { href: '/category/best-sellers', label: 'Best Sellers' },
                { href: '/build-your-pc', label: 'Build Your Custom PC' },
                { href: '/benchmarks', label: 'Benchmarks' },
                { href: '/about', label: 'Why Us' },
                { href: '/blog', label: 'Blog' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                    link.highlight
                      ? 'text-[#164475] bg-[#f0f7ff]'
                      : 'text-gray-700 hover:text-[#164475] hover:bg-[#f0f7ff]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Account links for logged-in mobile users */}
              {isLoggedIn && user && (
                <>
                  <div className="border-t border-gray-100 pt-2 mt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">My Account</p>
                    <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 hover:text-[#164475] hover:bg-[#f0f7ff] transition-all">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link href="/account?tab=orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 hover:text-[#164475] hover:bg-[#f0f7ff] transition-all">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    <Link href="/account?tab=cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 hover:text-[#164475] hover:bg-[#f0f7ff] transition-all">
                      <ShoppingCart className="w-4 h-4" /> My Cart
                    </Link>
                  </div>
                </>
              )}
            </nav>

            {/* Bottom CTA buttons */}
            <div className="p-4 border-t border-gray-100 flex gap-3">
              {isLoggedIn ? (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-red-400 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-[#164475] text-[#164475] rounded-xl font-bold text-sm hover:bg-[#164475] hover:text-white transition-all"
                >
                  <User className="w-4 h-4" /> Login
                </Link>
              )}
              <Link
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#164475] text-white rounded-xl font-bold text-sm hover:bg-[#0a1b2d] transition-all"
              >
                <Search className="w-4 h-4" /> Search
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
