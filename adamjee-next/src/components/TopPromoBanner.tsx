'use client';
import React, { useState, useEffect } from "react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function TopPromoBanner() {
  const [promoText, setPromoText] = useState('Save up to 60% with code BLACKFRIDAY • Free shipping over PKR 50,000 •');

  useEffect(() => {
    // 1. Initial check from localStorage
    const savedTagline = localStorage.getItem('adamjee_promo_tagline');
    if (savedTagline) {
      setPromoText(savedTagline);
    }

    // 2. Listen to custom event or storage event for instant update
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adamjee_promo_tagline' && e.newValue) {
        setPromoText(e.newValue);
      }
    };
    const handleCustomTaglineEvent = (e: CustomEvent) => {
      if (e.detail) {
        setPromoText(e.detail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adamjee_tagline_update' as any, handleCustomTaglineEvent);

    // Fetch from API settings if available
    fetch('/api/settings')
      .then(res => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return null;
        return res.json();
      })
      .then(data => {
        if (data?.settings?.promoTagline) {
          setPromoText(data.settings.promoTagline);
          localStorage.setItem('adamjee_promo_tagline', data.settings.promoTagline);
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adamjee_tagline_update' as any, handleCustomTaglineEvent);
    };
  }, []);

  return (
    <div id="top-promo-banner" className="bg-[#164475] text-white text-xs py-2.5 px-4 md:px-12 flex justify-between items-center font-medium tracking-wide overflow-hidden">
      {/* Social icons — hidden on small screens */}
      <div className="hidden sm:flex items-center space-x-3 text-white/80 flex-shrink-0">
        <Facebook className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
        <Twitter className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
        <Instagram className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
        <Linkedin className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
      </div>
      {/* Marquee text — always visible, full width on mobile */}
      <div className="flex-1 flex items-center text-white/95 overflow-hidden whitespace-nowrap min-w-0 mx-0 sm:mx-4">
        <div className="animate-marquee">
          <span className="px-4">{promoText}</span>
          <span className="px-4">{promoText}</span>
        </div>
      </div>
      {/* Language/currency — hidden on mobile */}
      <div className="hidden sm:flex items-center space-x-4 text-white/90 flex-shrink-0">
        <span className="hover:text-white cursor-pointer transition-colors flex items-center gap-1">English <span className="text-[9px]">▼</span></span>
        <div className="hover:text-white cursor-pointer transition-colors flex items-center gap-1">
          <span>PKR ₨</span> <span className="text-[9px]">▼</span>
        </div>
      </div>
    </div>
  );
}

