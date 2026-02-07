"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Package, Truck, CheckCircle, Clock, ChevronRight, ShoppingBag, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getUserOrders, Order } from "@/lib/api";
import { OrderTrackingCard, OrderTrackingCardSkeleton } from "@/components/ui";

interface OrderWithStep {
    order: Order;
    currentStep: number;
}

export default function UserOrdersPage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [ordersWithSteps, setOrdersWithSteps] = useState<OrderWithStep[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (isMounted && !isAuthenticated()) {
            router.push("/login?redirect=/account/orders");
        }
    }, [isMounted, isAuthenticated, router]);

    useEffect(() => {
        if (isMounted && user) {
            const fetchOrders = async () => {
                try {
                    const orders = await getUserOrders();
                    const withSteps = orders.map(order => ({
                        order,
                        currentStep: getStatusStep(order.status)
                    }));
                    setOrdersWithSteps(withSteps);
                } catch (err) {
                    console.error("Failed to fetch orders");
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        }
    }, [isMounted, user]);

    const getStatusStep = (status: string): number => {
        const statusMap: Record<string, number> = {
            pending: 0,
            paid: 1,
            processing: 2,
            shipped: 3,
            delivered: 4,
            cancelled: 0,
        };
        return statusMap[status.toLowerCase()] ?? 0;
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
                    <div className="grid gap-6">
                        {[...Array(3)].map((_, i) => (
                            <OrderTrackingCardSkeleton key={i} />
                        ))}
                    </div>
                ) : ordersWithSteps.length === 0 ? (
                    <div className="bg-white p-20 rounded-3xl shadow-sm border border-gray-100 text-center">
                        <ShoppingBag size={80} className="mx-auto mb-6 text-gray-100" />
                        <h2 className="text-xl font-black text-gray-800 uppercase italic">Manifest Empty</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2 mb-8">You haven't deployed any orders yet.</p>
                        <Link href="/">
                            <button className="bg-primary text-white px-10 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:brightness-110">Shop Collection</button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {ordersWithSteps.map(({ order, currentStep }) => (
                            <OrderTrackingCard key={order.id} order={order} currentStep={currentStep} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
