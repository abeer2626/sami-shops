"use client";

import React from "react";
import { FlashSale } from "@/lib/api";
import { Zap, Clock, ArrowRight } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import Link from "next/link";

interface FlashSaleBannerProps {
    flashSale: FlashSale;
    variant?: "default" | "compact" | "minimal";
}

export function FlashSaleBanner({ flashSale, variant = "default" }: FlashSaleBannerProps) {
    const { name, endTime, products } = flashSale;
    const productCount = products?.length || 0;

    if (variant === "minimal") {
        return (
            <Link
                href="/flash-sales"
                className="flex items-center gap-2 bg-gradient-to-r from-accent to-orange-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
            >
                <Zap size={16} className="fill-white animate-pulse" />
                <span className="font-bold text-sm">{name}</span>
                <span className="w-px h-4 bg-white/30" />
                <CountdownTimer endTime={endTime} variant="minimal" className="text-white text-sm font-mono" />
                <ArrowRight size={14} className="ml-auto" />
            </Link>
        );
    }

    if (variant === "compact") {
        return (
            <div className="bg-gradient-to-r from-accent to-orange-500 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-lg p-2">
                            <Zap size={20} className="fill-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{name}</h3>
                            <p className="text-[11px] opacity-90">{productCount} products on sale</p>
                        </div>
                    </div>
                    <Link
                        href="/flash-sales"
                        className="bg-white text-accent px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/90 transition-all flex items-center gap-1"
                    >
                        View All
                        <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <Clock size={14} />
                    <span className="text-xs font-medium">Ends in:</span>
                    <CountdownTimer endTime={endTime} variant="minimal" className="text-white font-mono text-base" />
                </div>
            </div>
        );
    }

    // Default variant - Full banner
    return (
        <div className="relative bg-gradient-to-br from-accent via-orange-500 to-red-500 rounded-2xl p-6 overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 12px)`,
                }} />
            </div>

            {/* Floating lightning bolts */}
            <div className="absolute top-4 right-4 text-white/20 animate-bounce">
                <Zap size={60} />
            </div>
            <div className="absolute bottom-4 left-4 text-white/20 animate-bounce" style={{ animationDelay: "0.5s" }}>
                <Zap size={40} />
            </div>

            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                            <Zap size={28} className="fill-white" />
                        </div>
                        <div className="text-white">
                            <div className="text-[10px] font-bold uppercase tracking-wider opacity-90 mb-1">
                                Limited Time Offer
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black">{name}</h2>
                            <p className="text-sm opacity-90 mt-1">
                                {productCount} products at unbeatable prices
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Countdown */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                            <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
                                <Clock size={12} />
                                <span className="font-medium">Sale ends in:</span>
                            </div>
                            <CountdownTimer
                                endTime={endTime}
                                variant="default"
                                className="text-white"
                                showLabels={true}
                            />
                        </div>

                        {/* CTA Button */}
                        <Link
                            href="/flash-sales"
                            className="bg-white text-accent px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg"
                        >
                            Shop Now
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Horizontal scrolling banner for mobile
export function FlashSaleMarquee({ flashSale }: { flashSale: FlashSale }) {
    const { endTime } = flashSale;

    return (
        <div className="bg-accent text-white py-2 px-4 overflow-hidden">
            <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
                <span className="font-bold text-sm flex items-center gap-1">
                    <Zap size={12} className="fill-white" />
                    FLASH SALE
                </span>
                <span className="w-px h-4 bg-white/30" />
                <span className="text-xs">Ends in:</span>
                <CountdownTimer endTime={endTime} variant="minimal" className="text-white text-xs font-mono" />
            </div>
        </div>
    );
}
