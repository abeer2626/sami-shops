"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
    LayoutDashboard,
    Plus,
    Trash2,
    Edit3,
    Package,
    DollarSign,
    TrendingUp,
    Search as SearchIcon,
    AlertCircle,
    Loader2,
    MessageSquare,
    BarChart3,
    ShoppingCart,
    Clock,
    User,
    CheckCircle2,
    Truck,
    PackageCheck
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    images: string[];
    categoryId: string;
}

interface Message {
    id: string;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

interface Order {
    id: string;
    userId: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: any[];
}

interface Report {
    totalRevenue: number;
    totalOrders: number;
    totalProductsSold: number;
    recentOrders: any[];
    topProducts: any[];
}

export default function VendorDashboard() {
    const { user, token, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"products" | "reports" | "messages" | "orders">("products");
    const [products, setProducts] = useState<Product[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (isMounted && !isAuthenticated()) {
            router.push("/login");
        }
    }, [isMounted, isAuthenticated, router]);

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        setError("");
        try {
            if (activeTab === "products") {
                const res = await fetch("http://localhost:8000/api/v1/vendor/products", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) setProducts(await res.json());
            } else if (activeTab === "reports") {
                const res = await fetch("http://localhost:8000/api/v1/vendor/reports", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) setReport(await res.json());
            } else if (activeTab === "messages") {
                const res = await fetch("http://localhost:8000/api/v1/messages", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) setMessages(await res.json());
            } else if (activeTab === "orders") {
                const res = await fetch("http://localhost:8000/api/v1/vendor/orders", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) setOrders(await res.json());
            }
        } catch (err) {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isMounted && token) {
            fetchData();
        }
    }, [isMounted, token, activeTab]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            const res = await fetch(`http://localhost:8000/api/v1/products/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            alert("Failed to delete product");
        }
    };

    const updateField = async (id: string, field: string, value: any) => {
        try {
            const res = await fetch(`http://localhost:8000/api/v1/products/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ [field]: value })
            });
            if (res.ok) setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
        } catch (err) {
            alert("Update failed");
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch(`http://localhost:8000/api/v1/orders/${orderId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await fetch(`http://localhost:8000/api/v1/messages/${id}/read`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` }
            });
            setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m));
        } catch (err) { }
    };

    if (!isMounted || !user) return null;

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-2">
                            <LayoutDashboard className="text-primary" size={28} />
                            Vendor <span className="text-primary italic">Portal</span>
                        </h1>
                        <p className="text-xs text-gray-500 font-bold uppercase mt-1 tracking-widest">
                            Manager: {user.name} &bull; SamiShops Certified Vendor
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/vendor/add-product">
                            <button className="bg-accent text-white font-black py-4 px-6 rounded-sm shadow-xl hover:brightness-110 transition-all uppercase text-xs flex items-center gap-2">
                                <Plus size={18} />
                                List Product
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Tabs Management */}
                <div className="flex border-b border-gray-200 mb-8 gap-8 overflow-x-auto pb-1">
                    {[
                        { id: "products", label: "Inventory", icon: Package },
                        { id: "orders", label: "Orders", icon: ShoppingCart },
                        { id: "reports", label: "Sales Reports", icon: BarChart3 },
                        { id: "messages", label: "Messages", icon: MessageSquare }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <div className="flex items-center gap-2">
                                <tab.icon size={16} /> {tab.label}
                            </div>
                            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
                        </button>
                    ))}
                </div>

                {activeTab === "products" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="bg-primary/10 p-4 rounded-xl text-primary"><Package size={28} /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400">Total Products</p>
                                    <p className="text-2xl font-black text-gray-800">{products.length}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="bg-green-50 p-4 rounded-xl text-green-600"><TrendingUp size={28} /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400">In Stock</p>
                                    <p className="text-2xl font-black text-gray-800">{products.filter(p => p.stock > 0).length}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="bg-orange-50 p-4 rounded-xl text-orange-600"><DollarSign size={28} /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400">Catalog Value</p>
                                    <p className="text-2xl font-black text-gray-800">Rs. {products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h1 className="font-black text-sm uppercase italic text-gray-800">Inventory Management</h1>
                                <div className="relative w-full md:w-64">
                                    <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text" placeholder="Filter inventory..."
                                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none"
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-black text-gray-400 tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Item</th>
                                            <th className="px-6 py-4">Pricing</th>
                                            <th className="px-6 py-4">Quantity</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(product => (
                                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 relative rounded border border-gray-100 overflow-hidden">
                                                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-800 uppercase tracking-tight">{product.name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-black text-primary italic">
                                                    Rs. <input type="number" defaultValue={product.price} onBlur={(e) => updateField(product.id, "price", parseFloat(e.target.value))} className="w-20 bg-transparent outline-none border-b border-transparent focus:border-primary" />
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-600">
                                                    <input type="number" defaultValue={product.stock} onBlur={(e) => updateField(product.id, "stock", parseInt(e.target.value))} className="w-16 bg-transparent outline-none" />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleDelete(product.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "orders" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h1 className="font-black text-sm uppercase italic text-gray-800">Order Management</h1>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-black text-gray-400 tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Order ID</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Update Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {orders.map(order => (
                                            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 text-xs font-black text-gray-800">#{order.id.substring(0, 8).toUpperCase()}</td>
                                                <td className="px-6 py-4 text-xs text-gray-500 font-bold">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-sm font-black text-primary italic">Rs. {order.totalAmount.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                        className="text-[10px] font-black uppercase bg-gray-50 border border-gray-200 p-1.5 rounded cursor-pointer outline-none focus:border-primary"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {orders.length === 0 && !loading && (
                                    <div className="p-20 text-center text-gray-400">
                                        <Truck className="mx-auto mb-4 opacity-10" size={60} />
                                        <p className="font-black uppercase tracking-widest text-xs">No orders found for your products</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "reports" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {report && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
                                        <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Total Revenue</p>
                                        <p className="text-3xl font-black text-primary italic">Rs. {report.totalRevenue.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
                                        <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Orders Processed</p>
                                        <p className="text-3xl font-black text-gray-800">{report.totalOrders}</p>
                                    </div>
                                    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
                                        <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Items Sold</p>
                                        <p className="text-3xl font-black text-gray-800">{report.totalProductsSold}</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                                            <TrendingUp size={18} className="text-primary" />
                                            <h2 className="font-black text-sm uppercase italic">Top Products</h2>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            {report.topProducts.map((p, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-black text-gray-300">#0{i + 1}</span>
                                                        <span className="text-sm font-bold text-gray-700 uppercase">{p.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-gray-800">{p.sold} Sold</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Rs. {p.revenue.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                                            <Clock size={18} className="text-primary" />
                                            <h2 className="font-black text-sm uppercase italic">Recent Activity</h2>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            {report.recentOrders.map((o, i) => (
                                                <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                                    <div>
                                                        <p className="text-xs font-black text-gray-800 uppercase">Order #{o.id.substring(0, 8)}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold">{new Date(o.date).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-primary italic">Rs. {o.amount.toLocaleString()}</p>
                                                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{o.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === "messages" && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex h-[600px] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Sidebar */}
                        <div className="w-1/3 border-r border-gray-100 bg-gray-50/50">
                            <div className="p-6 border-b border-gray-100">
                                <h1 className="font-black text-gray-800 uppercase italic text-sm">Customer Inquiries</h1>
                            </div>
                            <div className="overflow-y-auto h-full">
                                {messages.length === 0 ? (
                                    <div className="p-10 text-center opacity-30">
                                        <MessageSquare size={40} className="mx-auto mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No messages yet</p>
                                    </div>
                                ) : messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        onClick={() => markAsRead(msg.id)}
                                        className={`p-6 border-b border-gray-100 cursor-pointer hover:bg-white transition-all ${!msg.isRead ? 'bg-white border-l-4 border-l-primary' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-xs font-black text-gray-800 uppercase flex items-center gap-1">
                                                <User size={12} className="text-primary" /> Customer
                                            </p>
                                            <span className="text-[9px] text-gray-400 font-bold">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 italic">"{msg.content}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chat Context (Mocked UI for now) */}
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-20">
                            <MessageSquare size={80} className="mb-4 text-primary" />
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Communication Center</h2>
                            <p className="text-sm font-bold uppercase tracking-widest mt-2 max-w-sm">Select a conversation from the left to start engaging with your customers.</p>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="fixed bottom-10 right-10 bg-white p-4 rounded-full shadow-2xl flex items-center gap-3 border border-gray-100 animate-bounce">
                        <Loader2 className="animate-spin text-primary" size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Refreshing Data...</span>
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex items-center gap-3">
                        <AlertCircle size={20} className="text-red-500" />
                        <p className="text-xs font-black text-red-700 uppercase">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
