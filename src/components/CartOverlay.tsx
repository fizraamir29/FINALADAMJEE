'use client';

import React from "react";
import { ShoppingCart, X, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Product } from "../types";
import { getProductImage, getCategoryFallbackImage } from "../utils/storage";

interface CartOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  cart: { product: Product; qty: number }[];
  setCart: React.Dispatch<React.SetStateAction<{ product: Product; qty: number }[]>>;
  formatPrice: (usdAmount: number) => string;
}

export default function CartOverlay({ isOpen, onClose, cart, setCart, formatPrice }: CartOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#0a1b2d]/60 backdrop-blur-md animate-fade-in">
      {/* Sliding Panel — Sleek Compact 380px Width matching Client Request */}
      <div className="w-full max-w-sm sm:max-w-[380px] bg-white h-screen shadow-2xl flex flex-col animate-slide-in-right relative overflow-hidden rounded-l-[32px] border-l border-gray-100">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-[#f1f5f9] bg-white/90 backdrop-blur-xl z-10">
          <h3 className="text-xl font-extrabold text-[#0a1b2d] flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#f0f7ff] rounded-full flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-[#164475]" />
            </div>
            Your Cart <span className="text-[#94a3b8] text-sm font-semibold">({cart.reduce((a, b) => a + b.qty, 0)})</span>
          </h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f8fafc] text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#0a1b2d] transition-all border-none outline-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Items Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 chat-scroll bg-[#fafbfc]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 border border-[#f1f5f9] relative">
                <ShoppingCart className="w-10 h-10 text-[#cbd5e1]" />
              </div>
              <h3 className="text-xl font-extrabold text-[#0a1b2d] mb-1">Cart is empty</h3>
              <p className="text-xs text-[#64748b] max-w-[220px] mb-6 font-medium leading-relaxed">No items in your cart yet.</p>
              <Link 
                href="/category/all" 
                onClick={onClose}
                className="bg-[#164475] text-white text-xs px-6 py-3 rounded-full font-bold shadow-md hover:bg-[#0a1b2d] transition-all flex items-center gap-2"
              >
                Start Shopping <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            cart.map((item, i) => {
              const itemId = item.product.id || (item.product as any)._id || `cart-${i}`;
              return (
                <div 
                  key={itemId} 
                  className="group flex gap-3.5 bg-white p-3.5 rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all"
                >
                  {/* Thumbnail Image */}
                  <div className="w-16 h-16 rounded-xl bg-[#f8fafc] border border-[#f1f5f9] p-1.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={getProductImage(item.product)}
                      alt={item.product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      style={{ mixBlendMode: 'multiply' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getCategoryFallbackImage(item.product.category, item.product.name);
                      }}
                    />
                  </div>
                  
                  {/* Item Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs font-bold text-[#0a1b2d] line-clamp-2 leading-snug">{item.product.name}</h4>
                        <button 
                          onClick={() => setCart(prev => prev.filter(c => (c.product.id || (c.product as any)._id) !== itemId))}
                          className="text-gray-300 hover:text-red-500 transition-colors p-0.5 cursor-pointer border-none bg-transparent"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide mt-0.5">{item.product.code || 'SKU_ADAMJEE'}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-50">
                      <p className="text-sm font-black text-[#164475]">{formatPrice(item.product.price)}</p>
                      
                      <div className="flex items-center bg-[#f8fafc] rounded-full border border-[#e2e8f0] px-1">
                        <button 
                          onClick={() => setCart(p => p.map(c => ((c.product.id || (c.product as any)._id) === itemId && c.qty > 1) ? { ...c, qty: c.qty - 1 } : c))}
                          className="w-6 h-6 flex items-center justify-center text-[#64748b] hover:text-[#164475] font-bold text-sm hover:bg-white rounded-full transition-colors cursor-pointer border-none bg-transparent"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-[#0a1b2d]">{item.qty}</span>
                        <button 
                          onClick={() => setCart(p => p.map(c => (c.product.id || (c.product as any)._id) === itemId ? { ...c, qty: c.qty + 1 } : c))}
                          className="w-6 h-6 flex items-center justify-center text-[#64748b] hover:text-[#164475] font-bold text-sm hover:bg-white rounded-full transition-colors cursor-pointer border-none bg-transparent"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Area */}
        {cart.length > 0 && (
          <div className="bg-white p-6 border-t border-[#f1f5f9] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10">
            <div className="flex justify-between items-end mb-4">
              <span className="text-[#64748b] font-bold text-xs uppercase tracking-widest">Grand Total</span>
              <span className="text-xl font-black text-[#0a1b2d] tracking-tight">
                {formatPrice(cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0))}
              </span>
            </div>
            
            <div className="space-y-2.5">
              <Link 
                href="/checkout"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 bg-[#164475] hover:bg-[#0a1b2d] text-white py-3.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Secure Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/cart"
                onClick={onClose}
                className="w-full flex items-center justify-center bg-[#f8fafc] hover:bg-[#e2e8f0] text-[#0a1b2d] py-3 rounded-xl text-xs font-bold transition-colors border border-[#e2e8f0] cursor-pointer"
              >
                View Full Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
