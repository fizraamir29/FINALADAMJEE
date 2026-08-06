'use client';
import React, { useState, useEffect } from "react";
import Link from "next/link";

/* ── Fallback images pool (for admin posts with no image) ── */
const FALLBACK_IMAGES = [
  "/images/Rectangle 12629.png",
  "/images/blog_gpu_card.png",
  "/images/check-img1.png",
  "/images/Rectangle 12598.png",
  "/images/blue_rgb_pc_cases_1780241349905.png",
];

export default function BlogSection() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.blogs && data.blogs.length > 0) {
          const formatted = data.blogs.slice(0, 2).map((b: any, idx: number) => ({
            id: b._id || b.id,
            slug: b.slug || b._id || b.id,
            title: b.title || "Untitled Post",
            tag: b.category ? b.category.toUpperCase() : "TECH",
            date: (b.publishedAt || b.createdAt)
              ? new Date(b.publishedAt || b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : "Recent",
            desc: b.excerpt || (b.content && b.content.length > 140
              ? b.content.substring(0, 140) + '...'
              : b.content || "Read this article for the latest gaming tech insights."),
            /* Use the blog's image, or fall back to the Figma default for that slot */
            image: (b.image && b.image.trim().length > 4)
              ? b.image
              : FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length],
          }));

          setPosts(formatted);
        }
      })
      .catch(console.error);
  }, []);

  const post0 = posts[0];
  const post1 = posts[1];

  // Nothing published yet — render nothing rather than placeholder articles.
  if (!post0) return null;

  return (
    <section className="px-4 md:px-12 py-12 font-sans bg-white">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4 border-b border-gray-200 pb-6 reveal-up">
        <div className="space-y-1 max-w-lg text-left">
          <span className="text-xs font-extrabold tracking-widest uppercase text-[#164475]">
            TECH GUIDES / BLOG
          </span>
          <h2 className="text-3xl font-black text-[#0a1b2d] tracking-tight leading-tight">
            Smart Tech Insights For<br />
            <span className="text-[#0a1b2d] font-black">Better Performance</span>
          </h2>
        </div>
        <div className="flex-1 max-w-xl text-gray-500 text-sm leading-relaxed lg:pl-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 text-left">
          <p>
            Explore gaming guides, PC building tips, hardware comparisons, and expert recommendations to make smarter tech decisions.
          </p>
          <Link
            href="/blog"
            className="font-bold text-[#0a1b2d] hover:text-[#164475] underline shrink-0 whitespace-nowrap sm:ml-4 transition-colors"
          >
            Read Latest Articles →
          </Link>
        </div>
      </div>

      {/* ── Two Blog Cards (Exact Figma Layout) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── CARD 1 (LEFT): Full dark overlay style — Figma exact ── */}
        <Link href={`/blog/${post0.slug || post0.id}`} className="block group">
          <div className="relative rounded-[24px] overflow-hidden bg-[#0a1b2d] min-h-[440px] flex flex-col justify-end cursor-pointer shadow-sm border border-gray-100/50 card-hover reveal-up delay-100">
            {/* Full background image */}
            <img
              src={post0.image}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              alt={post0.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/Rectangle 12629.png";
              }}
            />
            {/* Dark gradient overlay — bottom to top */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1b2d] via-[#0a1b2d]/50 to-transparent pointer-events-none" />

            {/* Text content at bottom */}
            <div className="relative z-10 p-8 space-y-2">
              <span className="bg-[#164475] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block">
                {post0.tag}
              </span>
              <p className="text-white/60 text-xs font-medium">{post0.date}</p>
              <h4 className="text-2xl font-black text-white tracking-tight leading-snug">
                {post0.title}
              </h4>
              <p className="text-white/70 text-xs leading-relaxed font-medium max-w-sm line-clamp-2">
                {post0.desc}
              </p>
              <span className="text-white font-extrabold text-xs underline hover:text-[#6CC1F9] transition pt-1 inline-block">
                Read More
              </span>
            </div>
          </div>
        </Link>

        {/* ── CARD 2 (RIGHT): Light card — image on top, text below — Figma exact ── */}
        <Link href={`/blog/${post1.slug || post1.id}`} className="block group">
          <div className="flex flex-col cursor-pointer card-hover reveal-up delay-200 h-full">
            {/* Image container */}
            <div className="relative h-[270px] overflow-hidden rounded-[24px] bg-[#f4f5f6]">
              <img
                src={post1.image}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt={post1.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/blog_gpu_card.png";
                }}
              />
              {/* Category badge top-left */}
              <span className="absolute top-4 left-4 bg-[#164475] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                {post1.tag}
              </span>
            </div>

            {/* Text content below image */}
            <div className="py-5 space-y-2.5 text-left">
              <p className="text-xs text-gray-400 font-bold">{post1.date}</p>
              <h4 className="text-xl font-black text-[#0a1b2d] tracking-tight group-hover:text-[#164475] transition-colors leading-snug">
                {post1.title}
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed font-medium line-clamp-3">
                {post1.desc}
              </p>
              <span className="text-sm font-extrabold text-[#0a1b2d] hover:text-[#164475] underline inline-block pt-1 transition-colors">
                Read More
              </span>
            </div>
          </div>
        </Link>

      </div>

      {/* ── Services / Features Banner ── */}
      <div className="mt-16 pt-12 border-t border-gray-150 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="flex items-start space-x-4 text-left">
          <div className="w-12 h-12 bg-[#f0f7ff] rounded-2xl flex items-center justify-center text-[#164475] shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-black text-[#0a1b2d] tracking-tight font-sans">Gaming Consultation</h4>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed font-semibold font-sans">
              Get advice from professional gamers and builders to choose the right hardware configuration for your needs.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4 text-left">
          <div className="w-12 h-12 bg-[#f0f7ff] rounded-2xl flex items-center justify-center text-[#164475] shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-black text-[#0a1b2d] tracking-tight font-sans">After Sale Assistance</h4>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed font-semibold font-sans">
              Rest easy with our lifetime support commitment. We help you troubleshoot diagnostics, updates, and benchmark performance.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4 text-left">
          <div className="w-12 h-12 bg-[#f0f7ff] rounded-2xl flex items-center justify-center text-[#164475] shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-black text-[#0a1b2d] tracking-tight font-sans">Custom Rig Assembly</h4>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed font-semibold font-sans">
              Professional cable management, parts validation, and thermal benchmarking for every custom PC configuration.
            </p>
          </div>
        </div>
      </div>

    </section>
  );
}
