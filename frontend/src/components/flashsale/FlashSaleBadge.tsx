"use client";

import React from "react";
import { Zap, Clock } from "lucide-react";

interface FlashSaleBadgeProps {
    discountPercent: number;
    timeRemaining?: number; // Seconds remaining
    variant?: "default" | "compact" | "pill";
    showTimer?: boolean;
}

export function FlashSaleBadge({
    discountPercent,
    timeRemaining,
    variant = "default",
    showTimer = false,
}: FlashSaleBadgeProps) {
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    if (variant === "pill") {
        return (
            <div className="bg-gradient-to-r from-accent to-orange-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <Zap size={12} className="fill-white animate-pulse" />
                <span className="text-xs font-bold">{discountPercent}% OFF</span>
                {showTimer && timeRemaining && timeRemaining > 0 && (
                    <>
                        <span className="w-px h-3 bg-white/30" />
                        <span className="text-[10px] font-medium">{formatTime(timeRemaining)}</span>
                    </>
                )}
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <div className="bg-accent text-white px-2 py-1 rounded flex items-center gap-1 shadow-md">
                <Zap size={10} className="fill-white" />
                <span className="text-[10px] font-bold">{discountPercent}%</span>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-accent to-orange-600 text-white rounded-lg p-2 shadow-lg">
            <div className="flex items-center gap-2">
                <div className="bg-white/20 rounded-lg p-1.5">
                    <Zap size={14} className="fill-white" />
                </div>
                <div>
                    <div className="text-[10px] font-medium opacity-90">FLASH SALE</div>
                    <div className="text-lg font-black leading-tight">{discountPercent}% OFF</div>
                </div>
                {showTimer && timeRemaining && timeRemaining > 0 && (
                    <div className="ml-auto">
                        <div className="flex items-center gap-1 text-[10px]">
                            <Clock size={10} />
                            <span className="font-bold">{formatTime(timeRemaining)}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Specialized badge for product cards
export function ProductFlashBadge({ discountPercent }: { discountPercent: number }) {
    return (
        <div className="absolute top-2 left-2 z-10">
            <div className="bg-accent text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                <Zap size={10} className="fill-white" />
                <span>{discountPercent}% OFF</span>
            </div>
        </div>
    );
}

// Countdown-only badge for urgency
export function CountdownBadge({ timeRemaining, label = "Ends in" }: { timeRemaining: number; label?: string }) {
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return { hrs, mins, secs };
    };

    const time = formatTime(timeRemaining);
    const isUrgent = timeRemaining < 3600; // Less than 1 hour

    return (
        <div className={`flex items-center gap-1.5 ${isUrgent ? 'text-accent animate-pulse' : 'text-gray-600'}`}>
            <Clock size={12} />
            <span className="text-[10px] font-medium">{label}</span>
            <span className="text-xs font-bold">
                {time.hrs > 0 && `${time.hrs}h `}{time.mins}m {time.secs}s
            </span>
        </div>
    );
}
