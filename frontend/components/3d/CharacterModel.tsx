'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { products, Product } from '@/data/products';
import AvatarCharacter, { AvatarCustomization } from './AvatarCharacter';

const getSelectedColor = (product: Product | undefined, colorName: string | undefined) =>
  product?.colors.find((color) => color.name === colorName)?.hex ||
  product?.colors[0]?.hex;

const getFitWidth = (product: Product | undefined) => {
  if (!product) return 1;
  const tags = product.tags.map((tag) => tag.toLowerCase());
  if (tags.includes('oversized') || tags.includes('wide-leg')) return 1.1;
  if (tags.includes('relaxed')) return 1.06;
  if (product.category === 'hoodies' || product.category === 'jackets') return 1.04;
  return 1;
};

const getFabricRoughness = (product: Product | undefined, fallback: number) => {
  const material = product?.material.toLowerCase() || '';
  if (material.includes('leather')) return 0.48;
  if (material.includes('denim')) return 0.9;
  if (material.includes('linen')) return 0.82;
  if (material.includes('wool')) return 0.84;
  if (material.includes('nylon')) return 0.62;
  if (product?.category === 'hoodies') return 0.92;
  return fallback;
};

export default function CharacterModel({
  position = [0, -2, 0],
  scale = 1.08,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const { selectedCategory, selectedProducts, selectedColors, selectedSizes } = useStore();
  const activeProduct = products.find((product) => product.id === selectedProducts[selectedCategory]);
  const topProduct =
    activeProduct?.category === 'pants'
      ? products.find((product) => product.id === selectedProducts.tops)
      : activeProduct || products.find((product) => product.id === selectedProducts.tops);
  const pantsProduct = products.find((product) => product.id === selectedProducts.pants);

  const customization: AvatarCustomization = {
    topColor:
      getSelectedColor(topProduct, selectedColors[topProduct?.category || 'tops']) ||
      '#7EAECE',
    bottomColor:
      getSelectedColor(pantsProduct, selectedColors.pants) ||
      '#2B3036',
    size: (selectedSizes[selectedCategory] || selectedSizes.tops || 'M') as AvatarCustomization['size'],
    garmentCategory: activeProduct?.category || 'tops',
    fabricRoughness: getFabricRoughness(topProduct, 0.78),
    bottomRoughness: getFabricRoughness(pantsProduct, 0.85),
    topFitWidth: getFitWidth(topProduct),
    bottomFitWidth: getFitWidth(pantsProduct),
    productId: activeProduct?.id || topProduct?.id,
    topProductId: topProduct?.id,
    bottomProductId: pantsProduct?.id,
    showGlasses: true,
  };

  return (
    <AvatarCharacter
      position={position}
      scale={scale}
      customization={customization}
      interactiveLookAt
    />
  );
}
