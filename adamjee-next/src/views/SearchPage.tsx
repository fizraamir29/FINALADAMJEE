'use client';
import Link from 'next/link';
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '../types';
import { Filter, ChevronDown, ShoppingCart, X, Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';


interface SearchPageProps {
  handleAddToCart: (product: Product) => void;
  formatPrice: (usdAmount: number) => string;
}

function SearchPageInner({ handleAddToCart, formatPrice }: SearchPageProps) {
  const searchParams = useSearchParams();
  const urlQ = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(urlQ);
  const MAX_PRICE = 2000000; // 2 million PKR ceiling
  const [priceRange, setPriceRange] = useState(MAX_PRICE);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Featured');
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync search term when URL param changes (e.g. user types in navbar and hits enter)
  useEffect(() => {
    if (urlQ) setSearchTerm(urlQ);
  }, [urlQ]);

  // Fetch all products from backend — with real-time sync
  useEffect(() => {
    const fetchProds = () => {
      fetch('/api/products?limit=100')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.products)) {
            setAllProducts(data.products);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    };

    fetchProds();

    // Real-time sync: listen for admin product changes
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

  // Derive unique categories from products — dynamic, not hardcoded
  const dynamicCategories = useMemo(() => {
    const cats = new Set<string>();
    allProducts.forEach(p => { if (p.category) cats.add(p.category.trim()); });
    return ['All', ...Array.from(cats).sort()];
  }, [allProducts]);

  // Reset category filter if selected one no longer exists in fresh data
  useEffect(() => {
    if (selectedCategory !== 'All' && !dynamicCategories.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [dynamicCategories, selectedCategory]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ((p as any).description && (p as any).description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesPrice = p.price <= priceRange;
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesPrice && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Newest') return new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime();
      return 0; // Featured / Default
    });
  }, [allProducts, searchTerm, priceRange, selectedCategory, sortBy]);

  const handleReset = () => {
    setSearchTerm('');
    setPriceRange(MAX_PRICE);
    setSelectedCategory('All');
    setSortBy('Featured');
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#fafbfc]">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-extrabold text-[#0a1b2d] mb-2">Search Products</h1>
        <p className="text-[#64748b] mb-8">Find exactly what you're looking for in our premium catalog.</p>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-sm sticky top-32">
              <div className="flex items-center justify-between gap-2 mb-6">
                <div className="flex items-center gap-2 text-[#0a1b2d] font-bold text-lg">
                  <Filter className="w-5 h-5 text-[#164475]" /> Filters
                </div>
                {(searchTerm || selectedCategory !== 'All' || priceRange < MAX_PRICE) && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
              
              {/* Keyword Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search keywords..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#cbd5e1] focus:ring-2 focus:ring-[#164475] focus:border-[#164475] outline-none text-sm"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Categories */}
              <div className="mb-6">
                <h3 className="font-bold text-[#0a1b2d] mb-3">
                  Categories
                  {loading && <span className="ml-2 text-xs text-gray-400 font-normal">Loading...</span>}
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {dynamicCategories.map(cat => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group" onClick={() => setSelectedCategory(cat)}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${selectedCategory === cat ? 'border-[#164475] bg-[#164475]' : 'border-[#cbd5e1] group-hover:border-[#164475]'}`}>
                        {selectedCategory === cat && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                      </div>
                      <span className={`text-sm ${selectedCategory === cat ? 'font-bold text-[#0a1b2d]' : 'text-[#64748b] group-hover:text-[#0a1b2d]'}`}>
                        {cat}
                        {cat !== 'All' && (
                          <span className="ml-1 text-xs text-gray-400">
                            ({allProducts.filter(p => p.category === cat).length})
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="mb-6">
                <h3 className="font-bold text-[#0a1b2d] mb-1">Max Price</h3>
                <p className="text-sm font-semibold text-[#164475] mb-2">
                  {priceRange >= MAX_PRICE ? 'Any price' : formatPrice(priceRange)}
                </p>
                <input 
                  type="range" 
                  min="0"
                  max={MAX_PRICE}
                  step="5000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-[#164475]"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>{formatPrice(0)}</span>
                  <span>{formatPrice(MAX_PRICE)}</span>
                </div>
              </div>

              <button 
                onClick={handleReset}
                className="w-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0a1b2d] font-bold py-3 rounded-xl transition-colors text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="w-full lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-[#64748b] font-medium">
                {loading
                  ? 'Loading products...'
                  : <><strong className="text-[#0a1b2d]">{filteredProducts.length}</strong> of <strong className="text-[#0a1b2d]">{allProducts.length}</strong> products</>
                }
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#64748b] font-medium">Sort by:</span>
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-[#cbd5e1] rounded-xl pl-4 pr-10 py-2 text-sm font-bold text-[#0a1b2d] focus:outline-none focus:ring-2 focus:ring-[#164475] cursor-pointer"
                  >
                    <option>Featured</option>
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <div className="w-10 h-10 border-4 border-[#164475] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => {
                  const prodId = (product as any)._id || product.id;
                  return (
                    <div key={prodId} className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
                      <Link href={`/product/${(product as any).slug || prodId}`} className="block relative aspect-square mb-6 overflow-hidden rounded-2xl bg-[#f8fafc]">
                        <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 p-4"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/images/custom_blue_gaming_pc_cases_1780242165601.png'; }}
                        />
                        {product.tag && (
                          <span className="absolute top-3 left-3 bg-[#164475] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                            {product.tag}
                          </span>
                        )}
                      </Link>
                      <div className="flex-1 flex flex-col">
                        {product.category && (
                          <div className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-1">{product.category}</div>
                        )}
                        <Link href={`/product/${(product as any).slug || prodId}`} className="text-base font-bold text-[#0a1b2d] mb-2 hover:text-[#164475] transition-colors line-clamp-2">
                          {product.name}
                        </Link>
                        <div className="mt-auto pt-4 flex items-center justify-between">
                          <div className="text-xl font-black text-[#164475]">{formatPrice(product.price)}</div>
                          <button 
                            onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                            className="w-10 h-10 rounded-full bg-[#f1f5f9] text-[#164475] flex items-center justify-center hover:bg-[#164475] hover:text-white transition-colors"
                          >
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#e2e8f0] p-16 text-center shadow-sm">
                <div className="w-20 h-20 bg-[#f1f5f9] rounded-full flex items-center justify-center mx-auto mb-6 text-[#64748b]">
                  <Filter className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-[#0a1b2d] mb-2">No products found</h3>
                {searchTerm && (
                  <p className="text-[#64748b] mb-2">
                    No results for <strong>"{searchTerm}"</strong>
                  </p>
                )}
                <p className="text-[#64748b] mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                <button 
                  onClick={handleReset}
                  className="bg-[#164475] text-white font-bold px-8 py-3 rounded-full hover:bg-[#0a1b2d] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage(props: SearchPageProps) {
  return (
    <Suspense fallback={
      <div className="pt-32 pb-24 min-h-screen bg-[#fafbfc] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#164475] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SearchPageInner {...props} />
    </Suspense>
  );
}
