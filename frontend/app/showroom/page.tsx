'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Eye,
  RotateCcw,
  Maximize2,
  X,
  ChevronRight,
  Compass,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import { products, Product } from '@/data/products';
import ShowroomScene, {
  SHOWROOM_LOOKS,
  ShowroomPedestalData,
  calculateLookTotal,
} from '@/components/3d/ShowroomScene';

// Camera positions and targets for cinematic views
interface CameraPreset {
  id: string;
  label: string;
  shortLabel: string;
  position: [number, number, number];
  target: [number, number, number];
}

const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'overview',
    label: 'Showroom Overview',
    shortLabel: 'Overview',
    position: [0, 2.5, 6.2],
    target: [0, 1.2, -2.5],
  },
  {
    id: 'look-001',
    label: 'Look 1: The Clean Studio',
    shortLabel: 'Look 1',
    position: [-3.8, 1.6, 0.6],
    target: [-4.8, 1.3, -2.2],
  },
  {
    id: 'look-002',
    label: 'Look 2: Urban Utility',
    shortLabel: 'Look 2',
    position: [-1.2, 1.6, -0.4],
    target: [-1.6, 1.3, -3.2],
  },
  {
    id: 'look-003',
    label: 'Look 3: The Evening Edit',
    shortLabel: 'Look 3',
    position: [1.2, 1.6, -0.4],
    target: [1.6, 1.3, -3.2],
  },
  {
    id: 'look-004',
    label: 'Look 4: Soft Volume',
    shortLabel: 'Look 4',
    position: [3.8, 1.6, 0.6],
    target: [4.8, 1.3, -2.2],
  },
];

/**
 * Animated Camera Controller using smooth Lerp
 */
function ShowroomCameraRig({
  activePresetId,
  controlsRef,
}: {
  activePresetId: string;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const targetCamPos = useRef(new THREE.Vector3(0, 2.5, 6.2));
  const targetLookAt = useRef(new THREE.Vector3(0, 1.2, -2.5));

  useEffect(() => {
    const preset =
      CAMERA_PRESETS.find((p) => p.id === activePresetId) || CAMERA_PRESETS[0];
    targetCamPos.current.set(...preset.position);
    targetLookAt.current.set(...preset.target);
  }, [activePresetId]);

  useFrame((_, delta) => {
    const speed = Math.min(delta * 4.0, 0.2);
    camera.position.lerp(targetCamPos.current, speed);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, speed);
      controlsRef.current.update();
    }
  });

  return null;
}

/**
 * Luxury Minimalist Progressive Loading Screen
 */
function ShowroomLoader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F3F0EB] z-30">
      <div className="relative w-16 h-16 flex items-center justify-center mb-6">
        <div className="absolute inset-0 border border-studio-black/20 rounded-full animate-ping opacity-40" />
        <div className="w-10 h-10 border-2 border-studio-black border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-[11px] tracking-[0.28em] uppercase text-studio-black font-medium">
        Opening Architectural Showroom
      </p>
      <span className="text-[10px] text-studio-mid mt-2">
        Curating SS/FW Virtual Haute Couture
      </span>
    </div>
  );
}

export default function ShowroomPage() {
  const router = useRouter();
  const {
    setSelectedProduct,
    setSelectedColor,
    setSelectedSize,
    setIsSwapping,
    addToCart,
    toggleCart,
  } = useStore();

  const [activePresetId, setActivePresetId] = useState<string>('overview');
  const [selectedLook, setSelectedLook] = useState<ShowroomPedestalData | null>(null);
  const controlsRef = useRef<any>(null);

  // Pedestal selection handler
  const handleSelectPedestal = (look: ShowroomPedestalData) => {
    setSelectedLook(look);
    setActivePresetId(look.id);
  };

  // Close inspector drawer & return camera to overview
  const handleCloseInspector = () => {
    setSelectedLook(null);
    setActivePresetId('overview');
  };

  // "Try This Look in 3D" handler:
  // Loads all look items into Zustand store, triggers swap reaction, and routes to /studio
  const handleTryInStudio = (look: ShowroomPedestalData) => {
    look.items.forEach((item) => {
      setSelectedProduct(item.category, item.productId);
      setSelectedColor(item.category, item.color);
      setSelectedSize(item.category, 'M');
    });

    setIsSwapping(true);
    toast.success(`Wearing "${look.name}" in Fitting Room`);
    router.push('/studio');
  };

  // "Add Entire Look to Bag" handler
  const handleAddLookToCart = (look: ShowroomPedestalData) => {
    look.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
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

    toast.success(`All 3 pieces of "${look.name}" added to bag!`);
    toggleCart();
  };

  const selectedLookTotal = selectedLook ? calculateLookTotal(selectedLook.items) : 0;

  return (
    <div className="fixed inset-0 bg-[#EFECE7] overflow-hidden select-none">
      {/* ======================================================== */}
      {/* 1. TOP MINIMALIST NAVIGATION HEADER                      */}
      {/* ======================================================== */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-6 pointer-events-none">
        {/* Brand & Breadcrumbs */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <Link
            href="/"
            className="flex items-center gap-2 group glass px-4 py-2 border border-studio-black/10 hover:border-studio-black transition-colors"
          >
            <div className="w-2.5 h-2.5 bg-studio-black" />
            <span className="text-xs tracking-[0.2em] uppercase font-medium">
              Wardrobe
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-label text-studio-mid">
            <span>/</span>
            <span className="text-studio-black font-medium">3D Boutique Showroom</span>
          </div>
        </div>

        {/* Quick studio link & Cart button */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <Link
            href="/studio"
            className="glass px-4 py-2 text-label text-studio-black hover:bg-studio-black hover:text-studio-white transition-all flex items-center gap-2"
          >
            <Sparkles size={13} />
            Virtual Fitting Room
          </Link>
          <button
            onClick={toggleCart}
            className="glass p-2.5 hover:bg-studio-black hover:text-studio-white transition-all"
            aria-label="View Cart"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. R3F THREE.JS 3D SHOWROOM CANVAS                       */}
      {/* ======================================================== */}
      <div className="w-full h-full">
        <Suspense fallback={<ShowroomLoader />}>
          <Canvas
            shadows
            dpr={[1, 1.35]}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.15,
            }}
            style={{ display: 'block', width: '100%', height: '100%', background: '#ECE8E1' }}
            onClick={() => {
              if (selectedLook) {
                // Clicking on empty floor dismisses close-up
                handleCloseInspector();
              }
            }}
          >
            <PerspectiveCamera makeDefault position={[0, 2.5, 6.2]} fov={42} />

            <ShowroomCameraRig
              activePresetId={activePresetId}
              controlsRef={controlsRef}
            />

            <ShowroomScene
              selectedLookId={selectedLook?.id || null}
              onSelectLook={handleSelectPedestal}
            />

            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              minDistance={1.8}
              maxDistance={9.5}
              minPolarAngle={Math.PI / 12}
              maxPolarAngle={Math.PI / 2.05}
              dampingFactor={0.06}
              enableDamping
              makeDefault
            />
          </Canvas>
        </Suspense>
      </div>

      {/* ======================================================== */}
      {/* 3. CAMERA VIEW SWITCHER HUD (DOCK AT BOTTOM-CENTER)      */}
      {/* ======================================================== */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 glass p-1.5 sm:p-2 border border-studio-black/10 shadow-xl backdrop-blur-md max-w-[94vw] overflow-x-auto">
        <div className="hidden sm:flex items-center gap-1.5 pl-2 pr-1 text-label text-studio-mid">
          <Compass size={13} />
          <span>Views:</span>
        </div>

        {CAMERA_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => {
              setActivePresetId(preset.id);
              if (preset.id === 'overview') {
                setSelectedLook(null);
              } else {
                const look = SHOWROOM_LOOKS.find((l) => l.id === preset.id);
                if (look) setSelectedLook(look);
              }
            }}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-label whitespace-nowrap transition-all duration-300 ${
              activePresetId === preset.id
                ? 'bg-studio-black text-studio-white shadow-md'
                : 'text-studio-dark hover:text-studio-black hover:bg-studio-black/5'
            }`}
          >
            <span className="hidden md:inline">{preset.label}</span>
            <span className="md:hidden">{preset.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* 4. "TRY THIS LOOK IN 3D" ACTION CARD / INSPECTION DRAWER */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedLook && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute top-24 right-6 w-full max-w-sm sm:max-w-md z-30 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-studio-white/95 backdrop-blur-xl border border-studio-black/10 p-6 shadow-2xl">
              {/* Card Header */}
              <div className="flex items-start justify-between pb-4 border-b border-studio-grey">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] tracking-widest uppercase bg-studio-black text-studio-white px-2 py-0.5 font-medium">
                      {selectedLook.season}
                    </span>
                    <span className="text-label text-studio-mid">
                      3-Piece Complete Ensemble
                    </span>
                  </div>
                  <h2 className="text-lg font-medium tracking-tight text-studio-black">
                    {selectedLook.name}
                  </h2>
                </div>
                <button
                  onClick={handleCloseInspector}
                  className="p-1.5 text-studio-mid hover:text-studio-black transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-studio-dark my-4 leading-relaxed">
                {selectedLook.description}
              </p>

              {/* Outfit Item Breakdown */}
              <div className="space-y-2.5 my-4">
                <p className="text-[11px] uppercase tracking-wider text-studio-mid font-medium">
                  Curated Pieces:
                </p>
                {selectedLook.items.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3 p-2 bg-studio-grey/50 border border-studio-grey/70"
                    >
                      <div className="relative w-12 h-14 bg-studio-grey flex-shrink-0 overflow-hidden">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-studio-mid uppercase">
                          {item.category}
                        </p>
                        <p className="text-xs font-medium text-studio-black truncate">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-studio-dark">
                          {item.color}
                        </p>
                      </div>
                      <div className="text-xs font-mono font-medium text-studio-black">
                        ${product.price}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Combined Look Price */}
              <div className="flex items-center justify-between py-3 border-t border-studio-grey">
                <span className="text-label text-studio-dark">Total Ensemble:</span>
                <span className="text-base font-semibold font-mono text-studio-black">
                  ${selectedLookTotal.toLocaleString()}
                </span>
              </div>

              {/* One-Click Action CTAs */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => handleTryInStudio(selectedLook)}
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 group shadow-lg"
                >
                  <Sparkles size={16} />
                  <span>Inspect in Virtual Fitting Room</span>
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>

                <button
                  onClick={() => handleAddLookToCart(selectedLook)}
                  className="w-full btn-secondary py-3 flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={14} />
                  <span>Add Full Look to Bag (${selectedLookTotal})</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orbit hint at bottom right */}
      <div className="absolute bottom-8 right-6 hidden md:flex items-center gap-2 text-label text-studio-mid pointer-events-none">
        <RotateCcw size={12} />
        <span>Drag to rotate 360°</span>
      </div>
    </div>
  );
}
