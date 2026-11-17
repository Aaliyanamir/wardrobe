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
          <Link href="/contact" className="hover:text-stone-950 transition-colors">
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
                    priority
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

      {/* ================= THE VARDE EDIT ================= */}
      <section className="bg-[#F5F1EB] px-6 py-20 md:px-12 md:py-28 lg:px-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-20">
          <div>
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A36D49]">
              The VARDE point of view
            </p>
            <h2 className="max-w-xl font-serif text-4xl font-medium leading-[1.08] tracking-tight text-stone-900 md:text-6xl">
              Fewer things.
              <br />
              Better made.
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-7 text-stone-600 md:text-base">
              A considered wardrobe starts with pieces that earn their place.
              Thoughtful materials, quietly confident silhouettes, and the freedom
              to find your fit before it reaches your door.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-3 border-b border-stone-900 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-900 transition-colors hover:border-[#A36D49] hover:text-[#A36D49]"
            >
              Get to know VARDE <ArrowRight size={14} />
            </Link>
          </div>
          <Link
            href="/lookbook"
            className="group relative block aspect-[5/4] overflow-hidden bg-[#D9C6B4]"
          >
            <Image
              src="/images/lookbooks/look-001.jpg"
              alt="The Clean Studio editorial collection"
              fill
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white md:p-9">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/75">The latest edit</p>
              <p className="mt-2 font-serif text-2xl md:text-3xl">The Clean Studio</p>
              <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]">
                Explore the lookbook <ArrowRight size={13} />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ================= SHOP BY CATEGORY ================= */}
      <section className="bg-[#F5F1EB] px-6 pb-20 md:px-12 md:pb-28 lg:px-20">
        <div className="mx-auto max-w-7xl border-t border-stone-300/80 pt-12 md:pt-16">
          <div className="mb-8 flex items-end justify-between gap-6 md:mb-10">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A36D49]">
                Find your uniform
              </p>
              <h2 className="font-serif text-3xl font-medium text-stone-900 md:text-4xl">
                Shop by category
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-700 transition-colors hover:text-[#A36D49] sm:inline-flex"
            >
              View all pieces <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {[
              { label: 'Tops', category: 'tops', image: '/images/products/top-linen-shirt.jpg' },
              { label: 'Layers', category: 'hoodies', image: '/images/products/hoodie-001.jpg' },
              { label: 'Outerwear', category: 'jackets', image: '/images/products/jacket-001.jpg' },
              { label: 'Trousers', category: 'pants', image: '/images/products/pants-001.jpg' },
            ].map((category, index) => (
              <Link
                key={category.category}
                href={`/shop?category=${category.category}`}
                className={`group relative block overflow-hidden bg-[#E4D9CE] ${
                  index % 2 === 1 ? 'mt-6 md:mt-10' : ''
                }`}
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={category.image}
                    alt={`${category.label} collection`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/55 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white md:p-6">
                    <span className="font-serif text-xl md:text-2xl">{category.label}</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 transition-colors group-hover:bg-white group-hover:text-stone-900">
                      <ArrowRight size={15} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= THE CURRENT EDIT ================= */}
      <section className="bg-[#E9E1D8] px-6 py-20 md:px-12 md:py-28 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-6 md:mb-14">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A36D49]">
                Considered essentials
              </p>
              <h2 className="font-serif text-3xl font-medium text-stone-900 md:text-4xl">
                Pieces to keep close
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-700 transition-colors hover:text-[#A36D49] sm:inline-flex"
            >
              Shop the collection <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 md:gap-6">
            {products.filter((product) => product.isFeatured).slice(0, 4).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <Link href={`/shop/${product.id}`} className="group block">
                  <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-[#D8CEC4]">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {product.isNew && (
                      <span className="absolute left-3 top-3 bg-[#F5F1EB] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-stone-800">
                        New
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-[#F5F1EB] text-stone-900 opacity-0 shadow-sm transition-all group-hover:translate-y-0 group-hover:opacity-100">
                      <ArrowRight size={15} />
                    </span>
                  </div>
                  <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-stone-500">
                    {product.category}
                  </p>
                  <div className="mt-1 flex items-start justify-between gap-3">
                    <h3 className="text-sm font-medium leading-snug text-stone-900">{product.name}</h3>
                    <span className="shrink-0 text-sm text-stone-800">${product.price}</span>
                  </div>
                  <p className="mt-2 text-xs text-stone-500">{product.colors.length} considered colourways</p>
                </Link>
              </motion.div>
            ))}
          </div>
          <Link
            href="/shop"
            className="mt-10 inline-flex w-full items-center justify-center gap-2 border border-stone-800 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-900 transition-colors hover:bg-stone-900 hover:text-white sm:hidden"
          >
            Shop the collection <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ================= FIT, MADE PERSONAL ================= */}
      <section className="bg-[#F5F1EB] px-6 py-20 md:px-12 md:py-28 lg:px-20">
        <div className="mx-auto grid max-w-7xl overflow-hidden bg-[#B97850] md:grid-cols-2">
          <div className="relative min-h-[300px] md:min-h-[500px]">
            <Image
              src="/images/lookbooks/look-002.jpg"
              alt="VARDE Urban Utility styling"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-7 py-12 text-[#F8F3EC] md:px-12 lg:px-16">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70">
              Your fit, in focus
            </p>
            <h2 className="max-w-lg font-serif text-3xl font-medium leading-tight md:text-5xl">
              See the details before you decide.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/80">
              Explore fabric, colour, and proportion in our interactive fitting
              studio. A more considered way to discover what feels like you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 bg-stone-950 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-stone-800"
              >
                <Sparkles size={14} /> Enter the studio
              </Link>
              <Link
                href="/showroom"
                className="inline-flex items-center gap-2 border border-white/50 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10"
              >
                Explore 3D showroom <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ATELIER PROMISE ================= */}
      <section className="bg-[#F5F1EB] px-6 pb-20 md:px-12 md:pb-28 lg:px-20">
        <div className="mx-auto max-w-7xl border-y border-stone-300/80 py-10 md:py-14">
          <div className="grid grid-cols-1 divide-y divide-stone-300/80 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              { number: '01', title: 'Thoughtful materials', copy: 'Natural textures and considered fabrics, chosen for the way they feel and wear.' },
              { number: '02', title: 'Fit with intention', copy: 'Explore silhouette and sizing with a virtual fitting experience made for you.' },
              { number: '03', title: 'A lasting wardrobe', copy: 'Versatile pieces designed to move easily through seasons and everyday life.' },
            ].map((promise) => (
              <div key={promise.number} className="py-6 sm:px-7 sm:py-0 first:sm:pl-0 last:sm:pr-0">
                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#A36D49]">{promise.number}</span>
                <h3 className="mt-3 font-serif text-xl text-stone-900">{promise.title}</h3>
                <p className="mt-2 max-w-xs text-xs leading-6 text-stone-600">{promise.copy}</p>
              </div>
            ))}
          </div>
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
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] tracking-wider uppercase text-stone-500">
            <Link href="/about" className="hover:text-stone-200">Our Story</Link>
            <Link href="/contact" className="hover:text-stone-200">Contact</Link>
            <Link href="/faq" className="hover:text-stone-200">FAQ</Link>
            <Link href="/shipping-returns" className="hover:text-stone-200">Shipping & Returns</Link>
          </div>
          <p className="text-stone-600 text-[11px]">
            &copy; {new Date().getFullYear()} VARDE Atelier. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
