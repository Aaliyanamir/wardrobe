import * as THREE from 'three';

export type FabricType = 'cotton' | 'denim' | 'leather' | 'wool';

export interface FabricPBRMaps {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  aoMap: THREE.CanvasTexture;
}

// Global cache to prevent redundant procedural renders and conserve WebGL memory
const textureCache = new Map<string, FabricPBRMaps>();
const materialCache = new Map<string, THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial>();

/**
 * Creates high-resolution canvas with 2D context
 */
function createCanvas(size = 1024): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  return { canvas, ctx };
}

/**
 * Convert hex color string to normalized RGB [0..1]
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  if (clean.length === 3) {
    const r = ((bigint >> 8) & 0xf) * 17;
    const g = ((bigint >> 4) & 0xf) * 17;
    const b = (bigint & 0xf) * 17;
    return { r: r / 255, g: g / 255, b: b / 255 };
  }
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r: r / 255, g: g / 255, b: b / 255 };
}

/**
 * Configure texture repeat, filtering and color space
 */
function configureTextures(maps: FabricPBRMaps, repeatU = 10, repeatV = 10) {
  // Albedo map in sRGB color space
  maps.map.colorSpace = THREE.SRGBColorSpace;
  maps.map.wrapS = THREE.RepeatWrapping;
  maps.map.wrapT = THREE.RepeatWrapping;
  maps.map.repeat.set(repeatU, repeatV);
  maps.map.generateMipmaps = true;
  maps.map.minFilter = THREE.LinearMipmapLinearFilter;
  maps.map.magFilter = THREE.LinearFilter;
  maps.map.needsUpdate = true;

  // Normal, Roughness, AO in linear color space
  [maps.normalMap, maps.roughnessMap, maps.aoMap].forEach((tex) => {
    tex.colorSpace = THREE.NoColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatU, repeatV);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
  });
}

/**
 * 1. Long-Staple Egyptian Cotton:
 * - Fine orthogonal micro-weave (warp & weft interlacing grid)
 * - Matte sheen, high roughness (0.85), subtle thread-to-thread luminance variance
 * - Micro-relief normal bump from alternating over-under thread crossovers
 * - Occlusion shadowing in yarn crevices
 */
export function getCottonPBRTextures(baseColorHex: string, size = 1024): FabricPBRMaps | null {
  const key = `cotton_${baseColorHex}_${size}`;
  if (textureCache.has(key)) return textureCache.get(key)!;
  if (typeof document === 'undefined') return null;

  const { r: br, g: bg, b: bb } = hexToRgb(baseColorHex);

  const { canvas: albedoCanvas, ctx: actx } = createCanvas(size);
  const { canvas: normalCanvas, ctx: nctx } = createCanvas(size);
  const { canvas: roughCanvas, ctx: rctx } = createCanvas(size);
  const { canvas: aoCanvas, ctx: aoctx } = createCanvas(size);

  const albedoData = actx.createImageData(size, size);
  const normalData = nctx.createImageData(size, size);
  const roughData = rctx.createImageData(size, size);
  const aoData = aoctx.createImageData(size, size);

  const aBuf = albedoData.data;
  const nBuf = normalData.data;
  const rBuf = roughData.data;
  const aoBuf = aoData.data;

  // 1x1 orthogonal plain weave with micro thread pitch of 8 pixels
  const pitch = 8;
  const halfPitch = pitch / 2;

  // Pre-calculate pseudo-random thread slub shifts
  const slubNoise = new Float32Array(size * 2);
  for (let i = 0; i < slubNoise.length; i++) {
    slubNoise[i] = (Math.sin(i * 0.13) * 0.5 + Math.cos(i * 0.37) * 0.5) * 0.04;
  }

  for (let y = 0; y < size; y++) {
    const threadY = Math.floor(y / halfPitch);
    const inThreadY = (y % halfPitch) / halfPitch; // 0..1
    const shapeY = Math.sin(inThreadY * Math.PI);

    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const threadX = Math.floor(x / halfPitch);
      const inThreadX = (x % halfPitch) / halfPitch; // 0..1
      const shapeX = Math.sin(inThreadX * Math.PI);

      // Over-under plain weave structure
      const isWarpOver = (threadX + threadY) % 2 === 0;

      // Thread height & normal estimation
      let height = 0;
      let dHx = 0;
      let dHy = 0;

      if (isWarpOver) {
        // Warp thread (vertical) is on top
        height = shapeX * 0.8 + 0.2;
        dHx = Math.cos(inThreadX * Math.PI) * 1.2;
        dHy = Math.cos(inThreadY * Math.PI) * 0.2;
      } else {
        // Weft thread (horizontal) is on top
        height = shapeY * 0.8 + 0.2;
        dHx = Math.cos(inThreadX * Math.PI) * 0.2;
        dHy = Math.cos(inThreadY * Math.PI) * 1.2;
      }

      // Yarn slub variance & micro-surface noise
      const microSlub = slubNoise[(x + y) % (size * 2)];
      const yarnNoise = ((Math.sin(x * 1.7 + y * 2.3) + Math.cos(x * 3.1 - y * 1.9)) * 0.5) * 0.03;
      const threadTone = 1.0 + (isWarpOver ? 0.03 : -0.03) + microSlub + yarnNoise;

      // 1. Albedo (base color with subtle thread variance)
      aBuf[idx] = Math.min(255, Math.max(0, Math.round(br * threadTone * 255)));
      aBuf[idx + 1] = Math.min(255, Math.max(0, Math.round(bg * threadTone * 255)));
      aBuf[idx + 2] = Math.min(255, Math.max(0, Math.round(bb * threadTone * 255)));
      aBuf[idx + 3] = 255;

      // 2. Tangent-Space Normal Map: normalize(-dHx, -dHy, 1.0)
      const nx = -dHx * 0.6;
      const ny = -dHy * 0.6;
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      nBuf[idx] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      nBuf[idx + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      nBuf[idx + 2] = Math.round((nz / len) * 255);
      nBuf[idx + 3] = 255;

      // 3. Roughness: Egyptian cotton has matte sheen (roughness ~0.85 with subtle thread variance)
      const roughVal = Math.min(255, Math.max(0, Math.round((0.85 + yarnNoise * 0.8) * 255)));
      rBuf[idx] = roughVal;
      rBuf[idx + 1] = roughVal;
      rBuf[idx + 2] = roughVal;
      rBuf[idx + 3] = 255;

      // 4. Ambient Occlusion: Darkening in thread valleys and intersections
      const crevice = Math.min(shapeX, shapeY);
      const aoVal = Math.round((0.68 + crevice * 0.32) * 255);
      aoBuf[idx] = aoVal;
      aoBuf[idx + 1] = aoVal;
      aoBuf[idx + 2] = aoVal;
      aoBuf[idx + 3] = 255;
    }
  }

  actx.putImageData(albedoData, 0, 0);
  nctx.putImageData(normalData, 0, 0);
  rctx.putImageData(roughData, 0, 0);
  aoctx.putImageData(aoData, 0, 0);

  const maps: FabricPBRMaps = {
    map: new THREE.CanvasTexture(albedoCanvas),
    normalMap: new THREE.CanvasTexture(normalCanvas),
    roughnessMap: new THREE.CanvasTexture(roughCanvas),
    aoMap: new THREE.CanvasTexture(aoCanvas),
  };

  configureTextures(maps, 14, 14);
  textureCache.set(key, maps);
  return maps;
}

/**
 * 2. 14oz Japanese Selvedge Denim:
 * - Diagonal 3x1 twill pattern (~45° twill ridges)
 * - Micro-relief normal bump of steep twill ridges
 * - Subtle wash fade with white weft yarn showing through between indigo warp ribs
 * - High dry-hand tactile roughness (0.90)
 * - Shadowed crevices in twill valleys
 */
export function getDenimPBRTextures(baseColorHex: string, size = 1024): FabricPBRMaps | null {
  const key = `denim_${baseColorHex}_${size}`;
  if (textureCache.has(key)) return textureCache.get(key)!;
  if (typeof document === 'undefined') return null;

  const { r: br, g: bg, b: bb } = hexToRgb(baseColorHex);

  const { canvas: albedoCanvas, ctx: actx } = createCanvas(size);
  const { canvas: normalCanvas, ctx: nctx } = createCanvas(size);
  const { canvas: roughCanvas, ctx: rctx } = createCanvas(size);
  const { canvas: aoCanvas, ctx: aoctx } = createCanvas(size);

  const albedoData = actx.createImageData(size, size);
  const normalData = nctx.createImageData(size, size);
  const roughData = rctx.createImageData(size, size);
  const aoData = aoctx.createImageData(size, size);

  const aBuf = albedoData.data;
  const nBuf = normalData.data;
  const rBuf = roughData.data;
  const aoBuf = aoData.data;

  // Twill repeat period (6 pixels per diagonal twill cord)
  const twillPitch = 6;

  // Weft white thread color (undyed natural ecru cotton showing underneath)
  const weftR = 0.88;
  const weftG = 0.86;
  const weftB = 0.82;

  for (let y = 0; y < size; y++) {
    // Slub cross-streaks (traditional Japanese shuttle loom slub texture)
    const slubY = Math.sin(y * 0.08) * Math.cos(y * 0.02) * 0.08;

    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // 3x1 right-hand twill diagonal coordinate
      const diag = (x + y + Math.floor(y * 0.1)) % twillPitch;
      const twillRatio = diag / twillPitch; // 0..1
      const isRidge = twillRatio < 0.72; // Warp covers 3/4 of surface

      // Ridge profile curve
      const ridgeProfile = Math.sin(twillRatio * Math.PI);
      const normalSlope = Math.cos(twillRatio * Math.PI) * 1.5;

      // Subtle wash fade & ring-spun yarn noise
      const ringSpunNoise = (Math.sin(x * 0.9) * 0.5 + Math.cos(y * 1.1) * 0.5) * 0.05;
      const washFade = 1.0 + slubY + ringSpunNoise;

      // 1. Albedo: Indigo warp on top, ecru white weft in valley
      let finalR = br;
      let finalG = bg;
      let finalB = bb;

      if (!isRidge) {
        // Deep groove reveals white weft cross thread
        const blend = 0.35;
        finalR = br * (1 - blend) + weftR * blend;
        finalG = bg * (1 - blend) + weftG * blend;
        finalB = bb * (1 - blend) + weftB * blend;
      }

      aBuf[idx] = Math.min(255, Math.max(0, Math.round(finalR * washFade * 255)));
      aBuf[idx + 1] = Math.min(255, Math.max(0, Math.round(finalG * washFade * 255)));
      aBuf[idx + 2] = Math.min(255, Math.max(0, Math.round(finalB * washFade * 255)));
      aBuf[idx + 3] = 255;

      // 2. Normal Map: 45° diagonal twill ridges
      // Project slope along 45 degree vector (1/√2, 1/√2)
      const nx = -normalSlope * 0.707 * 0.7;
      const ny = -normalSlope * 0.707 * 0.7;
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      nBuf[idx] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      nBuf[idx + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      nBuf[idx + 2] = Math.round((nz / len) * 255);
      nBuf[idx + 3] = 255;

      // 3. Roughness: Selvedge denim has crisp 0.90 dry roughness
      const roughVal = Math.min(255, Math.max(0, Math.round((0.90 + ringSpunNoise * 0.5) * 255)));
      rBuf[idx] = roughVal;
      rBuf[idx + 1] = roughVal;
      rBuf[idx + 2] = roughVal;
      rBuf[idx + 3] = 255;

      // 4. Ambient Occlusion: Valley crevices have pronounced occlusion
      const aoVal = Math.round((0.62 + ridgeProfile * 0.38) * 255);
      aoBuf[idx] = aoVal;
      aoBuf[idx + 1] = aoVal;
      aoBuf[idx + 2] = aoVal;
      aoBuf[idx + 3] = 255;
    }
  }

  actx.putImageData(albedoData, 0, 0);
  nctx.putImageData(normalData, 0, 0);
  rctx.putImageData(roughData, 0, 0);
  aoctx.putImageData(aoData, 0, 0);

  const maps: FabricPBRMaps = {
    map: new THREE.CanvasTexture(albedoCanvas),
    normalMap: new THREE.CanvasTexture(normalCanvas),
    roughnessMap: new THREE.CanvasTexture(roughCanvas),
    aoMap: new THREE.CanvasTexture(aoCanvas),
  };

  configureTextures(maps, 12, 12);
  textureCache.set(key, maps);
  return maps;
}

/**
 * 3. Full-Grain Italian Calfskin Leather:
 * - Natural pebble grain normal map (organic convex pebble domes with recessed grooves)
 * - Specular coat highlight & subtle leather sheen
 * - Low roughness (0.35 - 0.45) with micro-crevices
 * - High-contrast micro-pore AO in pebble fissures
 */
export function getLeatherPBRTextures(baseColorHex: string, size = 1024): FabricPBRMaps | null {
  const key = `leather_${baseColorHex}_${size}`;
  if (textureCache.has(key)) return textureCache.get(key)!;
  if (typeof document === 'undefined') return null;

  const { r: br, g: bg, b: bb } = hexToRgb(baseColorHex);

  const { canvas: albedoCanvas, ctx: actx } = createCanvas(size);
  const { canvas: normalCanvas, ctx: nctx } = createCanvas(size);
  const { canvas: roughCanvas, ctx: rctx } = createCanvas(size);
  const { canvas: aoCanvas, ctx: aoctx } = createCanvas(size);

  const albedoData = actx.createImageData(size, size);
  const normalData = nctx.createImageData(size, size);
  const roughData = rctx.createImageData(size, size);
  const aoData = aoctx.createImageData(size, size);

  const aBuf = albedoData.data;
  const nBuf = normalData.data;
  const rBuf = roughData.data;
  const aoBuf = aoData.data;

  // Generate organic pebble cellular heightfield using a grid-jittered Voronoi approximation
  const cellSize = 16;
  const gridWidth = Math.ceil(size / cellSize);
  const seedPoints: { x: number; y: number }[] = [];

  // Seed pseudo-random cell centers
  for (let gy = 0; gy < gridWidth; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      const rx = (Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453) % 1;
      const ry = (Math.cos(gx * 93.9898 + gy * 67.345) * 24634.6345) % 1;
      seedPoints.push({
        x: (gx + Math.abs(rx) * 0.7 + 0.15) * cellSize,
        y: (gy + Math.abs(ry) * 0.7 + 0.15) * cellSize,
      });
    }
  }

  // Pre-calculate height map for normal computation
  const heightMap = new Float32Array(size * size);

  for (let y = 0; y < size; y++) {
    const gy = Math.floor(y / cellSize);
    for (let x = 0; x < size; x++) {
      const gx = Math.floor(x / cellSize);

      // Search 3x3 neighboring cells for closest two seeds
      let d1 = 9999;
      let d2 = 9999;

      for (let oy = -1; oy <= 1; oy++) {
        const cy = (gy + oy + gridWidth) % gridWidth;
        for (let ox = -1; ox <= 1; ox++) {
          const cx = (gx + ox + gridWidth) % gridWidth;
          const seed = seedPoints[cy * gridWidth + cx];

          // Euclidean distance with toroidal wrap
          let dx = Math.abs(x - seed.x);
          let dy = Math.abs(y - seed.y);
          if (dx > size * 0.5) dx = size - dx;
          if (dy > size * 0.5) dy = size - dy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < d1) {
            d2 = d1;
            d1 = dist;
          } else if (dist < d2) {
            d2 = dist;
          }
        }
      }

      // Pebble mound profile: rounded convex dome with sharp groove boundary (d2 - d1)
      const edge = Math.min(1.0, Math.max(0.0, (d2 - d1) / (cellSize * 0.35)));
      const dome = Math.sqrt(Math.max(0.0, 1.0 - Math.min(1.0, (d1 / (cellSize * 0.7)) ** 2)));
      const pebbleHeight = dome * edge;

      // Micro pore noise on leather skin
      const poreNoise = (Math.sin(x * 1.5) * Math.cos(y * 1.5)) * 0.04;
      heightMap[y * size + x] = pebbleHeight + poreNoise;
    }
  }

  // Generate maps from height field
  for (let y = 0; y < size; y++) {
    const ym1 = (y - 1 + size) % size;
    const yp1 = (y + 1) % size;

    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const xm1 = (x - 1 + size) % size;
      const xp1 = (x + 1) % size;

      const h = heightMap[y * size + x];
      const hL = heightMap[y * size + xm1];
      const hR = heightMap[y * size + xp1];
      const hT = heightMap[ym1 * size + x];
      const hB = heightMap[yp1 * size + x];

      // Central difference gradients for tangent normal
      const dHx = (hR - hL) * 1.8;
      const dHy = (hB - hT) * 1.8;
      const nx = -dHx;
      const ny = -dHy;
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

      // 1. Albedo: Highlight on pebble apex, richer darker pigment in epidermal fissures
      const tone = 0.94 + h * 0.12;
      aBuf[idx] = Math.min(255, Math.max(0, Math.round(br * tone * 255)));
      aBuf[idx + 1] = Math.min(255, Math.max(0, Math.round(bg * tone * 255)));
      aBuf[idx + 2] = Math.min(255, Math.max(0, Math.round(bb * tone * 255)));
      aBuf[idx + 3] = 255;

      // 2. Normal Map
      nBuf[idx] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      nBuf[idx + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      nBuf[idx + 2] = Math.round((nz / len) * 255);
      nBuf[idx + 3] = 255;

      // 3. Roughness: Italian calfskin is smooth (0.35 on pebble domes, 0.45 in fissures)
      const roughVal = Math.round((0.44 - h * 0.09) * 255);
      rBuf[idx] = roughVal;
      rBuf[idx + 1] = roughVal;
      rBuf[idx + 2] = roughVal;
      rBuf[idx + 3] = 255;

      // 4. Ambient Occlusion: Strong crevice occlusion in grain cracks
      const aoVal = Math.round((0.55 + h * 0.45) * 255);
      aoBuf[idx] = aoVal;
      aoBuf[idx + 1] = aoVal;
      aoBuf[idx + 2] = aoVal;
      aoBuf[idx + 3] = 255;
    }
  }

  actx.putImageData(albedoData, 0, 0);
  nctx.putImageData(normalData, 0, 0);
  rctx.putImageData(roughData, 0, 0);
  aoctx.putImageData(aoData, 0, 0);

  const maps: FabricPBRMaps = {
    map: new THREE.CanvasTexture(albedoCanvas),
    normalMap: new THREE.CanvasTexture(normalCanvas),
    roughnessMap: new THREE.CanvasTexture(roughCanvas),
    aoMap: new THREE.CanvasTexture(aoCanvas),
  };

  configureTextures(maps, 10, 10);
  textureCache.set(key, maps);
  return maps;
}

/**
 * 4. Double-Faced Merino Wool & French Terry:
 * - Knitted rib bump patterns (wale loops & course knit structure)
 * - Velvet edge fuzz effect (Fresnel rim lighting via MeshPhysicalMaterial sheen)
 * - High diffuse roughness (0.88 - 0.92)
 * - Deep inter-loop knit shadow occlusion
 */
export function getWoolPBRTextures(baseColorHex: string, size = 1024): FabricPBRMaps | null {
  const key = `wool_${baseColorHex}_${size}`;
  if (textureCache.has(key)) return textureCache.get(key)!;
  if (typeof document === 'undefined') return null;

  const { r: br, g: bg, b: bb } = hexToRgb(baseColorHex);

  const { canvas: albedoCanvas, ctx: actx } = createCanvas(size);
  const { canvas: normalCanvas, ctx: nctx } = createCanvas(size);
  const { canvas: roughCanvas, ctx: rctx } = createCanvas(size);
  const { canvas: aoCanvas, ctx: aoctx } = createCanvas(size);

  const albedoData = actx.createImageData(size, size);
  const normalData = nctx.createImageData(size, size);
  const roughData = rctx.createImageData(size, size);
  const aoData = aoctx.createImageData(size, size);

  const aBuf = albedoData.data;
  const nBuf = normalData.data;
  const rBuf = roughData.data;
  const aoBuf = aoData.data;

  const ribPitch = 10; // Vertical knit ribs
  const loopPitch = 8; // Course loop height

  for (let y = 0; y < size; y++) {
    const loopY = (y % loopPitch) / loopPitch;
    const vLoop = Math.sin(loopY * Math.PI * 2);

    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const ribX = (x % ribPitch) / ribPitch; // 0..1
      const ribProfile = Math.sin(ribX * Math.PI);
      const ribSlope = Math.cos(ribX * Math.PI) * 1.4;

      // Interlocking V-knit stitch bump
      const stitch = Math.cos((ribX - 0.5) * Math.PI * 2) * vLoop * 0.3;

      // Fluffy wool microfiber fuzz noise
      const fuzzNoise =
        (Math.sin(x * 2.7 + y * 1.9) * 0.5 + Math.cos(x * 1.3 - y * 3.1) * 0.5) * 0.05;

      const totalHeight = Math.max(0.0, ribProfile + stitch + fuzzNoise);

      // 1. Albedo: Soft matte wool fibers with subtle loop shade
      const fiberTone = 0.95 + totalHeight * 0.08 + fuzzNoise;
      aBuf[idx] = Math.min(255, Math.max(0, Math.round(br * fiberTone * 255)));
      aBuf[idx + 1] = Math.min(255, Math.max(0, Math.round(bg * fiberTone * 255)));
      aBuf[idx + 2] = Math.min(255, Math.max(0, Math.round(bb * fiberTone * 255)));
      aBuf[idx + 3] = 255;

      // 2. Normal Map: Ribbed knit wales
      const nx = -ribSlope * 0.65;
      const ny = -vLoop * 0.3;
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      nBuf[idx] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      nBuf[idx + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      nBuf[idx + 2] = Math.round((nz / len) * 255);
      nBuf[idx + 3] = 255;

      // 3. Roughness: Soft diffuse wool (~0.88 - 0.92)
      const roughVal = Math.round((0.89 + fuzzNoise * 0.5) * 255);
      rBuf[idx] = roughVal;
      rBuf[idx + 1] = roughVal;
      rBuf[idx + 2] = roughVal;
      rBuf[idx + 3] = 255;

      // 4. Ambient Occlusion: Deep shadow channels between knit ribs
      const aoVal = Math.round((0.58 + ribProfile * 0.42) * 255);
      aoBuf[idx] = aoVal;
      aoBuf[idx + 1] = aoVal;
      aoBuf[idx + 2] = aoVal;
      aoBuf[idx + 3] = 255;
    }
  }

  actx.putImageData(albedoData, 0, 0);
  nctx.putImageData(normalData, 0, 0);
  rctx.putImageData(roughData, 0, 0);
  aoctx.putImageData(aoData, 0, 0);

  const maps: FabricPBRMaps = {
    map: new THREE.CanvasTexture(albedoCanvas),
    normalMap: new THREE.CanvasTexture(normalCanvas),
    roughnessMap: new THREE.CanvasTexture(roughCanvas),
    aoMap: new THREE.CanvasTexture(aoCanvas),
  };

  configureTextures(maps, 10, 10);
  textureCache.set(key, maps);
  return maps;
}

/**
 * Creates or retrieves a fully configured PBR Three.js Material
 * incorporating fabric-specific physical characteristics:
 * - Italian Leather: MeshPhysicalMaterial with clearcoat & specular highlights
 * - Merino Wool & French Terry: MeshPhysicalMaterial with velvet edge fuzz (Fresnel sheen rim)
 * - Egyptian Cotton: MeshStandardMaterial with orthogonal weave & matte drape
 * - Japanese Selvedge Denim: MeshStandardMaterial with high roughness & diagonal twill normal bump
 */
export function getFabricPBRMaterial(
  fabricType: FabricType,
  baseColorHex: string
): THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial {
  const cacheKey = `mat_${fabricType}_${baseColorHex}`;
  if (materialCache.has(cacheKey)) {
    return materialCache.get(cacheKey)!;
  }

  const baseColor = new THREE.Color(baseColorHex);

  if (fabricType === 'leather') {
    const maps = getLeatherPBRTextures(baseColorHex);
    const mat = new THREE.MeshPhysicalMaterial({
      color: baseColor,
      map: maps?.map,
      normalMap: maps?.normalMap,
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughnessMap: maps?.roughnessMap,
      roughness: 0.4,
      metalness: 0.08,
      aoMap: maps?.aoMap,
      aoMapIntensity: 1.0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.25,
      envMapIntensity: 1.4,
    });
    materialCache.set(cacheKey, mat);
    return mat;
  }

  if (fabricType === 'wool') {
    const maps = getWoolPBRTextures(baseColorHex);
    // Velvet edge fuzz effect using Sheen & Fresnel grazing angles
    const sheenColor = baseColor.clone().offsetHSL(0, 0, 0.15);
    const mat = new THREE.MeshPhysicalMaterial({
      color: baseColor,
      map: maps?.map,
      normalMap: maps?.normalMap,
      normalScale: new THREE.Vector2(0.65, 0.65),
      roughnessMap: maps?.roughnessMap,
      roughness: 0.9,
      metalness: 0.0,
      aoMap: maps?.aoMap,
      aoMapIntensity: 0.85,
      sheen: 1.0,
      sheenColor: sheenColor,
      sheenRoughness: 0.65,
      envMapIntensity: 0.8,
    });
    materialCache.set(cacheKey, mat);
    return mat;
  }

  if (fabricType === 'denim') {
    const maps = getDenimPBRTextures(baseColorHex);
    const mat = new THREE.MeshStandardMaterial({
      color: baseColor,
      map: maps?.map,
      normalMap: maps?.normalMap,
      normalScale: new THREE.Vector2(0.9, 0.9),
      roughnessMap: maps?.roughnessMap,
      roughness: 0.9,
      metalness: 0.0,
      aoMap: maps?.aoMap,
      aoMapIntensity: 0.9,
      envMapIntensity: 0.7,
    });
    materialCache.set(cacheKey, mat);
    return mat;
  }

  // Default: Egyptian Cotton
  const maps = getCottonPBRTextures(baseColorHex);
  const mat = new THREE.MeshStandardMaterial({
    color: baseColor,
    map: maps?.map,
    normalMap: maps?.normalMap,
    normalScale: new THREE.Vector2(0.7, 0.7),
    roughnessMap: maps?.roughnessMap,
    roughness: 0.85,
    metalness: 0.0,
    aoMap: maps?.aoMap,
    aoMapIntensity: 0.8,
    envMapIntensity: 0.9,
  });
  materialCache.set(cacheKey, mat);
  return mat;
}

/**
 * Determine fabric type based on product metadata and category
 */
export function getFabricTypeForProduct(
  category: string,
  materialString?: string,
  productId?: string
): FabricType {
  const mat = (materialString || '').toLowerCase();
  const id = (productId || '').toLowerCase();

  if (mat.includes('leather') || id.includes('leather') || id === 'jacket-003') {
    return 'leather';
  }
  if (mat.includes('denim') || id.includes('denim') || id === 'pants-001') {
    return 'denim';
  }
  if (
    mat.includes('wool') ||
    mat.includes('terry') ||
    mat.includes('fleece') ||
    category === 'hoodies' ||
    id === 'top-002' ||
    id === 'jacket-001'
  ) {
    return 'wool';
  }
  return 'cotton';
}

/**
 * Cleanup helper for zero memory leaks
 */
export function disposeFabricTextures() {
  textureCache.forEach((maps) => {
    maps.map.dispose();
    maps.normalMap.dispose();
    maps.roughnessMap.dispose();
    maps.aoMap.dispose();
  });
  textureCache.clear();

  materialCache.forEach((mat) => {
    mat.dispose();
  });
  materialCache.clear();
}
