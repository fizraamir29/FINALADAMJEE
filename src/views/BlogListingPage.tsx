'use client';
import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Calendar, User, Search, Tag, Eye, Heart, MessageSquare, Share2, TrendingUp, Sparkles } from 'lucide-react';


const TAG_CLOUD = ['#NVIDIA', '#RTX5090', '#PCBuilding', '#CustomRig', '#GamingKeyboards', '#DDR5', '#WaterCooling', '#Benchmarks'];

export default function BlogListingPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchBlogs = () => {
      fetch('/api/blogs')
        .then(res => res.json())
        .then(data => {
          const blogListToUse = (data.success && Array.isArray(data.blogs)) ? data.blogs : [];
          const formatted = blogListToUse.map((b: any) => ({
            id: b._id || b.id || b.slug,
            title: b.title,
            excerpt: b.excerpt || (b.content ? (b.content.length > 160 ? b.content.substring(0, 160) + '...' : b.content) : ''),
            image: b.image || 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1200&q=80',
            category: b.category || 'Guides',
            date: new Date(b.publishedAt || b.createdAt || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            author: b.author || 'Adamjee Team',
            readTime: `${Math.max(3, Math.ceil((b.content || '').length / 400))} min read`
          }));
          setPosts(formatted);
        })
        .catch(err => console.error("Failed to fetch blog list:", err))
        .finally(() => setLoading(false));
    };

    fetchBlogs();

    window.addEventListener('adamjee_new_blog', fetchBlogs);
    window.addEventListener('storage', fetchBlogs);

    return () => {
      window.removeEventListener('adamjee_new_blog', fetchBlogs);
      window.removeEventListener('storage', fetchBlogs);
    };
  }, []);

  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = { All: posts.length };
    posts.forEach(p => {
      const cat = p.category || 'Guides';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, activeCategory, searchQuery]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#f8fafc] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-[#164475] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const featuredPost = filteredPosts[0] || posts[0];
  const remainingPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : (filteredPosts.length === 1 ? [] : posts.slice(1));

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#f8fafc]">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header Hero Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#0a1b2d] via-[#164475] to-[#0f2a4a] p-8 md:p-14 text-white mb-12 shadow-xl overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Adamjee Tech Editorial & Benchmarks
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
              Hardware Insights, PC Builds & Game Reviews
            </h1>
            <p className="text-blue-100 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
              Explore in-depth hardware analyses, benchmark testings, PC building walkthroughs, and gaming gear guides written by our senior engineers.
            </p>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {Object.keys(categoriesWithCounts).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeCategory === cat
                  ? 'bg-[#164475] text-white shadow-md shadow-blue-900/20'
                  : 'bg-white text-[#475569] hover:bg-[#e2e8f0] border border-[#e2e8f0]'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {categoriesWithCounts[cat]}
              </span>
            </button>
          ))}
        </div>

        {/* Main Content Layout: Main Posts Grid (Left) + Rich Dribbble Sidebar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Articles Area (8 Cols) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Featured Post Big Hero Card */}
            {featuredPost && (
              <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <Link href={`/blog/${featuredPost.id}`} className="block relative aspect-video overflow-hidden">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  <span className="absolute top-6 left-6 bg-[#164475] text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                    Featured • {featuredPost.category}
                  </span>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h2 className="text-2xl md:text-3xl font-extrabold mb-3 leading-snug group-hover:text-blue-200 transition-colors">
                      {featuredPost.title}
                    </h2>
                    <div className="flex items-center gap-4 text-xs text-slate-200 font-medium">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {featuredPost.date}</span>
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {featuredPost.author}</span>
                      <span>• {featuredPost.readTime}</span>
                    </div>
                  </div>
                </Link>
                <div className="p-6 md:p-8 border-t border-slate-100">
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <Link
                    href={`/blog/${featuredPost.id}`}
                    className="inline-flex items-center gap-2 bg-[#164475] hover:bg-[#0f2a4a] text-white text-xs font-extrabold px-6 py-3 rounded-full transition-all shadow-sm"
                  >
                    Read Full Article <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Articles Grid (2-Column Grid inside Left Column) */}
            {remainingPosts.length > 0 && (
              <div className="grid md:grid-cols-2 gap-8">
                {remainingPosts.map(post => (
                  <article key={post.id} className="bg-white rounded-3xl border border-[#e2e8f0] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
                    <Link href={`/blog/${post.id}`} className="relative aspect-[16/10] overflow-hidden block">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-4 left-4 bg-white/95 backdrop-blur text-[#0a1b2d] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        {post.category}
                      </span>
                    </Link>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold mb-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                        <span>• {post.readTime}</span>
                      </div>
                      <h3 className="text-lg font-bold text-[#0a1b2d] mb-3 group-hover:text-[#164475] transition-colors line-clamp-2 leading-snug">
                        <Link href={`/blog/${post.id}`}>{post.title}</Link>
                      </h3>
                      <p className="text-slate-500 text-xs md:text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                        <span className="text-xs text-slate-500 font-semibold">{post.author}</span>
                        <Link
                          href={`/blog/${post.id}`}
                          className="inline-flex items-center gap-1 text-[#164475] hover:text-[#0f2a4a] text-xs font-extrabold group-hover:gap-2 transition-all"
                        >
                          Read Article <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar (Matching User Reference Dribbble Layout) (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">

            {/* Search Box Widget */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm">
              <h3 className="text-sm font-extrabold text-[#0a1b2d] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Search className="w-4 h-4 text-[#164475]" /> Search Articles
              </h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search GPUs, builds, reviews..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#164475] transition-colors"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Categories List Widget */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm">
              <h3 className="text-sm font-extrabold text-[#0a1b2d] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#164475]" /> Categories
              </h3>
              <div className="space-y-2">
                {Object.keys(categoriesWithCounts).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
                      activeCategory === cat
                        ? 'bg-[#164475] text-white shadow-sm'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {categoriesWithCounts[cat]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Trending Articles Widget */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm">
              <h3 className="text-sm font-extrabold text-[#0a1b2d] uppercase tracking-wider mb-5 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#164475]" /> Popular Posts
              </h3>
              <div className="space-y-4">
                {posts.slice(0, 3).map(p => (
                  <Link key={p.id} href={`/blog/${p.id}`} className="flex gap-3 group items-center">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#0a1b2d] group-hover:text-[#164475] transition-colors line-clamp-2 leading-snug">
                        {p.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium mt-1 block">{p.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Social Networks Widget */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm">
              <h3 className="text-sm font-extrabold text-[#0a1b2d] uppercase tracking-wider mb-4">
                Join Community
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                <a href="#" className="p-3 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
                  <span>YouTube</span>
                </a>
                <a href="#" className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors">
                  <span>Discord</span>
                </a>
                <a href="#" className="p-3 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center gap-2 hover:bg-pink-100 transition-colors">
                  <span>Instagram</span>
                </a>
                <a href="#" className="p-3 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors">
                  <span>Facebook</span>
                </a>
              </div>
            </div>

            {/* Tag Cloud Widget */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm">
              <h3 className="text-sm font-extrabold text-[#0a1b2d] uppercase tracking-wider mb-4">
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {TAG_CLOUD.map(tag => (
                  <span
                    key={tag}
                    className="text-[11px] font-bold bg-slate-100 hover:bg-[#164475] hover:text-white text-slate-600 px-3 py-1.5 rounded-full cursor-pointer transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
