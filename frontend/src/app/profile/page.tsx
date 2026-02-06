"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { User, Package, MapPin, Settings, LogOut, Heart, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface OrderItem {
    id: string;
    productId: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

export default function ProfilePage() {
    const { user, token, logout, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("orders");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (isMounted && !isAuthenticated()) {
            router.push("/login");
        }
    }, [isAuthenticated, router, isMounted]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token || !user) return;
            try {
                const response = await fetch(`http://localhost:8000/api/v1/orders?user_id=${user.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        if (isMounted && isAuthenticated()) {
            fetchOrders();
        }
    }, [isMounted, isAuthenticated, token, user]);

    if (!isMounted || !user) return null;

    const navItems = [
        { id: "orders", label: "My Orders", icon: Package },
        { id: "profile", label: "My Profile", icon: User },
        { id: "address", label: "Address Book", icon: MapPin },
        { id: "wishlist", label: "Wishlist", icon: Heart },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 bg-primary/5 border-b border-gray-100 text-center">
                            <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                {user.name.charAt(0)}
                            </div>
                            <h2 className="font-bold text-gray-800 uppercase tracking-tight">{user.name}</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{user.role}</p>
                        </div>
                        <nav className="p-2">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all ${activeTab === item.id
                                            ? "bg-primary text-white shadow-md"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                                        }`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </button>
                            ))}
                            <button
                                onClick={() => { logout(); router.push("/"); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-md transition-all mt-4 border-t border-gray-50 pt-4"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-grow">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 min-h-[500px]">
                        {activeTab === "orders" && (
                            <section>
                                <div className="flex items-center justify-between mb-8 border-b pb-4 border-gray-100">
                                    <h1 className="text-xl font-black text-gray-800 uppercase tracking-tighter italic">Recent Orders</h1>
                                    <span className="bg-gray-100 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest text-gray-500">
                                        {orders.length} Total
                                    </span>
                                </div>

                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-md border border-gray-100"></div>
                                        ))}
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                                        <h3 className="text-lg font-bold text-gray-500 uppercase tracking-widest">No orders yet</h3>
                                        <Link href="/" className="text-primary font-bold mt-4 inline-block hover:underline uppercase text-sm">
                                            Start Shopping
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order.id} className="border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
                                                <div className="bg-gray-50 p-4 flex flex-wrap justify-between items-center gap-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                                                    <div className="flex gap-6">
                                                        <div>
                                                            <p className="text-[10px] mb-1">Order Placed</p>
                                                            <p className="text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] mb-1">Total Amount</p>
                                                            <p className="text-primary">Rs. {order.totalAmount.toLocaleString()}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] mb-1">Items</p>
                                                            <p className="text-gray-800">{order.items.length}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                        <Link href={`#`} className="text-primary hover:text-accent flex items-center gap-1 ml-4 group-hover:translate-x-1 transition-transform">
                                                            View Details <ChevronRight size={14} />
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-white flex items-center justify-between">
                                                    <p className="text-[10px] font-black text-gray-300 tracking-tighter">ORDER ID: {order.id.toUpperCase()}</p>
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                        <Clock size={12} />
                                                        <span>Estimated Delivery: 3-5 Business Days</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section> section>
                        )}

                        {activeTab === "profile" && (
                            <section>
                                <h1 className="text-xl font-black text-gray-800 uppercase tracking-tighter italic mb-8 border-b pb-4 border-gray-100">Account Information</h1>
                                <div className="max-w-md space-y-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</p>
                                        <p className="text-base font-medium text-gray-800">{user.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                        <p className="text-base font-medium text-gray-800">{user.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Type</p>
                                        <p className="text-base font-medium text-primary uppercase tracking-tighter">{user.role}</p>
                                    </div>
                                    <button className="bg-primary text-white font-bold py-2 px-6 rounded-sm text-xs uppercase shadow-md hover:opacity-90 transition-opacity mt-4">
                                        Edit Profile
                                    </button>
                                </div>
                            </section>
                        )}

                        {activeTab !== "orders" && activeTab !== "profile" && (
                            <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest">Feature coming soon</h3>
                                <p className="text-xs text-gray-400 mt-2">We are hard at work building this for you!</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
