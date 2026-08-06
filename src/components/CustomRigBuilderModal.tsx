'use client';
import React, { useState, useEffect } from "react";
import { X, Check, Cpu, HardDrive, MonitorPlay, Zap, Download, ShoppingCart, ChevronRight } from "lucide-react";
import { Product, PCComponent } from "../types";
import { 
  PROCESSORS, 
  GPUS, 
  MOTHERBOARDS, 
  MEMORIES, 
  STORAGES, 
  PSUS, 
  COOLS, 
  CASES, 
  ADD_ON_COMPONENTS 
} from "../data";

interface CustomRigBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  formatPrice: (usdAmount: number) => string;
}

export default function CustomRigBuilderModal({
  isOpen,
  onClose,
  onAddToCart,
  formatPrice
}: CustomRigBuilderModalProps) {
  const [builderCpu, setBuilderCpu] = useState<PCComponent>(PROCESSORS[0]);
  const [builderGpu, setBuilderGpu] = useState<PCComponent>(GPUS[0]);
  const [builderMob, setBuilderMob] = useState<PCComponent>(MOTHERBOARDS[0]);
  const [builderRam, setBuilderRam] = useState<PCComponent>(MEMORIES[0]);
  const [builderSsd, setBuilderSsd] = useState<PCComponent>(STORAGES[0]);
  const [builderPsu, setBuilderPsu] = useState<PCComponent>(PSUS[0]);
  const [builderCool, setBuilderCool] = useState<PCComponent>(COOLS[0]);
  const [builderCase, setBuilderCase] = useState<PCComponent>(CASES[0]);
  const [builderExtras, setBuilderExtras] = useState<typeof ADD_ON_COMPONENTS>([]);
  const [quoteDownloaded, setQuoteDownloaded] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Auto-scroll logic or simple step management
  const steps = [
    { title: "Processor & Graphics", icon: Cpu },
    { title: "Core Platform", icon: Zap },
    { title: "Storage & Memory", icon: HardDrive },
    { title: "Cooling & Power", icon: MonitorPlay }
  ];

  if (!isOpen) return null;

  const totalCost = 
    builderCpu.price + 
    builderGpu.price + 
    builderMob.price + 
    builderRam.price + 
    builderSsd.price + 
    builderCool.price + 
    builderCase.price + 
    builderPsu.price + 
    builderExtras.reduce((a, b) => a + b.price, 0);

  const totalWatts = 
    builderCpu.watts + 
    builderGpu.watts + 
    builderMob.watts + 
    builderRam.watts + 
    builderSsd.watts;

  const handleDownloadQuotePDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const componentsList = [builderCpu, builderGpu, builderMob, builderRam, builderSsd, builderCool, builderCase, builderPsu].filter(Boolean);
    const itemsHtml = [...componentsList, ...builderExtras].map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0a1b2d;">${item.type || 'Add-on'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #475569;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: #164475;">${formatPrice(item.price)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Adamjee Computers - PC Build Quote</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif; margin: 0; padding: 40px; color: #0a1b2d; background-color: #ffffff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #164475; padding-bottom: 20px; margin-bottom: 40px; }
            .logo { font-size: 24px; font-weight: 900; color: #0a1b2d; }
            .logo span { color: #164475; }
            .quote-title { font-size: 28px; font-weight: 900; text-align: right; text-transform: uppercase; margin: 0; color: #164475; }
            .details { display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 14px; }
            .details h3 { margin-top: 0; color: #164475; }
            .details p { margin: 4px 0; color: #64748b; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { background-color: #f8fafc; padding: 12px; text-align: left; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
            .totals { display: flex; flex-direction: column; align-items: flex-end; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e2e8f0; }
            .total-row { display: flex; justify-content: space-between; width: 300px; margin-bottom: 8px; font-size: 14px; font-weight: bold; }
            .total-row.grand { font-size: 20px; color: #164475; border-top: 1px solid #f1f5f9; padding-top: 8px; margin-top: 8px; }
            .footer { text-align: center; margin-top: 60px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">ADAMJEE<span>COMPUTERS</span></div>
            <h1 class="quote-title">PC Build Quote</h1>
          </div>
          <div class="details">
            <div>
              <h3>Quotation For:</h3>
              <p><strong>Customer:</strong> Valued Client</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Quote ID:</strong> ADM-${Date.now().toString().slice(-6)}</p>
            </div>
            <div style="text-align: right;">
              <h3>Issued By:</h3>
              <p>Adamjee Computers Store</p>
              <p>123 Tech Avenue, Block 4</p>
              <p>Karachi, Pakistan</p>
              <p>support@adamjeecomputers.com</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 20%;">Component</th>
                <th style="width: 60%;">Description</th>
                <th style="width: 20%; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="totals">
            <div class="total-row">
              <span>Estimated Power:</span>
              <span>${totalWatts}W</span>
            </div>
            <div class="total-row grand">
              <span>Grand Total:</span>
              <span>${formatPrice(totalCost)}</span>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for choosing Adamjee Computers. This quotation is valid for 7 days.</p>
            <p>&copy; ${new Date().getFullYear()} Adamjee Computers. All rights reserved.</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setQuoteDownloaded(true);
    setTimeout(() => setQuoteDownloaded(false), 2000);
  };

  const renderOption = (comp: PCComponent, current: PCComponent, setFn: any) => (
    <button
      key={comp.id}
      onClick={() => setFn(comp)}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex justify-between items-center group ${
        current.id === comp.id 
          ? 'border-[#164475] bg-[#164475]/30 shadow-[0_0_20px_rgba(22,68,117,0.4)]' 
          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
      }`}
    >
      <div>
        <h4 className={`font-bold ${current.id === comp.id ? 'text-white' : 'text-white/80'}`}>{comp.name}</h4>
        <p className="text-xs text-white/50 mt-1 uppercase tracking-wider">{comp.watts}W Required</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`font-black ${current.id === comp.id ? 'text-white' : 'text-white'}`}>
          +{formatPrice(comp.price)}
        </span>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          current.id === comp.id ? 'border-[#164475] bg-[#164475]' : 'border-white/30'
        }`}>
          {current.id === comp.id && <Check className="w-3.5 h-3.5 text-white" />}
        </div>
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#0a1b2d] flex flex-col animate-fade-in overflow-hidden">
      
      {/* Top Navbar */}
      <div className="flex justify-between items-center px-6 md:px-12 py-4 border-b border-white/10 bg-[#0a1b2d]/80 backdrop-blur-xl z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#164475] to-[#0a1b2d] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(22,68,117,0.4)]">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Adamjee Forge</h2>
            <p className="text-[10px] text-white font-bold uppercase tracking-widest">Interactive Rig Builder</p>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 hover:rotate-90 transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Background Ambience */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#164475] rounded-full blur-[200px] opacity-10 animate-float pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#164475] rounded-full blur-[200px] opacity-10 animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

        {/* LEFT PANEL - Live Preview & HUD */}
        <div className="lg:w-[40%] bg-[#05101c] relative flex flex-col border-r border-white/10 z-10 hidden md:flex">
          <div className="flex-1 flex items-center justify-center relative p-8">
            <img 
              src="/images/blue_rgb_pc_cases_1780241349905.png" 
              alt="Custom Rig" 
              className="w-full max-w-md object-contain animate-float drop-shadow-[0_0_50px_rgba(22,68,117,0.3)]"
            />
            {/* HUD Overlay */}
            <div className="absolute top-12 left-12 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
              <p className="text-xs text-white/50 uppercase tracking-widest font-bold mb-1">Estimated Power</p>
              <div className="flex items-baseline gap-1 text-white">
                <span className="text-3xl font-black">{totalWatts}</span>
                <span className="text-sm font-bold">W</span>
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-white/10 bg-[#0a1b2d]/80 backdrop-blur-xl">
            <p className="text-xs text-white/50 uppercase tracking-widest font-bold mb-2">Total System Configuration</p>
            <div className="flex justify-between items-end mb-6">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                {formatPrice(totalCost)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleDownloadQuotePDF}
                className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl border border-white/20 text-white font-bold hover:bg-white/10 transition-colors"
              >
                {quoteDownloaded ? <Check className="w-5 h-5 text-green-400" /> : <Download className="w-5 h-5" />}
                {quoteDownloaded ? 'Saved' : 'Save PDF'}
              </button>
              <button 
                onClick={() => {
                  const customProductObject: Product = {
                    id: `cust-${Date.now()}`,
                    name: `Custom Forge: ${builderCpu.name} & ${builderGpu.name}`,
                    code: "CUSTOM RIG",
                    price: totalCost,
                    rating: 5.0,
                    image: "/images/blue_rgb_pc_cases_1780241349905.png"
                  };
                  onAddToCart(customProductObject);
                  onClose();
                }}
                className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-gradient-to-r from-[#164475] to-[#0a1b2d] text-white font-extrabold hover:shadow-[0_0_30px_rgba(22,68,117,0.5)] hover:-translate-y-1 transition-all"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Component Selection */}
        <div className="flex-1 overflow-y-auto scrollbar-hide z-10 p-4 md:p-8">
          <div className="max-w-2xl mx-auto space-y-10 pb-32">
            
            {/* Step 1: CPU & GPU */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="w-8 h-8 rounded-lg bg-[#164475]/50 flex items-center justify-center border border-[#164475]">
                  <Cpu className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Processor & Graphics</h3>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Select Processor (CPU)</label>
                <div className="space-y-2">
                  {PROCESSORS.map(c => renderOption(c, builderCpu, setBuilderCpu))}
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Select Graphics Card (GPU)</label>
                <div className="space-y-2">
                  {GPUS.map(g => renderOption(g, builderGpu, setBuilderGpu))}
                </div>
              </div>
            </div>

            {/* Step 2: Motherboard & RAM */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="w-8 h-8 rounded-lg bg-[#164475]/50 flex items-center justify-center border border-[#164475]">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Core Platform</h3>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Motherboard</label>
                <div className="space-y-2">
                  {MOTHERBOARDS.map(m => renderOption(m, builderMob, setBuilderMob))}
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Memory (RAM)</label>
                <div className="space-y-2">
                  {MEMORIES.map(r => renderOption(r, builderRam, setBuilderRam))}
                </div>
              </div>
            </div>

            {/* Step 3: Storage */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="w-8 h-8 rounded-lg bg-[#164475]/50 flex items-center justify-center border border-[#164475]">
                  <HardDrive className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Storage Solutions</h3>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Primary NVMe SSD</label>
                <div className="space-y-2">
                  {STORAGES.map(s => renderOption(s, builderSsd, setBuilderSsd))}
                </div>
              </div>
            </div>

            {/* Step 4: Cooling, Power, Case */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="w-8 h-8 rounded-lg bg-[#164475]/50 flex items-center justify-center border border-[#164475]">
                  <MonitorPlay className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Cooling, Power & Chassis</h3>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Power Supply (PSU)</label>
                <div className="space-y-2">
                  {PSUS.map(p => renderOption(p, builderPsu, setBuilderPsu))}
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Cooling System</label>
                <div className="space-y-2">
                  {COOLS.map(c => renderOption(c, builderCool, setBuilderCool))}
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">PC Chassis / Case</label>
                <div className="space-y-2">
                  {CASES.map(c => renderOption(c, builderCase, setBuilderCase))}
                </div>
              </div>
            </div>

            {/* Addons */}
            <div className="space-y-6 pt-4 border-t border-white/10">
              <h3 className="text-lg font-bold text-white tracking-tight">Premium Add-ons</h3>
              <div className="flex flex-wrap gap-3">
                {ADD_ON_COMPONENTS.map(add => {
                  const hasAddon = builderExtras.find(x => x.name === add.name);
                  return (
                    <button
                      key={add.name}
                      onClick={() => setBuilderExtras(prev => 
                        hasAddon ? prev.filter(x => x.name !== add.name) : [...prev, add]
                      )}
                      className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 ${
                        hasAddon 
                          ? 'bg-[#164475] text-white border-[#164475] shadow-[0_0_15px_rgba(22,68,117,0.3)]' 
                          : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {hasAddon ? <Check className="w-4 h-4" /> : <span className="w-4 text-center">+</span>}
                      {add.name} <span className="opacity-70 font-normal">({formatPrice(add.price)})</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Sticky Footer */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-[#0a1b2d]/95 backdrop-blur-xl border-t border-white/10 z-50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Total Build</span>
            <span className="text-2xl font-black text-white">{formatPrice(totalCost)}</span>
          </div>
          <button 
            onClick={() => {
              const customProductObject: Product = {
                id: `cust-${Date.now()}`,
                name: `Custom Forge: ${builderCpu.name} & ${builderGpu.name}`,
                code: "CUSTOM RIG",
                price: totalCost,
                rating: 5.0,
                image: "/images/blue_rgb_pc_cases_1780241349905.png"
              };
              onAddToCart(customProductObject);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#164475] text-white font-bold"
          >
            <ShoppingCart className="w-4 h-4" /> Add to Cart
          </button>
        </div>

      </div>
    </div>
  );
}
