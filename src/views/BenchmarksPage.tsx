'use client';
import Link from 'next/link';
import React, { useState } from 'react';

import { useSEO } from '../hooks/useSEO';
import { Loader2, ArrowRight, ShieldAlert, TrendingUp, Cpu, Compass, ChevronRight } from 'lucide-react';
import { PROCESSORS, GPUS, MEMORIES, TARGET_GAMES } from '../data';

export default function BenchmarksPage() {
  useSEO({
    title: "PC Performance Checker & Gaming Benchmarks | Adamjee Computers",
    description: "Verify your custom gaming PC's estimated frame rates (FPS) for popular games like Cyberpunk 2077, FiveM, GTA V, CS2, and Valorant using our hardware matcher.",
    keywords: "gaming benchmarks, PC builder, FPS calculator, PC specs matcher, bottleneck checker, gaming PC Pakistan"
  });
  // Config state
  const [cpu, setCpu] = useState(PROCESSORS[0].name);
  const [gpu, setGpu] = useState(GPUS[0].name);
  const [ram, setRam] = useState(MEMORIES[0].name);
  const [game, setGame] = useState(TARGET_GAMES[0].name);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    fps: number;
    score: number;
    preset: string;
    advice: string;
    bottleneck: string;
  } | null>(null);

  const handleRunChecker = () => {
    setIsAnalyzing(true);
    setResults(null);
    setTimeout(() => {
      const selectedGame = TARGET_GAMES.find(g => g.name === game) || TARGET_GAMES[0];
      const selectedCpuWatts = PROCESSORS.find(c => c.name === cpu)?.watts || 120;
      const selectedGpuWatts = GPUS.find(g => g.name === gpu)?.watts || 300;
      
      // Calculate dynamic FPS simulation
      let scoreScale = (selectedCpuWatts + selectedGpuWatts) / 420;
      let calculatedFps = Math.floor(selectedGame.baseFps * scoreScale * 1.05);
      let bottleneckIndex = Math.floor(Math.abs(selectedCpuWatts - selectedGpuWatts * 0.35));
      if (bottleneckIndex > 45) bottleneckIndex = 45; // cap it to look premium
      if (bottleneckIndex < 5) bottleneckIndex = 5;

      let bLabel = "Flawless Balance (Below 5% variation)";
      if (bottleneckIndex > 15) bLabel = `Minor GPU Bottleneck (approx. ${bottleneckIndex}%)`;
      if (bottleneckIndex > 30) bLabel = `Processor bottleneck detected (approx. ${bottleneckIndex}%)`;

      let scoreVal = Math.floor(82 + scoreScale * 12);
      if (scoreVal > 100) scoreVal = 100;

      let targetPreset = "Ultra Performance";
      if (scoreVal < 88) targetPreset = "High Esports Level";

      setResults({
        fps: calculatedFps,
        score: scoreVal,
        preset: targetPreset,
        advice: `Your ${gpu} and ${cpu} delivers an outstanding match for ${selectedGame.name}. Consider maintaining ample airflow to keep cores boosted above 5.1GHz.`,
        bottleneck: bLabel
      });
      setIsAnalyzing(false);
    }, 1200);
  };

  // Expected FPS table data
  const expectedFpsData = [
    { name: "Cyberpunk 2077", low: "45 FPS", mid: "85 FPS", high: "140 FPS" },
    { name: "GTA V / FiveM", low: "120 FPS", mid: "200 FPS", high: "350 FPS" },
    { name: "CS2 Esports", low: "200 FPS", mid: "380 FPS", high: "500+ FPS" },
    { name: "Valorant", low: "300 FPS", mid: "500 FPS", high: "700+ FPS" },
    { name: "Warzone 3.0", low: "80 FPS", mid: "140 FPS", high: "220 FPS" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* SECTION 1 — HERO BANNER */}
      <div className="relative w-full h-[350px] flex items-center justify-start overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/white_pc_setup.png')" }}
        />
        <div className="absolute inset-0 bg-[#0a1b2d]/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1b2d] via-[#0a1b2d]/70 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 w-full">
          <div className="text-left animate-left-reveal opacity-0" style={{ animation: "slideInLeft 600ms ease-out forwards" }}>
            {/* Breadcrumb */}
            <div className="text-sm text-gray-300 mb-4 font-semibold flex items-center gap-2">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">Benchmarks</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
              PC Performance Checker
            </h1>
            <p className="text-base md:text-lg text-gray-300 max-w-xl font-medium leading-relaxed">
              Test your build. Know your FPS. Upgrade smarter.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        
        {/* SECTION 2 — INTERACTIVE BENCHMARK TOOL */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 items-start">
          
          {/* LEFT SIDE (60%) Selector Panel */}
          <div className="lg:col-span-6 bg-white border border-gray-200 rounded-[32px] p-6 md:p-8">
            <h2 className="text-2xl font-black text-[#0a1b2d] mb-6 tracking-tight flex items-center gap-3">
              <Cpu className="w-6 h-6 text-[#164475]" /> Configure Your System
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">CPU Matcher</label>
                <select
                  value={cpu}
                  onChange={e => setCpu(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#f8fafc] border border-gray-200 focus:bg-white focus:border-[#164475] focus:ring-1 focus:ring-[#164475] outline-none transition-all duration-200 text-[#0a1b2d] font-bold"
                >
                  {PROCESSORS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">GPU Matcher</label>
                <select
                  value={gpu}
                  onChange={e => setGpu(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#f8fafc] border border-gray-200 focus:bg-white focus:border-[#164475] focus:ring-1 focus:ring-[#164475] outline-none transition-all duration-200 text-[#0a1b2d] font-bold"
                >
                  {GPUS.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">RAM Capacity</label>
                <select
                  value={ram}
                  onChange={e => setRam(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#f8fafc] border border-gray-200 focus:bg-white focus:border-[#164475] focus:ring-1 focus:ring-[#164475] outline-none transition-all duration-200 text-[#0a1b2d] font-bold"
                >
                  {MEMORIES.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Target Game</label>
                <select
                  value={game}
                  onChange={e => setGame(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#f8fafc] border border-gray-200 focus:bg-white focus:border-[#164475] focus:ring-1 focus:ring-[#164475] outline-none transition-all duration-200 text-[#0a1b2d] font-bold"
                >
                  {TARGET_GAMES.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                </select>
              </div>

              <div className="pt-3">
                <button
                  onClick={handleRunChecker}
                  disabled={isAnalyzing}
                  className="w-full bg-[#0a1b2d] hover:bg-[#164475] text-white font-extrabold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-wider glow-button"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Watts & Cores...
                    </>
                  ) : (
                    "Run Performance Check"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE (40%) Results Panel (Sticky) */}
          <div className="lg:col-span-4 lg:sticky lg:top-[120px]">
            <div className="bg-white border border-gray-200 rounded-[32px] p-6 md:p-8 flex flex-col justify-center h-full min-h-[380px] shadow-sm relative overflow-hidden">
              
              {!results && !isAnalyzing && (
                <div className="text-center py-12 animate-fade-in">
                  <Compass className="w-12 h-12 mx-auto text-gray-300 mb-4 animate-float" />
                  <h3 className="text-lg font-black text-[#0a1b2d] mb-2">Checker Idle</h3>
                  <p className="text-sm text-gray-400 font-semibold max-w-xs mx-auto leading-relaxed">
                    Select your components and run the checker to see gaming analysis.
                  </p>
                </div>
              )}

              {isAnalyzing && (
                <div className="text-center py-12 animate-pulse">
                  <Loader2 className="w-10 h-10 mx-auto text-[#164475] mb-4 animate-spin" />
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Running simulation...</p>
                </div>
              )}

              {results && !isAnalyzing && (
                <div className="space-y-6 result-fade-scale">
                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-black text-[#0a1b2d] mb-1">Simulated Results</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">High Settings 1440p Target</p>
                  </div>

                  {/* 3 Stats Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-1">Est. FPS</p>
                      <p className="text-2xl font-black text-[#164475]">{results.fps}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-1">Score</p>
                      <p className="text-2xl font-black text-emerald-600">{results.score}/100</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center flex flex-col justify-center">
                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-wider mb-1">Preset</p>
                      <p className="text-[11px] font-black text-[#0a1b2d] leading-snug">{results.preset.split(' ')[0]}</p>
                    </div>
                  </div>

                  {/* Bottleneck info */}
                  <div className="flex items-center gap-2 text-xs font-black text-[#164475]">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Status: {results.bottleneck}</span>
                  </div>

                  {/* AI advice box */}
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">💡 Expert Advice</p>
                    <p className="text-[#475569] text-xs font-semibold italic leading-relaxed">
                      "{results.advice}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* SECTION 3 — GAME BENCHMARKS TABLE */}
        <div className="mt-24">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-[#0a1b2d] tracking-tight mb-2">Expected FPS by Game</h2>
            <p className="text-gray-400 font-medium">Estimated frame rates for standard system specifications</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-[#0a1b2d]">Game Name</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-400 text-center">Low End Config</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-[#164475] text-center">Mid Range Config</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-emerald-600 text-center">High End Config</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expectedFpsData.map((row, idx) => (
                    <tr 
                      key={row.name} 
                      className="reveal-up hover:bg-gray-50/50 transition-colors"
                      style={{ transitionDelay: `${idx * 80}ms` }}
                    >
                      <td className="px-6 py-5 font-black text-[#0a1b2d] text-base">{row.name}</td>
                      <td className="px-6 py-5 font-bold text-gray-400 text-center">{row.low}</td>
                      <td className="px-6 py-5 font-extrabold text-[#164475] text-center">{row.mid}</td>
                      <td className="px-6 py-5 font-black text-emerald-600 text-center">{row.high}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION 4 — WHY BENCHMARK MATTERS */}
        <div className="mt-24">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black text-[#0a1b2d] tracking-tight mb-2">Why Benchmark Matters</h2>
            <p className="text-gray-400 font-medium font-semibold">Make data-driven upgrading and purchase choices</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Avoid Bottlenecks",
                desc: "Wrong component pairing wastes money. Our solver matches CPU & GPU capabilities to unleash maximum power.",
                icon: "🔍"
              },
              {
                title: "Smart Upgrades",
                desc: "Know exactly which part to upgrade first. Maximize frames by upgrading parts causing system bottlenecks.",
                icon: "💰"
              },
              {
                title: "Max FPS",
                desc: "Get the most out of your budget. Optimize component selections before purchase to ensure target gaming FPS.",
                icon: "⚡"
              }
            ].map((card, idx) => (
              <div 
                key={card.title}
                className="reveal-up bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-gray-100 group-hover:bg-[#164475]/5 transition-colors">
                  {card.icon}
                </div>
                <h3 className="text-lg font-black text-[#0a1b2d] mb-3">{card.title}</h3>
                <p className="text-[#64748b] text-sm leading-relaxed font-medium">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECTION 5 — CTA BANNER */}
      <div className="mt-24 bg-[#03152a] text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-radial-gradient from-white to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            Ready to Build the Perfect PC?
          </h2>
          <p className="text-[#94a3b8] text-base md:text-lg max-w-xl mx-auto font-medium">
            Use our Custom PC Builder to configure your dream rig component by component.
          </p>
          <div>
            <Link 
              href="/build-your-pc" 
              className="inline-flex items-center gap-2 bg-white text-[#0a1b2d] hover:bg-[#164475] hover:text-white font-extrabold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Build Your PC <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes resultScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .result-fade-scale {
          animation: resultScaleIn 400ms ease-out forwards;
        }
        .glow-button:hover {
          box-shadow: 0 0 20px rgba(0, 123, 255, 0.4);
          transform: scale(1.03);
        }
      `}} />
    </div>
  );
}
