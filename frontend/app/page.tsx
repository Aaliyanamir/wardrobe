'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Check,
  RotateCcw,
  Sliders,
  Maximize2,
  Search,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import TerracottaVaultScene from '@/components/3d/TerracottaVaultScene';
import { AvatarCustomization } from '@/components/3d/AvatarCharacter';
import { products, Product } from '@/data/products';
import { useStore } from '@/store/useStore';

// Hero carousel items matching the reference screenshot
const heroProductIds = [
  'top-ringer-tee',
  'top-linen-shirt',
  'top-001',
  'hoodie-grey',
  'top-003',
  'hoodie-001',
];

export default function HomePage() {
  const { addToCart, toggleCart, cartCount } = useStore();
  const count = cartCount();

  // Filter category state (All | Tops | Outerwear)
  const [activeCategory, setActiveCategory] = useState<'all' | 'tops' | 'outerwear'>('all');

  // Filtered hero items
  const heroProducts = products.filter((p) => {
    if (activeCategory === 'tops') return p.category === 'tops';
    if (activeCategory === 'outerwear') return p.category === 'hoodies' || p.category === 'jackets';
    return heroProductIds.includes(p.id);
  });

  // Active outfit index (defaults to index 1 which is 'Linen Shirt' in reference image)
  const [activeIndex, setActiveIndex] = useState(1);

  // Fallback safe active product
  const activeProduct = heroProducts[activeIndex % heroProducts.length] || heroProducts[0] || products[0];

  // Active outfit customization
  const [selectedColor, setSelectedColor] = useState<string>(activeProduct.colors[0]?.hex || '#7EAECE');
  const [selectedSize, setSelectedSize] = useState<AvatarCustomization['size']>('M');

  // Sync color when product changes
  useEffect(() => {
    if (activeProduct.colors[0]) {
      setSelectedColor(activeProduct.colors[0].hex);
    }
  }, [activeProduct.id]);

  // Next / Previous carousel handlers
  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : heroProducts.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % heroProducts.length);
  };

  // Mouse wheel scroll navigation on hero canvas with debounce
  const lastScrollTime = useRef<number>(0);
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 450) return; // debounce
    if (Math.abs(e.deltaY) > 30) {
      if (e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      lastScrollTime.current = now;
    }
  };

  // Avatar Customization config passed to 3D scene
  const avatarCustomization: AvatarCustomization = {
    topColor: selectedColor,
    bottomColor: activeProduct.category === 'pants' ? selectedColor : '#2B3036',
    size: selectedSize,
    productId: activeProduct.id, // triggers dissolve swap animation on product change
    fabricRoughness:
      activeProduct.category === 'hoodies'
        ? 0.88
        : activeProduct.category === 'jackets'
        ? activeProduct.tags?.includes('leather')
          ? 0.42
          : 0.68
        : 0.78,
    showGlasses: true,
  };

  // Add active outfit to bag
  const handleAddToBag = () => {
    const colorObj = activeProduct.colors.find((c) => c.hex === selectedColor) || activeProduct.colors[0];
    addToCart({
      id: activeProduct.id,
      name: activeProduct.name,
      price: activeProduct.price,
      size: selectedSize || 'M',
      color: colorObj?.name || 'Default',
      image: activeProduct.images[0],
      category: activeProduct.category,
    });
    toast.success(`${activeProduct.name} (${selectedSize}) added to bag`, {
      icon: '🛍️',
      style: {
        background: '#1F1A17',
        color: '#F8EFE7',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '16px',
        fontSize: '13px',
      },
    });
  };

  // Surrounding items for floating carousel cards
  const prevIndex = (activeIndex - 1 + heroProducts.length) % heroProducts.length;
  const nextIndex1 = (activeIndex + 1) % heroProducts.length;
  const nextIndex2 = (activeIndex + 2) % heroProducts.length;

  const prevProduct = heroProducts[prevIndex];
  const nextProduct1 = heroProducts[nextIndex1];
  const nextProduct2 = heroProducts[nextIndex2];

  return (
    <div className="relative min-h-screen bg-[#C99166] text-stone-900 overflow-x-hidden selection:bg-amber-900 selection:text-white">
      {/* ================= EDITORIAL TOP STRIP (MATCHING 1:1 REFERENCE) ================= */}
      <header className="absolute top-0 left-0 right-0 z-30 px-8 py-5 flex items-center justify-between pointer-events-auto">
        {/* Left Links */}
        <div className="hidden lg:flex items-center gap-8 text-[11px] font-semibold tracking-[0.24em] uppercase text-stone-800/80">
          <Link href="/shop" className="hover:text-stone-950 transition-colors">
            TOTAL
          </Link>
          <Link href="/shop" className="hover:text-stone-950 transition-colors">
            ARTICLES
          </Link>
          <Link href="/studio" className="hover:text-stone-950 transition-colors">
            CONTACT
          </Link>
          <Link href="/lookbook" className="hover:text-stone-950 transition-colors">
            MEDIA ROOM
          </Link>
        </div>

        {/* Center Brand Typography */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 font-serif text-2xl md:text-3xl tracking-[0.32em] font-semibold uppercase text-stone-900 hover:opacity-85 transition-opacity"
        >
          VARDE
        </Link>

        {/* Right Utility Actions */}
        <div className="flex items-center gap-6 text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-800/80 ml-auto">
          <Link href="/shop" className="hover:text-stone-950 transition-colors hidden sm:inline-block">
            SEARCH
          </Link>
          <Link href="/account" className="hover:text-stone-950 transition-colors hidden sm:inline-block">
            ACCOUNT
          </Link>
          <button
            onClick={toggleCart}
            className="flex items-center gap-2 hover:text-stone-950 transition-colors"
          >
            <span>BAG</span>
            <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-bold">
              {count}
            </span>
          </button>
        </div>
      </header>

      {/* ================= HERO 3D SCENE & INTERACTIVE CAROUSEL ================= */}
      <section
        onWheel={handleWheel}
        className="relative w-full h-screen min-h-[720px] flex items-center justify-center overflow-hidden"
      >
        {/* Real-time 3D Canvas Background */}
        <div className="absolute inset-0 z-0">
          <Canvas
            shadows
            dpr={[1, 2]}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.08,
            }}
          >
            <PerspectiveCamera makeDefault position={[0, 0.22, 4.05]} fov={38} />

            <Suspense fallback={null}>
              <TerracottaVaultScene
                customization={avatarCustomization}
                interactiveLookAt={true}
              />
            </Suspense>

            {/* Orbit controls for smooth mouse interaction */}
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              minPolarAngle={Math.PI / 2.3}
              maxPolarAngle={Math.PI / 1.85}
              minAzimuthAngle={-Math.PI / 7}
              maxAzimuthAngle={Math.PI / 7}
              rotateSpeed={0.4}
            />
          </Canvas>
        </div>

        {/* Top Center Category Filter Capsule (All | Tops | Outerwear) */}
        <div className="absolute top-12 z-20 flex justify-center w-full pointer-events-none">
          <div className="pointer-events-auto flex items-center p-1 rounded-full backdrop-blur-xl bg-black/20 border border-white/25 shadow-lg">
            {(['all', 'tops', 'outerwear'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveIndex(0);
                }}
                className={`px-5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-white/90 text-stone-900 shadow-md scale-105'
                    : 'text-stone-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat === 'all' ? 'All' : cat === 'tops' ? 'Tops' : 'Outerwear'}
              </button>
            ))}
          </div>
        </div>

        {/* ================= FLANKING INTERACTIVE GLASS CAROUSEL CARDS ================= */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-between px-6 sm:px-12 md:px-20 lg:px-28">
          {/* Left Side: Navigation Arrow & Previous Product Card */}
          <div className="flex items-center gap-4 sm:gap-6 pointer-events-auto">
            {/* Circular Terracotta / Glass Left Arrow */}
            <button
              onClick={handlePrev}
              className="w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl bg-stone-900/20 hover:bg-stone-900/35 border border-white/30 text-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Previous Outfit"
            >
              <ChevronLeft size={20} strokeWidth={2.2} />
            </button>

            {/* Previous Outfit Glass Card */}
            {prevProduct && (
              <motion.div
                key={prevProduct.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.4 }}
                onClick={handlePrev}
                className="cursor-pointer group flex flex-col items-center p-4 rounded-3xl backdrop-blur-xl bg-white/20 hover:bg-white/30 border border-white/35 shadow-2xl transition-all duration-300 hover:scale-105 w-40 sm:w-48 text-center"
              >
                <div className="relative w-28 h-32 sm:w-36 sm:h-40 mb-3 rounded-2xl overflow-hidden bg-black/5 flex items-center justify-center">
                  <Image
                    src={prevProduct.images[0]}
                    alt={prevProduct.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="160px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
                <span className="text-xs sm:text-sm font-semibold tracking-wide text-stone-900">
                  {prevProduct.name}
                </span>
                <span className="text-[11px] sm:text-xs font-serif text-stone-800 font-bold mt-0.5">
                  ${prevProduct.price}.00
                </span>
              </motion.div>
            )}
          </div>

          {/* Right Side: Next Product Cards & Right Navigation Arrow */}
          <div className="flex items-center gap-4 sm:gap-6 pointer-events-auto">
            {/* Next Product Card 1 */}
            {nextProduct1 && (
              <motion.div
                key={nextProduct1.id}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.4 }}
                onClick={handleNext}
                className="cursor-pointer group hidden md:flex flex-col items-center p-4 rounded-3xl backdrop-blur-xl bg-white/20 hover:bg-white/30 border border-white/35 shadow-2xl transition-all duration-300 hover:scale-105 w-40 sm:w-48 text-center"
              >
                <div className="relative w-28 h-32 sm:w-36 sm:h-40 mb-3 rounded-2xl overflow-hidden bg-black/5 flex items-center justify-center">
                  <Image
                    src={nextProduct1.images[0]}
                    alt={nextProduct1.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="160px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
                <span className="text-xs sm:text-sm font-semibold tracking-wide text-stone-900">
                  {nextProduct1.name}
                </span>
                <span className="text-[11px] sm:text-xs font-serif text-stone-800 font-bold mt-0.5">
                  ${nextProduct1.price}.00
                </span>
              </motion.div>
            )}

            {/* Next Product Card 2 (visible on xl screens) */}
            {nextProduct2 && (
              <motion.div
                key={nextProduct2.id}
                initial={{ opacity: 0, x: 30, scale: 0.9 }}
                animate={{ opacity: 0.85, x: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                onClick={() => setActiveIndex(nextIndex2)}
                className="cursor-pointer group hidden xl:flex flex-col items-center p-4 rounded-3xl backdrop-blur-lg bg-white/15 hover:bg-white/25 border border-white/30 shadow-xl transition-all duration-300 hover:scale-100 w-36 text-center"
              >
                <div className="relative w-28 h-32 mb-2 rounded-2xl overflow-hidden bg-black/5 flex items-center justify-center">
                  <Image
                    src={nextProduct2.images[0]}
                    alt={nextProduct2.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="140px"
                  />
                </div>
                <span className="text-xs font-semibold tracking-wide text-stone-900 truncate w-full">
                  {nextProduct2.name}
                </span>
                <span className="text-[11px] font-serif text-stone-800 font-bold">
                  ${nextProduct2.price}.00
                </span>
              </motion.div>
            )}

            {/* Circular Terracotta / Glass Right Arrow */}
            <button
              onClick={handleNext}
              className="w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl bg-stone-900/20 hover:bg-stone-900/35 border border-white/30 text-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Next Outfit"
            >
              <ChevronRight size={20} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* ================= BOTTOM FLOATING ISLAND BAR (MATCHING REFERENCE 1:1) ================= */}
        <div className="absolute bottom-6 sm:bottom-8 z-20 flex justify-center w-full px-4 pointer-events-none">
          <motion.div
            layout
            className="pointer-events-auto flex flex-nowrap items-center justify-between gap-3 sm:gap-6 px-6 py-2.5 rounded-full backdrop-blur-2xl bg-white/20 dark:bg-black/35 border border-white/35 shadow-[0_20px_50px_rgba(0,0,0,0.25)] max-w-full overflow-x-auto no-scrollbar"
          >
            {/* Left: Active Garment Thumbnail & Price */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white/40 border border-white/40 flex-shrink-0 shadow-inner">
                <Image
                  src={activeProduct.images[0]}
                  alt={activeProduct.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="flex flex-col flex-shrink-0">
                <span className="text-xs font-semibold tracking-wide text-stone-900">
                  {activeProduct.name}
                </span>
                <span className="text-xs font-serif font-bold text-stone-800">
                  ${activeProduct.price}.00
                </span>
              </div>
            </div>

            <div className="h-5 w-px bg-stone-900/20 flex-shrink-0" />

            {/* Center: Size Selector Pills (XS | S | M | L | XL) */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] font-bold tracking-wider uppercase text-stone-700 mr-1 hidden sm:inline-block">
                Size:
              </span>
              {(['XS', 'S', 'M', 'L', 'XL'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-7 h-7 rounded-full text-[10px] font-semibold transition-all duration-200 flex items-center justify-center flex-shrink-0 ${
                    selectedSize === size
                      ? 'bg-stone-900 text-white shadow-md scale-110'
                      : 'bg-white/35 hover:bg-white/60 text-stone-800 border border-white/30'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <div className="h-5 w-px bg-stone-900/20 flex-shrink-0" />

            {/* Center-Right: Color Swatch Dots */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] font-bold tracking-wider uppercase text-stone-700 mr-1 hidden sm:inline-block">
                Color:
              </span>
              {activeProduct.colors.map((color) => {
                const isSelected = selectedColor === color.hex;
                return (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.hex)}
                    title={color.name}
                    className={`w-5 h-5 rounded-full transition-all duration-200 flex-shrink-0 ${
                      isSelected
                        ? 'ring-2 ring-stone-900 scale-125 shadow-md'
                        : 'hover:scale-110 border border-black/10'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                );
              })}
            </div>

            <div className="h-5 w-px bg-stone-900/20 flex-shrink-0" />

            {/* Right: Add to Bag Dark Pill Button */}
            <button
              onClick={handleAddToBag}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-stone-950 hover:bg-stone-900 text-white text-[11px] font-semibold tracking-wider uppercase shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0 whitespace-nowrap"
            >
              <ShoppingBag size={13} />
              <span>Add to bag</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ================= COMPLEMENTARY EDITORIAL SHOWCASE ================= */}
      <section className="relative z-10 bg-stone-900 text-stone-100 py-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-stone-800 pb-8">
            <div>
              <span className="text-xs tracking-[0.3em] font-semibold uppercase text-amber-500 mb-2 block">
                Next-Gen Fitting
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-medium tracking-tight text-stone-100">
                Crafted for Form & Motion
              </h2>
            </div>
            <p className="text-stone-400 text-sm max-w-md mt-4 md:mt-0 font-light leading-relaxed">
              Every garment in the VARDE catalog is calibrated to realistic physical drape, responsive tailoring algorithms, and authentic European textiles.
            </p>
          </div>

          {/* 3 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-stone-800/40 border border-stone-800 hover:border-stone-700 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles size={22} />
              </div>
              <h3 className="font-serif text-xl font-medium mb-3">Live 3D Virtual Try-On</h3>
              <p className="text-stone-400 text-xs leading-relaxed mb-6 font-light">
                Inspect fits on our realistic sculpted character model with dynamic posture, fluid physics, and real-time color simulation.
              </p>
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400 hover:text-amber-300"
              >
                Launch Studio <ArrowRight size={14} />
              </Link>
            </div>

            <div className="p-8 rounded-3xl bg-stone-800/40 border border-stone-800 hover:border-stone-700 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sliders size={22} />
              </div>
              <h3 className="font-serif text-xl font-medium mb-3">Adaptive Proportional Fit</h3>
              <p className="text-stone-400 text-xs leading-relaxed mb-6 font-light">
                Switch seamlessly between XS to 2XL. Witness chest drop, relaxed shoulders, and hemline drape adjust proportionally in real time.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400 hover:text-amber-300"
              >
                Explore Sizing <ArrowRight size={14} />
              </Link>
            </div>

            <div className="p-8 rounded-3xl bg-stone-800/40 border border-stone-800 hover:border-stone-700 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Maximize2 size={22} />
              </div>
              <h3 className="font-serif text-xl font-medium mb-3">3D Architectural Showroom</h3>
              <p className="text-stone-400 text-xs leading-relaxed mb-6 font-light">
                Walk through multi-pedestal gallery showrooms with gallery lighting, reflective travertine floors, and complete seasonal ensembles.
              </p>
              <Link
                href="/showroom"
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400 hover:text-amber-300"
              >
                Enter Showroom <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= EDITORIAL FOOTER ================= */}
      <footer className="bg-stone-950 text-stone-500 py-12 px-6 md:px-12 border-t border-stone-900 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="font-serif text-base tracking-[0.25em] text-stone-300 font-bold">
              VARDE
            </span>
            <span className="text-stone-600">|</span>
            <span>Virtual Fitting & Luxury Tailoring</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] tracking-wider uppercase text-stone-400">
            <Link href="/shop" className="hover:text-stone-200">Catalog</Link>
            <Link href="/studio" className="hover:text-stone-200">Try-On Studio</Link>
            <Link href="/showroom" className="hover:text-stone-200">Showroom</Link>
            <Link href="/lookbook" className="hover:text-stone-200">Lookbook</Link>
          </div>
          <p className="text-stone-600 text-[11px]">
            &copy; {new Date().getFullYear()} VARDE Atelier. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
