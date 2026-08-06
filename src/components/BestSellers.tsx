'use client';

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Product } from "../types";
import { getProducts } from "../utils/storage";
import ProductCard from "./ProductCard";

interface BestSellersProps {
  bundle: Product[];
  onToggleBundle: (product: Product) => void;
  onAddBundleToCart: () => void;
  showBundleMessage: boolean;
  formatPrice: (usdAmount: number) => string;
}

export default function BestSellers({
  bundle,
  onToggleBundle,
  onAddBundleToCart,
  showBundleMessage,
  formatPrice
}: BestSellersProps) {
  
  const handleApplyBundleDiscount = (subtotal: number) => {
    return bundle.length >= 2 ? subtotal * 0.7 : subtotal;
  };

  const [bundleProducts, setBundleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const isBundleTag = (t?: string) => {
    const tag = (t || '').trim().toLowerCase();
    return tag === 'bundle' || tag === 'best seller' || tag === 'bestseller' || tag === 'add to bundle' || tag === 'hot' || tag === 'new';
  };

  const loadBundleProducts = React.useCallback(() => {
    // 1. Instant synchronous load from storage/memory
    const stored = getProducts();
    if (stored && stored.length > 0) {
      const initialBundles = stored.filter((p: any) => isBundleTag(p.tag));
      const listToUse = initialBundles.length > 0 ? initialBundles : stored;
      setBundleProducts(listToUse.slice(0, 4));
      setLoading(false);
    }

    // 2. Fetch live data from API
    fetch('/api/products?all=true')
      .then(res => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return null;
        return res.json();
      })
      .then(data => {
        if (data && data.success && Array.isArray(data.products) && data.products.length > 0) {
          const taggedBundles = data.products.filter((p: any) => isBundleTag(p.tag));
          const finalBundles = taggedBundles.length > 0 ? taggedBundles : data.products;
          setBundleProducts(finalBundles.slice(0, 4));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadBundleProducts();

    const handleUpdate = () => loadBundleProducts();
    window.addEventListener('adamjee_new_product', handleUpdate);
    window.addEventListener('adamjee_products_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('adamjee_new_product', handleUpdate);
      window.removeEventListener('adamjee_products_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadBundleProducts]);

  const bundleTotal = bundle.reduce((a, b) => a + b.price, 0);
  const discountedTotal = handleApplyBundleDiscount(bundleTotal);

  return (
    <section id="best-sellers" className="px-4 md:px-12 py-16 relative z-10 bg-white font-sans">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Section Header spanning full width */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pb-8 text-left">
          <div className="lg:col-span-2">
            <span className="text-[#164475] text-xs uppercase font-extrabold tracking-widest px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
              Bundle & Save Up to 30%
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-[#0a1b2d] mt-3 tracking-tight">
              Best Sellers <span className="text-[#164475]">& Bundle Deals</span>
            </h2>
            <p className="text-gray-500 text-sm md:text-base mt-2 max-w-xl">
              Combine top-tier gaming peripherals and components. Select 2 or more items to unlock an automatic <span className="font-bold text-[#164475]">30% bundle discount</span>!
            </p>
          </div>

          {/* Bundle Cart Sticky Widget */}
          <div className="bg-[#0a1b2d] rounded-2xl p-5 text-white shadow-xl border border-gray-800">
            <div className="flex justify-between items-center pb-3 border-b border-gray-800">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Bundle Status</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#164475] text-white">
                {bundle.length} / {bundleProducts.length || 4} Selected
              </span>
            </div>

            <div className="my-4 space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Subtotal:</span>
                <span className="line-through">{formatPrice(bundleTotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white">
                <span>Bundle Total:</span>
                <span className="text-emerald-400 text-lg">{formatPrice(discountedTotal)}</span>
              </div>
              {bundle.length >= 2 && (
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                  <span>🎉 30% Discount Applied!</span>
                </div>
              )}
            </div>

            <button
              onClick={onAddBundleToCart}
              disabled={bundle.length === 0}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                bundle.length > 0
                  ? "bg-[#164475] hover:bg-[#0f3256] text-white shadow-lg cursor-pointer"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              Add Selected ({bundle.length}) to Cart
            </button>
            {showBundleMessage && (
              <p className="text-xs text-emerald-400 text-center mt-2 font-medium animate-pulse">
                ✓ Added bundle to your cart!
              </p>
            )}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bundleProducts.map((product) => {
            const isSelected = bundle.some((b) => b.id === product.id || b._id === product._id);
            return (
              <div key={product._id || product.id} className="relative group">
                <div className={`transition-all rounded-2xl ${isSelected ? 'ring-2 ring-[#164475] shadow-lg' : ''}`}>
                  <ProductCard product={product} formatPrice={formatPrice} />

                  <div className="p-4 pt-0">
                    <button
                      onClick={() => onToggleBundle(product)}
                      className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 border ${
                        isSelected
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                          : "bg-gray-50 border-gray-200 text-[#0a1b2d] hover:bg-[#164475] hover:text-white hover:border-[#164475]"
                      }`}
                    >
                      {isSelected ? "✓ Selected in Bundle" : "+ Add to Bundle"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
