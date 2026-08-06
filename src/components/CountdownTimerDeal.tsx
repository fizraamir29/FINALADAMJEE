'use client';
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowRight as ArrowRightIcon } from "lucide-react";
import { Product } from "../types";

interface CountdownTimerDealProps {
  onAddToCart: (product: Product) => void;
}

function useCountdown(initialHrs = 12, initialMins = 25, initialSecs = 45) {
  const [time, setTime] = useState({ hrs: initialHrs, mins: initialMins, secs: initialSecs });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, mins: 59, secs: 59 };
        return { hrs: initialHrs, mins: 0, secs: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [initialHrs]);

  return time;
}

const pad = (n: number) => String(n).padStart(2, "0");

const DEFAULT_DEAL_CARDS = [
  {
    id: "deal-v1",
    badge: "20% OFF",
    rating: "5.0",
    image: "/images/vr_console_deal_1780250279746.png",
    title: "Gaming Accessories",
    subtitle: "Discounts",
    tagline: "All at unbeatable prices.",
    price: 99,
  },
  {
    id: "deal-v2",
    badge: "30% OFF",
    rating: "4.9",
    image: "/images/laptop_deal_1780250300247.png",
    title: "GPU & Laptop",
    subtitle: "Clearance",
    tagline: "All at unbeatable prices.",
    price: 899,
  },
];

export default function CountdownTimerDeal({ onAddToCart }: CountdownTimerDealProps) {
  const time = useCountdown();
  const sliderRef = useRef<HTMLDivElement>(null);

  const [dealState, setDealState] = useState({
    title: '29" Inch Led Dell',
    code: 'Code u2917w',
    image: '/images/headphones_red_black_1780246535746.png',
    price: 43000,
    cards: DEFAULT_DEAL_CARDS
  });

  const [hasFetched, setHasFetched] = useState(false);

  const fetchSaleProducts = () => {
    // 1. Check saved store settings for flash sale hero info
    try {
      const savedSettings = JSON.parse(localStorage.getItem('store_settings') || '{}');
      if (savedSettings && savedSettings.flashSale) {
        setDealState(prev => ({
          ...prev,
          title: savedSettings.flashSale.title || prev.title,
          code: savedSettings.flashSale.code || prev.code,
          image: savedSettings.flashSale.image || prev.image,
          price: savedSettings.flashSale.price || prev.price,
        }));
      }
    } catch (e) {}

    // 2. Fetch products from API and filter ONLY SALE products
    fetch('/api/products?all=true')
      .then(res => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return null;
        return res.json();
      })
      .then(data => {
        setHasFetched(true);
        if (data && data.success && Array.isArray(data.products) && data.products.length > 0) {
          // Strictly filter products tagged with SALE, FLASH SALE, or discounts (EXCLUDE pure HOT and NEW)
          const saleProducts = data.products.filter((p: any) => {
            const tag = (p.tag || '').trim().toLowerCase();
            const comparePrice = p.compareAtPrice || p.originalPrice || p.cost;
            const hasDiscount = (p.discount && p.discount > 0) || (comparePrice && comparePrice > p.price);
            if (tag === 'hot' || tag === 'new') {
              return hasDiscount; // Include if it also has a price discount/compare price
            }
            return tag === 'sale' || tag === 'flash sale' || tag.includes('off') || hasDiscount;
          });

          const listToMap = saleProducts.length > 0 ? saleProducts : DEFAULT_DEAL_CARDS;
          const mappedCards = listToMap.map((p: any) => {
            const tag = (p.tag || '').trim().toUpperCase();
            const comparePrice = p.compareAtPrice || p.originalPrice || p.cost;
            let badgeText = 'SALE';

            if (comparePrice && comparePrice > p.price) {
              const pct = Math.round(((comparePrice - p.price) / comparePrice) * 100);
              if (pct > 0) badgeText = `${pct}% OFF`;
            } else if (p.discount && p.discount > 0) {
              badgeText = `${p.discount}% OFF`;
            } else if (tag.includes('OFF')) {
              badgeText = tag;
            } else if (p.badge) {
              badgeText = p.badge;
            }

            return {
              id: p._id || p.id || p.code,
              badge: badgeText,
              rating: (p.rating || 5.0).toString(),
              image: p.image || (Array.isArray(p.images) && p.images[0]) || '/images/vr_console_deal_1780250279746.png',
              title: p.name || p.title,
              subtitle: p.category || p.subtitle || 'Special Offer',
              tagline: 'Limited time flash sale deal.',
              price: p.price || 0,
              rawProduct: p
            };
          });

          setDealState(prev => ({ ...prev, cards: mappedCards }));
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchSaleProducts();

    const handleUpdate = () => fetchSaleProducts();
    window.addEventListener('adamjee_new_product', handleUpdate);
    window.addEventListener('adamjee_products_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('adamjee_new_product', handleUpdate);
      window.removeEventListener('adamjee_products_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = 300;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="px-4 md:px-12 py-12 bg-white font-sans">
      {/* Header with Title and View Flash Sale link matching Figma */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
        <div className="space-y-2 max-w-lg text-left">
          <span className="text-xs font-extrabold tracking-widest uppercase text-[#164475]">
            EXCLUSIVE DEALS / FLASH SALE
          </span>
          <h2 className="text-3xl sm:text-[42px] font-black text-black tracking-tight leading-[1.05]">
            Explore Limited-Time<br />Gaming Deals
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 max-w-[580px]">
          <div className="text-gray-500 text-[14.5px] leading-[1.6] text-left space-y-2">
            <p>
              Grab exclusive discounts on gaming PCs, laptops, accessories, and PC components before they're gone. Upgrade your setup with unbeatable offers and flash sale prices.
            </p>
            <Link href="/category/all" className="font-bold text-black border-b-[1.5px] border-black pb-0.5 hover:text-[#164475] hover:border-[#164475] transition-colors inline-flex items-center gap-1.5">
              View Flash Sale <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Countdown hero card matching Figma */}
        <div className="col-span-12 lg:col-span-6 bg-gradient-to-br from-[#07192e] via-[#0b2440] to-[#164475] rounded-[24px] overflow-hidden relative min-h-[460px] shadow-lg">
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 bg-[url('/images/promo_neon_lines.png')] opacity-10 mix-blend-screen bg-cover pointer-events-none" />

          {/* Glowing background blur */}
          <div className="absolute right-0 bottom-0 w-[280px] h-[280px] md:w-[400px] md:h-[400px] bg-white/20 blur-[80px] rounded-full z-0 translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

          {/* Headphone Image matching Figma */}
          <img
            src={dealState.image}
            alt={dealState.title}
            className="absolute right-0 bottom-0 w-[240px] sm:w-[300px] md:w-[360px] lg:w-[400px] object-contain select-none drop-shadow-2xl pointer-events-none z-10 transform -rotate-[4deg] origin-bottom-right"
          />

          <div className="relative z-20 flex flex-col justify-center p-8 md:p-10 lg:pl-12 gap-6 h-full w-full md:w-[65%] text-left">
            <div className="space-y-1 mt-2">
              <p className="text-white/80 text-[14px] font-medium tracking-wide">{dealState.code}</p>
              <h3 className="text-3xl md:text-[36px] font-semibold text-white tracking-tight">
                {dealState.title}
              </h3>
            </div>

            <div className="flex gap-4 pt-1">
              {[
                { val: pad(time.hrs), label: "HOURS" },
                { val: pad(time.mins), label: "MINUTES" },
                { val: pad(time.secs), label: "SECONDS" },
              ].map(({ val, label }) => (
                <div
                  key={label}
                  className="bg-[#0b1c31]/30 border border-white/20 rounded-[10px] w-[72px] h-[78px] flex flex-col items-center justify-center gap-1 backdrop-blur-sm shadow-sm"
                >
                  <p className="text-[32px] font-bold text-white leading-none">{val}</p>
                  <p className="text-[8px] font-bold text-white uppercase tracking-widest mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link
                href="/category/all"
                className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-full text-[15px] hover:scale-105 active:scale-95 transition-transform shadow-md cursor-pointer border-none"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Deal cards slider with bottom-right Figma arrows */}
        <div className="col-span-12 lg:col-span-6 flex flex-col justify-between gap-4">
          <div
            ref={sliderRef}
            className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {dealState.cards.map((card: any, idx: number) => {
              const cardId = card.id || `card-${idx}`;
              return (
                <div
                  key={cardId}
                  className="snap-start flex-shrink-0 w-[260px] sm:w-[280px] bg-[#f7f8f9] rounded-[24px] p-6 flex flex-col justify-between min-h-[420px] group hover:shadow-xl transition-all duration-300 relative border border-gray-100/80"
                >
                  <div className="flex justify-between items-start relative z-10">
                    <span className="bg-[#164475] text-white text-[11px] font-bold tracking-wider px-4 py-1.5 rounded-full uppercase shadow-xs">
                      {card.badge}
                    </span>
                    <div className="bg-white px-3 py-1.5 rounded-full text-[11px] font-bold text-black flex items-center gap-1.5 shadow-sm">
                      <span className="text-[#164475] text-[13px]">★</span>
                      <span>{card.rating}</span>
                    </div>
                  </div>

                  <Link
                    href={`/product/${cardId}`}
                    className="flex-1 flex items-center justify-center py-4 relative z-0 group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="max-h-[175px] w-auto object-contain drop-shadow-xl"
                    />
                  </Link>

                  <div className="relative z-10">
                    <div className="flex justify-between items-end gap-2 text-left">
                      <Link href={`/product/${cardId}`} className="block flex-1 hover:underline">
                        <h4 className="text-[17px] font-bold text-black tracking-tight leading-[1.2] mb-1 line-clamp-2">
                          {card.title}
                        </h4>
                        <p className="text-gray-500 text-[12px] font-medium truncate">{card.tagline}</p>
                      </Link>
                      <button
                        onClick={() =>
                          onAddToCart(
                            card.rawProduct || {
                              id: cardId,
                              name: card.title,
                              code: cardId,
                              price: card.price,
                              rating: parseFloat(card.rating),
                              image: card.image,
                            }
                          )
                        }
                        className="w-10 h-10 rounded-full bg-[#164475] text-white hover:bg-[#0a1b2d] flex items-center justify-center transition-all duration-300 cursor-pointer flex-shrink-0 -mr-1 shadow-sm border-none"
                        aria-label="Add product to cart"
                      >
                        <ArrowRightIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Figma-Matched Navigation Buttons at bottom right */}
          <div className="flex justify-end gap-3 pt-2 pr-2">
            <button
              onClick={() => scroll("left")}
              className="w-11 h-11 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-black hover:border-gray-400 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-xs"
              aria-label="Previous deals"
            >
              <ArrowLeft className="w-5 h-5 stroke-[1.8]" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-11 h-11 rounded-full bg-[#164475] hover:bg-[#0a1b2d] text-white flex items-center justify-center transition active:scale-95 cursor-pointer border-none shadow-md"
              aria-label="Next deals"
            >
              <ArrowRight className="w-5 h-5 stroke-[1.8]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
