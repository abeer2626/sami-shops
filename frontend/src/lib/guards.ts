"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

// ============================================================================
// Types
// ============================================================================

export type UserRole = "customer" | "vendor" | "admin";

export interface GuardOptions {
  redirectTo?: string;
  requireAllRoles?: boolean;
}

// ============================================================================
// Auth Store Hook
// ============================================================================

/**
 * Hook to get current user and loading state from auth store
 */
const useAuth = () => {
  const { user, token, loading } = useAuthStore();
  return { user, token, loading };
};

// ============================================================================
// Guard Functions
// ============================================================================

/**
 * Admin-only route guard
 * Redirects to home if user is not authenticated or does not have admin role
 *
 * @param options - Guard configuration options
 * @param options.redirectTo - Path to redirect unauthorized users (default: "/")
 * @param options.requireAuth - Whether to require authentication (default: true)
 *
 * @example
 * ```tsx
 * useAdminGuard();
 * // or with custom redirect
 * useAdminGuard({ redirectTo: "/unauthorized" });
 * ```
 */
export const useAdminGuard = (options: GuardOptions = {}) => {
  const { redirectTo = "/", requireAuth = true } = options;
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Not authenticated
    if (requireAuth && (!user || !user.id)) {
      router.push(redirectTo);
      return;
    }

    // Not admin
    if (user?.role !== "admin") {
      router.push(redirectTo);
      return;
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  return {
    isAuthorized: !loading && user?.role === "admin",
    isLoading: loading,
    user,
  };
};

/**
 * Vendor-only route guard
 * Redirects to home if user is not authenticated or does not have vendor role
 *
 * @param options - Guard configuration options
 *
 * @example
 * ```tsx
 * useVendorGuard();
 * ```
 */
export const useVendorGuard = (options: GuardOptions = {}) => {
  const { redirectTo = "/" } = options;
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Not authenticated
    if (!user || !user.id) {
      router.push(redirectTo);
      return;
    }

    // Not vendor or admin
    if (user.role !== "vendor" && user.role !== "admin") {
      router.push(redirectTo);
      return;
    }
  }, [user, loading, redirectTo, router]);

  return {
    isAuthorized: !loading && (user?.role === "vendor" || user?.role === "admin"),
    isLoading: loading,
    user,
  };
};

/**
 * Customer-only route guard
 * Redirects to home if user is not authenticated
 *
 * @param options - Guard configuration options
 *
 * @example
 * ```tsx
 * useCustomerGuard();
 * ```
 */
export const useCustomerGuard = (options: GuardOptions = {}) => {
  const { redirectTo = "/" } = options;
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Not authenticated
    if (!user || !user.id) {
      router.push(redirectTo);
      return;
    }
  }, [user, loading, redirectTo, router]);

  return {
    isAuthorized: !loading && !!user?.id,
    isLoading: loading,
    user,
  };
};

/**
 * Generic role-based guard
 * Protects routes for specific roles
 *
 * @param allowedRoles - Array of roles that can access the route
 * @param options - Guard configuration options
 * @param options.requireAllRoles - If true, user must have ALL roles (default: false - any role)
 *
 * @example
 * ```tsx
 * // Allow admin OR vendor
 * useRoleGuard(["admin", "vendor"]);
 *
 * // Allow ONLY admin
 * useRoleGuard(["admin"]);
 *
 * // With custom redirect
 * useRoleGuard(["admin"], { redirectTo: "/403" });
 * ```
 */
export const useRoleGuard = (
  allowedRoles: UserRole[],
  options: GuardOptions = {}
) => {
  const {
    redirectTo = "/",
    requireAllRoles = false,
  } = options;
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Not authenticated
    if (!user || !user.id) {
      router.push(redirectTo);
      return;
    }

    const userRole = user.role as UserRole;

    if (requireAllRoles) {
      // User must have ALL specified roles (not typically used for single role systems)
      const hasAllRoles = allowedRoles.every((role) => role === userRole);
      if (!hasAllRoles) {
        router.push(redirectTo);
        return;
      }
    } else {
      // User must have AT LEAST ONE of the specified roles
      const hasAccess = allowedRoles.includes(userRole);
      if (!hasAccess) {
        router.push(redirectTo);
        return;
      }
    }
  }, [user, loading, allowedRoles, requireAllRoles, redirectTo, router]);

  const userRole = user?.role as UserRole | undefined;
  const hasAccess = userRole ? allowedRoles.includes(userRole) : false;

  return {
    isAuthorized: !loading && hasAccess,
    isLoading: loading,
    user,
    userRole,
  };
};

/**
 * Authentication guard (logged in only)
 * Redirects to login if user is not authenticated
 *
 * @param options - Guard configuration options
 *
 * @example
 * ```tsx
 * useAuthGuard();
 * ```
 */
export const useAuthGuard = (options: GuardOptions = {}) => {
  const { redirectTo = "/auth/login" } = options;
  const router = useRouter();
  const { user, loading, token } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user || !user.id || !token) {
      router.push(redirectTo);
      return;
    }
  }, [user, loading, token, redirectTo, router]);

  return {
    isAuthorized: !loading && !!user?.id && !!token,
    isLoading: loading,
    user,
  };
};

/**
 * Guest-only guard (not logged in)
 * Redirects authenticated users away (e.g., from login/register pages)
 *
 * @param options - Guard configuration options
 * @param options.redirectTo - Path to redirect authenticated users (default: "/")
 *
 * @example
 * ```tsx
 * useGuestGuard({ redirectTo: "/dashboard" });
 * ```
 */
export const useGuestGuard = (options: GuardOptions = {}) => {
  const { redirectTo = "/" } = options;
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Already authenticated - redirect away
    if (user && user.id) {
      router.push(redirectTo);
      return;
    }
  }, [user, loading, redirectTo, router]);

  return {
    isAuthorized: !loading && !user?.id,
    isLoading: loading,
    user,
  };
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a user has a specific role
 * @param user - User object with role property
 * @param role - Role to check
 */
export const hasRole = (user: { role?: string } | null, role: UserRole): boolean => {
  return user?.role === role;
};

/**
 * Check if a user has any of the specified roles
 * @param user - User object with role property
 * @param roles - Array of roles to check
 */
export const hasAnyRole = (user: { role?: string } | null, roles: UserRole[]): boolean => {
  if (!user?.role) return false;
  return roles.includes(user.role as UserRole);
};

/**
 * Check if user is an admin
 * @param user - User object with role property
 */
export const isAdmin = (user: { role?: string } | null): boolean => {
  return hasRole(user, "admin");
};

/**
 * Check if user is a vendor
 * @param user - User object with role property
 */
export const isVendor = (user: { role?: string } | null): boolean => {
  return hasRole(user, "vendor");
};

/**
 * Check if user is a customer
 * @param user - User object with role property
 */
export const isCustomer = (user: { role?: string } | null): boolean => {
  return hasRole(user, "customer");
};
