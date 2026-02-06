"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ============================================================================
// Types
// ============================================================================

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  averageRating: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

interface TopProduct {
  id: string;
  name: string;
  image: string;
  sales: number;
  revenue: number;
  stock: number;
}

// ============================================================================
// Dashboard Component
// ============================================================================

export default function VendorDashboardPage() {
  const { token } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    averageRating: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // Fetch dashboard stats
      const statsRes = await fetch(`${apiUrl}/api/v1/vendor/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch recent orders
      const ordersRes = await fetch(`${apiUrl}/api/v1/vendor/orders?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch top products
      const productsRes = await fetch(`${apiUrl}/api/v1/vendor/products?limit=5&sort=sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        // Set mock data if API fails
        setStats({
          totalProducts: 24,
          totalOrders: 156,
          totalRevenue: 1250000,
          pendingOrders: 8,
          lowStockProducts: 3,
          averageRating: 4.5,
        });
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);
      } else {
        // Mock recent orders
        setRecentOrders([
          {
            id: "1",
            customerName: "Ahmed Khan",
            totalAmount: 12500,
            status: "pending",
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            customerName: "Sara Ali",
            totalAmount: 8900,
            status: "processing",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "3",
            customerName: "Muhammad Hassan",
            totalAmount: 25000,
            status: "delivered",
            createdAt: new Date(Date.now() - 7200000).toISOString(),
          },
        ]);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setTopProducts(productsData.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Helpers
  // ============================================================================

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "shipped":
        return "bg-blue-100 text-blue-700";
      case "processing":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Here's your store overview.
          </p>
        </div>
        <Link
          href="/vendor/products/add"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg"
        >
          Add New Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
              <ArrowUpRight size={14} />
              <span>12%</span>
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
            Total Revenue
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {loading ? "—" : formatPrice(stats.totalRevenue)}
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
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
            {loading ? "—" : stats.totalOrders}
          </p>
        </div>

        {/* Total Products */}
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
            {loading ? "—" : stats.totalProducts}
          </p>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Star className="text-yellow-500 fill-yellow-500" size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
            Rating
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {loading ? "—" : stats.averageRating.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Pending Orders */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-1">
                Pending Orders
              </p>
              <p className="text-3xl font-black text-yellow-900">
                {loading ? "—" : stats.pendingOrders}
              </p>
            </div>
            <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
              <ShoppingCart className="text-yellow-600" size={28} />
            </div>
          </div>
          {stats.pendingOrders > 0 && (
            <Link
              href="/vendor/orders"
              className="inline-flex items-center gap-2 text-xs font-bold text-yellow-700 mt-4 hover:underline"
            >
              View Orders
              <ArrowUpRight size={14} />
            </Link>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">
                Low Stock Items
              </p>
              <p className="text-3xl font-black text-red-900">
                {loading ? "—" : stats.lowStockProducts}
              </p>
            </div>
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
              <Package className="text-red-600" size={28} />
            </div>
          </div>
          {stats.lowStockProducts > 0 && (
            <Link
              href="/vendor/products"
              className="inline-flex items-center gap-2 text-xs font-bold text-red-700 mt-4 hover:underline"
            >
              Restock Now
              <ArrowUpRight size={14} />
            </Link>
          )}
        </div>

        {/* Trending */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">
                Sales This Month
              </p>
              <p className="text-3xl font-black text-green-900">
                {loading ? "—" : "+24%"}
              </p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="text-green-600" size={28} />
            </div>
          </div>
          <p className="text-[10px] font-bold text-green-600 mt-4 uppercase tracking-wider">
            Compared to last month
          </p>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
              Recent Orders
            </h2>
            <Link
              href="/vendor/orders"
              className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-50 rounded w-1/4" />
                </div>
              ))
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="text-gray-400" size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <ShoppingCart className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-sm font-bold text-gray-400">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
              Top Products
            </h2>
            <Link
              href="/vendor/products"
              className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="p-4 animate-pulse flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-1" />
                    <div className="h-3 bg-gray-50 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4"
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-white flex-shrink-0">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Package className="text-gray-300" size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.sales} sold • {formatPrice(product.revenue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : index === 1
                          ? "bg-gray-200 text-gray-600"
                          : index === 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Package className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-sm font-bold text-gray-400">No products yet</p>
                <Link
                  href="/vendor/products/add"
                  className="inline-block mt-4 text-xs font-bold text-primary hover:underline uppercase tracking-wider"
                >
                  Add your first product
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary to-primary/90 rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight mb-2">
              Grow Your Business
            </h2>
            <p className="text-sm text-white/80 max-w-xl">
              Add more products, optimize pricing, and engage with customers to increase
              your sales.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/vendor/products/add"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-gray-100 transition-all"
            >
              <Package size={16} />
              Add Product
            </Link>
            <Link
              href="/vendor/products"
              className="inline-flex items-center justify-center gap-2 bg-white/20 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-white/30 transition-all backdrop-blur-sm"
            >
              <TrendingUp size={16} />
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
