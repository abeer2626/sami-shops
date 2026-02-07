"use client";

import React from "react";
import { Package, Check, Truck, Clock, XCircle, CreditCard, Settings } from "lucide-react";
import { OrderStatus, OrderStatusHistory } from "@/lib/api";

interface OrderTimelineProps {
    currentStatus: OrderStatus;
    currentStep: number;
    statusHistory: OrderStatusHistory[];
    estimatedDelivery?: string;
    trackingNumber?: string;
    shippingCarrier?: string;
    className?: string;
}

interface StatusStep {
    key: OrderStatus;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

const STATUS_STEPS: StatusStep[] = [
    {
        key: "pending",
        label: "Order Placed",
        description: "Your order has been received",
        icon: Package,
    },
    {
        key: "paid",
        label: "Payment Confirmed",
        description: "Payment has been verified",
        icon: CreditCard,
    },
    {
        key: "processing",
        label: "Processing",
        description: "Your order is being prepared",
        icon: Settings,
    },
    {
        key: "shipped",
        label: "Shipped",
        description: "Your order is on its way",
        icon: Truck,
    },
    {
        key: "delivered",
        label: "Delivered",
        description: "Order has been delivered",
        icon: Check,
    },
];

export function OrderTimeline({
    currentStatus,
    currentStep,
    statusHistory,
    estimatedDelivery,
    trackingNumber,
    shippingCarrier,
    className = "",
}: OrderTimelineProps) {
    const isCancelled = currentStatus === "cancelled";

    const getStatusStepIndex = (status: OrderStatus): number => {
        return STATUS_STEPS.findIndex((step) => step.key === status);
    };

    const getStepStatus = (stepIndex: number): "completed" | "current" | "pending" => {
        if (isCancelled) return "pending";
        if (stepIndex < currentStep) return "completed";
        if (stepIndex === currentStep) return "current";
        return "pending";
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getHistoryEntry = (status: OrderStatus) => {
        return statusHistory.find((h) => h.status === status);
    };

    return (
        <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Order Status</h3>
                {isCancelled ? (
                    <div className="flex items-center gap-2 text-red-500">
                        <XCircle size={20} />
                        <span className="font-bold">Order Cancelled</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-primary">
                        <Clock size={20} />
                        <span className="font-medium">{STATUS_STEPS[currentStep]?.label || "Pending"}</span>
                    </div>
                )}
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-gray-200" />

                {/* Steps */}
                <div className="space-y-0">
                    {STATUS_STEPS.map((step, index) => {
                        const stepStatus = getStepStatus(index);
                        const historyEntry = getHistoryEntry(step.key);
                        const StepIcon = step.icon;

                        return (
                            <div key={step.key} className="relative flex items-start gap-4 pb-8 last:pb-0">
                                {/* Icon Circle */}
                                <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                                    stepStatus === "completed"
                                        ? "bg-green-500 border-green-500"
                                        : stepStatus === "current"
                                        ? "bg-primary border-primary"
                                        : "bg-white border-gray-300"
                                }`}>
                                    {stepStatus === "completed" ? (
                                        <Check size={18} className="text-white" />
                                    ) : stepStatus === "current" ? (
                                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                                    ) : (
                                        <StepIcon size={18} className="text-gray-400" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pt-1">
                                    <div className={`font-bold ${stepStatus === "current" ? "text-primary" : stepStatus === "completed" ? "text-gray-900" : "text-gray-500"}`}>
                                        {step.label}
                                    </div>
                                    <div className={`text-sm ${stepStatus === "current" ? "text-gray-700" : "text-gray-500"}`}>
                                        {step.description}
                                    </div>
                                    {historyEntry && (
                                        <div className="text-xs text-gray-400 mt-1">
                                            {formatDate(historyEntry.createdAt)}
                                            {historyEntry.notes && ` - ${historyEntry.notes}`}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tracking Info */}
            {(trackingNumber || shippingCarrier || estimatedDelivery) && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="bg-secondary rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 mb-3">Shipping Information</h4>
                        <div className="space-y-2 text-sm">
                            {trackingNumber && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Tracking Number:</span>
                                    <span className="font-mono font-bold text-gray-900">{trackingNumber}</span>
                                </div>
                            )}
                            {shippingCarrier && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Carrier:</span>
                                    <span className="font-medium text-gray-900">{shippingCarrier}</span>
                                </div>
                            )}
                            {estimatedDelivery && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Estimated Delivery:</span>
                                    <span className="font-medium text-primary">
                                        {new Date(estimatedDelivery).toLocaleDateString("en-US", {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Cancelled Notice */}
            {isCancelled && statusHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-red-900 mb-1">Order Cancelled</h4>
                                <p className="text-sm text-red-700">
                                    {statusHistory[0]?.notes || "This order has been cancelled."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Compact version for cards
interface OrderTimelineCompactProps {
    status: OrderStatus;
    currentStep: number;
    className?: string;
}

export function OrderTimelineCompact({ status, currentStep, className = "" }: OrderTimelineCompactProps) {
    const isCancelled = status === "cancelled";

    const steps = [
        { label: "Placed", key: "pending" },
        { label: "Paid", key: "paid" },
        { label: "Processing", key: "processing" },
        { label: "Shipped", key: "shipped" },
        { label: "Delivered", key: "delivered" },
    ];

    const getStepStatus = (index: number): "completed" | "current" | "pending" => {
        if (isCancelled) return "pending";
        if (index < currentStep) return "completed";
        if (index === currentStep) return "current";
        return "pending";
    };

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {steps.map((step, index) => {
                const stepStatus = getStepStatus(index);

                return (
                    <React.Fragment key={step.key}>
                        {/* Dot */}
                        <div
                            className={`w-2 h-2 rounded-full ${
                                stepStatus === "completed"
                                    ? "bg-green-500"
                                    : stepStatus === "current"
                                    ? "bg-primary"
                                    : "bg-gray-300"
                            }`}
                            title={step.label}
                        />
                        {/* Line */}
                        {index < steps.length - 1 && (
                            <div
                                className={`flex-1 h-0.5 ${
                                    stepStatus === "completed" ? "bg-green-500" : "bg-gray-300"
                                }`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
