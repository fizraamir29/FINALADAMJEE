'use client';
import React from "react";
import { Check } from "lucide-react";
const whitePcSetupImg = "/images/white_pc_setup.png";

interface PerformanceCheckerProps {
  onCheckPerfOpen: () => void;
}

export default function PerformanceChecker({ onCheckPerfOpen }: PerformanceCheckerProps) {
  return (
    <section id="perf-checker" className="px-4 md:px-12 py-12 bg-white font-sans text-left">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column esports gamer image from screenshot */}
        <div className="overflow-hidden rounded-[24px] md:rounded-[32px] shadow-sm select-none">
          <img 
            src={whitePcSetupImg} 
            className="w-full h-auto object-cover select-none pointer-events-none transition-transform duration-500 hover:scale-[1.02]" 
            alt="White Gaming PC with Red LED Accents and Curved Monitor Setup" 
          />
        </div>

        {/* Right Column diagnostic selector descriptions and triggering button */}
        <div className="space-y-6 lg:pl-4">
          <div className="space-y-2">
            <span className="text-xs font-black tracking-widest uppercase text-[#164475]">
              GAMING PERFORMANCE / BENCHMARKS
            </span>
            <h2 className="text-3xl md:text-[44px] font-black text-[#0a1b2d] tracking-tight leading-tight">
              Interactive PC<br />Performance Checker
            </h2>
          </div>
          
          <p className="text-gray-500 text-sm md:text-base leading-relaxed font-semibold">
            Test your PC's gaming and performance capabilities in seconds. Simply enter your system specifications and get instant performance insights, benchmark scores, FPS estimates, upgrade suggestions, and performance analysis for your favorite games and workloads.
          </p>

          {/* Features checkmarks list styled exactly as screenshot */}
          <div className="space-y-3.5">
            {[
              "Choose Your Components",
              "Expert Compatibility Support",
              "Professional Cable Management",
              "Stress-Tested Performance",
              "Nationwide Delivery"
            ].map((info, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <div className="w-[18px] h-[18px] bg-[#164475] rounded-full flex items-center justify-center text-white shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[4]" />
                </div>
                <span className="text-xs md:text-sm font-bold text-gray-700">{info}</span>
              </div>
            ))}
          </div>

          {/* Capsule style Button to activate interactive checker modal */}
          <div className="pt-4">
            <button 
              onClick={onCheckPerfOpen}
              className="inline-block bg-[#164475] hover:bg-[#0a1b2d] text-white py-4 px-8 rounded-full text-xs md:text-sm font-black tracking-wide shadow-lg shadow-[#164475]/15 hover:shadow-[#164475]/25 transition-all duration-300 transform active:scale-97 cursor-pointer border-none"
            >
              Check Your PC Performance
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
