'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/store/useStore';

export default function CartDrawer() {
  const { isCartOpen, setCartOpen, cartItems, removeFromCart, updateQuantity, cartTotal } = useStore();
  const total = cartTotal();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-50 bg-studio-black/30 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[420px] bg-studio-white flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-studio-grey">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} strokeWidth={1.5} />
                <span className="text-label text-studio-black">
                  Shopping Bag ({cartItems.length})
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 -mr-2 hover:opacity-60 transition-opacity"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
                  <ShoppingBag size={48} strokeWidth={1} className="text-studio-mid" />
                  <div className="text-center">
                    <p className="text-heading font-light">Your bag is empty</p>
                    <p className="text-sm text-studio-dark mt-2">
                      Add items to get started
                    </p>
                  </div>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="btn-secondary text-xs"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-studio-grey">
                  <AnimatePresence>
                    {cartItems.map((item) => (
                      <motion.div
                        key={`${item.id}-${item.size}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        className="flex gap-4 p-6"
                      >
                        {/* Image */}
                        <div className="relative w-20 h-24 flex-shrink-0 bg-studio-grey overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs font-medium tracking-wide text-studio-mid uppercase">
                                  {item.category}
                                </p>
                                <p className="text-sm font-medium mt-0.5 leading-tight">
                                  {item.name}
                                </p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id, item.size)}
                                className="p-1 hover:opacity-60 transition-opacity -mt-1"
                              >
                                <X size={14} strokeWidth={1.5} />
                              </button>
                            </div>
                            <div className="flex gap-3 mt-2">
                              <span className="text-label text-studio-dark">
                                Size {item.size}
                              </span>
                              <span className="text-label text-studio-dark">
                                {item.color}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Qty */}
                            <div className="flex items-center gap-3 border border-studio-grey">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.size, item.quantity - 1)
                                }
                                className="p-2 hover:bg-studio-grey transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-sm w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.size, item.quantity + 1)
                                }
                                className="p-2 hover:bg-studio-grey transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            {/* Price */}
                            <span className="text-sm font-medium">
                              ${(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-studio-grey px-6 py-6">
                {/* Promo code */}
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    placeholder="Promo code"
                    className="flex-1 border border-studio-grey bg-transparent px-4 py-3 text-sm outline-none focus:border-studio-black transition-colors placeholder:text-studio-mid"
                  />
                  <button className="px-5 py-3 border border-studio-black text-xs font-medium tracking-widest uppercase hover:bg-studio-black hover:text-studio-white transition-all duration-300">
                    Apply
                  </button>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-label text-studio-dark">Subtotal</span>
                  <span className="text-sm font-medium">${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-label text-studio-dark">Shipping</span>
                  <span className="text-sm text-studio-dark">
                    {total > 300 ? 'Free' : 'Calculated at checkout'}
                  </span>
                </div>

                {/* CTA */}
                <Link
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="flex items-center justify-between w-full btn-primary group"
                >
                  <span>Checkout</span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>

                <button
                  onClick={() => setCartOpen(false)}
                  className="w-full text-center text-label text-studio-dark mt-4 hover:text-studio-black transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
