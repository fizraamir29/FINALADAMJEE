'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Tag } from "lucide-react";

interface TechCategoriesProps {
  setIsBuilderOpen: (open: boolean) => void;
}

interface BackendCollection {
  _id: string | null;
  name: string;
  slug: string;
  description: string;
  subtext: string;
  image: string;
  link: string;
  isDark: boolean;
  sortOrder: number;
  count: number;
}

// Fallback gradient colours for categories without images
const GRADIENT_PALETTES = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
  'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  'linear-gradient(135deg, #373b44 0%, #4286f4 100%)',
  'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
];

// Fallback high-resolution images matching user requirements
const CATEGORY_FALLBACK_MAP: Record<string, string> = {};

const DEFAULT_COLLECTIONS: BackendCollection[] = [
  { _id: 'cat-1', name: 'Mouse', slug: 'mouse', description: 'Gaming & Ergonomic Mice', subtext: 'Surround yourself in sound', image: '', link: '/category/all?category=Mouse', isDark: true, sortOrder: 1, count: 12 },
  { _id: 'cat-2', name: 'Headphones', slug: 'headphones', description: 'Studio & Gaming Audio', subtext: 'Surround yourself in sound', image: '', link: '/category/all?category=Headphones', isDark: false, sortOrder: 2, count: 15 },
  { _id: 'cat-3', name: 'Earphones', slug: 'earphones', description: 'True Wireless Audio', subtext: 'Surround yourself in sound', image: '', link: '/category/all?category=Earphones', isDark: false, sortOrder: 3, count: 8 },
  { _id: 'cat-4', name: 'Desktops', slug: 'desktops', description: 'Custom Rig PCs', subtext: 'Surround yourself in sound', image: '', link: '/category/all?category=Desktops', isDark: false, sortOrder: 4, count: 6 },
  { _id: 'cat-5', name: 'Accessories', slug: 'accessories', description: 'Keyboards & Peripherals', subtext: 'Surround yourself in sound', image: '', link: '/category/all?category=Accessories', isDark: false, sortOrder: 5, count: 20 },
  { _id: 'cat-6', name: 'Laptops', slug: 'laptops', description: 'Gaming & Professional Laptops', subtext: 'Surround yourself in sound', image: '', link: '/category/all?category=Laptops', isDark: false, sortOrder: 6, count: 10 },
  { _id: 'cat-7', name: 'Monitors', slug: 'monitors', description: 'Ultra-Fast Gaming Displays', subtext: 'Surround yourself in sound', image: '', link: '/category/all?category=Monitors', isDark: false, sortOrder: 7, count: 9 },
  { _id: 'cat-8', name: 'GPUs', slug: 'gpus', description: 'NVIDIA RTX & AMD Radeon', subtext: 'Surround yourself in sound', image: '', link: '/category/all?category=GPUs', isDark: false, sortOrder: 8, count: 14 }
];

export default function TechCategories({ setIsBuilderOpen }: TechCategoriesProps) {
  const [collections, setCollections] = useState<BackendCollection[]>(DEFAULT_COLLECTIONS);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/collections', { cache: 'no-store' });
      if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.collections) && data.collections.length > 0) {
        // Merge with custom category image overrides saved in localStorage
        let savedCustomImgs: Record<string, string> = {};
        try {
          if (typeof window !== 'undefined') {
            savedCustomImgs = JSON.parse(localStorage.getItem('adamjee_custom_category_images') || '{}');
          }
        } catch (e) {}

        const CATEGORY_ORDER: Record<string, number> = {
          'mouse': 1,
          'headphones': 2,
          'earphones': 3,
          'desktops': 4,
          'accessories': 5,
          'laptops': 6,
          'monitors': 7,
          'gpus': 8,
        };

        const list = data.collections.map((c: BackendCollection) => {
          const lowerKey = (c.name || '').toLowerCase();
          const dedicatedKeyImg = typeof window !== 'undefined' ? localStorage.getItem(`adamjee_cat_img_${lowerKey}`) : null;
          const customLocalStorageImg = dedicatedKeyImg || savedCustomImgs[lowerKey] || savedCustomImgs[c.name] || savedCustomImgs[c.slug];
          // User's custom upload from localStorage takes priority so re-fetches never overwrite uploaded images
          const finalImg = customLocalStorageImg || c.image || CATEGORY_FALLBACK_MAP[lowerKey] || '';
          return {
            ...c,
            image: finalImg,
            sortOrder: CATEGORY_ORDER[lowerKey] || 99
          };
        }).sort((a: any, b: any) => (a.sortOrder || 99) - (b.sortOrder || 99));

        if (list.length > 0) {
          setCollections(list);
        }
      }
    } catch (err) {
      console.error('TechCategories: Failed to fetch collections:', err);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchCollections();

    // Re-fetch when admin creates/edits a collection
    const handleUpdate = () => fetchCollections();
    window.addEventListener('adamjee_collections_updated', handleUpdate);
    return () => window.removeEventListener('adamjee_collections_updated', handleUpdate);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 380;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-gray-400 font-sans">
        Loading Categories...
      </div>
    );
  }

  return (
    <section className="py-12 bg-white overflow-hidden text-left border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-[36px] sm:text-[44px] font-black tracking-tight text-[#0f172a] leading-tight text-left">
              Explore Top<br />Tech Categories
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-black transition-colors"
              aria-label="Previous categories"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center hover:bg-[#1e40af] transition-colors shadow-sm"
              aria-label="Next categories"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-auto pb-6 pt-2 scrollbar-none scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {collections.length === 0 ? (
            <div className="flex items-center justify-center w-full py-16 text-gray-400 text-sm">
              No categories yet. Add products from the Admin Panel to see categories here.
            </div>
          ) : (
            collections.map((col, idx) => {
              const formattedCount = (idx + 1) < 10 ? `0${idx + 1}` : `${idx + 1}`;
              const href = col.link || `/category/all?category=${encodeURIComponent(col.name)}`;
              const lowerKey = (col.name || '').toLowerCase();

              let savedCustomImgs: Record<string, string> = {};
              let dedicatedKeyImg: string | null = null;
              if (isMounted && typeof window !== 'undefined') {
                try {
                  savedCustomImgs = JSON.parse(localStorage.getItem('adamjee_custom_category_images') || '{}');
                  dedicatedKeyImg = localStorage.getItem(`adamjee_cat_img_${lowerKey}`);
                } catch (e) {}
              }

              // Pure dynamic image with localStorage custom upload priority once mounted
              const dynamicImg = (isMounted && dedicatedKeyImg) || (isMounted && savedCustomImgs[lowerKey]) || (isMounted && savedCustomImgs[col.name]) || col.image || CATEGORY_FALLBACK_MAP[lowerKey] || '';

              if (col.isDark || idx === 0 || lowerKey === 'mouse') {
                return (
                  <div
                    key={col._id || col.name}
                    className="relative h-[422px] min-w-[320px] sm:min-w-[368px] max-w-[368px] w-full rounded-[24px] overflow-hidden group flex flex-col justify-end p-8 shadow-md hover:shadow-2xl transition-all duration-500 flex-shrink-0 bg-[#111]"
                  >
                    {dynamicImg && (
                      <img
                        src={dynamicImg}
                        suppressHydrationWarning
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        alt={col.name}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
                    <div className="relative flex justify-between items-end text-white z-10 w-full">
                      <div className="space-y-1 text-left">
                        <Link href={href} className="hover:underline">
                          <h3 className="text-[28px] font-semibold tracking-tight flex items-start gap-1 text-white">
                            {col.name} <sup className="text-[10px] font-normal text-white/80 mt-1">{formattedCount}</sup>
                          </h3>
                        </Link>
                        <p className="text-[13px] text-white/80 font-normal">{col.subtext}</p>
                      </div>
                      <Link
                        href={href}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-black text-white flex items-center justify-center transition-all duration-300 mb-1"
                        aria-label={`View ${col.name}`}
                      >
                        <ArrowRight className="w-4 h-4 stroke-[2]" />
                      </Link>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={col._id || col.name}
                  className="relative h-[422px] min-w-[320px] sm:min-w-[368px] max-w-[368px] w-full rounded-[24px] overflow-hidden group bg-[#f8f9fa] hover:bg-[#f1f3f5] flex flex-col justify-between p-8 transition-all duration-500 border border-gray-100 flex-shrink-0 shadow-sm hover:shadow-xl"
                >
                  <Link href={href} className="relative w-full flex-1 flex items-center justify-center p-4">
                    {dynamicImg ? (
                      <img
                        src={dynamicImg}
                        suppressHydrationWarning
                        className="w-[240px] h-[240px] object-contain transition-transform duration-500 group-hover:scale-105"
                        alt={col.name}
                      />
                    ) : (
                      <div className="w-[240px] h-[240px] flex items-center justify-center bg-gray-100 rounded-2xl text-gray-400 text-xs font-bold">
                        No Image Uploaded
                      </div>
                    )}
                  </Link>

                  <div className="relative flex justify-between items-end text-black z-10 w-full pt-4">
                    <div className="space-y-1 text-left flex-1">
                      <Link href={href} className="hover:underline inline-block">
                        <h3 className="text-[28px] font-semibold tracking-tight flex items-start gap-1 text-[#000000]">
                          <span>{col.name}</span>
                          <sup className="text-[10px] font-normal text-gray-500 mt-1">{formattedCount}</sup>
                        </h3>
                      </Link>
                      <p className="text-[13px] text-gray-500 font-normal mt-1">{col.subtext}</p>
                    </div>

                    <Link
                      href={href}
                      className="w-10 h-10 rounded-full bg-gray-200/60 hover:bg-[#164475] hover:text-white text-black flex items-center justify-center transition-all duration-300 mb-1"
                      aria-label={`View ${col.name}`}
                    >
                      <ArrowRight className="w-4 h-4 stroke-[2]" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
