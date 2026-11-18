import axios from 'axios';
import { products, Product, getProductById } from '@/data/products';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3500,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token if saved
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('wardrobe_token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  featured?: boolean;
}

export interface OrderPayload {
  items: Array<{
    id: string;
    name: string;
    price: number;
    size: string;
    color: string;
    quantity: number;
    image: string;
    category: string;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  paymentInfo?: {
    method: string;
    cardNumber?: string;
  };
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  promoCode?: string;
}

export interface SavedLookPayload {
  name: string;
  items: Array<{ category: string; productId: string; color: string }>;
  lightingPreset?: string;
  thumbnail?: string;
  isPublic?: boolean;
}

/**
 * Check backend connection status
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await api.get('/health', { timeout: 1500 });
    return res.data?.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Fetch product catalog with filtering, sorting and search
 * Robust fallback to in-memory client dataset if API is unreachable
 */
export async function fetchProducts(
  filters: ProductFilters = {}
): Promise<{ count: number; products: Product[]; isLive: boolean }> {
  try {
    const params: Record<string, any> = {};
    if (filters.category) params.category = filters.category;
    if (filters.search) params.search = filters.search;
    if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
    if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
    if (filters.sort) params.sort = filters.sort;
    if (filters.featured !== undefined) params.featured = filters.featured;

    const res = await api.get('/products', { params });
    if (res.data?.products && Array.isArray(res.data.products)) {
      return {
        count: res.data.count || res.data.products.length,
        products: res.data.products,
        isLive: true,
      };
    }
    throw new Error('Invalid API response');
  } catch (err) {
    // Client-side fallback with exact filter match
    let list = [...products];

    if (filters.category) {
      list = list.filter((p) => p.category === filters.category);
    }
    if (filters.featured) {
      list = list.filter((p) => p.isFeatured);
    }
    if (filters.minPrice !== undefined) {
      list = list.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== Infinity) {
      list = list.filter((p) => p.price <= filters.maxPrice!);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q)
      );
    }

    if (filters.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (filters.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (filters.sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (filters.sort === 'newest') list.sort((a, b) => (a.isNew ? -1 : 1));
    else list.sort((a, b) => (a.isFeatured ? -1 : 1));

    return {
      count: list.length,
      products: list,
      isLive: false,
    };
  }
}

/**
 * Fetch single product details by ID or slug
 */
export async function fetchProductById(
  id: string
): Promise<{ product: Product | null; isLive: boolean }> {
  try {
    const res = await api.get(`/products/${id}`);
    if (res.data && res.data.id) {
      return { product: res.data, isLive: true };
    }
    throw new Error('Product not found in API');
  } catch {
    const local = getProductById(id) || null;
    return { product: local, isLive: false };
  }
}

/**
 * Submit checkout order to backend API
 */
export async function createOrder(
  payload: OrderPayload
): Promise<{ success: boolean; orderNumber: string; order: any; isLive: boolean }> {
  try {
    const res = await api.post('/orders', payload);
    const order = res.data?.order || res.data;
    return {
      success: true,
      orderNumber: order.orderNumber || 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      order,
      isLive: true,
    };
  } catch (err) {
    // Generate valid client confirmation order fallback
    const fallbackNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const fallbackOrder = {
      _id: 'ord-' + Date.now(),
      orderNumber: fallbackNumber,
      items: payload.items,
      shippingAddress: payload.shippingAddress,
      subtotal: payload.subtotal,
      shippingCost: payload.shippingCost,
      tax: payload.tax,
      total: payload.total,
      status: 'processing',
      createdAt: new Date().toISOString(),
    };
    return {
      success: true,
      orderNumber: fallbackNumber,
      order: fallbackOrder,
      isLive: false,
    };
  }
}

/**
 * Fetch all user orders
 */
export async function fetchOrders(): Promise<{ orders: any[]; isLive: boolean }> {
  try {
    const res = await api.get('/orders');
    return { orders: Array.isArray(res.data) ? res.data : [], isLive: true };
  } catch {
    return { orders: [], isLive: false };
  }
}

/**
 * Save new 3D outfit combination
 */
export async function saveLookApi(
  payload: SavedLookPayload
): Promise<{ look: any; isLive: boolean }> {
  try {
    const res = await api.post('/looks', payload);
    return { look: res.data, isLive: true };
  } catch {
    const fallback = {
      _id: 'look-' + Date.now(),
      id: Date.now().toString(),
      name: payload.name,
      items: payload.items,
      lightingPreset: payload.lightingPreset || 'daylight',
      createdAt: new Date().toISOString(),
    };
    return { look: fallback, isLive: false };
  }
}

/**
 * Fetch saved 3D looks
 */
export async function fetchSavedLooks(): Promise<{ looks: any[]; isLive: boolean }> {
  try {
    const res = await api.get('/looks');
    return { looks: Array.isArray(res.data) ? res.data : [], isLive: true };
  } catch {
    return { looks: [], isLive: false };
  }
}

/**
 * Delete a saved 3D look
 */
export async function deleteLookApi(id: string): Promise<boolean> {
  try {
    await api.delete(`/looks/${id}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * User Login
 */
export async function loginApi(credentials: {
  email: string;
  password: string;
}): Promise<{ token: string; user: { name: string; email: string }; isLive: boolean }> {
  try {
    const res = await api.post('/auth/login', credentials);
    const { token, user } = res.data;
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem('wardrobe_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return {
      token,
      user: {
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
      },
      isLive: true,
    };
  } catch {
    // Offline simulated demo login
    const name = credentials.email.split('@')[0];
    const capitalName = name.charAt(0).toUpperCase() + name.slice(1);
    return {
      token: 'demo-token-' + Date.now(),
      user: {
        name: `${capitalName} (VIP Client)`,
        email: credentials.email,
      },
      isLive: false,
    };
  }
}

/**
 * User Registration
 */
export async function registerApi(userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{ token: string; user: { name: string; email: string }; isLive: boolean }> {
  try {
    const res = await api.post('/auth/register', userData);
    const { token, user } = res.data;
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem('wardrobe_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return {
      token,
      user: {
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
      },
      isLive: true,
    };
  } catch {
    return {
      token: 'demo-token-' + Date.now(),
      user: {
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        email: userData.email,
      },
      isLive: false,
    };
  }
}

export default api;
