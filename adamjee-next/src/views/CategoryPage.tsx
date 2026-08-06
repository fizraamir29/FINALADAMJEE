'use client';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, Suspense } from "react";

import { Product } from "../types";
import { getCategoryFallbackImage, getProductImage } from "../utils/storage";
import { Filter, X, Star, ChevronDown, ChevronRight, ArrowRight, PackageX } from "lucide-react";

import ModernSelect from '../components/ModernSelect';
import ProductCard from '../components/ProductCard';

interface CategoryPageProps {
  handleAddToCart: (product: Product) => void;
  formatPrice: (usdAmount: number) => string;
}

function CategoryPageInner({ handleAddToCart, formatPrice }: CategoryPageProps) {
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category'); // e.g. "Headphones" from ?category=Headphones

  // Initialize activeTab from URL ?category= param
  const [activeTab, setActiveTab] = useState<string>(urlCategory || "All");
  const [sortBy, setSortBy] = useState("Featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [sidebarCategory, setSidebarCategory] = useState<string>("All Products");
  const [sidebarPrice, setSidebarPrice] = useState<string | null>(null);
  const [minPriceInput, setMinPriceInput] = useState<string>('');
  const [maxPriceInput, setMaxPriceInput] = useState<string>('');
  const [sidebarBrand, setSidebarBrand] = useState<string | null>(null);
  const [sidebarCondition, setSidebarCondition] = useState<string | null>(null);
  const [sidebarRam, setSidebarRam] = useState<string | null>(null);
  const [sidebarStorage, setSidebarStorage] = useState<string | null>(null);
  const [sidebarProcessor, setSidebarProcessor] = useState<string | null>(null);
  const [sidebarAvailability, setSidebarAvailability] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 8;

  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const soldOutIds = ["hp3", "ac6"];

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Reset page to 1 whenever filters or category tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, sidebarCategory, sidebarPrice, minPriceInput, maxPriceInput, sidebarBrand, sidebarCondition, sidebarRam, sidebarStorage, sidebarProcessor, sidebarAvailability, sortBy]);

  // Sync activeTab when URL changes (e.g. user clicks a category card)
  useEffect(() => {
    if (urlCategory) {
      setActiveTab(urlCategory);
    } else {
      setActiveTab("All");
    }
  }, [urlCategory]);

  useEffect(() => {
    setIsMounted(true);

    const fetchProds = () => {
      fetch('/api/products?limit=100')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.products)) {
            setProductsList(data.products);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    };

    fetchProds();

    window.addEventListener('adamjee_new_product', fetchProds);
    window.addEventListener('storage', fetchProds);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('adamjee_products_channel');
      bc.onmessage = () => fetchProds();
    } catch (e) {}

    return () => {
      window.removeEventListener('adamjee_new_product', fetchProds);
      window.removeEventListener('storage', fetchProds);
      if (bc) bc.close();
    };
  }, []);

  // Dynamically derive unique categories from backend products
  const dynamicCategories = React.useMemo(() => {
    const cats = new Set<string>();
    productsList.forEach(p => { if (p.category) cats.add(p.category.trim()); });
    return Array.from(cats).sort();
  }, [productsList]);

  // Dynamically derive unique brands from backend products
  const dynamicBrands = React.useMemo(() => {
    const brands = new Set<string>(["ASUS ROG", "Corsair", "Razer", "MSI", "Logitech", "Dell", "HP", "Lenovo"]);
    productsList.forEach(p => {
      if ((p as any).brand) brands.add((p as any).brand.trim());
      else if (p.name) {
        const firstWord = p.name.split(' ')[0];
        if (firstWord.length > 2) brands.add(firstWord);
      }
    });
    return Array.from(brands).sort();
  }, [productsList]);

  // Build tabs dynamically: All + every unique category from backend
  const TABS = React.useMemo(() => {
    const tabs = [{ label: "All", count: productsList.length }];
    dynamicCategories.forEach(cat => {
      tabs.push({ label: cat, count: productsList.filter(p => p.category === cat).length });
    });
    return tabs;
  }, [productsList, dynamicCategories]);

  // Master filter: activeTab (top bar) + sidebar filters
  const filteredProducts = productsList.filter(product => {
    // Top Tabs category filter
    if (activeTab !== "All" && product.category !== activeTab) return false;

    // Sidebar Categories filter
    if (sidebarCategory !== "All Products" && product.category !== sidebarCategory) return false;

    // Price preset filter (PKR)
    if (sidebarPrice) {
      if (sidebarPrice === "Under PKR 25,000" && product.price >= 25000) return false;
      if (sidebarPrice === "PKR 25,000 — 100,000" && (product.price < 25000 || product.price > 100000)) return false;
      if (sidebarPrice === "PKR 100,000 — 250,000" && (product.price < 100000 || product.price > 250000)) return false;
      if (sidebarPrice === "Over PKR 250,000" && product.price <= 250000) return false;
    }

    // Min / Max numeric PKR Price Inputs
    if (minPriceInput && product.price < Number(minPriceInput)) return false;
    if (maxPriceInput && product.price > Number(maxPriceInput)) return false;

    // Brand filter
    if (sidebarBrand) {
      const brandWord = sidebarBrand.split(' ')[0].toLowerCase();
      const matchBrand = ((product as any).brand || product.name || '').toLowerCase().includes(brandWord);
      if (!matchBrand) return false;
    }

    // Condition filter
    if (sidebarCondition) {
      const tagLower = (product.tag || product.promoText || '').toLowerCase();
      const descLower = (product.description || '').toLowerCase();
      if (sidebarCondition === "Brand New" && (tagLower.includes('refurbished') || descLower.includes('refurbished'))) return false;
      if (sidebarCondition === "Refurbished" && !tagLower.includes('refurbished') && !descLower.includes('refurbished')) return false;
    }

    // Tech Specs search (RAM, Storage, Processor)
    const textToSearch = `${product.name} ${product.description || ''} ${JSON.stringify((product as any).specs || {})}`.toLowerCase();
    if (sidebarRam && !textToSearch.includes(sidebarRam.toLowerCase())) return false;
    if (sidebarStorage && !textToSearch.includes(sidebarStorage.toLowerCase())) return false;
    if (sidebarProcessor && !textToSearch.includes(sidebarProcessor.toLowerCase())) return false;

    // Availability filter
    if (sidebarAvailability) {
      const isStock = (product as any).stock !== undefined ? (product as any).stock > 0 : true;
      if (sidebarAvailability === "In Stock" && !isStock) return false;
      if (sidebarAvailability === "Out of Stock" && isStock) return false;
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "Price: Low to High") return a.price - b.price;
    if (sortBy === "Price: High to Low") return b.price - a.price;
    return 0;
  });

  // Calculate pagination totals and current page items
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE) || 1;
  const products = sortedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const categoryName = activeTab === "All"
    ? (id === "all" ? "All Products" : id === "best-sellers" ? "Best Sellers" : id === "accessories" ? "Gaming Accessories" : "PC Components")
    : activeTab;

  // Sticky bar on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setStickyVisible(heroBottom <= 80);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll reveal for grid cards
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
          }
        });
      },
      { threshold: 0.1 }
    );
    const cards = document.querySelectorAll(".shop-card-reveal");
    cards.forEach((card) => observer.observe(card));
    return () => cards.forEach((card) => observer.unobserve(card));
  }, [activeTab, productsList]);

  return (
    <div className="min-h-screen bg-[#fafbfc] relative">

      {/* ═══════════════════════════════════════════
          1. HERO BANNER
      ═══════════════════════════════════════════ */}
      <div
        ref={heroRef}
        className="relative bg-[#0a1b2d] text-white overflow-hidden"
        style={{ minHeight: "320px" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'url("/images/blue_rgb_pc_cases_1780241349905.png")',
            opacity: 0.25,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1b2d]/60 via-[#0a1b2d]/80 to-[#0a1b2d] z-[1]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-12 pt-32 pb-16 flex flex-col justify-end">
          <nav className="flex items-center gap-2 text-xs text-white/50 font-medium mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/50">Collections</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-bold">{categoryName}</span>
          </nav>

          <h1
            className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]"
            style={{
              animation: "heroHeadingIn 600ms ease-out forwards",
              opacity: 0,
              transform: "translateX(-20px)",
            }}
          >
            {categoryName}
          </h1>
          <p
            className="text-white/60 text-sm md:text-base mt-4 max-w-xl font-medium"
            style={{
              animation: "heroHeadingIn 600ms ease-out 150ms forwards",
              opacity: 0,
              transform: "translateX(-20px)",
            }}
          >
            Discover our premium selection of gaming gear, engineered for peak performance and aesthetics.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes heroHeadingIn {
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* ═══════════════════════════════════════════
          2. STICKY FILTER BAR
      ═══════════════════════════════════════════ */}
      <div
        className={`sticky top-[72px] z-30 bg-white/95 backdrop-blur-xl border-b border-gray-200/80 transition-all duration-400 ${
          stickyVisible
            ? "translate-y-0 opacity-100 shadow-lg"
            : "translate-y-0 opacity-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Show Filters */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center gap-2 bg-[#0a1b2d] text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-[#164475] transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            Show filters
          </button>

          {/* Middle: Dynamic Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.label}
                onClick={() => {
                  setActiveTab(tab.label);
                  setSidebarCategory("All Products"); // reset sidebar when switching tab
                }}
                className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all whitespace-nowrap ${
                  activeTab === tab.label
                    ? "text-[#0a1b2d]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
                {isMounted && <sup className="ml-0.5 text-[10px] font-bold text-gray-400">{tab.count}</sup>}
                {/* Active underline */}
                {activeTab === tab.label && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-[#0a1b2d] rounded-full"
                    style={{
                      width: "60%",
                      animation: "tabUnderline 300ms ease-out forwards",
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Right: Sort */}
          <div className="flex items-center gap-4">
            <ModernSelect
              className="w-48"
              options={["Featured", "Price: Low to High", "Price: High to Low"]}
              value={sortBy}
              onChange={setSortBy}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tabUnderline {
          from { width: 0%; }
          to { width: 60%; }
        }
      `}</style>

      {/* ═══════════════════════════════════════════
          3. PRODUCTS GRID
      ═══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {loading && (
            <div className="col-span-full py-20 flex justify-center items-center">
              <div className="w-10 h-10 border-4 border-[#164475] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* ─── No Products Found State ─── */}
          {!loading && products.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 gap-6">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <PackageX className="w-10 h-10 text-gray-300" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-[#0a1b2d]">No products found</h3>
                <p className="text-gray-400 text-sm max-w-sm">
                  {activeTab !== "All"
                    ? `No products in the "${activeTab}" category yet. Check back soon or browse other categories.`
                    : "No products match your current filters. Try adjusting or clearing them."}
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab("All");
                  setSidebarCategory("All Products");
                  setSidebarPrice(null);
                  setMinPriceInput('');
                  setMaxPriceInput('');
                  setSidebarBrand(null);
                  setSidebarCondition(null);
                  setSidebarRam(null);
                  setSidebarStorage(null);
                  setSidebarProcessor(null);
                  setSidebarAvailability(null);
                }}
                className="inline-flex items-center gap-2 bg-[#0a1b2d] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#164475] transition-colors cursor-pointer"
              >
                Clear Filters & View All Products <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {!loading && products.map((product, idx) => (
            <div
              key={product.id || (product as any)._id || idx}
              className="shop-card-reveal opacity-0 translate-y-[30px]"
              style={{
                transition: `opacity 500ms cubic-bezier(0.22,1,0.36,1), transform 500ms cubic-bezier(0.22,1,0.36,1)`,
                transitionDelay: `${idx * 80}ms`,
              }}
            >
              <ProductCard
                product={product}
                formatPrice={(amt) => formatPrice(amt)}
                onAddToCart={handleAddToCart}
              />
            </div>
          ))}

          {/* ═══════════════════════════════════════════
              4. PROMO CARD (inside grid) – only show when products exist
          ═══════════════════════════════════════════ */}
          {!loading && products.length > 0 && (
            <div
              className="shop-card-reveal opacity-0 translate-y-[30px] col-span-2 md:col-span-2"
              style={{
                transition: `opacity 500ms cubic-bezier(0.22,1,0.36,1), transform 500ms cubic-bezier(0.22,1,0.36,1)`,
                transitionDelay: `${products.length * 80}ms`,
              }}
            >
              <div className="relative rounded-[20px] overflow-hidden bg-[#0a1b2d] min-h-[360px] flex flex-col justify-end p-8 group">
                <div
                  className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: 'url("/images/promo_gamers_bg.png")', opacity: 0.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1b2d] via-[#0a1b2d]/50 to-transparent z-[1]" />
                <div className="relative z-10 space-y-4">
                  <span className="text-[10px] font-black tracking-widest uppercase text-[#164475]">Limited Collection</span>
                  <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">
                    Premium Gaming<br />Accessories
                  </h3>
                  <p className="text-white/60 text-sm max-w-sm font-medium">
                    Elevate your setup with hand-picked accessories designed for peak performance.
                  </p>
                  <Link
                    href="/category/accessories"
                    className="inline-flex items-center gap-2 border border-white/40 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-white hover:text-[#0a1b2d] transition-all"
                  >
                    View Accessories <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Interactive Pagination */}
        {!loading && sortedProducts.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-16 select-none">
            {/* Previous Page Arrow */}
            <button
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage(prev => prev - 1);
                  gridRef.current?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              disabled={currentPage === 1}
              className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold transition-all ${
                currentPage === 1
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:border-[#0a1b2d] hover:bg-[#0a1b2d] hover:text-white cursor-pointer active:scale-95'
              }`}
              aria-label="Previous Page"
            >
              &larr;
            </button>

            {/* Page Numbers 1, 2, 3... */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => {
                  setCurrentPage(pageNum);
                  gridRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-10 h-10 rounded-full font-bold transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-[#0a1b2d] text-white shadow-lg scale-105'
                    : 'border border-gray-200 text-gray-600 hover:border-[#0a1b2d] hover:text-[#0a1b2d] hover:bg-gray-100 active:scale-95'
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Page Arrow */}
            <button
              onClick={() => {
                if (currentPage < totalPages) {
                  setCurrentPage(prev => prev + 1);
                  gridRef.current?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              disabled={currentPage === totalPages}
              className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold transition-all ${
                currentPage === totalPages
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:border-[#0a1b2d] hover:bg-[#0a1b2d] hover:text-white cursor-pointer active:scale-95'
              }`}
              aria-label="Next Page"
            >
              &rarr;
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          6. FILTER SIDEBAR (slide-in from left)
      ═══════════════════════════════════════════ */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex animate-fade-in">
          {/* Dark Backdrop */}
          <div
            className="absolute inset-0 bg-[#0a1b2d]/60 backdrop-blur-md"
            onClick={() => setFiltersOpen(false)}
          />

          {/* Sidebar Panel */}
          <div
            className="relative w-full max-w-sm bg-white h-full shadow-2xl z-10 overflow-y-auto"
            style={{
              animation: "filterSlideIn 350ms ease-out forwards",
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-black text-[#0a1b2d] flex items-center gap-2">
                <Filter className="w-5 h-5" /> Filters
              </h3>
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-[#0a1b2d] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Groups */}
            <div className="p-6 space-y-8">
              {/* Categories — dynamically from backend */}
              <div className="space-y-4">
                <h4 className="font-black text-[#0a1b2d] uppercase text-xs tracking-widest border-b pb-3">Categories</h4>
                <div className="space-y-3">
                  {["All Products", ...dynamicCategories].map((cat) => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setSidebarCategory(cat); }}>
                      <div className={`w-5 h-5 rounded-md border-2 transition-colors flex items-center justify-center ${cat === sidebarCategory ? 'border-[#164475]' : 'border-gray-300 group-hover:border-[#164475]'}`}>
                        {cat === sidebarCategory && (
                          <div className="w-3 h-3 bg-[#164475] rounded-sm" />
                        )}
                      </div>
                      <span className="text-sm text-gray-600 group-hover:text-[#0a1b2d] font-medium transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range (PKR) */}
              <div className="space-y-4">
                <h4 className="font-black text-[#0a1b2d] uppercase text-xs tracking-widest border-b pb-3">Price Range (PKR)</h4>
                <div className="space-y-3">
                  {["Under PKR 25,000", "PKR 25,000 — 100,000", "PKR 100,000 — 250,000", "Over PKR 250,000"].map((price) => (
                    <label key={price} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setSidebarPrice(price === sidebarPrice ? null : price); }}>
                      <div className={`w-5 h-5 rounded-md border-2 transition-colors flex items-center justify-center ${price === sidebarPrice ? 'border-[#164475]' : 'border-gray-300 group-hover:border-[#164475]'}`}>
                        {price === sidebarPrice && <div className="w-3 h-3 bg-[#164475] rounded-sm" />}
                      </div>
                      <span className="text-sm text-gray-600 group-hover:text-[#0a1b2d] font-medium transition-colors">{price}</span>
                    </label>
                  ))}
                </div>
                {/* Min & Max PKR Range Inputs */}
                <div className="pt-2 flex items-center gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-gray-400 block mb-1">Min (Rs.)</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPriceInput}
                      onChange={e => setMinPriceInput(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-[#0a1b2d] focus:outline-none focus:border-[#164475]"
                    />
                  </div>
                  <span className="text-gray-300 pt-4">-</span>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-gray-400 block mb-1">Max (Rs.)</span>
                    <input
                      type="number"
                      placeholder="Any"
                      value={maxPriceInput}
                      onChange={e => setMaxPriceInput(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-[#0a1b2d] focus:outline-none focus:border-[#164475]"
                    />
                  </div>
                </div>
              </div>

              {/* Brands */}
              <div className="space-y-4">
                <h4 className="font-black text-[#0a1b2d] uppercase text-xs tracking-widest border-b pb-3">Brands / Manufacturers</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {dynamicBrands.map((brand) => (
                    <label key={brand} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setSidebarBrand(brand === sidebarBrand ? null : brand); }}>
                      <div className={`w-5 h-5 rounded-md border-2 transition-colors flex items-center justify-center ${brand === sidebarBrand ? 'border-[#164475]' : 'border-gray-300 group-hover:border-[#164475]'}`}>
                        {brand === sidebarBrand && <div className="w-3 h-3 bg-[#164475] rounded-sm" />}
                      </div>
                      <span className="text-sm text-gray-600 group-hover:text-[#0a1b2d] font-medium transition-colors">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-4">
                <h4 className="font-black text-[#0a1b2d] uppercase text-xs tracking-widest border-b pb-3">Product Condition</h4>
                <div className="space-y-3">
                  {["Brand New", "Refurbished"].map((cond) => (
                    <label key={cond} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setSidebarCondition(cond === sidebarCondition ? null : cond); }}>
                      <div className={`w-5 h-5 rounded-md border-2 transition-colors flex items-center justify-center ${cond === sidebarCondition ? 'border-[#164475]' : 'border-gray-300 group-hover:border-[#164475]'}`}>
                        {cond === sidebarCondition && <div className="w-3 h-3 bg-[#164475] rounded-sm" />}
                      </div>
                      <span className="text-sm text-gray-600 group-hover:text-[#0a1b2d] font-medium transition-colors">{cond}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* RAM Capacity */}
              <div className="space-y-4">
                <h4 className="font-black text-[#0a1b2d] uppercase text-xs tracking-widest border-b pb-3">RAM Capacity</h4>
                <div className="flex flex-wrap gap-2">
                  {["8GB", "16GB", "32GB", "64GB"].map((ram) => (
                    <button
                      key={ram}
                      type="button"
                      onClick={() => setSidebarRam(ram === sidebarRam ? null : ram)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${ram === sidebarRam ? 'bg-[#164475] text-white border-[#164475]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#164475]'}`}
                    >
                      {ram}
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage */}
              <div className="space-y-4">
                <h4 className="font-black text-[#0a1b2d] uppercase text-xs tracking-widest border-b pb-3">Storage Capacity</h4>
                <div className="flex flex-wrap gap-2">
                  {["256GB", "512GB", "1TB", "2TB"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSidebarStorage(st === sidebarStorage ? null : st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${st === sidebarStorage ? 'bg-[#164475] text-white border-[#164475]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#164475]'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Processor Type */}
              <div className="space-y-4">
                <h4 className="font-black text-[#0a1b2d] uppercase text-xs tracking-widest border-b pb-3">Processor Series</h4>
                <div className="space-y-2">
                  {["Core i5", "Core i7", "Core i9", "Ryzen 5", "Ryzen 7"].map((proc) => (
                    <label key={proc} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setSidebarProcessor(proc === sidebarProcessor ? null : proc); }}>
                      <div className={`w-5 h-5 rounded-md border-2 transition-colors flex items-center justify-center ${proc === sidebarProcessor ? 'border-[#164475]' : 'border-gray-300 group-hover:border-[#164475]'}`}>
                        {proc === sidebarProcessor && <div className="w-3 h-3 bg-[#164475] rounded-sm" />}
                      </div>
                      <span className="text-sm text-gray-600 group-hover:text-[#0a1b2d] font-medium transition-colors">{proc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-4">
                <h4 className="font-black text-[#0a1b2d] uppercase text-xs tracking-widest border-b pb-3">Availability</h4>
                <div className="space-y-3">
                  {["In Stock", "Out of Stock"].map((status) => (
                    <label key={status} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setSidebarAvailability(status === sidebarAvailability ? null : status); }}>
                      <div className={`w-5 h-5 rounded-md border-2 transition-colors flex items-center justify-center ${status === sidebarAvailability ? 'border-[#164475]' : 'border-gray-300 group-hover:border-[#164475]'}`}>
                        {status === sidebarAvailability && <div className="w-3 h-3 bg-[#164475] rounded-sm" />}
                      </div>
                      <span className="text-sm text-gray-600 group-hover:text-[#0a1b2d] font-medium transition-colors">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0 flex gap-3">
              <button
                onClick={() => {
                  setSidebarCategory("All Products");
                  setSidebarPrice(null);
                  setMinPriceInput('');
                  setMaxPriceInput('');
                  setSidebarBrand(null);
                  setSidebarCondition(null);
                  setSidebarRam(null);
                  setSidebarStorage(null);
                  setSidebarProcessor(null);
                  setSidebarAvailability(null);
                }}
                className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-2xl font-bold transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-2/3 bg-[#0a1b2d] hover:bg-[#164475] text-white py-4 rounded-2xl font-bold transition-colors shadow-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes filterSlideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .shop-card-reveal.is-revealed {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
}

// Wrap with Suspense because useSearchParams() requires it in Next.js
export default function CategoryPage(props: CategoryPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#164475] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CategoryPageInner {...props} />
    </Suspense>
  );
}
