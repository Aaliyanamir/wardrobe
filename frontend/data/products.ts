export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: 'tops' | 'hoodies' | 'jackets' | 'pants';
  colors: { name: string; hex: string }[];
  sizes: string[];
  description: string;
  material: string;
  images: string[];
  modelUrl?: string;
  textureUrl?: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

export const products: Product[] = [
  // TOPS - HERO CAROUSEL HIGHLIGHTS (MATCHING REFERENCE)
  {
    id: 'top-linen-shirt',
    name: 'Linen Shirt',
    brand: 'VARDE',
    price: 129,
    category: 'tops',
    colors: [
      { name: 'Sky Blue', hex: '#7EAECE' },
      { name: 'Chalk White', hex: '#F5F5F0' },
      { name: 'Mint', hex: '#A2C5AC' },
      { name: 'Sand', hex: '#C4A882' },
      { name: 'Charcoal', hex: '#3C3C3C' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'Woven from fine European flax linen with a featherlight drape and breathable structure. Finished with mother-of-pearl buttons and tailored French cuffs.',
    material: '100% Normandy Flax Linen, 140gsm',
    images: [
      '/images/products/top-linen-shirt.jpg',
    ],
    tags: ['linen', 'summer', 'essential', 'relaxed'],
    rating: 4.9,
    reviewCount: 342,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 'top-ringer-tee',
    name: 'Ringer Tee',
    brand: 'VARDE',
    price: 75,
    category: 'tops',
    colors: [
      { name: 'Chalk White', hex: '#F5F5F0' },
      { name: 'Cream', hex: '#F2EDE4' },
      { name: 'Onyx', hex: '#2A2A2A' },
      { name: 'Forest', hex: '#3D5A43' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'Vintage athletic silhouette cut in 260gsm combed cotton jersey. Accented with contrast micro-rib collar and sleeve bindings.',
    material: '100% Combed Heavyweight Cotton Jersey',
    images: [
      '/images/products/top-ringer-tee.jpg',
    ],
    tags: ['tshirt', 'ringer', 'vintage', 'classic'],
    rating: 4.8,
    reviewCount: 198,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 'hoodie-grey',
    name: 'Grey Hoodie',
    brand: 'VARDE',
    price: 89,
    category: 'hoodies',
    colors: [
      { name: 'Heather Grey', hex: '#B4B9C0' },
      { name: 'Stone', hex: '#9E9183' },
      { name: 'Midnight', hex: '#1A1A2E' },
      { name: 'Carbon', hex: '#2C2C2C' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    description:
      'Crafted from 450gsm double-knit French terry cotton. Features dropped shoulders, clean double-layered hood, and ribbed side gussets.',
    material: '100% Supima French Terry Cotton, 450gsm',
    images: [
      '/images/products/hoodie-grey.jpg',
    ],
    tags: ['hoodie', 'terry', 'supima', 'streetwear'],
    rating: 4.9,
    reviewCount: 512,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 'top-001',
    name: 'Oversized Cotton Poplin Shirt',
    brand: 'VARDE',
    price: 185,
    category: 'tops',
    colors: [
      { name: 'Chalk White', hex: '#F5F5F0' },
      { name: 'Slate Blue', hex: '#6B7FA3' },
      { name: 'Sand', hex: '#C4A882' },
      { name: 'Onyx', hex: '#2A2A2A' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'Elevated oversized silhouette crafted from 100% long-staple Egyptian cotton. Features a relaxed dropped shoulder, French seams, and mother-of-pearl buttons. The ideal canvas for modern dressing.',
    material: '100% Egyptian Cotton, 160gsm',
    images: [
      '/images/products/top-001.jpg',
    ],
    tags: ['cotton', 'oversized', 'classic', 'versatile'],
    rating: 4.8,
    reviewCount: 234,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 'top-002',
    name: 'Ribbed Merino Wool Turtleneck',
    brand: 'VARDE',
    price: 245,
    category: 'tops',
    colors: [
      { name: 'Cream', hex: '#F2EDE4' },
      { name: 'Charcoal', hex: '#3C3C3C' },
      { name: 'Forest', hex: '#3D5A43' },
      { name: 'Rust', hex: '#B05A30' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'Lightweight ribbed turtleneck in superfine 18.5-micron Merino wool. Temperature-regulating and naturally moisture-wicking. A wardrobe cornerstone.',
    material: '100% Merino Wool, 18.5 Micron',
    images: [
      '/images/products/top-002.jpg',
    ],
    tags: ['merino', 'wool', 'turtleneck', 'winter'],
    rating: 4.9,
    reviewCount: 189,
    isFeatured: true,
  },
  {
    id: 'top-003',
    name: 'Linen Relaxed Fit Shirt',
    brand: 'VARDE',
    price: 160,
    category: 'tops',
    colors: [
      { name: 'Natural', hex: '#D4C5A9' },
      { name: 'Marine', hex: '#354F6E' },
      { name: 'Sage', hex: '#8A9E8C' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    description:
      'Stonewashed Belgian linen shirt with relaxed proportions. Naturally wrinkled texture improves with every wash. Versatile enough for studio to dinner.',
    material: '100% Belgian Linen',
    images: [
      '/images/products/top-003.jpg',
    ],
    tags: ['linen', 'summer', 'relaxed', 'casual'],
    rating: 4.7,
    reviewCount: 156,
  },

  // HOODIES
  {
    id: 'hoodie-001',
    name: 'Heavyweight French Terry Hoodie',
    brand: 'VARDE',
    price: 295,
    category: 'hoodies',
    colors: [
      { name: 'Stone', hex: '#9E9183' },
      { name: 'Midnight', hex: '#1A1A2E' },
      { name: 'Ash', hex: '#B2B2B2' },
      { name: 'Earth', hex: '#6B4F3A' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    description:
      'Garment-dyed in 480gsm premium French terry. Oversized boxy silhouette with ribbed cuffs. Pre-shrunk and broken-in for immediate comfort.',
    material: '100% Supima Cotton French Terry, 480gsm',
    images: [
      '/images/products/hoodie-001.jpg',
    ],
    tags: ['heavyweight', 'cotton', 'oversized', 'comfort'],
    rating: 4.9,
    reviewCount: 412,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 'hoodie-002',
    name: 'Fleece-Lined Zip-Up',
    brand: 'VARDE',
    price: 275,
    category: 'hoodies',
    colors: [
      { name: 'Carbon', hex: '#2C2C2C' },
      { name: 'Cream', hex: '#EDEBE3' },
      { name: 'Navy', hex: '#1B2951' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'Precision-engineered zip-up with brushed-fleece interior. Full-length YKK zipper and minimal branding. The modern uniform.',
    material: '80% Cotton, 20% Recycled Polyester',
    images: [
      '/images/products/hoodie-002.jpg',
    ],
    tags: ['fleece', 'zip-up', 'minimal', 'layering'],
    rating: 4.6,
    reviewCount: 203,
  },

  // JACKETS
  {
    id: 'jacket-001',
    name: 'Double-Faced Wool Blazer',
    brand: 'VARDE',
    price: 695,
    originalPrice: 895,
    category: 'jackets',
    colors: [
      { name: 'Camel', hex: '#C19A6B' },
      { name: 'Charcoal', hex: '#3A3A3A' },
      { name: 'Ivory', hex: '#FFFFF0' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'Structured blazer in Italian double-faced wool. Unlined for a clean interior finish. Notch lapels, flap pockets, and a single back vent. Atelier-quality construction.',
    material: '100% Italian Wool, Double-Faced',
    images: [
      '/images/products/jacket-001.jpg',
    ],
    tags: ['wool', 'blazer', 'formal', 'Italian'],
    rating: 4.9,
    reviewCount: 98,
    isFeatured: true,
  },
  {
    id: 'jacket-002',
    name: 'Technical Nylon Shell Jacket',
    brand: 'VARDE',
    price: 445,
    category: 'jackets',
    colors: [
      { name: 'Graphite', hex: '#4A4A4A' },
      { name: 'Moss', hex: '#5B6B44' },
      { name: 'Black', hex: '#111111' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    description:
      'Windproof and water-resistant shell in Japanese 40D nylon ripstop. Minimal seam-taping, hidden zip placket, and adjustable hems.',
    material: '100% Japanese Nylon Ripstop, DWR Finish',
    images: [
      '/images/products/jacket-002.jpg',
    ],
    tags: ['technical', 'nylon', 'weather-resistant', 'outdoor'],
    rating: 4.7,
    reviewCount: 167,
    isNew: true,
  },
  {
    id: 'jacket-003',
    name: 'Leather Moto Jacket',
    brand: 'VARDE',
    price: 1250,
    category: 'jackets',
    colors: [
      { name: 'Black', hex: '#111111' },
      { name: 'Whiskey', hex: '#8B5E3C' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'Full-grain Italian vegetable-tanned leather moto jacket. Asymmetric zip, quilted lining, and antique brass hardware. Ages beautifully with wear.',
    material: '100% Full-Grain Italian Calfskin',
    images: [
      '/images/products/jacket-003.jpg',
    ],
    tags: ['leather', 'moto', 'luxury', 'investment'],
    rating: 5.0,
    reviewCount: 54,
    isFeatured: true,
  },

  // PANTS
  {
    id: 'pants-001',
    name: 'Wide-Leg Japanese Denim',
    brand: 'VARDE',
    price: 345,
    category: 'pants',
    colors: [
      { name: 'Raw Indigo', hex: '#2C3A6B' },
      { name: 'Washed Black', hex: '#2A2A2A' },
      { name: 'Stone Wash', hex: '#8090A8' },
    ],
    sizes: ['26', '27', '28', '29', '30', '31', '32', '34'],
    description:
      'Wide-leg cut in 14oz selvedge Japanese denim from Kojima, Japan. Relaxed through the thigh with a clean hem. The considered jean.',
    material: '100% Japanese Selvedge Denim, 14oz',
    images: [
      '/images/products/pants-001.jpg',
    ],
    tags: ['denim', 'selvedge', 'wide-leg', 'Japanese'],
    rating: 4.8,
    reviewCount: 321,
    isFeatured: true,
  },
  {
    id: 'pants-002',
    name: 'Relaxed Wool Trouser',
    brand: 'VARDE',
    price: 395,
    category: 'pants',
    colors: [
      { name: 'Chalk', hex: '#E8E0D5' },
      { name: 'Slate', hex: '#5A6476' },
      { name: 'Black', hex: '#111111' },
      { name: 'Khaki', hex: '#B5A58A' },
    ],
    sizes: ['28', '30', '32', '34', '36'],
    description:
      'Pleated wool-blend trouser with a relaxed high-rise silhouette. Tonal button closures and deep side pockets. Office to evening.',
    material: '70% Wool, 30% Recycled Polyester',
    images: [
      '/images/products/pants-002.jpg',
    ],
    tags: ['wool', 'trouser', 'pleated', 'formal'],
    rating: 4.7,
    reviewCount: 145,
  },
  {
    id: 'pants-003',
    name: 'Cargo Track Pant',
    brand: 'VARDE',
    price: 225,
    category: 'pants',
    colors: [
      { name: 'Carbon', hex: '#2C2C2C' },
      { name: 'Olive', hex: '#6B7051' },
      { name: 'Navy', hex: '#1B2951' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    description:
      'Technical utility pant in stretch nylon. Utility pockets, drawstring waist, and a tapered leg. Designed for movement and style.',
    material: '88% Nylon, 12% Spandex',
    images: [
      '/images/products/pants-003.jpg',
    ],
    tags: ['cargo', 'technical', 'utility', 'sporty'],
    rating: 4.6,
    reviewCount: 198,
    isNew: true,
  },
];

export const lookbooks = [
  {
    id: 'look-001',
    name: 'The Clean Studio',
    season: 'SS 2025',
    description: 'Effortless minimalism for the considered wardrobe.',
    image: '/images/lookbooks/look-001.jpg',
    items: [
      { category: 'tops', productId: 'top-001', color: 'Chalk White' },
      { category: 'pants', productId: 'pants-001', color: 'Raw Indigo' },
      { category: 'jackets', productId: 'jacket-001', color: 'Camel' },
    ],
  },
  {
    id: 'look-002',
    name: 'Urban Utility',
    season: 'FW 2025',
    description: 'Technical precision meets refined street sensibility.',
    image: '/images/lookbooks/look-002.jpg',
    items: [
      { category: 'hoodies', productId: 'hoodie-001', color: 'Midnight' },
      { category: 'pants', productId: 'pants-003', color: 'Carbon' },
      { category: 'jackets', productId: 'jacket-002', color: 'Graphite' },
    ],
  },
  {
    id: 'look-003',
    name: 'The Evening Edit',
    season: 'FW 2025',
    description: 'Sophisticated darkness for after-hours occasions.',
    image: '/images/lookbooks/look-003.jpg',
    items: [
      { category: 'tops', productId: 'top-002', color: 'Charcoal' },
      { category: 'pants', productId: 'pants-002', color: 'Black' },
      { category: 'jackets', productId: 'jacket-003', color: 'Black' },
    ],
  },
  {
    id: 'look-004',
    name: 'Soft Volume',
    season: 'SS 2025',
    description: 'Generous proportions in natural materials.',
    image: '/images/lookbooks/look-004.jpg',
    items: [
      { category: 'tops', productId: 'top-003', color: 'Natural' },
      { category: 'pants', productId: 'pants-002', color: 'Chalk' },
      { category: 'hoodies', productId: 'hoodie-002', color: 'Cream' },
    ],
  },
];

const categoryDefinitions = [
  { id: 'tops', label: 'Tops' },
  { id: 'hoodies', label: 'Hoodies' },
  { id: 'jackets', label: 'Jackets' },
  { id: 'pants', label: 'Pants' },
] as const;

export const categories = categoryDefinitions.map(({ id, label }) => ({
  id,
  label,
  count: products.filter((product) => product.category === id).length,
}));

export const getProductById = (id: string) =>
  products.find((p) => p.id === id);

export const getProductsByCategory = (category: string) =>
  products.filter((p) => p.category === category);

export const getFeaturedProducts = () =>
  products.filter((p) => p.isFeatured);
