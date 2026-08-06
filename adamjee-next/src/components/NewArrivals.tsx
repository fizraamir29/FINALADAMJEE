'use client';
import React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Product } from "../types";
import ProductCard from "./ProductCard";

interface NewArrivalsProps {
  onAddToCart: (product: Product) => void;
  formatPrice: (usdAmount: number) => string;
}

export default function NewArrivals({ onAddToCart, formatPrice }: NewArrivalsProps) {
  const [products, setProducts] = React.useState<Product[]>([]);

  const loadNewArrivals = React.useCallback(() => {
    fetch('/api/products?all=true')
      .then(res => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return null;
        return res.json();
      })
      .then(data => {
        if (data && data.success && Array.isArray(data.products) && data.products.length > 0) {
          const taggedNew = data.products.filter((p: any) =>
            (p.tag || '').trim().toLowerCase() === 'new'
          );
          if (taggedNew.length >= 6) {
            setProducts(taggedNew.slice(0, 6));
          } else {
            const list: any[] = [...taggedNew];
            for (const p of data.products) {
              if (list.length >= 6) break;
              const pId = p.id || p._id;
              if (!list.some(item => (item.id || item._id) === pId)) {
                list.push({ ...p, tag: p.tag || 'New' });
              }
            }
            setProducts(list.slice(0, 6));
          }
        }
      })
      .catch(console.error);
  }, []);

  React.useEffect(() => {
    loadNewArrivals();

    const handleUpdate = () => loadNewArrivals();
    window.addEventListener('adamjee_new_product', handleUpdate);
    window.addEventListener('adamjee_products_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('adamjee_new_product', handleUpdate);
      window.removeEventListener('adamjee_products_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadNewArrivals]);



  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section id="new-arrivals" className="px-4 md:px-12 py-16 bg-[#0a1b2d] text-white font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#164475]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">
                Fresh Stock Just Arrived
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mt-2 tracking-tight">
              New <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Arrivals</span>
            </h2>
          </div>

          <Link
            href="/category/all"
            className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors group"
          >
            <span>View Full Catalogue</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}
