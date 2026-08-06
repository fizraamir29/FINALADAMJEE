'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';
import { CURRENCIES } from '@/data';

interface AppContextType {
  currencyCode: 'PKR' | 'USD';
  setCurrencyCode: (code: 'PKR' | 'USD') => void;
  formatPrice: (usdAmount: number) => string;
  cart: { product: Product; qty: number }[];
  setCart: React.Dispatch<React.SetStateAction<{ product: Product; qty: number }[]>>;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  handleAddToCart: (product: Product) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Get cart key — per-user if logged in, else global
function getCartKey(): string {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?._id) return `cart_${parsed._id}`;
    }
  } catch (_) {}
  return 'cart_guest';
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState<'PKR' | 'USD'>('PKR');
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartKey, setCartKey] = useState('cart_guest');

  // On mount: determine cart key and load the right cart
  useEffect(() => {
    const key = getCartKey();
    setCartKey(key);
    try {
      const savedCart = localStorage.getItem(key);
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) {
      console.error('Failed to parse cart from localStorage:', e);
    }
  }, []);

  // When user logs in/out, reload the correct cart
  useEffect(() => {
    const handleStorageChange = () => {
      const newKey = getCartKey();
      if (newKey !== cartKey) {
        setCartKey(newKey);
        try {
          const saved = localStorage.getItem(newKey);
          setCart(saved ? JSON.parse(saved) : []);
        } catch (_) {
          setCart([]);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Also poll every 2s for same-tab login/logout changes
    const interval = setInterval(() => {
      const newKey = getCartKey();
      if (newKey !== cartKey) {
        setCartKey(newKey);
        try {
          const saved = localStorage.getItem(newKey);
          setCart(saved ? JSON.parse(saved) : []);
        } catch (_) {
          setCart([]);
        }
      }
    }, 2000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [cartKey]);

  // Sync products from API to localStorage
  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return null;
        return res.json();
      })
      .then(data => {
        if (data && data.success && data.products) {
          localStorage.setItem('adamjee_products', JSON.stringify(data.products));
        }
      })
      .catch(err => console.error('Failed to sync products:', err));
  }, []);

  // Save cart to localStorage under user-specific key
  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

  const currency = CURRENCIES['PKR'];
  const formatPrice = (amount: number) => {
    return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
  };

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const pId = product.id || product._id;
      const existing = prev.find(item => (item.product.id || item.product._id) === pId);
      if (existing) {
        return prev.map(item =>
          (item.product.id || item.product._id) === pId
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    setCartOpen(true);
  };

  return (
    <AppContext.Provider value={{
      currencyCode,
      setCurrencyCode,
      formatPrice,
      cart,
      setCart,
      cartOpen,
      setCartOpen,
      handleAddToCart
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
