"use client";

import React from "react";
import Link from "next/link";
import { Package, ExternalLink, ChevronRight } from "lucide-react";
import { Order } from "@/lib/api";
import { OrderTimelineCompact, Badge } from "@/components/ui";

interface OrderTrackingCardProps {
    order: Order;
    currentStep: number;
}

export function OrderTrackingCard({ order, currentStep }: OrderTrackingCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const statusColors: Record<string, string> = {
        pending: "bg-gray-100 text-gray-700",
        paid: "bg-blue-100 text-blue-700",
        processing: "bg-yellow-100 text-yellow-700",
        shipped: "bg-purple-100 text-purple-700",
        delivered: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-700",
    };

    return (
        <Link
            href={`/account/orders/${order.id}`}
            className="block bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-primary/30 transition-all"
        >
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Package size={16} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-500">
                                Order #{order.id.slice(-8).toUpperCase()}
                            </span>
                        </div>
                        <div className="text-xs text-gray-400">{formatDate(order.createdAt)}</div>
                    </div>
                    <Badge variant={order.status === "cancelled" ? "error" : "success"} size="sm">
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                </div>

                {/* Items Preview */}
                <div className="flex items-center gap-3 mb-4">
                    {order.items.slice(0, 3).map((item) => (
                        <div
                            key={item.id}
                            className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200"
                        >
                            <img
                                src={item.product?.image || "https://via.placeholder.com/48"}
                                alt={item.product?.name || "Product"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                    {order.items.length > 3 && (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 border border-gray-200">
                            +{order.items.length - 3}
                        </div>
                    )}
                </div>

                {/* Timeline */}
                <div className="mb-4">
                    <OrderTimelineCompact status={order.status} currentStep={currentStep} />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <span className="text-xs text-gray-500">Total Amount</span>
                        <div className="font-bold text-gray-900">
                            Rs. {order.totalAmount.toLocaleString()}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-primary text-sm font-medium">
                        View Details
                        <ChevronRight size={16} />
                    </div>
                </div>
            </div>
        </Link>
    );
}

// Skeleton loader
export function OrderTrackingCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-20" />
            </div>
            <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
            </div>
            <div className="h-2 bg-gray-200 rounded-full mb-4" />
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-20" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
        </div>
    );
}
