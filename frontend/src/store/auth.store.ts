/**
 * Global Authentication Store
 *
 * Zustand store for managing authentication state with FastAPI JWT backend.
 * Provides actions for login, logout, and token persistence.
 */

import { create } from 'zustand';
import type { User, LoginCredentials, RegisterData } from '@/lib/api';
import { loginUser as apiLogin, registerUser as apiRegister, getCurrentUser, isApiError } from '@/lib/api';

// ============================================================================
// Types
// ============================================================================

interface AuthState {
    // State
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    hydrateFromLocalStorage: () => Promise<void>;
    clearError: () => void;
    setUser: (user: User | null) => void;
}

// ============================================================================
// Constants
// ============================================================================

const TOKEN_STORAGE_KEY = 'access_token';

// ============================================================================
// Store Implementation
// ============================================================================

/**
 * Helper to store token in localStorage (client-side only)
 */
function storeToken(token: string | null): void {
    if (typeof window === 'undefined') return;

    if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
}

/**
 * Helper to retrieve token from localStorage (client-side only)
 */
function getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Clear all auth data from localStorage
 */
function clearStoredAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export const useAuthStore = create<AuthState>((set, get) => ({
    // -------------------------------------------------------------------------
    // Initial State
    // -------------------------------------------------------------------------
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    // -------------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------------

    /**
     * Authenticate user with credentials
     * Stores JWT token and user profile on success
     */
    login: async (credentials: LoginCredentials): Promise<void> => {
        set({ isLoading: true, error: null });

        try {
            const response = await apiLogin(credentials);

            // Store token and update state
            storeToken(response.access_token);
            set({
                token: response.access_token,
                user: response.user || null,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

            // If user not in response, fetch it separately
            if (!response.user) {
                try {
                    const user = await getCurrentUser(response.access_token);
                    set({ user });
                } catch {
                    // Token is valid but user fetch failed - continue anyway
                }
            }
        } catch (error) {
            const message = isApiError(error) ? error.message : 'Login failed';
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: message,
            });
            throw error;
        }
    },

    /**
     * Register a new user account
     * Automatically logs in after successful registration
     */
    register: async (data: RegisterData): Promise<void> => {
        set({ isLoading: true, error: null });

        try {
            const response = await apiRegister(data);

            // Store token and update state
            storeToken(response.access_token);
            set({
                token: response.access_token,
                user: response.user || null,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

            // If user not in response, fetch it separately
            if (!response.user) {
                try {
                    const user = await getCurrentUser(response.access_token);
                    set({ user });
                } catch {
                    // Token is valid but user fetch failed - continue anyway
                }
            }
        } catch (error) {
            const message = isApiError(error) ? error.message : 'Registration failed';
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: message,
            });
            throw error;
        }
    },

    /**
     * Log out the current user
     * Clears token, user data, and localStorage
     */
    logout: (): void => {
        clearStoredAuth();
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
        });
    },

    /**
     * Hydrate auth state from localStorage on app initialization
     * Validates stored token by fetching current user
     * Auto-logs out if token is invalid or expired
     */
    hydrateFromLocalStorage: async (): Promise<void> => {
        const storedToken = getStoredToken();

        if (!storedToken) {
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
            return;
        }

        set({ isLoading: true });

        try {
            // Validate token by fetching current user
            const user = await getCurrentUser(storedToken);

            set({
                user,
                token: storedToken,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            // Token is invalid or expired - clear auth data
            clearStoredAuth();
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    },

    /**
     * Clear the current error state
     */
    clearError: (): void => {
        set({ error: null });
    },

    /**
     * Manually set user state
     * Useful for updates to user profile without re-authenticating
     */
    setUser: (user: User | null): void => {
        set({ user });
    },
}));

// ============================================================================
// Selectors (for optimized component re-renders)
// ============================================================================

/**
 * Select just the user object
 */
export const selectUser = (state: AuthState) => state.user;

/**
 * Select authentication status
 */
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;

/**
 * Select loading state
 */
export const selectIsLoading = (state: AuthState) => state.isLoading;

/**
 * Select current error message
 */
export const selectError = (state: AuthState) => state.error;

/**
 * Select auth actions
 */
export const selectAuthActions = (state: AuthState) => ({
    login: state.login,
    register: state.register,
    logout: state.logout,
    hydrateFromLocalStorage: state.hydrateFromLocalStorage,
    clearError: state.clearError,
});

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to get just the authenticated user
 * Components using this won't re-render on loading/error changes
 */
export function useAuthUser(): User | null {
    return useAuthStore(selectUser);
}

/**
 * Hook to get just authentication status
 */
export function useIsAuthenticated(): boolean {
    return useAuthStore(selectIsAuthenticated);
}

/**
 * Hook to get auth actions
 */
export function useAuthActions() {
    return useAuthStore(selectAuthActions);
}
