'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { CheckCircle, Package, Truck, Home, ArrowRight, Mail, Phone, MapPin, Calendar, ShieldCheck, Clock } from 'lucide-react';
import { Product } from '../types';
import { getCategoryFallbackImage, getProductImage } from '../utils/storage';

interface OrderConfirmationPageProps {
  formatPrice?: (n: number) => string;
}

const steps = [
  { icon: CheckCircle, label: 'Order Placed', desc: 'We have received your order', done: true },
  { icon: Package,     label: 'Processing',   desc: 'Your build is being assembled', done: true },
  { icon: Truck,       label: 'Shipped',      desc: 'Courier will pick up soon', done: false },
  { icon: Home,        label: 'Delivered',    desc: 'Delivery within 3-5 days', done: false },
];

export default function OrderConfirmationPage({ formatPrice }: OrderConfirmationPageProps) {
  const pathname = usePathname();
  const [order, setOrder] = useState<any>(null);
  const [checked, setChecked] = useState(false);
  const fmt = formatPrice ?? ((n: number) => `Rs. ${Math.round(n).toLocaleString('en-PK')}`);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // The order just placed, handed over by the checkout page. There is no
      // invented fallback: landing here without one shows a real empty state.
      const savedOrder = sessionStorage.getItem('lastOrder');
      if (savedOrder) {
        try {
          setOrder(JSON.parse(savedOrder));
        } catch (e) {
          setOrder(null);
        }
      }
      setChecked(true);
    }
  }, []);

  if (!order) {
    if (!checked) return null;
    return (
      <div className="min-h-screen bg-[#fafbfc] pt-32 pb-24 font-sans flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-3xl font-black text-[#0a1b2d] mb-3">No recent order found</h1>
          <p className="text-gray-500 mb-6">We could not find a recently placed order in this browser session.</p>
          <Link href="/account" className="inline-block bg-[#164475] text-white px-6 py-3 rounded-xl font-bold">
            View your orders
          </Link>
        </div>
      </div>
    );
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'card': return 'Credit / Debit Card';
      case 'bank': return 'Direct Bank Transfer';
      case 'cod': return 'Cash on Delivery';
      default: return method;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-32 pb-24 font-sans">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Success Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500/20 shadow-md">
            <CheckCircle className="w-10 h-10 text-green-600 animate-scale-in" />
          </div>
          <h1 className="text-4xl font-black text-[#0a1b2d] tracking-tight">Thank You For Your Order!</h1>
          <p className="text-gray-500 text-lg mt-2 font-medium">Your setup is being prepared. Order ID: <span className="text-[#164475] font-extrabold font-mono">{order.orderId}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Timeline Progress */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm animate-fade-in-up">
              <h2 className="text-xl font-black text-[#0a1b2d] mb-8 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#164475]" /> Order Progress
              </h2>
              <div className="relative pl-6 border-l-2 border-gray-100 space-y-8 ml-3">
                {steps.map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle Indicator */}
                    <div className={`absolute -left-[37px] top-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                      step.done 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'bg-white border-gray-200 text-gray-400'
                    }`}>
                      <step.icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${step.done ? 'text-[#0a1b2d]' : 'text-gray-400'}`}>{step.label}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Details */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm animate-fade-in-up delay-100">
              <h2 className="text-xl font-black text-[#0a1b2d] mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#164475]" /> Shipping & Delivery Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Shipping Address */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Delivery Address</h3>
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3">
                    <p className="font-extrabold text-[#0a1b2d] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#164475]"></span>
                      {order.shippingAddress?.fullName}
                    </p>
                    <div className="text-sm text-gray-600 space-y-1 pl-4">
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        {order.shippingAddress?.street}
                      </p>
                      <p className="pl-5.5">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode || 'Pakistan'}</p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        {order.shippingAddress?.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delivery details and speed */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Delivery Duration</h3>
                  <div className="bg-green-50/50 rounded-2xl p-5 border border-green-500/10 space-y-3">
                    <p className="font-extrabold text-green-850 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-700" />
                      3–5 Business Days
                    </p>
                    <p className="text-xs text-green-700/80 leading-relaxed pl-6">
                      Once your order is confirmed, your package will be delivered to your address within **3 to 5 business days**. 
                      Your build will be securely shipped using premium protective packaging and maximum safety precautions.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Contact Queries Section */}
            <div className="bg-gradient-to-br from-[#0a1b2d] to-[#03152a] text-white p-6 md:p-8 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden animate-fade-in-up delay-200">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#164475]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-md">
                  <h2 className="text-xl font-black tracking-tight">Need Help or Have a Query?</h2>
                  <p className="text-sm text-gray-300 leading-relaxed font-medium">
                    If you have any questions about your order or want to request custom adjustments to your build, feel free to drop us an email or message on WhatsApp.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <a href="mailto:support@adamjeecomputers.com" className="flex items-center justify-center gap-2 bg-[#164475] hover:bg-[#1a55a0] text-white font-bold px-5 py-3.5 rounded-xl text-sm transition-all shadow-md">
                    <Mail className="w-4 h-4" />
                    Email Support
                  </a>
                  <a
                    href="https://wa.me/923001234567?text=Hi%2C%20I%20have%20a%20query%20about%20my%20order%20at%20Adamjee%20Computers."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5c] text-white font-bold px-5 py-3.5 rounded-xl text-sm transition-all shadow-md shadow-[#25D366]/20"
                  >
                    {/* Official WhatsApp SVG Logo */}
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp Us
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Right column: Order Summary */}
          <div className="space-y-6 animate-fade-in-up delay-100">
            <div className="bg-white rounded-3xl p-6 md:p-8 text-[#0a1b2d] border border-gray-100 shadow-xl">
              <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-[#0a1b2d]">
                <ShieldCheck className="w-5 h-5 text-[#164475]" /> Summary
              </h3>

              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-[480px] overflow-y-auto pt-3 pb-2 px-1 custom-scrollbar">
                {order.items?.map((item: any, idx: number) => {
                  const itemImg = item.image && item.image.trim().length > 0 && !item.image.includes('placeholder')
                    ? item.image
                    : getCategoryFallbackImage(item.category, item.name);

                  return (
                    <div key={idx} className="flex gap-3.5 items-center">
                      {/* Light grey bg thumbnail — clean on white card */}
                      <div className="w-14 h-14 bg-[#f8fafc] rounded-xl p-1 flex-shrink-0 relative border border-gray-200 shadow-sm overflow-visible flex items-center justify-center">
                        <img
                          src={itemImg}
                          alt={item.name}
                          className="w-full h-full object-contain mix-blend-multiply p-0.5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getCategoryFallbackImage(item.category, item.name);
                          }}
                        />
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#164475] text-white rounded-full flex items-center justify-center text-[10px] font-black z-20 shadow-sm">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold leading-snug text-[#0a1b2d] truncate">{item.name}</h4>
                        <p className="text-[11px] text-[#164475] font-extrabold mt-0.5">{fmt(item.price)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Costing */}
              <div className="border-t border-gray-100 pt-4 space-y-3 mb-4 text-xs font-semibold text-[#64748b]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#0a1b2d] font-bold">{fmt(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Cost</span>
                  <span className="text-[#0a1b2d] font-bold">{fmt(order.shippingCost || 15)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{fmt(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-3 mt-2">
                  <span>Payment Method</span>
                  <span className="text-[#0a1b2d] font-bold capitalize text-[10px]">{getPaymentMethodLabel(order.paymentMethod)}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-sm text-[#0a1b2d]">Total Paid</span>
                  <span className="text-2xl font-black text-[#164475]">{fmt(order.total)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/" className="w-full flex items-center justify-center gap-2 bg-[#164475] hover:bg-[#0a1b2d] text-white py-3.5 rounded-xl font-black text-xs tracking-wider transition-all shadow-md">
                  <Home className="w-4 h-4" /> Continue Shopping
                </Link>
                <Link href="/account" className="w-full flex items-center justify-center gap-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0a1b2d] py-3.5 rounded-xl font-bold text-xs tracking-wider transition-colors border border-gray-200">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
