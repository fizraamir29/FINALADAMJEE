'use client';
import React, { useState, useEffect } from "react";
import { Play } from "lucide-react";

interface TestimonialsProps {
  onOpenSubmitModal?: () => void;
}

export default function Testimonials({ onOpenSubmitModal }: TestimonialsProps) {
  const [whyUsData, setWhyUsData] = useState({
    headerTag: 'WHY CHOOSE US',
    title: 'Your Trusted Destination For Gaming & PC Hardware',
    card1Img: '/images/Rectangle 12598.png',
    card1Quote: 'Absolutely loved the custom PC build quality and cable management. The performance is smooth, and the team guided me perfectly throughout the process.',
    card1Author: 'Hamza A.',
    card2Img: '/images/Rectangle 12598 (1).png',
    card3Img: '/images/Rectangle 12598 (2).png',
    card3Quote: 'Ordered my gaming setup from Adamjee Computers and the experience was amazing. Genuine products, fast delivery, and excellent customer support.',
    card3Author: 'Ali R.',
    card4Img: '/images/blue_rgb_pc_cases_1780241349905.png',
    card5Img: '/images/Rectangle 12598 (2).png',
    card5Quote: 'Their upgrade recommendations helped me improve my FPS and streaming performance without overspending. Highly recommended for gamers.',
    card6Img: '/images/custom_blue_gaming_pc_cases_1780242165601.png',
  });

  const loadSettings = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('store_settings') || 'null');
      if (saved && saved.whyUs) {
        setWhyUsData(prev => ({
          ...prev,
          ...saved.whyUs
        }));
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadSettings();
    const handleUpdate = () => loadSettings();
    window.addEventListener('store_settings_updated', handleUpdate);
    return () => window.removeEventListener('store_settings_updated', handleUpdate);
  }, []);
  return (
    <section id="why-choose-us" className="px-4 md:px-12 py-16 bg-white font-sans relative overflow-hidden">

      {/* Section Header */}
      <div className="text-center space-y-2 mb-12 max-w-2xl mx-auto reveal-up">
        <span className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-[#6CC1F9]">
          WHY CHOOSE US
        </span>
        <h2 className="text-3xl md:text-[42px] font-extrabold text-[#0a1b2d] tracking-tight leading-[1.12]">
          Your Trusted Destination For<br />
          <span className="font-extrabold text-[#0a1b2d]">Gaming &amp; PC Hardware</span>
        </h2>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto relative">

        {/* 3-Column Stacked Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">

          {/* ── COLUMN 1: Card 1 (Top-Left Testimonial) + Card 4 (Bottom-Left Video) ── */}
          <div className="flex flex-col gap-6">

            {/* Card 1: Top-Left Testimonial */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex flex-col reveal-up min-h-[390px]">
              <div className="h-[210px] overflow-hidden rounded-t-[24px]">
                <img
                  src={whyUsData.card1Img}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  alt="Gaming desk setup"
                />
              </div>
              <div className="p-5 flex flex-col flex-1 justify-between">
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  &ldquo;{whyUsData.card1Quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-gray-100 pt-4 mt-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=hamza&backgroundColor=b6e3f4"
                    className="w-9 h-9 rounded-full border-2 border-gray-100 flex-shrink-0"
                    alt={whyUsData.card1Author}
                  />
                  <div>
                    <h5 className="text-sm font-bold text-[#0a1b2d]">{whyUsData.card1Author}</h5>
                    <span className="text-[11px] text-[#164475] font-semibold">Verified Buyer ✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Bottom-Left Video Card */}
            <div className="relative rounded-[24px] overflow-hidden bg-[#0a1b2d] min-h-[320px] flex items-center justify-center group cursor-pointer shadow-sm reveal-up delay-300">
              <img
                src={whyUsData.card4Img}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-all duration-700 group-hover:scale-105"
                alt="RGB PC Setup"
              />
              {/* Soft white fade from bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-white/30 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <button className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform cursor-pointer border-none">
                  <Play className="w-4 h-4 fill-[#0a1b2d] ml-0.5" />
                </button>
              </div>
            </div>

          </div>

          {/* ── COLUMN 2: Card 2 (Center Tall Video) + Card 5 (Bottom-Center Content) ── */}
          <div className="flex flex-col gap-6">

            {/* Card 2: Center Tall Featured Video Card */}
            <div className="relative rounded-[24px] overflow-hidden bg-[#0a1b2d] min-h-[460px] flex items-center justify-center group cursor-pointer shadow-md reveal-up delay-100">
              <img
                src={whyUsData.card2Img}
                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                alt="Adamjee Gaming Showcase"
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10">
                <button className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 cursor-pointer border-none">
                  <Play className="w-6 h-6 fill-[#0a1b2d] ml-0.5" />
                </button>
              </div>
            </div>

            {/* Card 5: Bottom-Center Quote + Submit Button */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-between reveal-up delay-400 min-h-[240px] text-center">
              <div className="w-full h-[140px] rounded-[18px] overflow-hidden mb-4">
                <img
                  src={whyUsData.card5Img}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  alt="Gamer at setup"
                />
              </div>
              <p className="text-[12px] text-gray-400 leading-relaxed mb-4 px-1">
                &ldquo;{whyUsData.card5Quote}&rdquo;
              </p>
              <button
                onClick={onOpenSubmitModal}
                className="w-full bg-[#103256] hover:bg-[#164475] text-white text-[13px] font-bold py-3.5 rounded-full shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer border-none"
              >
                Submit Your Setup Now
              </button>
            </div>

          </div>

          {/* ── COLUMN 3: Card 3 (Top-Right Testimonial) + Card 6 (Bottom-Right Video) ── */}
          <div className="flex flex-col gap-6">

            {/* Card 3: Top-Right Testimonial */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex flex-col reveal-up delay-200 min-h-[390px]">
              <div className="h-[210px] overflow-hidden rounded-t-[24px]">
                <img
                  src={whyUsData.card3Img}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  alt="RGB gaming room"
                />
              </div>
              <div className="p-5 flex flex-col flex-1 justify-between">
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  &ldquo;{whyUsData.card3Quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-gray-100 pt-4 mt-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=ali&backgroundColor=c0aede"
                    className="w-9 h-9 rounded-full border-2 border-gray-100 flex-shrink-0"
                    alt={whyUsData.card3Author}
                  />
                  <div>
                    <h5 className="text-sm font-bold text-[#0a1b2d]">{whyUsData.card3Author}</h5>
                    <span className="text-[11px] text-[#164475] font-semibold">Verified Buyer ✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 6: Bottom-Right Video Card */}
            <div className="relative rounded-[24px] overflow-hidden bg-[#0a1b2d] min-h-[320px] flex items-center justify-center group cursor-pointer shadow-sm reveal-up delay-500">
              <img
                src={whyUsData.card6Img}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-all duration-700 group-hover:scale-105"
                alt="Custom PC Build"
              />
              {/* Soft white fade from bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-white/30 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <button className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform cursor-pointer border-none">
                  <Play className="w-4 h-4 fill-[#0a1b2d] ml-0.5" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
