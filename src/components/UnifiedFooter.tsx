'use client';

import React, { useState } from "react";
import Link from "next/link";

interface UnifiedFooterProps {
  setIsBuilderOpen: (open: boolean) => void;
}

/* ── 6 verified high-quality images for Instagram grid ── */
const instagramPosts = [
  "/images/Rectangle 12629.png",
  "/images/blue_rgb_pc_cases_1780241349905.png",
  "/images/white_pc_setup.png",
  "/images/Rectangle 12598 (1).png",
  "/images/custom_blue_gaming_pc_cases_1780242165601.png",
  "/images/check-img1.png",
];

const socialLinks = [
  {
    href: "https://instagram.com/adamjeecomputers",
    label: "Instagram",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    href: "https://linkedin.com/company/adamjeecomputers",
    label: "LinkedIn",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    href: "https://youtube.com/@adamjeecomputers",
    label: "YouTube",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default function UnifiedFooter({ setIsBuilderOpen }: UnifiedFooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dynamicSocials, setDynamicSocials] = useState<any>(null);

  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('store_settings') || 'null');
      if (saved && saved.socialLinks) {
        setDynamicSocials(saved.socialLinks);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const activeLinks = [
    { label: "Instagram", href: dynamicSocials?.instagram || "https://instagram.com/adamjeecomputers", icon: socialLinks[0].icon },
    { label: "LinkedIn", href: dynamicSocials?.linkedin || "https://linkedin.com/company/adamjeecomputers", icon: socialLinks[1].icon },
    { label: "YouTube", href: dynamicSocials?.youtube || "https://youtube.com/@adamjeecomputers", icon: socialLinks[2].icon },
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    setSubmitting(false);
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer
      className="rounded-t-[40px] overflow-hidden"
      style={{ background: 'linear-gradient(175deg, #103256 0%, #0a1b2d 100%)' }}
    >

      {/* ── Newsletter Section ── */}
      <div className="px-4 md:px-12 pt-16 pb-10">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-5">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img src="/images/Mask group (2).png" alt="Adamjee" className="h-9 w-auto object-contain" />
            <img src="/images/Mask group (1).png" alt="Adamjee Computers" className="h-5 w-auto object-contain brightness-0 invert" />
          </div>

          <h2 className="text-2xl md:text-[28px] font-bold text-white tracking-tight leading-snug">
            Stay In The Loop With Our Weekly Newsletter
          </h2>

          <form onSubmit={handleSubscribe} className="w-full max-w-md relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-white text-[#0a1b2d] pl-6 pr-32 py-4 rounded-full text-sm font-medium focus:outline-none placeholder-gray-400 shadow-xl transition-shadow focus:shadow-2xl"
            />
            <button
              type="submit"
              disabled={submitting}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#164475] hover:bg-[#103256] text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-70 cursor-pointer border-none"
            >
              {submitting ? "..." : "Subscribe"}
            </button>
          </form>

          {subscribed ? (
            <p className="text-sm text-green-400 font-semibold animate-pulse">
              🎉 You&apos;re subscribed! Welcome to the Adamjee family.
            </p>
          ) : (
            <p className="text-sm text-white/65 font-medium">
              Sign up for exclusive drops, esog health tips, and member-only offers.
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4 md:px-12">
        <hr className="border-white/15" />
      </div>

      {/* ── Nav Links ── */}
      <div className="px-4 md:px-12 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* About Us */}
          <div className="md:col-span-5 lg:col-span-4 space-y-3">
            <h4 className="text-white font-bold text-[15px] tracking-tight">About Us</h4>
            <p className="text-sm text-white/65 leading-relaxed pr-4">
              Your trusted destination for gaming PCs, laptops, custom builds, and premium
              tech accessories — delivering performance, reliability, and expert support
              across Pakistan.
            </p>
          </div>

          {/* Shop / Company / Support */}
          <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">

            <div className="space-y-3">
              <h4 className="text-white font-bold text-[15px] tracking-tight">Shop</h4>
              <nav className="flex flex-col gap-2.5">
                {[
                  { label: "All Products", href: "/category/all" },
                  { label: "Gaming Accessories", href: "/category/accessories" },
                  { label: "Flash Sale", href: "/category/sale" },
                  { label: "Blog", href: "/blog" },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="text-white/70 hover:text-white text-sm font-medium transition-colors duration-150 w-fit">
                    {l.label}
                  </Link>
                ))}
                <button
                  onClick={() => setIsBuilderOpen(true)}
                  className="text-white/70 hover:text-white text-sm font-medium transition-colors duration-150 cursor-pointer bg-transparent border-none text-left p-0 w-fit"
                >
                  Custom PC Builds
                </button>
              </nav>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold text-[15px] tracking-tight">Company</h4>
              <nav className="flex flex-col gap-2.5">
                {[
                  { label: "Our Story", href: "/about" },
                  { label: "FAQ", href: "/faq" },
                  { label: "Contact Us", href: "/contact" },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="text-white/70 hover:text-white text-sm font-medium transition-colors duration-150 w-fit">
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold text-[15px] tracking-tight">Support</h4>
              <nav className="flex flex-col gap-2.5">
                {[
                  { label: "Shipping & Returns", href: "/warranty-returns" },
                  { label: "Privacy Policy", href: "/privacy-policy" },
                  { label: "Terms of Service", href: "/terms" },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="text-white/70 hover:text-white text-sm font-medium transition-colors duration-150 w-fit">
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

          </div>
        </div>
      </div>

      {/* ── Instagram Grid ── */}
      <div className="px-4 md:px-12 pb-8">
        <div className="max-w-6xl mx-auto space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Follow Our Instagram</h3>
            <a
              href="https://instagram.com/adamjeecomputers"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white text-sm transition-colors duration-200"
            >
              @AdamjeeComputers
            </a>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {instagramPosts.map((src, i) => (
              <a
                key={i}
                href="https://instagram.com/adamjeecomputers"
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square rounded-2xl overflow-hidden bg-[#0e2240] shadow-lg cursor-pointer group relative block"
              >
                <img
                  src={src}
                  alt={`Setup ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = "0";
                  }}
                />
                {/* Hover overlay — smooth fade in */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300 ease-out">
                  <div className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 ease-out">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4 md:px-12">
        <hr className="border-white/10" />
      </div>

      {/* ── Social Icons + Legal ── */}
      <div className="px-4 md:px-12 py-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Social Icons */}
          <div className="flex items-center gap-2.5">
            {activeLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 rounded-full border border-white/25 hover:border-white/80 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 ease-out hover:scale-110"
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* Legal links */}
          <div className="flex items-center gap-5 text-sm text-white/60">
            {[
              { label: "Accessibility", href: "/accessibility" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Privacy", href: "/privacy-policy" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white transition-colors duration-150">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="px-4 md:px-12 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50">
          <p>
            © 2026{" "}
            <span className="font-semibold text-white/80">Adamjee Computers</span>. All rights reserved.
          </p>

          <div className="flex items-center gap-1 cursor-pointer group">
            <span className="text-white/65 group-hover:text-white transition-colors duration-150">Pakistan ( Rs. PKR )</span>
            <svg className="w-3.5 h-3.5 text-white/50 group-hover:text-white/80 transition-colors duration-150 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Payment icons */}
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 bg-white rounded text-[#1a1f71] font-black italic text-[10px] tracking-wide">VISA</span>
            <span className="px-1.5 py-1 bg-[#1a1919] rounded flex items-center gap-0">
              <span className="w-3.5 h-3.5 rounded-full bg-red-600 block" />
              <span className="-ml-1.5 w-3.5 h-3.5 rounded-full bg-yellow-400 block opacity-90" />
            </span>
            <span className="px-2 py-1 bg-[#016FD0] rounded text-white font-bold text-[9px] uppercase tracking-wide">AMEX</span>
            <span className="px-2 py-1 bg-[#003087] rounded text-white font-bold italic text-[9px]">
              Pay<span className="text-sky-300">Pal</span>
            </span>
            <span className="px-2 py-1 bg-[#0079C1] rounded text-white font-bold text-[9px] uppercase">DINERS</span>
            <span className="px-2 py-1 bg-white border border-gray-200 rounded text-[#f58220] font-bold text-[9px] uppercase">DISC</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
