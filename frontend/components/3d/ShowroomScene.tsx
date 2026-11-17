'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, MeshReflectorMaterial, ContactShadows, Html } from '@react-three/drei';
import { lookbooks, products, Product } from '@/data/products';
import { getFabricPBRMaterial, FabricType } from './FabricTextures';
import AvatarCharacter from './AvatarCharacter';

export interface ShowroomPedestalData {
  id: string;
  name: string;
  season: string;
  description: string;
  position: [number, number, number];
  rotationY?: number;
  items: { category: string; productId: string; color: string }[];
  primaryColor: string;
  secondaryColor: string;
  fabricType: FabricType;
}

// 4 Curated Showcase Looks corresponding to lookbooks data
export const SHOWROOM_LOOKS: ShowroomPedestalData[] = [
  {
    id: 'look-001',
    name: 'The Clean Studio',
    season: 'SS 2025',
    description: 'Effortless minimalism with Egyptian poplin and Italian double-faced wool.',
    position: [-4.8, 0, -2.2],
    rotationY: 0.25,
    items: [
      { category: 'tops', productId: 'top-001', color: 'Chalk White' },
      { category: 'pants', productId: 'pants-001', color: 'Raw Indigo' },
      { category: 'jackets', productId: 'jacket-001', color: 'Camel' },
    ],
    primaryColor: '#C19A6B',    // Camel wool blazer
    secondaryColor: '#F5F5F0',  // Chalk white poplin
    fabricType: 'wool',
  },
  {
    id: 'look-002',
    name: 'Urban Utility',
    season: 'FW 2025',
    description: 'Technical precision meets 480gsm Supima French terry warmth.',
    position: [-1.6, 0, -3.2],
    rotationY: 0.08,
    items: [
      { category: 'hoodies', productId: 'hoodie-001', color: 'Midnight' },
      { category: 'pants', productId: 'pants-003', color: 'Carbon' },
      { category: 'jackets', productId: 'jacket-002', color: 'Graphite' },
    ],
    primaryColor: '#1A1A2E',    // Midnight french terry
    secondaryColor: '#4A4A4A',  // Graphite shell
    fabricType: 'wool',
  },
  {
    id: 'look-003',
    name: 'The Evening Edit',
    season: 'FW 2025',
    description: 'Full-grain Italian calfskin moto jacket paired with superfine Merino wool.',
    position: [1.6, 0, -3.2],
    rotationY: -0.08,
    items: [
      { category: 'tops', productId: 'top-002', color: 'Charcoal' },
      { category: 'pants', productId: 'pants-002', color: 'Black' },
      { category: 'jackets', productId: 'jacket-003', color: 'Black' },
    ],
    primaryColor: '#151515',    // Black Italian calfskin leather
    secondaryColor: '#3C3C3C',  // Charcoal merino wool
    fabricType: 'leather',
  },
  {
    id: 'look-004',
    name: 'Soft Volume',
    season: 'SS 2025',
    description: 'Relaxed proportions in Belgian linen and double-brushed cotton fleece.',
    position: [4.8, 0, -2.2],
    rotationY: -0.25,
    items: [
      { category: 'tops', productId: 'top-003', color: 'Natural' },
      { category: 'pants', productId: 'pants-002', color: 'Chalk' },
      { category: 'hoodies', productId: 'hoodie-002', color: 'Cream' },
    ],
    primaryColor: '#EDEBE3',    // Cream fleece
    secondaryColor: '#D4C5A9',  // Natural linen
    fabricType: 'cotton',
  },
];

export function calculateLookTotal(items: { category: string; productId: string }[]): number {
  return items.reduce((sum, item) => {
    const prod = products.find((p) => p.id === item.productId);
    return sum + (prod?.price ?? 0);
  }, 0);
}

/**
 * 3D Floating Tailored Garment Mannequin
 */
function MannequinBust({
  look,
  isHovered,
  isSelected,
}: {
  look: ShowroomPedestalData;
  isHovered: boolean;
  isSelected: boolean;
}) {
  const outerMat = useMemo(() => {
    return getFabricPBRMaterial(look.fabricType, look.primaryColor);
  }, [look.fabricType, look.primaryColor]);

  const innerMat = useMemo(() => {
    return getFabricPBRMaterial('cotton', look.secondaryColor);
  }, [look.secondaryColor]);

  const woodMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3A322C'),
      roughness: 0.6,
      metalness: 0.05,
    });
  }, []);

  const chromeMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E5E5E5'),
      roughness: 0.2,
      metalness: 0.85,
    });
  }, []);

  return (
    <group position={[0, 1.25, 0]}>
      {/* Central chrome display stem */}
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 1.3, 16]} />
        <primitive object={chromeMat} attach="material" />
      </mesh>

      {/* Tailored Mannequin Torso with Outer Garment */}
      <group>
        {/* Main Torso */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.26, 0.72, 24]} />
          <primitive object={outerMat} attach="material" />
        </mesh>

        {/* Inner Shirt Layer Peeking at Chest & Collar */}
        <mesh position={[0, 0.32, 0.04]} castShadow>
          <cylinderGeometry args={[0.13, 0.16, 0.16, 20]} />
          <primitive object={innerMat} attach="material" />
        </mesh>

        {/* Neck Cap (Turned Ash Wood) */}
        <mesh position={[0, 0.44, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.09, 0.08, 20]} />
          <primitive object={woodMat} attach="material" />
        </mesh>

        {/* Tailored Shoulder Contours */}
        <mesh position={[0.32, 0.3, 0]} rotation={[0, 0, -0.4]} castShadow>
          <cylinderGeometry args={[0.065, 0.06, 0.24, 16]} />
          <primitive object={outerMat} attach="material" />
        </mesh>
        <mesh position={[-0.32, 0.3, 0]} rotation={[0, 0, 0.4]} castShadow>
          <cylinderGeometry args={[0.065, 0.06, 0.24, 16]} />
          <primitive object={outerMat} attach="material" />
        </mesh>

        {/* Garment Details specific to looks */}
        {look.id === 'look-001' && (
          // Blazer Lapels
          <>
            <mesh position={[0.08, 0.22, 0.18]} rotation={[0.2, 0.15, 0.12]} castShadow>
              <boxGeometry args={[0.1, 0.28, 0.02]} />
              <primitive object={outerMat} attach="material" />
            </mesh>
            <mesh position={[-0.08, 0.22, 0.18]} rotation={[0.2, -0.15, -0.12]} castShadow>
              <boxGeometry args={[0.1, 0.28, 0.02]} />
              <primitive object={outerMat} attach="material" />
            </mesh>
          </>
        )}

        {look.id === 'look-002' && (
          // Hoodie Pocket & Hood
          <>
            <mesh position={[0, -0.12, 0.18]} castShadow>
              <boxGeometry args={[0.26, 0.14, 0.03]} />
              <primitive object={outerMat} attach="material" />
            </mesh>
            <mesh position={[0, 0.36, -0.1]} rotation={[0.3, 0, 0]} castShadow>
              <sphereGeometry args={[0.17, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
              <primitive object={outerMat} attach="material" />
            </mesh>
          </>
        )}

        {look.id === 'look-003' && (
          // Leather Moto Silver Zipper & Asymmetric Collar
          <>
            <mesh position={[0.03, 0.05, 0.18]} rotation={[0, 0, 0.08]}>
              <boxGeometry args={[0.01, 0.6, 0.015]} />
              <primitive object={chromeMat} attach="material" />
            </mesh>
            <mesh position={[0.09, 0.24, 0.18]} rotation={[0.25, 0.2, 0.15]} castShadow>
              <boxGeometry args={[0.09, 0.2, 0.02]} />
              <primitive object={outerMat} attach="material" />
            </mesh>
          </>
        )}

        {look.id === 'look-004' && (
          // Clean Linen Collar & Minimal Zip Placket
          <mesh position={[0, 0.02, 0.17]}>
            <boxGeometry args={[0.015, 0.58, 0.015]} />
            <meshStandardMaterial color="#D0D0D0" roughness={0.3} metalness={0.6} />
          </mesh>
        )}
      </group>

      {/* Floating Garment Lower Drape (Trousers/Denim drape hint) */}
      <mesh position={[0, -0.38, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.28, 0.24, 24]} />
        <meshStandardMaterial
          color={look.id === 'look-001' ? '#25355E' : look.id === 'look-004' ? '#E8E0D5' : '#1A1A1A'}
          roughness={0.9}
        />
      </mesh>
    </group>
  );
}

/**
 * Interactive Illuminated Pedestal Component
 */
export function DisplayPedestal({
  look,
  isSelected,
  onSelect,
}: {
  look: ShowroomPedestalData;
  isSelected: boolean;
  onSelect: (look: ShowroomPedestalData) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const rotatingGroupRef = useRef<THREE.Group>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);

  const totalPrice = calculateLookTotal(look.items);

  // Subtle continuous slow rotation for display
  useFrame((_, delta) => {
    if (rotatingGroupRef.current) {
      const speed = hovered ? 0.35 : 0.15;
      rotatingGroupRef.current.rotation.y += delta * speed;
    }
    if (spotlightRef.current) {
      const targetIntensity = isSelected ? 4.5 : hovered ? 3.5 : 2.0;
      spotlightRef.current.intensity = THREE.MathUtils.lerp(
        spotlightRef.current.intensity,
        targetIntensity,
        delta * 5
      );
    }
  });

  return (
    <group position={look.position} rotation={[0, look.rotationY || 0, 0]}>
      {/* Focused Overhead Spotlight */}
      <spotLight
        ref={spotlightRef}
        position={[0, 5.2, 0]}
        target-position={[0, 1.2, 0]}
        angle={0.38}
        penumbra={0.6}
        intensity={2.0}
        color={isSelected ? '#FFF8EE' : hovered ? '#FFFFFF' : '#F5EFE6'}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Floating Animated Display */}
      <Float
        speed={hovered ? 2.5 : 1.5}
        rotationIntensity={0.05}
        floatIntensity={hovered ? 0.25 : 0.12}
      >
        <group
          ref={rotatingGroupRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(look);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
        >
          {/* 3D Realistic Avatar wearing the curated look */}
          <AvatarCharacter
            position={[0, 0.45, 0]}
            scale={0.84}
            customization={{
              topColor: look.primaryColor,
              bottomColor: look.id === 'look-001' ? '#25355E' : look.id === 'look-004' ? '#D5CDC0' : '#1F2226',
              fabricRoughness: look.fabricType === 'leather' ? 0.45 : 0.8,
            }}
            interactiveLookAt={hovered}
          />
        </group>
      </Float>

      {/* Floating 3D HUD Tag */}
      <Html
        position={[0, 2.7, 0]}
        center
        distanceFactor={9}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          className={`transition-all duration-300 select-none whitespace-nowrap text-center ${
            isSelected
              ? 'scale-105 opacity-100'
              : hovered
              ? 'scale-100 opacity-95'
              : 'scale-90 opacity-70'
          }`}
        >
          <div className="glass px-3.5 py-1.5 border border-studio-black/10 shadow-lg backdrop-blur-md">
            <span className="text-[10px] tracking-widest uppercase text-studio-mid font-medium block">
              {look.season}
            </span>
            <span className="text-xs font-semibold text-studio-black block tracking-tight">
              {look.name}
            </span>
            <span className="text-[11px] font-mono text-studio-dark mt-0.5 block">
              ${totalPrice.toLocaleString()}
            </span>
          </div>
          {/* Subtle connecting pin */}
          <div className="w-px h-3 bg-studio-black/20 mx-auto mt-0.5" />
        </div>
      </Html>

      {/* Pedestal Base: Terrazzo Marble Column */}
      <group position={[0, 0, 0]}>
        {/* Upper Plinth Disc */}
        <mesh position={[0, 0.42, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.62, 0.65, 0.08, 36]} />
          <meshStandardMaterial
            color={isSelected ? '#F8F6F2' : hovered ? '#F0EEE8' : '#E8E5DF'}
            roughness={0.25}
            metalness={0.1}
          />
        </mesh>

        {/* Illuminated Neon/LED Ring */}
        <mesh position={[0, 0.38, 0]}>
          <torusGeometry args={[0.62, 0.014, 16, 48]} />
          <meshBasicMaterial
            color={isSelected ? '#E2BA72' : hovered ? '#D4B07B' : '#C8C4BD'}
          />
        </mesh>

        {/* Pedestal Column */}
        <mesh position={[0, 0.18, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.56, 0.6, 0.36, 36]} />
          <meshStandardMaterial
            color="#DAD6CE"
            roughness={0.4}
            metalness={0.05}
          />
        </mesh>

        {/* Floor Recessed Shadow Trim Ring */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.78, 36]} />
          <meshBasicMaterial color="#0A0A0A" transparent opacity={0.25} />
        </mesh>
      </group>

      {/* Baked Soft Contact Shadow on Pedestal Plinth */}
      <ContactShadows
        position={[0, 0.02, 0]}
        opacity={hovered ? 0.6 : 0.4}
        scale={2.2}
        blur={1.8}
        far={2}
      />
    </group>
  );
}

/**
 * Floor-to-Ceiling Architectural Glass Windows with Steel Mullions
 */
function ArchitecturalWindowWall() {
  const mullionMat = new THREE.MeshStandardMaterial({
    color: '#1C1C1E',
    roughness: 0.3,
    metalness: 0.85,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: '#E8F2FA',
    transmission: 0.88,
    opacity: 0.35,
    transparent: true,
    roughness: 0.1,
    ior: 1.5,
    reflectivity: 0.9,
    clearcoat: 1.0,
  });

  return (
    <group position={[0, 3.0, -8.6]}>
      {/* Glass Pane */}
      <mesh>
        <planeGeometry args={[22, 6]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Exterior Zen Sky Backdrop */}
      <mesh position={[0, 0, -2.5]}>
        <planeGeometry args={[26, 9]} />
        <meshBasicMaterial color="#E9EDF2" />
      </mesh>

      {/* Window Frame Outer Perimeter */}
      {/* Top frame */}
      <mesh position={[0, 3.0, 0]}>
        <boxGeometry args={[22.2, 0.15, 0.12]} />
        <primitive object={mullionMat} attach="material" />
      </mesh>
      {/* Bottom frame */}
      <mesh position={[0, -3.0, 0]}>
        <boxGeometry args={[22.2, 0.15, 0.12]} />
        <primitive object={mullionMat} attach="material" />
      </mesh>

      {/* Vertical Mullions */}
      {[-8.8, -4.4, 0, 4.4, 8.8].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.08, 6.0, 0.12]} />
          <primitive object={mullionMat} attach="material" />
        </mesh>
      ))}

      {/* Horizontal Transom Bar */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[22, 0.06, 0.1]} />
        <primitive object={mullionMat} attach="material" />
      </mesh>
    </group>
  );
}

/**
 * Luxury Gallery Architectural Shell & Ambient Cove Lights
 */
function GalleryArchitecture() {
  const wallMat = new THREE.MeshStandardMaterial({
    color: '#F0EEEA',
    roughness: 0.88,
    metalness: 0.0,
  });

  const ceilingMat = new THREE.MeshStandardMaterial({
    color: '#EFECE7',
    roughness: 0.95,
  });

  return (
    <>
      {/* Window Wall at the Back */}
      <ArchitecturalWindowWall />

      {/* Left Gallery Wall */}
      <mesh position={[-11, 3.0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 6]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Right Gallery Wall */}
      <mesh position={[11, 3.0, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 6]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Gallery Ceiling with Recessed Light Troughs */}
      <mesh position={[0, 6.0, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[22, 20]} />
        <primitive object={ceilingMat} attach="material" />
      </mesh>

      {/* Ceiling Architectural Beams & Gallery Lighting Track */}
      {[-5, 0, 5].map((z) => (
        <mesh key={z} position={[0, 5.85, z]} receiveShadow>
          <boxGeometry args={[22, 0.25, 0.15]} />
          <meshStandardMaterial color="#2B2B2D" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}

      {/* Cove Warm Wash Downlights */}
      <pointLight position={[-8, 5.5, -4]} intensity={1.8} color="#FFEEDD" distance={12} />
      <pointLight position={[8, 5.5, -4]} intensity={1.8} color="#FFEEDD" distance={12} />
      <pointLight position={[0, 5.5, 2]} intensity={2.2} color="#FFF4EA" distance={14} />
    </>
  );
}

/**
 * Polished Concrete / Terrazzo Marble Reflector Floor
 */
function ShowroomFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[24, 22]} />
      <MeshReflectorMaterial
        blur={[350, 80]}
        resolution={1024}
        mixBlur={1.2}
        mixStrength={25}
        roughness={0.7}
        depthScale={1.4}
        minDepthThreshold={0.2}
        maxDepthThreshold={1.8}
        color="#DDD9D0"
        metalness={0.4}
        mirror={0.45}
      />
    </mesh>
  );
}

/**
 * Main Showroom Scene Component
 */
export function ShowroomScene({
  selectedLookId,
  onSelectLook,
}: {
  selectedLookId: string | null;
  onSelectLook: (look: ShowroomPedestalData) => void;
}) {
  return (
    <>
      {/* Architectural Shell & Light Setup */}
      <GalleryArchitecture />
      <ShowroomFloor />

      {/* 4 Interactive Display Pedestals */}
      {SHOWROOM_LOOKS.map((look) => (
        <DisplayPedestal
          key={look.id}
          look={look}
          isSelected={selectedLookId === look.id}
          onSelect={onSelectLook}
        />
      ))}

      {/* Ambient Gallery Lighting */}
      <ambientLight intensity={0.55} color="#FAF7F2" />
      {/* Directional Soft Sun through Window Wall */}
      <directionalLight
        position={[-6, 7, -6]}
        intensity={1.8}
        color="#FFF6EA"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
    </>
  );
}

export default ShowroomScene;
