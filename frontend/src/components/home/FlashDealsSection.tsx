"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ChevronRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CountdownTimer } from "@/components/flashsale/CountdownTimer";
import { ProgressBar } from "@/components/flashsale/ProgressBar";
import { FlashSaleBanner } from "@/components/flashsale/FlashSaleBanner";
import { FlashSale, FlashSaleProduct } from "@/lib/api";

interface FlashDealsSectionProps {
    flashSale?: FlashSale;
    deals?: FlashSaleProduct[];
}

export function FlashDealsSection({
    flashSale,
    deals = [],
}: FlashDealsSectionProps) {
    // If no flash sale provided, use mock data for display
    const useMockData = !flashSale || deals.length === 0;
    const endTime = flashSale?.endTime || new Date(Date.now() + 24 * 60 * 60 * 1000);
    const saleName = flashSale?.name || "Flash Deals";
    // Generate mock deals if needed
    const displayDeals = useMockData ? [
        {
            id: "mock-1",
            productId: "1",
            flashSaleId: "mock",
            salePrice: 4999,
            discountPercent: 44,
            maxQuantity: 100,
            soldCount: 85,
            product: {
                id: "1",
                name: "Wireless Earbuds Pro",
                description: "Premium wireless earbuds",
                price: 8999,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop",
                stock: 15,
            },
        },
        {
            id: "mock-2",
            productId: "2",
            flashSaleId: "mock",
            salePrice: 9999,
            discountPercent: 37,
            maxQuantity: 100,
            soldCount: 92,
            product: {
                id: "2",
                name: "Smart Watch Series 5",
                description: "Latest smartwatch",
                price: 15999,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=300&fit=crop",
                stock: 8,
            },
        },
        {
            id: "mock-3",
            productId: "3",
            flashSaleId: "mock",
            salePrice: 4499,
            discountPercent: 43,
            maxQuantity: 100,
            soldCount: 78,
            product: {
                id: "3",
                name: "Mechanical Keyboard RGB",
                description: "Gaming keyboard",
                price: 7999,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=300&h=300&fit=crop",
                stock: 22,
            },
        },
        {
            id: "mock-4",
            productId: "4",
            flashSaleId: "mock",
            salePrice: 2499,
            discountPercent: 50,
            maxQuantity: 100,
            soldCount: 95,
            product: {
                id: "4",
                name: "USB-C Hub Pro",
                description: "Multi-port hub",
                price: 4999,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=300&h=300&fit=crop",
                stock: 5,
            },
        },
    ] : deals;

    return (
        <section id="flash-deals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            {/* Flash Sale Banner */}
            {flashSale && (
                <div className="mb-8">
                    <FlashSaleBanner flashSale={flashSale} variant="compact" />
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-accent to-orange-600 rounded-xl animate-pulse-slow">
                        <Zap className="text-white fill-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight italic">
                            {saleName}
                        </h2>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            Limited Time Offer
                        </p>
                    </div>
                </div>

                <CountdownTimer endTime={endTime} variant="default" />
            </div>

            {/* Deals Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayDeals.map((flashDeal) => {
                    const { product, salePrice, discountPercent, maxQuantity, soldCount } = flashDeal;
                    const soldPercentage = maxQuantity !== undefined && maxQuantity > 0 ? Math.round((soldCount / maxQuantity) * 100) : 0;
                    const remainingQuantity = maxQuantity !== undefined ? maxQuantity - soldCount : null;
                    const isLowStock = remainingQuantity !== null && remainingQuantity <= 10;
                    const isSoldOut = maxQuantity !== null && maxQuantity !== undefined && soldCount >= maxQuantity;

                    return (
                        <Link
                            key={flashDeal.id}
                            href={`/product/${product.id}`}
                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative"
                        >
                            {/* Sold Out Overlay */}
                            {isSoldOut && (
                                <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center rounded-2xl">
                                    <div className="bg-white text-gray-800 px-4 py-2 rounded-lg font-bold text-sm">
                                        SOLD OUT
                                    </div>
                                </div>
                            )}

                            <div className="relative aspect-square overflow-hidden bg-gray-50">
                                <Badge
                                    variant="discount"
                                    size="sm"
                                    className="absolute top-3 left-3 z-10"
                                >
                                    -{discountPercent}%
                                </Badge>

                                {isLowStock && !isSoldOut && (
                                    <div className="absolute top-3 right-3 z-10">
                                        <Badge variant="error" size="sm">
                                            Low Stock
                                        </Badge>
                                    </div>
                                )}

                                <img
                                    src={product.image || "https://via.placeholder.com/300"}
                                    alt={product.name}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            <div className="p-4">
                                <h3 className="text-xs font-black text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors uppercase tracking-tight">
                                    {product.name}
                                </h3>

                                <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-base font-black text-accent">
                                        <span className="text-xs font-bold">Rs.</span>{" "}
                                        {salePrice.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-300 line-through">
                                        Rs. {product.price.toLocaleString()}
                                    </span>
                                </div>

                                {/* Stock Progress Bar */}
                                {maxQuantity !== undefined && maxQuantity !== null && (
                                    <>
                                        <div className="mb-1">
                                            <ProgressBar sold={soldCount} total={maxQuantity} size="sm" />
                                        </div>
                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                                            {soldCount} sold {remainingQuantity && `• ${remainingQuantity} left`}
                                        </p>
                                    </>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* View All Link */}
            <div className="mt-8 text-center">
                <Link
                    href="/flash-sales"
                    className="inline-flex items-center gap-2 text-primary font-black uppercase text-xs tracking-wider hover:underline"
                >
                    View All Flash Deals
                    <ChevronRight size={16} />
                </Link>
            </div>
        </section>
    );
}
