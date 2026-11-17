'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sun,
  Sunrise,
  Moon,
  Camera,
  User,
  BookMarked,
  Heart,
  ZoomIn,
  Ruler,
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import CharacterModel from '@/components/3d/CharacterModel';
import SizeGuideModal from '@/components/ui/SizeGuideModal';
import { saveLookApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import {
  products,
  categories,
  getProductsByCategory,
} from '@/data/products';

// Lighting icons
const lightingOptions = [
  { id: 'daylight', label: 'Studio', icon: Sun },
  { id: 'warm', label: 'Editorial', icon: Sunrise },
  { id: 'evening', label: 'Runway', icon: Moon },
] as const;

// Camera presets
const cameraPresets = [
  { id: 'full', label: 'Full Body' },
  { id: 'upper', label: 'Upper Body' },
  { id: 'closeup', label: 'Close-up' },
] as const;

function SmoothCameraRig({ preset }: { preset: 'full' | 'upper' | 'closeup' }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 1, 4.5));

  useEffect(() => {
    if (preset === 'full') {
      targetPos.current.set(0, 1, 4.5);
    } else if (preset === 'upper') {
      targetPos.current.set(0, 1.6, 2.6);
    } else if (preset === 'closeup') {
      targetPos.current.set(0.18, 1.85, 1.35);
    }
  }, [preset]);

  useFrame((_, delta) => {
    const s = Math.min(delta * 4.5, 0.25);
    camera.position.lerp(targetPos.current, s);
  });

  return null;
}

function StudioCanvas() {
  const { lightingPreset, cameraPreset } = useStore();

  const bgColor = {
    daylight: '#F5F5F7',
    warm: '#F5EFE0',
    evening: '#12121E',
  }[lightingPreset];

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ background: bgColor, transition: 'background 1s ease' }}
    >
      <PerspectiveCamera makeDefault position={[0, 1, 4.5]} fov={45} />
      <SmoothCameraRig preset={cameraPreset} />

      <Suspense fallback={null}>
        {lightingPreset === 'daylight' && (
          <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={2.5} castShadow shadow-mapSize={[2048, 2048]} />
            <directionalLight position={[-5, 5, -3]} intensity={0.8} color="#E8F0FF" />
            <Environment preset="studio" />
          </>
        )}
        {lightingPreset === 'warm' && (
          <>
            <ambientLight intensity={0.4} color="#FFE8D0" />
            <directionalLight position={[3, 8, 2]} intensity={3} color="#FFD4A0" castShadow shadow-mapSize={[2048, 2048]} />
            <directionalLight position={[-4, 4, -2]} intensity={0.6} color="#C0A080" />
            <Environment preset="sunset" />
          </>
        )}
        {lightingPreset === 'evening' && (
          <>
            <ambientLight intensity={0.15} color="#101020" />
            <spotLight position={[0, 10, 0]} angle={0.3} penumbra={0.5} intensity={5} castShadow />
            <spotLight position={[-4, 6, 2]} angle={0.4} penumbra={0.6} intensity={2} color="#8080FF" />
            <spotLight position={[4, 6, 2]} angle={0.4} penumbra={0.6} intensity={2} color="#FF8060" />
            <Environment preset="night" />
          </>
        )}

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color={lightingPreset === 'evening' ? '#12121E' : '#F5F5F7'} roughness={0.9} />
        </mesh>

        <CharacterModel />

        <ContactShadows
          position={[0, -2, 0]}
          opacity={lightingPreset === 'evening' ? 0.6 : 0.35}
          scale={8}
          blur={2.5}
          color={lightingPreset === 'evening' ? '#000020' : '#111111'}
        />
      </Suspense>

      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.8}
        minDistance={1.5}
        maxDistance={7}
        makeDefault
      />
    </Canvas>
  );
}

export default function StudioPage() {
  const {
    selectedCategory,
    selectedProducts,
    selectedColors,
    selectedSizes,
    lightingPreset,
    cameraPreset,
    setSelectedCategory,
    setSelectedProduct,
    setSelectedColor,
    setSelectedSize,
    setLightingPreset,
    setCameraPreset,
    addToCart,
    toggleCart,
    savedLooks,
    saveLook,
    loadLook,
  } = useStore();

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [lookName, setLookName] = useState('');
  const [savedLoooksOpen, setSavedLooksOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const categoryProducts = getProductsByCategory(selectedCategory);
  const currentProductId = selectedProducts[selectedCategory];
  const currentProduct = products.find((p) => p.id === currentProductId) || categoryProducts[0];
  const currentColor = selectedColors[selectedCategory] || (currentProduct?.colors[0]?.name ?? '');
  const currentSize = selectedSizes[selectedCategory] || (currentProduct?.sizes.includes('M') ? 'M' : currentProduct?.sizes[0] || 'M');

  // Auto-select first product per category and default size
  useEffect(() => {
    if (!currentProductId && categoryProducts.length > 0) {
      setSelectedProduct(selectedCategory, categoryProducts[0].id);
      setSelectedColor(selectedCategory, categoryProducts[0].colors[0].name);
    }
    if (!selectedSizes[selectedCategory] && currentProduct) {
      const defaultSize = currentProduct.sizes.includes('M') ? 'M' : currentProduct.sizes[0] || 'M';
      setSelectedSize(selectedCategory, defaultSize);
    }
  }, [selectedCategory, currentProductId, categoryProducts, currentProduct, selectedSizes, setSelectedProduct, setSelectedColor, setSelectedSize]);

  const navigateProduct = (dir: number) => {
    const idx = categoryProducts.findIndex((p) => p.id === currentProduct?.id);
    const next = categoryProducts[(idx + dir + categoryProducts.length) % categoryProducts.length];
    setSelectedProduct(selectedCategory, next.id);
    setSelectedColor(selectedCategory, next.colors[0].name);
  };

  const handleAddToCart = () => {
    if (!currentProduct) return;
    if (!currentSize) {
      toast.error('Please select a size');
      return;
    }
    addToCart({
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      size: currentSize,
      color: currentColor,
      image: currentProduct.images[0],
      category: currentProduct.category,
    });
    toast.success('Added to bag');
    toggleCart();
  };

  return (
    <div className="fixed inset-0 flex bg-studio-white overflow-hidden">
      {/* ========== LEFT PANEL: GARMENT SELECTOR ========== */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 30 }}
        className="w-72 flex-shrink-0 bg-studio-white border-r border-studio-grey flex flex-col z-10 overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-studio-grey pt-24">
          <p className="text-label text-studio-mid mb-1">Virtual Try-On Studio</p>
          <h1 className="text-lg font-medium">Build Your Look</h1>
        </div>

        {/* Category Tabs */}
        <div className="p-4 border-b border-studio-grey">
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-2.5 px-3 text-label transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'bg-studio-black text-studio-white'
                    : 'border border-studio-grey text-studio-dark hover:border-studio-black'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Navigator */}
        <div className="p-4 border-b border-studio-grey">
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => navigateProduct(-1)}
              className="p-2 border border-studio-grey hover:border-studio-black transition-colors flex-shrink-0"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex-1 relative h-28 bg-studio-grey overflow-hidden">
              {currentProduct && (
                <Image
                  src={currentProduct.images[0]}
                  alt={currentProduct.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            <button
              onClick={() => navigateProduct(1)}
              className="p-2 border border-studio-grey hover:border-studio-black transition-colors flex-shrink-0"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {currentProduct && (
            <div className="mt-3">
              <p className="text-xs font-medium leading-tight">{currentProduct.name}</p>
              <p className="text-label text-studio-mid mt-1">
                ${currentProduct.price}
              </p>
            </div>
          )}

          {/* Product dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {categoryProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProduct(selectedCategory, p.id);
                  setSelectedColor(selectedCategory, p.colors[0].name);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  p.id === currentProduct?.id ? 'bg-studio-black w-4' : 'bg-studio-mid'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Color Swatches */}
        {currentProduct && (
          <div className="p-4 border-b border-studio-grey">
            <p className="text-label text-studio-mid mb-3">Color — {currentColor}</p>
            <div className="flex flex-wrap gap-2">
              {currentProduct.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(selectedCategory, c.name)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    currentColor === c.name
                      ? 'border-studio-black scale-110'
                      : 'border-transparent hover:border-studio-mid'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Size Selector */}
        {currentProduct && (
          <div className="p-4 border-b border-studio-grey">
            <div className="flex justify-between items-center mb-3">
              <p className="text-label text-studio-mid">Size</p>
              <button
                onClick={() => setSizeGuideOpen(true)}
                className="text-label text-studio-dark hover:text-studio-black transition-colors flex items-center gap-1 underline"
              >
                <Ruler size={11} />
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentProduct.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(selectedCategory, size)}
                  className={`min-w-[2.5rem] h-9 px-2 text-label transition-all ${
                    currentSize === size
                      ? 'bg-studio-black text-studio-white'
                      : 'border border-studio-grey text-studio-dark hover:border-studio-black'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to Bag */}
        <div className="p-4 space-y-3 mt-auto">
          <button
            onClick={handleAddToCart}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} />
            Add to Bag
          </button>
          <button
            onClick={() => setSaveModalOpen(true)}
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            <Heart size={14} />
            Save Look
          </button>
        </div>
      </motion.div>

      {/* ========== CENTER: 3D CANVAS ========== */}
      <div className="flex-1 relative">
        <StudioCanvas />

        {/* Camera Preset HUD */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {cameraPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setCameraPreset(preset.id)}
              className={`glass px-4 py-2 text-label transition-all duration-200 ${
                cameraPreset === preset.id
                  ? 'bg-studio-black text-studio-white border-transparent'
                  : 'text-studio-dark hover:text-studio-black'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Lighting Switcher HUD */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {lightingOptions.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setLightingPreset(id)}
              className={`glass flex items-center gap-2 px-4 py-2.5 text-label transition-all duration-300 ${
                lightingPreset === id
                  ? 'bg-studio-black text-studio-white'
                  : 'text-studio-dark hover:text-studio-black'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Rotation hint */}
        <div className="absolute bottom-8 right-6 text-label text-studio-mid flex items-center gap-2 z-10">
          <Camera size={12} />
          Drag to rotate
        </div>
      </div>

      {/* ========== RIGHT PANEL: OUTFIT SUMMARY ========== */}
      <motion.div
        initial={{ x: 320 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 30 }}
        className="w-72 flex-shrink-0 bg-studio-white border-l border-studio-grey flex flex-col z-10 overflow-y-auto"
      >
        <div className="p-6 border-b border-studio-grey pt-24">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium">Your Look</h2>
            <button
              onClick={() => setSavedLooksOpen(!savedLoooksOpen)}
              className="text-label text-studio-dark hover:text-studio-black transition-colors flex items-center gap-1"
            >
              <BookMarked size={12} />
              Saved ({savedLooks.length})
            </button>
          </div>
        </div>

        {/* Saved Looks */}
        <AnimatePresence>
          {savedLoooksOpen && savedLooks.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-studio-grey overflow-hidden"
            >
              {savedLooks.map((look) => (
                <div
                  key={look.id}
                  className="flex items-center justify-between p-4 hover:bg-studio-grey transition-colors"
                >
                  <span className="text-xs font-medium">{look.name}</span>
                  <button
                    onClick={() => loadLook(look)}
                    className="text-label text-studio-dark hover:text-studio-black"
                  >
                    Load
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Outfit Items */}
        <div className="flex-1 p-4 space-y-3">
          {Object.entries(selectedProducts).map(([category, productId]) => {
            const product = products.find((p) => p.id === productId);
            if (!product) return null;
            const color = selectedColors[category] || product.colors[0]?.name;
            const size = selectedSizes[category];

            return (
              <div key={category} className="flex gap-3 p-3 border border-studio-grey">
                <div className="relative w-14 h-16 bg-studio-grey flex-shrink-0 overflow-hidden">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-label text-studio-mid capitalize">{category}</p>
                  <p className="text-xs font-medium leading-tight mt-0.5 truncate">
                    {product.name}
                  </p>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {color && (
                      <span className="text-label text-studio-dark">{color}</span>
                    )}
                    {size && (
                      <span className="text-label text-studio-dark">/ {size}</span>
                    )}
                  </div>
                </div>
                <div className="text-xs font-medium self-start">${product.price}</div>
              </div>
            );
          })}

          {Object.keys(selectedProducts).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User size={32} strokeWidth={1} className="text-studio-mid mb-3" />
              <p className="text-sm text-studio-dark">
                Select garments from the left panel to build your look
              </p>
            </div>
          )}
        </div>

        {/* Total */}
        {Object.keys(selectedProducts).length > 0 && (
          <div className="border-t border-studio-grey p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-label text-studio-dark">Look Total</span>
              <span className="text-sm font-medium">
                $
                {Object.entries(selectedProducts)
                  .reduce((sum, [, pid]) => {
                    const p = products.find((pr) => pr.id === pid);
                    return sum + (p?.price ?? 0);
                  }, 0)
                  .toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => {
                Object.entries(selectedProducts).forEach(([category, productId]) => {
                  const product = products.find((p) => p.id === productId);
                  const size = selectedSizes[category];
                  const color = selectedColors[category] || product?.colors[0]?.name || '';
                  if (product && size) {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      size,
                      color,
                      image: product.images[0],
                      category: product.category,
                    });
                  }
                });
                toast.success('Full look added to bag!');
                toggleCart();
              }}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <ShoppingBag size={14} />
              Add Full Look to Bag
            </button>
          </div>
        )}
      </motion.div>

      {/* ========== SAVE LOOK MODAL ========== */}
      <AnimatePresence>
        {saveModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-studio-black/40 backdrop-blur-sm"
            onClick={() => setSaveModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-studio-white p-8 w-full max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-heading font-light mb-6">Save This Look</h3>
              <input
                type="text"
                value={lookName}
                onChange={(e) => setLookName(e.target.value)}
                placeholder="Name your look…"
                className="w-full border-b border-studio-black bg-transparent py-3 text-sm outline-none placeholder:text-studio-mid mb-6"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (lookName.trim()) {
                      saveLook(lookName.trim());
                      saveLookApi({
                        name: lookName.trim(),
                        items: Object.entries(selectedProducts).map(([cat, pid]) => ({
                          category: cat,
                          productId: pid,
                          color: selectedColors[cat] || '',
                        })),
                        lightingPreset,
                      });
                      setLookName('');
                      setSaveModalOpen(false);
                      toast.success('Look saved to collection & API!');
                    }
                  }}
                  className="flex-1 btn-primary"
                >
                  Save
                </button>
                <button
                  onClick={() => setSaveModalOpen(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Size Guide & Fit Finder Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        onApplySize={(size) => setSelectedSize(selectedCategory, size)}
        currentCategory={selectedCategory}
        activeSize={currentSize}
      />
    </div>
  );
}
