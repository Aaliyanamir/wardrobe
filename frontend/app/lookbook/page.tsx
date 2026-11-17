'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { lookbooks, products, getProductById } from '@/data/products';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';

export default function LookbookPage() {
  const [selectedLook, setSelectedLook] = useState<string | null>(null);
  const { loadLook, addToCart, toggleCart, setSelectedProduct, setSelectedColor } = useStore();

  const handleLoadLook = (look: (typeof lookbooks)[0]) => {
    // Load into try-on studio
    look.items.forEach((item) => {
      setSelectedProduct(item.category, item.productId);
      setSelectedColor(item.category, item.color);
    });
    toast.success(`"${look.name}" loaded in Studio`);
  };

  const handleShopLook = (look: (typeof lookbooks)[0]) => {
    look.items.forEach((item) => {
      const product = getProductById(item.productId);
      if (product) {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          size: 'M',
          color: item.color,
          image: product.images[0],
          category: product.category,
        });
      }
    });
    toast.success('Full look added to bag!');
    toggleCart();
  };

  return (
    <div className="bg-studio-white min-h-screen pt-24">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Header */}
        <div className="py-16 text-center border-b border-studio-grey mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-label text-studio-mid mb-4"
          >
            Editorial
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-display font-light"
          >
            The Lookbook
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-studio-dark mt-4 max-w-md mx-auto leading-relaxed"
          >
            Curated seasonal outfits. Load any complete look onto the 3D avatar 
            with one click and try before you buy.
          </motion.p>
        </div>

        {/* Lookbook Grid */}
        <div className="space-y-32">
          {lookbooks.map((look, index) => (
            <motion.section
              key={look.id}
              id={look.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7 }}
              className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'md:grid-flow-col-dense' : ''
              }`}
            >
              {/* Image */}
              <div
                className={`relative aspect-[4/5] overflow-hidden ${
                  index % 2 === 1 ? 'md:col-start-2' : ''
                }`}
              >
                <Image
                  src={look.image}
                  alt={look.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-studio-black/60 via-transparent to-transparent" />

                {/* Quick actions overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="flex gap-3">
                    <Link
                      href="/studio"
                      onClick={() => handleLoadLook(look)}
                      className="flex-1 glass-dark text-studio-white py-3 text-label flex items-center justify-center gap-2 hover:bg-studio-white hover:text-studio-black transition-all duration-300"
                    >
                      <Sparkles size={12} />
                      Try in Studio
                    </Link>
                    <button
                      onClick={() => handleShopLook(look)}
                      className="flex-1 bg-studio-white text-studio-black py-3 text-label flex items-center justify-center gap-2 hover:bg-accent-gold transition-all duration-300"
                    >
                      <ShoppingBag size={12} />
                      Shop Look
                    </button>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className={index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}>
                <p className="text-label text-studio-mid mb-4">{look.season}</p>
                <h2 className="text-heading font-light mb-5">{look.name}</h2>
                <p className="text-base text-studio-dark leading-relaxed mb-10">
                  {look.description}
                </p>

                {/* Outfit items */}
                <div className="space-y-3 mb-10">
                  {look.items.map((item) => {
                    const product = getProductById(item.productId);
                    if (!product) return null;
                    return (
                      <div
                        key={item.productId}
                        className="flex items-center gap-4 p-4 border border-studio-grey hover:border-studio-black transition-colors group"
                      >
                        <div className="relative w-14 h-16 bg-studio-grey flex-shrink-0 overflow-hidden">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-label text-studio-mid capitalize">{item.category}</p>
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-label text-studio-dark mt-0.5">{item.color}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium">${product.price}</span>
                          <Link
                            href={`/shop/${product.id}`}
                            className="text-label text-studio-dark group-hover:text-studio-black transition-colors"
                          >
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center border-t border-studio-grey pt-5 mb-8">
                  <span className="text-label text-studio-dark">Look Total</span>
                  <span className="text-lg font-medium">
                    $
                    {look.items
                      .reduce((sum, item) => {
                        const p = getProductById(item.productId);
                        return sum + (p?.price ?? 0);
                      }, 0)
                      .toLocaleString()}
                  </span>
                </div>

                <div className="flex gap-4">
                  <Link
                    href="/studio"
                    onClick={() => handleLoadLook(look)}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} />
                    Try Complete Look
                  </Link>
                  <button
                    onClick={() => handleShopLook(look)}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={14} />
                    Shop All
                  </button>
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="border-t border-studio-grey mt-32 py-24 text-center">
          <h2 className="text-heading font-light mb-6">Create Your Own Look</h2>
          <p className="text-sm text-studio-dark mb-10 max-w-md mx-auto leading-relaxed">
            Mix and match from our entire collection in the Virtual Try-On Studio. 
            Save your favorites and share with friends.
          </p>
          <Link
            href="/studio"
            className="btn-primary inline-flex items-center gap-3"
          >
            <Sparkles size={16} />
            Open Studio
          </Link>
        </div>
      </div>
    </div>
  );
}
