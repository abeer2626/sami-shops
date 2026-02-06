/**
 * Centralized API Service Layer for SamiShops
 *
 * Provides type-safe functions for all API interactions with the backend.
 * Uses native fetch with proper error handling and authentication.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============================================================================
// Types
// ============================================================================

export interface ApiError {
    message: string;
    status?: number;
    details?: unknown;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    stock: number;
    created_at?: string;
    updated_at?: string;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    slug?: string;
}

export interface ProductFilters {
    category?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    sort_by?: 'name' | 'price' | 'created_at';
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    full_name?: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user?: User;
}

export interface User {
    id: string;
    username: string;
    email: string;
    full_name?: string;
    is_active?: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

// ============================================================================
// API Error Handling
// ============================================================================

class ApiRequestError extends Error implements ApiError {
    status: number;
    details?: unknown;

    constructor(message: string, status: number, details?: unknown) {
        super(message);
        this.name = 'ApiRequestError';
        this.status = status;
        this.details = details;
    }
}

/**
 * Handles non-OK HTTP responses by throwing an ApiRequestError
 */
async function handleResponse(response: Response): Promise<unknown> {
    if (response.ok) {
        return response.json().catch(() => null);
    }

    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let details: unknown = undefined;

    try {
        const data = await response.json();
        details = data;

        // Extract error message from common API response formats
        if (typeof data === 'string') {
            errorMessage = data;
        } else if (data.detail) {
            errorMessage = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
        } else if (data.message) {
            errorMessage = data.message;
        } else if (data.error) {
            errorMessage = data.error;
        }
    } catch {
        // If parsing fails, use the status text
    }

    throw new ApiRequestError(errorMessage, response.status, details);
}

// ============================================================================
// Base Fetch Function
// ============================================================================

/**
 * Wrapper around native fetch with consistent error handling,
 * JSON serialization, and optional authentication
 */
async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const token = typeof window !== 'undefined'
        ? localStorage.getItem('access_token')
        : null;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add Authorization header if token exists and not explicitly overridden
    if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        return (await handleResponse(response)) as T;
    } catch (error) {
        if (error instanceof ApiRequestError) {
            throw error;
        }

        // Handle network errors, JSON parsing errors, etc.
        if (error instanceof Error) {
            throw new ApiRequestError(
                error.message,
                0,
                { originalError: error.name }
            );
        }

        throw new ApiRequestError(
            'An unknown error occurred',
            0,
            { error }
        );
    }
}

// ============================================================================
// Product API
// ============================================================================

/**
 * Fetch products with optional filters
 */
export async function getProducts(
    filters?: ProductFilters
): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();

    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        });
    }

    const queryString = params.toString();
    const endpoint = `/api/products${queryString ? `?${queryString}` : ''}`;

    return fetchApi<PaginatedResponse<Product>>(endpoint);
}

/**
 * Fetch a single product by ID
 */
export async function getProductById(id: string): Promise<Product> {
    return fetchApi<Product>(`/api/products/${id}`);
}

// ============================================================================
// Category API
// ============================================================================

/**
 * Fetch all categories
 */
export async function getCategories(): Promise<Category[]> {
    return fetchApi<Category[]>('/api/categories');
}

/**
 * Fetch a single category by ID
 */
export async function getCategoryById(id: string): Promise<Category> {
    return fetchApi<Category>(`/api/categories/${id}`);
}

/**
 * Fetch products in a specific category
 */
export async function getProductsByCategory(
    categoryId: string,
    filters?: Omit<ProductFilters, 'category'>
): Promise<PaginatedResponse<Product>> {
    return getProducts({ ...filters, category: categoryId });
}

// ============================================================================
// Auth API
// ============================================================================

/**
 * Authenticate user with username/email and password
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
    return fetchApi<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
}

/**
 * Register a new user account
 */
export async function registerUser(data: RegisterData): Promise<AuthResponse> {
    return fetchApi<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Fetch the currently authenticated user's profile
 */
export async function getCurrentUser(token?: string): Promise<User> {
    const headers: RequestInit = {};

    // If token is provided, use it instead of localStorage
    if (token) {
        headers.headers = {
            'Authorization': `Bearer ${token}`,
        };
    }

    return fetchApi<User>('/api/auth/me', headers);
}

/**
 * Log out the current user (client-side only)
 *
 * Note: This only removes the token from localStorage.
 * JWT tokens are stateless and cannot be invalidated server-side
 * without additional implementation (token blacklist, etc.).
 */
export function logoutUser(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
    }
}

/**
 * Store the authentication token
 */
export function setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', token);
    }
}

/**
 * Retrieve the stored authentication token
 */
export function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('access_token');
    }
    return null;
}

/**
 * Check if a user is authenticated
 */
export function isAuthenticated(): boolean {
    return getAuthToken() !== null;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
    return (
        error instanceof ApiRequestError ||
        (typeof error === 'object' && error !== null && 'message' in error)
    );
}

/**
 * Get a user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
    if (isApiError(error)) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
}
