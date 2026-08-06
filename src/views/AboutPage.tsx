'use client';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';

import { Shield, Zap, Award, Users, Truck, Headphones, ChevronRight, Play, Plus, ArrowRight } from 'lucide-react';
import Testimonials from '../components/Testimonials';

// CountUp Component for Section 2 stats
function AnimatedCounter({ target, suffix = '', duration = 1000, startOnVisible = true }: { target: number; suffix?: string; duration?: number; startOnVisible?: boolean }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(target);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) observer.unobserve(elementRef.current);
    };
  }, [target, duration]);

  // Handle floats if needed (e.g. 4.9)
  const isFloat = target === 49; // we will pass 49 for 4.9
  const displayVal = isFloat ? (count / 10).toFixed(1) : count;

  return (
    <div ref={elementRef} className="text-4xl md:text-5xl font-black text-[#0a1b2d] tracking-tight">
      {displayVal}{suffix}
    </div>
  );
}

export default function AboutPage() {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Brands data
  const brands = ['NVIDIA', 'AMD', 'Intel', 'ASUS ROG', 'Corsair', 'MSI', 'Samsung', 'Lian Li', 'NZXT', 'Noctua', 'Kingston', 'G.Skill'];

  return (
    <div className="min-h-screen bg-white">
      {/* SECTION 1 — HERO BANNER */}
      <div className="relative w-full h-[400px] flex items-center justify-start overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/blue_rgb_pc_cases_1780241349905.png')" }}
        />
        <div className="absolute inset-0 bg-[#0a1b2d]/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1b2d] via-[#0a1b2d]/85 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 w-full">
          <div className="text-left animate-left-reveal opacity-0" style={{ animation: "slideInLeft 600ms ease-out forwards" }}>
            {/* Breadcrumb */}
            <div className="text-sm text-gray-300 mb-4 font-semibold flex items-center gap-2">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">Why Choose Us</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
              Your Trusted Destination<br />For Gaming & PC Hardware
            </h1>
            <p className="text-base md:text-lg text-gray-300 max-w-xl font-medium leading-relaxed">
              Pakistan's most trusted PC hardware store since day one.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2 — STATS ROW */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { target: 500, suffix: '+', label: 'Happy Customers' },
              { target: 1000, suffix: '+', label: 'PCs Built' },
              { target: 49, suffix: '/5', label: 'Average Rating' }, // 49 triggers 4.9 representation
              { target: 48, suffix: 'hr', label: 'Fast Delivery' }
            ].map((stat, idx) => (
              <div 
                key={stat.label}
                className="reveal-up bg-white border border-gray-200/60 rounded-3xl p-6 text-center shadow-sm"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — CUSTOMER TESTIMONIALS GRID */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-[#0a1b2d] tracking-tight mb-2">
              What Our Customers Say
            </h2>
            <p className="text-gray-400 font-medium">Real reviews from our awesome custom build clients</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Hamza A. Card */}
            <div className="reveal-up bg-white border border-gray-200 rounded-[32px] overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 testimonial-card" style={{ transitionDelay: '0ms' }}>
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="/images/testimonial_setup1.png" 
                  alt="Hamza Setup" 
                  className="w-full h-full object-cover testimonial-img-zoom"
                />
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <p className="text-[#64748b] text-sm leading-relaxed font-medium mb-4">
                  "Absolutely loved the custom PC build quality and clean cable routing. The gameplay performance is phenomenal, and they guided me perfectly!"
                </p>
                <h4 className="font-black text-[#0a1b2d] text-base">— Hamza A.</h4>
              </div>
            </div>

            {/* Video Showcase Card */}
            <div 
              onClick={() => setPlayingVideo("https://assets.mixkit.co/videos/preview/mixkit-gaming-setup-with-keyboard-and-mouse-rgb-lighting-40019-large.mp4")}
              className="reveal-up bg-[#0a1b2d] border border-gray-800 rounded-[32px] overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 testimonial-card cursor-pointer group relative text-white" 
              style={{ transitionDelay: '100ms' }}
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="/images/testimonial_setup2.png" 
                  alt="Video Showcase" 
                  className="w-full h-full object-cover opacity-80 testimonial-img-zoom"
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/50 transition-colors duration-300">
                  <div className="w-14 h-14 rounded-full bg-white text-[#0a1b2d] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 pl-1">
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between bg-[#05101c]">
                <p className="text-gray-400 text-sm leading-relaxed font-medium mb-4">
                  "See the Adamjee custom battlestations build quality in real-world motion. Dual-screen setups, full-spectrum clean lighting, and custom cooling loop rigs."
                </p>
                <h4 className="font-black text-white text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#0a1b2d] rounded-full animate-pulse"></span> Adamjee Setup Showcase
                </h4>
              </div>
            </div>

            {/* Ali R. Card */}
            <div className="reveal-up bg-white border border-gray-200 rounded-[32px] overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 testimonial-card" style={{ transitionDelay: '200ms' }}>
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="/images/testimonial_setup3.png" 
                  alt="Ali Setup" 
                  className="w-full h-full object-cover testimonial-img-zoom"
                />
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <p className="text-[#64748b] text-sm leading-relaxed font-medium mb-4">
                  "Ordered my gaming setup from Adamjee. Authenticity was verified instantly, they build it on video calls, and shipped with perfect packing."
                </p>
                <h4 className="font-black text-[#0a1b2d] text-base">— Ali R.</h4>
              </div>
            </div>

            {/* Zeeshan T. Card */}
            <div className="reveal-up bg-white border border-gray-200 rounded-[32px] overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 testimonial-card" style={{ transitionDelay: '300ms' }}>
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="/images/testimonial_setup5.png" 
                  alt="Zeeshan Setup" 
                  className="w-full h-full object-cover testimonial-img-zoom"
                />
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <p className="text-[#64748b] text-sm leading-relaxed font-medium mb-4">
                  "Their upgrade recommendations helped me improve my CS2 FPS to 500+ without overspending. Extremely knowledgeable hardware engineers."
                </p>
                <h4 className="font-black text-[#0a1b2d] text-base">— Zeeshan T.</h4>
              </div>
            </div>

            {/* Submit Your Setup Card (Dark Card) */}
            <div className="reveal-up bg-[#0a1b2d] border border-gray-800 rounded-[32px] p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group cursor-pointer text-white" style={{ transitionDelay: '400ms' }}>
              <div>
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white mb-6 group-hover:bg-[#164475] group-hover:border-transparent transition-all duration-300">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black mb-3">Submit Your Setup</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  Show off your legendary Adamjee setup to our tech community. Send your pictures and get featured!
                </p>
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#164475] flex items-center gap-2 group-hover:text-white transition-colors">
                  Join Battlestations Ring <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4 — WHY CHOOSE US — same component as homepage */}
      <Testimonials onOpenSubmitModal={() => {}} />

      {/* SECTION 5 — OUR PROCESS (How It Works) */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-20 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-[#0a1b2d] tracking-tight mb-2 font-black">
              How We Build Your PC
            </h2>
            <p className="text-gray-400 font-medium">Step-by-step transparency on your custom machine</p>
          </div>

          <div className="reveal-up process-section relative">
            
            {/* Connection Line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gray-100 -z-10 hidden md:block">
              <div className="h-full bg-[#164475] transition-all duration-[800ms] ease-out timeline-line-draw w-0" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "1. 🛒", title: "Choose Components", desc: "Select from our updated parts catalog or use our smart configurator tool." },
                { step: "2. ⚙️", title: "We Assemble", desc: "Certified build technicians perform assembly and meticulous cable management." },
                { step: "3. 🧪", title: "Stress Test", desc: "Every PC undergoes 24h bench testing (Cinebench, Furmark) to guarantee stability." },
                { step: "4. 🚚", title: "Deliver to You", desc: "Rigid double-box wood crating ensures your rig arrives in absolute mint shape." }
              ].map((process, idx) => (
                <div 
                  key={process.title}
                  className="reveal-up bg-white border border-gray-200 rounded-3xl p-6 text-center shadow-sm relative z-10"
                  style={{ transitionDelay: `${idx * 150}ms` }}
                >
                  <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 text-[#0a1b2d] text-xl font-black flex items-center justify-center mx-auto mb-4">
                    {process.step.split(' ')[0]}
                  </div>
                  <h3 className="text-base font-black text-[#0a1b2d] mb-2">{process.title}</h3>
                  <p className="text-gray-400 text-xs font-semibold leading-relaxed">{process.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 6 — BRANDS WE CARRY */}
      <section className="py-20 bg-gray-50 border-y border-gray-100 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 mb-10 text-center">
          <h2 className="text-2xl font-black text-[#0a1b2d] tracking-tight">Top Brands We Carry</h2>
        </div>

        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee-25s flex whitespace-nowrap">
            {brands.concat(brands).map((brand, idx) => (
              <div 
                key={idx} 
                className="mx-8 text-2xl font-black tracking-widest text-[#0a1b2d]/30 uppercase shrink-0 whitespace-nowrap hover:text-[#164475] transition-colors duration-300"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — CTA BANNER */}
      <div className="bg-[#03152a] text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-radial-gradient from-white to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">Ready to Build?</h2>
          <p className="text-[#94a3b8] text-base md:text-lg max-w-xl mx-auto font-medium">
            Configure your dream PC with our interactive builder or shop our parts list.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href="/build-your-pc" 
              className="bg-white text-[#0a1b2d] hover:bg-[#164475] hover:text-white font-extrabold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Start Building →
            </Link>
            <Link 
              href="/" 
              className="bg-transparent border border-white/20 hover:border-white hover:bg-white/5 text-white font-extrabold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Shop Products →
            </Link>
          </div>
        </div>
      </div>

      {/* Showcase Video Modal Player */}
      {playingVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setPlayingVideo(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-black rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <video src={playingVideo} controls autoPlay className="w-full h-auto aspect-video" />
            <button 
              onClick={() => setPlayingVideo(null)}
              className="absolute top-4 right-4 bg-white/20 text-white hover:bg-white/40 w-10 h-10 rounded-full flex items-center justify-center font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-marquee-25s {
          display: flex;
          width: fit-content;
          animation: marquee 25s linear infinite;
        }
        .process-section.is-revealed .timeline-line-draw {
          width: 100% !important;
        }
        .testimonial-img-zoom {
          transition: transform 500ms ease-out;
        }
        .testimonial-card:hover .testimonial-img-zoom {
          transform: scale(1.05);
        }
      `}} />
    </div>
  );
}
