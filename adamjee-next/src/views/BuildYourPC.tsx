'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from "react";

import { useSEO } from "../hooks/useSEO";
import {
  PROCESSORS, GPUS, MOTHERBOARDS, MEMORIES, STORAGES, PSUS, COOLS, CASES,
  ADD_ON_COMPONENTS
} from "../data";
import { Product, PCComponent } from "../types";
import { Check, Download, ShoppingCart, Headphones, Truck, Users, ShieldCheck, ChevronRight } from "lucide-react";

interface BuildYourPCProps {
  handleAddToCart: (product: Product, qty?: number) => void;
  formatPrice: (usdAmount: number) => string;
}

export default function BuildYourPC({ handleAddToCart, formatPrice }: BuildYourPCProps) {
  useSEO({
    title: "Custom PC Builder | Build Your Gaming Rig | Adamjee Computers",
    description: "Design and build your custom gaming PC with our interactive PC builder. Choose your CPU, GPU, motherboard, RAM, storage, power supply, and case with real-time price estimation.",
    keywords: "custom PC builder, gaming PC builder, build a PC, gaming rig, custom desktop, Adamjee Computers, Karachi"
  });
  const router = useRouter();

  // State for selected components
  const [selectedCpu, setSelectedCpu] = useState<PCComponent | null>(null);
  const [selectedGpu, setSelectedGpu] = useState<PCComponent | null>(null);
  const [selectedMob, setSelectedMob] = useState<PCComponent | null>(null);
  const [selectedRam, setSelectedRam] = useState<PCComponent | null>(null);
  const [selectedSsd, setSelectedSsd] = useState<PCComponent | null>(null);
  const [selectedPsu, setSelectedPsu] = useState<PCComponent | null>(null);
  const [selectedCol, setSelectedCol] = useState<PCComponent | null>(null);
  const [selectedCas, setSelectedCas] = useState<PCComponent | null>(null);

  // State for Add-ons
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  // Bundle deals come from the live catalogue (products tagged "Bundle", with a
  // fallback to the newest published products) — never from a hardcoded list.
  const [bundleProducts, setBundleProducts] = useState<Product[]>([]);
  useEffect(() => {
    fetch('/api/products?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.products)) {
          const tagged = data.products.filter(
            (p: any) => (p.tag || '').toLowerCase() === 'bundle'
          );
          setBundleProducts((tagged.length > 0 ? tagged : data.products).slice(0, 4));
        }
      })
      .catch(console.error);
  }, []);

  // Calculate totals
  const componentsList = [selectedCpu, selectedGpu, selectedMob, selectedRam, selectedSsd, selectedPsu, selectedCol, selectedCas].filter(Boolean) as PCComponent[];
  
  const componentsCost = componentsList.reduce((acc, curr) => acc + curr.price, 0);
  const componentsWatts = componentsList.reduce((acc, curr) => acc + (curr.watts || 0), 0);

  const addOnsList = ADD_ON_COMPONENTS.filter(a => selectedAddOns.includes(a.name));
  const addOnsCost = addOnsList.reduce((acc, curr) => acc + curr.price, 0);
  const addOnsWatts = addOnsList.reduce((acc, curr) => acc + (curr.watts || 0), 0);

  const totalCost = componentsCost + addOnsCost;
  const totalWatts = componentsWatts + addOnsWatts;

  const toggleAddOn = (name: string) => {
    setSelectedAddOns(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleAddPcToCart = () => {
    if (componentsList.length === 0) return;
    
    const customPcProduct: Product = {
      id: `custom-pc-${Date.now()}`,
      name: "Custom Built PC",
      code: "CUSTOM-RIG",
      price: totalCost,
      rating: 5,
      image: "/images/custom_blue_gaming_pc_cases_1780242165601.png",
      tag: "New"
    };

    handleAddToCart(customPcProduct, 1);
    router.push("/cart");
  };

  const handleAddBundleToCart = () => {
    if (bundleProducts.length === 0) return;
    bundleProducts.forEach(product => {
        handleAddToCart(product, 1);
    });
    router.push("/cart");
  };

  const handleDownloadQuotePDF = () => {
    if (componentsList.length === 0) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const itemsHtml = [...componentsList, ...addOnsList].map(item => `
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
  };

  // Sections array for easy rendering
  const buildSections = [
    { title: "PROCESSOR", state: selectedCpu, setState: setSelectedCpu, options: PROCESSORS },
    { title: "GRAPHICS CARD", state: selectedGpu, setState: setSelectedGpu, options: GPUS },
    { title: "MOTHERBOARD", state: selectedMob, setState: setSelectedMob, options: MOTHERBOARDS },
    { title: "MEMORY (RAM)", state: selectedRam, setState: setSelectedRam, options: MEMORIES },
    { title: "STORAGE (SSD)", state: selectedSsd, setState: setSelectedSsd, options: STORAGES },
    { title: "POWER SUPPLY", state: selectedPsu, setState: setSelectedPsu, options: PSUS },
    { title: "CPU COOLER", state: selectedCol, setState: setSelectedCol, options: COOLS },
    { title: "PC CASE", state: selectedCas, setState: setSelectedCas, options: CASES },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc] pb-24">
      {/* SECTION 1 — HERO BANNER */}
      <div className="relative w-full h-[400px] flex items-center justify-start overflow-hidden">
        {/* Background Image & Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/custom_blue_gaming_pc_cases_1780242165601.png')" }}
        />
        <div className="absolute inset-0 bg-[#0a1b2d]/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1b2d] via-[#0a1b2d]/80 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-12 w-full">
          <div className="animate-slide-in-left opacity-0" style={{ animation: "slideInLeft 600ms ease-out forwards" }}>
            {/* Breadcrumb */}
            <div className="text-sm text-gray-300 mb-6 font-medium flex items-center gap-2">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">Build Your PC</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-4 tracking-tight">
              Build Your Custom PC
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-xl font-medium">
              Configure every component your way. Build the ultimate machine for gaming, creation, and beyond.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12 md:py-20">
        
        {/* SECTION 2 — MAIN BUILDER */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start">
          
          {/* Left side (70%) — Component Cards Grid */}
          <div className="w-full lg:w-[70%] flex flex-col gap-12">
            {buildSections.map((section, index) => (
              <div key={section.title} className="reveal-up" style={{ animationDelay: `${index * 80}ms` }}>
                <h2 className="text-2xl font-black text-[#0a1b2d] mb-6 tracking-tight flex items-center gap-3">
                  <span className="w-2 h-8 bg-[#164475] rounded-full inline-block"></span>
                  {section.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {section.options.map(option => {
                    const isSelected = section.state?.id === option.id;
                    return (
                      <div 
                        key={option.id}
                        onClick={() => section.setState(option)}
                        className={`bg-white rounded-2xl p-5 border-2 transition-all duration-200 cursor-pointer flex flex-col h-full relative group hover:shadow-lg hover:-translate-y-1
                          ${isSelected ? 'border-[#164475] shadow-md ring-4 ring-[#164475]/10' : 'border-transparent shadow-sm hover:border-[#164475]/30'}
                        `}
                      >
                        <div className="mb-4">
                          <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full inline-block
                            ${isSelected ? 'bg-[#164475] text-white' : 'bg-gray-100 text-gray-600'}
                          `}>
                            {option.type}
                          </span>
                        </div>
                        <h3 className="font-bold text-[#0a1b2d] leading-snug mb-2 flex-grow text-[15px]">
                          {option.name}
                        </h3>
                        <div className="flex items-end justify-between mt-4">
                          <div className="text-lg font-black text-[#164475]">{formatPrice(option.price)}</div>
                          
                          <button className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200
                            ${isSelected ? 'bg-[#164475] text-white scale-100' : 'bg-gray-100 text-gray-400 group-hover:bg-[#164475]/10 group-hover:text-[#164475] scale-90'}
                          `}>
                            {isSelected ? <Check className="w-4 h-4 font-bold" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right side (30%) Sticky Summary */}
          <div className="w-full lg:w-[30%] lg:sticky lg:top-[120px] reveal-up delay-300">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col relative">
              <div className="bg-[#0a1b2d] p-6 text-white">
                <h3 className="text-xl font-black mb-1">Your Build Summary</h3>
                <p className="text-sm text-gray-400 font-medium">Review your custom rig</p>
              </div>
              
              <div className="p-6 flex-grow flex flex-col gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                {componentsList.length === 0 && addOnsList.length === 0 && (
                  <div className="text-gray-400 text-sm font-medium text-center py-8">
                    Select components to start building.
                  </div>
                )}
                
                {[...componentsList, ...addOnsList].map((item, idx) => (
                  <div key={`${(item as any).id || item.name}-${idx}`} className="flex justify-between items-start gap-3 animate-fade-in-up text-sm font-medium pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-[#164475] shrink-0 mt-0.5" />
                      <span className="leading-snug">
                        <span className="font-bold text-[#0a1b2d]">{item.type || 'Add-on'}: </span>
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[#164475] font-bold whitespace-nowrap">{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4 text-sm font-bold text-gray-500">
                  <span>Estimated Power</span>
                  <span className="text-gray-800">{totalWatts}W</span>
                </div>
                <div className="flex justify-between items-end mb-6">
                  <span className="text-lg font-bold text-gray-500">Total</span>
                  <span className="text-3xl font-black text-[#164475]">{formatPrice(totalCost)}</span>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleDownloadQuotePDF}
                    disabled={componentsList.length === 0}
                    className="w-full bg-white border-2 border-[#164475] text-[#164475] disabled:border-gray-200 disabled:text-gray-400 hover:bg-[#f8fafc] disabled:hover:bg-white h-14 rounded-xl font-bold tracking-wide transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] hover:shadow-md disabled:cursor-not-allowed"
                  >
                    <Download className="w-5 h-5" />
                    Download Quote PDF
                  </button>
                  <button 
                    onClick={handleAddPcToCart}
                    disabled={componentsList.length === 0}
                    className="w-full bg-[#0a1b2d] hover:bg-[#164475] disabled:bg-gray-300 disabled:cursor-not-allowed text-white h-14 rounded-xl font-bold tracking-wide transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] shadow-lg hover:shadow-xl"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add PC to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — ADD-ON EXTRAS */}
        <div className="mt-20 reveal-up delay-200">
          <h2 className="text-3xl font-black text-[#0a1b2d] mb-8 tracking-tight">Upgrade Your Build</h2>
          <div className="flex flex-wrap gap-4">
            {ADD_ON_COMPONENTS.map((addon, idx) => {
              const isSelected = selectedAddOns.includes(addon.name);
              return (
                <button
                  key={idx}
                  onClick={() => toggleAddOn(addon.name)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-full font-bold text-sm transition-all duration-300 transform hover:scale-[1.02] border-2 shadow-sm hover:shadow-md
                    ${isSelected ? 'bg-[#164475] text-white border-[#164475]' : 'bg-white text-[#0a1b2d] border-gray-200 hover:border-[#164475]/50'}
                  `}
                >
                  {isSelected ? <Check className="w-4 h-4" /> : <span className="w-4 h-4 rounded-full border-2 border-current opacity-30" />}
                  {addon.name}
                  <span className={isSelected ? 'text-blue-200' : 'text-[#164475]'}>+{formatPrice(addon.price)}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* SECTION 4 — GAMING BUNDLE */}
        <div className="mt-24 pt-16 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div className="reveal-up">
              <h2 className="text-3xl md:text-4xl font-black text-[#0a1b2d] mb-3 tracking-tight">Complete Your Gaming Setup</h2>
              <p className="text-gray-500 font-medium">Get everything you need in one click and save.</p>
            </div>
            <div className="bg-gray-100 text-red-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 reveal-up delay-100">
              Buy Bundle Save 30%
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {bundleProducts.slice(0, 4).map((product: Product, idx: number) => (
              <div key={product.id || (product as any)._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 reveal-up flex flex-col" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="aspect-square bg-[#f8fafc] rounded-2xl mb-6 flex items-center justify-center p-4">
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <h3 className="font-bold text-[#0a1b2d] mb-2 leading-snug flex-grow">{product.name}</h3>
                <div className="text-lg font-black text-[#164475]">{formatPrice(product.price)}</div>
              </div>
            ))}
          </div>

          <button 
            onClick={handleAddBundleToCart}
            className="w-full max-w-md mx-auto block bg-[#0a1b2d] hover:bg-[#164475] text-white h-16 rounded-2xl font-black text-lg tracking-wide transition-all transform hover:scale-[1.02] shadow-xl hover:shadow-2xl reveal-up delay-200"
          >
            ADD FULL BUNDLE TO CART
          </button>
        </div>

        {/* SECTION 5 — TRUST BADGES */}
        <div className="mt-24 pt-16 border-t border-gray-200 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <Headphones className="w-8 h-8" />, title: "Customer Service", desc: "24/7 Expert Support" },
            { icon: <Truck className="w-8 h-8" />, title: "Fast Free Shipping", desc: "On orders over PKR 25,000" },
            { icon: <Users className="w-8 h-8" />, title: "Refer a Friend", desc: "Get 15% off your next rig" },
            { icon: <ShieldCheck className="w-8 h-8" />, title: "Secure Payment", desc: "100% safe checkout" }
          ].map((badge, idx) => (
            <div key={idx} className="flex flex-col items-center text-center reveal-up" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="w-16 h-16 bg-[#164475]/5 text-[#164475] rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                {badge.icon}
              </div>
              <h4 className="font-bold text-[#0a1b2d] mb-1">{badge.title}</h4>
              <p className="text-sm text-gray-500 font-medium">{badge.desc}</p>
            </div>
          ))}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUpCustom {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-left { animation: slideInLeft 600ms ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUpCustom 300ms ease-out forwards; }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
    </div>
  );
}
