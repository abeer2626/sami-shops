"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Package, Search, Filter, Eye, CheckCircle, XCircle, Clock, Truck, RefreshCw } from "lucide-react";
import { getOrders, updateOrderStatus, markOrderPaid, Order } from "@/lib/api";
import { Button } from "@/components/ui";

export default function AdminOrdersPage() {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login?redirect=/admin/orders");
            return;
        }
        loadOrders();
    }, [isAuthenticated]);

    const loadOrders = async () => {
        try {
            const data = await getOrders({ limit: 100 });
            setOrders(data);
        } catch (err) {
            console.error("Failed to load orders:", err);
            setError("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingOrderId(orderId);
        try {
            await updateOrderStatus(orderId, newStatus as any);
            setSuccess(`Order status updated to ${newStatus}`);
            loadOrders();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.detail || "Failed to update order status");
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleMarkPaid = async (orderId: string) => {
        setUpdatingOrderId(orderId);
        try {
            await markOrderPaid(orderId);
            setSuccess("Order marked as paid successfully!");
            loadOrders();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.detail || "Failed to mark order as paid");
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "delivered":
                return "bg-green-100 text-green-700 border-green-200";
            case "shipped":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "processing":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "paid":
                return "bg-purple-100 text-purple-700 border-purple-200";
            case "cancelled":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "delivered":
                return CheckCircle;
            case "shipped":
                return Truck;
            case "processing":
            case "pending":
                return Clock;
            case "cancelled":
                return XCircle;
            default:
                return Package;
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-gray-500">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Orders Management</h1>
                    <p className="text-sm text-gray-500 mt-1">View and manage all platform orders</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Package size={18} />
                    <span className="font-bold">{orders.length} Total Orders</span>
                </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle size={18} />
                    {success}
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <XCircle size={18} />
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search orders by ID..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map((order) => {
                                const StatusIcon = getStatusIcon(order.status);
                                const isUpdating = updatingOrderId === order.id;

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-900 text-sm">
                                                #{order.id.slice(-8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {new Date(order.created_at || order.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-gray-900">
                                                {order.items?.length || 0} items
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-primary">
                                                Rs. {order.totalAmount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(order.status)}`}>
                                                <StatusIcon size={12} />
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                                order.paymentStatus === "paid"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* View Details */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/account/orders/${order.id}`)}
                                                >
                                                    <Eye size={14} />
                                                </Button>

                                                {/* Mark as Paid */}
                                                {order.paymentStatus !== "paid" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-green-600 hover:bg-green-50"
                                                        onClick={() => handleMarkPaid(order.id)}
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? (
                                                            <RefreshCw size={14} className="animate-spin" />
                                                        ) : (
                                                            <CheckCircle size={14} />
                                                        )}
                                                    </Button>
                                                )}

                                                {/* Status Actions */}
                                                {order.status === "pending" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-blue-600 hover:bg-blue-50"
                                                        onClick={() => handleStatusUpdate(order.id, "paid")}
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? (
                                                            <RefreshCw size={14} className="animate-spin" />
                                                        ) : (
                                                            "Mark Paid"
                                                        )}
                                                    </Button>
                                                )}

                                                {order.status === "paid" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-yellow-600 hover:bg-yellow-50"
                                                        onClick={() => handleStatusUpdate(order.id, "processing")}
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? (
                                                            <RefreshCw size={14} className="animate-spin" />
                                                        ) : (
                                                            "Process"
                                                        )}
                                                    </Button>
                                                )}

                                                {order.status === "processing" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-purple-600 hover:bg-purple-50"
                                                        onClick={() => handleStatusUpdate(order.id, "shipped")}
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? (
                                                            <RefreshCw size={14} className="animate-spin" />
                                                        ) : (
                                                            "Ship"
                                                        )}
                                                    </Button>
                                                )}

                                                {order.status === "shipped" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-green-600 hover:bg-green-50"
                                                        onClick={() => handleStatusUpdate(order.id, "delivered")}
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? (
                                                            <RefreshCw size={14} className="animate-spin" />
                                                        ) : (
                                                            "Deliver"
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        <Package size={48} className="mx-auto mb-4 text-gray-200" />
                        <p className="text-sm font-bold">No orders found</p>
                        <p className="text-xs mt-1">Try adjusting your filters or search query</p>
                    </div>
                )}
            </div>
        </div>
    );
}
