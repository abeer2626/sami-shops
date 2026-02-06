import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

const storage = typeof window !== 'undefined'
    ? createJSONStorage(() => localStorage)
    : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
    };

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((i) => i.id === item.id);

                if (existingItem) {
                    set({
                        items: currentItems.map((i) =>
                            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
                        ),
                    });
                } else {
                    set({ items: [...currentItems, item] });
                }
            },
            removeItem: (id) => {
                set({ items: get().items.filter((i) => i.id !== id) });
            },
            updateQuantity: (id, quantity) => {
                set({
                    items: get().items.map((i) =>
                        i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
            getTotalPrice: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        }),
        {
            name: 'samishops-cart-storage',
            storage,
        }
    )
);
