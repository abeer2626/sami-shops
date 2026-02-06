import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// Types
// ============================================================================

/**
 * Product snapshot captured at the time of adding to cart.
 * This preserves the price even if the product price changes later.
 */
export interface ProductSnapshot {
  id: string;
  name: string;
  price: number;  // Price at time of adding (snapshot)
  image: string;
  category?: string;
}

/**
 * Cart item with quantity and product snapshot.
 */
export interface CartItem {
  product: ProductSnapshot;
  quantity: number;
  addedAt: string;  // ISO timestamp for ordering/analytics
}

/**
 * Computed cart statistics.
 */
export interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

/**
 * Cart store state and actions.
 */
interface CartStore {
  // State
  items: CartItem[];
  isHydrated: boolean;

  // Actions
  addItem: (product: ProductSnapshot, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  clearCart: () => void;
  setHydrated: () => void;

  // Selectors (computed values)
  getItems: () => CartItem[];
  getItemById: (productId: string) => CartItem | undefined;
  getItemCount: () => number;
  getItemCountById: (productId: string) => number;
  getSubtotal: () => number;
  getTotalPrice: () => number;
  getSummary: (taxRate?: number, shippingCost?: number) => CartSummary;
  hasItem: (productId: string) => boolean;
  isEmpty: () => boolean;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TAX_RATE = 0.18;  // 18% tax
const FREE_SHIPPING_THRESHOLD = 5000;  // Free shipping over Rs. 5000
const DEFAULT_SHIPPING_COST = 299;  // Rs. 299 shipping

// ============================================================================
// Storage Configuration
// ============================================================================

/**
 * Safe localStorage implementation that works with SSR.
 */
const storage = typeof window !== 'undefined'
  ? createJSONStorage(() => localStorage)
  : {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };

// ============================================================================
// Cart Store
// ============================================================================

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial State
      items: [],
      isHydrated: false,

      // Hydration
      setHydrated: () => set({ isHydrated: true }),

      // Add item to cart
      addItem: (product, quantity = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.product.id === product.id);

        if (existingItem) {
          // Update quantity if item exists
          set({
            items: currentItems.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          // Add new item
          const newItem: CartItem = {
            product,
            quantity,
            addedAt: new Date().toISOString(),
          };
          set({ items: [...currentItems, newItem] });
        }
      },

      // Remove item from cart
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.product.id !== productId) });
      },

      // Update item quantity
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      // Increment item quantity by 1
      incrementItem: (productId) => {
        const currentItems = get().items;
        const item = currentItems.find((i) => i.product.id === productId);

        if (item) {
          get().updateQuantity(productId, item.quantity + 1);
        }
      },

      // Decrement item quantity by 1
      decrementItem: (productId) => {
        const currentItems = get().items;
        const item = currentItems.find((i) => i.product.id === productId);

        if (item) {
          get().updateQuantity(productId, Math.max(1, item.quantity - 1));
        }
      },

      // Clear all items
      clearCart: () => set({ items: [] }),

      // Selectors

      getItems: () => get().items,

      getItemById: (productId) => {
        return get().items.find((item) => item.product.id === productId);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getItemCountById: (productId) => {
        const item = get().getItemById(productId);
        return item?.quantity || 0;
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },

      getTotalPrice: () => {
        const subtotal = get().getSubtotal();
        const summary = get().getSummary();
        return summary.total;
      },

      getSummary: (taxRate = DEFAULT_TAX_RATE, shippingCost) => {
        const subtotal = get().getSubtotal();

        // Calculate shipping (free over threshold)
        const finalShipping =
          shippingCost !== undefined
            ? shippingCost
            : subtotal >= FREE_SHIPPING_THRESHOLD
            ? 0
            : DEFAULT_SHIPPING_COST;

        // Calculate tax
        const tax = subtotal * taxRate;

        // Calculate total
        const total = subtotal + tax + finalShipping;
        const itemCount = get().getItemCount();

        return {
          subtotal,
          tax: Math.round(tax),
          shipping: finalShipping,
          total: Math.round(total),
          itemCount,
        };
      },

      hasItem: (productId) => {
        return get().items.some((item) => item.product.id === productId);
      },

      isEmpty: () => {
        return get().items.length === 0;
      },
    }),
    {
      name: 'samishops-cart-storage',
      storage,
      // Only persist the items array
      partialize: (state) => ({
        items: state.items,
      }),
      // Handle hydration for SSR
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

// ============================================================================
// Hooks for Specific Selectors (optimized re-renders)
// ============================================================================

/**
 * Hook to get cart items - only re-renders when items change.
 */
export const useCartItems = () => useCart((state) => state.items);

/**
 * Hook to get total item count - only re-renders when count changes.
 */
export const useCartItemCount = () => useCart((state) => state.getItemCount());

/**
 * Hook to get cart summary - only re-renders when summary changes.
 */
export const useCartSummary = (
  taxRate?: number,
  shippingCost?: number
) => useCart((state) => state.getSummary(taxRate, shippingCost));

/**
 * Hook to check if cart is empty.
 */
export const useCartIsEmpty = () => useCart((state) => state.isEmpty());

/**
 * Hook to check if product is in cart.
 */
export const useHasCartItem = (productId: string) =>
  useCart((state) => state.hasItem(productId));

/**
 * Hook to get quantity of a specific product.
 */
export const useCartItemQuantity = (productId: string) =>
  useCart((state) => state.getItemCountById(productId));

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format price for display (e.g., "Rs. 1,234").
 */
export const formatPrice = (price: number): string => {
  return `Rs. ${price.toLocaleString()}`;
};

/**
 * Calculate discount percentage.
 */
export const calculateDiscount = (originalPrice: number, salePrice: number): number => {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

/**
 * Check if shipping is free based on cart subtotal.
 */
export const isFreeShipping = (subtotal: number, threshold = FREE_SHIPPING_THRESHOLD): boolean => {
  return subtotal >= threshold;
};

/**
 * Get remaining amount for free shipping.
 */
export const getFreeShippingRemaining = (
  subtotal: number,
  threshold = FREE_SHIPPING_THRESHOLD
): number => {
  return Math.max(0, threshold - subtotal);
};
