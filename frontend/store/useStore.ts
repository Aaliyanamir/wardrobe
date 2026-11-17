import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
  category: string;
}

export interface SavedLook {
  id: string;
  name: string;
  items: { category: string; productId: string; color: string }[];
  createdAt: string;
}

export interface StoreState {
  // Cart
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  cartTotal: () => number;
  cartCount: () => number;

  // Try-On Studio
  selectedCategory: string;
  selectedProducts: Record<string, string>; // category -> productId
  selectedColors: Record<string, string>;
  selectedSizes: Record<string, string>;
  lightingPreset: 'daylight' | 'warm' | 'evening';
  cameraPreset: 'full' | 'upper' | 'closeup';
  isSwapping: boolean;
  setSelectedCategory: (cat: string) => void;
  setSelectedProduct: (category: string, productId: string) => void;
  setSelectedColor: (category: string, color: string) => void;
  setSelectedSize: (category: string, size: string) => void;
  setLightingPreset: (preset: 'daylight' | 'warm' | 'evening') => void;
  setCameraPreset: (preset: 'full' | 'upper' | 'closeup') => void;
  setIsSwapping: (swapping: boolean) => void;

  // Saved Looks
  savedLooks: SavedLook[];
  saveLook: (name: string) => void;
  deleteLook: (id: string) => void;
  loadLook: (look: SavedLook) => void;

  // User
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  setUser: (user: { name: string; email: string } | null) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Cart State
      cartItems: [],
      isCartOpen: false,

      addToCart: (item) =>
        set((state) => {
          const existing = state.cartItems.find(
            (i) => i.id === item.id && i.size === item.size
          );
          if (existing) {
            return {
              cartItems: state.cartItems.map((i) =>
                i.id === item.id && i.size === item.size
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { cartItems: [...state.cartItems, { ...item, quantity: 1 }] };
        }),

      removeFromCart: (id, size) =>
        set((state) => ({
          cartItems: state.cartItems.filter(
            (i) => !(i.id === id && i.size === size)
          ),
        })),

      updateQuantity: (id, size, quantity) =>
        set((state) => ({
          cartItems:
            quantity <= 0
              ? state.cartItems.filter(
                  (i) => !(i.id === id && i.size === size)
                )
              : state.cartItems.map((i) =>
                  i.id === id && i.size === size ? { ...i, quantity } : i
                ),
        })),

      clearCart: () => set({ cartItems: [] }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      setCartOpen: (open) => set({ isCartOpen: open }),

      cartTotal: () =>
        get().cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),

      cartCount: () =>
        get().cartItems.reduce((sum, item) => sum + item.quantity, 0),

      // Try-On Studio State
      selectedCategory: 'tops',
      selectedProducts: {},
      selectedColors: {},
      selectedSizes: { tops: 'M', hoodies: 'M', jackets: 'M', pants: 'M' },
      lightingPreset: 'daylight',
      cameraPreset: 'full',
      isSwapping: false,

      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      setSelectedProduct: (category, productId) =>
        set((state) => ({
          selectedProducts: { ...state.selectedProducts, [category]: productId },
          isSwapping: true,
        })),
      setSelectedColor: (category, color) =>
        set((state) => ({
          selectedColors: { ...state.selectedColors, [category]: color },
          isSwapping: true,
        })),
      setSelectedSize: (category, size) =>
        set((state) => ({
          selectedSizes: { ...state.selectedSizes, [category]: size },
          isSwapping: true,
        })),
      setLightingPreset: (preset) => set({ lightingPreset: preset }),
      setCameraPreset: (preset) => set({ cameraPreset: preset }),
      setIsSwapping: (swapping) => set({ isSwapping: swapping }),

      // Saved Looks
      savedLooks: [],
      saveLook: (name) => {
        const state = get();
        const look: SavedLook = {
          id: Date.now().toString(),
          name,
          items: Object.entries(state.selectedProducts).map(
            ([category, productId]) => ({
              category,
              productId,
              color: state.selectedColors[category] || '',
            })
          ),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ savedLooks: [...s.savedLooks, look] }));
      },
      deleteLook: (id) =>
        set((state) => ({
          savedLooks: state.savedLooks.filter((l) => l.id !== id),
        })),
      loadLook: (look) => {
        const products: Record<string, string> = {};
        const colors: Record<string, string> = {};
        look.items.forEach((item) => {
          products[item.category] = item.productId;
          colors[item.category] = item.color;
        });
        set({ selectedProducts: products, selectedColors: colors });
      },

      // User State
      isAuthenticated: false,
      user: null,
      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),
    }),
    {
      name: 'wardrobe-store',
      partialize: (state) => ({
        cartItems: state.cartItems,
        savedLooks: state.savedLooks,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
