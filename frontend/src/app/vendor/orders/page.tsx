"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Search,
  Filter,
  Calendar,
  Package,
  User,
  DollarSign,
  ChevronDown,
  Eye,
  Loader2,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

interface VendorOrder {
  id: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  shippingAddress?: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    zipCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

// ============================================================================
// Constants
// ============================================================================

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ElementType; bgColor: string }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: XCircle,
  },
};

const STATUS_FLOW: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

// ============================================================================
// Orders Page Component
// ============================================================================

export default function VendorOrdersPage() {
  const { token } = useAuthStore();

  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/v1/vendor/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Actions
  // ============================================================================

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    if (!token) return;

    setUpdatingStatus(orderId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/v1/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders(
          orders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        alert("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update order status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString("en-PK", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      short: date.toLocaleDateString("en-PK", {
        month: "short",
        day: "numeric",
      }),
    };
  };

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  // ============================================================================
  // Filter & Search
  // ============================================================================

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    totalRevenue: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.totalAmount, 0),
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">
            Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track customer orders
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="text-primary" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Total
              </p>
              <p className="text-lg font-black text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Pending
              </p>
              <p className="text-lg font-black text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="text-blue-600" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Processing
              </p>
              <p className="text-lg font-black text-gray-900">{stats.processing}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Truck className="text-purple-600" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Shipped
              </p>
              <p className="text-lg font-black text-gray-900">{stats.shipped}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="text-green-600" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Delivered
              </p>
              <p className="text-lg font-black text-gray-900">{stats.delivered}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="text-green-600" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Revenue
              </p>
              <p className="text-sm font-black text-gray-900">
                {(stats.totalRevenue / 1000).toFixed(1)}k
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by order ID, customer, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          >
            <option value="all">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-primary mb-4" size={32} />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Loading orders...
          </p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status];
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedOrder === order.id;
            const currentStatusIndex = STATUS_FLOW.indexOf(order.status);

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                {/* Order Header - Always Visible */}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Status Icon */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${statusConfig.bgColor}`}
                      >
                        <StatusIcon className={statusConfig.color} size={24} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-sm font-black text-gray-900 uppercase">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${statusConfig.bgColor} ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(order.createdAt).short}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {order.customerName || "Unknown"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package size={12} />
                            {order.items.length} {order.items.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Total & Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Total
                        </p>
                        <p className="text-lg font-black text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setExpandedOrder(isExpanded ? null : order.id)
                        }
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Status Progress Bar */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Order Progress
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {STATUS_FLOW.indexOf(order.status) + 1} / {STATUS_FLOW.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {STATUS_FLOW.map((status, index) => {
                        const isActive = index <= currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;

                        return (
                          <div
                            key={status}
                            className={`flex-1 h-2 rounded-full transition-all ${
                              isActive ? "bg-primary" : "bg-gray-200"
                            } ${isCurrent ? "ring-2 ring-primary/30" : ""}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-4 sm:p-6 animate-in slide-in-from-top-2 duration-200">
                    {/* Order Items */}
                    <div className="mb-6">
                      <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3">
                        Order Items
                      </h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-100"
                          >
                            <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-gray-100 bg-white flex-shrink-0">
                              {item.productImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={item.productImage}
                                          alt={item.productName}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                          <Package className="text-gray-300" size={20} />
                                        </div>
                                      )}
                            </div>
                            <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-gray-900 uppercase truncate">
                                        {item.productName}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Qty: {item.quantity} × {formatPrice(item.price)}
                                      </p>
                                    </div>
                                    <p className="text-sm font-black text-gray-900">
                                      {formatPrice(item.quantity * item.price)}
                                    </p>
                                  </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="mb-6">
                        <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3">
                          Shipping Address
                        </h4>
                        <div className="bg-white p-4 rounded-lg border border-gray-100">
                          <p className="text-sm font-bold text-gray-900">
                            {order.shippingAddress.fullName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {order.shippingAddress.phone}
                          </p>
                          <p className="text-xs text-gray-600 mt-2">
                            {order.shippingAddress.street}
                          </p>
                          <p className="text-xs text-gray-600">
                            {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status Update Actions */}
                    {order.status !== "delivered" && order.status !== "cancelled" && (
                      <div>
                        <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3">
                          Update Status
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {STATUS_FLOW.slice(currentStatusIndex + 1).map((nextStatus) => {
                            const nextConfig = STATUS_CONFIG[nextStatus];
                            return (
                              <button
                                key={nextStatus}
                                onClick={() => handleStatusUpdate(order.id, nextStatus)}
                                disabled={updatingStatus === order.id}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                                  updatingStatus === order.id
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:shadow-md"
                                } ${nextConfig.bgColor} ${nextConfig.color} hover:opacity-80`}
                              >
                                {updatingStatus === order.id ? (
                                  <Loader2 className="animate-spin" size={14} />
                                ) : (
                                  <>
                                    {React.createElement(nextConfig.icon, { size: 14 })}
                                    Mark as {nextConfig.label}
                                  </>
                                )}
                              </button>
                            );
                          })}
                          <button
                            onClick={() => handleStatusUpdate(order.id, "cancelled")}
                            disabled={updatingStatus === order.id}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                          >
                            Cancel Order
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <Package className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            {searchQuery || statusFilter !== "all"
              ? "No orders match your filters"
              : "No orders yet"}
          </p>
        </div>
      )}
    </div>
  );
}

// Import React for createElement
import React from "react";
