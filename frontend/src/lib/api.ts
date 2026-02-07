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
    role: string;
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
// Flash Sale Types
// ============================================================================

export interface FlashSaleProduct {
    id: string;
    flashSaleId: string;
    productId: string;
    salePrice: number;
    discountPercent: number;
    maxQuantity?: number;
    soldCount: number;
    product: Product;
}

export interface FlashSale {
    id: string;
    name: string;
    description?: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    products?: FlashSaleProduct[];
    createdAt: string;
    updatedAt: string;
    timeRemaining?: number; // Seconds remaining
}

export interface FlashSaleList {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    productCount: number;
    timeRemaining?: number;
}

export interface ProductFlashPrice {
    inFlashSale: boolean;
    salePrice?: number;
    originalPrice?: number;
    discountPercent?: number;
    timeRemaining?: number;
    maxQuantity?: number;
    soldCount?: number;
}

// ============================================================================
// Product Reviews & Ratings Types
// ============================================================================

export interface Review {
    id: string;
    userId: string;
    productId: string;
    rating: number;
    title?: string;
    comment: string;
    isVerified: boolean;
    helpful: number;
    images: string[];
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        name?: string;
        email: string;
    };
}

export interface ReviewWithUser extends Review {
    user: {
        id: string;
        name?: string;
        email: string;
    };
}

export interface ReviewSummary {
    productId: string;
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        "5": number;
        "4": number;
        "3": number;
        "2": number;
        "1": number;
    };
}

export interface ReviewCreate {
    productId: string;
    rating: number;
    title?: string;
    comment: string;
}

export interface ReviewUpdate {
    rating?: number;
    title?: string;
    comment?: string;
}

// ============================================================================
// Order Tracking Types
// ============================================================================

export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    product?: Product;
}

export interface Order {
    id: string;
    userId: string;
    totalAmount: number;
    status: OrderStatus;
    paymentStatus: string;
    paymentProvider?: string;
    paymentReference?: string;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
    estimatedDelivery?: string;
    trackingNumber?: string;
    shippingCarrier?: string;
    shippingAddress?: string;
    billingAddress?: string;
    notes?: string;
}

export interface OrderStatusHistory {
    id: string;
    orderId: string;
    status: OrderStatus;
    changedBy?: string;
    notes?: string;
    createdAt: string;
}

export interface OrderTracking {
    order: Order;
    statusHistory: OrderStatusHistory[];
    currentStep: number;
    estimatedDelivery?: string;
    trackingNumber?: string;
    shippingCarrier?: string;
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

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if token exists and not explicitly overridden
    if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Create a timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s default timeout

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            signal: options.signal || controller.signal,
        });

        clearTimeout(timeoutId);
        return (await handleResponse(response)) as T;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiRequestError('Request timed out after 10 seconds', 0, { timeout: true });
        }

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
// Order API
// ============================================================================

export interface CreateOrderItem {
    productId: string;
    quantity: number;
    price: number;
}

export interface CreateOrderData {
    userId: string;
    totalAmount: number;
    status: 'pending';
    paymentStatus: 'pending' | 'paid';
    paymentProvider?: string;
    items: CreateOrderItem[];
}

/**
 * Create a new order
 */
export async function createOrder(data: CreateOrderData): Promise<unknown> {
    return fetchApi('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// ============================================================================
// Vendor API
// ============================================================================

export async function getVendorProducts(): Promise<Product[]> {
    return fetchApi<Product[]>('/api/v1/vendor/products');
}

export async function getVendorOrders(): Promise<unknown[]> {
    return fetchApi<unknown[]>('/api/v1/vendor/orders');
}

export async function getVendorReports(): Promise<unknown> {
    return fetchApi<unknown>('/api/v1/vendor/reports');
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
    return fetchApi<Product>('/api/v1/products', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return fetchApi<Product>(`/api/v1/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function deleteProduct(id: string): Promise<void> {
    return fetchApi<void>(`/api/v1/products/${id}`, {
        method: 'DELETE',
    });
}

// ============================================================================
// Admin API
// ============================================================================

export async function getAdminOverview(): Promise<unknown> {
    return fetchApi<unknown>('/api/v1/admin/overview');
}

export async function getAdminUsers(): Promise<User[]> {
    return fetchApi<User[]>('/api/v1/admin/users');
}

export async function deleteUser(id: string): Promise<void> {
    return fetchApi<void>(`/api/v1/admin/users/${id}`, {
        method: 'DELETE',
    });
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
    return fetchApi<Category>('/api/v1/categories', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function deleteCategory(id: string): Promise<void> {
    return fetchApi<void>(`/api/v1/categories/${id}`, {
        method: 'DELETE',
    });
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

/**
 * Change password for the current user
 */
export async function changePassword(data: { current_password: string; new_password: string }): Promise<{ message: string }> {
    return fetchApi<{ message: string }>('/api/auth/password', {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

// ============================================================================
// Super Admin API
// ============================================================================

export interface SuperAdminStatusResponse {
    isSuperAdmin: boolean;
    email: string;
    designatedSuperAdmin: string;
    message?: string;
    capabilities?: string[];
}

/**
 * Check if the current user is the SUPER ADMIN
 */
export async function getSuperAdminStatus(): Promise<SuperAdminStatusResponse> {
    return fetchApi<SuperAdminStatusResponse>('/api/auth/super-admin/status');
}

/**
 * SUPER ADMIN ONLY: Reset super admin password
 */
export async function superAdminResetPassword(data: { current_password: string; new_password: string }): Promise<{
    message: string;
    email: string;
    timestamp: string;
}> {
    return fetchApi<{
        message: string;
        email: string;
        timestamp: string;
    }>('/api/auth/super-admin/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// ============================================================================
// Flash Sale API
// ============================================================================

/**
 * Get all flash sales (optionally filtered by active status)
 */
export async function getFlashSales(activeOnly: boolean = true): Promise<FlashSaleList[]> {
    return fetchApi<FlashSaleList[]>(`/api/v1/flash-sales?active_only=${activeOnly}`);
}

/**
 * Get a single flash sale by ID with full product details
 */
export async function getFlashSale(saleId: string): Promise<FlashSale> {
    return fetchApi<FlashSale>(`/api/v1/flash-sales/${saleId}`);
}

/**
 * Get the currently active flash sale
 */
export async function getActiveFlashSale(): Promise<FlashSale> {
    return fetchApi<FlashSale>('/api/v1/flash-sales/active');
}

/**
 * Get flash sale price for a product
 */
export async function getProductFlashPrice(productId: string): Promise<ProductFlashPrice> {
    return fetchApi<ProductFlashPrice>(`/api/v1/products/${productId}/flash-price`);
}

/**
 * Create a new flash sale (Admin only)
 */
export async function createFlashSale(data: {
    name: string;
    description?: string;
    startTime: string;
    endTime: string;
    isActive?: boolean;
    products: Array<{
        productId: string;
        salePrice: number;
        discountPercent: number;
        maxQuantity?: number;
    }>;
}): Promise<FlashSale> {
    return fetchApi<FlashSale>('/api/v1/admin/flash-sales', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Update a flash sale (Admin only)
 */
export async function updateFlashSale(
    saleId: string,
    data: {
        name?: string;
        description?: string;
        startTime?: string;
        endTime?: string;
        isActive?: boolean;
    }
): Promise<FlashSale> {
    return fetchApi<FlashSale>(`/api/v1/admin/flash-sales/${saleId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a flash sale (Admin only)
 */
export async function deleteFlashSale(saleId: string): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/api/v1/admin/flash-sales/${saleId}`, {
        method: 'DELETE',
    });
}

// ============================================================================
// Search API
// ============================================================================

export interface SearchSuggestion {
    id: string;
    type: 'product' | 'category' | 'brand';
    title: string;
    subtitle?: string;
    image?: string;
    url: string;
}

export interface SearchAutocomplete {
    query: string;
    suggestions: string[];
    categories: Array<{
        id: string;
        name: string;
        slug: string;
        type: string;
    }>;
    products: Array<{
        id: string;
        name: string;
        price: number;
        image?: string;
        category?: string;
        type: string;
    }>;
}

export interface SearchResult {
    products: Product[];
    categories: Category[];
    suggestions: SearchSuggestion[];
    total: number;
    page: number;
    limit: number;
}

export interface SearchFilters {
    query?: string;
    category_id?: string;
    min_price?: number;
    max_price?: number;
    sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
    page?: number;
    limit?: number;
}

/**
 * Get search autocomplete suggestions
 */
export async function getSearchAutocomplete(query: string, limit: number = 5): Promise<SearchAutocomplete> {
    if (!query || query.trim().length < 2) {
        return {
            query: '',
            suggestions: [],
            categories: [],
            products: []
        };
    }

    return fetchApi<SearchAutocomplete>(
        `/api/v1/search/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`
    );
}

/**
 * Full search with filters
 */
export async function searchProducts(filters: SearchFilters): Promise<SearchResult> {
    const params = new URLSearchParams();

    if (filters.query) {
        params.append('q', filters.query);
    }
    if (filters.category_id) {
        params.append('category_id', filters.category_id);
    }
    if (filters.min_price) {
        params.append('min_price', filters.min_price.toString());
    }
    if (filters.max_price) {
        params.append('max_price', filters.max_price.toString());
    }
    if (filters.sort) {
        params.append('sort', filters.sort);
    }
    params.append('page', (filters.page || 1).toString());
    params.append('limit', (filters.limit || 20).toString());

    return fetchApi<SearchResult>(`/api/v1/search?${params.toString()}`);
}

// ============================================================================
// Product Reviews & Ratings API
// ============================================================================

/**
 * Get review summary for a product
 */
export async function getProductReviews(productId: string): Promise<ReviewSummary> {
    return fetchApi<ReviewSummary>(`/api/v1/products/${productId}/reviews`);
}

/**
 * Get paginated list of reviews for a product
 */
export async function getProductReviewsList(
    productId: string,
    page: number = 1,
    limit: number = 10,
    sort: "recent" | "helpful" = "recent"
): Promise<ReviewWithUser[]> {
    return fetchApi<ReviewWithUser[]>(
        `/api/v1/products/${productId}/reviews/list?page=${page}&limit=${limit}&sort=${sort}`
    );
}

/**
 * Create a new review
 */
export async function createReview(data: ReviewCreate): Promise<Review> {
    return fetchApi<Review>(`/api/v1/products/${data.productId}/reviews`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/**
 * Update an existing review
 */
export async function updateReview(reviewId: string, data: ReviewUpdate): Promise<Review> {
    return fetchApi<Review>(`/api/v1/reviews/${reviewId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/api/v1/reviews/${reviewId}`, {
        method: "DELETE",
    });
}

/**
 * Mark a review as helpful
 */
export async function markReviewHelpful(reviewId: string): Promise<{ helpful: number }> {
    return fetchApi<{ helpful: number }>(`/api/v1/reviews/${reviewId}/helpful`, {
        method: "POST",
    });
}

// ============================================================================
// Order Tracking API
// ============================================================================

/**
 * Get detailed order tracking information
 */
export async function getOrderTracking(orderId: string): Promise<OrderTracking> {
    return fetchApi<OrderTracking>(`/api/v1/orders/${orderId}/tracking`);
}

/**
 * Get order status history
 */
export async function getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    return fetchApi<OrderStatusHistory[]>(`/api/v1/orders/${orderId}/history`);
}

/**
 * Get current user's orders
 */
export async function getUserOrders(status?: OrderStatus, limit: number = 20, skip: number = 0): Promise<Order[]> {
    let endpoint = `/api/v1/user/orders?limit=${limit}&skip=${skip}`;
    if (status) {
        endpoint += `&status=${status}`;
    }
    return fetchApi<Order[]>(endpoint);
}

/**
 * Update order status (admin/vendor)
 */
export async function updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    notes?: string,
    trackingNumber?: string,
    shippingCarrier?: string,
    estimatedDelivery?: string
): Promise<Order> {
    return fetchApi<Order>(`/api/v1/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
            status,
            notes,
            trackingNumber,
            shippingCarrier,
            estimatedDelivery,
        }),
    });
}

/**
 * Mark order as paid (admin)
 */
export async function markOrderPaid(
    orderId: string,
    paymentProvider?: string,
    paymentReference?: string
): Promise<Order> {
    return fetchApi<Order>(`/api/v1/orders/${orderId}/mark-paid`, {
        method: "PATCH",
        body: JSON.stringify({
            paymentProvider: paymentProvider || "local",
            paymentReference,
        }),
    });
}

/**
 * Get vendor pending orders
 */
export async function getVendorPendingOrders(): Promise<Order[]> {
    return fetchApi<Order[]>("/api/v1/vendor/orders/pending");
}

// ============================================================================
// Vendor Commission API
// ============================================================================

export interface VendorEarning {
    id: string;
    storeId: string;
    orderId: string;
    orderAmount: number;
    commissionRate: number;
    commissionAmount: number;
    vendorAmount: number;
    status: "pending" | "available" | "paid";
    createdAt: string;
    updatedAt: string;
}

export interface VendorEarningSummary {
    totalEarnings: number;
    availableBalance: number;
    pendingEarnings: number;
    paidAmount: number;
    totalOrders: number;
    recentEarnings: VendorEarning[];
}

export interface VendorPayout {
    id: string;
    storeId: string;
    amount: number;
    status: "pending" | "processing" | "completed" | "rejected" | "failed";
    paymentMethod?: string;
    paymentDetails?: string;
    transactionId?: string;
    requestedBy: string;
    processedBy?: string;
    notes?: string;
    rejectionReason?: string;
    requestedAt: string;
    processedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Commission {
    id: string;
    name: string;
    rate: number;
    description?: string;
    isActive: boolean;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CommissionSettings {
    defaultRate: number;
    activeCommissions: Commission[];
}

/**
 * Get vendor earnings summary
 */
export async function getVendorEarnings(): Promise<VendorEarningSummary> {
    return fetchApi<VendorEarningSummary>("/api/v1/vendor/earnings");
}

/**
 * Get vendor earnings history
 */
export async function getVendorEarningsHistory(
    status?: string,
    limit: number = 50,
    skip: number = 0
): Promise<VendorEarning[]> {
    let endpoint = `/api/v1/vendor/earnings/history?limit=${limit}&skip=${skip}`;
    if (status) {
        endpoint += `&status=${status}`;
    }
    return fetchApi<VendorEarning[]>(endpoint);
}

/**
 * Request a payout
 */
export async function requestPayout(data: {
    amount: number;
    paymentMethod?: string;
    paymentDetails?: string;
    notes?: string;
}): Promise<VendorPayout> {
    return fetchApi<VendorPayout>("/api/v1/vendor/payouts", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/**
 * Get vendor payout requests
 */
export async function getVendorPayouts(
    status?: string,
    limit: number = 50,
    skip: number = 0
): Promise<VendorPayout[]> {
    let endpoint = `/api/v1/vendor/payouts?limit=${limit}&skip=${skip}`;
    if (status) {
        endpoint += `&status=${status}`;
    }
    return fetchApi<VendorPayout[]>(endpoint);
}

/**
 * Get all payout requests (admin)
 */
export async function getAllPayouts(
    status?: string,
    limit: number = 50,
    skip: number = 0
): Promise<VendorPayout[]> {
    let endpoint = `/api/v1/admin/payouts?limit=${limit}&skip=${skip}`;
    if (status) {
        endpoint += `&status=${status}`;
    }
    return fetchApi<VendorPayout[]>(endpoint);
}

/**
 * Process a payout request (admin)
 */
export async function processPayout(
    payoutId: string,
    data: {
        status: string;
        processedBy: string;
        transactionId?: string;
        rejectionReason?: string;
    }
): Promise<VendorPayout> {
    return fetchApi<VendorPayout>(`/api/v1/admin/payouts/${payoutId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

/**
 * Get commission settings (admin)
 */
export async function getCommissionSettings(): Promise<CommissionSettings> {
    return fetchApi<CommissionSettings>("/api/v1/admin/commissions");
}

/**
 * Create a commission rate (admin)
 */
export async function createCommission(data: {
    name: string;
    rate: number;
    description?: string;
    isActive?: boolean;
    isDefault?: boolean;
}): Promise<Commission> {
    return fetchApi<Commission>("/api/v1/admin/commissions", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/**
 * Update a commission rate (admin)
 */
export async function updateCommission(
    commissionId: string,
    data: {
        name?: string;
        rate?: number;
        description?: string;
        isActive?: boolean;
        isDefault?: boolean;
    }
): Promise<Commission> {
    return fetchApi<Commission>(`/api/v1/admin/commissions/${commissionId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

/**
 * Delete a commission rate (admin)
 */
export async function deleteCommission(commissionId: string): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/api/v1/admin/commissions/${commissionId}`, {
        method: "DELETE",
    });
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
