'use client';
import Link from 'next/link';
import React from "react";

import { Product } from "../types";
import { getProductImage } from "../utils/storage";
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react";

interface CartPageProps {
  cart: { product: Product; qty: number }[];
  setCart: React.Dispatch<React.SetStateAction<{ product: Product; qty: number }[]>>;
  formatPrice: (usdAmount: number) => string;
}

export default function CartPage({ cart, setCart, formatPrice }: CartPageProps) {
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const shipping = cart.length > 0 ? 4170 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[#fafbfc] py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <h1 className="text-3xl md:text-4xl font-black text-[#0a1b2d] mb-8">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
            <ShoppingCart className="w-20 h-20 text-gray-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-[#0a1b2d] mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added any products to your cart yet. Discover our premium selection and find the perfect gear for your setup.
            </p>
            <Link 
              href="/category/all"
              className="inline-flex items-center gap-2 bg-[#164475] hover:bg-[#0d2a52] text-white px-8 py-4 rounded-full font-bold transition-all shadow-md hover:shadow-lg"
            >
              Start Shopping <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Cart Items Area */}
            <div className="flex-1 space-y-6">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-4 p-6 border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                <div className="p-6 space-y-6">
                  {cart.map((item, idx) => (
                    <div key={item.product.id || (item.product as any)._id || idx} className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center relative pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="col-span-1 sm:col-span-6 flex items-center gap-4">
                        <Link href={`/product/${item.product.id || (item.product as any)._id}`} className="w-24 h-24 bg-gray-50 rounded-xl border border-gray-100 p-2 flex-shrink-0 flex items-center justify-center">
                          <img src={getProductImage(item.product)} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </Link>
                        <div>
                          <p className="text-[10px] font-bold text-[#164475] uppercase tracking-wider mb-1">{item.product.code}</p>
                          <Link href={`/product/${item.product.id}`} className="text-[#0a1b2d] font-bold hover:text-[#164475] transition-colors leading-tight">
                            {item.product.name}
                          </Link>
                        </div>
                      </div>

                      <div className="col-span-1 sm:col-span-2 text-left sm:text-center font-bold text-gray-700">
                        <span className="sm:hidden text-gray-400 text-sm font-normal mr-2">Price:</span>
                        {formatPrice(item.product.price)}
                      </div>

                      <div className="col-span-1 sm:col-span-2 flex justify-start sm:justify-center">
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg h-10 w-24">
                          <button 
                            onClick={() => { const pid = item.product.id || (item.product as any)._id; setCart(p => p.map(i => (i.product.id || (i.product as any)._id) === pid && i.qty > 1 ? { ...i, qty: i.qty - 1 } : i)); }}
                            className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-[#164475]"
                          >-</button>
                          <div className="flex-1 text-center font-bold text-sm text-[#0a1b2d]">{item.qty}</div>
                          <button 
                            onClick={() => { const pid = item.product.id || (item.product as any)._id; setCart(p => p.map(i => (i.product.id || (i.product as any)._id) === pid ? { ...i, qty: i.qty + 1 } : i)); }}
                            className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-[#164475]"
                          >+</button>
                        </div>
                      </div>

                      <div className="col-span-1 sm:col-span-2 flex justify-between sm:justify-end items-center">
                        <span className="sm:hidden text-gray-400 text-sm font-normal">Total:</span>
                        <div className="font-black text-[#164475]">
                          {formatPrice(item.product.price * item.qty)}
                        </div>
                        <button 
                          onClick={() => { const pid = item.product.id || (item.product as any)._id; setCart(prev => prev.filter(i => (i.product.id || (i.product as any)._id) !== pid)); }}
                          className="absolute top-0 right-0 sm:static sm:ml-4 text-gray-300 hover:text-[#0a1b2d] transition-colors bg-white border-none cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary Area */}
            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sticky top-24">
                <h3 className="text-xl font-bold text-[#0a1b2d] mb-6 border-b border-gray-100 pb-4">Order Summary</h3>
                
                <div className="space-y-4 mb-6 text-sm font-medium">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#0a1b2d]">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Estimate</span>
                    <span className="font-bold text-[#0a1b2d]">{formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="text-gray-400 italic">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-[#0a1b2d]">Total</span>
                    <div className="text-right">
                      <span className="text-3xl font-black text-[#164475]">{formatPrice(total)}</span>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Incl. all taxes</p>
                    </div>
                  </div>
                </div>

                <Link 
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 bg-[#164475] hover:bg-[#0d2a52] text-white py-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg transform active:scale-[0.98]"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
                
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500 font-medium mb-3">Accepted Payment Methods</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="px-3 py-1 bg-gray-100 rounded text-[#1a1f71] font-black italic text-[11px]">VISA</div>
                    <div className="px-2 py-1 bg-gray-100 rounded flex items-center gap-0.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#0a1b2d] opacity-80 block" />
                      <span className="-ml-1.5 w-3.5 h-3.5 rounded-full bg-yellow-500 opacity-80 block" />
                    </div>
                    <div className="px-2 py-1 bg-gray-100 rounded text-[#003087] font-bold italic text-[10px]">
                      Pay<span className="text-sky-500">Pal</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
