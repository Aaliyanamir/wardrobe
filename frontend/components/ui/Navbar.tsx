'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Sparkles,
  Box,
  Compass,
  Search,
  User,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  SlidersHorizontal,
  Shirt,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

interface NavItem {
  label: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Collection',
    subtitle: 'Explore Luxury Wardrobe',
    href: '/shop',
    icon: ShoppingBag,
  },
  {
    label: 'Try-On Studio',
    subtitle: 'Interactive 3D Customization',
    href: '/studio',
    icon: Sparkles,
    badge: '3D LIVE',
  },
  {
    label: '3D Showroom',
    subtitle: 'Curated Architectural Looks',
    href: '/showroom',
    icon: Box,
  },
  {
    label: 'Lookbook',
    subtitle: 'Editorial Campaigns',
    href: '/lookbook',
    icon: Compass,
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const { toggleCart, cartCount } = useStore();
  const count = cartCount();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle click outside to collapse
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (pathname === '/studio' || pathname === '/showroom') return null;

  return (
    <>
      {/* Dimmed backdrop when sidebar is expanded */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Left Full-Glass Sidebar / Dock */}
      <div
        ref={sidebarRef}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex items-center"
      >
        <motion.nav
          initial={false}
          animate={{
            width: isOpen ? 320 : 62,
            height: isOpen ? '90vh' : 'auto',
            borderRadius: isOpen ? '28px' : '36px',
          }}
          transition={{
            type: 'spring',
            stiffness: 340,
            damping: 32,
          }}
          className={`relative overflow-hidden flex flex-col justify-between transition-colors duration-300
            backdrop-blur-2xl bg-white/20 dark:bg-black/30
            border border-white/35 dark:border-white/15
            shadow-[0_20px_50px_rgba(0,0,0,0.18)]
            text-studio-black dark:text-white
            ${isOpen ? 'p-6 max-h-[820px]' : 'py-5 px-2.5 items-center gap-4'}
          `}
        >
          {/* Subtle Ambient Glass Glare Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/5 pointer-events-none" />

          {/* ================= COLLAPSED ICON DOCK ================= */}
          {!isOpen && (
            <div className="flex flex-col items-center gap-4 relative z-10">
              {/* Expand Toggle Button */}
              <button
                onClick={() => setIsOpen(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 transition-all duration-300 shadow-sm group"
                aria-label="Open Navigation Sidebar"
                title="Expand Navigation Menu"
              >
                <Menu size={18} className="group-hover:scale-110 transition-transform duration-200" />
              </button>

              {/* Brand Logo Monogram */}
              <Link
                href="/"
                className="w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-xs tracking-wider border border-white/40 hover:bg-white/30 transition-colors"
                title="VARDE Home"
              >
                V
              </Link>

              <div className="w-5 h-px bg-white/30 my-0.5" />

              {/* Quick Navigation Icons */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 relative group
                      ${
                        isActive
                          ? 'bg-studio-black text-white shadow-md'
                          : 'hover:bg-white/40 dark:hover:bg-white/10 text-studio-dark dark:text-stone-200'
                      }
                    `}
                    title={item.label}
                  >
                    <Icon size={17} strokeWidth={isActive ? 2 : 1.6} />
                    {item.badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                    )}

                    {/* Tooltip on hover */}
                    <span className="absolute left-14 px-2.5 py-1 rounded-md bg-stone-900/90 text-white text-[11px] font-medium tracking-wide uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-lg">
                      {item.label}
                    </span>
                  </Link>
                );
              })}

              <div className="w-5 h-px bg-white/30 my-0.5" />

              {/* Search Shortcut */}
              <button
                onClick={() => setIsOpen(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/40 dark:hover:bg-white/10 transition-colors text-studio-dark dark:text-stone-200"
                title="Search"
              >
                <Search size={16} strokeWidth={1.6} />
              </button>

              {/* Account Shortcut */}
              <Link
                href="/account"
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/40 dark:hover:bg-white/10 transition-colors text-studio-dark dark:text-stone-200"
                title="Account"
              >
                <User size={16} strokeWidth={1.6} />
              </Link>

              {/* Cart Drawer Trigger with Badge */}
              <button
                onClick={toggleCart}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/40 dark:hover:bg-white/10 transition-colors relative text-studio-dark dark:text-stone-200"
                title="View Bag"
              >
                <ShoppingBag size={17} strokeWidth={1.6} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-stone-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow">
                    {count}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* ================= EXPANDED FULL-GLASS SIDEBAR ================= */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 flex flex-col h-full justify-between"
            >
              {/* Sidebar Header */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/25">
                  <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className="flex flex-col group"
                  >
                    <span className="font-serif text-xl tracking-[0.22em] font-semibold uppercase text-stone-900 dark:text-white">
                      VARDE
                    </span>
                    <span className="text-[10px] tracking-[0.18em] text-stone-600 dark:text-stone-400 uppercase">
                      Virtual Wardrobe
                    </span>
                  </Link>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 transition-all"
                    aria-label="Close Sidebar"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Quick Search */}
                <div className="mt-4 relative">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500"
                  />
                  <input
                    type="text"
                    placeholder="Search garments, fabrics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/35 dark:bg-white/10 border border-white/30 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-800"
                  />
                </div>

                {/* Main Navigation Links */}
                <nav className="mt-6 flex flex-col gap-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-200 group
                          ${
                            isActive
                              ? 'bg-stone-900 text-white shadow-md'
                              : 'hover:bg-white/40 dark:hover:bg-white/10 text-stone-800 dark:text-stone-200'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-white/40 dark:bg-white/10 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            <Icon size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold tracking-wider uppercase">
                              {item.label}
                            </span>
                            <span
                              className={`text-[10px] ${
                                isActive
                                  ? 'text-stone-300'
                                  : 'text-stone-500 dark:text-stone-400'
                              }`}
                            >
                              {item.subtitle}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span className="text-[9px] tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-medium">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight
                            size={14}
                            className={`transition-transform duration-200 ${
                              isActive ? 'text-white' : 'text-stone-400 group-hover:translate-x-0.5'
                            }`}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Spotlight / Interactive Try-On Banner */}
              <div className="my-4 p-3.5 rounded-2xl bg-gradient-to-br from-amber-700/15 via-stone-800/10 to-transparent border border-amber-800/20">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles size={14} className="text-amber-700 dark:text-amber-400" />
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-900 dark:text-amber-300">
                    Real-time 3D Fitting
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                  Tailor garments on our realistic avatar with live fabric textures and size simulation.
                </p>
                <Link
                  href="/studio"
                  onClick={() => setIsOpen(false)}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-stone-900 dark:text-white hover:underline"
                >
                  Enter Studio <ArrowRight size={12} />
                </Link>
              </div>

              {/* Bottom Actions: Account & Cart Summary */}
              <div className="pt-3 border-t border-white/25 flex flex-col gap-2">
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-white/30 dark:hover:bg-white/10 transition-colors text-xs font-medium"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-[11px]">
                      <User size={13} />
                    </div>
                    <span>My Account</span>
                  </div>
                  <ChevronRight size={14} className="text-stone-400" />
                </Link>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    toggleCart();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-between text-xs font-medium tracking-wide shadow-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={14} />
                    <span>Shopping Bag</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold">
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </motion.nav>
      </div>
    </>
  );
}
