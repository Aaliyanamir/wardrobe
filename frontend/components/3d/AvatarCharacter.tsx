'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

export interface AvatarCustomization {
  topColor?: string;
  bottomColor?: string;
  shoeColor?: string;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL';
  garmentType?: 'shirt' | 'tee' | 'hoodie' | 'jacket' | 'blazer';
  fabricRoughness?: number;
  showGlasses?: boolean;
  productId?: string; // triggers full swap animation on change
}

interface AvatarCharacterProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  customization?: AvatarCustomization;
  interactiveLookAt?: boolean;
}

// Proportional chest/torso scaling via spine bone
const sizeFitOffsets: Record<string, number> = {
  XS: -0.04,
  S: -0.02,
  M: 0.0,
  L: 0.03,
  XL: 0.06,
  '2XL': 0.09,
};

export default function AvatarCharacter({
  position = [0, -1.18, 0.15],
  rotation = [0, 0, 0],
  scale = 1.02,
  customization = {},
  interactiveLookAt = true,
}: AvatarCharacterProps) {
  const { scene } = useGLTF('/models/avatar.glb');
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  // Clone scene so multiple instances don't share skeleton bone matrices
  const clonedScene = useMemo(() => {
    return SkeletonUtils.clone(scene);
  }, [scene]);

  // Bone and Mesh references
  const bonesRef = useRef<{
    leftArm?: THREE.Bone;
    rightArm?: THREE.Bone;
    leftForeArm?: THREE.Bone;
    rightForeArm?: THREE.Bone;
    leftHand?: THREE.Bone;
    rightHand?: THREE.Bone;
    head?: THREE.Bone;
    neck?: THREE.Bone;
    spine?: THREE.Bone;
    spine2?: THREE.Bone;
    hips?: THREE.Bone;
  }>({});

  const meshesRef = useRef<{
    topMesh?: THREE.SkinnedMesh;
    bottomMesh?: THREE.SkinnedMesh;
    footwearMesh?: THREE.SkinnedMesh;
    skinMesh?: THREE.SkinnedMesh;
    glassesMesh?: THREE.SkinnedMesh;
    bodyMesh?: THREE.SkinnedMesh;
  }>({});

  // Color lerping refs
  const currentTopColor = useRef(new THREE.Color(customization.topColor || '#7EAECE'));
  const targetTopColor = useRef(new THREE.Color(customization.topColor || '#7EAECE'));
  const currentBottomColor = useRef(new THREE.Color(customization.bottomColor || '#2B3036'));
  const targetBottomColor = useRef(new THREE.Color(customization.bottomColor || '#2B3036'));

  // Outfit swap animation state
  const swapAnim = useRef({
    active: false,
    progress: 0.0,
    pendingTopColor: null as string | null,
    pendingBottomColor: null as string | null,
    colorsApplied: false,
  });

  // ===================== BONE SETUP + MATERIAL CLONE =====================
  useEffect(() => {
    const bones: typeof bonesRef.current = {};
    const meshes: typeof meshesRef.current = {};

    clonedScene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh || (obj as THREE.SkinnedMesh).isSkinnedMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }

      if ((obj as THREE.Bone).isBone) {
        const name = obj.name; // Use exact name for RPM bones
        const lname = name.toLowerCase();
        // ReadyPlayerMe exact bone names: LeftArm_27, LeftForeArm_26, LeftHand_25, RightArm_51, RightForeArm_50, RightHand_49
        if (name === 'LeftForeArm_26' || lname.includes('leftforearm')) {
          bones.leftForeArm = obj as THREE.Bone;
        } else if (name === 'RightForeArm_50' || lname.includes('rightforearm')) {
          bones.rightForeArm = obj as THREE.Bone;
        } else if (name === 'LeftArm_27' || (lname.includes('leftarm') && !lname.includes('fore'))) {
          bones.leftArm = obj as THREE.Bone;
        } else if (name === 'RightArm_51' || (lname.includes('rightarm') && !lname.includes('fore'))) {
          bones.rightArm = obj as THREE.Bone;
        } else if (name === 'LeftHand_25' || (lname.includes('lefthand') && !lname.includes('thumb') && !lname.includes('index') && !lname.includes('middle') && !lname.includes('ring') && !lname.includes('pinky'))) {
          bones.leftHand = obj as THREE.Bone;
        } else if (name === 'RightHand_49' || (lname.includes('righthand') && !lname.includes('thumb') && !lname.includes('index') && !lname.includes('middle') && !lname.includes('ring') && !lname.includes('pinky'))) {
          bones.rightHand = obj as THREE.Bone;
        } else if (lname.includes('head') && !lname.includes('top')) {
          bones.head = obj as THREE.Bone;
        } else if (lname.includes('neck')) {
          bones.neck = obj as THREE.Bone;
        } else if (lname.includes('spine2') || lname.includes('spine1')) {
          bones.spine2 = obj as THREE.Bone;
        } else if (lname.includes('spine')) {
          bones.spine = obj as THREE.Bone;
        } else if (lname.includes('hips') || lname.includes('pelvis')) {
          bones.hips = obj as THREE.Bone;
        }
      }

      const mesh = obj as THREE.SkinnedMesh;
      if (mesh.isSkinnedMesh) {
        const meshName = mesh.name.toLowerCase();
        const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;

        if (meshName.includes('outfit_top') || (mat && mat.name?.includes('Outfit_Top'))) {
          meshes.topMesh = mesh;
          mesh.material = (mat as THREE.Material).clone();
          const topMat = mesh.material as THREE.MeshStandardMaterial;
          if (topMat) {
            topMat.roughness = customization.fabricRoughness ?? 0.76;
            topMat.metalness = 0.02;
            topMat.transparent = true;
            topMat.opacity = 1.0;
          }
        } else if (meshName.includes('outfit_bottom') || (mat && mat.name?.includes('Outfit_Bottom'))) {
          meshes.bottomMesh = mesh;
          mesh.material = (mat as THREE.Material).clone();
          const botMat = mesh.material as THREE.MeshStandardMaterial;
          if (botMat) {
            botMat.roughness = 0.85;
            botMat.metalness = 0.0;
            botMat.transparent = true;
            botMat.opacity = 1.0;
          }
        } else if (meshName.includes('footwear') || (mat && mat.name?.includes('Outfit_Footwear'))) {
          meshes.footwearMesh = mesh;
          mesh.material = (mat as THREE.Material).clone();
          const fMat = mesh.material as THREE.MeshStandardMaterial;
          if (fMat) { fMat.transparent = true; fMat.opacity = 1.0; }
        } else if (meshName.includes('skin') || (mat && mat.name?.includes('Skin'))) {
          meshes.skinMesh = mesh;
        } else if (meshName.includes('body') || (mat && mat.name?.includes('Body'))) {
          meshes.bodyMesh = mesh;
        } else if (meshName.includes('glasses') || (mat && mat.name?.includes('Glasses'))) {
          meshes.glassesMesh = mesh;
          if (customization.showGlasses === false) {
            mesh.visible = false;
          }
        }
      }
    });

    bonesRef.current = bones;
    meshesRef.current = meshes;

    // Apply arm-down pose immediately on mount
    applyArmDownPose(bones);

  }, [clonedScene, customization.fabricRoughness, customization.showGlasses]);

  // ===================== TRIGGER SWAP ANIMATION ON PRODUCT/COLOR CHANGE =====================
  useEffect(() => {
    if (!customization.topColor) return;
    swapAnim.current.pendingTopColor = customization.topColor;
    swapAnim.current.pendingBottomColor = customization.bottomColor || '#2B3036';
    swapAnim.current.progress = 0.0;
    swapAnim.current.active = true;
    swapAnim.current.colorsApplied = false;
  }, [customization.topColor, customization.productId]);

  useEffect(() => {
    if (customization.bottomColor && !swapAnim.current.active) {
      targetBottomColor.current.set(customization.bottomColor);
    }
  }, [customization.bottomColor]);

  // Proportional sizing via spine bone
  useEffect(() => {
    const size = customization.size || 'M';
    const offset = sizeFitOffsets[size] ?? 0;
    if (bonesRef.current.spine2) {
      const s = 1.0 + offset;
      bonesRef.current.spine2.scale.set(s, 1.0, s);
    }
  }, [customization.size]);

  // ===================== FRAME LOOP =====================
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const bones = bonesRef.current;
    const meshes = meshesRef.current;

    // Enforce straight-down arm pose every frame (overrides GLB A-pose)
    applyArmDownPose(bones);

    // Natural breathing on spine
    const breath = Math.sin(t * 1.6) * 0.006;
    if (bones.spine2) {
      bones.spine2.rotation.x = breath;
    }

    // Interactive mouse head tracking
    if (interactiveLookAt && bones.head) {
      const targetYaw = pointer.x * 0.18;
      const targetPitch = -pointer.y * 0.12;
      bones.head.rotation.y = THREE.MathUtils.lerp(bones.head.rotation.y, targetYaw, delta * 3.5);
      bones.head.rotation.x = THREE.MathUtils.lerp(bones.head.rotation.x, targetPitch, delta * 3.5);
    }

    // ---- OUTFIT SWAP DISSOLVE ANIMATION ----
    if (swapAnim.current.active) {
      swapAnim.current.progress = Math.min(swapAnim.current.progress + delta * 4.5, 1.0);
      const p = swapAnim.current.progress;

      let opacity: number;
      if (p < 0.45) {
        // Phase 1: fade out 1 → 0
        opacity = 1.0 - p / 0.45;
      } else {
        // Phase 2: apply new colors once at midpoint, then fade in 0 → 1
        if (!swapAnim.current.colorsApplied) {
          if (swapAnim.current.pendingTopColor) {
            currentTopColor.current.set(swapAnim.current.pendingTopColor);
            targetTopColor.current.set(swapAnim.current.pendingTopColor);
          }
          if (swapAnim.current.pendingBottomColor) {
            currentBottomColor.current.set(swapAnim.current.pendingBottomColor);
            targetBottomColor.current.set(swapAnim.current.pendingBottomColor);
          }
          swapAnim.current.colorsApplied = true;
        }
        opacity = (p - 0.45) / 0.55;
      }

      const clampedOpacity = Math.max(0, Math.min(1, opacity));

      if (meshes.topMesh?.material) {
        const mat = meshes.topMesh.material as THREE.MeshStandardMaterial;
        mat.transparent = true;
        mat.opacity = clampedOpacity;
        if (mat.color) mat.color.copy(currentTopColor.current);
        if (customization.fabricRoughness !== undefined) mat.roughness = customization.fabricRoughness;
      }
      if (meshes.bottomMesh?.material) {
        const mat = meshes.bottomMesh.material as THREE.MeshStandardMaterial;
        mat.transparent = true;
        mat.opacity = clampedOpacity;
        if (mat.color) mat.color.copy(currentBottomColor.current);
      }
      if (meshes.footwearMesh?.material) {
        const mat = meshes.footwearMesh.material as THREE.MeshStandardMaterial;
        mat.transparent = true;
        mat.opacity = Math.max(0.1, clampedOpacity);
      }

      // Elastic scale pop on fade-in
      const bounceScale = p < 0.45 ? 1.0 : 1.0 + Math.sin(((p - 0.45) / 0.55) * Math.PI) * 0.022;
      if (groupRef.current) {
        groupRef.current.scale.setScalar(scale * bounceScale);
      }

      if (p >= 1.0) {
        swapAnim.current.active = false;
        swapAnim.current.pendingTopColor = null;
        swapAnim.current.pendingBottomColor = null;
        if (meshes.topMesh?.material) {
          (meshes.topMesh.material as THREE.MeshStandardMaterial).opacity = 1.0;
        }
        if (meshes.bottomMesh?.material) {
          (meshes.bottomMesh.material as THREE.MeshStandardMaterial).opacity = 1.0;
        }
        if (meshes.footwearMesh?.material) {
          (meshes.footwearMesh.material as THREE.MeshStandardMaterial).opacity = 1.0;
        }
        if (groupRef.current) {
          groupRef.current.scale.setScalar(scale);
        }
      }
    } else {
      // Normal color crossfade when no swap active
      currentTopColor.current.lerp(targetTopColor.current, Math.min(delta * 7, 1));
      currentBottomColor.current.lerp(targetBottomColor.current, Math.min(delta * 7, 1));

      if (meshes.topMesh?.material) {
        const mat = meshes.topMesh.material as THREE.MeshStandardMaterial;
        if (mat.color) mat.color.copy(currentTopColor.current);
        if (customization.fabricRoughness !== undefined) {
          mat.roughness = THREE.MathUtils.lerp(mat.roughness, customization.fabricRoughness, delta * 4);
        }
      }
      if (meshes.bottomMesh?.material) {
        const mat = meshes.bottomMesh.material as THREE.MeshStandardMaterial;
        if (mat.color) mat.color.copy(currentBottomColor.current);
      }
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
}

// ===================== ARM-DOWN POSE HELPER =====================
// ReadyPlayerMe A-pose has ~57° arm raise on X/Z axis.
// We override bone rotations every frame to force mannequin standing pose.
function applyArmDownPose(bones: {
  leftArm?: THREE.Bone;
  rightArm?: THREE.Bone;
  leftForeArm?: THREE.Bone;
  rightForeArm?: THREE.Bone;
  leftHand?: THREE.Bone;
  rightHand?: THREE.Bone;
}) {
  if (bones.leftArm) {
    bones.leftArm.rotation.order = 'XYZ';
    bones.leftArm.rotation.x = 0.0;
    bones.leftArm.rotation.y = 0.06;
    bones.leftArm.rotation.z = -1.32;
  }
  if (bones.rightArm) {
    bones.rightArm.rotation.order = 'XYZ';
    bones.rightArm.rotation.x = 0.0;
    bones.rightArm.rotation.y = -0.06;
    bones.rightArm.rotation.z = 1.32;
  }
  if (bones.leftForeArm) {
    bones.leftForeArm.rotation.order = 'XYZ';
    bones.leftForeArm.rotation.x = 0.0;
    bones.leftForeArm.rotation.y = 0.0;
    bones.leftForeArm.rotation.z = -0.06;
  }
  if (bones.rightForeArm) {
    bones.rightForeArm.rotation.order = 'XYZ';
    bones.rightForeArm.rotation.x = 0.0;
    bones.rightForeArm.rotation.y = 0.0;
    bones.rightForeArm.rotation.z = 0.06;
  }
  if (bones.leftHand) {
    bones.leftHand.rotation.set(0, 0, 0);
  }
  if (bones.rightHand) {
    bones.rightHand.rotation.set(0, 0, 0);
  }
}

useGLTF.preload('/models/avatar.glb');
