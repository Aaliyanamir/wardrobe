'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { products } from '@/data/products';
import AvatarCharacter, { AvatarCustomization } from './AvatarCharacter';

// Color mapping fallback
const colorHexMap: Record<string, string> = {
  'Chalk White': '#F5F5F0',
  'Slate Blue': '#6B7FA3',
  Sand: '#C4A882',
  Onyx: '#2A2A2A',
  Cream: '#F2EDE4',
  Charcoal: '#3C3C3C',
  Forest: '#3D5A43',
  Rust: '#B05A30',
  Natural: '#D4C5A9',
  Marine: '#354F6E',
  Sage: '#8A9E8C',
  Stone: '#9E9183',
  Midnight: '#1A1A2E',
  Ash: '#B2B2B2',
  Earth: '#6B4F3A',
  Carbon: '#2C2C2C',
  Navy: '#1B2951',
  Camel: '#C19A6B',
  Ivory: '#FFFFF0',
  Graphite: '#4A4A4A',
  Moss: '#5B6B44',
  Black: '#151515',
  Whiskey: '#8B5E3C',
  'Raw Indigo': '#25355E',
  'Washed Black': '#282828',
  'Stone Wash': '#7B8DA5',
  Chalk: '#E8E0D5',
  Slate: '#5A6476',
  Khaki: '#B5A58A',
  Olive: '#5D6346',
  'Sky Blue': '#7EAECE',
  'Heather Grey': '#B4B9C0',
};

export default function CharacterModel({
  position = [0, -2, 0],
  scale = 1.08,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const {
    selectedCategory,
    selectedProducts,
    selectedColors,
    selectedSizes,
  } = useStore();

  // Active product determination
  const topProduct = products.find((p) => p.id === selectedProducts.tops);
  const jacketProduct = products.find((p) => p.id === selectedProducts.jackets);
  const hoodieProduct = products.find((p) => p.id === selectedProducts.hoodies);
  const pantsProduct = products.find((p) => p.id === selectedProducts.pants);

  // Active top color resolution
  let activeTopColor = '#7EAECE';
  if (selectedCategory === 'jackets' && jacketProduct) {
    activeTopColor = colorHexMap[selectedColors.jackets] || jacketProduct.colors[0]?.hex || '#C19A6B';
  } else if (selectedCategory === 'hoodies' && hoodieProduct) {
    activeTopColor = colorHexMap[selectedColors.hoodies] || hoodieProduct.colors[0]?.hex || '#9E9183';
  } else if (topProduct) {
    activeTopColor = colorHexMap[selectedColors.tops] || topProduct.colors[0]?.hex || '#F5F5F0';
  }

  // Active pants color resolution
  const activeBottomColor =
    colorHexMap[selectedColors.pants] ||
    pantsProduct?.colors[0]?.hex ||
    '#2E3238';

  const customization: AvatarCustomization = {
    topColor: activeTopColor,
    bottomColor: activeBottomColor,
    size: (selectedSizes[selectedCategory] || selectedSizes.tops || 'M') as AvatarCustomization['size'],
    fabricRoughness: selectedCategory === 'jackets' ? 0.65 : 0.82,
    showGlasses: true,
  };

  return (
    <AvatarCharacter
      position={position}
      scale={scale}
      customization={customization}
      interactiveLookAt={true}
    />
  );
}
