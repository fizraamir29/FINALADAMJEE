'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  profilePicture?: string;
  addresses?: {
    _id?: string;
    label: string;
    fullName: string;
    street: string;
    city: string;
    postalCode?: string;
    country?: string;
    isDefault?: boolean;
    phone?: string;
  }[];
}

interface UserExtras {
  name?: string;
  phone?: string;
  profilePicture?: string;
  addresses?: AuthUser['addresses'];
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (userData: Partial<AuthUser> & { token: string }) => void;
  logout: () => void;
  updateUser: (userData: Partial<AuthUser>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: Cookie management
function setAuthCookie(name: string, value: string, days = 30) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getAuthCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return matches ? decodeURIComponent(matches[1]) : null;
}

function eraseAuthCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

// Helper: load/save user-specific profile extras by email or user ID
function getExtrasKey(identifier: string) {
  const clean = (identifier || '').toLowerCase().trim();
  return `user_extras_${clean}`;
}

function loadExtras(identifier: string): UserExtras {
  if (!identifier) return {};
  try {
    const raw = localStorage.getItem(getExtrasKey(identifier));
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {};
}

function saveExtras(identifier: string, extras: UserExtras) {
  if (!identifier) return;
  try {
    const existing = loadExtras(identifier);
    const updated = { ...existing, ...extras };
    localStorage.setItem(getExtrasKey(identifier), JSON.stringify(updated));
  } catch (_) {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: hydrate from localStorage / Cookies
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token') || getAuthCookie('auth_token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        const parsed: AuthUser = JSON.parse(savedUser);
        const email = parsed.email || '';
        const userId = parsed._id || '';

        // Merge saved extras from email or userId
        const extrasEmail = loadExtras(email);
        const extrasId = loadExtras(userId);
        const extras = { ...extrasId, ...extrasEmail };

        const merged: AuthUser = {
          ...parsed,
          name: extras.name || parsed.name,
          phone: extras.phone ?? parsed.phone ?? '',
          profilePicture: extras.profilePicture ?? parsed.profilePicture ?? '',
          addresses: extras.addresses?.length ? extras.addresses : (parsed.addresses || []),
        };

        setToken(savedToken);
        setUser(merged);
        setAuthCookie('auth_token', savedToken, 30);
        if (merged._id) setAuthCookie('auth_user_id', merged._id, 30);
      }
    } catch (e) {
      console.error('Failed to parse auth from localStorage:', e);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      eraseAuthCookie('auth_token');
      eraseAuthCookie('auth_user_id');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((userData: Partial<AuthUser> & { token: string }) => {
    const { token: newToken, ...rest } = userData;
    const userId = rest._id || '';
    const email = rest.email || '';

    // Load any previously saved profile data for this specific user
    const extrasEmail = loadExtras(email);
    const extrasId = loadExtras(userId);
    const savedExtras = { ...extrasId, ...extrasEmail };

    const userToSave: AuthUser = {
      _id: userId,
      name: rest.name || savedExtras.name || '',
      email: email,
      role: rest.role || 'customer',
      phone: rest.phone || savedExtras.phone || '',
      profilePicture: rest.profilePicture || savedExtras.profilePicture || '',
      addresses: rest.addresses?.length ? rest.addresses : (savedExtras.addresses || []),
    };

    setToken(newToken);
    setUser(userToSave);

    // Save tokens and session details in localStorage & cookies for permanent persistence
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userToSave));
    setAuthCookie('auth_token', newToken, 30);
    if (userId) setAuthCookie('auth_user_id', userId, 30);

    // Also persist extras by email and userId so logging out & in retains picture, phone, addresses
    if (email) saveExtras(email, userToSave);
    if (userId) saveExtras(userId, userToSave);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    eraseAuthCookie('auth_token');
    eraseAuthCookie('auth_user_id');
    // Note: per-user extras (user_extras_<email>) are NOT deleted on logout
  }, []);

  const updateUser = useCallback((userData: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...userData };

      // Persist current active user session
      localStorage.setItem('user', JSON.stringify(updated));

      // Persist to user extras store
      const extras: UserExtras = {
        name: updated.name,
        phone: updated.phone,
        profilePicture: updated.profilePicture,
        addresses: updated.addresses,
      };

      if (updated.email) saveExtras(updated.email, extras);
      if (updated._id) saveExtras(updated._id, extras);

      return updated;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem('token') || getAuthCookie('auth_token');
    if (!savedToken) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        const freshUser = data.user || data.data;
        if (freshUser) {
          const userId = freshUser._id || freshUser.id || '';
          const email = freshUser.email || '';
          const extrasEmail = loadExtras(email);
          const extrasId = loadExtras(userId);
          const extras = { ...extrasId, ...extrasEmail };

          const userToSave: AuthUser = {
            _id: userId,
            name: freshUser.name || extras.name || '',
            email: email,
            role: freshUser.role || 'customer',
            phone: freshUser.phone || extras.phone || '',
            profilePicture: freshUser.profilePicture || extras.profilePicture || '',
            addresses: freshUser.addresses?.length ? freshUser.addresses : (extras.addresses || []),
          };
          setUser(userToSave);
          localStorage.setItem('user', JSON.stringify(userToSave));
          if (email) saveExtras(email, userToSave);
          if (userId) saveExtras(userId, userToSave);
        }
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoggedIn: !!user && !!token,
      isLoading,
      login,
      logout,
      updateUser,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
