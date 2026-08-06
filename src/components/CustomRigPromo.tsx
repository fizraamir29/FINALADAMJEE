'use client';
import React from "react";
import { Check } from "lucide-react";

interface CustomRigPromoProps {
  onBuildPcOpen: () => void;
}

export default function CustomRigPromo({ onBuildPcOpen }: CustomRigPromoProps) {
  return (
    <section className="px-4 md:px-12 py-8 relative reveal-up">
      <div className="relative bg-[#103256] rounded-[28px] md:rounded-[32px] overflow-hidden text-white flex flex-col justify-center min-h-[480px] border border-white/10 shadow-2xl">
        
        {/* Background Right: RGB PC Image */}
        <div 
          className="absolute right-0 top-0 h-full w-full md:w-[60%] z-0 bg-cover bg-center md:bg-right"
          style={{ backgroundImage: 'url("/images/blue_rgb_pc_cases_1780241349905.png")' }}
        >
          {/* Gradient to blend the image smoothly into the dark left side */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#103256] via-[#103256]/85 to-transparent"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-20 w-full px-8 md:px-16 max-w-[620px] space-y-4 md:space-y-4.5 text-left select-none py-10">
          
          {/* Subheading */}
          <div className="flex items-center space-x-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-[10px] md:text-[11px] font-bold tracking-[0.12em] text-white uppercase">
              Build Your Custom PC
            </span>
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-[54px] font-bold tracking-tight leading-[1.08] text-white">
            Build The PC That <br />
            <span className="text-white font-black">Matches Your Power</span>
          </h2>

          {/* Description */}
          <p className="text-[#9cb5cc] text-[13px] md:text-[14.5px] leading-[1.6] max-w-[460px] font-medium pt-1">
            Whether you're a competitive gamer, streamer, designer, or video editor, we help you build the perfect custom PC according to your performance needs and budget.
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="bg-[#164475]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center space-x-2.5 shadow-sm">
              <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-[#164475] stroke-[4]" />
              </div>
              <span className="text-[12px] md:text-[13px] font-medium text-white tracking-wide">13 Components</span>
            </div>
            <div className="bg-[#164475]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center space-x-2.5 shadow-sm">
              <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-[#164475] stroke-[4]" />
              </div>
              <span className="text-[12px] md:text-[13px] font-medium text-white tracking-wide">PDF Quotation</span>
            </div>
          </div>

          {/* Button */}
          <div className="pt-4">
            <button 
              onClick={onBuildPcOpen}
              className="bg-white text-black hover:bg-gray-100 font-bold px-7 py-3 rounded-full text-[14px] shadow-lg transition-transform duration-200 transform active:scale-95 cursor-pointer"
            >
              Start Your Build
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

