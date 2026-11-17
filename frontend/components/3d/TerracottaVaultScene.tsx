'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ContactShadows, Sparkles, Float, Text } from '@react-three/drei';
import AvatarCharacter, { AvatarCustomization } from './AvatarCharacter';

interface TerracottaVaultSceneProps {
  customization?: AvatarCustomization;
  interactiveLookAt?: boolean;
}

/**
 * Creates classical ceramic vase geometry with smooth Tuscan/Grecian amphora contours
 */
function ClassicalUrn() {
  const urnGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    // Base to rim profile
    points.push(new THREE.Vector2(0.0, 0.0));
    points.push(new THREE.Vector2(0.22, 0.0));
    points.push(new THREE.Vector2(0.24, 0.08));
    points.push(new THREE.Vector2(0.20, 0.22));
    points.push(new THREE.Vector2(0.38, 0.55));
    points.push(new THREE.Vector2(0.46, 0.82));
    points.push(new THREE.Vector2(0.42, 1.05));
    points.push(new THREE.Vector2(0.28, 1.25));
    points.push(new THREE.Vector2(0.22, 1.38));
    points.push(new THREE.Vector2(0.25, 1.48));
    points.push(new THREE.Vector2(0.22, 1.50));
    points.push(new THREE.Vector2(0.18, 1.48));
    points.push(new THREE.Vector2(0.0, 1.48));
    return new THREE.LatheGeometry(points, 36);
  }, []);

  const urnMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#D89E75',
        roughness: 0.88,
        metalness: 0.02,
      }),
    []
  );

  return (
    <group position={[-2.35, -1.18, -0.8]}>
      {/* Stone Pedestal */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.78, 0.84, 0.78]} />
        <meshStandardMaterial color="#C89770" roughness={0.92} />
      </mesh>

      {/* Ceramic Urn on Pedestal */}
      <mesh
        geometry={urnGeometry}
        material={urnMaterial}
        position={[0, 0.84, 0]}
        scale={[1.1, 1.05, 1.1]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

/**
 * Rustic Terracotta Drapery on the Left Edge
 */
function TerracottaDrapery() {
  const drapeGeometry = useMemo(() => {
    // Generate curved, folded curtain geometry using a cylinder segment with sine wave folds
    const geom = new THREE.CylinderGeometry(0.55, 0.75, 4.5, 32, 16, true, -Math.PI / 2, Math.PI);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const theta = Math.atan2(pos.getZ(i), pos.getX(i));
      const fold = Math.sin(theta * 8) * 0.08;
      pos.setX(i, pos.getX(i) + fold);
      pos.setZ(i, pos.getZ(i) + fold * 0.6);
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  const drapeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#9C4324', // Rich terracotta rust velvet
        roughness: 0.82,
        metalness: 0.05,
        side: THREE.DoubleSide,
      }),
    []
  );

  return (
    <mesh
      geometry={drapeGeometry}
      material={drapeMaterial}
      position={[-3.35, 0.95, 0.4]}
      rotation={[0, 0.45, 0]}
      castShadow
      receiveShadow
    />
  );
}

/**
 * Architectural Terracotta Vault Environment
 */
export default function TerracottaVaultScene({
  customization,
  interactiveLookAt = true,
}: TerracottaVaultSceneProps) {
  // Shared warm terracotta materials
  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#BD875B',
        roughness: 0.94,
        metalness: 0.0,
      }),
    []
  );

  const archInnerMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#AC754B',
        roughness: 0.92,
        metalness: 0.0,
      }),
    []
  );

  const floorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#A9754C',
        roughness: 0.72,
        metalness: 0.04,
      }),
    []
  );

  const benchMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#C49571',
        roughness: 0.86,
        metalness: 0.02,
      }),
    []
  );

  return (
    <group>
      {/* ================= LIGHTING SETUP ================= */}
      {/* Warm ambient foundation */}
      <ambientLight color="#FBE1CB" intensity={0.85} />

      {/* Main sunlit beam streaming through left architectural archway */}
      <directionalLight
        position={[-6, 7.5, 3.8]}
        target-position={[0, 0.5, 0]}
        intensity={2.8}
        color="#FFF1DD"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
      />

      {/* Warm terracotta ground bounce fill */}
      <directionalLight position={[4, -2, -2]} intensity={0.65} color="#D88755" />

      {/* Soft rim / face highlight light */}
      <pointLight position={[0.2, 1.8, 2.2]} intensity={0.9} color="#FFF8EF" distance={8} />

      {/* ================= ARCHITECTURAL ENVIRONMENT ================= */}
      {/* Ground Floor Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.18, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <primitive object={floorMat} attach="material" />
      </mesh>

      {/* Back Wall with Grand Vaulted Arch Portal */}
      <group position={[0, 0, -2.4]}>
        {/* Recessed Arch Inner Alcove Wall */}
        <mesh position={[0, 1.25, -0.75]} receiveShadow>
          <planeGeometry args={[8.5, 6.5]} />
          <primitive object={archInnerMat} attach="material" />
        </mesh>

        {/* Grand Arch Ceiling Curvature (Half Cylinder Tunnel) */}
        <mesh
          position={[0, 1.45, -0.38]}
          rotation={[Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <cylinderGeometry args={[2.2, 2.2, 0.85, 48, 1, true, Math.PI, Math.PI]} />
          <primitive object={archInnerMat} attach="material" />
        </mesh>

        {/* Arch Columns Left & Right */}
        <mesh position={[-2.2, 0.1, -0.38]} receiveShadow castShadow>
          <boxGeometry args={[0.3, 2.7, 0.85]} />
          <primitive object={archInnerMat} attach="material" />
        </mesh>
        <mesh position={[2.2, 0.1, -0.38]} receiveShadow castShadow>
          <boxGeometry args={[0.3, 2.7, 0.85]} />
          <primitive object={archInnerMat} attach="material" />
        </mesh>

        {/* Outer Facade Wall Surrounding Archway */}
        {/* Top Header */}
        <mesh position={[0, 3.25, 0]} receiveShadow>
          <boxGeometry args={[12, 1.5, 0.25]} />
          <primitive object={wallMat} attach="material" />
        </mesh>
        {/* Left Wing Wall */}
        <mesh position={[-4.1, 0.8, 0]} receiveShadow>
          <boxGeometry args={[3.8, 3.5, 0.25]} />
          <primitive object={wallMat} attach="material" />
        </mesh>
        {/* Right Wing Wall */}
        <mesh position={[4.1, 0.8, 0]} receiveShadow>
          <boxGeometry args={[3.8, 3.5, 0.25]} />
          <primitive object={wallMat} attach="material" />
        </mesh>

        {/* Engraved/Embossed "VARDE" typography on inner arch wall matching reference image */}
        <Text
          position={[0, 2.38, -0.72]}
          fontSize={0.88}
          letterSpacing={0.28}
          color="#E6BA95"
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.92}
        >
          VARDE
        </Text>
      </group>

      {/* Classical Terracotta Urn & Pedestal on Left */}
      <ClassicalUrn />

      {/* Terracotta Hanging Drapery on Far Left */}
      <TerracottaDrapery />

      {/* Modernist Architectural Stone Bench on Right */}
      <group position={[2.55, -0.88, -1.1]}>
        {/* Bench Top Slab */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.18, 0.95]} />
          <primitive object={benchMat} attach="material" />
        </mesh>
        {/* Bench Support Pillars */}
        <mesh position={[-0.95, -0.16, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.22, 0.24, 0.8]} />
          <primitive object={benchMat} attach="material" />
        </mesh>
        <mesh position={[0.95, -0.16, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.22, 0.24, 0.8]} />
          <primitive object={benchMat} attach="material" />
        </mesh>
      </group>

      {/* ================= 3D REALISTIC AVATAR ================= */}
      {/* Centered directly in front of the vaulted terracotta arch */}
      <AvatarCharacter
        position={[0, -1.18, 0.15]}
        scale={1.02}
        customization={customization}
        interactiveLookAt={interactiveLookAt}
      />

      {/* Realistic contact shadow beneath model and scene elements */}
      <ContactShadows
        position={[0, -1.175, 0]}
        opacity={0.65}
        scale={8.5}
        blur={1.6}
        far={2.2}
        color="#321A10"
      />

      {/* Floating sunlit dust motes */}
      <Sparkles
        count={35}
        scale={[6, 4, 4]}
        position={[0, 0.8, 0]}
        size={1.4}
        speed={0.35}
        color="#FFE5B8"
        opacity={0.6}
      />
    </group>
  );
}
