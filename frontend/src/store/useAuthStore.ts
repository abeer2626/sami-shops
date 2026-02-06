import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthStore {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

const storage = typeof window !== 'undefined'
    ? createJSONStorage(() => localStorage)
    : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
    };

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            setAuth: (user, token) => set({ user, token }),
            logout: () => set({ user: null, token: null }),
            isAuthenticated: () => !!get().token,
        }),
        {
            name: 'samishops-auth-storage',
            storage,
        }
    )
);
