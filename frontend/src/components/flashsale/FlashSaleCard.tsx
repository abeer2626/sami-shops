"use client";

import React from "react";
import Link from "next/link";
import { FlashSaleProduct } from "@/lib/api";
import { ShoppingCart, Zap, TrendingUp } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { ProgressBar } from "./ProgressBar";

interface FlashSaleCardProps {
    flashSaleProduct: FlashSaleProduct;
    endTime: Date | string | number;
    showProgress?: boolean;
    variant?: "default" | "compact" | "horizontal";
}

export function FlashSaleCard({
    flashSaleProduct,
    endTime,
    showProgress = true,
    variant = "default",
}: FlashSaleCardProps) {
    const { product, salePrice, discountPercent, maxQuantity, soldCount } = flashSaleProduct;

    const progressPercent = maxQuantity ? Math.min((soldCount / maxQuantity) * 100, 100) : 0;
    const remainingQuantity = maxQuantity ? maxQuantity - soldCount : null;
    const isSoldOut = maxQuantity !== null && soldCount >= maxQuantity;

    const originalPrice = product.price;
    const savings = originalPrice - salePrice;

    if (variant === "horizontal") {
        return (
            <Link
                href={`/product/${product.id}`}
                className="group bg-white rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden flex"
            >
                {/* Image */}
                <div className="relative w-32 sm:w-40 flex-shrink-0">
                    <img
                        src={product.image || "https://via.placeholder.com/200"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {discountPercent > 0 && (
                        <div className="absolute top-2 left-2 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-md">
                            {discountPercent}% OFF
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-3 flex flex-col justify-between flex-grow min-w-0">
                    <div>
                        <h3 className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">
                            {product.name}
                        </h3>

                        {/* Price */}
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-accent font-bold text-lg">
                                Rs. {salePrice.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                                Rs. {originalPrice.toLocaleString()}
                            </span>
                        </div>

                        {/* Savings */}
                        <div className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                            <TrendingUp size={10} />
                            Save Rs. {savings.toLocaleString()}
                        </div>
                    </div>

                    {/* Progress & Action */}
                    <div className="space-y-2">
                        {showProgress && maxQuantity && (
                            <ProgressBar sold={soldCount} total={maxQuantity} size="sm" />
                        )}

                        <div className="flex items-center justify-between">
                            <CountdownTimer endTime={endTime} variant="minimal" className="text-xs" />
                            <button
                                disabled={isSoldOut}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                                    isSoldOut
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-accent text-white hover:bg-orange-600"
                                }`}
                            >
                                <ShoppingCart size={12} />
                                {isSoldOut ? "Sold Out" : "Add to Cart"}
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    if (variant === "compact") {
        return (
            <Link href={`/product/${product.id}`} className="group block">
                <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 relative">
                    {/* Flash Sale Badge */}
                    {discountPercent > 0 && (
                        <div className="absolute top-2 left-2 z-10 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                            <Zap size={10} className="fill-white" />
                            {discountPercent}% OFF
                        </div>
                    )}

                    {/* Sold Out Overlay */}
                    {isSoldOut && (
                        <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
                            <div className="bg-white text-gray-800 px-4 py-2 rounded-lg font-bold text-sm">
                                SOLD OUT
                            </div>
                        </div>
                    )}

                    {/* Image */}
                    <div className="aspect-square overflow-hidden">
                        <img
                            src={product.image || "https://via.placeholder.com/200"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                    </div>

                    {/* Content */}
                    <div className="p-3">
                        <h3 className="text-xs font-medium text-gray-800 line-clamp-2 min-h-[2.5em] mb-2">
                            {product.name}
                        </h3>

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-accent font-bold">Rs. {salePrice.toLocaleString()}</span>
                            <span className="text-[10px] text-gray-400 line-through">
                                Rs. {originalPrice.toLocaleString()}
                            </span>
                        </div>

                        {/* Progress */}
                        {showProgress && maxQuantity && (
                            <div className="mb-2">
                                <ProgressBar sold={soldCount} total={maxQuantity} size="sm" />
                                <div className="text-[9px] text-gray-500 mt-0.5">
                                    {remainingQuantity} left
                                </div>
                            </div>
                        )}

                        {/* Countdown */}
                        <CountdownTimer endTime={endTime} variant="minimal" className="text-[10px] text-center" />
                    </div>
                </div>
            </Link>
        );
    }

    // Default variant
    return (
        <Link href={`/product/${product.id}`} className="group block">
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 relative">
                {/* Header */}
                <div className="bg-gradient-to-r from-accent to-orange-500 p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 rounded-lg p-1.5">
                                <Zap size={16} className="fill-white" />
                            </div>
                            <div className="text-white">
                                <div className="text-[10px] font-medium opacity-90">FLASH DEAL</div>
                                <div className="text-lg font-black leading-tight">{discountPercent}% OFF</div>
                            </div>
                        </div>
                        <CountdownTimer endTime={endTime} variant="minimal" className="text-white font-mono text-sm" />
                    </div>
                </div>

                {/* Sold Out Overlay */}
                {isSoldOut && (
                    <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center rounded-b-2xl">
                        <div className="bg-white text-gray-800 px-6 py-3 rounded-xl font-bold text-lg">
                            SOLD OUT
                        </div>
                    </div>
                )}

                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <img
                        src={product.image || "https://via.placeholder.com/300"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[2.5em] mb-3">
                        {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl font-black text-accent">
                            Rs. {salePrice.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                            Rs. {originalPrice.toLocaleString()}
                        </span>
                    </div>

                    {/* Savings */}
                    <div className="text-xs text-green-600 font-medium mb-3 flex items-center gap-1">
                        <TrendingUp size={12} />
                        You save Rs. {savings.toLocaleString()}
                    </div>

                    {/* Progress */}
                    {showProgress && maxQuantity && (
                        <div className="mb-3">
                            <ProgressBar sold={soldCount} total={maxQuantity} />
                            <div className="text-[11px] text-gray-500 mt-1.5 flex items-center justify-between">
                                <span>{soldCount} sold</span>
                                <span>{remainingQuantity} available</span>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        disabled={isSoldOut}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                            isSoldOut
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-accent text-white hover:bg-orange-600 shadow-lg shadow-orange-200"
                        }`}
                    >
                        <ShoppingCart size={16} />
                        {isSoldOut ? "Sold Out" : "Add to Cart"}
                    </button>
                </div>
            </div>
        </Link>
    );
}
