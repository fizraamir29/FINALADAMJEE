'use client';
// Adamjee Computers Admin Dashboard - High Performance UI
import React, { useState, useEffect, useMemo } from 'react';
import { useSEO } from '../hooks/useSEO';
import {
  LayoutDashboard, ShoppingBag, Package, Users, MessageSquare,
  BarChart3, Settings, Plus, Pencil, Trash2, Search, Eye,
  TrendingUp, X, Upload, ChevronDown, LogOut,
  CheckCircle, Clock, Truck, AlertCircle, FileText, Printer,
  Boxes, ArrowUpDown, ArrowUp, ArrowDown, Download, ChevronLeft,
  ChevronRight, PackagePlus, PackageMinus, SlidersHorizontal,
  AlertTriangle, CheckSquare, MinusSquare, Bell, Percent, Volume2, Globe, Mail, Sparkles, Menu, Tag, Palette, Phone, MapPin, RefreshCw, Star, ShoppingCart, ChevronUp, Filter, MoreVertical, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { Product } from '../types';
import ModernSelect from '../components/ModernSelect';
import { getProductImage, getCategoryFallbackImage } from '../utils/storage';
import {
  PageHeader, Btn, Card, SearchField, FilterPill, SelectPill, StatusPill, StatusSelect,
  Table, Th, Td, Tr, Check, RowActions, EntityCell, EmptyState, Pagination, StockCell,
  FilterGroup, FilterRow, StatChip, DetailRow, Modal, Field, inputCls, textareaCls,
  Sparkline, GroupedBars, Donut, Meter, DeltaChip, StatCard, AreaChart, SectionTitle,
} from './admin/ui';
import { productStatusTone, orderStatusTone, paymentStatusTone } from './admin/theme';

/* ─── HELPERS ────────────────────────────────── */
const CreditCardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="text-[#9A9AA5]">
    <rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" />
  </svg>
);

const statusColors: Record<string, string> = {
  // Payment Statuses
  paid:       'bg-[#F1EDFE] text-[#5B32F0] border border-[#5B32F0]/30',
  unpaid:     'bg-[#fff1f0] text-[#cf1322] border border-[#ffa39e]',
  refunded:   'bg-[#f1f1f1] text-[#616161] border border-[#d9d9d9]',
  'payment pending': 'bg-[#fff0db] text-[#8a5b00] border border-[#ffddb0]',
  pending:    'bg-[#fff0db] text-[#8a5b00] border border-[#ffddb0]',
  
  // Fulfillment Statuses
  unfulfilled: 'bg-[#fff0db] text-[#8a5b00] border border-[#ffddb0]',
  fulfilled:   'bg-[#F1EDFE] text-[#5B32F0] border border-[#5B32F0]/30',
  shipped:     'bg-[#e6f7ff] text-[#0050b3] border border-[#91d5ff]',
  processing:  'bg-[#e6f7ff] text-[#0050b3] border border-[#91d5ff]',
  delivered:   'bg-[#F1EDFE] text-[#5B32F0] border border-[#5B32F0]/30',
  cancelled:   'bg-[#fff1f0] text-[#cf1322] border border-[#ffa39e]',
  
  // Account Statuses
  active:     'bg-[#F1EDFE] text-[#5B32F0] border border-[#5B32F0]/30',
  draft:      'bg-[#f1f1f1] text-[#616161] border border-[#d9d9d9]',
  inactive:   'bg-[#fff1f0] text-[#cf1322] border border-[#ffa39e]',
};

const StatusBadge = ({ s }: { s: string }) => (
  <span className={`text-[13px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${statusColors[s?.toLowerCase()] ?? 'bg-[#F4F4F6] text-[#6E6E78] border border-[#E8E8EC]'}`}>
    {s}
  </span>
);

const compressImageFile = (file: File, maxDim = 800, quality = 0.85): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const getInventoryStatus = (stock: number, threshold: number = 5): string => {
  if (stock <= 0) return 'out of stock';
  if (stock <= threshold) return 'low stock';
  return 'in stock';
};

const exportCSV = (data: any[], filename: string, columns: { key: string; label: string }[]) => {
  const header = columns.map(c => c.label).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = c.key.split('.').reduce((o, k) => o?.[k], row);
      return `"${String(val ?? '').replace(/"/g, '""')}"`;
    }).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

/* ─── PAGINATION HOOK ────────────────────────── */
function usePagination<T>(items: T[], initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const paged = items.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [items.length, pageSize]);
  return { paged, page, setPage, totalPages, pageSize, setPageSize };
}

function PaginationBar({ page, totalPages, setPage, total }: {
  page: number; totalPages: number; setPage: (p: number) => void; total: number;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-[#E8E8EC] bg-white">
      <span className="text-[14px] text-[#6E6E78] font-semibold">{total} records · Page {page} of {totalPages}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-[10px] border border-[#E8E8EC] disabled:opacity-40 hover:bg-[#F7F7F9] transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
          return (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-[10px] text-[14px] font-bold transition-colors ${p === page ? 'bg-[#5B32F0] text-white' : 'border border-[#E8E8EC] hover:bg-[#F7F7F9] text-[#6E6E78]'}`}>
              {p}
            </button>
          );
        })}
        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-[10px] border border-[#E8E8EC] disabled:opacity-40 hover:bg-[#F7F7F9] transition-colors">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── SORT HEADER ────────────────────────────── */
function SortTh({ label, field, sortField, sortDir, onSort }: {
  label: string; field: string; sortField: string; sortDir: 'asc' | 'desc'; onSort: (f: string) => void;
}) {
  const active = sortField === field;
  return (
    <th className="text-left text-[14px] font-bold text-[#6E6E78] uppercase tracking-wider px-5 py-4 cursor-pointer select-none group"
      onClick={() => onSort(field)}>
      <div className="flex items-center gap-1.5">
        {label}
        <span className={`transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
          {active ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-[#5B32F0]" /> : <ArrowDown className="w-3 h-3 text-[#5B32F0]" />) : <ArrowUpDown className="w-3 h-3" />}
        </span>
      </div>
    </th>
  );
}

/* ─── PRODUCT FORM MODAL ─────────────────────── */
interface ProductFormProps {
  product?: any;
  onClose: () => void;
  onSave: (p: any) => void;
  customCollections?: string[];
}

function ProductFormModal({ product, onClose, onSave, customCollections = [] }: ProductFormProps) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    code: product?.code ?? '',
    price: product?.price ?? 0,
    comparePrice: product?.comparePrice ?? 0,
    category: product?.category ?? 'Peripherals',
    tag: product?.tag ?? '',
    promoText: product?.promoText ?? '',
    discountPercent: product?.discountPercent ?? 0,
    stock: product?.stock ?? 0,
    lowStockThreshold: product?.lowStockThreshold ?? 5,
    description: product?.description ?? '',
    image: product?.image ?? '',
    img2: product?.images?.[1] ?? product?.additionalImages?.[0] ?? '',
    img3: product?.images?.[2] ?? product?.additionalImages?.[1] ?? '',
    img4: product?.images?.[3] ?? product?.additionalImages?.[2] ?? '',
    additionalImages: product?.additionalImages ?? [],
    costPerItem: product?.costPerItem ?? 0,
    barcode: product?.barcode ?? '',
    vendor: product?.vendor ?? '',
    productType: product?.productType ?? '',
    trackQuantity: product?.trackQuantity ?? true,
    continueSellingOutOfStock: product?.continueSellingOutOfStock ?? false,
    weight: product?.weight ?? 0,
    weightUnit: product?.weightUnit ?? 'kg',
    chargeTax: product?.chargeTax ?? true,
    status: product?.status ?? 'active',
    variants: product?.variants ?? [],
    specBulletsInput: Array.isArray(product?.specBullets) ? product.specBullets.join('\n') : '',
    feature1Title: product?.feature1Title ?? '',
    feature1Sub: product?.feature1Sub ?? '',
    feature1Desc: product?.feature1Desc ?? '',
    feature1Desc2: product?.feature1Desc2 ?? '',
    feature1Img: product?.feature1Img ?? '',
    feature2Title: product?.feature2Title ?? '',
    feature2Sub: product?.feature2Sub ?? '',
    feature2Desc: product?.feature2Desc ?? '',
    feature2Desc2: product?.feature2Desc2 ?? '',
    feature2Img: product?.feature2Img ?? '',
    feature3Title: product?.feature3Title ?? '',
    feature3Sub: product?.feature3Sub ?? '',
    feature3Desc: product?.feature3Desc ?? '',
    feature3Desc2: product?.feature3Desc2 ?? '',
    feature3Img: product?.feature3Img ?? '',
    colorsInput: Array.isArray(product?.colors) ? product.colors.join(', ') : '',
    colorLabel: product?.colorLabel ?? 'Color',
    accordionItems: Array.isArray(product?.accordionItems) && product.accordionItems.length > 0
      ? product.accordionItems
      : [
          { title: 'Technical Specifications & Features', content: 'Engineered with top-tier components for max stability, zero latency, and extreme durability.' },
          { title: 'Connectivity & Inputs', content: 'High-speed interface with plug-and-play setup for Windows, macOS, and Linux.' },
          { title: 'Package Included & Accessories', content: '1x Main Unit, 1x Power/Data Cable, 1x Quick Start Guide, 1x Warranty Card.' },
          { title: 'Warranty & After-Sales Support', content: 'Backed by Adamjee Computers 1-Year Official Local Warranty & 7-Day Return Policy.' },
        ],
  });
  const [variantInput, setVariantInput] = useState('');
  const [showLivePreview, setShowLivePreview] = useState(false);

  const categories = Array.from(new Set(['Desktops','Laptops','Components','Peripherals','Accessories','Monitors','Networking','Headphones','Earphones','Speakers', ...customCollections]));

  const addVariant = () => {
    if (variantInput.trim()) {
      setForm(f => ({ ...f, variants: [...f.variants, variantInput.trim()] }));
      setVariantInput('');
    }
  };

  const addAccordionItem = () => {
    setForm(f => ({
      ...f,
      accordionItems: [...f.accordionItems, { title: 'New Accordion Section', content: 'Details and specs...' }]
    }));
  };

  const removeAccordionItem = (idx: number) => {
    setForm(f => ({
      ...f,
      accordionItems: f.accordionItems.filter((_: any, i: number) => i !== idx)
    }));
  };

  const updateAccordionItem = (idx: number, key: 'title' | 'content', value: string) => {
    setForm(f => ({
      ...f,
      accordionItems: f.accordionItems.map((item: any, i: number) => i === idx ? { ...item, [key]: value } : item)
    }));
  };

  // Helper AI Generators
  const generateAIDescription = () => {
    if (!form.name.trim()) return;
    const aiDesc = `The ${form.name} is engineered for peak performance, ultra-fast responsiveness, and maximum durability. Custom built by Adamjee Computers with top-grade components, this ${form.category.toLowerCase()} unit delivers exceptional reliability, low-latency execution, and sleek modern aesthetics for gaming and heavy workloads.`;
    setForm(prev => ({ ...prev, description: aiDesc }));
  };

  const generateAISpecBullets = () => {
    if (!form.name.trim()) return;
    const name = form.name;
    const nameLower = name.toLowerCase();
    const cat = form.category.toLowerCase();
    let specs = '';
    
    if (cat.includes('laptop') || nameLower.includes('laptop')) {
      specs = `Processor: Intel Core i7 / AMD Ryzen Multi-Core\nMemory: 16GB DDR5 High Speed Dual-Channel RAM\nStorage: 512GB Ultra-Fast NVMe PCIe 4.0 SSD\nDisplay: 15.6" Full HD IPS High Refresh Rate Display\nGraphics: Dedicated NVIDIA RTX Gaming & Creator GPU\nWarranty: 1 Year Official Adamjee Computers Warranty`;
    } else if (cat.includes('keyboard') || nameLower.includes('keyboard')) {
      specs = `Switches: Pro-Grade Mechanical Switches\nLatency: Ultra-Low 1ms Response Time\nLighting: Dynamic Per-Key RGB Customization\nKeycaps: Double-Shot PBT Durable Keycaps\nConnectivity: Detachable Braided USB-C Cable\nWarranty: 1 Year Official Adamjee Computers Warranty`;
    } else if (cat.includes('headphone') || cat.includes('earphone') || nameLower.includes('headphone') || nameLower.includes('audio')) {
      specs = `Audio: High-Fidelity 50mm Neodymium Drivers\nMicrophone: Detachable Noise-Cancelling Clear Mic\nErgonomics: Ultra-Soft Memory Foam Ear Cushions\nConnectivity: Low Latency Wireless & 3.5mm Audio Cable\nBattery: Up to 30 Hours Continuous Playback\nWarranty: 1 Year Official Adamjee Computers Warranty`;
    } else if (cat.includes('mouse') || nameLower.includes('mouse')) {
      specs = `Sensor: Ultra-Accurate 26,000 DPI Optical Sensor\nTracking: 650 IPS Speed & 50G Acceleration\nWeight: Ultra-Lightweight Ergonomic Shell\nSwitches: Optical Switches (80 Million Clicks)\nWarranty: 1 Year Official Adamjee Computers Warranty`;
    } else if (cat.includes('component') || cat.includes('gpu') || nameLower.includes('rtx') || nameLower.includes('card')) {
      specs = `Architecture: High Performance Dedicated GPU\nVRAM: High Speed GDDR6 Memory\nCooling: Triple Fan Thermal Solution\nDisplay Outputs: HDMI 2.1a & DisplayPort 1.4a\nPower: Efficient Power Delivery Architecture\nWarranty: 1 Year Official Local Warranty`;
    } else {
      specs = `Model Code: ${form.code || 'SKU-ADAMJEE'}\nCategory: ${form.category || 'Gaming Hardware'}\nBuild Quality: Premium Grade Engineered Materials\nCompatibility: Universal Plug-and-Play (Windows/macOS)\nFeature: Low Latency High Response Rate\nWarranty: 1 Year Official Adamjee Computers Warranty`;
    }
    setForm(prev => ({ ...prev, specBulletsInput: specs }));
  };

  const generateAIFeatures = () => {
    if (!form.name.trim()) return;
    const name = form.name;
    setForm(prev => ({
      ...prev,
      feature1Title: `High Performance Engineering: ${name}`,
      feature1Sub: `Built for Serious Gamers & Professionals`,
      feature1Desc: `Designed specifically for demanding workloads and gaming setups, offering unmatched thermal efficiency, robust structural integrity, and long-term stability under heavy load.`,
      feature1Desc2: `Backed by Adamjee Computers — Pakistan's trusted source for genuine hardware.`,
      feature2Title: `Next-Gen Performance & Seamless Connectivity`,
      feature2Sub: `Plug-and-Play & Ultra-Low Latency`,
      feature2Desc: `Experience zero lag and instant response times with optimized hardware integration, plug-and-play setup, and full software customization across platforms.`,
      feature2Desc2: `Compatible with Windows 10/11, macOS, and Linux.`,
      feature2Img: prev.image || prev.img2 || '',
      feature3Title: `Vibrant Aesthetics & Precision Quality`,
      feature3Sub: `Custom RGB & Premium Finish`,
      feature3Desc: `Designed for comfortable extended sessions with customizable lighting, ergonomic feel, and premium matte surface finish.`,
      feature3Desc2: `Includes 1-Year Official Local Warranty.`,
      feature3Img: prev.img2 || prev.image || '',
    }));
  };

  const handleSaveSubmit = (targetStatus: 'active' | 'draft') => {
    if (!form.name.trim()) {
      alert('Please enter a product title');
      return;
    }
    const specBullets = form.specBulletsInput.split('\n').map((s: string) => s.trim()).filter(Boolean);
    const galleryImages = [form.image, form.img2, form.img3, form.img4].filter(Boolean);
    const colors = form.colorsInput ? form.colorsInput.split(',').map((c: string) => c.trim()).filter(Boolean) : [];
    const { specBulletsInput, colorsInput, img2, img3, img4, ...savePayload } = form;
    onSave({
      ...savePayload,
      status: targetStatus,
      specBullets,
      colors,
      images: galleryImages.length > 0 ? galleryImages : [form.image],
      image: form.image || galleryImages[0] || '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9998]">
      <div className="absolute inset-0 bg-[#0B0B12]/35 backdrop-blur-[2px] animate-[adminFade_200ms_ease-out]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        style={{ top: 12, right: 12, bottom: 12, width: 'min(calc(100% - 24px), 1100px)' }}
        className="admin-drawer absolute bg-[#F7F7F9] rounded-[24px] flex flex-col overflow-hidden shadow-[0_32px_80px_-12px_rgba(11,11,18,0.4)]">

        <div className="h-1 flex-shrink-0" style={{ background: 'linear-gradient(90deg, #5B32F0, #5B32F000)' }} />

        {/* Header */}
        <div className="flex items-start gap-4 px-7 pt-6 pb-5 bg-white flex-shrink-0">
          <div className="w-11 h-11 rounded-[14px] bg-[#F1EDFE] text-[#5B32F0] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Package className="w-[21px] h-[21px]" strokeWidth={1.9} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[23px] font-bold text-[#16161A] tracking-[-0.025em] leading-tight truncate">
              {product?._id ? product.name : 'New product'}
            </h2>
            <p className="text-[14.5px] text-[#8A8A96] mt-1">
              {product?._id ? 'Edit the details below' : 'Fill in the details, then publish'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowLivePreview(true)}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] text-[15px] font-semibold bg-white text-[#16161A] border border-[#E8E8EC] hover:bg-[#F7F7F9] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(16,16,26,0.08)] active:scale-[0.97] transition-all duration-200 cursor-pointer"
            >
              <Eye className="w-[17px] h-[17px]" /> Preview
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#8A8A96] hover:bg-[#F2F2F5] hover:text-[#16161A] hover:rotate-90 active:scale-90 transition-all duration-300 cursor-pointer"
            >
              <X className="w-[18px] h-[18px]" strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-7 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-[#F2F2F5]">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title and Description */}
            <div className="bg-white p-6 rounded-[20px] border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] space-y-5">
              <div>
                <label className="block text-[14px] font-semibold text-[#16161A] mb-2">Product Title *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full h-11 px-4 border border-[#E8E8EC] bg-white rounded-[12px] text-[15px] text-[#16161A] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150"
                  placeholder="e.g. ASUS ROG Strix Gaming Laptop RTX 4080"
                />
                <p className="text-[13.5px] text-[#9A9AA5] mt-2">Make title clear and descriptive for customer searches.</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[14px] font-bold text-[#16161A]">Detailed Description</label>
                  <button
                    type="button"
                    onClick={generateAIDescription}
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13.5px] font-semibold text-[#5B32F0] bg-[#F1EDFE] hover:bg-[#E6DEFC] rounded-[10px] border border-transparent active:scale-[0.97] transition-all duration-200 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Generate with AI
                  </button>
                </div>
                <textarea
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  rows={5}
                  className="w-full min-h-[120px] px-4 py-3 border border-[#E8E8EC] bg-white rounded-[12px] text-[15px] text-[#16161A] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 resize-y"
                  placeholder="Explain your product benefits or click Auto-Generate AI Description..."
                />
              </div>
            </div>

            {/* Media Upload (Up to 4 Images) */}
            <div className="bg-white p-6 rounded-[20px] border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] space-y-5">
              <div className="flex justify-between items-center border-b border-[#F0F0F3] pb-4 mb-1">
                <div>
                  <h3 className="text-[16px] font-semibold text-[#16161A] tracking-[-0.01em]">Product Media (Gallery - Up to 4 Images)</h3>
                  <p className="text-[13.5px] text-[#9A9AA5]">Upload or paste image URLs for main image and additional gallery angles.</p>
                </div>
                <label className="inline-flex items-center gap-2 h-10 px-4 bg-[#5B32F0] text-white text-[14px] font-semibold rounded-[12px] hover:bg-[#4A25CE] hover:-translate-y-px active:scale-[0.97] cursor-pointer transition-all duration-200">
                  <Upload className="w-3.5 h-3.5" /> Upload
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(async (file, idx) => {
                        try {
                          const compressed = await compressImageFile(file);
                          setForm(prev => {
                            if (!prev.image) return { ...prev, image: compressed };
                            if (!prev.img2) return { ...prev, img2: compressed };
                            if (!prev.img3) return { ...prev, img3: compressed };
                            if (!prev.img4) return { ...prev, img4: compressed };
                            return { ...prev, additionalImages: [...prev.additionalImages, compressed] };
                          });
                        } catch (err) {
                          console.error('File upload failed:', err);
                        }
                      });
                    }}
                  />
                </label>
              </div>

              {/* 4 Image Slots Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Main Image */}
                <div className="p-3 border border-[#E8E8EC] rounded-xl bg-[#FAFAFB] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-extrabold text-[#5B32F0]">1. Main Image (Primary Cover) *</span>
                    {form.image && <button type="button" onClick={() => setForm({...form, image: ''})} className="text-red-500 text-[13px] font-bold hover:underline">Clear</button>}
                  </div>
                  <input
                    type="text"
                    value={form.image}
                    onChange={e => setForm({ ...form, image: e.target.value })}
                    placeholder="/images/product.png or image URL"
                    className="w-full px-2.5 py-1.5 border border-[#E8E8EC] rounded-[10px] text-[14px] bg-white focus:outline-none focus:border-[#5B32F0]"
                  />
                  {form.image && (
                    <div className="w-full h-24 bg-white rounded-[10px] border flex items-center justify-center overflow-hidden">
                      <img src={form.image} alt="Main Preview" className="h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(form.category, form.name); }} />
                    </div>
                  )}
                </div>

                {/* Gallery Image 2 */}
                <div className="p-3 border border-[#E8E8EC] rounded-xl bg-[#FAFAFB] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-extrabold text-[#4A4A55]">2. Gallery Image 2</span>
                    {form.img2 && <button type="button" onClick={() => setForm({...form, img2: ''})} className="text-red-500 text-[13px] font-bold hover:underline">Clear</button>}
                  </div>
                  <input
                    type="text"
                    value={form.img2}
                    onChange={e => setForm({ ...form, img2: e.target.value })}
                    placeholder="Image 2 URL (optional)"
                    className="w-full px-2.5 py-1.5 border border-[#E8E8EC] rounded-[10px] text-[14px] bg-white focus:outline-none focus:border-[#5B32F0]"
                  />
                  {form.img2 && (
                    <div className="w-full h-24 bg-white rounded-[10px] border flex items-center justify-center overflow-hidden">
                      <img src={form.img2} alt="Preview 2" className="h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(form.category, form.name); }} />
                    </div>
                  )}
                </div>

                {/* Gallery Image 3 */}
                <div className="p-3 border border-[#E8E8EC] rounded-xl bg-[#FAFAFB] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-extrabold text-[#4A4A55]">3. Gallery Image 3</span>
                    {form.img3 && <button type="button" onClick={() => setForm({...form, img3: ''})} className="text-red-500 text-[13px] font-bold hover:underline">Clear</button>}
                  </div>
                  <input
                    type="text"
                    value={form.img3}
                    onChange={e => setForm({ ...form, img3: e.target.value })}
                    placeholder="Image 3 URL (optional)"
                    className="w-full px-2.5 py-1.5 border border-[#E8E8EC] rounded-[10px] text-[14px] bg-white focus:outline-none focus:border-[#5B32F0]"
                  />
                  {form.img3 && (
                    <div className="w-full h-24 bg-white rounded-[10px] border flex items-center justify-center overflow-hidden">
                      <img src={form.img3} alt="Preview 3" className="h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(form.category, form.name); }} />
                    </div>
                  )}
                </div>

                {/* Gallery Image 4 */}
                <div className="p-3 border border-[#E8E8EC] rounded-xl bg-[#FAFAFB] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-extrabold text-[#4A4A55]">4. Gallery Image 4</span>
                    {form.img4 && <button type="button" onClick={() => setForm({...form, img4: ''})} className="text-red-500 text-[13px] font-bold hover:underline">Clear</button>}
                  </div>
                  <input
                    type="text"
                    value={form.img4}
                    onChange={e => setForm({ ...form, img4: e.target.value })}
                    placeholder="Image 4 URL (optional)"
                    className="w-full px-2.5 py-1.5 border border-[#E8E8EC] rounded-[10px] text-[14px] bg-white focus:outline-none focus:border-[#5B32F0]"
                  />
                  {form.img4 && (
                    <div className="w-full h-24 bg-white rounded-[10px] border flex items-center justify-center overflow-hidden">
                      <img src={form.img4} alt="Preview 4" className="h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(form.category, form.name); }} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing (PKR Currency) */}
            <div className="bg-white p-6 rounded-[20px] border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] space-y-5">
              <h3 className="text-[16px] font-semibold text-[#16161A] tracking-[-0.01em]">Pricing (PKR - Rupees)</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Price (PKR) *', key: 'price' },
                  { label: 'Compare-at price (PKR)', key: 'comparePrice' },
                  { label: 'Cost per item (PKR)', key: 'costPerItem' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-[14px] font-semibold text-[#16161A] mb-2">{label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B32F0] text-[14px] font-bold">Rs.</span>
                      <input
                        type="number"
                        value={(form as any)[key]}
                        onChange={e => setForm({...form, [key]: +e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-[#E8E8EC] bg-white rounded-[10px] text-[15px] font-semibold focus:outline-none focus:border-[#5B32F0]"
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block text-[14px] font-bold text-[#5B32F0] mb-1.5">Discount Off (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="e.g. 25"
                      value={form.discountPercent || ''}
                      onChange={e => setForm({...form, discountPercent: +e.target.value})}
                      className="w-full px-3 py-2 border border-[#5B32F0]/40 bg-[#F1EDFE] rounded-[10px] text-[15px] font-bold text-[#5B32F0] focus:outline-none focus:border-[#5B32F0]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B32F0] text-[14px] font-black">% OFF</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chargeTax"
                  checked={form.chargeTax}
                  onChange={e => setForm({...form, chargeTax: e.target.checked})}
                  className="w-4 h-4 text-[#5B32F0] border-[#E8E8EC] rounded-[10px] focus:ring-[#5B32F0]"
                />
                <label htmlFor="chargeTax" className="text-[14px] font-semibold text-[#6E6E78] cursor-pointer">Charge tax on this product</label>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white p-6 rounded-[20px] border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] space-y-5">
              <h3 className="text-[16px] font-semibold text-[#16161A] tracking-[-0.01em]">Inventory & Stock Control</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-[#16161A] mb-2">SKU / Code *</label>
                  <input
                    value={form.code}
                    onChange={e => setForm({...form, code: e.target.value})}
                    className="w-full px-3 py-2 border border-[#E8E8EC] bg-white rounded-[10px] text-[15px] font-mono focus:outline-none focus:border-[#5B32F0]"
                    placeholder="SKU-001"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[#16161A] mb-2">Barcode</label>
                  <input
                    value={form.barcode}
                    onChange={e => setForm({...form, barcode: e.target.value})}
                    className="w-full px-3 py-2 border border-[#E8E8EC] bg-white rounded-[10px] text-[15px] font-mono focus:outline-none focus:border-[#5B32F0]"
                    placeholder="123456789"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[#16161A] mb-2">Available Quantity</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={e => setForm({...form, stock: +e.target.value})}
                    className="w-full px-3 py-2 border border-[#E8E8EC] bg-white rounded-[10px] text-[15px] font-bold focus:outline-none focus:border-[#5B32F0]"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[#16161A] mb-2">Low Stock Alert</label>
                  <input
                    type="number"
                    value={form.lowStockThreshold}
                    onChange={e => setForm({...form, lowStockThreshold: +e.target.value})}
                    className="w-full px-3 py-2 border border-[#E8E8EC] bg-white rounded-[10px] text-[15px] focus:outline-none focus:border-[#5B32F0]"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="trackQuantity"
                    checked={form.trackQuantity}
                    onChange={e => setForm({...form, trackQuantity: e.target.checked})}
                    className="w-4 h-4 text-[#5B32F0] border-[#E8E8EC] rounded-[10px] focus:ring-[#5B32F0]"
                  />
                  <label htmlFor="trackQuantity" className="text-[14px] font-semibold text-[#6E6E78] cursor-pointer">Track stock quantity automatically</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="continueSelling"
                    checked={form.continueSellingOutOfStock}
                    onChange={e => setForm({...form, continueSellingOutOfStock: e.target.checked})}
                    className="w-4 h-4 text-[#5B32F0] border-[#E8E8EC] rounded-[10px] focus:ring-[#5B32F0]"
                  />
                  <label htmlFor="continueSelling" className="text-[14px] font-semibold text-[#6E6E78] cursor-pointer">Continue selling when out of stock</label>
                </div>
              </div>
            </div>

            {/* Bullet Points / Specifications */}
            <div className="bg-white p-6 rounded-[20px] border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-[16px] font-semibold text-[#16161A] tracking-[-0.01em]">Product Specifications Bullet Points</h3>
                  <p className="text-[13px] text-[#6E6E78]">One specification per line (displayed on Product Detail page):</p>
                </div>
                <button
                  type="button"
                  onClick={generateAISpecBullets}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13.5px] font-semibold text-[#5B32F0] bg-[#F1EDFE] hover:bg-[#E6DEFC] rounded-[10px] border border-transparent active:scale-[0.97] transition-all duration-200 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Generate specs
                </button>
              </div>
              <textarea
                value={form.specBulletsInput}
                onChange={e => setForm({ ...form, specBulletsInput: e.target.value })}
                rows={5}
                placeholder="Processor: Intel Core i9 14900K&#10;Memory: 32GB DDR5 6000MHz&#10;Graphics: NVIDIA RTX 4090 24GB&#10;Storage: 2TB Gen4 NVMe SSD"
                className="w-full px-3 py-2 border border-[#E8E8EC] bg-white rounded-[10px] text-[14px] focus:outline-none focus:border-[#5B32F0]"
              />
            </div>

            {/* Custom Detail Feature Sections */}
            <div className="bg-white p-6 rounded-[20px] border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] space-y-5">
              <div className="flex justify-between items-center border-b border-[#F0F0F3] pb-4 mb-1">
                <div>
                  <h3 className="text-[16px] font-semibold text-[#16161A] tracking-[-0.01em]">Product Detail Feature Highlights (Below Main View)</h3>
                  <p className="text-[13.5px] text-[#9A9AA5]">Rich feature sections with images for product landing pages.</p>
                </div>
                <button
                  type="button"
                  onClick={generateAIFeatures}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13.5px] font-semibold text-[#5B32F0] bg-[#F1EDFE] hover:bg-[#E6DEFC] rounded-[10px] border border-transparent active:scale-[0.97] transition-all duration-200 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Generate features
                </button>
              </div>

              {/* Color Options & Swatches */}
              <div className="space-y-3 p-3 bg-[#FAFAFB] rounded-2xl border border-[#E8E8EC]">
                <h4 className="text-[14px] font-bold text-[#5B32F0]">Color Options & Finish Labels</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] font-semibold text-[#16161A] mb-2">Color Label Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Color, Switch Type, Finish"
                      value={form.colorLabel}
                      onChange={e => setForm({...form, colorLabel: e.target.value})}
                      className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-[#16161A] mb-2">Available Colors (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Midnight Black, Pearl White, Ocean Blue"
                      value={form.colorsInput}
                      onChange={e => setForm({...form, colorsInput: e.target.value})}
                      className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Feature Section 1 */}
              <div className="space-y-3 p-3 bg-[#FAFAFB] rounded-2xl border border-[#E8E8EC]">
                <h4 className="text-[14px] font-bold text-[#5B32F0]">Feature Banner 1 (Top Hero Banner)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Title (e.g. Ergonomic & Durable Construction)"
                    value={form.feature1Title}
                    onChange={e => setForm({...form, feature1Title: e.target.value})}
                    className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Subtitle (e.g. Built for Gaming)"
                    value={form.feature1Sub}
                    onChange={e => setForm({...form, feature1Sub: e.target.value})}
                    className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Primary Description text..."
                  value={form.feature1Desc}
                  onChange={e => setForm({...form, feature1Desc: e.target.value})}
                  className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white resize-none"
                />
                <input
                  type="text"
                  placeholder="Banner Image URL (e.g. /images/banner1.png)"
                  value={form.feature1Img}
                  onChange={e => setForm({...form, feature1Img: e.target.value})}
                  className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white"
                />
              </div>

              {/* Feature Section 2 */}
              <div className="space-y-3 p-3 bg-[#FAFAFB] rounded-2xl border border-[#E8E8EC]">
                <h4 className="text-[14px] font-bold text-[#5B32F0]">Feature Banner 2 (Middle Section)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Title (e.g. Ultra-Fast Response & Low Latency)"
                    value={form.feature2Title}
                    onChange={e => setForm({...form, feature2Title: e.target.value})}
                    className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Subtitle (e.g. 1ms Response Time)"
                    value={form.feature2Sub}
                    onChange={e => setForm({...form, feature2Sub: e.target.value})}
                    className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Primary Description text..."
                  value={form.feature2Desc}
                  onChange={e => setForm({...form, feature2Desc: e.target.value})}
                  className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white resize-none"
                />
                <input
                  type="text"
                  placeholder="Feature 2 Image URL"
                  value={form.feature2Img}
                  onChange={e => setForm({...form, feature2Img: e.target.value})}
                  className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white"
                />
              </div>

              {/* Feature Section 3 */}
              <div className="space-y-3 p-3 bg-[#FAFAFB] rounded-2xl border border-[#E8E8EC]">
                <h4 className="text-[14px] font-bold text-[#5B32F0]">Feature Banner 3 (Bottom Highlight)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Title (e.g. Premium Acoustic Audio Quality)"
                    value={form.feature3Title}
                    onChange={e => setForm({...form, feature3Title: e.target.value})}
                    className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Subtitle (e.g. Hi-Res Audio Certified)"
                    value={form.feature3Sub}
                    onChange={e => setForm({...form, feature3Sub: e.target.value})}
                    className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Primary Description text..."
                  value={form.feature3Desc}
                  onChange={e => setForm({...form, feature3Desc: e.target.value})}
                  className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white resize-none"
                />
                <input
                  type="text"
                  placeholder="Feature 3 Image URL"
                  value={form.feature3Img}
                  onChange={e => setForm({...form, feature3Img: e.target.value})}
                  className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white"
                />
              </div>

              {/* Accordion / Everything You Need To Know Items Editor */}
              <div className="space-y-3 p-3 bg-[#FAFAFB] rounded-2xl border border-[#E8E8EC]">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-[14px] font-bold text-[#5B32F0]">"Everything You Need To Know" Accordion Sections</h4>
                    <p className="text-[13.5px] text-[#9A9AA5]">Custom drop-down accordions shown on product detail page.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addAccordionItem}
                    className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[12px] text-[14px] font-semibold bg-[#5B32F0] text-white hover:bg-[#4A25CE] hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(91,50,240,0.32)] active:scale-[0.97] transition-all duration-200 cursor-pointer"
                  >
                    Add item
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  {form.accordionItems.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white border border-[#E8E8EC] rounded-xl space-y-2 relative">
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] font-bold text-[#5B32F0]">Accordion Item #{idx + 1}</span>
                        {form.accordionItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAccordionItem(idx)}
                            className="text-red-500 hover:text-red-700 text-[13px] font-bold"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Accordion Title (e.g. Key Features, Connectivity, Package Included)"
                        value={item.title}
                        onChange={e => updateAccordionItem(idx, 'title', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#E8E8EC] rounded-[10px] text-[14px] font-semibold"
                      />
                      <textarea
                        rows={2}
                        placeholder="Accordion Content Details..."
                        value={item.content}
                        onChange={e => updateAccordionItem(idx, 'content', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#E8E8EC] rounded-[10px] text-[14px] resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Status, Organization & Shipping */}
          <div className="space-y-6">
            
            {/* Status */}
            <div className="bg-white p-6 rounded-[20px] border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] space-y-3">
              <h3 className="text-[16px] font-semibold text-[#16161A] tracking-[-0.01em]">Product Status</h3>
              <ModernSelect
                options={[
                  { value: 'active', label: 'Active (Visible in Store)' },
                  { value: 'draft', label: 'Draft (Hidden in Admin)' }
                ]}
                value={form.status}
                onChange={val => setForm({...form, status: val})}
              />
              <p className="text-[13px] text-[#6E6E78]">Active products appear instantly in customer searches and collection pages.</p>
            </div>

            {/* Product Organization */}
            <div className="bg-white p-6 rounded-[20px] border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] space-y-5">
              <h3 className="text-[16px] font-semibold text-[#16161A] tracking-[-0.01em]">Product Organization</h3>
              <div className="space-y-3 text-[14px]">
                <div>
                  <label className="block font-bold text-[#16161A] mb-1">Category / Collection *</label>
                  <ModernSelect
                    options={categories}
                    value={form.category}
                    onChange={val => setForm({...form, category: val})}
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#16161A] mb-1">Vendor / Brand</label>
                  <input
                    value={form.vendor}
                    onChange={e => setForm({...form, vendor: e.target.value})}
                    className="w-full px-3 py-2 border border-[#E8E8EC] bg-white rounded-[10px] text-[14px] focus:outline-none focus:border-[#5B32F0]"
                    placeholder="e.g. ASUS, MSI, Logitech, Razer"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#16161A] mb-1">Product Type</label>
                  <input
                    value={form.productType}
                    onChange={e => setForm({...form, productType: e.target.value})}
                    className="w-full px-3 py-2 border border-[#E8E8EC] bg-white rounded-[10px] text-[14px] focus:outline-none focus:border-[#5B32F0]"
                    placeholder="e.g. Mechanical Keyboard, Gaming Laptop"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#16161A] mb-1">Badge Tag</label>
                  <ModernSelect
                    options={[
                      { value: '', label: 'None (Standard)' },
                      { value: 'New', label: 'New' },
                      { value: 'Hot', label: 'Hot' },
                      { value: 'Sale', label: 'Sale' },
                      { value: 'Bundle', label: 'Bundle (Add to Bundle Section)' },
                      { value: 'Best Seller', label: 'Best Seller / Bundle' }
                    ]}
                    value={form.tag}
                    onChange={val => setForm({...form, tag: val})}
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#16161A] mb-1">Promo Offer Badge / Text</label>
                  <input
                    value={form.promoText}
                    onChange={e => setForm({...form, promoText: e.target.value})}
                    className="w-full px-3 py-2 border border-[#E8E8EC] bg-white rounded-[10px] text-[14px] focus:outline-none focus:border-[#5B32F0]"
                    placeholder="e.g. 🔥 25% Off with Code 'HERO25'!"
                  />
                  <div className="flex gap-1 flex-wrap mt-1">
                    {["🔥 25% Off with Code 'HERO25'!", "🔥 Special Limited Time Offer!", "⚡ Hot Deal - Buy Now!"].map(p => (
                      <button type="button" key={p} onClick={() => setForm({...form, promoText: p})} className="text-[13px] font-bold bg-[#F1EDFE] text-[#5B32F0] px-1.5 py-0.5 rounded-[10px] border border-[#E4DCFB] hover:bg-blue-100">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Details */}
            <div className="bg-white p-6 rounded-[20px] border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] space-y-3">
              <h3 className="text-[16px] font-semibold text-[#16161A] tracking-[-0.01em]">Shipping Weight</h3>
              <div className="grid grid-cols-2 gap-2 text-[14px]">
                <div>
                  <label className="block font-bold text-[#16161A] mb-1">Weight</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.weight}
                    onChange={e => setForm({...form, weight: +e.target.value})}
                    className="w-full px-3 py-2 border border-[#E8E8EC] bg-white rounded-[10px] focus:outline-none focus:border-[#5B32F0]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#16161A] mb-1">Unit</label>
                  <ModernSelect
                    options={['kg','g','lb','oz']}
                    value={form.weightUnit}
                    onChange={val => setForm({...form, weightUnit: val})}
                  />
                </div>
              </div>
            </div>

            {/* Variants / Options */}
            <div className="bg-white p-6 rounded-[20px] border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] space-y-5">
              <h3 className="text-[16px] font-semibold text-[#16161A] tracking-[-0.01em]">Variants / Custom Options</h3>
              <div className="flex gap-2">
                <input
                  value={variantInput}
                  onChange={e => setVariantInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVariant(); }}}
                  className="flex-1 px-3 py-1.5 border border-[#E8E8EC] bg-white rounded-[10px] text-[14px] focus:outline-none focus:border-[#5B32F0]"
                  placeholder="e.g. 16GB RAM / 512GB SSD"
                />
                <button type="button" onClick={addVariant} className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[12px] text-[14px] font-semibold bg-[#5B32F0] text-white hover:bg-[#4A25CE] hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(91,50,240,0.32)] active:scale-[0.97] transition-all duration-200 cursor-pointer">Add</button>
              </div>
              {form.variants.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.variants.map((v: string, i: number) => (
                    <span key={i} className="flex items-center gap-1.5 bg-[#F7F7F9] border border-[#E8E8EC] text-[#16161A] text-[13px] font-semibold px-2.5 py-1 rounded-[10px]">
                      {v}
                      <button type="button" onClick={() => setForm(f => ({ ...f, variants: f.variants.filter((_: any, idx: number) => idx !== i) }))} className="text-[#9A9AA5] hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap gap-2.5 px-6 py-4 border-t border-[#E8E8EC] bg-white flex-shrink-0 justify-between items-center shadow-md">
          <button
            type="button"
            onClick={() => setShowLivePreview(true)}
            className="px-4 py-2 bg-[#F1EDFE] text-[#5B32F0] border border-[#5B32F0]/30 rounded-xl text-[14px] font-bold hover:bg-[#e0efff] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4" /> Live Preview
          </button>
          
          <div className="flex gap-2.5 items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#E8E8EC] rounded-xl text-[14px] font-bold text-[#6E6E78] hover:bg-[#F4F4F6] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSaveSubmit('draft')}
              className="px-4 py-2 bg-[#F4F4F6] hover:bg-gray-200 text-[#16161A] border border-[#E8E8EC] rounded-xl text-[14px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSaveSubmit('active')}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[12px] text-[14px] font-semibold bg-[#5B32F0] text-white hover:bg-[#4A25CE] hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(91,50,240,0.32)] active:scale-[0.97] transition-all duration-200 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Save product</span>
            </button>
          </div>
        </div>

      </div>

      {/* ─── LIVE PREVIEW OVERLAY MODAL ─── */}
      {showLivePreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative bg-[#103256] text-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-full flex flex-col overflow-hidden border border-white/10">
            {/* Live Preview Modal Header */}
            <div className="bg-[#0b2440] text-white px-6 py-3.5 flex justify-between items-center flex-shrink-0 border-b border-white/10">
              <div className="flex items-center gap-4">
                <span className="bg-amber-400 text-slate-900 text-[13px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-[0_1px_2px_rgba(16,16,26,0.04)]">Storefront Live Preview</span>
                <span className="text-[14px] font-light text-white/80">Master Template View (`/product/${form.code || 'na2'}`)</span>
              </div>
              <button
                onClick={() => setShowLivePreview(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Master Template Preview View */}
            <div className="p-6 md:p-10 overflow-y-auto space-y-12 bg-[#103256] text-left text-white">
              
              {/* Product Hero Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                
                {/* Images Gallery */}
                <div className="space-y-5">
                  <div className="h-80 bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-center overflow-hidden">
                    {form.image ? (
                      <img src={form.image} alt={form.name} className="max-h-full max-w-full object-contain filter drop-shadow-2xl" />
                    ) : (
                      <div className="text-center text-white/40 space-y-2">
                        <Package className="w-12 h-12 mx-auto stroke-1 text-[#7cb3d8]" />
                        <p className="text-[14px] font-light">Upload Main Product Cover Image</p>
                      </div>
                    )}
                  </div>
                  {/* Thumbnails */}
                  <div className="grid grid-cols-4 gap-4">
                    {[form.image, form.img2, form.img3, form.img4].map((img, idx) => (
                      <div key={idx} className="h-16 bg-white/5 border border-white/10 rounded-xl p-1.5 flex items-center justify-center overflow-hidden">
                        {img ? <img src={img} alt="thumb" className="max-h-full max-w-full object-contain" /> : <span className="text-[13px] text-white/30">Slot {idx+1}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Product Details */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-[#7cb3d8] uppercase tracking-wider">{form.category || 'Peripherals'}</span>
                      {form.vendor && <span className="text-[14px] text-white/60">• {form.vendor}</span>}
                      {form.tag && (
                        <span className="bg-red-500 text-white text-[13px] font-black px-2.5 py-0.5 rounded-full uppercase">
                          {form.tag}
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-light text-white leading-snug">{form.name || 'Untitled Product Title'}</h1>
                    <p className="text-[14px] font-light text-white/50">SKU: {form.code || 'SKU-001'} | Barcode: {form.barcode || 'N/A'}</p>
                  </div>

                  {/* Pricing & Offer */}
                  <div className="flex items-baseline gap-4 border-b border-white/10 pb-4">
                    <span className="text-3xl font-light text-white">PKR {(form.price || 0).toLocaleString()}</span>
                    {form.comparePrice > form.price && (
                      <span className="text-lg font-light text-white/50 line-through">PKR {form.comparePrice.toLocaleString()}</span>
                    )}
                    <div className="ml-auto text-[14px] font-bold text-[#7cb3d8] flex items-center gap-1">
                      {form.promoText || '🔥 25% OFF FOR LIMITED TIME'}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[14px] text-white/80 leading-relaxed font-light">
                    {form.description || `The ${form.name || 'product'} is engineered for peak performance and extreme durability. Custom built by Adamjee Computers.`}
                  </p>

                  {/* Bullet Specifications */}
                  {form.specBulletsInput && (
                    <div className="space-y-2.5 pt-2">
                      {form.specBulletsInput.split('\n').filter(Boolean).map((bullet: string, i: number) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-[#7cb3d8] text-[#103256]">
                            <CheckCircle className="w-3.5 h-3.5 fill-white" />
                          </div>
                          <span className="text-[14px] text-white font-light">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mock Add to Cart Button */}
                  <div className="pt-4">
                    <button type="button" className="w-full h-12 rounded-full font-bold text-[15px] bg-white text-[#103256] shadow-lg cursor-not-allowed opacity-95 hover:bg-[#F4F4F6] transition-colors">
                      Add to Cart (Storefront Preview)
                    </button>
                  </div>
                </div>

              </div>

              {/* Feature 1 Box */}
              <div className="border-t border-white/10 pt-10">
                {form.feature1Img ? (
                  <div className="relative rounded-3xl overflow-hidden min-h-[320px] flex items-center shadow-2xl border border-white/10">
                    <img src={form.feature1Img} alt="Feature 1" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#16161A] via-[#16161A]/80 to-transparent pointer-events-none" />
                    <div className="relative z-10 p-8 max-w-lg space-y-5">
                      <h2 className="text-2xl md:text-4xl font-black text-white leading-tight">
                        {form.feature1Title || 'Pro-Grade Engineering'}
                      </h2>
                      <p className="text-white/80 text-[14px] leading-relaxed">{form.feature1Desc || 'Built for maximum durability and low-latency execution.'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="space-y-3">
                      <h2 className="text-xl md:text-2xl font-black text-white">
                        {form.feature1Title || 'Pro-Grade Engineering'}
                      </h2>
                      <p className="text-white/70 text-[14px] leading-relaxed">{form.feature1Desc || 'Designed specifically for demanding enthusiasts.'}</p>
                    </div>
                    <div className="h-44 bg-black/20 rounded-xl flex items-center justify-center p-4">
                      <img src={form.image || getCategoryFallbackImage(form.category, form.name)} alt="Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                  </div>
                )}
              </div>

              {/* Feature 2 Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="h-48 bg-black/20 rounded-xl flex items-center justify-center p-4 overflow-hidden">
                  <img src={form.feature2Img || form.image || getCategoryFallbackImage(form.category, form.name)} alt="Feature 2" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-xl md:text-2xl font-black text-white">
                    {form.feature2Title || 'Next-Gen Performance'}
                  </h2>
                  <p className="text-white/70 text-[14px] leading-relaxed">{form.feature2Desc || 'Experience zero lag and instant response times with optimized hardware integration.'}</p>
                </div>
              </div>

              {/* Everything You Need To Know Mock Accordion */}
              <div className="border-t border-white/10 pt-10 space-y-6 text-center">
                <h2 className="text-xl font-black text-white">
                  Everything You <span className="text-[#7cb3d8]">Need To Know</span>
                </h2>
                <div className="space-y-2 max-w-2xl mx-auto text-left">
                  {['Highlights & Build Quality', 'Specifications & Technical Sheet', 'Shipping & 1-Year Local Warranty'].map((acc, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-white/10 bg-white/5 flex justify-between items-center text-[14px] font-bold text-white">
                      <span>{acc}</span>
                      <span className="text-[#7cb3d8]">▼</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Live Preview Modal Footer */}
            <div className="bg-[#0b2440] border-t border-white/10 px-6 py-3.5 flex justify-between items-center flex-shrink-0">
              <span className="text-[14px] text-white/70 font-light">Master template preview validated. Click Save & Publish to go live.</span>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowLivePreview(false)}
                  className="px-4 py-1.5 border border-white/20 text-[14px] font-bold rounded-xl text-white hover:bg-white/10"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => { setShowLivePreview(false); handleSaveSubmit('active'); }}
                  className="px-5 py-1.5 bg-[#7cb3d8] text-[#103256] text-[14px] font-extrabold rounded-xl hover:bg-white flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5 fill-[#103256]" /> Save product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ─── STOCK ADJUST MODAL ─────────────────────── */
function StockAdjustModal({ product, onClose, onSave }: {
  product: any; onClose: () => void; onSave: (id: string, newStock: number, log: any) => void;
}) {
  const [mode, setMode] = useState<'in' | 'out' | 'set'>('in');
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState('');

  const preview = useMemo(() => {
    const cur = product.stock || 0;
    if (mode === 'in') return cur + qty;
    if (mode === 'out') return Math.max(0, cur - qty);
    return qty;
  }, [mode, qty, product.stock]);

  const handleSave = () => {
    const logEntry = {
      date: new Date().toISOString(),
      type: mode === 'in' ? 'Stock In' : mode === 'out' ? 'Stock Out' : 'Adjustment',
      qty: mode === 'out' ? -qty : qty,
      before: product.stock || 0,
      after: preview,
      reason: reason || 'Manual adjustment',
      productId: product._id || product.id,
    };
    onSave(product._id || product.id, preview, logEntry);
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Adjust inventory"
      subtitle={product.code ? `SKU ${product.code}` : undefined}
      icon={Boxes}
      size="sm"
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-xl bg-[#FAFAFB] p-3 border border-[#EDEDF0]">
          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover bg-white rounded-xl border border-[#EDEDF0] flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-[#16161A] text-[15px] line-clamp-1">{product.name}</p>
            <p className="text-[14px] text-[#6E6E78]">Current stock: <span className="font-semibold text-[#5B32F0]">{product.stock || 0}</span> units</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'in', label: 'Stock In', icon: PackagePlus, color: 'emerald' },
            { id: 'out', label: 'Stock Out', icon: PackageMinus, color: 'red' },
            { id: 'set', label: 'Set Exact', icon: SlidersHorizontal, color: 'blue' },
          ].map(({ id, label, icon: Icon, color }) => (
            <button key={id} onClick={() => setMode(id as any)}
              className={`py-2.5 rounded-[10px] text-[14px] font-bold flex flex-col items-center gap-1 transition-all border ${mode === id
                ? color === 'emerald' ? 'bg-[#F1EDFE] border-[#E8E8EC] text-[#5B32F0]'
                  : color === 'red' ? 'bg-[#fff1f0] border-[#E8E8EC] text-[#cf1322]'
                  : 'bg-[#e6f7ff] border-[#E8E8EC] text-[#0050b3]'
                : 'bg-[#F7F7F9] border-[#E8E8EC] text-[#6E6E78] hover:bg-white'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-[14px] font-bold text-[#16161A] mb-1.5">
            {mode === 'in' ? 'Quantity to Add' : mode === 'out' ? 'Quantity to Remove' : 'Set New Quantity'}
          </label>
          <input type="number" min="0" value={qty} onChange={e => setQty(+e.target.value)}
            className="w-full px-3 py-2 border border-[#E8E8EC] rounded-[10px] text-[15px] focus:outline-none focus:border-[#5B32F0]" />
        </div>

        <div>
          <label className="block text-[14px] font-bold text-[#16161A] mb-1.5">Reason (optional)</label>
          <input value={reason} onChange={e => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-[#E8E8EC] rounded-[10px] text-[15px] focus:outline-none focus:border-[#5B32F0]" placeholder="e.g. New shipment, damaged..." />
        </div>

        <div className="bg-[#F7F7F9] p-4 rounded-[10px] border border-[#E8E8EC] flex items-center justify-between">
          <span className="text-[15px] text-[#6E6E78] font-semibold">New stock level:</span>
          <span className={`text-lg font-bold ${preview <= 0 ? 'text-[#cf1322]' : preview <= 5 ? 'text-[#8a5b00]' : 'text-[#5B32F0]'}`}>{preview} units</span>
        </div>

        <div className="flex gap-3 pt-1">
          <Btn icon={X} onClick={onClose} className="flex-1">Cancel</Btn>
          <Btn variant="primary" icon={CheckCircle} onClick={handleSave} className="flex-1">Confirm adjustment</Btn>
        </div>
      </div>
    </Modal>
  );
}

interface NavSubItem {
  id: string;
  label: string;
}

interface NavItem {
  id: string;
  icon: any;
  label: string;
  subItems?: NavSubItem[];
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

/** Page name shown in the top bar for each tab. */
const PAGE_TITLES: Record<string, string> = {
  home: 'Home',
  'orders-list': 'Orders', orders: 'Orders', drafts: 'Drafts', 'abandoned-checkouts': 'Abandoned checkouts',
  'products-list': 'Products', inventory: 'Inventory', collections: 'Collections', discounts: 'Discounts',
  invoices: 'Invoices', customers: 'Customers', analytics: 'Analytics', reports: 'Reports',
  inbox: 'Inbox', blogs: 'Blog', blog: 'Blog', pages: 'Pages',
  settings: 'Settings', customization: 'Online Store',
};

/* ─── ADMIN NAVIGATION ───────────────────────────────────────────────────────
   Grouped like the reference (MAIN MENU / SALES CHANNELS) but carrying this
   store's own sections — no placeholder pages for features we don't have.     */
const ADMIN_NAV: {
  title: string;
  items: { id: string; label: string; icon: React.ElementType; subItems?: { id: string; label: string }[] }[];
}[] = [
  {
    title: 'Main Menu',
    items: [
      { id: 'home', label: 'Home', icon: LayoutDashboard },
      {
        id: 'store',
        label: 'My Store',
        icon: ShoppingBag,
        subItems: [
          { id: 'products-list', label: 'Products' },
          { id: 'orders-list', label: 'Orders' },
          { id: 'inventory', label: 'Inventory' },
          { id: 'collections', label: 'Collections' },
          { id: 'discounts', label: 'Discount' },
        ],
      },
      { id: 'invoices', label: 'Invoices', icon: Printer },
      { id: 'customers', label: 'Customers', icon: Users },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'inbox', label: 'Inbox', icon: MessageSquare },
      { id: 'blogs', label: 'Blog', icon: FileText },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
  {
    title: 'Sales Channels',
    items: [
      { id: 'customization', label: 'Online Store', icon: Globe },
    ],
  },
];

/* ─── LEGACY NAVIGATION (unused) ─────────────── */
const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { id: 'home', icon: LayoutDashboard, label: 'Home' },
      {
        id: 'orders',
        icon: Package,
        label: 'Orders',
        subItems: [
          { id: 'orders-list', label: 'All' },
          { id: 'drafts', label: 'Drafts' },
          { id: 'abandoned-checkouts', label: 'Abandoned checkouts' }
        ]
      },
      {
        id: 'products',
        icon: TagIcon,
        label: 'Products',
        subItems: [
          { id: 'products-list', label: 'All Products' },
          { id: 'inventory', label: 'Inventory' },
          { id: 'collections', label: 'Collections' }
        ]
      },
      { id: 'customers', icon: Users, label: 'Customers' },
      { id: 'discounts', icon: Percent, label: 'Discounts' },
      {
        id: 'content',
        icon: FileText,
        label: 'Content',
        subItems: [
          { id: 'blogs', label: 'Blog posts' },
          { id: 'pages', label: 'Pages' }
        ]
      },
      {
        id: 'analytics',
        icon: BarChart3,
        label: 'Analytics',
        subItems: [
          { id: 'analytics', label: 'Dashboard' },
          { id: 'reports', label: 'Reports' },
          { id: 'live-view', label: 'Live View' }
        ]
      }
    ]
  },
  {
    title: 'Apps',
    items: [
      { id: 'invoices', icon: Printer, label: 'Invoice Gen' }
    ]
  }
];

function TagIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.293 8.293a1.5 1.5 0 0 0 2.122 0l7.172-7.172a1.5 1.5 0 0 0 0-2.122l-8.293-8.293Z" />
      <path d="M6 6h.01" />
    </svg>
  );
}

/* ─── MAIN ADMIN PAGE ────────────────────────── */
export default function AdminPage() {
  useSEO({
    title: "Admin Panel | Adamjee Computers",
    description: "Administrative dashboard for Adamjee Computers — manage orders, products, customers and more.",
    keywords: "admin panel, adamjee computers, control panel, store management"
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  /**
   * Icon-rail sidebar. Inventory is a three-panel screen (filters | grid |
   * detail), so the nav collapses to icons there by default. `railOverride`
   * holds an explicit user choice; null means "follow the per-screen default".
   */
  const [railOverride, setRailOverride] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('home');
  const [analyticsRange, setAnalyticsRange] = useState<'today' | 'yesterday' | '7days' | '30days' | '3months' | '1year' | 'custom' | 'all'>('all');
  const [analyticsStartDate, setAnalyticsStartDate] = useState('');
  const [analyticsEndDate, setAnalyticsEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    orders: true,
    products: true,
    content: true
  });

  const [stats, setStats] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<'live' | 'unavailable' | 'checking'>('checking');
  const [dbError, setDbError] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);

  // Shopify top-bar interactive states
  const [topSearchQuery, setTopSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);

  // Gemini AI Product Description states & function
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleGenerateDescription = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiGeneratedText('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await response.json();
      if (data.text) {
        setAiGeneratedText(data.text);
      } else {
        setAiGeneratedText('Failed to generate product description. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setAiGeneratedText('Error generating content. Please check API config.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Search and filters
  const [searchQ, setSearchQ] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productStatusFilter, setProductStatusFilter] = useState('All');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [collectionSearch, setCollectionSearch] = useState('');
  const [discountSearch, setDiscountSearch] = useState('');
  const [blogSearch, setBlogSearch] = useState('');
  const [confirmDeleteCollection, setConfirmDeleteCollection] = useState<any>(null);
  const [orderTabFilter, setOrderTabFilter] = useState('All');

  // Sort
  const [productSortField, setProductSortField] = useState('name');
  const [productSortDir, setProductSortDir] = useState<'asc' | 'desc'>('asc');

  // Modals / forms
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState<any>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any>(null);
  const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState<any>(null);
  const [stockAdjustProduct, setStockAdjustProduct] = useState<any>(null);
  const [inventoryDetailProduct, setInventoryDetailProduct] = useState<any>(null);

  // Forms
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogCategory, setBlogCategory] = useState('News');
  const [blogImage, setBlogImage] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogIsPublished, setBlogIsPublished] = useState(true);

  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [discountMinReq, setDiscountMinReq] = useState(0);
  const [discountUsageLimit, setDiscountUsageLimit] = useState<string>('');
  const [discountStartDate, setDiscountStartDate] = useState<string>('');
  const [discountEndDate, setDiscountEndDate] = useState<string>('');

  // Selected customer profile view
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<any>(null);

  // Create Order View state
  const [showCreateOrderView, setShowCreateOrderView] = useState(false);
  const [coCustomerEmail, setCoCustomerEmail] = useState('');
  const [coCustomerName, setCoCustomerName] = useState('');
  const [coCustomerPhone, setCoCustomerPhone] = useState('');
  const [coCustomerAddress, setCoCustomerAddress] = useState('');
  const [coItems, setCoItems] = useState<any[]>([{ productId: '', quantity: 1, price: 0 }]);
  const [coDiscountVal, setCoDiscountVal] = useState(0);
  const [coDiscountType, setCoDiscountType] = useState('percentage');
  const [coTaxRate, setCoTaxRate] = useState(18);
  const [coShippingCost, setCoShippingCost] = useState(15);
  const [coNotes, setCoNotes] = useState('');
  const [coPaymentMethod, setCoPaymentMethod] = useState('cod');

  // Inventory movement log (localStorage)
  const [inventoryLog, setInventoryLog] = useState<any[]>([]);
  const [inventorySearch, setInventorySearch] = useState('');
  // ── Inventory filter rail state ──
  const [invOpenGroups, setInvOpenGroups] = useState<Record<string, boolean>>({
    status: true, category: true, vendor: false, price: true,
  });
  const toggleInvGroup = (k: string) => setInvOpenGroups(prev => ({ ...prev, [k]: !prev[k] }));
  const [invCategoryFilter, setInvCategoryFilter] = useState<string[]>([]);
  const [invVendorFilter, setInvVendorFilter] = useState<string[]>([]);
  const [invPriceMin, setInvPriceMin] = useState('');
  const [invPriceMax, setInvPriceMax] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState('All');
  
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Unified Inbox states
  const [inboxSubTab, setInboxSubTab] = useState<'chats' | 'contact'>('chats');
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [selectedChatSession, setSelectedChatSession] = useState<any>(null);

  // Collection management — fully backend-synced & instant synchronous initialization
  const DEFAULT_ADMIN_COLLECTIONS = [
    { _id: 'col-1', name: 'Mouse', slug: 'mouse', description: 'Gaming & Ergonomic Mice', subtext: 'Surround yourself in sound', image: '' },
    { _id: 'col-2', name: 'Headphones', slug: 'headphones', description: 'Studio & Gaming Audio', subtext: 'Surround yourself in sound', image: '' },
    { _id: 'col-3', name: 'Earphones', slug: 'earphones', description: 'True Wireless Audio', subtext: 'Surround yourself in sound', image: '' },
    { _id: 'col-4', name: 'Desktops', slug: 'desktops', description: 'Custom Rig PCs', subtext: 'Surround yourself in sound', image: '' },
    { _id: 'col-5', name: 'Accessories', slug: 'accessories', description: 'Keyboards & Peripherals', subtext: 'Surround yourself in sound', image: '' },
    { _id: 'col-6', name: 'Laptops', slug: 'laptops', description: 'Gaming & Professional Laptops', subtext: 'Surround yourself in sound', image: '' },
    { _id: 'col-7', name: 'Monitors', slug: 'monitors', description: 'Ultra-Fast Gaming Displays', subtext: 'Surround yourself in sound', image: '' },
    { _id: 'col-8', name: 'GPUs', slug: 'gpus', description: 'NVIDIA RTX & AMD Radeon', subtext: 'Surround yourself in sound', image: '' }
  ];

  const [collections, setCollections] = useState<any[]>(DEFAULT_ADMIN_COLLECTIONS);
  const [customCollections, setCustomCollections] = useState<string[]>(DEFAULT_ADMIN_COLLECTIONS.map(c => c.name));
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionSubtext, setNewCollectionSubtext] = useState('Premium Tech Products');
  const [newCollectionImage, setNewCollectionImage] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [collectionSaving, setCollectionSaving] = useState(false);
  const [expandedCollection, setExpandedCollection] = useState<string | null>(null);

  // Invoice generator state
  const [invoiceCustomerName, setInvoiceCustomerName] = useState('');
  const [invoiceCustomerEmail, setInvoiceCustomerEmail] = useState('');
  const [invoiceCustomerPhone, setInvoiceCustomerPhone] = useState('');
  const [invoiceCustomerAddress, setInvoiceCustomerAddress] = useState('');
  const [invoiceShippingCharges, setInvoiceShippingCharges] = useState(0);
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [invoicePaymentMethod, setInvoicePaymentMethod] = useState('Cash');
  const [invoiceItems, setInvoiceItems] = useState<any[]>([{ productId: '', name: '', price: 0, cost: 0, quantity: 1 }]);
  const [invoiceDiscountType, setInvoiceDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [invoiceDiscountValue, setInvoiceDiscountValue] = useState(0);
  const [invoiceTaxRate, setInvoiceTaxRate] = useState(18);
  const [showPrintInvoice, setShowPrintInvoice] = useState<any>(null);

  // Store Settings
  const [storeSettings, setStoreSettings] = useState<any>({
    storeName: 'Adamjee Computers',
    storePhone: '+92 300 0000000',
    storeEmail: 'support@adamjeecomputers.com',
    storeAddress: 'Regal Plaza, Saddar, Karachi, Pakistan',
    gstNumber: 'GST-1234567-8',
    currency: 'Rs.',
    defaultTaxRate: 18,
    terms: '1. 1 Year warranty on premium products.\n2. 7-day window for hardware check/returns.\n3. No returns on burned, damaged, or modified parts.',
    socialLinks: {
      facebook: 'https://facebook.com/adamjeecomputers',
      instagram: 'https://instagram.com/adamjeecomputers',
      youtube: 'https://youtube.com/@adamjeecomputers',
      linkedin: 'https://linkedin.com/company/adamjeecomputers',
      twitter: 'https://twitter.com/adamjeecomp',
      whatsapp: '+923000000000',
      tiktok: 'https://tiktok.com/@adamjeecomputers'
    },
    heroSlides: [
      { image: '/images/blue_rgb_pc_cases_1780241349905.png', title: 'Ultimate Gaming Rig', subtitle: 'Power & Performance Redefined', link: '/category/all' },
      { image: '/images/promo_gamers_bg.png', title: 'Next-Gen Components', subtitle: 'Build Your Dream PC', link: '/build-your-pc' },
      { image: '/images/black_friday_pc_deal_1780241366115.png', title: 'Special Tech Deals', subtitle: 'Up to 25% Off Premium Hardware', link: '/category/all' }
    ],
    whyUs: {}
  });

  const [promoTaglineInput, setPromoTaglineInput] = useState<string>('Save up to 60% with code BLACKFRIDAY • Free shipping over PKR 50,000 •');

  // Setup Guide checklists
  const [setupSteps, setSetupSteps] = useState([
    { id: 1, text: 'Add your first product', completed: true },
    { id: 2, text: 'Customize your online theme', completed: false },
    { id: 3, text: 'Configure shipping rates', completed: false },
    { id: 4, text: 'Set up Safepay or COD payment gateways', completed: false },
    { id: 5, text: 'Create a blog post for your launch', completed: false }
  ]);

  // Derived filter functions
  const filteredProducts = useMemo(() => {
    let arr = products.filter(p => {
      const matchSearch = !searchQ || p.name?.toLowerCase().includes(searchQ.toLowerCase()) || p.code?.toLowerCase().includes(searchQ.toLowerCase());
      const matchCat = productCategoryFilter === 'All' || p.category === productCategoryFilter;
      const matchStatus = productStatusFilter === 'All' || (p.status || 'active') === productStatusFilter.toLowerCase();
      return matchSearch && matchCat && matchStatus;
    });
    arr = [...arr].sort((a, b) => {
      let av: any = a[productSortField] ?? '';
      let bv: any = b[productSortField] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return productSortDir === 'asc' ? -1 : 1;
      if (av > bv) return productSortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [products, searchQ, productCategoryFilter, productStatusFilter, productSortField, productSortDir]);

  const filteredOrders = useMemo(() => {
    // Basic filter based on sub-tab choice
    return orders.filter(o => {
      const isDraft = o.orderStatus === 'draft';
      const isAbandoned = o.orderStatus === 'abandoned';
      
      if (activeTab === 'drafts') return isDraft;
      if (activeTab === 'abandoned-checkouts') return isAbandoned;
      
      // For orders-list tab
      if (isDraft || isAbandoned) return false; // Hide draft/abandoned in main list
      
      if (orderTabFilter === 'All') return true;
      if (orderTabFilter === 'Unfulfilled') return o.orderStatus === 'pending' || o.orderStatus === 'processing';
      if (orderTabFilter === 'Unpaid') return o.paymentStatus === 'pending' || o.paymentStatus === 'unpaid';
      return o.orderStatus === orderTabFilter.toLowerCase();
    });
  }, [orders, orderTabFilter, activeTab]);

  /** Category facet counts for the inventory filter rail. */
  const invCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => { const c = (p.category || '').trim(); if (c) counts[c] = (counts[c] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [products]);

  /** Vendor facet counts for the inventory filter rail. */
  const invVendors = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => { const v = (p.vendor || '').trim(); if (v) counts[v] = (counts[v] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [products]);

  const invMaxPrice = useMemo(
    () => Math.max(1000, ...products.map(p => Math.ceil(Number(p.price) || 0))),
    [products]
  );

  /** Collapse the nav to icons on the three-panel Inventory screen by default. */
  const railMode = railOverride ?? activeTab === 'inventory';

  /* ─── HOME DASHBOARD DERIVATIONS ───────────────────────────────────────────
     Everything below is computed from the orders and products already loaded
     from MongoDB — no placeholder series, no invented metrics.               */
  const dash = useMemo(() => {
    const now = new Date();
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const today = startOfDay(now);
    const DAY = 86_400_000;

    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    const revenueOf = (list: any[]) => list.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const onDay = (list: any[], dayStart: number) =>
      list.filter(o => {
        const t = new Date(o.createdAt || 0).getTime();
        return t >= dayStart && t < dayStart + DAY;
      });

    // Last 14 days of revenue / order counts, oldest first.
    const days = Array.from({ length: 14 }, (_, i) => today - (13 - i) * DAY);
    const revSeries = days.map(d => revenueOf(onDay(paidOrders, d)));
    const ordSeries = days.map(d => onDay(orders, d).length);

    const revToday = revSeries[13];
    const revYesterday = revSeries[12];
    const ordToday = ordSeries[13];
    const ordYesterday = ordSeries[12];

    const pct = (curr: number, prev: number) => (prev > 0 ? ((curr - prev) / prev) * 100 : curr > 0 ? 100 : 0);

    const aovToday = ordToday > 0 ? revToday / ordToday : 0;
    const aovYesterday = ordYesterday > 0 ? revYesterday / ordYesterday : 0;

    // This week vs last week, Monday-first.
    const dow = (now.getDay() + 6) % 7;
    const weekStart = today - dow * DAY;
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const thisWeek = labels.map((_, i) => revenueOf(onDay(paidOrders, weekStart + i * DAY)));
    const lastWeek = labels.map((_, i) => revenueOf(onDay(paidOrders, weekStart + (i - 7) * DAY)));
    const weekTotal = thisWeek.reduce((a, b) => a + b, 0);
    const lastWeekTotal = lastWeek.reduce((a, b) => a + b, 0);

    // Revenue and units per product, from real order line items.
    const perProduct: Record<string, { name: string; revenue: number; units: number }> = {};
    orders.forEach(o => (o.items || []).forEach((it: any) => {
      const key = String(it.product ?? it.name ?? '');
      if (!key) return;
      if (!perProduct[key]) perProduct[key] = { name: it.name || key, revenue: 0, units: 0 };
      perProduct[key].revenue += (Number(it.price) || 0) * (Number(it.quantity) || 0);
      perProduct[key].units += Number(it.quantity) || 0;
    }));

    const topProducts = Object.entries(perProduct)
      .map(([key, v]) => {
        const match = products.find(p => p._id === key || p.id === key || p.slug === key || p.code === key || p.name === v.name);
        return { key, ...v, stock: match?.stock ?? 0, image: match ? getProductImage(match) : '', category: match?.category };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);
    const topRevenue = topProducts[0]?.revenue || 1;

    // Stock that needs attention.
    const alerts = products
      .map(p => ({ ...p, _stock: p.stock ?? 0, _threshold: p.lowStockThreshold || 5 }))
      .filter(p => p._stock <= p._threshold)
      .sort((a, b) => a._stock - b._stock)
      .slice(0, 4);

    // Order-status split — we have this; visitor analytics we do not.
    const statusColors: Record<string, string> = {
      pending: '#D97706', processing: '#5B32F0', shipped: '#1D6FD0',
      delivered: '#16A34A', cancelled: '#DC2626',
    };
    const statusSegments = Object.entries(
      orders.reduce((acc: Record<string, number>, o) => {
        const k = (o.orderStatus || 'pending').toLowerCase();
        acc[k] = (acc[k] || 0) + 1;
        return acc;
      }, {})
    ).map(([label, value]) => ({ label, value: value as number, color: statusColors[label] || '#9A9AA5' }));

    return {
      revToday, ordToday, aovToday,
      revDelta: pct(revToday, revYesterday),
      ordDelta: pct(ordToday, ordYesterday),
      aovDelta: pct(aovToday, aovYesterday),
      convDelta: pct(ordToday, ordYesterday),
      revSpark: revSeries.slice(7),
      // Cumulative catalogue size per day, from each product's createdAt — a real
      // series rather than a shaped curve.
      stockSpark: days.slice(7).map(d =>
        products.filter(p => new Date(p.createdAt || 0).getTime() < d + DAY).length
      ),
      ordSpark: ordSeries.slice(7),
      aovSpark: revSeries.slice(7).map((r, i) => (ordSeries.slice(7)[i] > 0 ? r / ordSeries.slice(7)[i] : 0)),
      labels, thisWeek, lastWeek, weekTotal,
      weekDelta: pct(weekTotal, lastWeekTotal),
      topProducts, topRevenue,
      alerts,
      statusSegments,
      recentOrders: [...orders].sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5),
    };
  }, [orders, products]);

  const filteredInventory = useMemo(() => {
    const min = invPriceMin === '' ? -Infinity : Number(invPriceMin);
    const max = invPriceMax === '' ? Infinity : Number(invPriceMax);

    return products.filter(p => {
      const q = inventorySearch.toLowerCase();
      const matchSearch = !q
        || p.name?.toLowerCase().includes(q)
        || p.code?.toLowerCase().includes(q)
        || p.category?.toLowerCase().includes(q);

      const stock = p.stock ?? 0;
      const threshold = p.lowStockThreshold || 5;
      const matchStock =
        inventoryFilter === 'All' ||
        (inventoryFilter === 'in' && stock > threshold) ||
        (inventoryFilter === 'low' && stock > 0 && stock <= threshold) ||
        (inventoryFilter === 'out' && stock <= 0);

      const matchCategory = invCategoryFilter.length === 0 || invCategoryFilter.includes((p.category || '').trim());
      const matchVendor = invVendorFilter.length === 0 || invVendorFilter.includes((p.vendor || '').trim());

      const price = Number(p.price) || 0;
      const matchPrice = price >= min && price <= max;

      return matchSearch && matchStock && matchCategory && matchVendor && matchPrice;
    });
  }, [products, inventorySearch, inventoryFilter, invCategoryFilter, invVendorFilter, invPriceMin, invPriceMax]);

  const customerSpendings = useMemo(() => {
    const ltv: Record<string, { totalSpent: number; orderCount: number }> = {};
    orders.forEach(o => {
      const email = o.user?.email || o.guestEmail || 'guest@adamjee.com';
      if (!ltv[email]) {
        ltv[email] = { totalSpent: 0, orderCount: 0 };
      }
      if (o.orderStatus !== 'cancelled' && o.orderStatus !== 'draft') {
        ltv[email].totalSpent += o.total;
        ltv[email].orderCount += 1;
      }
    });
    return ltv;
  }, [orders]);

  const productCategories = useMemo(() => ['All', ...Array.from(new Set([...products.map(p => p.category).filter(Boolean), ...customCollections]))], [products, customCollections]);

  // Pagination setups
  const { paged: pagedProducts, page: prodPage, setPage: setProdPage, totalPages: prodTotalPages, pageSize: prodPageSize, setPageSize: setProdPageSize } = usePagination(filteredProducts, 10);
  const { paged: pagedOrders, page: ordPage, setPage: setOrdPage, totalPages: ordTotalPages, pageSize: ordPageSize, setPageSize: setOrdPageSize } = usePagination(filteredOrders, 10);
  const { paged: pagedInventory, page: invPageNum, setPage: setInvPage, totalPages: invTotalPages, pageSize: invPageSize, setPageSize: setInvPageSize } = usePagination(filteredInventory, 6);
  const filteredUsers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [users, customerSearch]);
  const { paged: pagedUsers, page: usersPage, setPage: setUsersPage, totalPages: usersTotalPages, pageSize: usersPageSize, setPageSize: setUsersPageSize } = usePagination(filteredUsers, 10);
  const { paged: pagedInvoices, page: invoicesPage, setPage: setInvoicesPage, totalPages: invoicesTotalPages, pageSize: invoicesPageSize, setPageSize: setInvoicesPageSize } = usePagination(invoices, 6);

  // ─── Restore admin session from localStorage on mount ───────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.role === 'admin') {
          setAdminName(user.name || '');
          setAdminEmail(user.email || '');
          setIsAuthenticated(true);
          setIsCheckingAuth(false);
          loadData(token);
        } else {
          setIsCheckingAuth(false);
        }
      } catch {
        setIsCheckingAuth(false);
      }
    } else {
      setIsCheckingAuth(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const log = JSON.parse(localStorage.getItem('inv_log') || '[]');
      setInventoryLog(log);
    } catch { setInventoryLog([]); }
    try {
      const savedCollections = JSON.parse(localStorage.getItem('adamjee_collections') || '[]');
      if (Array.isArray(savedCollections)) setCustomCollections(savedCollections);
    } catch {}
    try {
      const savedSettings = JSON.parse(localStorage.getItem('store_settings') || 'null');
      if (savedSettings) {
        setStoreSettings(savedSettings);
        setInvoiceTaxRate(savedSettings.defaultTaxRate);
        setCoTaxRate(savedSettings.defaultTaxRate);
      }
    } catch {}
    try {
      const savedTagline = localStorage.getItem('adamjee_promo_tagline');
      if (savedTagline) setPromoTaglineInput(savedTagline);
    } catch {}
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data?.settings?.promoTagline) {
          setPromoTaglineInput(data.settings.promoTagline);
          localStorage.setItem('adamjee_promo_tagline', data.settings.promoTagline);
        }
      })
      .catch(() => {});

    // Fetch collections from backend
    const fetchCollections = () => {
      fetch('/api/collections')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.collections)) {
            setCollections(data.collections);
            // Keep customCollections (used by product form) in sync with collection names
            setCustomCollections(data.collections.map((c: any) => c.name));
          }
        })
        .catch(() => {});
    };
    fetchCollections();
    window.addEventListener('adamjee_collections_updated', fetchCollections);
    return () => window.removeEventListener('adamjee_collections_updated', fetchCollections);
  }, []);

  // Automatically trigger print dialog when printable invoice modal mounts
  useEffect(() => {
    if (showPrintInvoice) {
      const timer = setTimeout(() => {
        try {
          window.print();
        } catch (e) {}
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [showPrintInvoice]);


  // ─── Real-time order sync (event driven & storage sync) ──
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('token') || '';

    // Initial load
    loadData(token);

    // Instant BroadcastChannel & Storage Event sync
    const triggerSync = () => {
      const currentToken = localStorage.getItem('token') || token || '';
      loadData(currentToken);
    };

    window.addEventListener('adamjee_new_order', triggerSync);
    window.addEventListener('storage', triggerSync);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('adamjee_orders_channel');
      bc.onmessage = () => triggerSync();
    } catch (e) {}

    return () => {
      window.removeEventListener('adamjee_new_order', triggerSync);
      window.removeEventListener('storage', triggerSync);
      if (bc) bc.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadData = async (token: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, prodRes, ordRes, msgRes, usersRes, invRes, blogRes, discRes, chatRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/products?all=true&limit=1000', { headers }),
        fetch('/api/orders', { headers }),
        fetch('/api/contact', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/invoices', { headers }),
        fetch('/api/blogs'),
        fetch('/api/discounts', { headers }),
        fetch('/api/admin/chats', { headers })
      ]);
      
      const statsData = statsRes.ok ? await statsRes.json() : {};
      const prodData = prodRes.ok ? await prodRes.json() : {};
      const ordData = ordRes.ok ? await ordRes.json() : {};
      const msgData = msgRes.ok ? await msgRes.json() : {};
      const usersData = usersRes.ok ? await usersRes.json() : {};
      const invData = invRes.ok ? await invRes.json() : {};
      const blogData = blogRes.ok ? await blogRes.json() : {};
      const discData = discRes.ok ? await discRes.json() : {};
      const chatData = chatRes.ok ? await chatRes.json() : {};

      setStats(statsData.stats || null);
      if (statsData.dbStatus) {
        setDbStatus(statsData.dbStatus);
        setDbError(statsData.dbError || '');
      } else {
        setDbStatus('live');
        setDbError('');
      }
      // Straight from the API. Nothing is merged in from localStorage or
      // hardcoded seed arrays — the dashboard shows exactly what is in the
      // database, so an empty table means an empty collection.
      const fetchedProducts: any[] = prodData.products || [];
      fetchedProducts.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
      setProducts(fetchedProducts);

      setOrders(ordData.orders || []);
      setUsers(usersData.users || []);
      setInvoices(invData.invoices || []);
      setBlogs(blogData.blogs || []);
      setDiscounts(discData.discounts || []);
      setChatSessions(chatData.sessions || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setDbStatus('unavailable');
      setDbError(String(err));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (res.ok && data.role === 'admin') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }));
        setAdminName(data.name || '');
        setAdminEmail(data.email || '');
        setIsAuthenticated(true);
        loadData(data.token);
      } else {
        setLoginError(data.message || 'Access denied. Admins only.');
      }
    } catch { setLoginError('An error occurred during login.'); }
    finally { setLoginLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  /* ─── CRUD HANDLERS ────────────────────────── */
  const executeProductDeletion = async (p: any) => {
    if (!p) return;
    const pId = p._id || p.id;
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/products/${pId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error('Delete product error:', err);
    }
    setProducts(prev => prev.filter(item => item._id !== pId && item.id !== pId && item.slug !== pId));
    setConfirmDeleteProduct(null);
    showToast(`Product "${p.name}" deleted successfully!`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('adamjee_new_product'));
      try {
        const bc = new BroadcastChannel('adamjee_products_channel');
        bc.postMessage('new_product');
        bc.close();
      } catch (e) {}
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderStatus: newStatus })
      });
    } catch (err) {
      console.error('Order status update error:', err);
    }

    setOrders(prev => prev.map(o => (o.orderId === orderId || o._id === orderId) ? { ...o, orderStatus: newStatus } : o));
    
    if (selectedOrderDetail && (selectedOrderDetail.orderId === orderId || selectedOrderDetail._id === orderId)) {
      setSelectedOrderDetail((prev: any) => prev ? { ...prev, orderStatus: newStatus } : null);
    }

    showToast(`Order #${orderId} status updated to ${newStatus.toUpperCase()}!`);
  };

  const handleSaveProduct = async (form: any) => {
    const token = localStorage.getItem('token');
    let savedProd = { ...form };
    const targetId = editingProduct?._id || editingProduct?.id;
    try {
      let res;
      if (targetId) {
        res = await fetch(`/api/products/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(form)
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(form)
        });
      }
      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.product) savedProd = data.product;
      }
    } catch (err) {
      console.error('API save product error, preserving local copy:', err);
    }

    if (!savedProd._id && !savedProd.id) {
      savedProd.id = targetId || `prod-${Date.now()}`;
      savedProd._id = savedProd.id;
    }

    showToast(`Product "${savedProd.name}" saved successfully!`);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('adamjee_new_product'));
      try {
        const bc = new BroadcastChannel('adamjee_products_channel');
        bc.postMessage('new_product');
        bc.close();
      } catch (e) {}
    }

    setEditingProduct(null);
    setShowProductForm(false);
    loadData(token || '');
  };

  const handleToggleProductStatus = async (p: any) => {
    const current = p.status || 'active';
    const nextStatus = current === 'active' ? 'draft' : 'active';
    const updatedProd = { ...p, status: nextStatus };
    await handleSaveProduct(updatedProd);
  };

  /** Set an explicit product status from the inline status pill. */
  const handleSetProductStatus = async (p: any, status: string) => {
    if ((p.status || 'active') === status) return;
    await handleSaveProduct({ ...p, status, isPublished: status === 'active' });
  };

  /** Download the current (filtered) product list as CSV. */
  const handleExportProducts = () => {
    const cols = ['name', 'code', 'category', 'price', 'comparePrice', 'stock', 'vendor', 'status'];
    const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [
      cols.join(','),
      ...filteredProducts.map((p: any) => cols.map(c => escape(p[c])).join(',')),
    ].join('\n');

    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredProducts.length} products to CSV.`);
  };

  /** Import products from a CSV whose header matches the export format. */
  const handleImportProducts = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,text/csv';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      const [headerLine, ...rows] = text.split(/\r?\n/).filter(l => l.trim());
      if (!headerLine) { showToast('That CSV appears to be empty.'); return; }

      const headers = headerLine.split(',').map(h => h.replace(/^"|"$/g, '').trim());
      const token = localStorage.getItem('token');
      let created = 0;

      for (const row of rows) {
        const cells = row.match(/("([^"]|"")*"|[^,]*)/g)?.filter((_, i) => i % 2 === 0) ?? [];
        const record: Record<string, any> = {};
        headers.forEach((h, i) => { record[h] = (cells[i] || '').replace(/^"|"$/g, '').replace(/""/g, '"'); });
        if (!record.name) continue;

        record.price = Number(record.price) || 0;
        record.comparePrice = Number(record.comparePrice) || 0;
        record.stock = Number(record.stock) || 0;

        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(record),
        });
        if (res.ok) created++;
      }

      showToast(created > 0 ? `Imported ${created} product${created === 1 ? '' : 's'}.` : 'No products were imported.');
      if (created > 0) loadData(token || '');
    };
    input.click();
  };

  const handleStockAdjust = async (productId: string, newStock: number, logEntry: any) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ stock: newStock })
    });
    const newLog = [logEntry, ...inventoryLog];
    setInventoryLog(newLog);
    localStorage.setItem('inv_log', JSON.stringify(newLog));
    loadData(token!);
  };

  const handleMarkMessageRead = async (id: string) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/contact/${id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    loadData(token!);
  };

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm('Delete this invoice?')) {
      const token = localStorage.getItem('token');
      await fetch(`/api/invoices/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      loadData(token!);
    }
  };

  const handlePrintInvoicePDF = (inv: any) => {
    if (!inv) return;
    const store = inv._storeSettings || storeSettings || {};
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setShowPrintInvoice({ ...inv, _storeSettings: storeSettings });
      setTimeout(() => window.print(), 200);
      return;
    }

    const itemsHtml = (inv.items || []).map((item: any, idx: number) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      const amount = price * qty;
      const taxRate = inv.taxRate || 0;
      const discStr = inv.discountType === 'percentage' ? `${inv.discountValue || 0}%` : '$0';
      return `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#FAFAFB'};">
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">
            <div style="font-weight: 700; color: #16161A; font-size: 13px;">${item.name || 'Custom Item'}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Genuine Hardware with Official Warranty</div>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600;">PKR ${Math.round(price).toLocaleString()}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: center; font-weight: 700;">${qty}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #64748b;">${taxRate > 0 ? taxRate + '%' : '0%'}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #64748b;">${discStr}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 800; color: #16161A;">PKR ${Math.round(amount).toLocaleString()}</td>
        </tr>
      `;
    }).join('');

    const subtotal = Number(inv.subtotal || inv.total || 0);
    const discountAmount = Number(inv.discountAmount || 0);
    const taxAmount = Number(inv.taxAmount || 0);
    const shippingCharges = Number(inv.shippingCharges || 0);
    const total = Number(inv.total || 0);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>INVOICE ${inv.invoiceId || inv._id || 'INV-001'} - ${store.storeName || 'Adamjee Computers'}</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
            body { font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif; margin: 0; padding: 40px; color: #16161A; background-color: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #E8E8EC; padding-bottom: 24px; margin-bottom: 24px; }
            .brand { display: flex; align-items: center; gap: 12px; }
            .brand-title { font-size: 22px; font-weight: 900; color: #16161A; margin: 0; }
            .sub-info { font-size: 12px; color: #64748b; margin-top: 4px; line-height: 1.5; }
            .inv-title-box { text-align: right; }
            .inv-title { font-size: 32px; font-weight: 900; color: #16161A; letter-spacing: -0.5px; margin: 0; text-transform: uppercase; }
            .inv-meta { font-size: 12px; font-weight: 600; color: #475569; margin-top: 8px; line-height: 1.6; }
            .addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; background-color: #FAFAFB; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; margin-bottom: 24px; font-size: 12px; }
            .addr-title { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
            .cust-name { font-size: 15px; font-weight: 800; color: #16161A; margin-bottom: 4px; }
            table { width: 100%; border-collapse: separate; border-spacing: 0; border-radius: 12px; overflow: hidden; border: 1px solid #E8E8EC; margin-bottom: 24px; font-size: 12px; }
            th { background-color: #007bff; color: #ffffff; padding: 12px 16px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; }
            .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
            .pay-instruct { font-size: 12px; color: #475569; line-height: 1.6; }
            .pay-instruct h4 { font-size: 11px; font-weight: 800; color: #16161A; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 0.5px; }
            .totals-col { font-size: 13px; font-weight: 600; color: #475569; }
            .tot-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
            .tot-row.grand { font-size: 15px; font-weight: 800; color: #16161A; border-bottom: 2px solid #E8E8EC; }
            .due-box { background-color: #e0f2fe; border: 1px solid rgba(0,123,255,0.3); padding: 12px 16px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
            .due-title { font-size: 11px; font-weight: 900; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px; }
            .due-val { font-size: 18px; font-weight: 900; color: #0369a1; }
            .footer-sign { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #f1f5f9; padding-top: 24px; font-size: 11px; color: #94a3b8; }
            .signature { text-align: right; }
            .sig-line { border-top: 1px solid #E8E8EC; width: 140px; text-align: center; padding-top: 4px; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 4px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">
                <img src="${typeof window !== 'undefined' ? window.location.origin : ''}/images/Mask group.png" alt="Adamjee Logo" style="height: 38px; width: auto; object-fit: contain;" />
                <img src="${typeof window !== 'undefined' ? window.location.origin : ''}/images/Mask group (1).png" alt="Adamjee Computers" style="height: 26px; width: auto; object-fit: contain;" />
              </div>
              <div class="sub-info">
                <p style="margin:2px 0;">${store.storeAddress || 'Main Gaming Hub, Karachi, Pakistan'}</p>
                <p style="margin:2px 0;">Email: ${store.storeEmail || 'support@adamjeecomputers.com'} • Ph: ${store.storePhone || '+92 318 3919084'}</p>
                <p style="margin:2px 0;">Website: www.adamjeecomputers.com</p>
              </div>
            </div>
            <div class="inv-title-box">
              <h2 class="inv-title">INVOICE</h2>
              <div class="inv-meta">
                <div>Invoice no: <strong>${inv.invoiceId || inv._id || 'INV-001'}</strong></div>
                <div>Invoice date: ${new Date(inv.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                <div>Due date: ${new Date(inv.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
              </div>
            </div>
          </div>

          <div class="addresses">
            <div>
              <div class="addr-title">Bill To</div>
              <div class="cust-name">${inv.customerName || 'Valued Customer'}</div>
              ${inv.customerEmail ? `<div>${inv.customerEmail}</div>` : ''}
              ${inv.customerPhone ? `<div>Ph: ${inv.customerPhone}</div>` : ''}
              ${inv.customerAddress ? `<div style="margin-top:4px;">${inv.customerAddress}</div>` : ''}
            </div>
            <div>
              <div class="addr-title">Ship To</div>
              <div style="font-weight:600; color:#334155;">${inv.customerAddress || 'Customer Address Provided'}</div>
              <div style="font-family:monospace; margin-top:6px;">Payment Method: <strong>${inv.paymentMethod || 'Cash'}</strong></div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40%;">DESCRIPTION</th>
                <th style="text-align: right;">RATE</th>
                <th style="text-align: center;">QTY</th>
                <th style="text-align: right;">TAX</th>
                <th style="text-align: right;">DISC</th>
                <th style="text-align: right;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="bottom-grid">
            <div class="pay-instruct">
              <h4>Payment instruction</h4>
              <div>Payment Method: <strong>${inv.paymentMethod || 'Cash'}</strong></div>
              <div style="font-size:11px; margin-top:4px;">Bank: Meezan Bank Ltd | A/C: 01020304050607</div>
              ${inv.notes ? `
                <div style="background:#FAFAFB; padding:10px; border-radius:8px; margin-top:12px; border:1px solid #f1f5f9;">
                  <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Notes</div>
                  <div style="color:#334155; font-weight:500; margin-top:2px;">${inv.notes}</div>
                </div>
              ` : ''}
            </div>

            <div class="totals-col">
              <div class="tot-row"><span>Subtotal:</span><strong>PKR ${Math.round(subtotal).toLocaleString()}</strong></div>
              ${discountAmount > 0 ? `<div class="tot-row" style="color:#ef4444;"><span>Discount:</span><strong>-PKR ${Math.round(discountAmount).toLocaleString()}</strong></div>` : ''}
              ${taxAmount > 0 ? `<div class="tot-row"><span>Sales Tax (${inv.taxRate || 0}%):</span><strong>+PKR ${Math.round(taxAmount).toLocaleString()}</strong></div>` : ''}
              <div class="tot-row"><span>Shipping Cost:</span><strong>+PKR ${Math.round(shippingCharges).toLocaleString()}</strong></div>
              <div class="tot-row grand"><span>Total:</span><span>PKR ${Math.round(total).toLocaleString()}</span></div>
              <div class="tot-row"><span>Amount paid:</span><strong>PKR ${Math.round(total).toLocaleString()}</strong></div>

              <div class="due-box">
                <span class="due-title">Balance Due:</span>
                <span class="due-val">$0.00</span>
              </div>
            </div>
          </div>

          <div class="footer-sign">
            <div>Thank you for choosing Adamjee Computers! For queries, contact support@adamjeecomputers.com</div>
            <div class="signature">
              <svg width="110" height="35" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="color:#007bff;">
                <path d="M10 28 C 22 8, 35 35, 50 12 C 60 4, 70 32, 82 18 C 92 8, 102 32, 115 20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>
              </svg>
              <div class="sig-line">Authorized Signature</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveInvoice = async () => {
    const customerName = invoiceCustomerName.trim() || 'Valued Customer';
    const validItems = invoiceItems.map(item => ({
      productId: item.productId || '',
      name: item.name.trim() || 'Custom Item',
      price: Number(item.price) || 0,
      cost: Number(item.cost) || 0,
      quantity: Math.max(1, Number(item.quantity) || 1)
    }));

    const subtotal = validItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const rawDiscount = invoiceDiscountType === 'fixed' ? (Number(invoiceDiscountValue) || 0) : (subtotal * (Number(invoiceDiscountValue) || 0)) / 100;
    const discountAmount = Math.min(subtotal, Math.max(0, rawDiscount));
    const taxedAmount = Math.max(0, subtotal - discountAmount);
    const taxRate = Number(invoiceTaxRate) || 0;
    const taxAmount = Math.max(0, (taxedAmount * taxRate) / 100);
    const shippingCharges = Math.max(0, Number(invoiceShippingCharges) || 0);
    const total = Math.max(0, taxedAmount + taxAmount + shippingCharges);

    const invoiceData = {
      customerName,
      customerEmail: invoiceCustomerEmail,
      customerPhone: invoiceCustomerPhone,
      customerAddress: invoiceCustomerAddress,
      shippingCharges,
      items: validItems,
      discountType: invoiceDiscountType,
      discountValue: Number(invoiceDiscountValue) || 0,
      discountAmount,
      taxRate,
      taxAmount,
      subtotal,
      total,
      paymentMethod: invoicePaymentMethod || 'Cash',
      notes: invoiceNotes
    };

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let savedInvoice: any = {
      ...invoiceData,
      _id: 'INV-' + Math.floor(1000 + Math.random() * 9000),
      invoiceId: 'INV-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(invoiceData)
      });
      const data = await res.json();
      if (res.ok && data.invoice) {
        savedInvoice = data.invoice;
        if (token) loadData(token);
      }
    } catch (err) {
      console.error('Error saving invoice:', err);
    }

    // Clear form inputs
    setInvoiceCustomerName('');
    setInvoiceCustomerEmail('');
    setInvoiceCustomerPhone('');
    setInvoiceCustomerAddress('');
    setInvoiceShippingCharges(0);
    setInvoiceNotes('');
    setInvoiceDiscountValue(0);
    setInvoiceItems([{ productId: '', name: '', price: 0, cost: 0, quantity: 1 }]);

    const fullInv = { ...savedInvoice, _storeSettings: storeSettings };
    // Show overlay modal & trigger print window
    setShowPrintInvoice(fullInv);
    try {
      window.print();
    } catch (e) {}
  };

  const handleSaveSettings = () => {
    localStorage.setItem('store_settings', JSON.stringify(storeSettings));
    setInvoiceTaxRate(storeSettings.defaultTaxRate);
    setCoTaxRate(storeSettings.defaultTaxRate);
    window.dispatchEvent(new Event('store_settings_updated'));
    showToast('All settings and homepage hero banners saved & published live!');
  };

  const handleSaveTagline = async (newTagline?: string) => {
    const val = newTagline !== undefined ? newTagline : promoTaglineInput;
    setPromoTaglineInput(val);
    localStorage.setItem('adamjee_promo_tagline', val);
    window.dispatchEvent(new CustomEvent('adamjee_tagline_update', { detail: val }));
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ promoTagline: val })
      });
    } catch {}
    showToast('Top promo tagline updated and published live!');
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim()) return;
    const token = localStorage.getItem('token');
    const targetId = editingBlog?._id || editingBlog?.id;
    let savedItem: any = {
      _id: targetId || `blog-${Date.now()}`,
      id: targetId || `blog-${Date.now()}`,
      title: blogTitle,
      content: blogContent,
      category: blogCategory,
      image: blogImage,
      excerpt: blogExcerpt,
      isPublished: blogIsPublished,
      publishedAt: editingBlog?.publishedAt || new Date().toISOString()
    };
    
    try {
      let res;
      if (targetId) {
        res = await fetch(`/api/blogs/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(savedItem)
        });
      } else {
        res = await fetch('/api/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(savedItem)
        });
      }
      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.blog) savedItem = data.blog;
      }
    } catch (err) {
      console.error('Error saving blog to API:', err);
    }

    showToast(`Blog post "${savedItem.title}" saved successfully!`);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('adamjee_new_blog'));
    }
    setShowBlogForm(false);
    setEditingBlog(null);
    setBlogTitle(''); setBlogContent(''); setBlogImage(''); setBlogExcerpt('');
    loadData(token || '');
  };

  const handleDeleteBlog = async (id: string) => {
    if (window.confirm('Delete this blog post?')) {
      const token = localStorage.getItem('token');
      await fetch(`/api/blogs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('adamjee_new_blog'));
      }
      loadData(token!);
    }
  };

  /* ─── DISCOUNTS HANDLERS ────────────────────── */
  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountCode.trim()) return;
    const token = localStorage.getItem('token');
    const discountData: any = {
      code: discountCode.toUpperCase(),
      type: discountType,
      value: discountType === 'free_shipping' ? 0 : Number(discountValue),
      minRequirement: Number(discountMinReq),
      usageLimit: discountUsageLimit ? Number(discountUsageLimit) : null,
      isActive: true
    };
    if (discountStartDate) discountData.startsAt = new Date(discountStartDate).toISOString();
    if (discountEndDate) discountData.endsAt = new Date(discountEndDate).toISOString();

    const resetForm = () => {
      setShowDiscountForm(false);
      setEditingDiscount(null);
      setDiscountCode(''); setDiscountType('percentage'); setDiscountValue(10);
      setDiscountMinReq(0); setDiscountUsageLimit('');
      setDiscountStartDate(''); setDiscountEndDate('');
    };

    try {
      let res;
      const discId = editingDiscount?._id || editingDiscount?.id;
      if (discId) {
        res = await fetch(`/api/discounts/${discId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(discountData)
        });
      } else {
        res = await fetch('/api/discounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(discountData)
        });
      }
      if (res.ok) {
        resetForm();
        loadData(token!);
        showToast(discId ? 'Discount updated successfully!' : 'Discount created successfully!');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to save discount');
      }
    } catch (err) {
      console.error('Error saving discount:', err);
      alert('Error saving discount. Please try again.');
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    if (window.confirm('Delete this discount code?')) {
      const token = localStorage.getItem('token');
      await fetch(`/api/discounts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      loadData(token!);
    }
  };

  const handleToggleDiscountActive = async (disc: any) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/discounts/${disc._id || disc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !disc.isActive })
    });
    loadData(token!);
  };

  /* ─── SHOPIFY-STYLE ORDER BUILDER ─────────────── */
  const handleSaveCreateOrder = async (status: 'draft' | 'pending' | 'paid') => {
    if (!coCustomerName.trim()) { alert('Please enter customer name'); return; }
    if (coItems.length === 0 || coItems.some(i => !i.productId)) { alert('Please add products'); return; }

    const subtotal = coItems.reduce((sum, item) => {
      const prod = products.find(p => p._id === item.productId || p.id === item.productId);
      return sum + (prod ? prod.price : 0) * item.quantity;
    }, 0);
    const discountAmount = coDiscountType === 'fixed' ? coDiscountVal : (subtotal * coDiscountVal) / 100;
    const taxedAmount = subtotal - discountAmount;
    const taxAmount = (taxedAmount * coTaxRate) / 100;
    const total = taxedAmount + taxAmount + coShippingCost;

    const orderData = {
      items: coItems.map(item => {
        const prod = products.find(p => p._id === item.productId || p.id === item.productId);
        return {
          product: item.productId,
          name: prod ? prod.name : 'Product',
          price: prod ? prod.price : 0,
          quantity: item.quantity
        };
      }),
      shippingAddress: {
        fullName: coCustomerName,
        address: coCustomerAddress || 'Walk-in Store Order',
        city: 'Karachi',
        country: 'Pakistan',
        phone: coCustomerPhone
      },
      paymentMethod: coPaymentMethod,
      subtotal,
      shippingCost: coShippingCost,
      discount: discountAmount,
      total,
      notes: coNotes,
      guestEmail: coCustomerEmail || 'guest@adamjee.com',
      orderStatus: status,
      paymentStatus: status === 'paid' ? 'paid' : 'pending'
    };

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        setShowCreateOrderView(false);
        setCoCustomerName(''); setCoCustomerEmail(''); setCoCustomerPhone(''); setCoCustomerAddress('');
        setCoItems([{ productId: '', quantity: 1, price: 0 }]); setCoDiscountVal(0); setCoNotes('');
        loadData(token!);
        alert('Order generated successfully!');
      } else {
        alert('Failed to place order');
      }
    } catch {
      alert('Error creating order');
    }
  };

  const handleProductSort = (field: string) => {
    if (productSortField === field) {
      setProductSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setProductSortField(field);
      setProductSortDir('asc');
    }
  };

  const activeStoreSettings = showPrintInvoice?._storeSettings || storeSettings;

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F7F7F9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#5B32F0] border-t-transparent rounded-full animate-spin" />
          <p className="text-[15px] text-[#6E6E78] font-semibold">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F7F7F9] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full border border-[#E8E8EC]">
          <div className="flex items-center justify-center mx-auto mb-6">
            <div className="bg-[#5B32F0] p-3 rounded-full flex items-center justify-center text-white">
              <ShoppingBag className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-[#16161A] mb-1 text-center">Adamjee Computers</h2>
          <p className="text-[14px] text-[#6E6E78] mb-6 text-center">Admin Portal — Use your admin credentials to login</p>
          {loginError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-[14px] font-bold rounded-[10px] border border-red-100">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[14px] font-bold text-[#16161A] mb-1.5">Email address</label>
              <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required
                disabled={loginLoading}
                className="w-full px-3 py-2 bg-white border border-[#E8E8EC] rounded-[10px] text-[15px] focus:outline-none focus:border-[#5B32F0] disabled:opacity-60"
                placeholder="admin@admin.gmail.com" />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-[#16161A] mb-1.5">Password</label>
              <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required
                disabled={loginLoading}
                className="w-full px-3 py-2 bg-white border border-[#E8E8EC] rounded-[10px] text-[15px] focus:outline-none focus:border-[#5B32F0] disabled:opacity-60"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loginLoading}
              className="w-full py-2 bg-[#5B32F0] text-white rounded-[10px] text-[15px] font-semibold hover:bg-[#4A25CE] transition-colors mt-6 disabled:opacity-70 flex items-center justify-center gap-2">
              {loginLoading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />Logging in…</>
              ) : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-scope h-screen overflow-hidden bg-[#F1F1F3] text-[#16161A] antialiased" onClick={() => { setShowNotifications(false); setShowStoreDropdown(false); }}>
      {/* ─── APP FRAME ─── */}
      <div className="h-full lg:p-6">
        <div className="bg-white lg:rounded-[22px] lg:border lg:border-[#E4E4E9] lg:shadow-[0_1px_3px_rgba(16,16,26,0.06)] overflow-hidden flex h-full">

          {/* ─── MOBILE SIDEBAR BACKDROP ─── */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* ─── SIDEBAR ─── */}
          <aside
            style={(() => { const w = sidebarOpen ? 280 : railMode ? 76 : 280; return { width: w, minWidth: w, maxWidth: w }; })()}
            className={`bg-white border-r border-[#E8E8EC] flex flex-col flex-shrink-0 select-none
            fixed lg:static top-0 left-0 h-full lg:h-auto z-40 transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

            {/* Brand */}
            <div className={`h-[86px] flex items-center flex-shrink-0 ${railMode ? 'justify-center px-0' : 'gap-3 px-6'}`}>
              <div className="w-11 h-11 rounded-xl bg-[#16161A] flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-[22px] h-[22px] text-[#D8F34E]" strokeWidth={2.2} />
              </div>
              {!railMode && (
                <>
                  <div className="min-w-0">
                    <p className="font-bold text-[19px] tracking-[-0.01em] text-[#16161A] truncate leading-tight">Adamjee</p>
                    <p className="text-[13px] text-[#9A9AA5] truncate leading-tight">Computers</p>
                  </div>
                  <button className="lg:hidden ml-auto text-[#6E6E78]" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
                    <X className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Navigation */}
            <nav className={`flex-1 overflow-y-auto pb-4 ${railMode ? 'px-3' : 'px-4'}`}>
              {ADMIN_NAV.map((group, gIdx) => (
                <div key={gIdx} className={gIdx === 0 ? '' : 'mt-7'}>
                  {railMode ? (
                    gIdx > 0 && <div className="mx-3 mb-2 border-t border-[#F0F0F3]" />
                  ) : (
                    <p className="px-3 mb-2 text-[13px] font-semibold tracking-[0.09em] uppercase text-[#9A9AA5]">
                      {group.title}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const isParentActive = item.subItems
                        ? item.subItems.some(s => activeTab === s.id)
                        : activeTab === item.id;
                      const isExpanded = item.subItems ? (expandedMenus[item.id] ?? isParentActive) : false;
                      const badge = item.id === 'orders'
                        ? orders.filter(o => o.orderStatus === 'pending').length
                        : item.id === 'inbox'
                          ? messages.filter(m => !m.read).length
                          : 0;

                      return (
                        <div key={item.id}>
                          <button
                            onClick={() => {
                              if (item.subItems) {
                                setExpandedMenus(prev => ({ ...prev, [item.id]: !isExpanded }));
                                setActiveTab(item.subItems[0].id);
                              } else {
                                setActiveTab(item.id);
                              }
                              setShowCreateOrderView(false);
                              setSidebarOpen(false);
                            }}
                            title={railMode ? item.label : undefined}
                            className={`w-full flex items-center h-11 rounded-[12px] text-[15.5px] transition-all duration-200 ease-out active:scale-[0.98] cursor-pointer text-left relative
                              ${railMode ? 'justify-center px-0' : 'gap-3 px-3'}
                              ${isParentActive
                                ? 'bg-[#F4F4F6] text-[#16161A] font-semibold'
                                : 'text-[#4A4A55] font-medium hover:bg-[#F7F7F9]'}`}
                          >
                            <item.icon className={`w-[19px] h-[19px] flex-shrink-0 ${isParentActive ? 'text-[#5B32F0]' : 'text-[#6E6E78]'}`} strokeWidth={1.9} />
                            {!railMode && <span className="flex-1 truncate">{item.label}</span>}
                            {badge > 0 && (
                              railMode ? (
                                <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-[#5B32F0] border-2 border-white" />
                              ) : (
                                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#5B32F0] text-white text-[13px] font-bold inline-flex items-center justify-center">
                                  {badge}
                                </span>
                              )
                            )}
                            {item.subItems && !railMode && (
                              <ChevronDown className={`w-4 h-4 text-[#9A9AA5] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} strokeWidth={2.2} />
                            )}
                          </button>

                          {item.subItems && isExpanded && !railMode && (
                            <div className="relative mt-0.5 mb-1 pl-[26px]">
                              {/* guide rail, as in the reference */}
                              <span className="absolute left-[15px] top-1 bottom-1 w-px bg-[#E4E4E9]" />
                              <div className="space-y-0.5">
                                {item.subItems.map(sub => {
                                  const subActive = activeTab === sub.id;
                                  return (
                                    <button
                                      key={sub.id}
                                      onClick={() => { setActiveTab(sub.id); setShowCreateOrderView(false); setSidebarOpen(false); }}
                                      className={`w-full text-left h-10 px-3.5 rounded-[10px] text-[15px] transition-all duration-200 ease-out cursor-pointer
                                        ${subActive
                                          ? 'bg-white text-[#16161A] font-semibold border border-[#E4E4E9] shadow-[0_1px_2px_rgba(16,16,26,0.05)]'
                                          : 'text-[#6E6E78] font-medium hover:text-[#16161A] hover:bg-[#F7F7F9] border border-transparent'}`}
                                    >
                                      {sub.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Account */}
            <div className={`flex-shrink-0 ${railMode ? 'p-3' : 'p-4'}`}>
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowStoreDropdown(prev => !prev); setShowNotifications(false); }}
                  title={railMode ? (adminName || 'Admin') : undefined}
                  className={`w-full flex items-center rounded-xl hover:bg-[#F7F7F9] transition-all duration-200 cursor-pointer text-left ${railMode ? 'justify-center p-1' : 'gap-3 p-2'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#5B32F0] text-white font-bold text-[15px] flex items-center justify-center flex-shrink-0">
                    {(adminName || 'A').charAt(0).toUpperCase()}
                  </div>
                  {!railMode && (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[15px] text-[#16161A] truncate leading-tight">{adminName || 'Admin'}</p>
                        <p className="text-[13px] text-[#9A9AA5] truncate leading-tight">Administrator</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[#9A9AA5] transition-transform ${showStoreDropdown ? 'rotate-180' : ''}`} strokeWidth={2.2} />
                    </>
                  )}
                </button>

                {showStoreDropdown && (
                  <div className={`absolute bottom-full mb-2 bg-white rounded-xl border border-[#E4E4E9] shadow-[0_8px_28px_rgba(16,16,26,0.12)] overflow-hidden z-50 ${railMode ? 'left-0 w-56' : 'left-0 right-0'}`}>
                    <div className="px-4 py-3 border-b border-[#F0F0F3]">
                      <p className="font-semibold text-[15px] text-[#16161A]">Adamjee Computers</p>
                      <p className="text-[13px] text-[#9A9AA5] truncate">{adminEmail || 'admin@adamjee.com'}</p>
                    </div>
                    <div className="p-1.5">
                      <button onClick={() => { setActiveTab('settings'); setShowStoreDropdown(false); }} className="w-full text-left px-3 py-2 text-[15px] font-medium text-[#4A4A55] hover:bg-[#F7F7F9] rounded-xl flex items-center gap-2.5 cursor-pointer">
                        <Settings className="w-4 h-4 text-[#6E6E78]" /> Settings
                      </button>
                      <a href="/" target="_blank" rel="noreferrer" className="w-full text-left px-3 py-2 text-[15px] font-medium text-[#4A4A55] hover:bg-[#F7F7F9] rounded-xl flex items-center gap-2.5">
                        <Globe className="w-4 h-4 text-[#6E6E78]" /> View online store
                      </a>
                      <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-[15px] font-medium text-[#DC2626] hover:bg-[#FDF2F3] rounded-xl flex items-center gap-2.5 cursor-pointer">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ─── MAIN COLUMN ─── */}
          <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-[#F6F6F7]">

            {/* Top bar */}
            <header className="h-[92px] flex items-center gap-3 px-6 lg:px-8 bg-white border-b border-[#E8E8EC] flex-shrink-0">
              {/* Collapse / expand the nav rail (desktop) */}
              <button
                className="hidden lg:flex w-11 h-11 items-center justify-center rounded-[12px] border border-[#E8E8EC] bg-white hover:bg-[#F7F7F9] hover:border-[#DCDCE3] text-[#16161A] flex-shrink-0 transition-all duration-200 active:scale-95 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); setRailOverride(!railMode); }}
                title={railMode ? 'Expand menu' : 'Collapse menu'}
                aria-label={railMode ? 'Expand menu' : 'Collapse menu'}
              >
                {railMode ? <PanelLeftOpen className="w-[18px] h-[18px]" strokeWidth={1.9} /> : <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.9} />}
              </button>

              <button
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-[10px] border border-[#E8E8EC] text-[#16161A] flex-shrink-0"
                onClick={(e) => { e.stopPropagation(); setSidebarOpen(prev => !prev); }}
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#16161A] whitespace-nowrap mr-1 hidden sm:block">
                {PAGE_TITLES[activeTab] || 'Dashboard'}
              </h1>

              {/* Global search */}
              <div className="relative w-full max-w-[345px]" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  placeholder="Search"
                  value={topSearchQuery}
                  onChange={(e) => setTopSearchQuery(e.target.value)}
                  className="w-full h-10 pl-4 pr-10 rounded-[10px] border border-[#E8E8EC] bg-white text-[15px] text-[#16161A]
                             placeholder:text-[#9A9AA5] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition"
                />
                <Search className="w-[17px] h-[17px] text-[#6E6E78] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                {topSearchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_8px_28px_rgba(16,16,26,0.12)] border border-[#E4E4E9] max-h-80 overflow-y-auto z-[100] text-left">
                    {(() => {
                      const query = topSearchQuery.toLowerCase();
                      const matchedProducts = products.filter(p => p.name?.toLowerCase().includes(query) || p.category?.toLowerCase().includes(query));
                      const matchedOrders = orders.filter(o => o.orderId?.toLowerCase().includes(query));

                      if (!matchedProducts.length && !matchedOrders.length) {
                        return <div className="p-5 text-[15px] text-[#6E6E78] text-center">No results for “{topSearchQuery}”</div>;
                      }

                      return (
                        <div className="p-2">
                          {matchedProducts.length > 0 && (
                            <>
                              <p className="px-3 py-1.5 text-[13px] font-semibold text-[#9A9AA5] uppercase tracking-wider">Products</p>
                              {matchedProducts.slice(0, 5).map(p => (
                                <button key={p._id || p.id} onClick={() => { setSelectedProductDetail(p); setActiveTab('products-list'); setTopSearchQuery(''); }}
                                  className="w-full text-left px-3 py-2 text-[15px] text-[#16161A] hover:bg-[#F7F7F9] rounded-xl flex items-center gap-2.5 cursor-pointer">
                                  <img src={getProductImage(p)} alt="" className="w-7 h-7 object-cover rounded-[10px] border border-[#EDEDF0]" />
                                  <span className="truncate">{p.name}</span>
                                </button>
                              ))}
                            </>
                          )}
                          {matchedOrders.length > 0 && (
                            <>
                              <p className="px-3 py-1.5 mt-1 text-[13px] font-semibold text-[#9A9AA5] uppercase tracking-wider">Orders</p>
                              {matchedOrders.slice(0, 5).map(o => (
                                <button key={o._id || o.orderId} onClick={() => { setSelectedOrderDetail(o); setActiveTab('orders-list'); setTopSearchQuery(''); }}
                                  className="w-full text-left px-3 py-2 text-[15px] text-[#16161A] hover:bg-[#F7F7F9] rounded-xl cursor-pointer">
                                  {o.orderId} — PKR {(o.total || 0).toLocaleString()}
                                </button>
                              ))}
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Right icons */}
              <div className="flex items-center gap-2.5 ml-auto">
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => { setShowNotifications(prev => !prev); setShowStoreDropdown(false); }}
                    className="relative w-11 h-11 rounded-[12px] border border-[#E8E8EC] bg-white hover:bg-[#F7F7F9] hover:border-[#DCDCE3] flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
                    aria-label="Notifications"
                  >
                    <Bell className="w-[18px] h-[18px] text-[#16161A]" strokeWidth={1.9} />
                    {orders.filter(o => o.orderStatus === 'pending').length > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#5B32F0] text-white text-[13px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                        {orders.filter(o => o.orderStatus === 'pending').length}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-[#E4E4E9] shadow-[0_8px_28px_rgba(16,16,26,0.12)] z-50 overflow-hidden text-left">
                      <div className="px-4 py-3 border-b border-[#F0F0F3] font-semibold text-[15px]">
                        Pending orders
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {orders.filter(o => o.orderStatus === 'pending').length === 0 ? (
                          <div className="p-6 text-center text-[15px] text-[#6E6E78]">You're all caught up.</div>
                        ) : (
                          orders.filter(o => o.orderStatus === 'pending').slice(0, 8).map(o => (
                            <button key={o._id || o.orderId} onClick={() => { setSelectedOrderDetail(o); setActiveTab('orders-list'); setShowNotifications(false); }}
                              className="w-full text-left px-4 py-3 hover:bg-[#F7F7F9] border-b border-[#F5F5F7] last:border-0 cursor-pointer">
                              <div className="flex justify-between items-center gap-2">
                                <p className="font-semibold text-[15px] text-[#16161A]">#{o.orderId}</p>
                                <span className="text-[13px] font-semibold bg-[#FEF6DC] text-[#B45309] px-2 py-0.5 rounded-full">NEW</span>
                              </div>
                              <p className="text-[13.5px] text-[#9A9AA5] mt-0.5 truncate">
                                {o.shippingAddress?.fullName || o.guestEmail || 'Guest'} · PKR {(o.total || 0).toLocaleString()}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setActiveTab('inbox')}
                  className="relative w-11 h-11 rounded-[12px] border border-[#E8E8EC] bg-white hover:bg-[#F7F7F9] hover:border-[#DCDCE3] flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
                  aria-label="Inbox"
                >
                  <Mail className="w-[18px] h-[18px] text-[#16161A]" strokeWidth={1.9} />
                  {messages.filter(m => !m.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#5B32F0] text-white text-[13px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                      {messages.filter(m => !m.read).length}
                    </span>
                  )}
                </button>
              </div>
            </header>

            {/* Page body */}
            <main key={activeTab} className="admin-enter flex-1 min-h-0 p-6 lg:p-8 space-y-6 overflow-y-auto overflow-x-hidden">
          {dbStatus === 'unavailable' && (
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-[14px] text-amber-800 shadow-[0_1px_2px_rgba(16,16,26,0.04)] space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>⚠️ Database Unreachable</span>
              </div>
              <p className="leading-relaxed">
                The application could not connect to MongoDB. <strong>The dashboard below is empty because there is no data to show — nothing has been lost.</strong> All reads return empty and every save is rejected until the connection is restored.
              </p>
              <div className="text-[13px] font-semibold text-amber-900 bg-amber-100/50 p-2.5 rounded-[10px] border border-amber-200 mt-2 space-y-1">
                <p><strong>To resolve this:</strong></p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Check that your <code>MONGO_URI</code> (or <code>MONGODB_URI</code>) environment variable is set correctly in Vercel.</li>
                  <li>In MongoDB Atlas, make sure you have allowed access from anywhere (IP address <code>0.0.0.0/0</code> whitelisted in the Network Access tab).</li>
                </ol>
                {dbError && (
                  <div className="mt-2 pt-2 border-t border-amber-200/50 font-mono text-[13px] text-amber-950 break-all select-text">
                    <strong>Error Details:</strong> {dbError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Create Order view trigger screen overrides standard tabs */}
          {showCreateOrderView ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowCreateOrderView(false)}
                    aria-label="Back"
                    className="w-11 h-11 rounded-[12px] border border-[#E8E8EC] bg-white inline-flex items-center justify-center
                               text-[#16161A] hover:bg-[#F7F7F9] hover:border-[#DCDCE3] active:scale-95
                               transition-all duration-200 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" strokeWidth={2.2} />
                  </button>
                  <div>
                    <h2 className="text-[21px] font-bold text-[#16161A] tracking-[-0.02em] leading-tight">New order</h2>
                    <p className="text-[13.5px] text-[#9A9AA5] mt-0.5">Build an order on the customer's behalf</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleSaveCreateOrder('draft')} className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[12px] text-[14px] font-semibold bg-white text-[#16161A] border border-[#E8E8EC] hover:bg-[#F7F7F9] hover:border-[#DCDCE3] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(16,16,26,0.08)] active:scale-[0.97] transition-all duration-200 cursor-pointer">Save as draft</button>
                  <button onClick={() => handleSaveCreateOrder('paid')} className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[12px] text-[14px] font-semibold bg-[#5B32F0] text-white hover:bg-[#4A25CE] hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(91,50,240,0.32)] active:scale-[0.97] transition-all duration-200 cursor-pointer">Collect payment</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Products card */}
                  <div className="bg-white p-6 rounded-[20px] border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] space-y-5">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[16px] font-semibold text-[#16161A] tracking-[-0.01em]">Products</h3>
                      <button onClick={() => setCoItems([...coItems, { productId: '', quantity: 1, price: 0 }])} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#5B32F0] hover:text-[#4A25CE] transition-colors duration-200 cursor-pointer">Add custom item</button>
                    </div>
                    
                    <div className="space-y-3">
                      {coItems.map((item, idx) => (
                        <div key={idx} className="flex flex-wrap gap-3 items-center bg-[#FAFAFB] p-4 rounded-2xl border border-[#EDEDF0] transition-colors duration-200 hover:border-[#DCDCE3]">
                          <select
                            value={item.productId}
                            onChange={e => {
                              const val = e.target.value;
                              const prod = products.find(p => p._id === val || p.id === val);
                              const copy = [...coItems];
                              copy[idx] = { productId: val, quantity: item.quantity, price: prod ? prod.price : 0 };
                              setCoItems(copy);
                            }}
                            className="flex-1 h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white"
                          >
                            <option value="">Select product...</option>
                            {products.map(p => (
                              <option key={p._id || p.id} value={p._id || p.id}>{p.name} (PKR {p.price?.toLocaleString()})</option>
                            ))}
                          </select>
                          <div className="w-16">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={e => {
                                const copy = [...coItems];
                                copy[idx].quantity = +e.target.value;
                                setCoItems(copy);
                              }}
                              className="w-full text-center px-2 py-1 border border-[#E8E8EC] rounded-[10px] text-[14px]"
                            />
                          </div>
                          <span className="text-[14px] font-bold text-[#16161A] min-w-24 text-right">PKR {(item.price * item.quantity).toLocaleString()}</span>
                          <button
                            onClick={() => {
                              setCoItems(coItems.filter((_, i) => i !== idx));
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-[10px]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Details Card */}
                  <div className="bg-white p-6 rounded-[20px] border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] space-y-5">
                    <h3 className="text-[16px] font-semibold text-[#16161A] tracking-[-0.01em]">Payment Method</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'cod', label: 'Cash on Delivery (COD)' },
                        { id: 'card', label: 'Credit Card / Safepay' },
                        { id: 'bank', label: 'Bank Transfer' }
                      ].map(p => (
                        <button
                          key={p.id}
                          onClick={() => setCoPaymentMethod(p.id)}
                          className={`p-3 border border-[#E8E8EC] rounded-[10px] text-[14px] font-bold transition-all text-center ${
                            coPaymentMethod === p.id 
                              ? 'border-[#5B32F0] bg-[#F1EDFE] text-[#5B32F0]' 
                              : 'border-[#E8E8EC] bg-white text-[#6E6E78] hover:bg-[#F7F7F9]'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-white p-6 rounded-[20px] border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)]">
                    <label className="block text-[14px] font-bold mb-1">Notes</label>
                    <textarea
                      value={coNotes}
                      onChange={e => setCoNotes(e.target.value)}
                      rows={2}
                      className="w-full border border-[#E8E8EC] rounded-[10px] text-[14px] p-2 focus:outline-none focus:border-[#5B32F0] resize-none"
                      placeholder="Add notes for this order..."
                    />
                  </div>
                </div>

                {/* Right Side: Customer search and Totals */}
                <div className="space-y-6">
                  {/* Customer Card */}
                  <div className="bg-white p-6 rounded-[20px] border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] space-y-5">
                    <h3 className="text-[16px] font-semibold text-[#16161A] tracking-[-0.01em]">Customer</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[13px] font-bold text-[#6E6E78] mb-1">Select existing customer profile</label>
                        <select
                          onChange={e => {
                            const val = e.target.value;
                            const matched = users.find(u => u.email === val || u._id === val);
                            if (matched) {
                              setCoCustomerName(matched.name);
                              setCoCustomerEmail(matched.email);
                              setCoCustomerPhone(matched.phone || '');
                              setCoCustomerAddress(matched.addresses?.[0]?.street || '');
                            }
                          }}
                          className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white"
                        >
                          <option value="">-- Choose Customer --</option>
                          {users.map(u => (
                            <option key={u._id} value={u.email}>{u.name} ({u.email})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#6E6E78] mb-0.5">Customer Name</label>
                        <input type="text" value={coCustomerName} onChange={e => setCoCustomerName(e.target.value)} className="w-full border border-[#E8E8EC] rounded-[10px] text-[14px] px-2.5 py-1" />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#6E6E78] mb-0.5">Email</label>
                        <input type="email" value={coCustomerEmail} onChange={e => setCoCustomerEmail(e.target.value)} className="w-full border border-[#E8E8EC] rounded-[10px] text-[14px] px-2.5 py-1" />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#6E6E78] mb-0.5">Phone</label>
                        <input type="text" value={coCustomerPhone} onChange={e => setCoCustomerPhone(e.target.value)} className="w-full border border-[#E8E8EC] rounded-[10px] text-[14px] px-2.5 py-1" />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#6E6E78] mb-0.5">Shipping Address</label>
                        <input type="text" value={coCustomerAddress} onChange={e => setCoCustomerAddress(e.target.value)} className="w-full border border-[#E8E8EC] rounded-[10px] text-[14px] px-2.5 py-1" />
                      </div>
                    </div>
                  </div>

                  {/* Calculations card */}
                  <div className="bg-white p-6 rounded-[20px] border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] space-y-5">
                    <h3 className="text-[16px] font-semibold text-[#16161A] tracking-[-0.01em]">Summary</h3>
                    {(() => {
                      const subtotal = coItems.reduce((sum, item) => {
                        const prod = products.find(p => p._id === item.productId || p.id === item.productId);
                        return sum + (prod ? prod.price : 0) * item.quantity;
                      }, 0);
                      const discAmt = coDiscountType === 'fixed' ? coDiscountVal : (subtotal * coDiscountVal) / 100;
                      const taxAmt = ((subtotal - discAmt) * coTaxRate) / 100;
                      const total = subtotal - discAmt + taxAmt + coShippingCost;
                      return (
                        <div className="text-[14px] space-y-2.5">
                          <div className="flex justify-between text-[#6E6E78]"><span>Subtotal:</span><span>PKR {Math.round(subtotal).toLocaleString()}</span></div>
                          <div className="flex justify-between text-[#6E6E78] items-center">
                            <span>Discount:</span>
                            <div className="flex gap-1">
                              <input type="number" value={coDiscountVal} onChange={e => setCoDiscountVal(+e.target.value)} className="w-16 text-center border border-[#E8E8EC] rounded-[10px] text-[13px]" />
                              <select value={coDiscountType} onChange={e => setCoDiscountType(e.target.value)} className="text-[13px] border border-[#E8E8EC] rounded-[10px] bg-white font-bold">
                                <option value="percentage">%</option>
                                <option value="fixed">Rs.</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex justify-between text-[#6E6E78]"><span>GST Tax ({coTaxRate}%):</span><span>+PKR {Math.round(taxAmt).toLocaleString()}</span></div>
                          <div className="flex justify-between text-[#6E6E78]"><span>Shipping:</span><span>+PKR {Math.round(coShippingCost).toLocaleString()}</span></div>
                          <div className="flex justify-between font-bold text-[15px] text-[#16161A] pt-2 border-t border-[#E8E8EC]"><span>Total:</span><span>PKR {Math.round(total).toLocaleString()}</span></div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ═══ HOME TAB ═══ */}
              {activeTab === 'home' && (
                <div className="space-y-5">

                  {/* ── Greeting ── */}
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em] text-[#16161A]">
                        Welcome back{adminName ? `, ${adminName.split(' ')[0]}` : ''}!
                      </h1>
                      <p className="text-[15px] text-[#6E6E78] mt-1">
                        {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}Here's how the store is doing.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-2 text-[14px] text-[#6E6E78]">
                        <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                        {users.length} customer{users.length === 1 ? '' : 's'}
                      </span>
                      <Btn icon={RefreshCw} onClick={() => loadData(localStorage.getItem('token') || '')}>Refresh</Btn>
                    </div>
                  </div>

                  {/* ── KPI row ── */}
                  <div className="admin-stagger grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    <StatCard
                      label="Revenue today"
                      value={`PKR ${Math.round(dash.revToday).toLocaleString()}`}
                      delta={dash.revDelta}
                      data={dash.revSpark}
                      icon={TrendingUp}
                      accent="#5B32F0"
                    />
                    <StatCard
                      label="Orders today"
                      value={String(dash.ordToday)}
                      delta={dash.ordDelta}
                      data={dash.ordSpark}
                      icon={ShoppingBag}
                      accent="#1D6FD0"
                    />
                    <StatCard
                      label="Average order"
                      value={`PKR ${Math.round(dash.aovToday).toLocaleString()}`}
                      delta={dash.aovDelta}
                      data={dash.aovSpark}
                      icon={BarChart3}
                      accent="#16A34A"
                    />
                    <StatCard
                      label="Products live"
                      value={String(products.length)}
                      data={dash.stockSpark}
                      icon={Package}
                      accent="#D97706"
                      footnote={`${products.filter(p => (p.stock ?? 0) <= 0).length} out of stock`}
                    />
                  </div>

                  {/* ── Sales trend + Top products ── */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <Card className="xl:col-span-2 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div>
                          <p className="text-[16px] font-semibold text-[#16161A]">Sales trend</p>
                          <div className="flex items-center gap-2.5 mt-1.5">
                            <span className="text-[28px] font-bold text-[#16161A] tracking-[-0.02em] tabular-nums">
                              PKR {Math.round(dash.weekTotal).toLocaleString()}
                            </span>
                            <DeltaChip value={dash.weekDelta} suffix="" />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-[13.5px] text-[#6E6E78]">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#C9B8FB]" /> Last week
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#5B32F0]" /> This week
                          </span>
                        </div>
                      </div>

                      {dash.weekTotal === 0 && dash.lastWeek.every(v => v === 0) ? (
                        <EmptyState icon={TrendingUp} title="No paid orders in the last two weeks" description="The trend chart fills in as paid orders come through." />
                      ) : (
                        <GroupedBars
                          labels={dash.labels}
                          seriesA={dash.lastWeek}
                          seriesB={dash.thisWeek}
                          labelA="Last week"
                          labelB="This week"
                          formatValue={n => n >= 1000 ? `${Math.round(n / 1000)}K` : String(Math.round(n))}
                        />
                      )}
                    </Card>

                    <Card className="p-5">
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <p className="text-[16px] font-semibold text-[#16161A]">Top products</p>
                        <span className="text-[13.5px] text-[#9A9AA5]">By revenue</span>
                      </div>

                      {dash.topProducts.length === 0 ? (
                        <EmptyState icon={Package} title="No sales yet" description="Best sellers appear once orders come in." />
                      ) : (
                        <div className="space-y-3">
                          {dash.topProducts.map(tp => (
                            <div key={tp.key} className="flex gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-[#FAFAFB] transition-colors duration-200">
                              <div className="admin-zoom w-14 h-14 rounded-xl bg-[#F4F4F6] border border-[#EDEDF0] flex-shrink-0">
                                {tp.image && <img src={tp.image} alt={tp.name} className="w-full h-full object-cover" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[14.5px] font-semibold text-[#16161A] truncate">{tp.name}</p>
                                <p className="text-[13.5px] text-[#6E6E78] mt-0.5">
                                  PKR {Math.round(tp.revenue).toLocaleString()}
                                  <span className="text-[#C4C4CE]"> · </span>
                                  <span className="text-[#5B32F0] font-medium">{tp.units}</span> sold
                                </p>
                                <p className="text-[13px] text-[#9A9AA5] mb-1.5">Stock: {tp.stock} units</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1"><Meter pct={(tp.revenue / dash.topRevenue) * 100} /></div>
                                  <span className="text-[13px] font-semibold text-[#6E6E78] tabular-nums">
                                    {Math.round((tp.revenue / dash.topRevenue) * 100)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* ── Alerts / status split / recent orders ── */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <Card className="p-5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[16px] font-semibold text-[#16161A]">Inventory alerts</p>
                        <button onClick={() => setActiveTab('inventory')} className="text-[13.5px] font-semibold text-[#5B32F0] hover:underline cursor-pointer">See all</button>
                      </div>
                      <p className="text-[13.5px] text-[#9A9AA5] mb-4">
                        {dash.alerts.length === 0 ? 'Everything is well stocked' : `${dash.alerts.length} item${dash.alerts.length === 1 ? '' : 's'} need attention`}
                      </p>

                      {dash.alerts.length === 0 ? (
                        <EmptyState icon={CheckCircle} title="All good" description="No products are at or below their low-stock threshold." />
                      ) : (
                        <div className="space-y-3.5">
                          {dash.alerts.map((a, i) => {
                            const critical = a._stock <= 0;
                            return (
                              <div key={a._id || a.id || i}>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold">
                                    <span className={`w-2 h-2 rounded-full ${critical ? 'bg-[#DC2626]' : 'bg-[#D97706]'}`} />
                                    <span className={critical ? 'text-[#DC2626]' : 'text-[#D97706]'}>{critical ? 'Critical' : 'Low'}</span>
                                  </span>
                                  <span className="text-[13.5px] text-[#6E6E78]">{a._stock} units left</span>
                                </div>
                                <p className="text-[14.5px] font-medium text-[#16161A] truncate mb-1.5">{a.name}</p>
                                <Meter pct={(a._stock / Math.max(a._threshold, 1)) * 100} tone={critical ? 'red' : 'amber'} />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card>

                    <Card className="p-5">
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <p className="text-[16px] font-semibold text-[#16161A]">Order status</p>
                        <button onClick={() => setActiveTab('orders-list')} className="text-[13.5px] font-semibold text-[#5B32F0] hover:underline cursor-pointer">See all</button>
                      </div>

                      {orders.length === 0 ? (
                        <EmptyState icon={ShoppingBag} title="No orders yet" />
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <Donut
                            segments={dash.statusSegments}
                            centerValue={String(orders.length)}
                            centerLabel="Total orders"
                          />
                          <div className="w-full grid grid-cols-2 gap-x-3 gap-y-1.5">
                            {dash.statusSegments.map(s => (
                              <div key={s.label} className="flex items-center gap-2 min-w-0">
                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                                <span className="text-[13.5px] text-[#6E6E78] capitalize truncate flex-1">{s.label}</span>
                                <span className="text-[13.5px] font-semibold text-[#16161A] tabular-nums">{s.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="flex items-center justify-between gap-2 p-5 pb-3">
                        <p className="text-[16px] font-semibold text-[#16161A]">Recent orders</p>
                        <button onClick={() => setActiveTab('orders-list')} className="text-[13.5px] font-semibold text-[#5B32F0] hover:underline cursor-pointer">See all</button>
                      </div>

                      {dash.recentOrders.length === 0 ? (
                        <EmptyState icon={ShoppingBag} title="No orders yet" />
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr>
                                <th className="bg-[#FAFAFB] h-10 px-5 text-[13.5px] font-semibold text-[#6E6E78] border-y border-[#F0F0F3]">Order</th>
                                <th className="bg-[#FAFAFB] h-10 px-3 text-[13.5px] font-semibold text-[#6E6E78] border-y border-[#F0F0F3]">Total</th>
                                <th className="bg-[#FAFAFB] h-10 px-5 text-[13.5px] font-semibold text-[#6E6E78] border-y border-[#F0F0F3]">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dash.recentOrders.map((o, i) => (
                                <tr key={o._id || o.orderId || i}
                                  onClick={() => setSelectedOrderDetail(o)}
                                  className="hover:bg-[#FAFAFB] transition-colors duration-200 cursor-pointer">
                                  <td className="px-5 py-3 border-b border-[#F5F5F7]">
                                    <p className="text-[14.5px] font-semibold text-[#5B32F0]">{o.orderId}</p>
                                    <p className="text-[13.5px] text-[#9A9AA5]">
                                      {new Date(o.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                    </p>
                                  </td>
                                  <td className="px-3 py-3 border-b border-[#F5F5F7] text-[14px] whitespace-nowrap tabular-nums">
                                    {Math.round(o.total || 0).toLocaleString()}
                                  </td>
                                  <td className="px-5 py-3 border-b border-[#F5F5F7]">
                                    <StatusPill label={o.orderStatus || 'pending'} tone={orderStatusTone(o.orderStatus)} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              )}

              {(activeTab === 'orders' || activeTab === 'orders-list' || activeTab === 'drafts' || activeTab === 'abandoned-checkouts') && (
                <div>
                  <PageHeader
                    actions={
                      <>
                        <Btn icon={RefreshCw} onClick={() => loadData(localStorage.getItem('token') || '')}>Refresh</Btn>
                        <Btn icon={FileText} onClick={() => exportCSV(filteredOrders, `${activeTab}.csv`, [
                          { key: 'orderId', label: 'Order' }, { key: 'shippingAddress.fullName', label: 'Customer' },
                          { key: 'total', label: 'Total' }, { key: 'orderStatus', label: 'Fulfillment' },
                          { key: 'paymentStatus', label: 'Payment' }
                        ])}>Export</Btn>
                        <Btn variant="primary" icon={Plus} onClick={() => setShowCreateOrderView(true)}>New order</Btn>
                      </>
                    }
                  />

                  <Card className="overflow-hidden">
                    {(activeTab === 'orders' || activeTab === 'orders-list') && (
                      <div className="flex gap-1 px-5 pt-4 overflow-x-auto">
                        {['All', 'Unfulfilled', 'Unpaid', 'Open', 'Closed'].map(tab => (
                          <button
                            key={tab}
                            onClick={() => setOrderTabFilter(tab)}
                            className={`h-9 px-4 rounded-[10px] text-[15px] font-semibold whitespace-nowrap transition-all duration-200 ease-out active:scale-95 cursor-pointer ${
                              orderTabFilter === tab
                                ? 'bg-[#F1EDFE] text-[#5B32F0]'
                                : 'text-[#6E6E78] hover:bg-[#F7F7F9] hover:text-[#16161A]'
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="p-6 flex flex-wrap gap-3.5 items-center justify-between border-b border-[#F0F0F3]">
                      <SearchField value={searchQ} onChange={setSearchQ} className="w-full sm:w-[330px]" />
                      <div className="flex flex-wrap items-center gap-2.5">
                        <SelectPill
                          value={orderStatusFilter}
                          onChange={setOrderStatusFilter}
                          options={[
                            { value: 'All', label: 'Status' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'processing', label: 'Processing' },
                            { value: 'shipped', label: 'Shipped' },
                            { value: 'delivered', label: 'Delivered' },
                            { value: 'cancelled', label: 'Cancelled' },
                          ]}
                        />
                        <FilterPill
                          label="Filter"
                          icon={SlidersHorizontal}
                          chevron={false}
                          active={searchQ !== '' || orderStatusFilter !== 'All' || orderTabFilter !== 'All'}
                          onClick={() => { setSearchQ(''); setOrderStatusFilter('All'); setOrderTabFilter('All'); }}
                        />
                      </div>
                    </div>

                    {pagedOrders.length === 0 ? (
                      <EmptyState
                        icon={ShoppingBag}
                        title={orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
                        description={orders.length === 0
                          ? 'Orders placed in your store will appear here.'
                          : 'Try adjusting your search or clearing the filters.'}
                      />
                    ) : (
                      <>
                        <Table>
                          <thead>
                            <tr>
                              <Th width={56}>
                                <Check
                                  aria-label="Select all orders"
                                  checked={pagedOrders.length > 0 && pagedOrders.every(o => selectedOrderIds.includes(o._id || o.orderId))}
                                  onChange={v => setSelectedOrderIds(v ? pagedOrders.map(o => o._id || o.orderId) : [])}
                                />
                              </Th>
                              <Th>Order</Th>
                              <Th>Customer</Th>
                              <Th>Date</Th>
                              <Th>Total</Th>
                              <Th>Payment</Th>
                              <Th>Fulfillment</Th>
                              <Th width={90}>Action</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedOrders.map((o, idx) => {
                              const oid = o._id || o.orderId;
                              return (
                                <Tr key={oid || `ord-row-${idx}`}>
                                  <Td>
                                    <Check
                                      aria-label={`Select order ${o.orderId}`}
                                      checked={selectedOrderIds.includes(oid)}
                                      onChange={v => setSelectedOrderIds(prev => v ? [...prev, oid] : prev.filter(x => x !== oid))}
                                    />
                                  </Td>
                                  <Td>
                                    <button onClick={() => setSelectedOrderDetail(o)} className="font-semibold text-[#5B32F0] hover:underline cursor-pointer inline-flex items-center gap-1.5">
                                      {o.orderStatus === 'abandoned' && <AlertTriangle className="w-4 h-4 text-[#D97706]" />}
                                      {o.orderId}
                                    </button>
                                  </Td>
                                  <Td className="text-[#4A4A55] max-w-[200px] truncate">
                                    {o.shippingAddress?.fullName || o.user?.name || o.guestEmail || 'Guest'}
                                  </Td>
                                  <Td className="text-[#6E6E78] whitespace-nowrap">
                                    {new Date(o.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </Td>
                                  <Td className="whitespace-nowrap">PKR {(o.total || 0).toLocaleString()}</Td>
                                  <Td><StatusPill label={o.paymentStatus || 'pending'} tone={paymentStatusTone(o.paymentStatus)} /></Td>
                                  <Td>
                                    <StatusSelect
                                      value={(o.orderStatus || 'pending').toLowerCase()}
                                      tone={orderStatusTone(o.orderStatus)}
                                      options={[
                                        { value: 'pending', label: 'Pending', tone: 'amber' },
                                        { value: 'processing', label: 'Processing', tone: 'violet' },
                                        { value: 'shipped', label: 'Shipped', tone: 'blue' },
                                        { value: 'delivered', label: 'Delivered', tone: 'green' },
                                        { value: 'cancelled', label: 'Cancelled', tone: 'red' },
                                      ]}
                                      onChange={v => handleUpdateOrderStatus(o.orderId, v)}
                                    />
                                  </Td>
                                  <Td><RowActions onClick={() => setSelectedOrderDetail(o)} /></Td>
                                </Tr>
                              );
                            })}
                          </tbody>
                        </Table>

                        <Pagination
                          page={ordPage}
                          pageCount={ordTotalPages}
                          total={filteredOrders.length}
                          perPage={ordPageSize}
                          onPage={setOrdPage}
                          onPerPage={setOrdPageSize}
                        />
                      </>
                    )}
                  </Card>
                </div>
              )}

              {/* ═══ PRODUCTS TAB ═══ */}
              {(activeTab === 'products-list' || activeTab === 'inventory' || activeTab === 'collections') && (
                <div>
                  <PageHeader
                    actions={activeTab === 'products-list' ? (
                      <>
                        <Btn icon={Download} onClick={handleImportProducts}>Import</Btn>
                        <Btn icon={FileText} onClick={handleExportProducts}>Export</Btn>
                        <Btn variant="primary" icon={Plus} onClick={() => { setEditingProduct(null); setShowProductForm(true); }}>
                          Add Product
                        </Btn>
                      </>
                    ) : undefined}
                  />

                  {activeTab === 'products-list' && (
                    <Card className="overflow-hidden">
                      {/* Toolbar */}
                      <div className="p-6 flex flex-wrap gap-3.5 items-center justify-between border-b border-[#F0F0F3]">
                        <SearchField value={searchQ} onChange={setSearchQ} className="w-full sm:w-[330px]" />
                        <div className="flex flex-wrap items-center gap-2.5">
                          <SelectPill
                            value={productStatusFilter}
                            onChange={setProductStatusFilter}
                            options={[
                              { value: 'All', label: 'Status' },
                              { value: 'active', label: 'Published' },
                              { value: 'draft', label: 'Draft' },
                              { value: 'archived', label: 'Archived' },
                            ]}
                          />
                          <SelectPill
                            value={productCategoryFilter}
                            onChange={setProductCategoryFilter}
                            options={productCategories.map((c: string) => ({ value: c, label: c === 'All' ? 'Category' : c }))}
                          />
                        </div>
                      </div>

                      {pagedProducts.length === 0 ? (
                        <EmptyState
                          icon={Package}
                          title={products.length === 0 ? 'No products yet' : 'No products match your filters'}
                          description={products.length === 0
                            ? 'Add your first product to start selling.'
                            : 'Try adjusting your search or clearing the filters.'}
                          action={products.length === 0
                            ? <Btn variant="primary" icon={Plus} onClick={() => { setEditingProduct(null); setShowProductForm(true); }}>Add Product</Btn>
                            : undefined}
                        />
                      ) : (
                        <>
                          <Table>
                            <thead>
                              <tr>
                                <Th width={56}>
                                  <Check
                                    aria-label="Select all products"
                                    checked={pagedProducts.length > 0 && pagedProducts.every(p => selectedProductIds.includes(p._id || p.id))}
                                    onChange={v => setSelectedProductIds(v ? pagedProducts.map(p => p._id || p.id) : [])}
                                  />
                                </Th>
                                <Th sortable onSort={() => handleProductSort('name')}>Product Name</Th>
                                <Th sortable onSort={() => handleProductSort('category')}>Category</Th>
                                <Th sortable onSort={() => handleProductSort('stock')}>Stock</Th>
                                <Th sortable onSort={() => handleProductSort('price')}>Price</Th>
                                <Th>Status</Th>
                                <Th width={90}>Action</Th>
                              </tr>
                            </thead>
                            <tbody>
                              {pagedProducts.map((p, idx) => {
                                const pid = p._id || p.id;
                                const status = (p.status || 'active').toLowerCase();
                                return (
                                  <Tr key={pid || p.code || `prod-row-${idx}`}>
                                    <Td>
                                      <Check
                                        aria-label={`Select ${p.name}`}
                                        checked={selectedProductIds.includes(pid)}
                                        onChange={v => setSelectedProductIds(prev => v ? [...prev, pid] : prev.filter(x => x !== pid))}
                                      />
                                    </Td>
                                    <Td className="max-w-[280px]">
                                      <button onClick={() => setSelectedProductDetail(p)} className="text-left w-full cursor-pointer">
                                        <EntityCell
                                          image={getProductImage(p)}
                                          fallback={getCategoryFallbackImage(p.category, p.name)}
                                          name={p.name}
                                          sub={p.code}
                                        />
                                      </button>
                                    </Td>
                                    <Td className="text-[#4A4A55]">{p.category || '—'}</Td>
                                    <Td><StockCell stock={p.stock ?? 0} threshold={p.lowStockThreshold || 5} /></Td>
                                    <Td className="whitespace-nowrap">PKR {(p.price || 0).toLocaleString()}</Td>
                                    <Td>
                                      <StatusSelect
                                        value={status}
                                        tone={productStatusTone(status)}
                                        options={[
                                          { value: 'active', label: 'Published', tone: 'green' },
                                          { value: 'draft', label: 'Draft', tone: 'gray' },
                                          { value: 'archived', label: 'Inactive', tone: 'red' },
                                        ]}
                                        onChange={v => handleSetProductStatus(p, v)}
                                      />
                                    </Td>
                                    <Td>
                                      <div className="flex items-center gap-1">
                                        <button onClick={() => { setEditingProduct(p); setShowProductForm(true); }}
                                          className="w-9 h-9 inline-flex items-center justify-center rounded-[10px] text-[#6E6E78] hover:bg-[#F1F1F4] hover:text-[#16161A] transition-colors cursor-pointer" title="Edit">
                                          <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setConfirmDeleteProduct(p)}
                                          className="w-9 h-9 inline-flex items-center justify-center rounded-[10px] text-[#6E6E78] hover:bg-[#FDF2F3] hover:text-[#DC2626] transition-colors cursor-pointer" title="Delete">
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </Td>
                                  </Tr>
                                );
                              })}
                            </tbody>
                          </Table>

                          <Pagination
                            page={prodPage}
                            pageCount={prodTotalPages}
                            total={filteredProducts.length}
                            perPage={prodPageSize}
                            onPage={setProdPage}
                            onPerPage={setProdPageSize}
                          />
                        </>
                      )}

                    </Card>
                  )}

                  {activeTab === 'inventory' && (
                    <div className="flex gap-6 items-start">

                      {/* ── FILTER RAIL ── */}
                      <aside className="hidden lg:block w-[264px] flex-shrink-0 sticky top-0">
                        <Card hover={false} className="p-5 space-y-1 max-h-[calc(100vh/var(--admin-zoom)_-_150px)] overflow-y-auto">
                          {/* Stock status */}
                          <FilterGroup title="Availability" open={invOpenGroups.status} onToggle={() => toggleInvGroup('status')}>
                            {[
                              { id: 'All', label: 'All products', count: products.length },
                              { id: 'in', label: 'In stock', count: products.filter(p => (p.stock ?? 0) > (p.lowStockThreshold || 5)).length },
                              { id: 'low', label: 'Low stock', count: products.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= (p.lowStockThreshold || 5)).length },
                              { id: 'out', label: 'Out of stock', count: products.filter(p => (p.stock ?? 0) <= 0).length },
                            ].map(o => (
                              <FilterRow
                                key={o.id}
                                label={o.label}
                                count={o.count}
                                checked={inventoryFilter === o.id}
                                onChange={() => setInventoryFilter(o.id)}
                              />
                            ))}
                          </FilterGroup>

                          {/* Category */}
                          <FilterGroup title="Category" open={invOpenGroups.category} onToggle={() => toggleInvGroup('category')}>
                            {invCategories.map(c => (
                              <FilterRow
                                key={c.name}
                                label={c.name}
                                count={c.count}
                                checked={invCategoryFilter.includes(c.name)}
                                onChange={() => setInvCategoryFilter(prev =>
                                  prev.includes(c.name) ? prev.filter(x => x !== c.name) : [...prev, c.name]
                                )}
                              />
                            ))}
                            {invCategories.length === 0 && <p className="text-[14px] text-[#9A9AA5] py-1">No categories yet</p>}
                          </FilterGroup>

                          {/* Vendor */}
                          <FilterGroup title="Vendor" open={invOpenGroups.vendor} onToggle={() => toggleInvGroup('vendor')}>
                            {invVendors.map(v => (
                              <FilterRow
                                key={v.name}
                                label={v.name}
                                count={v.count}
                                checked={invVendorFilter.includes(v.name)}
                                onChange={() => setInvVendorFilter(prev =>
                                  prev.includes(v.name) ? prev.filter(x => x !== v.name) : [...prev, v.name]
                                )}
                              />
                            ))}
                            {invVendors.length === 0 && <p className="text-[14px] text-[#9A9AA5] py-1">No vendors yet</p>}
                          </FilterGroup>

                          {/* Price range */}
                          <FilterGroup title="Price Range" open={invOpenGroups.price} onToggle={() => toggleInvGroup('price')}>
                            <div className="pt-1 space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <label className="block text-[13px] text-[#9A9AA5] mb-1">From</label>
                                  <input
                                    type="number"
                                    value={invPriceMin}
                                    onChange={e => setInvPriceMin(e.target.value)}
                                    placeholder="0"
                                    className="w-full h-9 px-2.5 rounded-2xl border border-[#E8E8EC] text-[14px] outline-none focus:border-[#5B32F0] transition"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="block text-[13px] text-[#9A9AA5] mb-1">To</label>
                                  <input
                                    type="number"
                                    value={invPriceMax}
                                    onChange={e => setInvPriceMax(e.target.value)}
                                    placeholder="Any"
                                    className="w-full h-9 px-2.5 rounded-2xl border border-[#E8E8EC] text-[14px] outline-none focus:border-[#5B32F0] transition"
                                  />
                                </div>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={invMaxPrice}
                                step={Math.max(1, Math.round(invMaxPrice / 100))}
                                value={invPriceMax === '' ? invMaxPrice : Number(invPriceMax)}
                                onChange={e => setInvPriceMax(e.target.value)}
                                className="w-full accent-[#5B32F0] cursor-pointer"
                              />
                              <p className="text-[13px] text-[#9A9AA5]">
                                PKR {Number(invPriceMin || 0).toLocaleString()} – {invPriceMax === '' ? 'Any' : `PKR ${Number(invPriceMax).toLocaleString()}`}
                              </p>
                            </div>
                          </FilterGroup>

                          <button
                            onClick={() => {
                              setInventoryFilter('All'); setInvCategoryFilter([]); setInvVendorFilter([]);
                              setInvPriceMin(''); setInvPriceMax(''); setInventorySearch('');
                            }}
                            className="w-full mt-3 h-9 rounded-[10px] border border-[#E8E8EC] text-[14.5px] font-semibold text-[#6E6E78] hover:bg-[#F7F7F9] hover:text-[#16161A] hover:border-[#DCDCE3] transition-all duration-200 active:scale-[0.98] cursor-pointer"
                          >
                            Reset filters
                          </button>
                        </Card>
                      </aside>

                      {/* ── PRODUCT GRID ── */}
                      <div className="flex-1 min-w-0">
                        <Card className="overflow-hidden">
                          <div className="p-6 flex flex-wrap gap-3.5 items-center justify-between border-b border-[#F0F0F3]">
                            <div className="flex gap-1 p-1 rounded-[12px] bg-[#F4F4F6]">
                              {[
                                { id: 'All', label: 'All' },
                                { id: 'in', label: 'In stock' },
                                { id: 'out', label: 'Unavailable' },
                              ].map(t => (
                                <button
                                  key={t.id}
                                  onClick={() => setInventoryFilter(t.id)}
                                  className={`h-8 px-4 rounded-[9px] text-[14.5px] font-semibold transition-all duration-200 ease-out active:scale-95 cursor-pointer ${
                                    inventoryFilter === t.id
                                      ? 'bg-white text-[#16161A] shadow-[0_1px_2px_rgba(16,16,26,0.08)]'
                                      : 'text-[#6E6E78] hover:text-[#16161A]'
                                  }`}
                                >
                                  {t.label}
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-2.5 flex-1 justify-end min-w-[220px]">
                              <SearchField value={inventorySearch} onChange={setInventorySearch} className="flex-1 max-w-[280px]" />
                              <Btn variant="primary" icon={Plus} onClick={() => { setEditingProduct(null); setShowProductForm(true); }}>
                                Add Product
                              </Btn>
                            </div>
                          </div>

                          {pagedInventory.length === 0 ? (
                            <EmptyState
                              icon={Boxes}
                              title={products.length === 0 ? 'Nothing in inventory yet' : 'No products match your filters'}
                              description={products.length === 0
                                ? 'Products you add will be tracked here.'
                                : 'Try clearing the filters on the left.'}
                            />
                          ) : (
                            <>
                              <div className="admin-stagger px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {pagedInventory.map((p, idx) => {
                                  const stock = p.stock ?? 0;
                                  const low = stock > 0 && stock <= (p.lowStockThreshold || 5);
                                  const selected = (inventoryDetailProduct?._id || inventoryDetailProduct?.id) === (p._id || p.id);
                                  return (
                                    <button
                                      key={p._id || p.id || p.code || `inv-${idx}`}
                                      onClick={() => setInventoryDetailProduct(p)}
                                      className={`text-left rounded-2xl border bg-white overflow-hidden transition-all duration-300 ease-out cursor-pointer group hover:-translate-y-1
                                        ${selected
                                          ? 'border-[#5B32F0] ring-2 ring-[#5B32F0]/15'
                                          : 'border-[#E8E8EC] hover:border-[#DCDCE3] hover:shadow-[0_4px_16px_rgba(16,16,26,0.07)]'}`}
                                    >
                                      <div className="admin-zoom relative aspect-[4/3] bg-[#F7F7F9]">
                                        <img
                                          src={getProductImage(p)}
                                          alt={p.name}
                                          onError={e => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(p.category, p.name); }}
                                          className="w-full h-full object-cover"
                                        />
                                        {p.comparePrice > p.price && (
                                          <span className="absolute top-3 left-3 h-6 px-2.5 rounded-full bg-white/95 backdrop-blur text-[13.5px] font-semibold text-[#16161A] inline-flex items-center shadow-[0_1px_2px_rgba(16,16,26,0.04)]">
                                            Discount
                                          </span>
                                        )}
                                        {p.isBestSeller && !(p.comparePrice > p.price) && (
                                          <span className="absolute top-3 left-3 h-6 px-2.5 rounded-full bg-white/95 backdrop-blur text-[13.5px] font-semibold text-[#16161A] inline-flex items-center shadow-[0_1px_2px_rgba(16,16,26,0.04)]">
                                            Popular
                                          </span>
                                        )}
                                        <span
                                          onClick={e => { e.stopPropagation(); setStockAdjustProduct(p); }}
                                          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/95 backdrop-blur inline-flex items-center justify-center text-[#6E6E78] hover:text-[#16161A] shadow-[0_1px_2px_rgba(16,16,26,0.04)]"
                                          title="Adjust stock"
                                        >
                                          <MoreVertical className="w-4 h-4" />
                                        </span>
                                      </div>
                                      <div className="p-4">
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                          <p className="font-semibold text-[15.5px] text-[#16161A] line-clamp-1">{p.name}</p>
                                          <span className={`text-[13.5px] font-semibold whitespace-nowrap ${
                                            stock <= 0 ? 'text-[#DC2626]' : low ? 'text-[#D97706]' : 'text-[#16A34A]'
                                          }`}>
                                            {stock <= 0 ? 'Out of Stock' : low ? `Low Stock (${stock})` : `In Stock (${stock})`}
                                          </span>
                                        </div>
                                        <p className="text-[15px] font-semibold text-[#4A4A55]">PKR {(p.price || 0).toLocaleString()}</p>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              <div className="border-t border-[#F0F0F3]">
                                <Pagination
                                  page={invPageNum}
                                  pageCount={invTotalPages}
                                  total={filteredInventory.length}
                                  perPage={invPageSize}
                                  onPage={setInvPage}
                                  onPerPage={setInvPageSize}
                                />
                              </div>
                            </>
                          )}
                        </Card>
                      </div>

                      {/* ── DETAIL PANEL ── */}
                      <aside className="hidden xl:block w-[352px] flex-shrink-0 sticky top-0">
                        <Card hover={false} className="max-h-[calc(100vh/var(--admin-zoom)_-_150px)] overflow-y-auto">
                          {!inventoryDetailProduct ? (
                            <EmptyState
                              icon={Package}
                              title="Product Detail"
                              description="Select a product to inspect and adjust its stock."
                            />
                          ) : (
                            <div>
                              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                                <p className="font-semibold text-[16px] text-[#16161A]">Product Detail</p>
                                <button
                                  onClick={() => { setEditingProduct(inventoryDetailProduct); setShowProductForm(true); }}
                                  className="w-8 h-8 rounded-xl inline-flex items-center justify-center text-[#6E6E78] hover:bg-[#F1F1F4] hover:text-[#16161A] transition-colors cursor-pointer"
                                  title="Edit product"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="px-5 pb-4">
                                <div className="flex items-start justify-between gap-2 mb-3">
                                  <p className="font-semibold text-[16px] text-[#16161A] leading-snug">{inventoryDetailProduct.name}</p>
                                  {(() => {
                                    const st = inventoryDetailProduct.stock ?? 0;
                                    const lo = st > 0 && st <= (inventoryDetailProduct.lowStockThreshold || 5);
                                    return (
                                      <span className={`text-[13.5px] font-semibold whitespace-nowrap ${st <= 0 ? 'text-[#DC2626]' : lo ? 'text-[#D97706]' : 'text-[#16A34A]'}`}>
                                        {st <= 0 ? 'Out of Stock' : `In Stock (${st})`}
                                      </span>
                                    );
                                  })()}
                                </div>

                                <div className="admin-zoom rounded-2xl bg-[#F7F7F9] border border-[#EDEDF0] aspect-[4/3] mb-4">
                                  <img
                                    src={getProductImage(inventoryDetailProduct)}
                                    alt={inventoryDetailProduct.name}
                                    onError={e => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(inventoryDetailProduct.category, inventoryDetailProduct.name); }}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                {/* Real metrics only */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                  <StatChip icon={Boxes} label="In stock" value={`${inventoryDetailProduct.stock ?? 0}`} />
                                  <StatChip icon={Tag} label="Price" value={`${Math.round(inventoryDetailProduct.price || 0).toLocaleString()}`} />
                                  <StatChip icon={TrendingUp} label="Value" value={`${Math.round((inventoryDetailProduct.stock || 0) * (inventoryDetailProduct.costPerItem || 0)).toLocaleString()}`} />
                                </div>

                                <div className="divide-y divide-[#F0F0F3] border-y border-[#F0F0F3]">
                                  <DetailRow icon={FileText} title="Description" sub="Name, category and copy"
                                    onClick={() => { setEditingProduct(inventoryDetailProduct); setShowProductForm(true); }} />
                                  <DetailRow icon={Boxes} title="Stock & Threshold" sub={`${inventoryDetailProduct.stock ?? 0} units · alert at ${inventoryDetailProduct.lowStockThreshold || 5}`}
                                    onClick={() => setStockAdjustProduct(inventoryDetailProduct)} />
                                  <DetailRow icon={Tag} title="Pricing" sub={`Cost PKR ${(inventoryDetailProduct.costPerItem || 0).toLocaleString()}`}
                                    onClick={() => { setEditingProduct(inventoryDetailProduct); setShowProductForm(true); }} />
                                  <DetailRow icon={Package} title="Product Details" sub={inventoryDetailProduct.code || 'No SKU'}
                                    onClick={() => setSelectedProductDetail(inventoryDetailProduct)} />
                                </div>
                              </div>

                              <div className="px-5 pb-5">
                                <Btn variant="primary" icon={Boxes} className="w-full" onClick={() => setStockAdjustProduct(inventoryDetailProduct)}>
                                  Adjust Stock
                                </Btn>
                              </div>
                            </div>
                          )}
                        </Card>
                      </aside>
                    </div>
                  )}

                  {activeTab === 'collections' && (
                    <div className="space-y-6">
                      <PageHeader
                        actions={
                          <>
                            <SearchField
                              value={collectionSearch}
                              onChange={setCollectionSearch}
                              placeholder="Search collections"
                              className="w-[280px]"
                            />
                            <Btn
                              variant="primary"
                              icon={Plus}
                              onClick={() => {
                                setEditingCollection(null);
                                setNewCollectionName('');
                                setNewCollectionSubtext('Premium Tech Products');
                                setNewCollectionImage('');
                                setNewCollectionDescription('');
                                setShowCreateCollectionModal(true);
                              }}
                            >
                              New collection
                            </Btn>
                          </>
                        }
                      />

                      {(() => {
                        const q = collectionSearch.trim().toLowerCase();
                        const visible = q
                          ? collections.filter((c: any) => (c.name || '').toLowerCase().includes(q))
                          : collections;

                        if (collections.length === 0) {
                          return (
                            <Card hover={false}>
                              <EmptyState
                                icon={Tag}
                                title="No collections yet"
                                description="Collections group products into the categories shoppers browse on your storefront."
                                action={
                                  <Btn variant="primary" icon={Plus} onClick={() => {
                                    setEditingCollection(null);
                                    setNewCollectionName('');
                                    setNewCollectionSubtext('Premium Tech Products');
                                    setNewCollectionImage('');
                                    setNewCollectionDescription('');
                                    setShowCreateCollectionModal(true);
                                  }}>
                                    New collection
                                  </Btn>
                                }
                              />
                            </Card>
                          );
                        }

                        if (visible.length === 0) {
                          return (
                            <Card hover={false}>
                              <EmptyState icon={Tag} title="No collections match your search" />
                            </Card>
                          );
                        }

                        return (
                          <div className="admin-stagger grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {visible.map((col: any, idx: number) => {
                              const inCollection = products.filter(
                                p => p.category?.toLowerCase() === col.name?.toLowerCase()
                              );
                              const count = inCollection.length;
                              const stock = inCollection.reduce((s, p) => s + (p.stock ?? 0), 0);
                              const value = inCollection.reduce((s, p) => s + (Number(p.price) || 0) * (p.stock ?? 0), 0);
                              const isExpanded = expandedCollection === col.name;
                              const cover = col.image || (inCollection[0] ? getProductImage(inCollection[0]) : '');

                              return (
                                <Card key={col._id || col.name || `col-${idx}`} className="overflow-hidden flex flex-col">
                                  {/* Cover */}
                                  <div className="admin-zoom relative aspect-[16/9] bg-[#F4F4F6]">
                                    {cover ? (
                                      <img
                                        src={cover}
                                        alt={col.name}
                                        className="w-full h-full object-cover"
                                        onError={e => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Tag className="w-8 h-8 text-[#C4C4CE]" strokeWidth={1.6} />
                                      </div>
                                    )}
                                    <span className="absolute top-3 left-3 h-7 px-3 rounded-full bg-white/95 backdrop-blur
                                                     text-[13px] font-semibold text-[#16161A] inline-flex items-center shadow-[0_1px_2px_rgba(16,16,26,0.04)]">
                                      {count} {count === 1 ? 'product' : 'products'}
                                    </span>
                                  </div>

                                  {/* Body */}
                                  <div className="p-5 flex-1 flex flex-col">
                                    <p className="text-[16px] font-semibold text-[#16161A] truncate">{col.name}</p>
                                    <p className="text-[13.5px] text-[#9A9AA5] truncate mt-0.5">
                                      {col.subtext || 'Premium Tech Products'}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                      <div className="rounded-xl bg-[#FAFAFB] border border-[#EDEDF0] px-3 py-2.5">
                                        <p className="text-[13px] text-[#9A9AA5]">Units in stock</p>
                                        <p className="text-[16px] font-bold text-[#16161A] tabular-nums">{stock}</p>
                                      </div>
                                      <div className="rounded-xl bg-[#FAFAFB] border border-[#EDEDF0] px-3 py-2.5">
                                        <p className="text-[13px] text-[#9A9AA5]">Retail value</p>
                                        <p className="text-[16px] font-bold text-[#16161A] tabular-nums truncate">
                                          {Math.round(value).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>


                                    {isExpanded && (
                                      <div className="mt-4 rounded-xl border border-[#EDEDF0] divide-y divide-[#F5F5F7] max-h-52 overflow-y-auto">
                                        {count === 0 ? (
                                          <p className="px-4 py-4 text-[13.5px] text-[#9A9AA5] text-center">
                                            No products in this collection yet.
                                          </p>
                                        ) : (
                                          inCollection.map(p => (
                                            <button
                                              key={p._id || p.id}
                                              onClick={() => setSelectedProductDetail(p)}
                                              className="w-full px-4 py-2.5 flex items-center justify-between gap-3 text-left
                                                         hover:bg-[#FAFAFB] transition-colors duration-150 cursor-pointer"
                                            >
                                              <span className="text-[13.5px] text-[#16161A] truncate">{p.name}</span>
                                              <span className="text-[13.5px] text-[#6E6E78] tabular-nums whitespace-nowrap">
                                                PKR {Math.round(p.price || 0).toLocaleString()}
                                              </span>
                                            </button>
                                          ))
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Actions */}
                                  <div className="px-5 py-4 border-t border-[#F0F0F3] flex items-center justify-between gap-2">
                                    <button
                                      onClick={() => setExpandedCollection(isExpanded ? null : col.name)}
                                      className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#5B32F0]
                                                 hover:underline cursor-pointer"
                                    >
                                      {isExpanded ? 'Hide products' : 'View products'}
                                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>

                                    <div className="flex items-center gap-1">
                                      <button
                                        title="Edit"
                                        onClick={() => {
                                          setEditingCollection(col);
                                          setNewCollectionName(col.name);
                                          setNewCollectionSubtext(col.subtext || 'Premium Tech Products');
                                          setNewCollectionImage(col.image || '');
                                          setNewCollectionDescription(col.description || '');
                                          setShowCreateCollectionModal(true);
                                        }}
                                        className="w-9 h-9 inline-flex items-center justify-center rounded-[10px] text-[#6E6E78]
                                                   hover:bg-[#F1F1F4] hover:text-[#16161A] transition-all duration-200 cursor-pointer"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </button>
                                      <button
                                        title="Delete"
                                        onClick={() => setConfirmDeleteCollection(col)}
                                        className="w-9 h-9 inline-flex items-center justify-center rounded-[10px] text-[#6E6E78]
                                                   hover:bg-[#FDF2F3] hover:text-[#DC2626] transition-all duration-200 cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}


              {/* ═══ CUSTOMERS TAB ═══ */}
              {activeTab === 'customers' && (
                <div>
                  <PageHeader
                    actions={
                      <>
                        <SearchField value={customerSearch} onChange={setCustomerSearch} className="w-[280px]" />
                        <Btn icon={FileText} onClick={() => exportCSV(users, 'customers.csv', [
                          { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' },
                        ])}>Export</Btn>
                      </>
                    }
                  />

                  <Card className="overflow-hidden">
                    {pagedUsers.length === 0 ? (
                      <EmptyState
                        icon={Users}
                        title={users.length === 0 ? 'No customers yet' : 'No customers match your search'}
                        description={users.length === 0 ? 'Registered customers will appear here.' : undefined}
                      />
                    ) : (
                      <>
                        <Table>
                          <thead>
                            <tr>
                              <Th>Customer</Th>
                              <Th>Email</Th>
                              <Th>Orders</Th>
                              <Th>Total spent</Th>
                              <Th>Segment</Th>
                              <Th width={90}>Action</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedUsers.map((u, idx) => {
                              const spend = customerSpendings[u.email] || { totalSpent: 0, orderCount: 0 };
                              const tone = spend.totalSpent > 100000 ? 'violet' : spend.orderCount > 0 ? 'blue' : 'gray';
                              const label = spend.totalSpent > 100000 ? 'High value' : spend.orderCount > 0 ? 'Returning' : 'Lead';
                              return (
                                <Tr key={u._id || u.id || u.email || `usr-${idx}`}>
                                  <Td className="max-w-[240px]">
                                    <button onClick={() => setSelectedCustomerDetail({ ...u, ...spend })} className="text-left w-full cursor-pointer">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <span className="w-9 h-9 rounded-full bg-[#F1EDFE] text-[#5B32F0] font-semibold text-[14px] flex items-center justify-center flex-shrink-0">
                                          {(u.name || u.email || '?').charAt(0).toUpperCase()}
                                        </span>
                                        <span className="font-medium text-[#16161A] truncate">{u.name || '—'}</span>
                                      </div>
                                    </button>
                                  </Td>
                                  <Td className="text-[#6E6E78] max-w-[240px] truncate">{u.email}</Td>
                                  <Td className="tabular-nums">{spend.orderCount}</Td>
                                  <Td className="whitespace-nowrap">PKR {Math.round(spend.totalSpent).toLocaleString()}</Td>
                                  <Td><StatusPill label={label} tone={tone as any} /></Td>
                                  <Td><RowActions onClick={() => setSelectedCustomerDetail({ ...u, ...spend })} /></Td>
                                </Tr>
                              );
                            })}
                          </tbody>
                        </Table>

                        <Pagination
                          page={usersPage}
                          pageCount={usersTotalPages}
                          total={filteredUsers.length}
                          perPage={usersPageSize}
                          onPage={setUsersPage}
                          onPerPage={setUsersPageSize}
                        />
                      </>
                    )}
                  </Card>
                </div>
              )}

              {/* ═══ CONTENT (BLOGS & PAGES) ═══ */}
              {(activeTab === 'blogs' || activeTab === 'blog' || activeTab === 'pages') && (
                <div>
                  <PageHeader
                    actions={
                      (activeTab === 'blogs' || activeTab === 'blog') ? (
                        <>
                          <SearchField value={blogSearch} onChange={setBlogSearch} placeholder="Search posts" className="w-[260px]" />
                          <Btn
                            variant="primary"
                            icon={Plus}
                            onClick={() => {
                              setEditingBlog(null);
                              setBlogTitle(''); setBlogContent(''); setBlogImage('');
                              setBlogExcerpt(''); setBlogIsPublished(true);
                              setShowBlogForm(true);
                            }}
                          >
                            New post
                          </Btn>
                        </>
                      ) : undefined
                    }
                  />

                  {/* ── Post list ── */}
                  {(activeTab === 'blogs' || activeTab === 'blog') && (() => {
                    const q = blogSearch.trim().toLowerCase();
                    const visible = q
                      ? blogs.filter((b: any) => (b.title || '').toLowerCase().includes(q) || (b.category || '').toLowerCase().includes(q))
                      : blogs;

                    if (visible.length === 0) {
                      return (
                        <Card hover={false}>
                          <EmptyState
                            icon={FileText}
                            title={blogs.length === 0 ? 'No posts yet' : 'No posts match your search'}
                            description={blogs.length === 0 ? 'Write your first article to show it on the storefront blog.' : undefined}
                            action={blogs.length === 0 ? (
                              <Btn variant="primary" icon={Plus} onClick={() => {
                                setEditingBlog(null);
                                setBlogTitle(''); setBlogContent(''); setBlogImage('');
                                setBlogExcerpt(''); setBlogIsPublished(true);
                                setShowBlogForm(true);
                              }}>New post</Btn>
                            ) : undefined}
                          />
                        </Card>
                      );
                    }

                    return (
                      <div className="admin-stagger grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {visible.map((post: any, idx: number) => {
                          const published = post.isPublished !== false;
                          const date = new Date(post.publishedAt || post.createdAt || Date.now());
                          const words = (post.content || '').trim().split(/\s+/).filter(Boolean).length;
                          const readMins = Math.max(1, Math.ceil(words / 200));

                          return (
                            <Card key={post._id || post.id || `blog-${idx}`} className="overflow-hidden flex flex-col">
                              <div className="admin-zoom relative aspect-[16/9] bg-[#F4F4F6]">
                                {post.image ? (
                                  <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                    onError={e => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-[#C4C4CE]" strokeWidth={1.6} />
                                  </div>
                                )}
                                <span className="absolute top-3 left-3">
                                  <StatusPill label={published ? 'Published' : 'Draft'} tone={published ? 'green' : 'gray'} />
                                </span>
                              </div>

                              <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-center gap-2.5 text-[13px] text-[#9A9AA5] mb-2.5">
                                  {post.category && (
                                    <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-[#F1EDFE] text-[#5B32F0] font-semibold">
                                      {post.category}
                                    </span>
                                  )}
                                  <span className="inline-flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> {readMins} min read
                                  </span>
                                </div>

                                <p className="text-[16px] font-semibold text-[#16161A] leading-snug line-clamp-2">
                                  {post.title}
                                </p>
                                <p className="text-[13.5px] text-[#6E6E78] leading-relaxed line-clamp-2 mt-2 flex-1">
                                  {post.excerpt || (post.content || '').slice(0, 120) || 'No summary yet.'}
                                </p>

                                <div className="flex items-center gap-2 mt-4 text-[13px] text-[#9A9AA5]">
                                  <Users className="w-4 h-4" />
                                  <span className="truncate">{post.author || 'Adamjee Team'}</span>
                                  <span className="text-[#DCDCE3]">·</span>
                                  <span className="whitespace-nowrap">
                                    {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>

                              <div className="px-5 py-4 border-t border-[#F0F0F3] flex items-center justify-between gap-2">
                                <a
                                  href={`/blog/${post.slug || post._id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#5B32F0]
                                             hover:text-[#4A25CE] transition-colors duration-200"
                                >
                                  <Eye className="w-4 h-4" /> View
                                </a>
                                <div className="flex items-center gap-1">
                                  <button
                                    title="Edit"
                                    onClick={() => {
                                      setEditingBlog(post);
                                      setBlogTitle(post.title); setBlogContent(post.content);
                                      setBlogCategory(post.category); setBlogExcerpt(post.excerpt || '');
                                      setBlogIsPublished(post.isPublished); setBlogImage(post.image || '');
                                      setShowBlogForm(true);
                                    }}
                                    className="w-9 h-9 inline-flex items-center justify-center rounded-[10px] text-[#6E6E78]
                                               hover:bg-[#F1F1F4] hover:text-[#16161A] transition-all duration-200 cursor-pointer"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    title="Delete"
                                    onClick={() => handleDeleteBlog(post._id)}
                                    className="w-9 h-9 inline-flex items-center justify-center rounded-[10px] text-[#6E6E78]
                                               hover:bg-[#FDF2F3] hover:text-[#DC2626] transition-all duration-200 cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* ── Storefront pages ── */}
                  {activeTab === 'pages' && (
                    <Card className="p-7" hover={false}>
                      <SectionTitle
                        icon={FileText}
                        title="Storefront pages"
                        subtitle="Core templates shipped with the theme."
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {[
                          { label: 'About us', href: '/about' },
                          { label: 'FAQ & help', href: '/faq' },
                          { label: 'Contact', href: '/contact' },
                          { label: 'Build your PC', href: '/build-your-pc' },
                          { label: 'Privacy policy', href: '/privacy-policy' },
                          { label: 'Terms', href: '/terms' },
                        ].map(page => (
                          <a
                            key={page.label}
                            href={page.href}
                            target="_blank"
                            rel="noreferrer"
                            className="group rounded-2xl border border-[#EDEDF0] bg-[#FAFAFB] px-5 py-4 flex items-center justify-between gap-3
                                       hover:border-[#DCDCE3] hover:bg-white hover:shadow-[0_2px_10px_rgba(16,16,26,0.06)]
                                       hover:-translate-y-px transition-all duration-200"
                          >
                            <span className="flex items-center gap-3 min-w-0">
                              <span className="w-9 h-9 rounded-[10px] bg-white border border-[#EDEDF0] text-[#5B32F0]
                                               flex items-center justify-center flex-shrink-0">
                                <Globe className="w-[18px] h-[18px]" strokeWidth={1.9} />
                              </span>
                              <span className="text-[14.5px] font-medium text-[#16161A] truncate">{page.label}</span>
                            </span>
                            <ChevronRight className="w-4 h-4 text-[#C4C4CE] group-hover:text-[#5B32F0] group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* ── Compose / edit ── */}
                  <Modal
                    open={showBlogForm}
                    onClose={() => setShowBlogForm(false)}
                    title={editingBlog?._id ? 'Edit post' : 'New post'}
                    subtitle="Appears on your storefront blog."
                    icon={FileText}
                    size="lg"
                    footer={
                      <>
                        <Btn icon={X} onClick={() => setShowBlogForm(false)}>Cancel</Btn>
                        <Btn variant="primary" icon={CheckCircle} onClick={() => handleSaveBlog({ preventDefault: () => {} } as any)}>
                          {editingBlog?._id ? 'Update' : 'Publish'}
                        </Btn>
                      </>
                    }
                  >
                    <div className="space-y-5">
                      <Field label="Title" required>
                        <input type="text" className={inputCls} value={blogTitle}
                          onChange={e => setBlogTitle(e.target.value)} placeholder="How to build a gaming PC in 2026" />
                      </Field>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Category">
                          <input type="text" className={inputCls} value={blogCategory}
                            onChange={e => setBlogCategory(e.target.value)} placeholder="Guides" />
                        </Field>
                        <Field label="Status">
                          <div className="flex gap-2.5">
                            {[
                              { v: true, l: 'Published' },
                              { v: false, l: 'Draft' },
                            ].map(o => (
                              <button
                                key={String(o.v)}
                                type="button"
                                onClick={() => setBlogIsPublished(o.v)}
                                className={`flex-1 h-11 rounded-[12px] border text-[14px] font-semibold transition-all duration-200
                                            active:scale-[0.97] cursor-pointer
                                  ${blogIsPublished === o.v
                                    ? 'border-[#5B32F0] bg-[#F1EDFE] text-[#5B32F0]'
                                    : 'border-[#E8E8EC] bg-white text-[#4A4A55] hover:bg-[#F7F7F9]'}`}
                              >
                                {o.l}
                              </button>
                            ))}
                          </div>
                        </Field>
                      </div>

                      <Field label="Cover image" hint="Paste a URL or upload a file.">
                        <div className="flex gap-2.5">
                          <input type="url" className={`${inputCls} flex-1`} value={blogImage}
                            onChange={e => setBlogImage(e.target.value)} placeholder="https://…" />
                          <label className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-[12px] text-[14px] font-semibold
                                            bg-white text-[#16161A] border border-[#E8E8EC] hover:bg-[#F7F7F9] hover:border-[#DCDCE3]
                                            hover:-translate-y-px active:scale-[0.97] transition-all duration-200 cursor-pointer flex-shrink-0">
                            <Upload className="w-[17px] h-[17px]" /> Upload
                            <input type="file" accept="image/*" className="hidden"
                              onChange={async e => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try { setBlogImage(await compressImageFile(file)); }
                                catch (err) { console.error('Blog image upload failed:', err); }
                              }}
                            />
                          </label>
                        </div>
                        {blogImage && (
                          <div className="admin-zoom relative mt-3 aspect-[16/9] rounded-2xl border border-[#EDEDF0] bg-[#FAFAFB]">
                            <img src={blogImage} alt="Cover preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setBlogImage('')}
                              aria-label="Remove image"
                              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur text-[#DC2626]
                                         inline-flex items-center justify-center shadow-sm hover:bg-white active:scale-90
                                         transition-all duration-200 cursor-pointer"
                            >
                              <X className="w-4 h-4" strokeWidth={2.2} />
                            </button>
                          </div>
                        )}
                      </Field>

                      <Field label="Excerpt" hint="Shown in listings and previews.">
                        <input type="text" className={inputCls} value={blogExcerpt}
                          onChange={e => setBlogExcerpt(e.target.value)} placeholder="A brief summary…" />
                      </Field>

                      <Field label="Content">
                        <textarea rows={10} className={textareaCls} value={blogContent}
                          onChange={e => setBlogContent(e.target.value)} placeholder="Write your article…" />
                      </Field>
                    </div>
                  </Modal>
                </div>
              )}

              {/* ═══ ANALYTICS TABS ═══ */}
              {activeTab === 'analytics' && (() => {
                const now = new Date();
                const filteredOrders = orders.filter(o => {
                  if (analyticsRange === 'all') return true;
                  const orderDate = new Date(o.createdAt || Date.now());
                  const diffMs = now.getTime() - orderDate.getTime();
                  const diffDays = diffMs / (1000 * 60 * 60 * 24);

                  if (analyticsRange === 'custom') {
                    if (!appliedStartDate && !appliedEndDate) return true;
                    const start = appliedStartDate ? new Date(appliedStartDate) : new Date(0);
                    const end = appliedEndDate ? new Date(appliedEndDate) : new Date();
                    end.setHours(23, 59, 59, 999);
                    return orderDate >= start && orderDate <= end;
                  }
                  if (analyticsRange === 'today') {
                    return orderDate.toDateString() === now.toDateString();
                  }
                  if (analyticsRange === 'yesterday') {
                    const yest = new Date(now);
                    yest.setDate(yest.getDate() - 1);
                    return orderDate.toDateString() === yest.toDateString();
                  }
                  if (analyticsRange === '7days') return diffDays <= 7;
                  if (analyticsRange === '30days') return diffDays <= 30;
                  if (analyticsRange === '3months') return diffDays <= 90;
                  if (analyticsRange === '1year') return diffDays <= 365;
                  return true;
                });

                const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
                const grossSales = filteredOrders.reduce((sum, o) => sum + (o.subtotal || o.total || 0), 0);
                const totalDiscounts = filteredOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
                const totalShipping = filteredOrders.reduce((sum, o) => sum + (o.shippingCost || 0), 0);
                const netSales = grossSales - totalDiscounts;
                const totalOrders = filteredOrders.length;
                const fulfilledOrders = filteredOrders.filter(o => o.fulfillmentStatus === 'fulfilled' || o.orderStatus === 'delivered' || o.orderStatus === 'completed').length;
                
                // Return rate calculation
                const customerOrderCounts = filteredOrders.reduce((acc: any, o) => {
                  const email = o.user?.email || o.guestEmail || '';
                  if (email) acc[email] = (acc[email] || 0) + 1;
                  return acc;
                }, {});
                const totalCustomers = Object.keys(customerOrderCounts).length;
                const repeatCustomers = Object.values(customerOrderCounts).filter((c: any) => c > 1).length;
                const returningCustomerRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;
                const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

                // Build SVG trend chart points dynamically
                const pointsCount = 7;
                const chartData: number[] = Array(pointsCount).fill(0);
                if (filteredOrders.length > 0) {
                  if (analyticsRange === 'today' || analyticsRange === 'yesterday') {
                    filteredOrders.forEach(o => {
                      const hr = new Date(o.createdAt || Date.now()).getHours();
                      const bucket = Math.min(6, Math.floor(hr / 4));
                      chartData[bucket] += (o.total || 0);
                    });
                  } else {
                    const sorted = [...filteredOrders].sort((a, b) => new Date(a.createdAt || Date.now()).getTime() - new Date(b.createdAt || Date.now()).getTime());
                    const minTime = new Date(sorted[0]?.createdAt || Date.now()).getTime();
                    const maxTime = now.getTime();
                    const timeSpan = Math.max(1, maxTime - minTime);
                    filteredOrders.forEach(o => {
                      const t = new Date(o.createdAt || Date.now()).getTime();
                      const ratio = (t - minTime) / timeSpan;
                      const bucket = Math.min(6, Math.floor(ratio * (pointsCount - 1)));
                      chartData[bucket] += (o.total || 0);
                    });
                  }
                }
                const maxVal = Math.max(...chartData, 1);
                const svgPath = chartData.map((val, idx) => {
                  const x = Math.round((idx / (pointsCount - 1)) * 100);
                  const y = Math.round(90 - (val / maxVal) * 80);
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ');

                // Top products sold calculation
                const productSalesMap: Record<string, { name: string; qty: number; total: number }> = {};
                filteredOrders.forEach(o => {
                  o.items?.forEach((item: any) => {
                    const pName = item.name || 'Unknown Product';
                    if (!productSalesMap[pName]) productSalesMap[pName] = { name: pName, qty: 0, total: 0 };
                    productSalesMap[pName].qty += (item.quantity || 1);
                    productSalesMap[pName].total += ((item.price || 0) * (item.quantity || 1));
                  });
                });
                const topProductsSold = Object.values(productSalesMap).sort((a, b) => b.total - a.total).slice(0, 5);

                const timeLabels = analyticsRange === 'today' || analyticsRange === 'yesterday'
                  ? ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM', '11 PM']
                  : ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

                return (
                  <div className="space-y-5 pb-6">

                    {/* Range picker */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <SelectPill
                          value={analyticsRange}
                          onChange={v => setAnalyticsRange(v as any)}
                          options={[
                            { value: 'all', label: 'All time' },
                            { value: 'today', label: 'Today' },
                            { value: 'yesterday', label: 'Yesterday' },
                            { value: '7days', label: 'Last 7 days' },
                            { value: '30days', label: 'Last 30 days' },
                            { value: '3months', label: 'Last 3 months' },
                            { value: '1year', label: 'Last year' },
                            { value: 'custom', label: 'Custom range' },
                          ]}
                        />
                        {analyticsRange === 'custom' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={analyticsStartDate}
                              onChange={e => setAnalyticsStartDate(e.target.value)}
                              className="h-10 px-3 rounded-[10px] border border-[#E8E8EC] bg-white text-[14.5px] text-[#16161A] outline-none focus:border-[#5B32F0] transition-colors"
                            />
                            <span className="text-[14px] text-[#9A9AA5]">to</span>
                            <input
                              type="date"
                              value={analyticsEndDate}
                              onChange={e => setAnalyticsEndDate(e.target.value)}
                              className="h-10 px-3 rounded-[10px] border border-[#E8E8EC] bg-white text-[14.5px] text-[#16161A] outline-none focus:border-[#5B32F0] transition-colors"
                            />
                            <Btn variant="primary" onClick={() => { setAppliedStartDate(analyticsStartDate); setAppliedEndDate(analyticsEndDate); }}>
                              Apply
                            </Btn>
                            {(analyticsStartDate || analyticsEndDate || appliedStartDate || appliedEndDate) && (
                              <Btn onClick={() => { setAnalyticsStartDate(''); setAnalyticsEndDate(''); setAppliedStartDate(''); setAppliedEndDate(''); }}>
                                Reset
                              </Btn>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-[14px] text-[#9A9AA5]">
                        {filteredOrders.length} order{filteredOrders.length === 1 ? '' : 's'} in this period
                      </span>
                    </div>

                    {/* Headline metrics */}
                    <div className="admin-stagger grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                      <StatCard
                        label="Total revenue"
                        value={`PKR ${Math.round(totalRevenue).toLocaleString()}`}
                        data={chartData}
                        icon={TrendingUp}
                        accent="#5B32F0"
                        footnote={`${totalOrders} order${totalOrders === 1 ? '' : 's'}`}
                      />
                      <StatCard
                        label="Net sales"
                        value={`PKR ${Math.round(netSales).toLocaleString()}`}
                        data={chartData}
                        icon={BarChart3}
                        accent="#16A34A"
                        footnote={`PKR ${Math.round(totalDiscounts).toLocaleString()} discounted`}
                      />
                      <StatCard
                        label="Average order"
                        value={`PKR ${avgOrderValue.toLocaleString()}`}
                        data={chartData}
                        icon={ShoppingBag}
                        accent="#1D6FD0"
                        footnote={`${totalCustomers} customer${totalCustomers === 1 ? '' : 's'}`}
                      />
                      <StatCard
                        label="Returning rate"
                        value={`${returningCustomerRate}%`}
                        data={chartData}
                        icon={Users}
                        accent="#D97706"
                        footnote={`${repeatCustomers} repeat buyer${repeatCustomers === 1 ? '' : 's'}`}
                      />
                    </div>

                    {/* Revenue trend + breakdown */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      <Card className="xl:col-span-2 p-6">
                        <SectionTitle
                          icon={TrendingUp}
                          title="Revenue over time"
                          subtitle={analyticsRange === 'today' || analyticsRange === 'yesterday' ? 'By hour' : 'Across the selected period'}
                        />
                        {chartData.every(v => v === 0) ? (
                          <EmptyState icon={TrendingUp} title="No revenue in this period" description="Pick a wider range or wait for new orders." />
                        ) : (
                          <GroupedBars
                            labels={timeLabels}
                            seriesA={chartData.map(() => 0)}
                            seriesB={chartData}
                            labelA=""
                            labelB="Revenue"
                            formatValue={n => n >= 1000 ? `${Math.round(n / 1000)}K` : String(Math.round(n))}
                          />
                        )}
                      </Card>

                      <Card className="p-6">
                        <SectionTitle icon={BarChart3} title="Sales breakdown" subtitle="Where the money went" />
                        <div className="space-y-4">
                          {[
                            { label: 'Gross sales', value: grossSales, tone: 'violet' as const },
                            { label: 'Discounts', value: totalDiscounts, tone: 'red' as const },
                            { label: 'Shipping', value: totalShipping, tone: 'amber' as const },
                            { label: 'Net sales', value: netSales, tone: 'green' as const },
                          ].map(row => (
                            <div key={row.label}>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="text-[14.5px] text-[#6E6E78]">{row.label}</span>
                                <span className="text-[15px] font-semibold text-[#16161A] tabular-nums">
                                  PKR {Math.round(row.value).toLocaleString()}
                                </span>
                              </div>
                              <Meter pct={grossSales > 0 ? (row.value / grossSales) * 100 : 0} tone={row.tone} />
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 pt-5 border-t border-[#F0F0F3] grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[13.5px] text-[#9A9AA5]">Fulfilled</p>
                            <p className="text-[21px] font-bold text-[#16161A] tabular-nums">{fulfilledOrders}</p>
                          </div>
                          <div>
                            <p className="text-[13.5px] text-[#9A9AA5]">Awaiting</p>
                            <p className="text-[21px] font-bold text-[#16161A] tabular-nums">{totalOrders - fulfilledOrders}</p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Best sellers */}
                    <Card className="p-6">
                      <SectionTitle icon={TrendingUp} title="Best sellers" subtitle="Ranked by revenue in this period" />
                      {topProductsSold.length === 0 ? (
                        <EmptyState icon={Package} title="No products sold in this range" />
                      ) : (
                        <div className="space-y-3">
                          {topProductsSold.map((p, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 -mx-3 rounded-xl hover:bg-[#FAFAFB] transition-colors duration-200">
                              <span className="w-8 h-8 rounded-xl bg-[#F1EDFE] text-[#5B32F0] text-[14px] font-bold flex items-center justify-center flex-shrink-0">
                                {i + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-[15px] font-medium text-[#16161A] truncate">{p.name}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <div className="flex-1 max-w-[240px]">
                                    <Meter pct={(p.total / (topProductsSold[0].total || 1)) * 100} />
                                  </div>
                                  <span className="text-[13.5px] text-[#9A9AA5]">{p.qty} sold</span>
                                </div>
                              </div>
                              <span className="text-[15px] font-semibold text-[#16161A] tabular-nums whitespace-nowrap">
                                PKR {Math.round(p.total).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
                );
              })()}

              {/* ═══ DISCOUNTS TAB ═══ */}
              {activeTab === 'discounts' && (
                <div>
                  <PageHeader
                    actions={
                      <>
                        <SearchField value={discountSearch} onChange={setDiscountSearch} placeholder="Search codes" className="w-[260px]" />
                        <Btn
                          variant="primary"
                          icon={Plus}
                          onClick={() => {
                            setEditingDiscount(null);
                            setDiscountCode(''); setDiscountType('percentage'); setDiscountValue(10);
                            setDiscountMinReq(0); setDiscountUsageLimit('');
                            setDiscountStartDate(''); setDiscountEndDate('');
                            setShowDiscountForm(true);
                          }}
                        >
                          New discount
                        </Btn>
                      </>
                    }
                  />

                  {(() => {
                    const q = discountSearch.trim().toLowerCase();
                    const visible = q
                      ? discounts.filter((d: any) => (d.code || '').toLowerCase().includes(q))
                      : discounts;

                    if (visible.length === 0) {
                      return (
                        <Card hover={false}>
                          <EmptyState
                            icon={Percent}
                            title={discounts.length === 0 ? 'No discount codes yet' : 'No codes match your search'}
                            description={discounts.length === 0 ? 'Create a code to run a promotion on your storefront.' : undefined}
                            action={discounts.length === 0 ? (
                              <Btn variant="primary" icon={Plus} onClick={() => {
                                setEditingDiscount(null);
                                setDiscountCode(''); setDiscountType('percentage'); setDiscountValue(10);
                                setDiscountMinReq(0); setDiscountUsageLimit('');
                                setDiscountStartDate(''); setDiscountEndDate('');
                                setShowDiscountForm(true);
                              }}>New discount</Btn>
                            ) : undefined}
                          />
                        </Card>
                      );
                    }

                    return (
                      <Card className="overflow-hidden">
                        <Table>
                          <thead>
                            <tr>
                              <Th>Code</Th>
                              <Th>Type</Th>
                              <Th>Value</Th>
                              <Th>Minimum</Th>
                              <Th>Used</Th>
                              <Th>Status</Th>
                              <Th width={110}>Action</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {visible.map((disc: any, idx: number) => {
                              const discId = disc._id || disc.id;
                              const valueLabel = disc.type === 'free_shipping'
                                ? 'Free shipping'
                                : disc.type === 'percentage'
                                  ? `${disc.value}%`
                                  : `PKR ${Number(disc.value || 0).toLocaleString()}`;
                              const used = disc.usageCount ?? 0;
                              const limit = disc.usageLimit;
                              return (
                                <Tr key={discId || disc.code || `disc-${idx}`}>
                                  <Td>
                                    <span className="inline-flex items-center h-8 px-3 rounded-xl bg-[#F4F4F6]
                                                     font-semibold tracking-wide text-[#16161A]">
                                      {disc.code}
                                    </span>
                                  </Td>
                                  <Td className="text-[#4A4A55] capitalize">{(disc.type || '').replace(/_/g, ' ')}</Td>
                                  <Td className="font-semibold text-[#5B32F0] whitespace-nowrap">{valueLabel}</Td>
                                  <Td className="text-[#6E6E78] whitespace-nowrap">
                                    {disc.minRequirement ? `PKR ${Number(disc.minRequirement).toLocaleString()}` : '—'}
                                  </Td>
                                  <Td>
                                    <div className="min-w-[92px]">
                                      <p className="text-[14px] text-[#16161A] tabular-nums mb-1">
                                        {used}{limit ? ` / ${limit}` : ''}
                                      </p>
                                      {limit ? <Meter pct={(used / limit) * 100} /> : null}
                                    </div>
                                  </Td>
                                  <Td>
                                    <StatusSelect
                                      value={disc.isActive === false ? 'inactive' : 'active'}
                                      tone={disc.isActive === false ? 'gray' : 'green'}
                                      options={[
                                        { value: 'active', label: 'Active', tone: 'green' },
                                        { value: 'inactive', label: 'Inactive', tone: 'gray' },
                                      ]}
                                      onChange={() => handleToggleDiscountActive(disc)}
                                    />
                                  </Td>
                                  <Td>
                                    <div className="flex items-center gap-1">
                                      <button
                                        title="Edit"
                                        onClick={() => {
                                          setEditingDiscount(disc);
                                          setDiscountCode(disc.code);
                                          setDiscountType(disc.type || 'percentage');
                                          setDiscountValue(disc.value ?? 10);
                                          setDiscountMinReq(disc.minRequirement || 0);
                                          setDiscountUsageLimit(disc.usageLimit ? String(disc.usageLimit) : '');
                                          setDiscountStartDate(disc.startsAt ? new Date(disc.startsAt).toISOString().slice(0, 16) : '');
                                          setDiscountEndDate(disc.endsAt ? new Date(disc.endsAt).toISOString().slice(0, 16) : '');
                                          setShowDiscountForm(true);
                                        }}
                                        className="w-9 h-9 inline-flex items-center justify-center rounded-[10px] text-[#6E6E78]
                                                   hover:bg-[#F1F1F4] hover:text-[#16161A] transition-all duration-200 cursor-pointer"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </button>
                                      <button
                                        title="Delete"
                                        onClick={() => handleDeleteDiscount(discId)}
                                        className="w-9 h-9 inline-flex items-center justify-center rounded-[10px] text-[#6E6E78]
                                                   hover:bg-[#FDF2F3] hover:text-[#DC2626] transition-all duration-200 cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </Td>
                                </Tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </Card>
                    );
                  })()}

                  {/* Create / edit discount */}
                  <Modal
                    open={showDiscountForm}
                    onClose={() => {
                      setShowDiscountForm(false);
                      setEditingDiscount(null);
                    }}
                    title={editingDiscount ? 'Edit discount' : 'New discount'}
                    subtitle="Shoppers enter this code at checkout."
                    icon={Percent}
                    size="md"
                    variant="center"
                    footer={
                      <>
                        <Btn icon={X} onClick={() => { setShowDiscountForm(false); setEditingDiscount(null); }}>Cancel</Btn>
                        <Btn variant="primary" icon={CheckCircle} onClick={() => handleSaveDiscount({ preventDefault: () => {} } as any)}>
                          {editingDiscount ? 'Update' : 'Create'}
                        </Btn>
                      </>
                    }
                  >
                    <div className="space-y-5">
                      <Field label="Code" required hint="Shown to customers exactly as typed.">
                        <div className="flex gap-2.5">
                          <input
                            className={`${inputCls} flex-1 uppercase tracking-wide font-semibold`}
                            value={discountCode}
                            onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                            placeholder="SUMMER10"
                          />
                          <Btn
                            onClick={() => {
                              const words = ['GAMER', 'TECH', 'OFFICE', 'SAVE', 'SALE'];
                              setDiscountCode(words[Math.floor(Math.random() * words.length)] + Math.floor(10 + Math.random() * 90));
                            }}
                          >
                            Generate
                          </Btn>
                        </div>
                      </Field>

                      <Field label="Type">
                        <div className="grid grid-cols-3 gap-2.5">
                          {[
                            { v: 'percentage', l: 'Percentage' },
                            { v: 'fixed_amount', l: 'Fixed amount' },
                            { v: 'free_shipping', l: 'Free shipping' },
                          ].map(t => (
                            <button
                              key={t.v}
                              type="button"
                              onClick={() => setDiscountType(t.v)}
                              className={`h-11 rounded-[12px] border text-[14px] font-semibold transition-all duration-200
                                          active:scale-[0.97] cursor-pointer
                                ${discountType === t.v
                                  ? 'border-[#5B32F0] bg-[#F1EDFE] text-[#5B32F0]'
                                  : 'border-[#E8E8EC] bg-white text-[#4A4A55] hover:bg-[#F7F7F9]'}`}
                            >
                              {t.l}
                            </button>
                          ))}
                        </div>
                      </Field>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label={discountType === 'percentage' ? 'Value (%)' : discountType === 'fixed_amount' ? 'Value (PKR)' : 'Value'}>
                          <input
                            type="number"
                            className={inputCls}
                            value={discountValue}
                            onChange={e => setDiscountValue(+e.target.value)}
                            disabled={discountType === 'free_shipping'}
                          />
                        </Field>
                        <Field label="Minimum spend">
                          <input type="number" min={0} className={inputCls} value={discountMinReq}
                            onChange={e => setDiscountMinReq(+e.target.value)} />
                        </Field>
                        <Field label="Usage limit" hint="Blank = unlimited">
                          <input type="number" min={1} className={inputCls} value={discountUsageLimit}
                            onChange={e => setDiscountUsageLimit(e.target.value)} placeholder="Unlimited" />
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Starts">
                          <input type="datetime-local" className={inputCls} value={discountStartDate}
                            onChange={e => setDiscountStartDate(e.target.value)} />
                        </Field>
                        <Field label="Ends">
                          <input type="datetime-local" className={inputCls} value={discountEndDate}
                            min={discountStartDate || undefined}
                            onChange={e => setDiscountEndDate(e.target.value)} />
                        </Field>
                      </div>
                    </div>
                  </Modal>
                </div>
              )}

              {/* ═══ INBOX TAB (Unified Messages & AI Chats) ═══ */}
              {activeTab === 'inbox' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-[#F0F0F3] pb-3 mb-1">
                    <div className="flex gap-2">
                      <button onClick={() => setInboxSubTab('chats')} className={`px-4 py-1.5 rounded-[10px] text-[14px] font-bold border transition-colors ${inboxSubTab === 'chats' ? 'bg-[#F1EDFE] text-[#5B32F0] border-[#5B32F0]/30' : 'bg-white text-[#6E6E78] border-[#E8E8EC]'}`}>AI Live Chats</button>
                      <button onClick={() => setInboxSubTab('contact')} className={`px-4 py-1.5 rounded-[10px] text-[14px] font-bold border transition-colors ${inboxSubTab === 'contact' ? 'bg-[#F1EDFE] text-[#5B32F0] border-[#5B32F0]/30' : 'bg-white text-[#6E6E78] border-[#E8E8EC]'}`}>Messages</button>
                    </div>
                  </div>

                  {inboxSubTab === 'chats' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-2xl border border-[#E8E8EC] min-h-[500px] overflow-hidden shadow-[0_1px_2px_rgba(16,16,26,0.04)]">
                      {/* Left list */}
                      <div className="border-r border-[#E8E8EC] divide-y divide-[#F0F0F3] overflow-y-auto max-h-[550px]">
                        {chatSessions.length === 0 && <div className="p-8 text-center text-[14px] text-[#6E6E78]">No active chat sessions.</div>}
                        {chatSessions.map((sess, idx) => (
                          <div key={sess._id || sess.sessionId || `chat-${idx}`} onClick={() => setSelectedChatSession(sess)} className={`p-4 cursor-pointer hover:bg-[#F7F7F9] transition-all ${selectedChatSession?._id === sess._id ? 'bg-[#e6f7ff]' : ''}`}>

                            <div className="flex justify-between items-start mb-1">
                              <p className="font-bold text-[14px] text-[#16161A] truncate w-32">{sess.user?.name || sess.sessionId.slice(0,8)}</p>
                              <span className="text-[13px] text-[#9A9AA5]">{new Date(sess.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-[13px] text-[#6E6E78] truncate">{sess.messages?.[sess.messages.length - 1]?.content || 'Session started'}</p>
                            {sess.escalatedToHuman && <span className="bg-red-100 text-red-800 border border-red-200 text-[8px] font-black rounded-full px-1.5 py-0.2 mt-1 inline-block">ESCALATED</span>}
                          </div>
                        ))}
                      </div>

                      {/* Chat dialog preview */}
                      <div className="md:col-span-2 flex flex-col justify-between max-h-[550px]">
                        {selectedChatSession ? (
                          <>
                            <div className="p-4 border-b border-[#E8E8EC] bg-[#FAFAFB] flex items-center justify-between">
                              <div>
                                <h3 className="font-bold text-[14px]">Session: {selectedChatSession.sessionId}</h3>
                                <p className="text-[13px] text-[#6E6E78]">{selectedChatSession.user?.email || 'Guest user interaction'}</p>
                              </div>
                              {selectedChatSession.escalatedToHuman && (
                                <span className="bg-red-500 text-white text-[13px] font-bold px-2 py-0.5 rounded-[10px]">Action Required</span>
                              )}
                            </div>
                            
                            <div className="flex-1 p-4 space-y-3 overflow-y-auto text-[14px] chat-scroll max-h-[400px]">
                              {selectedChatSession.messages?.map((m: any, idx: number) => (
                                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`p-2.5 rounded-[10px] max-w-[70%] border ${m.role === 'user' ? 'bg-[#E8E8EC]/40 border-[#E8E8EC]' : 'bg-[#F1EDFE] border-[#E8E8EC]'}`}>
                                    <p className="font-bold text-[13px] text-[#6E6E78] leading-none mb-1">{m.role === 'user' ? 'Customer' : 'AdamBot'}</p>
                                    <p className="whitespace-pre-wrap">{m.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="p-3 border-t border-[#E8E8EC] bg-[#FAFAFB] flex gap-2">
                              <input type="text" placeholder="Type a response to override AI..." className="flex-1 border border-[#E8E8EC] rounded-[10px] text-[14px] px-3 py-1.5 outline-none focus:border-[#5B32F0]" />
                              <button className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[12px] text-[14px] font-semibold bg-[#5B32F0] text-white hover:bg-[#4A25CE] hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(91,50,240,0.32)] active:scale-[0.97] transition-all duration-200 cursor-pointer">Reply</button>
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-[#6E6E78]">
                            <Mail className="w-8 h-8 mb-2" />
                            <p className="text-[14px] font-bold">Select a chat session to review dialogue history</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {inboxSubTab === 'contact' && (
                    <div className="bg-white rounded-2xl border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] overflow-hidden">
                      <div className="divide-y divide-[#F0F0F3]">
                        {messages.length === 0 && <div className="p-8 text-center text-[14px] text-[#6E6E78]">No email inquiries found.</div>}
                        {messages.map((msg, idx) => (
                          <div key={msg._id || msg.id || `msg-${idx}`} className={`p-5 hover:bg-[#FAFAFB] transition-colors ${!msg.read ? 'bg-[#5B32F0]/5' : ''}`}>

                            <div className="flex justify-between items-start mb-1 text-[14px]">
                              <div>
                                <h3 className={`font-bold ${!msg.read ? 'text-[#5B32F0]' : 'text-[#16161A]'}`}>{msg.subject}</h3>
                                <p className="text-[13px] text-[#6E6E78] font-semibold">From: {msg.name} ({msg.email}) {msg.phone && `• Ph: ${msg.phone}`}</p>
                              </div>
                              <span className="text-[13px] text-[#9A9AA5]">{new Date(msg.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-[14px] text-[#4A4A55] whitespace-pre-wrap mt-2">{msg.message}</p>
                            {!msg.read && (
                              <button onClick={() => handleMarkMessageRead(msg._id)} className="mt-3 text-[13px] font-bold text-[#5B32F0] hover:underline">Mark as Read</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══ ONLINE STORE VIEW TAB ═══ */}
              {activeTab === 'online-store' && (
                <div className="bg-white rounded-2xl border border-[#E8E8EC] p-6 shadow-[0_1px_2px_rgba(16,16,26,0.04)] space-y-4">
                  <div className="flex justify-between items-center border-b border-[#F0F0F3] pb-3 mb-1">
                    <h2 className="text-[17px] font-bold text-[#16161A]">Online Store Status</h2>
                    <span className="bg-[#F1EDFE] text-[#5B32F0] text-[14px] font-bold px-3 py-1 rounded-[10px] border border-[#5B32F0]/30">LIVE & PUBLIC</span>
                  </div>
                  <p className="text-[14px] text-[#6E6E78]">Your digital storefront is active at <span className="font-bold text-[#5B32F0]">localhost:3000</span>. Customers can search hardware products, add components to cart, and checkout seamlessly.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-[14px]">
                    <div className="p-4 border border-[#E8E8EC] rounded-xl bg-[#FAFAFB] space-y-2">
                      <h4 className="font-bold">Theme and Styling</h4>
                      <p className="text-[#6E6E78]">Active layout style: Adamjee Computers Premium Red/Dark Theme. Smooth client transitions enabled.</p>
                      <button className="text-[14px] font-bold text-[#5B32F0] hover:underline">Customize</button>
                    </div>
                    <div className="p-4 border border-[#E8E8EC] rounded-xl bg-[#FAFAFB] space-y-2">
                      <h4 className="font-bold">Store Preferences</h4>
                      <p className="text-[#6E6E78]">Active integrations: Safepay Sandbox API, OpenAI AI Chatbot assistant, GST Tax configurations.</p>
                      <button className="text-[14px] font-bold text-[#5B32F0] hover:underline">Preferences</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ INVOICES APP TAB ═══ */}
              {activeTab === 'invoices' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] p-6 space-y-4">
                      <h3 className="text-[14px] font-semibold text-[#9A9AA5] uppercase tracking-[0.09em]">1. Customer Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { label: 'Customer Name *', value: invoiceCustomerName, setter: setInvoiceCustomerName, ph: 'Ahmad Khan...' },
                          { label: 'Customer Phone', value: invoiceCustomerPhone, setter: setInvoiceCustomerPhone, ph: '0300-1234567' },
                          { label: 'Customer Email', value: invoiceCustomerEmail, setter: setInvoiceCustomerEmail, ph: 'customer@gmail.com' },
                        ].map(({ label, value, setter, ph }) => (
                          <div key={label}>
                            <label className="block text-[13px] font-bold text-[#16161A] mb-1">{label}</label>
                            <input value={value} onChange={e => setter(e.target.value)}
                              className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] focus:outline-none" placeholder={ph} />
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#16161A] mb-1">Billing / Delivery Address</label>
                        <textarea value={invoiceCustomerAddress} onChange={e => setInvoiceCustomerAddress(e.target.value)}
                          rows={2} className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] focus:outline-none resize-none"
                          placeholder="House #12, Street 4, Karachi" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-[14px] font-semibold text-[#9A9AA5] uppercase tracking-[0.09em]">2. Line Items</h3>
                        <button onClick={() => setInvoiceItems([...invoiceItems, { productId: '', name: '', price: 0, cost: 0, quantity: 1 }])}
                          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[12px] text-[14px] font-semibold bg-[#5B32F0] text-white hover:bg-[#4A25CE] hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(91,50,240,0.32)] active:scale-[0.97] transition-all duration-200 cursor-pointer">Add row</button>
                      </div>
                      <div className="space-y-3">
                        {invoiceItems.map((item, idx) => (
                          <div key={idx} className="flex flex-col md:flex-row gap-3 items-stretch md:items-center bg-[#FAFAFB] p-4 rounded-[10px] border border-[#E8E8EC] relative">
                            <div className="flex-1 space-y-2">
                              <select value={item.productId} onChange={(e) => {
                                const val = e.target.value;
                                const matched = products.find(p => p._id === val || p.id === val);
                                const updated = [...invoiceItems];
                                updated[idx] = { productId: val, name: matched ? matched.name : '', price: matched ? matched.price : 0, cost: matched ? (matched.costPerItem || 0) : 0, quantity: item.quantity };
                                setInvoiceItems(updated);
                              }} className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white focus:outline-none">
                                <option value="">-- Choose Item from Inventory --</option>
                                {products.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.name} — PKR {Math.round(p.price || 0).toLocaleString()}</option>)}
                              </select>
                              <input value={item.name} onChange={(e) => { const updated = [...invoiceItems]; updated[idx].name = e.target.value; setInvoiceItems(updated); }}
                                className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white focus:outline-none" placeholder="Or type manual item name..." />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto items-center">
                              {[
                                { label: 'Price', key: 'price', w: 'w-20' },
                                { label: 'Cost', key: 'cost', w: 'w-20' },
                                { label: 'Qty', key: 'quantity', w: 'w-12' },
                              ].map(({ label, key, w }) => (
                                <div key={key} className={w}>
                                  <label className="block text-[13px] font-bold text-[#6E6E78] mb-0.5">{label}</label>
                                  <input type="number" min={key === 'quantity' ? 1 : 0} value={item[key]}
                                    onChange={(e) => { const updated = [...invoiceItems]; updated[idx][key] = +e.target.value; setInvoiceItems(updated); }}
                                    className="w-full px-2 py-1 border border-[#E8E8EC] rounded-[10px] text-[14px] bg-white focus:outline-none text-center" />
                                </div>
                              ))}
                              <div className="pt-3">
                                <button onClick={() => { const updated = invoiceItems.filter((_, i) => i !== idx); setInvoiceItems(updated.length > 0 ? updated : [{ productId: '', name: '', price: 0, cost: 0, quantity: 1 }]); }}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-[10px]"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-[#E8E8EC] shadow-[0_1px_2px_rgba(16,16,26,0.04)] p-6 space-y-4">
                      <h3 className="text-[14px] font-semibold text-[#9A9AA5] uppercase tracking-[0.09em]">3. Payment & Remarks</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[13px] font-bold mb-1">Payment Method</label>
                          <select value={invoicePaymentMethod} onChange={e => setInvoicePaymentMethod(e.target.value)}
                            className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] bg-white">
                            {['Cash', 'Card', 'Bank Transfer', 'COD'].map(m => <option key={m}>{m}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[13px] font-bold mb-1">Notes / Remarks</label>
                          <input value={invoiceNotes} onChange={e => setInvoiceNotes(e.target.value)}
                            className="w-full h-11 px-4 border border-[#E8E8EC] rounded-[12px] outline-none focus:border-[#5B32F0] focus:ring-2 focus:ring-[#5B32F0]/12 transition-all duration-150 text-[14px] focus:outline-none" placeholder="Warranty note..." />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <Card hover={false} className="p-7 sticky top-6">
                      <SectionTitle icon={Printer} title="Invoice summary" subtitle="Adjust before saving." />

                      <div className="space-y-5">
                        <Field label="Discount">
                          <div className="flex gap-2.5">
                            <input
                              type="number"
                              min={0}
                              value={invoiceDiscountValue}
                              onChange={e => setInvoiceDiscountValue(+e.target.value)}
                              className={`${inputCls} flex-1`}
                            />
                            <div className="flex rounded-[12px] border border-[#E8E8EC] overflow-hidden flex-shrink-0">
                              {(['fixed', 'percentage'] as const).map(t => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setInvoiceDiscountType(t)}
                                  className={`w-11 h-11 text-[15px] font-semibold transition-colors duration-200 cursor-pointer
                                    ${invoiceDiscountType === t
                                      ? 'bg-[#5B32F0] text-white'
                                      : 'bg-white text-[#6E6E78] hover:bg-[#F7F7F9]'}`}
                                >
                                  {t === 'fixed' ? 'Rs' : '%'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </Field>

                        <div className="grid grid-cols-2 gap-4">
                          <Field label="GST rate (%)">
                            <input type="number" min={0} max={100} value={invoiceTaxRate}
                              onChange={e => setInvoiceTaxRate(+e.target.value)} className={inputCls} />
                          </Field>
                          <Field label="Shipping">
                            <input type="number" min={0} value={invoiceShippingCharges}
                              onChange={e => setInvoiceShippingCharges(+e.target.value)} className={inputCls} />
                          </Field>
                        </div>
                      </div>

                      {(() => {
                        const subtotal = invoiceItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
                        const rawDiscAmt = invoiceDiscountType === 'fixed' ? (Number(invoiceDiscountValue) || 0) : (subtotal * (Number(invoiceDiscountValue) || 0)) / 100;
                        const discAmt = Math.min(subtotal, Math.max(0, rawDiscAmt));
                        const taxedAmount = Math.max(0, subtotal - discAmt);
                        const taxRate = Number(invoiceTaxRate) || 0;
                        const taxAmt = Math.max(0, (taxedAmount * taxRate) / 100);
                        const shippingCharges = Math.max(0, Number(invoiceShippingCharges) || 0);
                        const total = Math.max(0, taxedAmount + taxAmt + shippingCharges);
                        const money = (n: number) => `PKR ${Math.round(n).toLocaleString()}`;

                        return (
                          <div className="mt-6 pt-6 border-t border-[#F0F0F3] space-y-3">
                            <div className="flex justify-between text-[14.5px]">
                              <span className="text-[#6E6E78]">Subtotal</span>
                              <span className="text-[#16161A] tabular-nums">{money(subtotal)}</span>
                            </div>
                            {discAmt > 0 && (
                              <div className="flex justify-between text-[14.5px]">
                                <span className="text-[#6E6E78]">Discount</span>
                                <span className="text-[#DC2626] tabular-nums">−{money(discAmt)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-[14.5px]">
                              <span className="text-[#6E6E78]">GST ({taxRate}%)</span>
                              <span className="text-[#16161A] tabular-nums">{money(taxAmt)}</span>
                            </div>
                            {shippingCharges > 0 && (
                              <div className="flex justify-between text-[14.5px]">
                                <span className="text-[#6E6E78]">Shipping</span>
                                <span className="text-[#16161A] tabular-nums">{money(shippingCharges)}</span>
                              </div>
                            )}

                            <div className="flex items-baseline justify-between pt-4 mt-1 border-t border-[#F0F0F3]">
                              <span className="text-[15px] font-semibold text-[#16161A]">Total</span>
                              <span className="text-[24px] font-bold text-[#5B32F0] tracking-[-0.02em] tabular-nums">
                                {money(total)}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      <Btn variant="primary" icon={Printer} onClick={handleSaveInvoice} className="w-full mt-6">
                        Save &amp; print invoice
                      </Btn>
                    </Card>

                    {/* Saved invoices */}
                    {invoices.length > 0 && (
                      <Card className="overflow-hidden">
                        <div className="px-6 pt-6 pb-4">
                          <SectionTitle icon={FileText} title="Recent invoices" subtitle={`${invoices.length} saved`} />
                        </div>
                        <div className="divide-y divide-[#F0F0F3]">
                          {pagedInvoices.map(inv => (
                            <button
                              key={inv._id}
                              onClick={() => setSelectedInvoiceDetail(inv)}
                              className="w-full px-6 py-4 flex items-center justify-between gap-3 text-left
                                         hover:bg-[#FAFAFB] transition-colors duration-200 cursor-pointer"
                            >
                              <div className="min-w-0">
                                <p className="text-[14.5px] font-semibold text-[#5B32F0]">{inv.invoiceId}</p>
                                <p className="text-[13.5px] text-[#9A9AA5] truncate mt-0.5">{inv.customerName}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-[14.5px] font-semibold text-[#16161A] tabular-nums">
                                  PKR {Math.round(inv.total || 0).toLocaleString()}
                                </p>
                                <p className="text-[13px] text-[#9A9AA5] mt-0.5">
                                  {new Date(inv.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                        <Pagination
                          page={invoicesPage}
                          pageCount={invoicesTotalPages}
                          total={invoices.length}
                          perPage={invoicesPageSize}
                          onPage={setInvoicesPage}
                          onPerPage={setInvoicesPageSize}
                        />
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* ═══ REPORTS APP TAB ═══ */}
              {activeTab === 'reports' && (
                <div className="bg-white rounded-2xl border border-[#E8E8EC] p-6 shadow-[0_1px_2px_rgba(16,16,26,0.04)] space-y-4">
                  <div className="flex justify-between items-center border-b border-[#F0F0F3] pb-3 mb-1">
                    <h2 className="text-[17px] font-bold">Store Reports Manager</h2>
                    <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[12px] text-[14px] font-semibold bg-[#5B32F0] text-white hover:bg-[#4A25CE] hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(91,50,240,0.32)] active:scale-[0.97] transition-all duration-200 cursor-pointer">Print</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[14px] pt-3 font-semibold text-[#16161A]">
                    <div className="p-4 border border-[#E8E8EC] rounded-xl bg-[#FAFAFB] space-y-2">
                      <h4 className="font-bold text-[#5B32F0]">Financial Report</h4>
                      <p className="text-[#6E6E78]">Review margins, sales, cost of goods, and total net profits across physical invoice records.</p>
                      <button onClick={() => exportCSV(invoices, 'financials.csv', [{key:'invoiceId', label:'Invoice'}, {key:'customerName', label:'Customer'}, {key:'total', label:'Total'}])} className="text-[14px] font-semibold text-[#5B32F0] hover:text-[#4A25CE] hover:underline transition-colors duration-200 cursor-pointer">Export</button>
                    </div>

                    <div className="p-4 border border-[#E8E8EC] rounded-xl bg-[#FAFAFB] space-y-2">
                      <h4 className="font-bold text-[#5B32F0]">Inventory Value Summary</h4>
                      <p className="text-[#6E6E78]">Check live cost holdings, wholesale margins, items tags, and categories counts in real-time.</p>
                      <button onClick={() => exportCSV(products, 'inventory-holding.csv', [{key:'name', label:'Product'}, {key:'stock', label:'Stock'}, {key:'costPerItem', label:'Cost'}])} className="text-[14px] font-semibold text-[#5B32F0] hover:text-[#4A25CE] hover:underline transition-colors duration-200 cursor-pointer">Export</button>
                    </div>

                    <div className="p-4 border border-[#E8E8EC] rounded-xl bg-[#FAFAFB] space-y-2">
                      <h4 className="font-bold text-[#5B32F0]">Customer LTV Breakdown</h4>
                      <p className="text-[#6E6E78]">Analyze checkout values, conversion metrics, chatbot escalations, and active customer spent summaries.</p>
                      <button onClick={() => exportCSV(users, 'customers-ltv.csv', [{key:'name', label:'Customer'}, {key:'email', label:'Email'}])} className="text-[14px] font-semibold text-[#5B32F0] hover:text-[#4A25CE] hover:underline transition-colors duration-200 cursor-pointer">Export</button>
                    </div>
                  </div>
                </div>
              )}




              {/* ═══ SETTINGS TAB ═══ */}
              {activeTab === 'settings' && (
                <div className="max-w-[880px] space-y-6">
                  <PageHeader actions={<Btn variant="primary" icon={CheckCircle} onClick={handleSaveSettings}>Save changes</Btn>} />

                  {/* Store details */}
                  <Card className="p-7">
                    <SectionTitle
                      icon={ShoppingBag}
                      title="Store details"
                      subtitle="Used on invoices, order emails and storefront contact info."
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Store name">
                        <input className={inputCls} value={storeSettings.storeName}
                          onChange={e => setStoreSettings({ ...storeSettings, storeName: e.target.value })} />
                      </Field>
                      <Field label="Phone">
                        <input className={inputCls} value={storeSettings.storePhone}
                          onChange={e => setStoreSettings({ ...storeSettings, storePhone: e.target.value })} />
                      </Field>
                      <Field label="Email">
                        <input className={inputCls} type="email" value={storeSettings.storeEmail}
                          onChange={e => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })} />
                      </Field>
                      <Field label="GST / Tax number">
                        <input className={inputCls} value={storeSettings.gstNumber}
                          onChange={e => setStoreSettings({ ...storeSettings, gstNumber: e.target.value })} />
                      </Field>
                    </div>

                    <div className="mt-5">
                      <Field label="Store address">
                        <textarea rows={3} className={textareaCls} value={storeSettings.storeAddress}
                          onChange={e => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })} />
                      </Field>
                    </div>
                  </Card>

                  {/* Money */}
                  <Card className="p-7">
                    <SectionTitle icon={Percent} title="Currency & tax" subtitle="Applied to new invoices and checkout totals." />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Currency symbol" hint="Shown before every price.">
                        <input className={inputCls} value={storeSettings.currency}
                          onChange={e => setStoreSettings({ ...storeSettings, currency: e.target.value })} />
                      </Field>
                      <Field label="Default tax rate (%)">
                        <input className={inputCls} type="number" min={0} max={100} value={storeSettings.defaultTaxRate}
                          onChange={e => setStoreSettings({ ...storeSettings, defaultTaxRate: Number(e.target.value) })} />
                      </Field>
                    </div>
                  </Card>

                  {/* Invoice terms */}
                  <Card className="p-7">
                    <SectionTitle icon={FileText} title="Invoice terms" subtitle="Printed at the bottom of every invoice." />
                    <textarea rows={5} className={textareaCls} value={storeSettings.terms}
                      onChange={e => setStoreSettings({ ...storeSettings, terms: e.target.value })} />
                  </Card>

                  {/* Social links */}
                  <Card className="p-7">
                    <SectionTitle icon={Globe} title="Social links" subtitle="Synced to the storefront header and footer." />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {[
                        { label: 'Facebook', key: 'facebook', ph: 'https://facebook.com/…' },
                        { label: 'Instagram', key: 'instagram', ph: 'https://instagram.com/…' },
                        { label: 'YouTube', key: 'youtube', ph: 'https://youtube.com/@…' },
                        { label: 'LinkedIn', key: 'linkedin', ph: 'https://linkedin.com/company/…' },
                        { label: 'X / Twitter', key: 'twitter', ph: 'https://x.com/…' },
                        { label: 'WhatsApp', key: 'whatsapp', ph: '+92 300 0000000' },
                        { label: 'TikTok', key: 'tiktok', ph: 'https://tiktok.com/@…' },
                      ].map(({ label, key, ph }) => (
                        <Field key={key} label={label}>
                          <input
                            className={inputCls}
                            placeholder={ph}
                            value={(storeSettings.socialLinks as any)?.[key] || ''}
                            onChange={e => setStoreSettings({
                              ...storeSettings,
                              socialLinks: { ...(storeSettings.socialLinks || {}), [key]: e.target.value },
                            })}
                          />
                        </Field>
                      ))}
                    </div>
                  </Card>

                  <div className="flex justify-end pb-2">
                    <Btn variant="primary" icon={CheckCircle} onClick={handleSaveSettings}>Save changes</Btn>
                  </div>
                </div>
              )}

              {activeTab === 'customization' && (
                <div className="max-w-[980px] space-y-6">
                  <PageHeader actions={<Btn variant="primary" icon={Globe} onClick={handleSaveSettings}>Publish changes</Btn>} />

                  {/* Announcement bar */}
                  <Card className="p-7">
                    <SectionTitle
                      icon={Volume2}
                      title="Announcement bar"
                      subtitle="The strip above the storefront header."
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        className={`${inputCls} flex-1`}
                        value={promoTaglineInput}
                        onChange={e => setPromoTaglineInput(e.target.value)}
                        placeholder="Free shipping over PKR 50,000 …"
                      />
                      <Btn variant="primary" icon={CheckCircle} onClick={() => handleSaveTagline()}>Update</Btn>
                    </div>
                    <div className="mt-4 rounded-xl bg-[#16161A] px-5 py-3">
                      <p className="text-[13.5px] text-white/90 text-center truncate">
                        {promoTaglineInput || 'Your announcement appears here'}
                      </p>
                    </div>
                  </Card>

                  {/* Hero slider */}
                  <Card className="p-7">
                    <SectionTitle
                      icon={Palette}
                      title="Homepage hero slider"
                      subtitle="Three rotating slides at the top of the storefront."
                    />
                    <div className="space-y-5">
                      {[0, 1, 2].map(idx => {
                        const slide = storeSettings.heroSlides?.[idx] || { image: '', title: '', subtitle: '', link: '' };
                        const update = (patch: any) => {
                          const copy = [...(storeSettings.heroSlides || [])];
                          copy[idx] = { ...slide, ...patch };
                          setStoreSettings({ ...storeSettings, heroSlides: copy });
                        };
                        return (
                          <div key={idx} className="rounded-[18px] border border-[#E8E8EC] bg-[#FAFAFB] overflow-hidden">
                            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#EDEDF0]">
                              <span className="inline-flex items-center gap-2.5 text-[14px] font-semibold text-[#16161A]">
                                <span className="w-7 h-7 rounded-xl bg-[#F1EDFE] text-[#5B32F0] text-[13px] font-bold inline-flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                Slide {idx + 1}
                              </span>
                              <label className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[12px] text-[14px] font-semibold
                                                bg-white text-[#16161A] border border-[#E8E8EC] hover:bg-[#F2F2F5] hover:-translate-y-px
                                                active:scale-[0.97] transition-all duration-200 cursor-pointer">
                                <Upload className="w-4 h-4" /> Upload image
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async e => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      const compressed = await compressImageFile(file);
                                      update({ image: compressed });
                                      showToast(`Slide ${idx + 1} image updated — publish to go live.`);
                                    } catch (err) {
                                      console.error('Failed to upload banner:', err);
                                    }
                                  }}
                                />
                              </label>
                            </div>

                            <div className="p-5 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
                              <div className="admin-zoom rounded-xl border border-[#E8E8EC] bg-white aspect-[16/9] flex items-center justify-center">
                                {slide.image
                                  ? <img src={slide.image} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                                  : <span className="text-[13px] text-[#9A9AA5]">No image</span>}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Headline" className="md:col-span-2">
                                  <input className={inputCls} value={slide.title}
                                    onChange={e => update({ title: e.target.value })} placeholder="Ultimate Gaming Rig" />
                                </Field>
                                <Field label="Subtitle">
                                  <input className={inputCls} value={slide.subtitle}
                                    onChange={e => update({ subtitle: e.target.value })} placeholder="Power & performance redefined" />
                                </Field>
                                <Field label="Button link">
                                  <input className={inputCls} value={slide.link}
                                    onChange={e => update({ link: e.target.value })} placeholder="/category/all" />
                                </Field>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Why choose us gallery */}
                  <Card className="p-7">
                    <SectionTitle
                      icon={Sparkles}
                      title="Why choose us gallery"
                      subtitle="Six images shown in the storefront gallery band."
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {[
                        { key: 'card1Img', label: 'Top left', defaultVal: '/images/Rectangle 12598.png' },
                        { key: 'card2Img', label: 'Centre (tall)', defaultVal: '/images/Rectangle 12598 (1).png' },
                        { key: 'card3Img', label: 'Top right', defaultVal: '/images/Rectangle 12598 (2).png' },
                        { key: 'card4Img', label: 'Bottom left', defaultVal: '/images/blue_rgb_pc_cases_1780241349905.png' },
                        { key: 'card5Img', label: 'Bottom centre', defaultVal: '/images/Rectangle 12598 (2).png' },
                        { key: 'card6Img', label: 'Bottom right', defaultVal: '/images/custom_blue_gaming_pc_cases_1780242165601.png' },
                      ].map(item => {
                        const whyUs = (storeSettings as any).whyUs || {};
                        const val = whyUs[item.key] || item.defaultVal;
                        return (
                          <div key={item.key} className="rounded-[18px] border border-[#E8E8EC] bg-[#FAFAFB] overflow-hidden">
                            <div className="admin-zoom aspect-[4/3] bg-white border-b border-[#EDEDF0]">
                              {val && <img src={val} alt={item.label} className="w-full h-full object-cover" />}
                            </div>
                            <div className="p-4 space-y-2.5">
                              <p className="text-[14px] font-semibold text-[#16161A]">{item.label}</p>
                              <div className="flex gap-2">
                                <input
                                  className={`${inputCls} flex-1 h-10 text-[13.5px]`}
                                  value={val}
                                  onChange={e => setStoreSettings({ ...storeSettings, whyUs: { ...whyUs, [item.key]: e.target.value } })}
                                />
                                <label className="inline-flex items-center justify-center h-10 px-3.5 rounded-[12px] text-[13.5px] font-semibold
                                                  bg-white text-[#16161A] border border-[#E8E8EC] hover:bg-[#F2F2F5]
                                                  active:scale-[0.97] transition-all duration-200 cursor-pointer flex-shrink-0">
                                  <Upload className="w-4 h-4" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async e => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      try {
                                        const compressed = await compressImageFile(file);
                                        setStoreSettings({ ...storeSettings, whyUs: { ...whyUs, [item.key]: compressed } });
                                        showToast(`${item.label} image updated — publish to go live.`);
                                      } catch (err) {
                                        console.error('Failed to upload image:', err);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  <div className="flex justify-end pb-2">
                    <Btn variant="primary" icon={Globe} onClick={handleSaveSettings}>Publish changes</Btn>
                  </div>
                </div>
              )}
            </>
          )}
            </main>
          </div>
        </div>
      </div>

      {/* ─── MODALS ─── */}

      {/* Product Form modal */}
      {showProductForm && (
        <ProductFormModal product={editingProduct} onClose={() => { setShowProductForm(false); setEditingProduct(null); }} onSave={handleSaveProduct} customCollections={customCollections} />
      )}

      {/* Stock Adjust modal */}
      {stockAdjustProduct && (
        <StockAdjustModal product={stockAdjustProduct} onClose={() => setStockAdjustProduct(null)} onSave={handleStockAdjust} />
      )}

      {/* Selected Product details modal */}
      {selectedProductDetail && (() => {
        const p = selectedProductDetail;
        const stock = p.stock ?? 0;
        const threshold = p.lowStockThreshold || 5;
        const cost = Number(p.costPerItem) || 0;
        const price = Number(p.price) || 0;
        const margin = price > 0 && cost ? Math.round(((price - cost) / price) * 100) : null;
        const stockValue = stock * cost;
        const status = (p.status || 'active').toLowerCase();

        return (
          <Modal
            open
            onClose={() => setSelectedProductDetail(null)}
            title={p.name}
            subtitle={[p.category, p.vendor].filter(Boolean).join(' · ') || undefined}
            icon={Package}
            size="lg"
            variant="center"
            footer={
              <>
                <Btn icon={X} onClick={() => setSelectedProductDetail(null)}>Close</Btn>
                <Btn variant="primary" icon={Pencil} onClick={() => { setEditingProduct(p); setSelectedProductDetail(null); setShowProductForm(true); }}>
                  Edit
                </Btn>
              </>
            }
          >
            <div className="space-y-7">

              {/* Hero */}
              <div className="grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-6">
                <div className="admin-zoom rounded-2xl bg-[#F7F7F9] border border-[#EDEDF0] aspect-square">
                  <img
                    src={getProductImage(p)}
                    alt={p.name}
                    onError={e => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(p.category, p.name); }}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex flex-col">
                  <div className="flex flex-wrap items-center gap-2.5 mb-4">
                    <StatusPill
                      label={status === 'active' ? 'Published' : status === 'draft' ? 'Draft' : 'Inactive'}
                      tone={productStatusTone(status)}
                    />
                    {stock <= 0
                      ? <StatusPill label="Out of stock" tone="red" />
                      : stock <= threshold
                        ? <StatusPill label={`Low stock · ${stock}`} tone="amber" />
                        : <StatusPill label={`${stock} in stock`} tone="green" />}
                  </div>

                  <p className="text-[32px] font-bold text-[#16161A] tracking-[-0.03em] leading-none tabular-nums">
                    PKR {Math.round(price).toLocaleString()}
                  </p>
                  {p.comparePrice > price && (
                    <p className="text-[15px] text-[#9A9AA5] line-through mt-1.5 tabular-nums">
                      PKR {Math.round(p.comparePrice).toLocaleString()}
                    </p>
                  )}

                  <div className="mt-auto pt-5 space-y-2.5">
                    {[
                      { icon: Tag, label: 'SKU', value: p.code || '—' },
                      { icon: Boxes, label: 'Category', value: p.category || '—' },
                      { icon: Users, label: 'Vendor', value: p.vendor || '—' },
                    ].map(row => (
                      <div key={row.label} className="flex items-center gap-2.5 text-[14px]">
                        <row.icon className="w-4 h-4 text-[#9A9AA5] flex-shrink-0" strokeWidth={1.9} />
                        <span className="text-[#9A9AA5] w-[76px] flex-shrink-0">{row.label}</span>
                        <span className="text-[#16161A] font-medium truncate">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Figures */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Boxes, label: 'Units in stock', value: String(stock) },
                  { icon: Tag, label: 'Unit cost', value: `PKR ${Math.round(cost).toLocaleString()}` },
                  { icon: TrendingUp, label: 'Margin', value: margin === null ? '—' : `${margin}%`, accent: margin !== null && margin > 0 },
                  { icon: BarChart3, label: 'Stock value', value: `PKR ${Math.round(stockValue).toLocaleString()}` },
                ].map(stat => (
                  <div key={stat.label} className="rounded-2xl border border-[#EDEDF0] bg-[#FAFAFB] px-4 py-4">
                    <stat.icon className="w-[18px] h-[18px] text-[#5B32F0] mb-2.5" strokeWidth={1.9} />
                    <p className="text-[13px] text-[#9A9AA5] mb-1">{stat.label}</p>
                    <p className={`text-[18px] font-bold tracking-[-0.02em] tabular-nums truncate ${stat.accent ? 'text-[#16A34A]' : 'text-[#16161A]'}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {p.description && (
                <div>
                  <SectionTitle icon={FileText} title="Description" />
                  <p className="text-[14.5px] text-[#4A4A55] leading-relaxed whitespace-pre-line">
                    {p.description}
                  </p>
                </div>
              )}

              {/* Specs */}
              {Array.isArray(p.specBullets) && p.specBullets.length > 0 && (
                <div>
                  <SectionTitle icon={CheckSquare} title="Specifications" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {p.specBullets.filter(Boolean).map((spec: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-xl bg-[#FAFAFB] border border-[#EDEDF0] px-4 py-3">
                        <CheckCircle className="w-4 h-4 text-[#16A34A] mt-0.5 flex-shrink-0" strokeWidth={2} />
                        <span className="text-[14px] text-[#4A4A55]">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Colours */}
              {Array.isArray(p.colors) && p.colors.length > 0 && (
                <div>
                  <SectionTitle icon={Palette} title={p.colorLabel || 'Colours'} />
                  <div className="flex flex-wrap gap-2.5">
                    {p.colors.filter(Boolean).map((c: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-2 h-9 pl-2 pr-3.5 rounded-full border border-[#EDEDF0] bg-white">
                        <span className="w-5 h-5 rounded-full border border-[#EDEDF0]" style={{ background: c }} />
                        <span className="text-[13.5px] text-[#4A4A55]">{c}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        );
      })()}

      {/* Selected Order details modal */}
      {selectedOrderDetail && (() => {
        const o = selectedOrderDetail;
        const money = (n: number) => `PKR ${Math.round(n || 0).toLocaleString()}`;
        const placed = new Date(o.createdAt || Date.now());
        const addr = o.shippingAddress || {};

        return (
          <Modal
            open
            onClose={() => setSelectedOrderDetail(null)}
            title={`Order ${o.orderId}`}
            subtitle={placed.toLocaleDateString('en-GB', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            }) + ' · ' + placed.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            icon={ShoppingBag}
            size="lg"
            variant="center"
            footer={<Btn icon={X} onClick={() => setSelectedOrderDetail(null)}>Close</Btn>}
          >
            <div className="space-y-7">

              {/* Status row */}
              <div className="flex flex-wrap items-center gap-3">
                <StatusSelect
                  value={(o.orderStatus || 'pending').toLowerCase()}
                  tone={orderStatusTone(o.orderStatus)}
                  options={[
                    { value: 'pending', label: 'Pending', tone: 'amber' },
                    { value: 'processing', label: 'Processing', tone: 'violet' },
                    { value: 'shipped', label: 'Shipped', tone: 'blue' },
                    { value: 'delivered', label: 'Delivered', tone: 'green' },
                    { value: 'cancelled', label: 'Cancelled', tone: 'red' },
                  ]}
                  onChange={v => handleUpdateOrderStatus(o.orderId, v)}
                />
                <StatusPill label={o.paymentStatus || 'pending'} tone={paymentStatusTone(o.paymentStatus)} />
                <span className="inline-flex items-center gap-1.5 text-[13.5px] text-[#6E6E78]">
                  <CreditCardIcon />
                  {(o.paymentMethod || 'cod').toUpperCase()}
                </span>
              </div>

              {/* Items */}
              <div>
                <SectionTitle
                  icon={Package}
                  title="Items"
                  subtitle={`${(o.items || []).length} line${(o.items || []).length === 1 ? '' : 's'}`}
                />
                <div className="rounded-2xl border border-[#EDEDF0] overflow-hidden divide-y divide-[#F5F5F7]">
                  {(o.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 px-4 py-3.5 hover:bg-[#FAFAFB] transition-colors duration-200">
                      <div className="admin-zoom w-12 h-12 rounded-xl bg-[#F4F4F6] border border-[#EDEDF0] flex-shrink-0">
                        <img
                          src={item.image || item.img || getProductImage(item)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(item.category, item.name); }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14.5px] font-medium text-[#16161A] truncate">{item.name}</p>
                        <p className="text-[13.5px] text-[#9A9AA5] mt-0.5">
                          {item.quantity} × {money(item.price)}
                        </p>
                      </div>
                      <span className="text-[14.5px] font-semibold text-[#16161A] tabular-nums whitespace-nowrap">
                        {money((item.price || 0) * (item.quantity || 1))}
                      </span>
                    </div>
                  ))}
                  {(!o.items || o.items.length === 0) && (
                    <p className="px-4 py-5 text-[14px] text-[#9A9AA5] text-center">No line items recorded.</p>
                  )}
                </div>

                {/* Totals */}
                <div className="mt-5 rounded-2xl bg-[#FAFAFB] border border-[#EDEDF0] px-5 py-4 space-y-2.5">
                  <div className="flex justify-between text-[14.5px]">
                    <span className="text-[#6E6E78]">Subtotal</span>
                    <span className="text-[#16161A] tabular-nums">{money(o.subtotal ?? o.total)}</span>
                  </div>
                  {o.discount > 0 && (
                    <div className="flex justify-between text-[14.5px]">
                      <span className="text-[#6E6E78]">Discount</span>
                      <span className="text-[#DC2626] tabular-nums">−{money(o.discount)}</span>
                    </div>
                  )}
                  {o.shippingCost > 0 && (
                    <div className="flex justify-between text-[14.5px]">
                      <span className="text-[#6E6E78]">Shipping</span>
                      <span className="text-[#16161A] tabular-nums">{money(o.shippingCost)}</span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between pt-3 mt-1 border-t border-[#EDEDF0]">
                    <span className="text-[15px] font-semibold text-[#16161A]">Total</span>
                    <span className="text-[22px] font-bold text-[#5B32F0] tracking-[-0.02em] tabular-nums">
                      {money(o.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer + delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <SectionTitle icon={Users} title="Customer" />
                  <div className="rounded-2xl border border-[#EDEDF0] bg-[#FAFAFB] px-5 py-4 space-y-2.5">
                    <p className="text-[14.5px] font-semibold text-[#16161A]">
                      {addr.fullName || o.user?.name || 'Guest'}
                    </p>
                    {(o.guestEmail || o.user?.email) && (
                      <p className="flex items-center gap-2 text-[13.5px] text-[#6E6E78] break-all">
                        <Mail className="w-4 h-4 text-[#9A9AA5] flex-shrink-0" />
                        {o.guestEmail || o.user?.email}
                      </p>
                    )}
                    {addr.phone && (
                      <p className="flex items-center gap-2 text-[13.5px] text-[#6E6E78]">
                        <Phone className="w-4 h-4 text-[#9A9AA5] flex-shrink-0" />
                        {addr.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <SectionTitle icon={Truck} title="Delivery" />
                  <div className="rounded-2xl border border-[#EDEDF0] bg-[#FAFAFB] px-5 py-4">
                    {addr.street || addr.city ? (
                      <p className="flex items-start gap-2 text-[13.5px] text-[#6E6E78] leading-relaxed">
                        <MapPin className="w-4 h-4 text-[#9A9AA5] mt-0.5 flex-shrink-0" />
                        <span>{[addr.street, addr.city, addr.postalCode, addr.country].filter(Boolean).join(', ')}</span>
                      </p>
                    ) : (
                      <p className="text-[13.5px] text-[#9A9AA5]">No delivery address on this order.</p>
                    )}
                    {o.trackingNumber && (
                      <p className="mt-3 pt-3 border-t border-[#EDEDF0] text-[13.5px] text-[#6E6E78]">
                        Tracking <span className="font-medium text-[#16161A]">{o.trackingNumber}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {o.notes && (
                <div>
                  <SectionTitle icon={FileText} title="Order notes" />
                  <p className="rounded-2xl border border-[#EDEDF0] bg-[#FAFAFB] px-5 py-4 text-[14px] text-[#4A4A55] leading-relaxed whitespace-pre-line">
                    {o.notes}
                  </p>
                </div>
              )}
            </div>
          </Modal>
        );
      })()}

      {/* Selected Customer profile detail modal */}
      {selectedCustomerDetail && (() => {
        const customerOrders = orders.filter(o =>
          (o.guestEmail && o.guestEmail.toLowerCase() === selectedCustomerDetail.email?.toLowerCase()) ||
          (o.user?.email && o.user.email.toLowerCase() === selectedCustomerDetail.email?.toLowerCase()) ||
          (o.shippingAddress?.fullName && o.shippingAddress.fullName.toLowerCase() === selectedCustomerDetail.name?.toLowerCase())
        );
        const sorted = [...customerOrders].sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        const lifetime = selectedCustomerDetail.totalSpent || 0;
        const avgOrder = customerOrders.length ? lifetime / customerOrders.length : 0;
        const lastOrder = sorted[0]?.createdAt;
        const addresses = selectedCustomerDetail.addresses || [];

        return (
          <Modal
            open
            onClose={() => setSelectedCustomerDetail(null)}
            title={selectedCustomerDetail.name || 'Customer'}
            subtitle={selectedCustomerDetail.email}
            icon={Users}
            size="lg"
            variant="center"
            footer={<Btn icon={X} onClick={() => setSelectedCustomerDetail(null)}>Close</Btn>}
          >
            <div className="space-y-7">

              {/* Identity + contact */}
              <div className="flex items-start gap-4">
                <span className="w-14 h-14 rounded-2xl bg-[#F1EDFE] text-[#5B32F0] text-[21px] font-bold flex items-center justify-center flex-shrink-0">
                  {(selectedCustomerDetail.name || selectedCustomerDetail.email || '?').charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-semibold text-[#16161A] truncate">{selectedCustomerDetail.name || '—'}</p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-1.5 text-[14px] text-[#6E6E78]">
                    <span className="inline-flex items-center gap-1.5 min-w-0">
                      <Mail className="w-4 h-4 text-[#9A9AA5] flex-shrink-0" />
                      <span className="truncate">{selectedCustomerDetail.email || '—'}</span>
                    </span>
                    {selectedCustomerDetail.phone && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-[#9A9AA5]" />
                        {selectedCustomerDetail.phone}
                      </span>
                    )}
                  </div>
                </div>
                <StatusPill
                  label={lifetime > 100000 ? 'High value' : customerOrders.length > 0 ? 'Returning' : 'Lead'}
                  tone={lifetime > 100000 ? 'violet' : customerOrders.length > 0 ? 'blue' : 'gray'}
                />
              </div>

              {/* Key figures */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Orders', value: String(customerOrders.length) },
                  { label: 'Lifetime value', value: `PKR ${Math.round(lifetime).toLocaleString()}`, accent: true },
                  { label: 'Average order', value: `PKR ${Math.round(avgOrder).toLocaleString()}` },
                  { label: 'Last order', value: lastOrder ? new Date(lastOrder).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl border border-[#EDEDF0] bg-[#FAFAFB] px-4 py-4">
                    <p className="text-[13px] text-[#9A9AA5] mb-1.5">{s.label}</p>
                    <p className={`text-[19px] font-bold tracking-[-0.02em] tabular-nums truncate ${s.accent ? 'text-[#5B32F0]' : 'text-[#16161A]'}`}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order history */}
              <div>
                <SectionTitle
                  title="Order history"
                  subtitle={`${customerOrders.length} order${customerOrders.length === 1 ? '' : 's'} placed`}
                />

                {sorted.length === 0 ? (
                  <EmptyState icon={ShoppingBag} title="No orders yet" description="This customer hasn't placed an order." />
                ) : (
                  <div className="space-y-3">
                    {sorted.map((ord, idx) => (
                      <div
                        key={ord._id || ord.orderId || idx}
                        className="rounded-2xl border border-[#EDEDF0] overflow-hidden transition-all duration-200
                                   hover:border-[#DCDCE3] hover:shadow-[0_2px_10px_rgba(16,16,26,0.06)]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 bg-[#FAFAFB] border-b border-[#EDEDF0]">
                          <button
                            onClick={() => { setSelectedCustomerDetail(null); setSelectedOrderDetail(ord); }}
                            className="text-[14.5px] font-semibold text-[#5B32F0] hover:underline cursor-pointer"
                          >
                            {ord.orderId}
                          </button>
                          <div className="flex items-center gap-3">
                            <span className="text-[13.5px] text-[#9A9AA5]">
                              {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <StatusPill label={ord.orderStatus || 'pending'} tone={orderStatusTone(ord.orderStatus)} />
                            <span className="text-[14.5px] font-semibold text-[#16161A] tabular-nums whitespace-nowrap">
                              PKR {Math.round(ord.total || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="divide-y divide-[#F5F5F7]">
                          {(ord.items || []).map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-3.5 px-4 py-3">
                              <div className="admin-zoom w-11 h-11 rounded-xl bg-[#F4F4F6] border border-[#EDEDF0] flex-shrink-0">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={e => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                                  />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[14px] font-medium text-[#16161A] truncate">{item.name}</p>
                                <p className="text-[13px] text-[#9A9AA5]">
                                  {item.quantity} × PKR {Math.round(item.price || 0).toLocaleString()}
                                </p>
                              </div>
                              <span className="text-[14px] font-semibold text-[#16161A] tabular-nums whitespace-nowrap">
                                PKR {Math.round((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                              </span>
                            </div>
                          ))}
                          {(!ord.items || ord.items.length === 0) && (
                            <p className="px-4 py-3 text-[13.5px] text-[#9A9AA5]">No line items recorded.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Addresses */}
              <div>
                <SectionTitle icon={MapPin} title="Shipping addresses" />
                {addresses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#E4E4E9] px-5 py-6 text-center">
                    <p className="text-[14px] text-[#9A9AA5]">No saved address on this account.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((a: any, i: number) => (
                      <div key={i} className="rounded-2xl border border-[#EDEDF0] bg-[#FAFAFB] px-4 py-4">
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-[#5B32F0] mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[14px] font-semibold text-[#16161A] truncate">{a.fullName || selectedCustomerDetail.name}</p>
                            <p className="text-[13.5px] text-[#6E6E78] leading-relaxed mt-0.5">
                              {[a.street, a.city, a.postalCode, a.country].filter(Boolean).join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </Modal>
        );
      })()}

      {/* Selected Invoice detail modal */}
      {selectedInvoiceDetail && (
        <Modal
          open
          onClose={() => setSelectedInvoiceDetail(null)}
          title={`Invoice ${selectedInvoiceDetail.invoiceId}`}
          subtitle={new Date(selectedInvoiceDetail.createdAt).toLocaleString()}
          icon={Printer}
          size="lg"
          footer={<Btn icon={X} onClick={() => setSelectedInvoiceDetail(null)}>Close</Btn>}
        >
          <div className="space-y-6">

            <div className="border border-[#E8E8EC] rounded-[10px] p-4 space-y-3 text-[14px]">
              <div className="flex justify-between items-start text-[14px] border-b border-[#F0F0F3] pb-4 mb-1">
                <div>
                  <h4 className="font-bold text-[15px] text-[#5B32F0]">{storeSettings.storeName}</h4>
                  <p className="text-[13px] text-[#6E6E78] mt-0.5">{storeSettings.storeAddress}</p>
                  <p className="text-[13px] text-[#6E6E78]">{storeSettings.storePhone}</p>
                </div>
                <div className="text-right">
                  <h4 className="font-bold">Billed To:</h4>
                  <p className="font-bold text-[#16161A] mt-0.5">{selectedInvoiceDetail.customerName}</p>
                  <p className="text-[13px] text-[#6E6E78]">{selectedInvoiceDetail.customerPhone}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h5 className="font-bold text-[14px] text-[#5B32F0]">Purchased products:</h5>
                {selectedInvoiceDetail.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between font-semibold text-[#16161A]">
                    <span>{item.name} <strong className="text-[#9A9AA5]">x{item.quantity}</strong></span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

                <div className="border-t border-[#F0F0F3] pt-4 space-y-1 font-semibold text-[#6E6E78] text-[14px]">
                  <div className="flex justify-between"><span>Subtotal:</span><span>Rs. {Math.round(selectedInvoiceDetail.subtotal || 0).toLocaleString('en-PK')}</span></div>
                  {selectedInvoiceDetail.discountAmount > 0 && <div className="flex justify-between text-red-500"><span>Discount:</span><span>-Rs. {Math.round(selectedInvoiceDetail.discountAmount).toLocaleString('en-PK')}</span></div>}
                  <div className="flex justify-between"><span>GST Tax ({selectedInvoiceDetail.taxRate}%):</span><span>+Rs. {Math.round(selectedInvoiceDetail.taxAmount || 0).toLocaleString('en-PK')}</span></div>
                  {selectedInvoiceDetail.shippingCharges > 0 && <div className="flex justify-between"><span>Shipping:</span><span>+Rs. {Math.round(selectedInvoiceDetail.shippingCharges).toLocaleString('en-PK')}</span></div>}
                  <div className="flex justify-between font-bold text-[15px] text-[#16161A] border-t pt-1.5"><span>Grand Total:</span><span>Rs. {Math.round(selectedInvoiceDetail.total || 0).toLocaleString('en-PK')}</span></div>
                </div>
              </div>

          </div>
        </Modal>
        )}

        {/* Invoice printing overlay screen — Styled after the reference template */}
        {showPrintInvoice && (
          <div id="printable-invoice-modal" className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm overflow-y-auto flex justify-center p-4 md:p-10 text-[#16161A] font-sans">
            <div id="printable-invoice" className="w-full max-w-3xl space-y-7 bg-white p-8 md:p-10 border border-[#E8E8EC] rounded-2xl shadow-2xl print:shadow-none print:border-none print:p-0 print:m-0 my-auto">
              
              {/* Invoice Top Header */}
              <div className="flex justify-between items-start border-b border-[#E8E8EC] pb-6">
                {/* Brand Logo & Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <img src="/images/Mask group.png" alt="Adamjee Logo" className="h-9 w-auto object-contain" />
                    <img src="/images/Mask group (1).png" alt="Adamjee Computers" className="h-7 w-auto object-contain hidden sm:block" />
                    <span className="sm:hidden font-black text-xl text-[#16161A]">
                      {activeStoreSettings.storeName || 'Adamjee Computers'}
                    </span>
                  </div>
                  <div className="text-[14px] text-[#6E6E78] space-y-0.5 pt-1">
                    <p className="font-bold text-[#16161A] text-[15px]">{activeStoreSettings.storeName || 'Adamjee Computers'}</p>
                    <p>{activeStoreSettings.storeAddress || 'Main Gaming Hub, Karachi, Pakistan'}</p>
                    <p>Email: {activeStoreSettings.storeEmail || 'support@adamjeecomputers.com'} • Ph: {activeStoreSettings.storePhone || '+92 318 3919084'}</p>
                    <p>Website: www.adamjeecomputers.com</p>
                  </div>
                </div>

                {/* Invoice Title & Meta */}
                <div className="text-right space-y-1">
                  <h2 className="text-3xl font-black text-[#16161A] tracking-tight uppercase">INVOICE</h2>
                  <div className="pt-2 text-[14px] font-semibold text-[#6E6E78] space-y-1">
                    <p><span className="text-[#9A9AA5]">Invoice no:</span> <strong className="font-mono text-[#16161A]">{showPrintInvoice.invoiceId || showPrintInvoice._id || 'INV-001'}</strong></p>
                    <p><span className="text-[#9A9AA5]">Invoice date:</span> {new Date(showPrintInvoice.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    <p><span className="text-[#9A9AA5]">Due date:</span> {new Date(showPrintInvoice.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              {/* Bill To & Ship To Details */}
              <div className="grid grid-cols-2 gap-6 bg-[#FAFAFB] p-5 rounded-xl border border-[#F0F0F3] text-[14px]">
                <div className="space-y-1">
                  <span className="text-[13px] font-semibold text-[#9A9AA5] uppercase tracking-[0.09em] tracking-widest block mb-1">Bill To</span>
                  <p className="font-extrabold text-[15px] text-[#16161A]">{showPrintInvoice.customerName || 'Valued Customer'}</p>
                  {showPrintInvoice.customerEmail && <p className="text-[#6E6E78]">{showPrintInvoice.customerEmail}</p>}
                  {showPrintInvoice.customerPhone && <p className="text-[#6E6E78]">Ph: {showPrintInvoice.customerPhone}</p>}
                  {showPrintInvoice.customerAddress && <p className="text-[#6E6E78] pt-0.5">{showPrintInvoice.customerAddress}</p>}
                </div>

                <div className="space-y-1">
                  <span className="text-[13px] font-semibold text-[#9A9AA5] uppercase tracking-[0.09em] tracking-widest block mb-1">Ship To</span>
                  <p className="font-semibold text-[#4A4A55]">{showPrintInvoice.customerAddress || 'Customer Address Provided'}</p>
                  <p className="text-[#6E6E78] font-mono text-[13px] pt-1">Payment Method: <span className="font-bold text-[#4A4A55]">{showPrintInvoice.paymentMethod || 'Cash'}</span></p>
                </div>
              </div>

              {/* Itemized Table — Styled with Blue Header Bar */}
              <div className="overflow-hidden rounded-xl border border-[#E8E8EC]">
                <table className="w-full text-left text-[14px]">
                  <thead>
                    <tr className="bg-[#007bff] text-white font-extrabold tracking-wider uppercase text-[13px]">
                      <th className="py-3 px-4">DESCRIPTION</th>
                      <th className="py-3 px-4 text-right">RATE</th>
                      <th className="py-3 px-4 text-center">QTY</th>
                      <th className="py-3 px-4 text-right">TAX</th>
                      <th className="py-3 px-4 text-right">DISC</th>
                      <th className="py-3 px-4 text-right">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {showPrintInvoice.items?.map((item: any, idx: number) => {
                      const price = Number(item.price || 0);
                      const qty = Number(item.quantity || 1);
                      const amount = price * qty;
                      const taxRate = showPrintInvoice.taxRate || 0;
                      const discStr = showPrintInvoice.discountType === 'percentage' ? `${showPrintInvoice.discountValue || 0}%` : '$0';
                      return (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFB]/50'}>
                          <td className="py-3 px-4">
                            <p className="font-bold text-[#16161A]">{item.name}</p>
                            <p className="text-[13px] text-[#9A9AA5]">Genuine Hardware with Official Warranty</p>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">${price.toFixed(2)}</td>
                          <td className="py-3 px-4 text-center font-bold">{qty}</td>
                          <td className="py-3 px-4 text-right text-[#6E6E78]">{taxRate > 0 ? `${taxRate}%` : '0%'}</td>
                          <td className="py-3 px-4 text-right text-[#6E6E78]">{discStr}</td>
                          <td className="py-3 px-4 text-right font-extrabold text-[#16161A]">
                            ${amount.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Invoice Footer Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Payment Instructions & Notes */}
                <div className="space-y-3 text-[14px] text-[#6E6E78]">
                  <div>
                    <h4 className="font-extrabold text-[#16161A] uppercase tracking-wider text-[13px] mb-1">Payment instruction</h4>
                    <p className="text-[#6E6E78] font-medium">Payment Method: <span className="font-bold text-[#4A4A55]">{showPrintInvoice.paymentMethod || 'Cash'}</span></p>
                    <p className="text-[13px] text-[#6E6E78] mt-1">Bank: Meezan Bank Ltd | A/C: 01020304050607</p>
                  </div>
                  {showPrintInvoice.notes && (
                    <div className="bg-[#FAFAFB] p-3 rounded-xl border border-[#F0F0F3]">
                      <h5 className="font-bold text-[13px] uppercase text-[#9A9AA5]">Notes</h5>
                      <p className="text-[#6E6E78] font-medium">{showPrintInvoice.notes}</p>
                    </div>
                  )}
                </div>

                {/* Totals Summary Column */}
                <div className="space-y-2 text-[14px] font-semibold text-[#6E6E78]">
                  <div className="flex justify-between py-1 border-b border-[#F0F0F3]">
                    <span>Subtotal:</span>
                    <span className="font-bold text-[#16161A]">${Number(showPrintInvoice.subtotal || showPrintInvoice.total || 0).toFixed(2)}</span>
                  </div>
                  {showPrintInvoice.discountAmount > 0 && (
                    <div className="flex justify-between py-1 text-red-500 border-b border-[#F0F0F3]">
                      <span>Discount ({showPrintInvoice.discountType === 'percentage' ? `${showPrintInvoice.discountValue}%` : 'fixed'}):</span>
                      <span className="font-bold">-${Number(showPrintInvoice.discountAmount).toFixed(2)}</span>
                    </div>
                  )}
                  {showPrintInvoice.taxAmount > 0 && (
                    <div className="flex justify-between py-1 border-b border-[#F0F0F3]">
                      <span>Sales Tax ({showPrintInvoice.taxRate || 0}%):</span>
                      <span className="font-bold">+${Number(showPrintInvoice.taxAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-[#F0F0F3]">
                    <span>Shipping Cost:</span>
                    <span className="font-bold">+${Number(showPrintInvoice.shippingCharges || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#E8E8EC] text-[15px] font-bold text-[#16161A]">
                    <span>Total:</span>
                    <span>${Number(showPrintInvoice.total || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F0F0F3] text-[14px]">
                    <span>Amount paid:</span>
                    <span className="font-bold">${Number(showPrintInvoice.total || 0).toFixed(2)}</span>
                  </div>

                  {/* Highlighted Balance Due Box */}
                  <div className="bg-[#e0f2fe] border border-[#007bff]/30 p-3 rounded-xl flex justify-between items-center text-[15px] mt-3">
                    <span className="font-black text-[#0369a1] uppercase tracking-wider text-[14px]">Balance Due:</span>
                    <span className="font-black text-[#0369a1] text-[17px]">
                      $0.00
                    </span>
                  </div>
                </div>
              </div>

              {/* Signature & Print Actions */}
              <div className="pt-6 border-t border-[#F0F0F3] flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="text-[13px] text-[#9A9AA5] font-semibold max-w-xs">
                  Thank you for choosing Adamjee Computers! For queries or warranty claims, contact support@adamjeecomputers.com
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <svg width="110" height="35" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#007bff]">
                    <path d="M10 28 C 22 8, 35 35, 50 12 C 60 4, 70 32, 82 18 C 92 8, 102 32, 115 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  </svg>
                  <div className="border-t border-[#DCDCE3] w-36 text-center pt-1 text-[13px] font-bold text-[#6E6E78] uppercase tracking-wider">
                    Authorized Signature
                  </div>
                </div>
              </div>

              {/* Print Action Buttons (hidden during printing) */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#F0F0F3] print:hidden">
                <button
                  onClick={() => handlePrintInvoicePDF(showPrintInvoice)}
                  className="px-6 py-2.5 bg-[#007bff] hover:bg-[#0056b3] text-white font-bold rounded-xl text-[14px] shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Save & print
                </button>
                <button
                  onClick={() => setShowPrintInvoice(null)}
                  className="px-5 py-2.5 border border-[#E8E8EC] hover:bg-[#FAFAFB] text-[#6E6E78] font-bold rounded-xl text-[14px] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      {/* Selected Inventory Product Detail Drawer modal */}

      {/* Floating Toast Notification Banner */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="admin-toast fixed bottom-6 left-1/2 z-[99999] flex items-center gap-3 pl-3 pr-4 py-3
                     bg-white rounded-2xl border border-[#EDEDF0] shadow-[0_16px_40px_-8px_rgba(11,11,18,0.28)]"
        >
          <span className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-[18px] h-[18px]" strokeWidth={2.2} />
          </span>
          <span className="text-[15px] font-medium text-[#16161A] pr-1">{toastMsg}</span>
          <button
            onClick={() => setToastMsg('')}
            aria-label="Dismiss"
            className="w-7 h-7 rounded-xl inline-flex items-center justify-center text-[#9A9AA5]
                       hover:bg-[#F2F2F5] hover:text-[#16161A] active:scale-90 transition-all duration-200 cursor-pointer flex-shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>
      )}

      {/* Create / Edit Collection Modal */}
      {showCreateCollectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-[#F0F0F3] animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-[#F0F0F3] pb-4 mb-1">
              <h3 className="font-bold text-[17px] text-[#16161A]">
                {editingCollection ? `Edit Collection: ${editingCollection.name}` : 'Create New Collection'}
              </h3>
              <button onClick={() => setShowCreateCollectionModal(false)} className="text-[#9A9AA5] hover:text-[#6E6E78]"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3 text-[14px]">
              <div>
                <label className="block font-bold text-[#16161A] mb-1">Collection Name *</label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={e => setNewCollectionName(e.target.value)}
                  placeholder="e.g. Gaming Rigs, Monitors, Headphones..."
                  className="w-full px-3 py-2 border border-[#DCDCE3] rounded-[10px] focus:outline-none focus:border-[#5B32F0]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#16161A] mb-1">Subtext / Tagline</label>
                <input
                  type="text"
                  value={newCollectionSubtext}
                  onChange={e => setNewCollectionSubtext(e.target.value)}
                  placeholder="e.g. High Performance Gaming Systems, Mechanical RGB..."
                  className="w-full px-3 py-2 border border-[#DCDCE3] rounded-[10px] focus:outline-none focus:border-[#5B32F0]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#16161A] mb-1">Category Cover Image</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={newCollectionImage}
                    onChange={e => setNewCollectionImage(e.target.value)}
                    placeholder="/images/custom_blue_gaming_pc_cases_1780242165601.png or upload file..."
                    className="flex-1 px-3 py-2 border border-[#DCDCE3] rounded-[10px] text-[14px] focus:outline-none focus:border-[#5B32F0]"
                  />
                  <label className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[12px] text-[14px] font-semibold bg-[#5B32F0] text-white hover:bg-[#4A25CE] hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(91,50,240,0.32)] active:scale-[0.97] transition-all duration-200 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const res = await compressImageFile(file, 600, 0.8);
                            if (res) {
                              setNewCollectionImage(res);
                              showToast('Category image uploaded & optimized!');
                            }
                          } catch (err) {
                            const reader = new FileReader();
                            reader.onload = ev => {
                              const res = ev.target?.result as string;
                              if (res) {
                                setNewCollectionImage(res);
                                showToast('Category image uploaded successfully!');
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-[13px] text-[#9A9AA5] mt-1">Upload a category image or pick one to display on the storefront category card.</p>
                {newCollectionImage && (
                  <div className="mt-2 p-2 border border-[#E8E8EC] rounded-[10px] bg-[#FAFAFB] flex items-center gap-3">
                    <img src={newCollectionImage} alt="Preview" className="w-12 h-12 object-contain rounded-[10px] border bg-white" />
                    <span className="text-[13px] font-bold text-emerald-700">✓ Image ready to save</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-[#16161A] mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={newCollectionDescription}
                  onChange={e => setNewCollectionDescription(e.target.value)}
                  placeholder="Brief summary of what this collection offers..."
                  className="w-full px-3 py-2 border border-[#DCDCE3] rounded-[10px] focus:outline-none focus:border-[#5B32F0]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowCreateCollectionModal(false)}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[12px] text-[14px] font-semibold bg-white text-[#16161A] border border-[#E8E8EC] hover:bg-[#F7F7F9] hover:border-[#DCDCE3] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(16,16,26,0.08)] active:scale-[0.97] transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={collectionSaving}
                onClick={async () => {
                  if (!newCollectionName.trim()) {
                    alert('Please enter a collection name');
                    return;
                  }
                  setCollectionSaving(true);
                  try {
                    const endpoint = editingCollection
                      ? `/api/collections/${encodeURIComponent(editingCollection.name)}`
                      : '/api/collections';
                    const method = editingCollection ? 'PUT' : 'POST';

                    const res = await fetch(endpoint, {
                      method,
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                      },
                      body: JSON.stringify({
                        name: newCollectionName.trim(),
                        subtext: newCollectionSubtext.trim() || 'Premium Tech Products',
                        image: newCollectionImage.trim(),
                        description: newCollectionDescription.trim(),
                      }),
                    });

                    const catKey = newCollectionName.trim().toLowerCase();
                    if (newCollectionImage.trim()) {
                      try {
                        localStorage.setItem(`adamjee_cat_img_${catKey}`, newCollectionImage.trim());
                        const savedCustomImgs = JSON.parse(localStorage.getItem('adamjee_custom_category_images') || '{}');
                        savedCustomImgs[catKey] = newCollectionImage.trim();
                        savedCustomImgs[newCollectionName.trim()] = newCollectionImage.trim();
                        localStorage.setItem('adamjee_custom_category_images', JSON.stringify(savedCustomImgs));
                      } catch (e) {}
                    }

                    // Update collections state immediately so UI updates instantly (0ms)
                    setCollections(prevCols => {
                      const copy = [...prevCols];
                      const targetIdx = copy.findIndex(c => c.name?.toLowerCase() === catKey || c.slug?.toLowerCase() === catKey);
                      const updatedObj = {
                        _id: editingCollection?._id || `col-${Date.now()}`,
                        name: newCollectionName.trim(),
                        subtext: newCollectionSubtext.trim() || 'Premium Tech Products',
                        image: newCollectionImage.trim(),
                        description: newCollectionDescription.trim(),
                      };
                      if (targetIdx !== -1) {
                        copy[targetIdx] = { ...copy[targetIdx], ...updatedObj };
                      } else {
                        copy.push(updatedObj);
                      }
                      return copy;
                    });

                    showToast(`Collection "${newCollectionName}" saved successfully!`);
                    window.dispatchEvent(new CustomEvent('adamjee_collections_updated'));
                    setShowCreateCollectionModal(false);
                    setEditingCollection(null);
                  } catch (e) {
                    alert('Network error while saving collection');
                  } finally {
                    setCollectionSaving(false);
                  }
                }}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[12px] text-[14px] font-semibold bg-[#5B32F0] text-white hover:bg-[#4A25CE] hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(91,50,240,0.32)] active:scale-[0.97] transition-all duration-200 cursor-pointer"
              >
                {collectionSaving ? 'Saving...' : editingCollection ? 'Update Collection' : 'Create Collection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete collection confirmation */}
      {confirmDeleteCollection && (
        <Modal
          open
          onClose={() => setConfirmDeleteCollection(null)}
          title="Delete collection"
          subtitle="Products stay in your catalogue — only the grouping is removed."
          icon={Trash2}
          tone="danger"
          size="sm"
          footer={
            <>
              <Btn icon={X} onClick={() => setConfirmDeleteCollection(null)}>Cancel</Btn>
              <Btn
                variant="danger"
                icon={Trash2}
                onClick={async () => {
                  const col = confirmDeleteCollection;
                  setConfirmDeleteCollection(null);
                  try {
                    const res = await fetch(`/api/collections/${encodeURIComponent(col.name)}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
                    });
                    if (res.ok) {
                      showToast(`Collection "${col.name}" deleted.`);
                      window.dispatchEvent(new CustomEvent('adamjee_collections_updated'));
                      loadData(localStorage.getItem('token') || '');
                    } else {
                      showToast('Failed to delete collection.');
                    }
                  } catch {
                    showToast('Failed to delete collection.');
                  }
                }}
              >
                Delete
              </Btn>
            </>
          }
        >
          <p className="text-[15px] text-[#4A4A55] leading-relaxed">
            Delete <strong className="text-[#16161A] font-semibold">{confirmDeleteCollection.name}</strong>?
          </p>
        </Modal>
      )}

      {/* Custom Delete Product Modal Dialog */}
      {confirmDeleteProduct && (
        <Modal
          open
          onClose={() => setConfirmDeleteProduct(null)}
          title="Delete product"
          subtitle="This action is permanent and cannot be undone."
          icon={Trash2}
          tone="danger"
          size="sm"
          footer={
            <>
              <Btn icon={X} onClick={() => setConfirmDeleteProduct(null)}>Cancel</Btn>
              <Btn variant="danger" icon={Trash2} onClick={() => executeProductDeletion(confirmDeleteProduct)}>
                Delete product
              </Btn>
            </>
          }
        >
          <p className="text-[15px] text-[#4A4A55] leading-relaxed">
            Are you sure you want to delete{' '}
            <strong className="text-[#16161A] font-semibold">{confirmDeleteProduct.name}</strong>?
          </p>
          <div className="mt-3 rounded-xl bg-[#FAFAFB] border border-[#EDEDF0] px-4 py-3 text-[14px] text-[#6E6E78]">
            SKU <span className="font-medium text-[#16161A]">{confirmDeleteProduct.code || 'N/A'}</span>
            {' · '}Stock <span className="font-medium text-[#16161A]">{confirmDeleteProduct.stock ?? 0}</span>
          </div>
        </Modal>
      )}
    </div>
  );
}
