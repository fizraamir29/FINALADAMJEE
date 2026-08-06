'use client';
import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { PROCESSORS, GPUS, MEMORIES, TARGET_GAMES } from "../data";

interface PerformanceCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PerformanceCheckerModal({ isOpen, onClose }: PerformanceCheckerModalProps) {
  const [checkerSetup, setCheckerSetup] = useState({
    cpu: PROCESSORS[0].name,
    gpu: GPUS[0].name,
    ram: MEMORIES[0].name,
    game: TARGET_GAMES[0].name
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysedResult, setAnalysedResult] = useState<{
    fps: number;
    bottleneck: string;
    score: number;
    preset: string;
    advice: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCheckPerformance = () => {
    setIsAnalyzing(true);
    setAnalysedResult(null);
    setTimeout(() => {
      const selectedGame = TARGET_GAMES.find(g => g.name === checkerSetup.game) || TARGET_GAMES[0];
      const selectedCpuWatts = PROCESSORS.find(c => c.name === checkerSetup.cpu)?.watts || 120;
      const selectedGpuWatts = GPUS.find(g => g.name === checkerSetup.gpu)?.watts || 300;
      
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

      setAnalysedResult({
        fps: calculatedFps,
        bottleneck: bLabel,
        score: scoreVal,
        preset: targetPreset,
        advice: `Your ${checkerSetup.gpu} and ${checkerSetup.cpu} delivers an outstanding match for ${selectedGame.name}. Consider maintaining ample airflow to keep cores boosted above 5.1GHz.`
      });
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[32px] p-6 md:p-8 max-w-lg w-full modal-scale-in space-y-6 border border-gray-100 shadow-2xl relative text-left">
        <button 
          onClick={() => { onClose(); setAnalysedResult(null); }} 
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 bg-gray-50 hover:bg-gray-100 transition rounded-full cursor-pointer border-none"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <span className="text-[10px] font-black tracking-widest uppercase text-[#164475]">
            Interactive Diagnostics
          </span>
          <h4 className="text-xl md:text-2xl font-black text-[#0a1b2d]">PC Performance Checker</h4>
          <p className="text-xs text-gray-400 font-semibold leading-relaxed">
            Select your system specs below to simulate real-world gaming FPS and bottlenecks.
          </p>
        </div>

        {/* Inputs select block checker */}
        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-extrabold block">CPU Matcher</label>
              <select 
                value={checkerSetup.cpu} 
                onChange={e => setCheckerSetup(prev => ({ ...prev, cpu: e.target.value }))}
                className="w-full border rounded-xl px-2.5 py-2 text-xs font-bold bg-white text-gray-800"
              >
                {PROCESSORS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-extrabold block">GPU Matcher</label>
              <select 
                value={checkerSetup.gpu} 
                onChange={e => setCheckerSetup(prev => ({ ...prev, gpu: e.target.value }))}
                className="w-full border rounded-xl px-2.5 py-2 text-xs font-bold bg-white text-gray-800"
              >
                {GPUS.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-extrabold block">Bench Game Target</label>
              <select 
                value={checkerSetup.game} 
                onChange={e => setCheckerSetup(prev => ({ ...prev, game: e.target.value }))}
                className="w-full border rounded-xl px-2.5 py-2 text-xs font-bold bg-white text-gray-800"
              >
                {TARGET_GAMES.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={handleCheckPerformance} 
              disabled={isAnalyzing}
              className="w-full bg-[#164475] hover:bg-[#0a1b2d] disabled:bg-gray-400 text-white py-3 px-4 rounded-xl text-xs font-black tracking-widest uppercase transition flex items-center justify-center space-x-2 shadow-md cursor-pointer border-none"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Core Watts...</span>
                </>
              ) : (
                <span>Run Checker</span>
              )}
            </button>
          </div>

          {/* Analysed Result visualization block */}
          {analysedResult && (
            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3.5 animate-slide-in">
              <div className="grid grid-cols-3 gap-2 text-center divide-x">
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-black">Estimated FPS</p>
                  <p className="text-xl font-black text-[#164475]">{analysedResult.fps} FPS</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-black">System Score</p>
                  <p className="text-xl font-black text-[#164475]">{analysedResult.score}/100</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-black">Performance Preset</p>
                  <p className="text-xs font-bold text-[#0a1b2d] truncate mt-1.5">{analysedResult.preset}</p>
                </div>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg text-xs space-y-1">
                <p className="font-extrabold text-[#0a1b2d] flex items-center space-x-1">
                  <span>💡 Expert Advice:</span>
                </p>
                <p className="text-gray-500 font-semibold italic">{analysedResult.advice}</p>
                <p className="text-[10px] text-[#164475] font-bold mt-1">Status: {analysedResult.bottleneck}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
