'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { SlidersHorizontal, Sparkles, X, ChevronDown, Star, Radio } from 'lucide-react';
import { products as fallbackProducts, categories, Product } from '@/data/products';
import { fetchProducts } from '@/lib/api';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'rating';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'New Arrivals' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const priceRanges = [
  { label: 'Under $200', min: 0, max: 200 },
  { label: '$200–$400', min: 200, max: 400 },
  { label: '$400–$800', min: 400, max: 800 },
  { label: 'Over $800', min: 800, max: Infinity },
];

export default function ShopPage() {
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activePriceRange, setActivePriceRange] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [productList, setProductList] = useState<Product[]>(fallbackProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const { addToCart, toggleCart } = useStore();

  const toggleCategory = (cat: string) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Live dynamic product fetching from Express backend with query filters
  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      setIsLoading(true);
      const priceRange = activePriceRange !== null ? priceRanges[activePriceRange] : null;

      const res = await fetchProducts({
        category: activeCategories.length === 1 ? activeCategories[0] : undefined,
        minPrice: priceRange ? priceRange.min : undefined,
        maxPrice: priceRange && priceRange.max !== Infinity ? priceRange.max : undefined,
        sort: sortBy,
      });

      if (mounted) {
        let finalProducts = res.products;
        // If multiple categories are selected on client, filter multi-category
        if (activeCategories.length > 1) {
          finalProducts = finalProducts.filter((p) => activeCategories.includes(p.category));
        }
        setProductList(finalProducts);
        setIsLiveApi(res.isLive);
        setIsLoading(false);
      }
    };

    loadProducts();
    return () => {
      mounted = false;
    };
  }, [activeCategories, activePriceRange, sortBy]);

  const activeFilterCount = activeCategories.length + (activePriceRange !== null ? 1 : 0);

  return (
    <div className="bg-studio-white min-h-screen pt-24">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Header */}
        <div className="py-10 border-b border-studio-grey">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-label text-studio-mid">The Collection</p>
                {isLiveApi ? (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-mono font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live REST API
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-mono text-studio-mid bg-studio-grey px-2 py-0.5">
                    Offline Cache
                  </span>
                )}
              </div>
              <h1 className="text-heading font-light">All Products</h1>
              <p className="text-sm text-studio-dark mt-2">
                {isLoading ? 'Loading catalog…' : `${productList.length} pieces`}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`flex items-center gap-2 px-5 py-3 border text-label transition-all duration-200 ${
                  activeFilterCount > 0
                    ? 'border-studio-black bg-studio-black text-studio-white'
                    : 'border-studio-grey text-studio-dark hover:border-studio-black'
                }`}
              >
                <SlidersHorizontal size={14} />
                Filter
                {activeFilterCount > 0 && (
                  <span className="bg-accent-gold text-studio-black w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-medium">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-5 py-3 border border-studio-grey text-label text-studio-dark hover:border-studio-black transition-colors"
                >
                  Sort: {sortOptions.find((s) => s.value === sortBy)?.label}
                  <ChevronDown size={14} />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-1 bg-studio-white border border-studio-grey z-30 min-w-[200px]"
                    >
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value);
                            setSortOpen(false);
                          }}
                          className={`w-full text-left px-5 py-3 text-label transition-colors hover:bg-studio-grey ${
                            sortBy === opt.value ? 'text-studio-black' : 'text-studio-dark'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-8 pb-4 flex flex-wrap gap-10">
                  {/* Category filters */}
                  <div>
                    <p className="text-label text-studio-mid mb-4">Category</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => toggleCategory(cat.id)}
                          className={`px-4 py-2 text-label transition-all duration-200 ${
                            activeCategories.includes(cat.id)
                              ? 'bg-studio-black text-studio-white'
                              : 'border border-studio-grey text-studio-dark hover:border-studio-black'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price range */}
                  <div>
                    <p className="text-label text-studio-mid mb-4">Price</p>
                    <div className="flex flex-wrap gap-2">
                      {priceRanges.map((range, i) => (
                        <button
                          key={range.label}
                          onClick={() =>
                            setActivePriceRange(activePriceRange === i ? null : i)
                          }
                          className={`px-4 py-2 text-label transition-all duration-200 ${
                            activePriceRange === i
                              ? 'bg-studio-black text-studio-white'
                              : 'border border-studio-grey text-studio-dark hover:border-studio-black'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear */}
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => {
                        setActiveCategories([]);
                        setActivePriceRange(null);
                      }}
                      className="flex items-center gap-1 text-label text-studio-dark hover:text-studio-black self-end"
                    >
                      <X size={12} />
                      Clear All
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product Grid */}
        <div className="py-10">
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {productList.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  className="product-card group"
                >
                  <Link href={`/shop/${product.id}`}>
                    <div className="relative aspect-[3/4] bg-studio-grey overflow-hidden mb-4">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {product.images[1] && (
                        <Image
                          src={product.images[1]}
                          alt={`${product.name} alt`}
                          fill
                          className="object-cover secondary-image"
                        />
                      )}

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.isNew && (
                          <span className="bg-studio-white text-label text-studio-black px-2.5 py-1">
                            New
                          </span>
                        )}
                        {product.originalPrice && (
                          <span className="bg-accent-gold text-label text-studio-black px-2.5 py-1">
                            Sale
                          </span>
                        )}
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <Link
                          href={`/studio?product=${product.id}`}
                          className="flex items-center justify-center gap-2 glass text-studio-black py-2.5 text-label w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Sparkles size={12} />
                          Try in 3D
                        </Link>
                      </div>
                    </div>

                    <div>
                      <p className="text-label text-studio-mid mb-1">
                        {product.category.toUpperCase()}
                      </p>
                      <h3 className="text-sm font-medium leading-tight mb-2 line-clamp-2">
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              className={
                                i < Math.floor(product.rating)
                                  ? 'fill-studio-black text-studio-black'
                                  : 'text-studio-mid'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-label text-studio-dark">
                          ({product.reviewCount})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">${product.price}</span>
                          {product.originalPrice && (
                            <span className="text-xs text-studio-mid line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                        {/* Color dots */}
                        <div className="flex gap-1">
                          {product.colors.slice(0, 4).map((c) => (
                            <div
                              key={c.name}
                              className="w-3 h-3 rounded-full border border-studio-grey"
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
