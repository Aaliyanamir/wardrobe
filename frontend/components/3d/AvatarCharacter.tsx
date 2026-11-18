'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import GarmentDetails from './GarmentDetails';

type GarmentCategory = 'tops' | 'hoodies' | 'jackets' | 'pants';

export interface AvatarCustomization {
  topColor?: string;
  bottomColor?: string;
  shoeColor?: string;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL';
  garmentType?: 'shirt' | 'tee' | 'hoodie' | 'jacket' | 'blazer';
  garmentCategory?: GarmentCategory;
  fabricRoughness?: number;
  bottomRoughness?: number;
  topFitWidth?: number;
  bottomFitWidth?: number;
  showGlasses?: boolean;
  productId?: string;
  topProductId?: string;
  bottomProductId?: string;
}

interface AvatarCharacterProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  customization?: AvatarCustomization;
  interactiveLookAt?: boolean;
}

interface AvatarMeshes {
  top: THREE.SkinnedMesh | null;
  bottom: THREE.SkinnedMesh | null;
  footwear: THREE.SkinnedMesh | null;
  glasses: THREE.SkinnedMesh | null;
  head: THREE.Bone | null;
  topScale: THREE.Vector3;
  bottomScale: THREE.Vector3;
}

const sizeFitOffsets: Record<NonNullable<AvatarCustomization['size']>, number> = {
  XS: -0.04,
  S: -0.02,
  M: 0,
  L: 0.03,
  XL: 0.06,
  '2XL': 0.09,
};

const getMaterials = (mesh: THREE.SkinnedMesh) =>
  Array.isArray(mesh.material) ? mesh.material : [mesh.material];

function setMaterialColor(mesh: THREE.SkinnedMesh | null, color: THREE.Color) {
  if (!mesh) return;
  for (const material of getMaterials(mesh)) {
    if (material instanceof THREE.MeshStandardMaterial) {
      material.color.copy(color);
    }
  }
}

function colorDistance(a: THREE.Color, b: THREE.Color) {
  return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
}

function setMaterialOpacity(mesh: THREE.SkinnedMesh | null, opacity: number) {
  if (!mesh) return;
  for (const material of getMaterials(mesh)) {
    material.transparent = opacity < 1;
    material.opacity = opacity;
    material.depthWrite = opacity >= 0.98;
  }
}

function setGroupOpacity(group: THREE.Group | null, opacity: number) {
  if (!group) return;
  group.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      material.transparent = opacity < 1;
      material.opacity = opacity;
      material.depthWrite = opacity >= 0.98;
    }
  });
}

function cloneMaterials(mesh: THREE.SkinnedMesh) {
  const clone = (material: THREE.Material) => {
    const materialClone = material.clone();
    materialClone.userData.avatarClone = true;
    return materialClone;
  };
  mesh.material = Array.isArray(mesh.material)
    ? mesh.material.map(clone)
    : clone(mesh.material);
}

export default function AvatarCharacter({
  position = [0, -1.18, 0.15],
  rotation = [0, 0, 0],
  scale = 1.02,
  customization = {},
  interactiveLookAt = true,
}: AvatarCharacterProps) {
  const { scene } = useGLTF('/models/avatar.glb');
  const groupRef = useRef<THREE.Group>(null);
  const detailsRef = useRef<THREE.Group>(null);
  const { pointer, invalidate } = useThree();
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const meshes = useRef<AvatarMeshes>({
    top: null,
    bottom: null,
    footwear: null,
    glasses: null,
    head: null,
    topScale: new THREE.Vector3(1, 1, 1),
    bottomScale: new THREE.Vector3(1, 1, 1),
  });
  const currentTopColor = useRef(new THREE.Color(customization.topColor || '#7EAECE'));
  const currentBottomColor = useRef(new THREE.Color(customization.bottomColor || '#2B3036'));
  const targetTopColor = useRef(currentTopColor.current.clone());
  const targetBottomColor = useRef(currentBottomColor.current.clone());
  const targetTopWidth = useRef(customization.topFitWidth || 1);
  const targetBottomWidth = useRef(customization.bottomFitWidth || 1);
  const targetTopRoughness = useRef(customization.fabricRoughness ?? 0.76);
  const targetBottomRoughness = useRef(customization.bottomRoughness ?? 0.85);
  const swap = useRef({ active: false, progress: 0, colorsApplied: false });

  useEffect(() => {
    const found: AvatarMeshes = {
      top: null,
      bottom: null,
      footwear: null,
      glasses: null,
      head: null,
      topScale: new THREE.Vector3(1, 1, 1),
      bottomScale: new THREE.Vector3(1, 1, 1),
    };

    clonedScene.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }

      if ((object as THREE.Bone).isBone) {
        const name = object.name.toLowerCase();
        if (name === 'head' || name.startsWith('head_')) found.head = object as THREE.Bone;
      }

      const mesh = object as THREE.SkinnedMesh;
      if (!mesh.isSkinnedMesh) return;

      const materialName = getMaterials(mesh).map((material) => material.name.toLowerCase()).join(' ');
      if (materialName.includes('outfit_top')) {
        found.top = mesh;
        cloneMaterials(mesh);
        found.topScale.copy(mesh.scale);
      } else if (materialName.includes('outfit_bottom')) {
        found.bottom = mesh;
        cloneMaterials(mesh);
        found.bottomScale.copy(mesh.scale);
      } else if (materialName.includes('outfit_footwear')) {
        found.footwear = mesh;
      } else if (materialName.includes('glasses')) {
        found.glasses = mesh;
      }
    });

    meshes.current = found;
    setMaterialColor(found.top, currentTopColor.current);
    setMaterialColor(found.bottom, currentBottomColor.current);
  }, [clonedScene]);

  useEffect(() => {
    if (meshes.current.glasses) {
      meshes.current.glasses.visible = customization.showGlasses !== false;
    }
  }, [clonedScene, customization.showGlasses]);

  useEffect(() => {
    targetTopColor.current.set(customization.topColor || '#7EAECE');
    targetBottomColor.current.set(customization.bottomColor || '#2B3036');
    targetTopWidth.current = customization.topFitWidth || 1;
    targetBottomWidth.current = customization.bottomFitWidth || 1;
    targetTopRoughness.current = customization.fabricRoughness ?? 0.76;
    targetBottomRoughness.current = customization.bottomRoughness ?? 0.85;
    invalidate();
  }, [
    customization.bottomColor,
    customization.bottomFitWidth,
    customization.bottomRoughness,
    customization.fabricRoughness,
    customization.size,
    customization.topColor,
    customization.topFitWidth,
    invalidate,
  ]);

  useEffect(() => {
    swap.current = { active: true, progress: 0, colorsApplied: false };
    invalidate();
  }, [customization.productId, customization.topColor, customization.bottomColor, invalidate]);

  useEffect(
    () => () => {
      clonedScene.traverse((object) => {
        const mesh = object as THREE.SkinnedMesh;
        if (!mesh.isSkinnedMesh) return;
        const materials = getMaterials(mesh);
        for (const material of materials) {
          if (material.userData.avatarClone) material.dispose();
        }
      });
    },
    [clonedScene]
  );

  useFrame((_, delta) => {
    const avatar = meshes.current;
    let needsAnotherFrame = false;

    const fit = customization.size ? 1 + (sizeFitOffsets[customization.size] ?? 0) : 1;
    for (const [mesh, baseScale, targetWidth] of [
      [avatar.top, avatar.topScale, targetTopWidth.current],
      [avatar.bottom, avatar.bottomScale, targetBottomWidth.current],
    ] as const) {
      if (!mesh) continue;
      const targetX = baseScale.x * targetWidth * fit;
      const targetZ = baseScale.z * fit;
      mesh.scale.x = THREE.MathUtils.damp(mesh.scale.x, targetX, 5, delta);
      mesh.scale.z = THREE.MathUtils.damp(mesh.scale.z, targetZ, 5, delta);
      needsAnotherFrame ||= Math.abs(mesh.scale.x - targetX) + Math.abs(mesh.scale.z - targetZ) > 0.001;
    }

    for (const [mesh, targetRoughness] of [
      [avatar.top, targetTopRoughness.current],
      [avatar.bottom, targetBottomRoughness.current],
    ] as const) {
      if (!mesh) continue;
      for (const material of getMaterials(mesh)) {
        if (!(material instanceof THREE.MeshStandardMaterial)) continue;
        material.roughness = THREE.MathUtils.damp(material.roughness, targetRoughness, 4, delta);
        needsAnotherFrame ||= Math.abs(material.roughness - targetRoughness) > 0.002;
      }
    }

    if (interactiveLookAt && avatar.head) {
      const yaw = pointer.x * 0.18;
      const pitch = -pointer.y * 0.12;
      const head = avatar.head;
      const nextYaw = THREE.MathUtils.damp(head.rotation.y, yaw, 3.5, delta);
      const nextPitch = THREE.MathUtils.damp(head.rotation.x, pitch, 3.5, delta);
      head.rotation.y = nextYaw;
      head.rotation.x = nextPitch;
      needsAnotherFrame ||= Math.abs(nextYaw - yaw) + Math.abs(nextPitch - pitch) > 0.002;
    }

    if (swap.current.active) {
      swap.current.progress = Math.min(swap.current.progress + delta * 4.5, 1);
      const progress = swap.current.progress;
      const midpoint = 0.45;
      const opacity = progress < midpoint
        ? 1 - progress / midpoint
        : (progress - midpoint) / (1 - midpoint);

      if (progress >= midpoint && !swap.current.colorsApplied) {
        currentTopColor.current.copy(targetTopColor.current);
        currentBottomColor.current.copy(targetBottomColor.current);
        swap.current.colorsApplied = true;
      }

      if (progress >= 1) {
        swap.current.active = false;
        setMaterialOpacity(avatar.top, 1);
        setMaterialOpacity(avatar.bottom, 1);
        setMaterialOpacity(avatar.footwear, 1);
        setGroupOpacity(detailsRef.current, 1);
      } else {
        setMaterialOpacity(avatar.top, opacity);
        setMaterialOpacity(avatar.bottom, opacity);
        setMaterialOpacity(avatar.footwear, Math.max(0.1, opacity));
        setGroupOpacity(detailsRef.current, opacity);
        if (groupRef.current) {
          const bounce = 1 + Math.sin(((progress - midpoint) / (1 - midpoint)) * Math.PI) * 0.022;
          groupRef.current.scale.setScalar(scale * bounce);
        }
        needsAnotherFrame = true;
      }
    } else {
      setGroupOpacity(detailsRef.current, 1);
      const blend = Math.min(delta * 7, 1);
      currentTopColor.current.lerp(targetTopColor.current, blend);
      currentBottomColor.current.lerp(targetBottomColor.current, blend);
      setMaterialColor(avatar.top, currentTopColor.current);
      setMaterialColor(avatar.bottom, currentBottomColor.current);

      const colorDelta =
        colorDistance(currentTopColor.current, targetTopColor.current) +
        colorDistance(currentBottomColor.current, targetBottomColor.current);
      needsAnotherFrame ||= colorDelta > 0.002;
    }

    if (needsAnotherFrame) invalidate();
    if (!swap.current.active && groupRef.current && groupRef.current.scale.x !== scale) {
      groupRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={clonedScene} />
      <group ref={detailsRef}>
        <GarmentDetails
          topProductId={customization.topProductId}
          bottomProductId={customization.bottomProductId}
          topColor={customization.topColor || '#7EAECE'}
          bottomColor={customization.bottomColor || '#2B3036'}
        />
      </group>
    </group>
  );
}

useGLTF.preload('/models/avatar.glb');
