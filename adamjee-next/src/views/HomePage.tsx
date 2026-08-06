'use client';
import React, { useState } from "react";
import { useSEO } from "../hooks/useSEO";
import { Product } from "../types";
import HeroSection from "../components/HeroSection";
import TechCategories from "../components/TechCategories";
import NewArrivals from "../components/NewArrivals";
import PromoBanner from "../components/PromoBanner";
import BestSellers from "../components/BestSellers";
import CustomRigPromo from "../components/CustomRigPromo";
import CustomRigBuilderModal from "../components/CustomRigBuilderModal";
import PerformanceChecker from "../components/PerformanceChecker";
import PerformanceCheckerModal from "../components/PerformanceCheckerModal";
import CountdownTimerDeal from "../components/CountdownTimerDeal";
import Testimonials from "../components/Testimonials";
import SetupSubmissionModal from "../components/SetupSubmissionModal";
import BlogSection from "../components/BlogSection";

interface HomePageProps {
  handleAddToCart: (product: Product) => void;
  formatPrice: (usdAmount: number) => string;
}

export default function HomePage({ handleAddToCart, formatPrice }: HomePageProps) {
  useSEO({
    title: "Adamjee Computers | Premium Custom Gaming PCs & Laptops Pakistan",
    description: "Buy premium custom gaming PCs, high-performance laptops, graphic cards, and tech components at Adamjee Computers Pakistan. Custom build your dream gaming rig today.",
    keywords: "gaming PC, custom rig, laptops, computer accessories, tech store, Adamjee Computers, DHA Karachi, Pakistan"
  });
  // Bundle Builder
  const [bundle, setBundle] = useState<Product[]>([]);

  const [showBundleMessage, setShowBundleMessage] = useState(false);

  // Modal Triggers
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isPerfModalOpen, setIsPerfModalOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Toggle Bundle addition (multi-selection support without auto-deselecting)
  const handleToggleBundle = (product: Product) => {
    const prodId = product.id || (product as any)._id || product.code;
    setBundle(prev => {
      const exists = prev.some(item => (item.id || (item as any)._id || item.code) === prodId);
      if (exists) {
        return prev.filter(item => (item.id || (item as any)._id || item.code) !== prodId);
      }
      return [...prev, product];
    });
  };

  // Add Bundle to Cart
  const addBundleToCart = () => {
    if (bundle.length === 0) {
      setShowBundleMessage(true);
      return;
    }
    setShowBundleMessage(false);
    bundle.forEach(p => handleAddToCart(p));
    setBundle([]);
  };

  return (
    <>
      {/* 3. HERO SECTION */}
      <HeroSection onBuildPcOpen={() => setIsBuilderOpen(true)} />

      {/* 4. EXPLORE TOP TECH CATEGORIES */}
      <TechCategories setIsBuilderOpen={setIsBuilderOpen} />

      {/* 5. NEW ARRIVALS GRID */}
      <NewArrivals onAddToCart={handleAddToCart} formatPrice={formatPrice} />

      {/* 6. GAMING. PERFORMANCE. INNOVATION. BANNER */}
      <PromoBanner onAddToCart={handleAddToCart} />

      {/* 7. BEST SELLERS / BUNDLE SECTION */}
      <BestSellers 
        bundle={bundle} 
        onToggleBundle={handleToggleBundle} 
        onAddBundleToCart={addBundleToCart} 
        showBundleMessage={showBundleMessage} 
        formatPrice={formatPrice} 
      />

      {/* 8. BUILD YOUR CUSTOM PC PROMO BANNER */}
      <CustomRigPromo onBuildPcOpen={() => setIsBuilderOpen(true)} />

      {/* 9. CUSTOM PC BUILDER WORKSPACE MODAL POPUP */}
      <CustomRigBuilderModal 
        isOpen={isBuilderOpen} 
        onClose={() => setIsBuilderOpen(false)} 
        onAddToCart={handleAddToCart} 
        formatPrice={formatPrice} 
      />

      {/* 10. PC PERFORMANCE CHECKER WIDGET */}
      <PerformanceChecker onCheckPerfOpen={() => setIsPerfModalOpen(true)} />

      {/* PC PERFORMANCE INTERACTIVE CHECKER MODAL */}
      <PerformanceCheckerModal 
        isOpen={isPerfModalOpen} 
        onClose={() => setIsPerfModalOpen(false)} 
      />

      {/* 11. LIMITED TIME GAMING DEALS (COUNTDOWN TIMER BANNER) */}
      <CountdownTimerDeal onAddToCart={handleAddToCart} />

      {/* 12. "YOUR TRUSTED DESTINATION" TESTIMONIAL GRID */}
      <Testimonials onOpenSubmitModal={() => setShowSubmitModal(true)} />

      {/* SETUP SUBMISSION DIALOG */}
      <SetupSubmissionModal 
        isOpen={showSubmitModal} 
        onClose={() => setShowSubmitModal(false)} 
      />

      {/* 13. SMART TECH INSIGHTS (BLOG SECTION) */}
      <BlogSection />
    </>
  );
}
