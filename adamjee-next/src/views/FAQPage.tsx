'use client';
import React, { useState } from 'react';
import { Send } from 'lucide-react';

const FAQ_GROUPS = [
  {
    category: "Shipping & Returns",
    items: [
      { q: "How long does delivery take?", a: "Standard delivery takes 3–5 business days nationwide. Express delivery (1–2 days) is available in Karachi, Lahore, and Islamabad. You will receive a tracking number via SMS and email once your order is dispatched." },
      { q: "Do you ship to all cities in Pakistan?", a: "Yes! We ship nationwide across Pakistan including major cities and smaller towns via our trusted courier partners." },
      { q: "What is your return policy?", a: "We offer a 7-day return window from the date of delivery. Items must be in original packaging, unused, and with all accessories included." }
    ]
  },
  {
    category: "Orders",
    items: [
      { q: "Can I track my order?", a: "Absolutely. Once shipped, you will receive a tracking number via email. You can also log in to your account and go to Order History to see real-time status updates." },
      { q: "Is Cash on Delivery available?", a: "Yes! COD is available nationwide. For orders above PKR 50,000, a small advance deposit may be required." },
      { q: "Can I pay in installments?", a: "Yes, we offer installment plans through select bank credit cards (HBL, MCB, Standard Chartered) at checkout." }
    ]
  },
  {
    category: "Products",
    items: [
      { q: "Are all products original/genuine?", a: "100% yes. We source directly from authorized distributors and manufacturers. All products come with official manufacturer warranty cards." },
      { q: "Can you build a custom gaming PC for me?", a: "Absolutely! Use our Custom PC Builder tool on the website, or contact our team with your budget and requirements. We'll recommend components, assemble, test, and deliver." },
      { q: "Do you offer PC upgrades?", a: "Yes, we offer upgrade consultations and services. Share your specifications with us, and our team will recommend the most cost-effective upgrades." }
    ]
  }
];

export default function FAQPage() {
  const [openKey, setOpenKey] = useState<string | null>("Shipping & Returns-0");
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleAccordion = (key: string) => {
    setOpenKey(openKey === key ? null : key);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Previously this only wrote to localStorage, so submissions never reached
    // the store. It now posts to the same endpoint as the contact form.
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: 'FAQ Form Submission',
          message: formData.message,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (err) {
      console.error('FAQ submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Top Header */}
        <div className="mb-16 text-center" style={{ animation: 'faqFadeUp 500ms ease-out forwards' }}>
          <h1 className="text-5xl md:text-6xl font-black text-[#0a1b2d] tracking-tight mb-4">
            FAQ's
          </h1>
          <p className="text-[#64748b] text-lg max-w-2xl mx-auto leading-relaxed">
            Find quick answers to common questions about shipping, orders, products, and support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Grouped Accordions (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {FAQ_GROUPS.map((group, groupIdx) => (
              <div 
                key={group.category}
                className="reveal-up bg-white rounded-3xl border border-gray-200 p-6 md:p-8"
                style={{ transitionDelay: `${groupIdx * 100}ms` }}
              >
                <h2 className="text-xl font-black text-[#0a1b2d] mb-6 tracking-tight uppercase text-xs tracking-wider text-gray-400">
                  {group.category}
                </h2>
                <div className="divide-y divide-gray-100">
                  {group.items.map((item, itemIdx) => {
                    const key = `${group.category}-${itemIdx}`;
                    const isOpen = openKey === key;
                    return (
                      <div key={itemIdx} className="py-5 first:pt-0 last:pb-0">
                        <button
                          onClick={() => toggleAccordion(key)}
                          className="w-full flex items-center justify-between text-left focus:outline-none"
                        >
                          <span className="font-bold text-[#0a1b2d] pr-4 text-[15px] md:text-base leading-snug">
                            {item.q}
                          </span>
                          <span 
                            className={`w-6 h-6 shrink-0 flex items-center justify-center rounded-full bg-gray-50 text-[#0a1b2d] text-lg font-bold transition-all duration-300 ${
                              isOpen ? 'rotate-45 bg-[#164475] text-white' : ''
                            }`}
                          >
                            +
                          </span>
                        </button>
                        <div 
                          className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            isOpen ? 'max-h-[300px] opacity-100 mt-3' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <p className="text-[#64748b] text-sm leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Sticky Contact Form (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-[120px] reveal-right">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8">
              <h3 className="text-xl font-black text-[#0a1b2d] mb-2 tracking-tight">
                Didn't find your answer?
              </h3>
              <p className="text-sm text-gray-500 font-medium mb-6">
                Send us a direct message and our support team will help you out.
              </p>

              {submitted && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 mb-6 text-xs font-semibold animate-fade-in">
                  Message sent! We'll reply shortly.
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#0a1b2d] mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#f8fafc] border border-gray-200 focus:bg-white focus:border-[#164475] focus:ring-1 focus:ring-[#164475] outline-none transition-all duration-200 text-[#0a1b2d] text-sm font-medium placeholder-gray-400"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#0a1b2d] mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#f8fafc] border border-gray-200 focus:bg-white focus:border-[#164475] focus:ring-1 focus:ring-[#164475] outline-none transition-all duration-200 text-[#0a1b2d] text-sm font-medium placeholder-gray-400"
                    placeholder="name@domain.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#0a1b2d] mb-1.5">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#f8fafc] border border-gray-200 focus:bg-white focus:border-[#164475] focus:ring-1 focus:ring-[#164475] outline-none transition-all duration-200 text-[#0a1b2d] text-sm font-medium resize-none placeholder-gray-400"
                    placeholder="Write your question here..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0a1b2d] hover:bg-[#164475] text-white font-extrabold py-3.5 px-6 rounded-full transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Send message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes faqFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
