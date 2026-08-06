'use client';
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Product } from "../types";

interface PromoBannerProps {
  onAddToCart?: (product: Product) => void;
}

// PERMANENT DELL 29" LED MONITOR PRODUCT FROM FIGMA DESIGN
const PERMANENT_BANNER_PRODUCT: Product = {
  id: "na1",
  name: "29\" Inch LED DELL",
  code: "u2917w",
  price: 500.00,
  rating: 5.0,
  image: "/images/dell_led_monitor_1780238004077.png",
  category: "Monitors",
  description: "Dell UltraSharp 29-inch UltraWide LED Monitor with 2560x1080 resolution.",
};

export default function PromoBanner({ onAddToCart }: PromoBannerProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const product = PERMANENT_BANNER_PRODUCT;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(prev => !prev);
  };

  return (
    <section className="px-4 md:px-12 py-12 relative z-10 font-sans reveal-up">
      {/* Outer Banner Card with rounded edges matching Figma (28px - 32px) */}
      <div className="relative rounded-[28px] md:rounded-[32px] overflow-hidden flex flex-col justify-center min-h-[500px] lg:min-h-[540px] text-white bg-[#103256] shadow-2xl border border-white/10">

        {/* Background Right: Gamers Image with Figma blue gradient overlay */}
        <div
          className="absolute right-0 top-0 h-full w-full lg:w-[68%] z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/images/promo_gamers_bg.png")' }}
        >
          {/* Linear gradient overlay blending image into solid dark blue left side */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, #103256 0%, #164475 35%, rgba(22, 68, 117, 0.45) 70%, rgba(16, 50, 86, 0.2) 100%)'
            }}
          />
        </div>

        {/* Background Left: 3 Top & 3 Bottom Crisp Vector Neon Chevrons pointing RIGHT (> > >) matching Figma Screenshot 3 */}
        <div className="absolute left-0 top-0 h-full w-[240px] pointer-events-none z-10 flex flex-col justify-between py-4 px-0 overflow-hidden">
          {/* Top Left 3 Neon Chevrons pointing RIGHT */}
          <svg viewBox="0 0 160 140" className="w-36 h-36 -ml-3 -mt-2" fill="none">
            <defs>
              <filter id="neon-glow-top" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#neon-glow-top)" stroke="#6CC1F9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 0 10 L 50 60 L 0 110" opacity="1" />
              <path d="M 28 10 L 78 60 L 28 110" opacity="0.75" />
              <path d="M 56 10 L 106 60 L 56 110" opacity="0.45" />
            </g>
          </svg>

          {/* Bottom Left 3 Neon Chevrons pointing RIGHT */}
          <svg viewBox="0 0 160 140" className="w-36 h-36 -ml-3 -mb-2" fill="none">
            <defs>
              <filter id="neon-glow-bot" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#neon-glow-bot)" stroke="#6CC1F9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 0 10 L 50 60 L 0 110" opacity="1" />
              <path d="M 28 10 L 78 60 L 28 110" opacity="0.75" />
              <path d="M 56 10 L 106 60 L 56 110" opacity="0.45" />
            </g>
          </svg>
        </div>

        {/* Content Container — Left Side Text */}
        <div className="relative z-20 w-full min-h-[500px] lg:min-h-[540px] flex items-center">
          <div className="px-6 sm:px-12 lg:px-20 py-12 lg:py-16 max-w-[580px] text-left">

            {/* Label (Figma Specs: cyan dot + uppercase tracking-widest text) */}
            <div className="inline-flex items-center space-x-2.5 text-[11px] font-bold tracking-[0.12em] text-[#6CC1F9] uppercase mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6CC1F9] shadow-[0_0_10px_#6CC1F9]" />
              <span>GAMING. PERFORMANCE. INNOVATION.</span>
            </div>

            {/* Main Headline (Figma Specs: SF Pro, 54px size, leading 1.08, -3% letter spacing, #6CC1F9 accent) */}
            <h2 className="text-[34px] sm:text-[44px] lg:text-[54px] font-extrabold leading-[1.08] tracking-[-0.03em] text-white mb-5 font-sans">
              Let's Experience the<br />
              Power of Next-Level<br />
              <span className="text-[#6CC1F9] font-extrabold">Gaming Today</span>
            </h2>

            {/* Description Subtext Paragraph */}
            <p className="text-white/85 text-sm sm:text-[15px] leading-relaxed max-w-[480px] font-normal mb-8 font-sans">
              Watch powerful gaming setups, custom PC builds, and performance showcases designed for gamers, creators, and tech enthusiasts across Pakistan.
            </p>

            {/* CTA Button (Figma Specs: Pill shape, white bg, black text, shadow) */}
            <Link
              href="/category/all"
              className="inline-block bg-white text-[#000000] font-bold text-[14px] px-9 py-3.5 rounded-full shadow-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 border-none cursor-pointer text-center"
            >
              Shop Now
            </Link>
          </div>
        </div>

        {/* Floating Product Card (PERMANENT DELL 29" LED MONITOR matching Figma screenshot 2) */}
        <div className="absolute bottom-6 right-6 lg:right-16 z-30 hidden sm:block">
          <div className="bg-white text-black rounded-[24px] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)] w-[240px] flex flex-col gap-1 relative border border-gray-100/80 backdrop-blur-md group hover:-translate-y-1.5 transition-all duration-300">

            {/* Clean Heart Icon (No grey circle badge, sits directly on top of white card in top-left as in Figma) */}
            <button
              onClick={handleWishlistToggle}
              className="absolute top-4 left-4 z-10 text-[#164475] hover:scale-110 transition-transform cursor-pointer border-none bg-transparent p-0"
              aria-label="Add to Wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#164475] text-[#164475]' : 'fill-[#164475] text-[#164475]'}`} />
            </button>

            {/* Product Image (Dell 29" LED Monitor with transparent background) */}
            <Link href={`/product/${product.id}`} className="flex items-center justify-center py-2 h-36 w-full pt-4">
              <img
                src="/images/dell_led_monitor_1780238004077.png"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/dell_led_monitor_1780238004077.png";
                }}
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                alt="29 Inch LED DELL"
                style={{ mixBlendMode: "multiply" }}
              />
            </Link>

            {/* Product Info (Exact Figma Typography) */}
            <div className="text-left space-y-0.5 pt-1">
              <span className="text-[11px] font-medium text-gray-400 block tracking-tight">Code u2917w</span>
              <h3 className="text-[17px] font-bold text-[#000000] tracking-tight leading-snug">29" Inch LED DELL</h3>
              <Link href={`/product/${product.id}`} className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#164475] underline underline-offset-4 hover:opacity-80 transition-opacity pt-1.5">
                <span>Check Now</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
