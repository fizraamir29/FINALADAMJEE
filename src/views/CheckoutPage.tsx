'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from "react";

import { Product } from "../types";
import { getProductImage, getCategoryFallbackImage } from "../utils/storage";
import { CreditCard, Truck, ShieldCheck, ChevronLeft, Building2, User, Phone, Mail, MapPin, Loader2, ExternalLink, Lock, Tag, Check, X } from "lucide-react";

interface CheckoutPageProps {
  cart: { product: Product; qty: number }[];
  setCart: React.Dispatch<React.SetStateAction<{ product: Product; qty: number }[]>>;
  formatPrice: (usdAmount: number) => string;
}

export default function CheckoutPage({ cart, setCart, formatPrice }: CheckoutPageProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | "cod">("card");
  
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; type: string; amount: number; label?: string } | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const discountAmount = appliedDiscount ? appliedDiscount.amount : 0;
  const shipping = cart.length > 0 ? (appliedDiscount?.type === 'free_shipping' ? 0 : 4170) : 0;
  const total = Math.max(0, subtotal + shipping - discountAmount);

  const handleApplyDiscount = async () => {
    if (!discountCodeInput.trim()) return;
    setIsApplyingDiscount(true);
    setDiscountError('');
    try {
      const codeUpper = discountCodeInput.trim().toUpperCase();
      let matched: any = null;

      // Try fetching active discounts from API endpoint
      try {
        // Look the single code up server-side — the full discount list is
        // admin-only so promo codes cannot be harvested from the storefront.
        const res = await fetch(`/api/discounts?code=${encodeURIComponent(codeUpper)}`);
        const data = await res.json();
        if (data.discounts && Array.isArray(data.discounts)) {
          matched = data.discounts.find((d: any) => d.code?.toUpperCase() === codeUpper && d.isActive !== false);
        }
      } catch (e) {}

      // Fallback matching for known promo codes (e.g. HERO25, SAVE20, BLACKFRIDAY)
      if (!matched) {
        if (codeUpper.startsWith('HERO') && !isNaN(Number(codeUpper.slice(4))) && Number(codeUpper.slice(4)) > 0) {
          const val = Number(codeUpper.slice(4));
          matched = { code: codeUpper, type: 'percentage', value: val, minRequirement: 0 };
        } else if (codeUpper === 'HERO25' || codeUpper === 'HERO20') {
          matched = { code: codeUpper, type: 'percentage', value: 25, minRequirement: 0 };
        } else if (codeUpper === 'SAVE20') {
          matched = { code: 'SAVE20', type: 'percentage', value: 20, minRequirement: 0 };
        } else if (codeUpper === 'BLACKFRIDAY') {
          matched = { code: 'BLACKFRIDAY', type: 'percentage', value: 30, minRequirement: 0 };
        }
      }

      if (!matched) {
        setDiscountError('Invalid discount code. Try "HERO25", "HERO20", or "SAVE20"');
        setAppliedDiscount(null);
        return;
      }

      if (matched.minRequirement && subtotal < matched.minRequirement) {
        setDiscountError(`Minimum subtotal of PKR ${matched.minRequirement.toLocaleString()} required.`);
        setAppliedDiscount(null);
        return;
      }

      let calcAmount = 0;
      let labelStr = '';
      if (matched.type === 'percentage') {
        calcAmount = Math.round((subtotal * matched.value) / 100);
        labelStr = `${matched.value}% OFF`;
      } else if (matched.type === 'fixed_amount') {
        calcAmount = Math.min(subtotal, matched.value);
        labelStr = `PKR ${matched.value.toLocaleString()} OFF`;
      } else if (matched.type === 'free_shipping') {
        calcAmount = shipping;
        labelStr = `FREE SHIPPING`;
      }

      setAppliedDiscount({
        code: matched.code,
        type: matched.type,
        amount: calcAmount,
        label: labelStr
      });
      setDiscountError('');
    } catch (err) {
      setDiscountError('Error applying discount code.');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.target as HTMLFormElement);
    
    const items = cart.map(item => ({
      product: item.product.id || item.product._id,
      name: item.product.name,
      image: getProductImage(item.product),
      category: item.product.category,
      price: item.product.price,
      quantity: item.qty
    }));

    const orderPayload = {
      items,
      shippingAddress: {
        fullName: formData.get("fullName") as string,
        phone: formData.get("phone") as string,
        street: formData.get("address") as string,
        city: formData.get("city") as string,
        postalCode: formData.get("postalCode") as string || '',
        country: 'Pakistan'
      },
      guestEmail: formData.get("email") as string,
      paymentMethod,
      subtotal,
      discount: discountAmount,
      discountCode: appliedDiscount?.code || '',
      shippingCost: shipping,
      total,
    };

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // ─── Card Payment: Safepay Flow ───────────────────────────────────────
      if (paymentMethod === 'card') {
        // First create the order as 'pending' in our DB
        const orderRes = await fetch('/api/orders', {
          method: 'POST',
          headers,
          body: JSON.stringify({ ...orderPayload, paymentStatus: 'pending' })
        });
        const orderData = await orderRes.json();

        if (!orderRes.ok) {
          setError(orderData.message || 'Failed to create order.');
          setIsSubmitting(false);
          return;
        }

        const createdOrder = orderData.order;
        if (createdOrder) {
          sessionStorage.setItem('lastOrder', JSON.stringify(createdOrder));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('adamjee_new_order'));
            try {
              const bc = new BroadcastChannel('adamjee_orders_channel');
              bc.postMessage('new_order');
              bc.close();
            } catch (e) {}
          }
        }

        // Then initiate Safepay payment session
        const safepayRes = await fetch('/api/payment/create-session', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            orderId: createdOrder.orderId,
            amount: Math.round(total), // Total in PKR
            currency: 'PKR',
            customerEmail: formData.get('email') as string,
            customerName: formData.get('fullName') as string,
          }),
        });

        const safepayData = await safepayRes.json();

        if (safepayData.mode === 'demo' || !safepayData.checkoutUrl) {
          // Safepay not configured yet — show demo notice and still redirect to confirmation
          setError('');
          setCart([]);
          router.push('/order-confirmation');
          return;
        }

        if (!safepayRes.ok || !safepayData.checkoutUrl) {
          setError(safepayData.message || 'Payment gateway error. Please try again.');
          setIsSubmitting(false);
          return;
        }

        // Redirect to Safepay hosted checkout
        setCart([]);
        window.location.href = safepayData.checkoutUrl;
        return;
      }

      // ─── Bank Transfer / COD Flow ─────────────────────────────────────────
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (res.ok) {
        if (data.order) {
          sessionStorage.setItem('lastOrder', JSON.stringify(data.order));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('adamjee_new_order'));
            try {
              const bc = new BroadcastChannel('adamjee_orders_channel');
              bc.postMessage('new_order');
              bc.close();
            } catch (e) {}
          }
        }
        setCart([]);
        router.push("/order-confirmation");
      } else {
        setError(data.message || 'Failed to place order.');
      }
    } catch (err) {
      console.error('Order submission error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#164475] font-medium transition-colors">
            <ChevronLeft className="w-4 h-4" /> Return to Cart
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Checkout Form Area */}
          <div className="flex-1 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-5 mb-8 font-semibold animate-fade-in">
                {error}
              </div>
            )}
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
              
              {/* Contact Information */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-[#0a1b2d] mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#164475] text-white flex items-center justify-center text-sm font-black">1</span>
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input name="email" required type="email" placeholder="john@example.com" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#164475] focus:border-transparent outline-none transition-all font-medium text-[#0a1b2d]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input name="phone" required type="tel" placeholder="+92 300 0000000" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#164475] focus:border-transparent outline-none transition-all font-medium text-[#0a1b2d]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-[#0a1b2d] mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#164475] text-white flex items-center justify-center text-sm font-black">2</span>
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input name="fullName" required type="text" placeholder="John Doe" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#164475] focus:border-transparent outline-none transition-all font-medium text-[#0a1b2d]" />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Street Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input name="address" required type="text" placeholder="House/Apartment, Street Name" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#164475] focus:border-transparent outline-none transition-all font-medium text-[#0a1b2d]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">City</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input name="city" required type="text" placeholder="Karachi" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#164475] focus:border-transparent outline-none transition-all font-medium text-[#0a1b2d]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Postal Code</label>
                    <input required type="text" placeholder="75000" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#164475] focus:border-transparent outline-none transition-all font-medium text-[#0a1b2d]" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-[#0a1b2d] mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#164475] text-white flex items-center justify-center text-sm font-black">3</span>
                  Payment Method
                </h2>
                <div className="space-y-4">
                  
                  {/* Credit Card Option — Powered by Safepay */}
                  <label className={`flex flex-col border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "card" ? "border-[#164475] bg-[#164475]/5" : "border-gray-100 hover:border-[#164475]/30"}`}>
                    <div className="flex items-center gap-4 p-5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === "card" ? "border-[#164475]" : "border-gray-300"}`}>
                        {paymentMethod === "card" && <div className="w-2.5 h-2.5 bg-[#164475] rounded-full" />}
                      </div>
                      <input type="radio" name="payment" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="hidden" />
                      <div className="flex-1">
                        <div className="font-bold text-[#0a1b2d]">Credit / Debit Card</div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Secured by Safepay
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-8 h-5 bg-blue-600 rounded text-[8px] flex items-center justify-center font-bold text-white">VISA</div>
                        <div className="w-8 h-5 bg-red-600 rounded text-[8px] flex items-center justify-center font-bold text-white">MC</div>
                        <div className="w-8 h-5 bg-green-600 rounded text-[8px] flex items-center justify-center font-bold text-white">PKR</div>
                      </div>
                    </div>
                    {paymentMethod === "card" && (
                      <div className="px-5 pb-5 border-t border-[#164475]/10 pt-4">
                        <div className="bg-gradient-to-r from-[#164475]/5 to-blue-50 rounded-xl p-4 flex items-start gap-3">
                          <div className="w-8 h-8 bg-[#164475] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Lock className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0a1b2d] mb-0.5">Secure Payment via Safepay</p>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              You will be redirected to Safepay’s secure checkout to complete payment.
                              Your card details are handled by Safepay (licensed by State Bank of Pakistan) — we never see them.
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">SBP Licensed</span>
                              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">PCI-DSS</span>
                              <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">256-bit SSL</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </label>

                  {/* Bank Transfer Option */}
                  <label className={`flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "bank" ? "border-[#164475] bg-[#164475]/5" : "border-gray-100 hover:border-[#164475]/30"}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === "bank" ? "border-[#164475]" : "border-gray-300"}`}>
                      {paymentMethod === "bank" && <div className="w-2.5 h-2.5 bg-[#164475] rounded-full" />}
                    </div>
                    <input type="radio" name="payment" value="bank" checked={paymentMethod === "bank"} onChange={() => setPaymentMethod("bank")} className="hidden" />
                    <div className="flex-1 font-bold text-[#0a1b2d]">Direct Bank Transfer</div>
                  </label>

                  {/* Cash on Delivery Option */}
                  <label className={`flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "cod" ? "border-[#164475] bg-[#164475]/5" : "border-gray-100 hover:border-[#164475]/30"}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === "cod" ? "border-[#164475]" : "border-gray-300"}`}>
                      {paymentMethod === "cod" && <div className="w-2.5 h-2.5 bg-[#164475] rounded-full" />}
                    </div>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="hidden" />
                    <div className="flex-1 font-bold text-[#0a1b2d]">Cash on Delivery (COD)</div>
                  </label>

                </div>
              </div>

            </form>
          </div>

          {/* Order Summary Area */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <div className="bg-white rounded-3xl p-8 text-[#0a1b2d] sticky top-24 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-[#0a1b2d]">Your Order</h3>
              
              <div className="space-y-4 mb-6 max-h-[480px] overflow-y-auto pt-3 pb-2 px-1 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.product.id || (item.product as any)._id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-[#f8fafc] rounded-xl p-1 flex-shrink-0 relative border border-gray-200 shadow-sm flex items-center justify-center overflow-visible">
                      <img
                        src={getProductImage(item.product)}
                        alt={item.product.name}
                        className="w-full h-full object-contain p-0.5"
                        style={{ mixBlendMode: 'multiply' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getCategoryFallbackImage(item.product.category, item.product.name);
                        }}
                      />
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#164475] text-white rounded-full flex items-center justify-center text-[10px] font-black z-20 shadow-sm">
                        {item.qty}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold leading-tight mb-1 text-[#0a1b2d] truncate">{item.product.name}</h4>
                      <p className="text-xs text-[#164475] font-extrabold">{formatPrice(item.product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code Input */}
              <div className="border-t border-gray-100 pt-5 pb-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#164475]" /> Discount / Promo Code
                </label>

                {appliedDiscount ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-800 px-3.5 py-2 rounded-xl text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>CODE: <strong className="font-mono text-green-900 uppercase">{appliedDiscount.code}</strong> ({appliedDiscount.label})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setAppliedDiscount(null); setDiscountCodeInput(''); setDiscountError(''); }}
                      className="p-1 hover:bg-green-100 rounded-full text-green-700 transition-colors"
                      title="Remove coupon"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCodeInput}
                      onChange={e => setDiscountCodeInput(e.target.value)}
                      placeholder="e.g. HERO25"
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs uppercase font-bold focus:ring-2 focus:ring-[#164475] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyDiscount}
                      disabled={isApplyingDiscount || !discountCodeInput.trim()}
                      className="px-4 py-2 bg-[#164475] text-white rounded-xl text-xs font-bold hover:bg-[#1a5491] disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                      {isApplyingDiscount ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                )}
                {discountError && (
                  <p className="text-[11px] font-bold text-red-500">{discountError}</p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 mb-6 text-sm font-medium text-gray-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#0a1b2d] font-semibold">{formatPrice(subtotal)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-[#0a1b2d] font-semibold">{appliedDiscount?.type === 'free_shipping' ? 'FREE' : formatPrice(shipping)}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg text-[#0a1b2d]">Total</span>
                  <span className="text-3xl font-black text-[#164475]">{formatPrice(total)}</span>
                </div>
              </div>

              <button 
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || cart.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-[#164475] hover:bg-[#1a5491] text-white py-4 rounded-xl font-black text-sm tracking-wide transition-all shadow-lg hover:shadow-xl transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {paymentMethod === 'card' ? 'Redirecting to Safepay…' : 'Placing Order…'}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    {paymentMethod === 'card' ? 'Pay Securely via Safepay' : 'Place Order Now'}
                    {paymentMethod === 'card' && <ExternalLink className="w-4 h-4 ml-1 opacity-70" />}
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs font-medium">
                <ShieldCheck className="w-4 h-4" /> 256-bit secure checkout
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
