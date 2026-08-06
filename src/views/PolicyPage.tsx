'use client';
import Link from 'next/link';
import React from 'react';


interface PolicyPageProps { title: string; type?: 'warranty' | 'privacy' | 'terms'; }

const warrantyContent = (
  <div className="space-y-8">
    <section>
      <h2 className="text-2xl font-bold text-[#0a1b2d] mb-4">1. Warranty Coverage</h2>
      <p className="text-[#64748b] leading-relaxed mb-3">All products sold by Adamjee Computers are covered by a <strong className="text-[#0a1b2d]">minimum 1-year manufacturer warranty</strong> from the date of purchase unless stated otherwise on the product page.</p>
      <ul className="space-y-2 text-[#64748b]">
        {['Manufacturing defects and component failures','Hardware malfunctions under normal use','Dead-on-arrival (DOA) products — replaced within 48 hours','Custom-built PCs: 1-year build warranty covering workmanship'].map((item, i) => (
          <li key={i} className="flex items-start gap-2"><span className="text-[#164475] font-bold mt-0.5">✓</span> {item}</li>
        ))}
      </ul>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-[#0a1b2d] mb-4">2. What Is Not Covered</h2>
      <ul className="space-y-2 text-[#64748b]">
        {['Physical damage (drops, liquid damage, cracks)','Damage caused by incorrect installation or modification','Normal wear and tear (e.g. battery degradation)','Damage from power surges without a surge protector','Products with tampered or removed serial number stickers'].map((item, i) => (
          <li key={i} className="flex items-start gap-2"><span className="text-[#0a1b2d] font-bold mt-0.5">✗</span> {item}</li>
        ))}
      </ul>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-[#0a1b2d] mb-4">3. Return Policy</h2>
      <p className="text-[#64748b] leading-relaxed mb-3">We offer a <strong className="text-[#0a1b2d]">7-day return window</strong> from the date of delivery for items that are:</p>
      <ul className="space-y-2 text-[#64748b]">
        {['In original, unused condition','In original packaging with all accessories','Accompanied by the original invoice or order ID'].map((item, i) => (
          <li key={i} className="flex items-start gap-2"><span className="text-[#164475] font-bold mt-0.5">•</span> {item}</li>
        ))}
      </ul>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-[#0a1b2d] mb-4">4. How to Claim Warranty or Return</h2>
      <ol className="space-y-3 text-[#64748b] list-decimal list-inside">
        <li>Email us at <a href="mailto:support@adamjeecomputers.com" className="text-[#164475] hover:underline">support@adamjeecomputers.com</a> with your order ID and issue description.</li>
        <li>Attach clear photos or a short video of the defect.</li>
        <li>Our team will respond within 1 business day with next steps.</li>
        <li>Approved returns: we arrange free pickup from your location.</li>
        <li>Replacement or refund is processed within 5–7 business days after receiving the item.</li>
      </ol>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-[#0a1b2d] mb-4">5. Refund Timeline</h2>
      <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
        <thead><tr className="bg-[#f1f5f9]"><th className="p-3 text-left text-[#0a1b2d] font-bold border border-[#e2e8f0]">Payment Method</th><th className="p-3 text-left text-[#0a1b2d] font-bold border border-[#e2e8f0]">Refund Timeline</th></tr></thead>
        <tbody>
          {[['Credit/Debit Card','5–7 business days'],['Bank Transfer','3–5 business days'],['Cash on Delivery','Store credit issued immediately; bank transfer in 5 days']].map(([method, time], i) => (
            <tr key={i} className={i%2===0?'bg-white':'bg-[#fafbfc]'}><td className="p-3 text-[#64748b] border border-[#e2e8f0]">{method}</td><td className="p-3 text-[#64748b] border border-[#e2e8f0]">{time}</td></tr>
          ))}
        </tbody>
      </table></div>
    </section>
  </div>
);

const privacyContent = (
  <div className="space-y-8">
    <p className="text-[#64748b] leading-relaxed">This Privacy Policy explains how Adamjee Computers ("we", "us", "our") collects, uses, and protects your personal information when you use our website and services. Last updated: May 2026.</p>
    {[
      { title: '1. Information We Collect', body: 'We collect information you provide directly (name, email, phone, shipping address when you create an account or place an order), payment information (processed securely via third-party payment gateways — we never store card details), browsing data (pages visited, products viewed, search terms), and device/technical data (IP address, browser type, operating system).' },
      { title: '2. How We Use Your Information', body: 'Your information is used to process and fulfil orders, send order confirmations and tracking updates, provide customer support, send marketing emails (only with your consent), improve our website and product catalogue, prevent fraud and ensure security, and comply with legal obligations.' },
      { title: '3. Data Sharing', body: 'We do not sell your personal data. We share data only with trusted service providers needed to operate our business: courier companies (for delivery), payment processors, email service providers, and cloud hosting providers. All partners are contractually bound to protect your data.' },
      { title: '4. Your Rights', body: 'You have the right to access, correct, or delete your personal data at any time by contacting us at privacy@adamjeecomputers.com. You can also unsubscribe from marketing emails using the unsubscribe link in any email, or opt out of cookies using your browser settings.' },
      { title: '5. Data Security', body: 'We implement industry-standard security measures including SSL/TLS encryption for all data transmission, secure password hashing (bcrypt), and regular security audits. While we take every reasonable precaution, no system is 100% secure.' },
      { title: '6. Cookies', body: 'We use essential cookies (required for the website to function), analytics cookies (to understand how visitors use our site), and marketing cookies (to show relevant ads). You can manage cookie preferences in your browser settings.' },
      { title: '7. Contact Us', body: 'For privacy-related questions or data requests, contact us at: privacy@adamjeecomputers.com or write to Adamjee Computers, 123 Tech Avenue, Karachi, Pakistan.' },
    ].map((section, i) => (
      <section key={i}>
        <h2 className="text-2xl font-bold text-[#0a1b2d] mb-3">{section.title}</h2>
        <p className="text-[#64748b] leading-relaxed">{section.body}</p>
      </section>
    ))}
  </div>
);

const termsContent = (
  <div className="space-y-8">
    <p className="text-[#64748b] leading-relaxed">By accessing and using the Adamjee Computers website, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services. Last updated: May 2026.</p>
    {[
      { title: '1. Use of the Website', body: 'You must be at least 18 years of age to make a purchase. You agree not to use this website for any unlawful purpose, attempt to gain unauthorized access to our systems, or engage in any activity that could damage or disrupt the site.' },
      { title: '2. Product Information', body: 'We strive to display product information, images, and pricing as accurately as possible. However, we reserve the right to correct any errors and update pricing without prior notice. Images are for illustrative purposes only.' },
      { title: '3. Pricing & Payment', body: 'All prices are displayed in USD unless otherwise stated. Prices are subject to change without notice. Payment must be received in full before orders are dispatched, except for approved COD orders.' },
      { title: '4. Order Acceptance', body: 'Placing an order constitutes an offer to buy. We reserve the right to decline any order at our discretion, including in cases of suspected fraud, incorrect pricing, or out-of-stock items. In such cases, a full refund will be issued.' },
      { title: '5. Intellectual Property', body: 'All content on this website — including logos, images, text, and design — is the property of Adamjee Computers and protected by copyright law. You may not reproduce, distribute, or use our content without written permission.' },
      { title: '6. Limitation of Liability', body: 'Adamjee Computers shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our total liability in any case shall not exceed the value of the product purchased.' },
      { title: '7. Governing Law', body: 'These Terms shall be governed by the laws of Pakistan. Any disputes arising from these terms shall be subject to the jurisdiction of courts in Karachi, Pakistan.' },
    ].map((section, i) => (
      <section key={i}>
        <h2 className="text-2xl font-bold text-[#0a1b2d] mb-3">{section.title}</h2>
        <p className="text-[#64748b] leading-relaxed">{section.body}</p>
      </section>
    ))}
  </div>
);

const contentMap = { warranty: warrantyContent, privacy: privacyContent, terms: termsContent };

export default function PolicyPage({ title, type = 'warranty' }: PolicyPageProps) {
  const policyLinks = [
    { label: 'Warranty & Returns', to: '/warranty-returns', type: 'warranty' },
    { label: 'Privacy Policy',     to: '/privacy-policy',   type: 'privacy' },
    { label: 'Terms & Conditions', to: '/terms',            type: 'terms' },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm sticky top-32">
              <h3 className="font-bold text-[#0a1b2d] mb-4 text-sm uppercase tracking-widest">Legal</h3>
              <nav className="space-y-2">
                {policyLinks.map(link => (
                  <Link key={link.to} href={link.to}
                    className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors border-l-4 ${
                      link.type === type
                        ? 'bg-[#f8fafc] border-[#164475] text-[#164475]'
                        : 'border-transparent text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0a1b2d]'
                    }`}>
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-8 pt-6 border-t border-[#e2e8f0]">
                <p className="text-xs text-[#94a3b8] font-medium mb-3">Questions?</p>
                <a href="mailto:support@adamjeecomputers.com" className="text-xs text-[#164475] hover:underline font-semibold">support@adamjeecomputers.com</a>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-8 md:p-12 shadow-sm">
              <div className="mb-8 pb-8 border-b border-[#f1f5f9]">
                <span className="text-xs text-[#164475] font-bold uppercase tracking-widest">Legal Document</span>
                <h1 className="text-4xl font-extrabold text-[#0a1b2d] mt-2">{title}</h1>
                <p className="text-[#94a3b8] text-sm mt-2 font-medium">Last updated: May 2026 · Adamjee Computers</p>
              </div>
              {contentMap[type]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
