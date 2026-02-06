"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Plus,
  LogOut,
  Menu,
  X,
  Store,
  ChevronRight,
} from "lucide-react";

// ============================================================================
// Navigation Configuration
// ============================================================================

const NAV_ITEMS = [
  {
    href: "/vendor",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/vendor/products",
    label: "Products",
    icon: Package,
  },
  {
    href: "/vendor/orders",
    label: "Orders",
    icon: ShoppingCart,
  },
];

// ============================================================================
// Types
// ============================================================================

interface VendorLayoutProps {
  children: React.ReactNode;
}

// ============================================================================
// Vendor Layout Component
// ============================================================================

export default function VendorLayout({ children }: VendorLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, isAuthenticated, logout } = useAuthStore();

  const [isMounted, setIsMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ============================================================================
  // Authentication Check
  // ============================================================================

  useEffect(() => {
    setIsMounted(true);

    // Check authentication after mount
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push("/login?redirect=/vendor");
        return;
      }

      // Check if user is a vendor
      if (user && user.role !== "vendor" && user.role !== "admin") {
        router.push("/");
        return;
      }

      setIsCheckingAuth(false);
    };

    // Small delay to ensure auth store is hydrated
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // ============================================================================
  // Loading State
  // ============================================================================

  if (!isMounted || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
            Loading Vendor Portal...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <Link href="/vendor" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Store className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                Vendor
              </h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Portal
              </p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-black text-sm">
              {user?.name?.charAt(0).toUpperCase() || "V"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {user?.name || "Vendor"}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                {user?.role || "vendor"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={18} />
                {item.label}
                {isActive && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Add Product Button */}
        <div className="p-4">
          <Link
            href="/vendor/products/add"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-accent/30"
          >
            <Plus size={16} />
            Add Product
          </Link>
        </div>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-500">
              <Link
                href="/vendor"
                className="hover:text-primary transition-colors uppercase tracking-wider"
              >
                Vendor
              </Link>
              <span>/</span>
              <span className="text-gray-900 uppercase tracking-wider">
                {NAV_ITEMS.find((item) => item.href === pathname)?.label || "Dashboard"}
              </span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-wider"
              >
                <Store size={16} />
                Visit Store
              </Link>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-black text-gray-600">
                  {user?.name?.charAt(0).toUpperCase() || "V"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
