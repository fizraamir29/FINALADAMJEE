'use client';

import React, { useState, useEffect, useCallback } from "react";
import { Facebook, Instagram, Youtube } from "lucide-react";

interface HeroSectionProps {
  onBuildPcOpen: () => void;
}

const SLIDES = [
  {
    id: 0,
    label: 'BUILT FOR CREATORS & PC ENTHUSIASTS',
    headlineLines: [
      'Power Your Setup',
      'with the Latest Gaming',
      '& PC Hardware'
    ],
    headlineAccentIndex: 2, // Line 3 is highlighted in #6CC1F9
    sub: 'Upgrade your gaming and work setup with high-performance PCs, laptops, graphic cards, accessories, and the latest tech — all at competitive prices with trusted support across Pakistan.',
    cta1: { label: 'Shop Now', href: '#featured-arrivals' },
    cta2: { label: 'Build Your PC', href: '#perf-checker' },
    bg: '/images/custom_blue_gaming_pc_cases_1780242165601.png',
    bgGradient: 'linear-gradient(90deg, #103256 0%, #164475 100%)',
    fromGrad: '#103256',
  },
  {
    id: 1,
    label: 'GENUINE GAMING PERIPHERALS IN PAKISTAN',
    headlineLines: [
      'Dominate Every',
      'Game With Premium',
      'Gaming Gear'
    ],
    headlineAccentIndex: 2,
    sub: 'From Razer gaming mice to high-end mechanical keyboards and headsets — get the gear that professionals use, delivered straight to your door across Pakistan.',
    cta1: { label: 'Shop Gear', href: '#featured-arrivals' },
    cta2: { label: 'See Best Sellers', href: '/category/all' },
    bg: '/images/blue_rgb_pc_cases_1780241349905.png',
    bgGradient: 'linear-gradient(90deg, #0a1b2d 0%, #143760 100%)',
    fromGrad: '#0a1b2d',
  },
  {
    id: 2,
    label: 'LAPTOPS, MONITORS & PC COMPONENTS',
    headlineLines: [
      'Your Complete',
      'Tech Store — All In',
      'One Place'
    ],
    headlineAccentIndex: 2,
    sub: 'Shop monitors, RAM, GPUs, processors, VR headsets, and more — all backed by genuine warranty and expert after-sales support from Adamjee Computers.',
    cta1: { label: 'Shop Components', href: '/category/all' },
    cta2: { label: 'Build Your PC', href: '#perf-checker' },
    bg: '/images/white_pc_setup.png',
    bgGradient: 'linear-gradient(90deg, #08162a 0%, #12375c 100%)',
    fromGrad: '#08162a',
  },
];

export default function HeroSection({ onBuildPcOpen }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeSlides, setActiveSlides] = useState(SLIDES);

  const loadSettingsSlides = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('store_settings') || 'null');
      if (saved && Array.isArray(saved.heroSlides) && saved.heroSlides.length > 0) {
        const customSlides = saved.heroSlides.map((hs: any, idx: number) => {
          const fallback = SLIDES[idx % SLIDES.length];
          const lines = hs.title ? hs.title.split('\n') : fallback.headlineLines;
          return {
            id: idx,
            label: hs.subtitle ? hs.subtitle.toUpperCase() : fallback.label,
            headlineLines: lines.length > 0 ? lines : [hs.title || fallback.headlineLines[0]],
            headlineAccentIndex: 0,
            sub: hs.subtitle || fallback.sub,
            cta1: { label: 'Shop Now', href: hs.link || '/category/all' },
            cta2: { label: 'Build Your PC', href: '#perf-checker' },
            bg: hs.image || fallback.bg,
            bgGradient: fallback.bgGradient,
            fromGrad: fallback.fromGrad,
          };
        });
        setActiveSlides(customSlides);
      }
    } catch (err) {
      console.error('Failed to load hero slides:', err);
    }
  }, []);

  useEffect(() => {
    loadSettingsSlides();
    const handleUpdate = () => loadSettingsSlides();
    window.addEventListener('store_settings_updated', handleUpdate);
    return () => window.removeEventListener('store_settings_updated', handleUpdate);
  }, [loadSettingsSlides]);

  const goTo = useCallback((index: number) => {
    if (isTransitioning || index === current) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setIsTransitioning(false);
    }, 350);
  }, [current, isTransitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % activeSlides.length);
  }, [current, goTo, activeSlides.length]);

  // Auto-play / swap every 4.5 seconds smoothly
  useEffect(() => {
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [next]);

  const slide = activeSlides[current] || activeSlides[0] || SLIDES[0];

  return (
    <section className="px-4 md:px-8 max-w-[1440px] mx-auto py-2 relative z-10 font-sans">
      {/* Banner Card with rounded edges at top and bottom (28px - 32px radius) */}
      <div
        className="relative rounded-[28px] md:rounded-[32px] overflow-hidden flex flex-col justify-center min-h-[540px] lg:min-h-[580px] text-white shadow-2xl border border-white/10"
        style={{ background: slide.bgGradient, transition: 'background 600ms ease-in-out' }}
      >

        {/* Left side glowing neon background accents */}
        <div className="absolute top-0 left-0 w-full lg:w-1/2 h-full opacity-30 pointer-events-none flex items-center justify-start z-0 overflow-hidden">
          <svg viewBox="0 0 500 560" className="w-[120%] h-full max-w-[600px] -ml-20" fill="none">
            <defs>
              <filter id="neon-hero-left" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <g filter="url(#neon-hero-left)" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 50,50 L 250,280 L 50,510" stroke="#6CC1F9" strokeWidth="4"/>
              <path d="M 50,50 L 250,280 L 50,510" stroke="#6CC1F9" strokeWidth="2"/>
              <path d="M 150,120 L 330,280 L 150,440" stroke="#7cb3d8" strokeWidth="3" opacity="0.5"/>
              <path d="M -50,0 L 150,280 L -50,560" stroke="#6CC1F9" strokeWidth="6" opacity="0.2"/>
            </g>
          </svg>
        </div>

        {/* Slide background images with smooth 600ms cross-fade */}
        {activeSlides.map((s, i) => (
          <div
            key={s.id || i}
            className="absolute top-0 right-0 w-full lg:w-[54%] h-full z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("${s.bg}")`,
              opacity: i === current ? (isTransitioning ? 0.3 : 1) : 0,
              transform: i === current ? (isTransitioning ? 'scale(1.02)' : 'scale(1)') : 'scale(1.05)',
              transition: 'opacity 600ms ease-in-out, transform 600ms ease-in-out',
            }}
          >
            {/* Gradient overlay blending image into dark blue left background */}
            <div
              className="absolute inset-0 bg-gradient-to-r to-transparent"
              style={{ backgroundImage: `linear-gradient(to right, ${s.fromGrad} 0%, ${s.fromGrad}cc 30%, ${s.fromGrad}40 65%, transparent 100%)` }}
            />
          </div>
        ))}

        {/* Right floating social bar & discount badge */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center bg-black/40 backdrop-blur-md rounded-l-2xl py-5 px-3 z-30 space-y-4">
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white hover:text-[#6CC1F9] transition-colors">
            <Facebook className="w-4 h-4" />
          </a>
          <a href="https://x.com" target="_blank" rel="noreferrer" className="text-white hover:text-[#6CC1F9] transition-colors">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-white hover:text-[#6CC1F9] transition-colors">
            <Instagram className="w-4 h-4" />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-white hover:text-[#6CC1F9] transition-colors">
            <Youtube className="w-4 h-4" />
          </a>

          <div className="mt-6 pt-3 border-t border-white/20">
            <div className="rotate-180" style={{ writingMode: 'vertical-rl' }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('HERO20');
                  alert('Copied discount code HERO20 to clipboard!');
                }}
                className="inline-block bg-white text-[#164475] font-black text-[10px] tracking-widest uppercase py-2 px-3 rounded-full cursor-pointer hover:bg-[#6CC1F9] hover:text-[#0a1b2d] transition-all shadow-md active:scale-95"
              >
                GET 20% OFF (COPY HERO20)
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid — Figma Typography Specs */}
        <div className="relative z-20 w-full min-h-[540px] lg:min-h-[580px] flex items-center">
          <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-6 sm:px-10 lg:px-16 py-12 lg:py-16 w-full"
            style={{
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateY(8px)' : 'translateY(0)',
              transition: 'opacity 350ms ease, transform 350ms ease',
            }}
          >
            <div className="lg:col-span-7 space-y-6 text-left">

              {/* Sub-label / Badge */}
              <div className="inline-flex items-center space-x-2 text-xs font-black tracking-widest text-[#6CC1F9] uppercase">
                <span className="w-2 h-2 rounded-full bg-[#6CC1F9] animate-pulse" />
                <span>{slide.label}</span>
              </div>

              {/* Main Headline (Figma Specs: SF Pro / Inter, 58px size, leading 60px, -3% letter spacing, #6CC1F9 accent) */}
              <h1 className="text-[34px] sm:text-[46px] lg:text-[58px] font-extrabold leading-[1.06] tracking-[-0.03em] text-white">
                {slide.headlineLines.map((line, i) => (
                  <React.Fragment key={i}>
                    {i === slide.headlineAccentIndex ? (
                      <span className="text-[#6CC1F9] font-extrabold">{line}</span>
                    ) : (
                      <span>{line}</span>
                    )}
                    {i < slide.headlineLines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h1>

              {/* Subtext Paragraph (Figma box width: 541px) */}
              <p className="text-white/85 text-sm sm:text-[15px] leading-relaxed max-w-[541px] font-normal">
                {slide.sub}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href={slide.cta1.href}
                  className="bg-white text-[#0a1b2d] font-bold text-sm px-8 py-3.5 rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 border-none cursor-pointer"
                >
                  {slide.cta1.label}
                </a>
                <button
                  onClick={onBuildPcOpen}
                  className="border border-white/60 text-white font-bold text-sm px-8 py-3.5 rounded-full hover:border-white hover:bg-white/10 transition-all duration-300 cursor-pointer bg-transparent"
                >
                  {slide.cta2.label}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Left Slider Dots (Figma Specs: 3 interactive dots with auto-transition) */}
        <div className="absolute bottom-6 left-6 sm:left-10 lg:left-16 flex items-center space-x-3 z-20">
          {activeSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="group relative flex items-center justify-center cursor-pointer border-none bg-transparent p-1 transition-all"
              aria-label={`Go to slide ${i + 1}`}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-7 h-2.5 bg-white shadow-md'
                    : 'w-2.5 h-2.5 bg-white/40 border border-white/60 hover:bg-white/80'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Bottom Right Explore Categories */}
        <div className="absolute bottom-6 right-20 hidden lg:flex items-center space-x-3 text-white/90 text-sm font-medium z-20">
          <span className="tracking-wide text-xs font-semibold">Explore Categories</span>
          <a
            href="#explore-categories"
            className="w-9 h-9 rounded-full bg-transparent border border-white/40 text-white flex items-center justify-center transition-all hover:bg-white/15 hover:border-white"
          >
            <span className="text-sm font-light">↓</span>
          </a>
        </div>

      </div>
    </section>
  );
}
