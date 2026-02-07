"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Package, Download, AlertCircle } from "lucide-react";
import { getOrderTracking, OrderTracking } from "@/lib/api";
import { OrderTimeline } from "./OrderTimeline";
import { Button } from "@/components/ui";

export function OrderTrackingPage() {
    const params = useParams();
    const orderId = params.id as string;

    const [tracking, setTracking] = useState<OrderTracking | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadTracking();
    }, [orderId]);

    const loadTracking = async () => {
        setIsLoading(true);
        try {
            const data = await getOrderTracking(orderId);
            setTracking(data);
        } catch (err: any) {
            setError(err.detail || "Failed to load order tracking");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl border border-gray-100 p-8 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
            </div>
        );
    }

    if (error || !tracking) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-900 mb-2">Unable to Load Order</h2>
                    <p className="text-red-700 mb-4">{error || "Order not found"}</p>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const { order, statusHistory, currentStep, estimatedDelivery, trackingNumber, shippingCarrier } = tracking;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Package size={24} className="text-primary" />
                    <h1 className="text-2xl font-black text-gray-900">Order Tracking</h1>
                </div>
                <p className="text-gray-500">
                    Order #{order.id.slice(-8).toUpperCase()} • Placed on {formatDate(order.createdAt)}
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Timeline */}
                    <OrderTimeline
                        currentStatus={order.status}
                        currentStep={currentStep}
                        statusHistory={statusHistory}
                        estimatedDelivery={estimatedDelivery}
                        trackingNumber={trackingNumber}
                        shippingCarrier={shippingCarrier}
                    />

                    {/* Order Items */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <h2 className="font-bold text-gray-900 mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <img
                                        src={item.product?.image || "https://via.placeholder.com/80"}
                                        alt={item.product?.name || "Product"}
                                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 truncate">
                                            {item.product?.name || "Product"}
                                        </h3>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900">
                                            Rs. {(item.price * item.quantity).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Rs. {item.price.toLocaleString()} each
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-900">Total Amount</span>
                                <span className="text-2xl font-black text-primary">
                                    Rs. {order.totalAmount.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm text-gray-500">Payment Status</span>
                                <span
                                    className={`text-sm font-bold ${
                                        order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"
                                    }`}
                                >
                                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Order Info */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <h2 className="font-bold text-gray-900 mb-4">Order Information</h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-gray-500">Order ID</span>
                                <div className="font-medium text-gray-900 font-mono">
                                    #{order.id.slice(-8).toUpperCase()}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-500">Order Date</span>
                                <div className="font-medium text-gray-900">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            {order.estimatedDelivery && (
                                <div>
                                    <span className="text-gray-500">Estimated Delivery</span>
                                    <div className="font-medium text-primary">
                                        {new Date(order.estimatedDelivery).toLocaleDateString("en-US", {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <div className="bg-white rounded-xl border border-gray-100 p-6">
                            <h2 className="font-bold text-gray-900 mb-4">Shipping Address</h2>
                            <p className="text-sm text-gray-700 whitespace-pre-line">{order.shippingAddress}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <h2 className="font-bold text-gray-900 mb-4">Need Help?</h2>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start" size="sm">
                                Contact Support
                            </Button>
                            <Button variant="outline" className="w-full justify-start" size="sm">
                                <Download size={16} className="mr-2" />
                                Download Invoice
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
