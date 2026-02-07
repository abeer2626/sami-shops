"use client";

import React from "react";

interface ProgressBarProps {
    sold: number;
    total: number;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    color?: "accent" | "primary" | "green" | "red";
}

export function ProgressBar({
    sold,
    total,
    size = "md",
    showLabel = false,
    color = "accent",
}: ProgressBarProps) {
    const percent = Math.min((sold / total) * 100, 100);

    const sizeClasses = {
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-3",
    };

    const colorClasses = {
        accent: "bg-accent",
        primary: "bg-primary",
        green: "bg-green-500",
        red: percent > 80 ? "bg-red-500" : "bg-accent",
    };

    const isAlmostGone = percent > 80 && total - sold < 10;

    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex items-center justify-between text-[10px] text-gray-600 mb-1">
                    <span>{sold} sold</span>
                    <span className={isAlmostGone ? "text-red-500 font-bold" : ""}>
                        {total - sold} left
                    </span>
                </div>
            )}
            <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
                <div
                    className={`${colorClasses[color]} rounded-full transition-all duration-500 ease-out ${
                        isAlmostGone ? "animate-pulse" : ""
                    }`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

// Stock indicator for product cards
export function StockIndicator({
    stock,
    lowStockThreshold = 5,
}: {
    stock: number;
    lowStockThreshold?: number;
}) {
    if (stock <= 0) {
        return (
            <div className="text-red-500 text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Out of Stock
            </div>
        );
    }

    if (stock <= lowStockThreshold) {
        return (
            <div className="text-orange-500 text-xs font-bold flex items-center gap-1 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Only {stock} left!
            </div>
        );
    }

    return (
        <div className="text-green-500 text-xs font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            In Stock ({stock})
        </div>
    );
}
