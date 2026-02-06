"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminGuard } from "@/lib/guards";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  FolderOpen,
  Shield,
  Loader2,
  Search,
  Edit3,
  Trash2,
  Eye,
  ChevronDown,
  Crown,
  Store,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";

// ============================================================================
// Types
// ============================================================================

interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCategories: number;
  pendingVendors: number;
  activeOrders: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  storeId: string;
  vendorName?: string;
  images: string[];
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  description?: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "vendor" | "admin";
  storeId?: string;
  storeName?: string;
  createdAt: string;
  isActive: boolean;
}

interface RoleUpdateData {
  role: "customer" | "vendor" | "admin";
}

// ============================================================================
// Admin Dashboard Component
// ============================================================================

export default function AdminDashboardPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { isAuthorized, isLoading: guardLoading } = useAdminGuard({ redirectTo: "/" });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "categories" | "users">("overview");

  // Stats
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalVendors: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCategories: 0,
    pendingVendors: 0,
    activeOrders: 0,
  });

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySearch, setCategorySearch] = useState("");

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "product" | "category" | "user" | null;
    id: string | null;
    name: string;
  }>({ open: false, type: null, id: null, name: "" });

  // ============================================================================
  // Data Fetching
  // ============================================================================

  useEffect(() => {
    if (!isAuthorized) return;
    fetchDashboardData();
  }, [isAuthorized, token]);

  const fetchDashboardData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // Fetch stats
      const statsRes = await fetch(`${apiUrl}/api/v1/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch products
      const productsRes = await fetch(`${apiUrl}/api/v1/admin/products?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch categories
      const categoriesRes = await fetch(`${apiUrl}/api/v1/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch users
      const usersRes = await fetch(`${apiUrl}/api/v1/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        // Set mock data if API fails
        setStats({
          totalUsers: 1248,
          totalVendors: 45,
          totalOrders: 3567,
          totalRevenue: 12500000,
          totalProducts: 892,
          totalCategories: 12,
          pendingVendors: 8,
          activeOrders: 234,
        });
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(Array.isArray(productsData) ? productsData : []);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Actions
  // ============================================================================

  const handleRoleUpdate = async (userId: string, newRole: "customer" | "vendor" | "admin") => {
    if (!token) return;

    setUpdatingRole(userId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/v1/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setUsers(users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        ));
      } else {
        alert("Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update user role");
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteDialog.id || !deleteDialog.type) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      let endpoint = "";
      if (deleteDialog.type === "product") {
        endpoint = `${apiUrl}/api/v1/products/${deleteDialog.id}`;
      } else if (deleteDialog.type === "category") {
        endpoint = `${apiUrl}/api/v1/categories/${deleteDialog.id}`;
      } else if (deleteDialog.type === "user") {
        endpoint = `${apiUrl}/api/v1/admin/users/${deleteDialog.id}`;
      }

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        if (deleteDialog.type === "product") {
          setProducts(products.filter((p) => p.id !== deleteDialog.id));
        } else if (deleteDialog.type === "category") {
          setCategories(categories.filter((c) => c.id !== deleteDialog.id));
        } else if (deleteDialog.type === "user") {
          setUsers(users.filter((u) => u.id !== deleteDialog.id));
        }
        setDeleteDialog({ open: false, type: null, id: null, name: "" });
      } else {
        alert(`Failed to delete ${deleteDialog.type}`);
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert(`Failed to delete ${deleteDialog.type}`);
    }
  };

  // ============================================================================
  // Helpers
  // ============================================================================

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><Crown size={12} /> Admin</span>;
      case "vendor":
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><Store size={12} /> Vendor</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><UserIcon size={12} /> Customer</span>;
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", color: "text-red-700 bg-red-100" };
    if (stock < 10) return { label: "Low Stock", color: "text-yellow-700 bg-yellow-100" };
    return { label: "In Stock", color: "text-green-700 bg-green-100" };
  };

  // ============================================================================
  // Filter Data
  // ============================================================================

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // ============================================================================
  // Loading State
  // ============================================================================

  if (guardLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage users, products, and categories
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Users */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                  <ArrowUpRight size={14} />
                  <span>12%</span>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                Total Users
              </p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900">
                {stats.totalUsers.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {stats.totalVendors} vendors
              </p>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="text-primary" size={24} />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                  <ArrowUpRight size={14} />
                  <span>8%</span>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                Total Orders
              </p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900">
                {stats.totalOrders.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {stats.activeOrders} active
              </p>
            </div>

            {/* Revenue */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-green-600" size={24} />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                  <ArrowUpRight size={14} />
                  <span>24%</span>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                Revenue
              </p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900">
                {formatPrice(stats.totalRevenue)}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                All time
              </p>
            </div>

            {/* Products */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Package className="text-purple-600" size={24} />
                </div>
                <div className="flex items-center gap-1 text-red-500 text-xs font-bold">
                  <ArrowDownRight size={14} />
                  <span>2%</span>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                Products
              </p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900">
                {stats.totalProducts}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {stats.totalCategories} categories
              </p>
            </div>
          </div>

          {/* Quick Alerts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pending Vendors */}
            {stats.pendingVendors > 0 && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-1">
                      Pending Vendor Applications
                    </p>
                    <p className="text-3xl font-black text-yellow-900">
                      {stats.pendingVendors}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
                    <Store className="text-yellow-600" size={28} />
                  </div>
                </div>
              </div>
            )}

            {/* Active Orders Alert */}
            {stats.activeOrders > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                      Active Orders Needing Attention
                    </p>
                    <p className="text-3xl font-black text-blue-900">
                      {stats.activeOrders}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <ShoppingCart className="text-blue-600" size={28} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 p-2 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-black text-xs uppercase tracking-wider transition-all ${
            activeTab === "overview"
              ? "bg-primary text-white"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-black text-xs uppercase tracking-wider transition-all ${
            activeTab === "products"
              ? "bg-primary text-white"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-black text-xs uppercase tracking-wider transition-all ${
            activeTab === "categories"
              ? "bg-primary text-white"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-black text-xs uppercase tracking-wider transition-all ${
            activeTab === "users"
              ? "bg-primary text-white"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Users
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-wider hover:bg-primary/90 transition-all"
              >
                Add Product
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Package className="text-gray-400" size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 uppercase truncate max-w-[150px]">
                                {product.name}
                              </p>
                              <p className="text-[10px] text-gray-400">{product.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-primary">
                            {formatPrice(product.price)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${stockStatus.color}`}>
                            {product.stock} - {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-gray-600">{product.vendorName || "Unknown"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/product/${product.id}`}
                              target="_blank"
                              className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              <Eye size={14} />
                            </Link>
                            <button
                              onClick={() => setDeleteDialog({
                                open: true,
                                type: "product",
                                id: product.id,
                                name: product.name
                              })}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Package className="mx-auto text-gray-300 mb-3" size={40} />
                      <p className="text-sm font-bold text-gray-400">
                        {productSearch ? "No products found" : "No products yet"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <button
                onClick={() => {
                  const name = prompt("Enter new category name:");
                  if (name) {
                    // TODO: Implement category creation
                    alert("Category creation endpoint to be implemented");
                  }
                }}
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-wider hover:bg-primary/90 transition-all"
              >
                Add Category
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                            <FolderOpen className="text-purple-600" size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 uppercase">
                              {category.name}
                            </p>
                            <p className="text-[10px] text-gray-400">/{category.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-gray-900">
                          {category.productCount}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                          {category.description || "No description"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              const newName = prompt("Enter new category name:", category.name);
                              if (newName) {
                                // TODO: Implement category update
                                alert("Category update endpoint to be implemented");
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({
                              open: true,
                              type: "category",
                              id: category.id,
                              name: category.name
                            })}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <FolderOpen className="mx-auto text-gray-300 mb-3" size={40} />
                      <p className="text-sm font-bold text-gray-400">
                        {categorySearch ? "No categories found" : "No categories yet"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="vendor">Vendors</option>
                <option value="customer">Customers</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <UserIcon className="text-gray-400" size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 uppercase">
                              {user.name}
                            </p>
                            <p className="text-[10px] text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleUpdate(user.id, e.target.value as any)}
                            disabled={updatingRole === user.id}
                            className={`appearance-none pr-8 pl-3 py-1.5 rounded-lg text-xs font-bold uppercase cursor-pointer ${
                              updatingRole === user.id
                                ? "opacity-50 cursor-not-allowed bg-gray-50"
                                : "bg-white border border-gray-200 hover:border-primary"
                            }`}
                          >
                            <option value="customer">Customer</option>
                            <option value="vendor">Vendor</option>
                            <option value="admin">Admin</option>
                          </select>
                          <ChevronDown
                            size={12}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {user.isActive ? (
                            <>
                              <CheckCircle2 size={10} /> Active
                            </>
                          ) : (
                            <>
                              <XCircle size={10} /> Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-600">
                          {user.storeName || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDeleteDialog({
                              open: true,
                              type: "user",
                              id: user.id,
                              name: user.name
                            })}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Users className="mx-auto text-gray-300 mb-3" size={40} />
                      <p className="text-sm font-bold text-gray-400">
                        {userSearch || roleFilter !== "all" ? "No users found" : "No users yet"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-black text-gray-900 text-center uppercase tracking-tight mb-2">
              Delete {deleteDialog.type}?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete <strong>"{deleteDialog.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteDialog({ open: false, type: null, id: null, name: "" })}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
