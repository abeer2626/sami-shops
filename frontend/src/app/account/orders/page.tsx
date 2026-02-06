"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Package, Truck, CheckCircle, Clock, ChevronRight, ShoppingBag, ArrowLeft } from "lucide-react";
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

export default function UserOrdersPage() {
    const { user, token, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (isMounted && !isAuthenticated()) {
            router.push("/login?redirect=/account/orders");
        }
    }, [isMounted, isAuthenticated, router]);

    useEffect(() => {
        if (isMounted && token && user) {
            const fetchOrders = async () => {
                try {
                    const res = await fetch(`http://localhost:8000/api/v1/orders?user_id=${user.id}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (res.ok) {
                        setOrders(await res.json());
                    }
                } catch (err) {
                    console.error("Failed to fetch orders");
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        }
    }, [isMounted, token, user]);

    const getStatusStep = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 1;
            case 'processing': return 1;
            case 'shipped': return 2;
            case 'delivered': return 3;
            default: return 1;
        }
    };

    if (!isMounted || !user) return null;

    return (
        <div className="min-h-screen bg-[#f8f9fa] py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header Section */}
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter italic">My <span className="text-primary">Orders</span></h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Order History & Tactical Tracking</p>
                    </div>
                    <Link href="/">
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-primary transition-all tracking-widest">
                            <ArrowLeft size={16} /> Beta Base
                        </button>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-50">
                        <ShoppingBag className="animate-bounce" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Scanning Archives...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white p-20 rounded-3xl shadow-sm border border-gray-100 text-center">
                        <ShoppingBag size={80} className="mx-auto mb-6 text-gray-100" />
                        <h2 className="text-xl font-black text-gray-800 uppercase italic">Manifest Empty</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2 mb-8">You haven't deployed any orders yet.</p>
                        <Link href="/">
                            <button className="bg-primary text-white px-10 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:brightness-110">Shop Collection</button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                                {/* Order Header */}
                                <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-gray-100">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase">Order Identity</p>
                                            <p className="text-sm font-black text-gray-800 uppercase tracking-tighter">#{order.id.substring(0, 12).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:flex gap-8">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase">Deployment Date</p>
                                            <p className="text-sm font-bold text-gray-700 uppercase tracking-tight">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase">Total Load</p>
                                            <p className="text-sm font-black text-primary italic">Rs. {order.totalAmount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tracking Bar */}
                                <div className="p-8 md:p-12 border-b border-gray-100 relative">
                                    <div className="flex items-center justify-between max-w-3xl mx-auto relative z-10">
                                        {[
                                            { s: 1, label: "Ordered", icon: Clock },
                                            { s: 2, label: "Shipped", icon: Truck },
                                            { s: 3, label: "Delivered", icon: CheckCircle }
                                        ].map((step, i) => {
                                            const activeStep = getStatusStep(order.status);
                                            const isActive = activeStep >= step.s;
                                            return (
                                                <div key={i} className="flex flex-col items-center relative flex-1">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 border-4 ${isActive ? 'bg-primary text-white border-blue-100 shadow-xl scale-110' : 'bg-gray-100 text-gray-300 border-white'
                                                        }`}>
                                                        <step.icon size={20} />
                                                    </div>
                                                    <span className={`mt-3 text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-gray-300'}`}>{step.label}</span>
                                                    {i < 2 && (
                                                        <div className={`absolute top-6 left-1/2 w-full h-1 -z-10 ${activeStep > step.s ? 'bg-primary' : 'bg-gray-100'}`}></div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Order Summary Toggle / View */}
                                <div className="p-6 bg-gray-50/20 flex justify-between items-center group cursor-pointer">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deployment contains {order.items?.length || 0} tactical items</p>
                                    <button className="text-[10px] font-black text-primary uppercase flex items-center gap-1 group-hover:gap-2 transition-all tracking-tighter">
                                        View Full Intel <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
