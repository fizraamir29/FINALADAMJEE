'use client';
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Facebook, Instagram, Youtube } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export default function ContactPage() {
  useSEO({
    title: "Contact Us | Tech Experts & Gaming Support | Adamjee Computers",
    description: "Get in touch with the hardware experts at Adamjee Computers Pakistan. Ask questions about custom setups, pricing, custom gaming rigs, or component upgrades.",
    keywords: "contact computer shop, custom rig builders, PC customer support, tech help Karachi, Adamjee Computers"
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(data.message || 'Failed to send message.');
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Top Header */}
        <div className="mb-16 text-left" style={{ animation: 'contactFadeInLeft 600ms ease-out forwards' }}>
          <h1 className="text-5xl md:text-6xl font-black text-[#0a1b2d] tracking-tight mb-4">
            Contact Us
          </h1>
          <p className="text-[#64748b] text-lg md:text-xl max-w-2xl leading-relaxed">
            Have questions about custom rigs, pricing, or upgrades? 
            Drop us a message, and our hardware experts will reply within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Side: Contact Form (Large - 7 cols) */}
          <div className="lg:col-span-7">
            {submitted && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-5 mb-8 font-semibold animate-fade-in">
                Thank you! Your message has been sent successfully. We will get back to you shortly.
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-5 mb-8 font-semibold animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Name and Email side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="reveal-up animate-fade-in-up" style={{ transitionDelay: '0ms' }}>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#0a1b2d] mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl bg-[#f8fafc] border border-gray-200 focus:bg-white focus:border-[#164475] focus:ring-1 focus:ring-[#164475] outline-none transition-all duration-200 text-[#0a1b2d] font-medium placeholder-gray-400"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="reveal-up animate-fade-in-up" style={{ transitionDelay: '80ms' }}>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#0a1b2d] mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl bg-[#f8fafc] border border-gray-200 focus:bg-white focus:border-[#164475] focus:ring-1 focus:ring-[#164475] outline-none transition-all duration-200 text-[#0a1b2d] font-medium placeholder-gray-400"
                    placeholder="name@domain.com"
                  />
                </div>
              </div>

              {/* Row 2: Phone and Subject dropdown side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="reveal-up animate-fade-in-up" style={{ transitionDelay: '160ms' }}>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#0a1b2d] mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl bg-[#f8fafc] border border-gray-200 focus:bg-white focus:border-[#164475] focus:ring-1 focus:ring-[#164475] outline-none transition-all duration-200 text-[#0a1b2d] font-medium placeholder-gray-400"
                    placeholder="+92 300 0000000"
                  />
                </div>
                <div className="reveal-up animate-fade-in-up" style={{ transitionDelay: '240ms' }}>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#0a1b2d] mb-2">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl bg-[#f8fafc] border border-gray-200 focus:bg-white focus:border-[#164475] focus:ring-1 focus:ring-[#164475] outline-none transition-all duration-200 text-[#0a1b2d] font-medium"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Custom PC Build">Custom PC Build</option>
                    <option value="Order Status">Order Status</option>
                    <option value="Warranty & Support">Warranty & Support</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Message textarea */}
              <div className="reveal-up animate-fade-in-up" style={{ transitionDelay: '320ms' }}>
                <label className="block text-xs font-black uppercase tracking-widest text-[#0a1b2d] mb-2">Message</label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-5 py-4 rounded-xl bg-[#f8fafc] border border-gray-200 focus:bg-white focus:border-[#164475] focus:ring-1 focus:ring-[#164475] outline-none transition-all duration-200 text-[#0a1b2d] font-medium resize-none placeholder-gray-400"
                  placeholder="How can we help you build your dream setup?"
                ></textarea>
              </div>

              {/* Submit & hCaptcha Notice */}
              <div className="reveal-up flex flex-col gap-4 animate-fade-in-up" style={{ transitionDelay: '400ms' }}>
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#0a1b2d] hover:bg-[#164475] text-white font-extrabold px-10 py-4 rounded-full transition-all duration-300 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-[0_10px_25px_rgba(0,123,255,0.25)] flex items-center justify-center gap-2 button-hover-effect cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send message
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed max-w-md">
                  This site is protected by hCaptcha and its <a href="/privacy-policy" className="underline hover:text-gray-600">Privacy Policy</a> and <a href="/terms" className="underline hover:text-gray-600">Terms of Service</a> apply.
                </p>
              </div>
            </form>
          </div>

          {/* Right Side: Contact Info (Small - 5 cols) */}
          <div className="lg:col-span-5 lg:pl-12 reveal-right space-y-12">
            
            {/* Address */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Address</h3>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#0a1b2d] shrink-0 border border-gray-100">
                  <MapPin className="w-5 h-5" />
                </div>
                <p className="text-base text-[#0a1b2d] font-bold leading-relaxed">
                  Adamjee Computers<br />
                  123 Tech Avenue, Block 4<br />
                  Karachi, Pakistan
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Email</h3>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#0a1b2d] shrink-0 border border-gray-100">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <a href="mailto:support@adamjeecomputers.com" className="text-base text-[#0a1b2d] font-bold hover:text-[#164475]">
                    support@adamjeecomputers.com
                  </a>
                  <a href="mailto:sales@adamjeecomputers.com" className="text-base text-[#0a1b2d] font-bold hover:text-[#164475]">
                    sales@adamjeecomputers.com
                  </a>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Phone</h3>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#0a1b2d] shrink-0 border border-gray-100">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <a href="tel:+923000000000" className="text-base text-[#0a1b2d] font-bold hover:text-[#164475] block mb-1">
                    +92 300 0000000
                  </a>
                  <p className="text-xs text-gray-400 font-semibold">
                    Mon - Sat: 9:00 AM - 6:00 PM (PKT)
                  </p>
                </div>
              </div>
            </div>

            {/* Follow Us */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Follow Us</h3>
              <div className="flex gap-3">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:text-white hover:bg-[#1877f2] hover:border-transparent transition-all duration-300">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://x.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:text-white hover:bg-black hover:border-transparent transition-all duration-300">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:text-white hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:border-transparent transition-all duration-300">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:text-white hover:bg-[#ff0000] hover:border-transparent transition-all duration-300">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes contactFadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .button-hover-effect:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 10px 25px rgba(0,123,255,0.25);
        }
      `}} />
    </div>
  );
}
