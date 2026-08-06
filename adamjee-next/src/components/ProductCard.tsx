'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Eye, Plus, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { getCategoryFallbackImage, getProductImage } from '../utils/storage';

interface ProductCardProps {
  product: Product;
  formatPrice?: (amount: number) => string;
  onAddToCart?: (product: Product) => void;
  buttonLabel?: string;
  isBundleSelected?: boolean;
  onToggleBundle?: (product: Product) => void;
  showBundleButton?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  formatPrice,
  onAddToCart,
  buttonLabel,
  isBundleSelected,
  onToggleBundle,
  showBundleButton = false,
  className = '',
}: ProductCardProps) {
  const defaultFormatPrice = (amount: number) => `PKR ${Math.round(Number(amount) || 0).toLocaleString('en-PK')}`;
  const fmtPrice = formatPrice || defaultFormatPrice;
  // Collect images for the 3 thumbnails
  const primaryImg = getProductImage(product);

  const rawList = [
    product.image,
    ...(Array.isArray(product.images) ? product.images : []),
    ...(Array.isArray(product.additionalImages) ? product.additionalImages : [])
  ];
  const realImages = Array.from(new Set(rawList.filter((img): img is string => typeof img === 'string' && img.trim().length > 0)));
  const thumbnails = realImages.length > 0 ? realImages : [primaryImg || '/images/headphone_transparent.png'];

  // Currently displayed main image index
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);

  const handleSwapImage = (idx: number) => {
    if (idx === activeImgIndex) return;
    setIsSwapping(true);
    setActiveImgIndex(idx);
    setTimeout(() => setIsSwapping(false), 250);
  };

  const tag = product.tag || (product.price > 800 ? 'Hot' : 'New');
  const isHot = tag.toLowerCase() === 'hot' || tag.toLowerCase() === 'sale';
  const code = product.code || (product.id ? `CODE ${product.id.toUpperCase()}` : 'CODE U2917W');
  const ratingVal = product.rating ? Number(product.rating).toFixed(1) : '5.0';

  const productId = product.id || product._id || product.slug || 'na';

  return (
    <div
      className={`bg-white rounded-[24px] border border-gray-100 p-5 md:p-6 flex flex-col justify-between group transition-all duration-300 ease-in-out hover:border-[#164475]/40 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(22,68,117,0.12)] relative ${className}`}
    >
      {/* ─── Top Row: Badge & Rating/Eye ─── */}
      <div className="flex justify-between items-center w-full select-none z-10">
        <span
          className={`text-[10px] md:text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider transition-colors duration-300 ${
            isHot ? 'bg-[#f3b73e] text-white' : 'bg-[#164475] text-white'
          }`}
        >
          {tag}
        </span>

        <div className="relative flex items-center justify-end">
          {/* Rating Pill (fades on hover) */}
          <span className="bg-white px-2.5 py-1 rounded-full text-[11px] font-bold text-[#0a1b2d] flex items-center gap-1 shadow-sm border border-gray-100 transition-all duration-300 group-hover:opacity-0 group-hover:pointer-events-none">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{ratingVal}</span>
          </span>

          {/* Eye Icon Quick View (fades in on hover) */}
          <Link
            href={`/product/${productId}`}
            className="absolute right-0 bg-white w-7 h-7 rounded-full flex items-center justify-center shadow-sm border border-gray-100 transition-all duration-300 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 hover:bg-[#f0f7ff]"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5 text-[#164475]" />
          </Link>
        </div>
      </div>

      {/* ─── Main Product Image Area ─── */}
      <Link
        href={`/product/${productId}`}
        className="my-3 flex flex-col items-center justify-center h-[170px] w-full relative group/img overflow-hidden"
      >
        <img
          src={thumbnails[activeImgIndex] || primaryImg}
          alt={product.name}
          className={`max-h-[145px] w-auto object-contain transition-all duration-500 ease-out group-hover:scale-105 ${
            isSwapping ? 'opacity-40 scale-95' : 'opacity-100 scale-100'
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = getCategoryFallbackImage(product.category, product.name);
          }}
          style={{ mixBlendMode: 'multiply' }}
        />
        {/* Subtle hover dots under main image if multiple images */}
        {thumbnails.length > 1 && (
          <div className="flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {thumbnails.map((_, i) => (
              <span
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  activeImgIndex === i ? 'w-2 h-2 bg-[#164475]' : 'w-1.5 h-1.5 bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </Link>

      {/* ─── Bottom Area: Code, Title, Price, 3 Swatch Thumbnails, Action ─── */}
      <div className="space-y-2 pt-1 text-left">
        <span className="text-[11px] font-semibold text-gray-400 block tracking-wide uppercase">
          {code}
        </span>

        <div className="flex items-baseline justify-between gap-2">
          <Link href={`/product/${productId}`} className="flex-1 min-w-0">
            <h3 className={`text-sm md:text-base font-bold transition-colors duration-300 line-clamp-1 ${
              isBundleSelected ? 'text-[#164475]' : 'text-[#0a1b2d] group-hover:text-[#164475]'
            }`}>
              {product.name}
            </h3>
          </Link>
          <span className="text-xs md:text-sm font-bold text-gray-600 shrink-0">
            {fmtPrice(product.price)}
          </span>
        </div>

        {/* ─── Real Image Swatches Row (Click to Swap Image) ─── */}
        <div className="flex items-center justify-between pt-1 gap-2 min-h-[32px]">
          {thumbnails.length > 1 ? (
            <div className="flex items-center gap-1.5">
              {thumbnails.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSwapImage(i);
                  }}
                  className={`w-7 h-7 rounded-md p-0.5 bg-white flex items-center justify-center transition-all duration-200 border cursor-pointer ${
                    activeImgIndex === i
                      ? 'border-[#164475] ring-2 ring-[#164475]/20 shadow-sm scale-105'
                      : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                  }`}
                  title={`Angle ${i + 1}`}
                >
                  <img
                    src={img}
                    alt={`Thumb ${i + 1}`}
                    className="w-full h-full object-contain mix-blend-multiply"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getCategoryFallbackImage(product.category, product.name);
                    }}
                  />
                </button>
              ))}
            </div>
          ) : (
            <div />
          )}

          {/* Quick Plus / Add Button */}
          {onAddToCart && !showBundleButton && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="w-8 h-8 rounded-full bg-[#164475] hover:bg-[#0a1b2d] text-white flex items-center justify-center transition-transform active:scale-95 shadow-sm hover:shadow cursor-pointer"
              title="Add to Cart"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ─── Full Width "Add to Bundle" / "Add to Cart" Button ─── */}
        {showBundleButton && (
          <div className="pt-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onToggleBundle) {
                  onToggleBundle(product);
                } else if (onAddToCart) {
                  onAddToCart(product);
                }
              }}
              className={`w-full py-3 rounded-full text-xs font-extrabold tracking-wide transition-all duration-300 cursor-pointer text-center border ${
                isBundleSelected
                  ? 'bg-[#164475] text-white border-transparent shadow-md hover:bg-[#0c2f56]'
                  : 'bg-[#f8f9fa] text-[#164475] border border-gray-300 hover:border-[#164475] hover:bg-white'
              }`}
            >
              {buttonLabel || (isBundleSelected ? '✓ Added to Bundle' : 'Add to Bundle')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
