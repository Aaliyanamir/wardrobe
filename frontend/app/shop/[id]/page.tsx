'use client';

import { useState, useEffect, Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Star, Sparkles, ShoppingBag, ChevronLeft, ChevronRight, Plus, Minus, Ruler } from 'lucide-react';
import { getProductById, products, Product } from '@/data/products';
import { fetchProductById } from '@/lib/api';
import { useStore } from '@/store/useStore';
import AvatarCharacter from '@/components/3d/AvatarCharacter';
import SizeGuideModal from '@/components/ui/SizeGuideModal';
import toast from 'react-hot-toast';

// Mini 3D avatar viewer for PDP
function GarmentViewer({ color }: { color: string }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ background: '#EBE7E1' }}
    >
      <PerspectiveCamera makeDefault position={[0, 0.45, 2.85]} fov={42} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 4]} intensity={2.2} castShadow />
      <directionalLight position={[-4, 2, -2]} intensity={0.6} color="#FFE5C4" />

      <Suspense fallback={null}>
        <AvatarCharacter
          position={[0, -0.9, 0]}
          scale={1.05}
          customization={{ topColor: color, size: 'M' }}
          interactiveLookAt={true}
        />
        <ContactShadows position={[0, -0.9, 0]} opacity={0.5} scale={5} blur={1.8} />
        <Environment preset="studio" />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.8}
        minPolarAngle={Math.PI / 2.3}
        maxPolarAngle={Math.PI / 1.85}
      />
    </Canvas>
  );
}

const mockReviews = [
  {
    id: 1,
    name: 'Alex M.',
    rating: 5,
    date: 'Nov 2025',
    comment: 'Absolutely exceptional quality. The fabric weight is perfect and the fit is exactly as shown in the 3D preview.',
    verified: true,
  },
  {
    id: 2,
    name: 'Sarah K.',
    rating: 5,
    date: 'Oct 2025',
    comment: "The virtual try-on feature is incredible. I was nervous ordering online but the 3D preview showed me exactly how it would fit. Perfect as expected.",
    verified: true,
  },
  {
    id: 3,
    name: 'James T.',
    rating: 4,
    date: 'Oct 2025',
    comment: "Beautiful piece. The material quality is top-notch. Sizing runs slightly true—I'm usually a medium and ordered medium, fits perfectly.",
    verified: true,
  },
];

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const initialProduct = getProductById(params.id);
  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [selectedColor, setSelectedColor] = useState(initialProduct?.colors[0] || { name: 'Default', hex: '#000000' });
  const [selectedSize, setSelectedSize] = useState('');
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [show3D, setShow3D] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { addToCart, toggleCart } = useStore();

  useEffect(() => {
    let mounted = true;
    fetchProductById(params.id).then(({ product: liveProduct }) => {
      if (mounted && liveProduct) {
        setProduct(liveProduct);
      }
    });
    return () => {
      mounted = false;
    };
  }, [params.id]);

  if (!product) notFound();

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor.name,
      image: product.images[0],
      category: product.category,
    });
    toast.success('Added to bag');
    toggleCart();
  };

  return (
    <div className="bg-studio-white min-h-screen pt-24">
      <div className="max-w-[1440px] mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-10 text-label text-studio-mid">
          <Link href="/" className="hover:text-studio-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-studio-black transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-studio-black">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* ========== IMAGES / 3D VIEWER ========== */}
          <div>
            {/* View Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShow3D(false)}
                className={`px-4 py-2 text-label transition-all ${
                  !show3D ? 'bg-studio-black text-studio-white' : 'border border-studio-grey text-studio-dark'
                }`}
              >
                Photos
              </button>
              <button
                onClick={() => setShow3D(true)}
                className={`px-4 py-2 text-label flex items-center gap-2 transition-all ${
                  show3D ? 'bg-studio-black text-studio-white' : 'border border-studio-grey text-studio-dark'
                }`}
              >
                <Sparkles size={12} />
                3D View
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!show3D ? (
                <motion.div
                  key="photos"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Main Image */}
                  <div className="relative aspect-[3/4] bg-studio-grey overflow-hidden mb-3">
                    <Image
                      src={product.images[currentImageIdx]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />

                    {/* Nav arrows */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIdx((i) => (i - 1 + product.images.length) % product.images.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 glass p-2"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={() => setCurrentImageIdx((i) => (i + 1) % product.images.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 glass p-2"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  <div className="flex gap-2">
                    {product.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIdx(i)}
                        className={`relative w-20 aspect-square border-2 overflow-hidden transition-all ${
                          currentImageIdx === i ? 'border-studio-black' : 'border-transparent'
                        }`}
                      >
                        <Image src={img} alt="" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="3d"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="aspect-[3/4] bg-studio-grey"
                >
                  <GarmentViewer color={selectedColor.hex} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ========== PRODUCT INFO ========== */}
          <div>
            <div className="sticky top-28">
              <p className="text-label text-studio-mid mb-3">
                {product.category.toUpperCase()} — {product.brand}
              </p>
              <h1 className="text-heading font-light mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(product.rating) ? 'fill-studio-black text-studio-black' : 'text-studio-mid'}
                    />
                  ))}
                </div>
                <span className="text-sm text-studio-dark">{product.rating} ({product.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-2xl font-light">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-lg text-studio-mid line-through">${product.originalPrice}</span>
                )}
              </div>

              {/* Colors */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-label text-studio-dark">Colour — {selectedColor.name}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c)}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${
                        selectedColor.name === c.name
                          ? 'border-studio-black scale-110'
                          : 'border-transparent hover:border-studio-mid'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-label text-studio-dark">Size</p>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-label text-studio-dark hover:text-studio-black underline transition-colors flex items-center gap-1"
                  >
                    <Ruler size={12} />
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] h-11 px-3 text-sm transition-all ${
                        selectedSize === size
                          ? 'bg-studio-black text-studio-white'
                          : 'border border-studio-grey text-studio-dark hover:border-studio-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity + Add to Bag */}
              <div className="flex gap-3 mb-6">
                <div className="flex items-center border border-studio-grey">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 hover:bg-studio-grey transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-3 hover:bg-studio-grey transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={16} />
                  Add to Bag — ${product.price * quantity}
                </button>
              </div>

              {/* Try in Studio */}
              <Link
                href={`/studio?product=${product.id}`}
                className="w-full btn-secondary flex items-center justify-center gap-2 mb-10"
              >
                <Sparkles size={14} />
                Try on in 3D Studio
              </Link>

              {/* Description */}
              <div className="border-t border-studio-grey pt-8">
                <h3 className="text-label text-studio-dark mb-4">Description</h3>
                <p className="text-sm text-studio-dark leading-relaxed mb-6">
                  {product.description}
                </p>

                <h3 className="text-label text-studio-dark mb-3">Material</h3>
                <p className="text-sm text-studio-dark mb-6">{product.material}</p>

                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-label text-studio-dark border border-studio-grey px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== REVIEWS ========== */}
        <section className="mt-24 border-t border-studio-grey pt-16">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-heading font-light">Customer Reviews</h2>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className="fill-studio-black text-studio-black" />
                  ))}
                </div>
                <span className="text-sm text-studio-dark">
                  {product.rating} out of 5 · {product.reviewCount} reviews
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockReviews.map((review) => (
              <div key={review.id} className="p-6 border border-studio-grey">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < review.rating ? 'fill-studio-black text-studio-black' : 'text-studio-mid'}
                    />
                  ))}
                </div>
                <p className="text-sm text-studio-dark leading-relaxed mb-4">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-label text-studio-black">{review.name}</p>
                    {review.verified && (
                      <p className="text-label text-accent-gold mt-0.5">✓ Verified</p>
                    )}
                  </div>
                  <span className="text-label text-studio-mid">{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========== RELATED PRODUCTS ========== */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 border-t border-studio-grey pt-16">
            <h2 className="text-heading font-light mb-10">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/shop/${p.id}`} className="product-card group block">
                    <div className="relative aspect-[3/4] bg-studio-grey overflow-hidden mb-3">
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {p.images[1] && (
                        <Image
                          src={p.images[1]}
                          alt={p.name}
                          fill
                          className="object-cover secondary-image"
                        />
                      )}
                    </div>
                    <p className="text-xs font-medium leading-tight">{p.name}</p>
                    <p className="text-label text-studio-mid mt-1">${p.price}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
        {/* Interactive Size Guide & Fit Finder Modal */}
        <SizeGuideModal
          isOpen={sizeGuideOpen}
          onClose={() => setSizeGuideOpen(false)}
          onApplySize={(size) => setSelectedSize(size)}
          currentCategory={product.category}
          activeSize={selectedSize}
        />
      </div>
    </div>
  );
}
