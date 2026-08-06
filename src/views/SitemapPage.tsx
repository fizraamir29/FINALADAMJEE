'use client';
import Link from 'next/link';
import React from 'react';


export default function SitemapPage() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#fafbfc]">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Sitemap</h1>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Shop</h2>
            <ul className="space-y-2 text-[#64748b]">
              <li><Link href="/" className="hover:text-[#164475]">Home</Link></li>
              <li><Link href="/search" className="hover:text-[#164475]">Search Products</Link></li>
              <li><Link href="/cart" className="hover:text-[#164475]">Shopping Cart</Link></li>
              <li><Link href="/checkout" className="hover:text-[#164475]">Checkout</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4">About & Info</h2>
            <ul className="space-y-2 text-[#64748b]">
              <li><Link href="/about" className="hover:text-[#164475]">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-[#164475]">Contact Us</Link></li>
              <li><Link href="/blog" className="hover:text-[#164475]">Blog</Link></li>
              <li><Link href="/faq" className="hover:text-[#164475]">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4">Policies</h2>
            <ul className="space-y-2 text-[#64748b]">
              <li><Link href="/warranty-returns" className="hover:text-[#164475]">Warranty & Returns</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-[#164475]">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#164475]">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
