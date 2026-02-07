"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/lib/api";
import { ProductCard } from "../ui/ProductCard";
import { Badge } from "../ui/Badge";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface SearchResultsProps {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    query?: string;
    onPageChange: (page: number) => void;
    sortBy: "relevance" | "price_asc" | "price_desc" | "newest";
    onSortChange: (sort: "relevance" | "price_asc" | "price_desc" | "newest") => void;
    onToggleFilters: () => void;
    showFilters?: boolean;
}

export function SearchResultsHeader({
    total,
    query,
    sortBy,
    onSortChange,
    onToggleFilters,
    showFilters,
}: Omit<SearchResultsProps, "products" | "page" | "limit" | "onPageChange">) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                    {query ? `Search Results for "${query}"` : "All Products"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    {total} {total === 1 ? "product" : "products"} found
                </p>
            </div>

            <div className="flex items-center gap-3">
                {/* Mobile Filter Toggle */}
                <button
                    onClick={onToggleFilters}
                    className={`lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${showFilters
                            ? "bg-primary text-white"
                            : "bg-white border border-gray-200 text-gray-700 hover:border-primary"
                        }`}
                >
                    <SlidersHorizontal size={16} />
                    Filters
                </button>

                {/* Sort Dropdown */}
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) =>
                            onSortChange(e.target.value as typeof sortBy)
                        }
                        className="appearance-none pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                    >
                        <option value="relevance">Relevance</option>
                        <option value="newest">Newest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                    <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>
        </div>
    );
}

export function SearchResultsGrid({
    products,
    total,
    page,
    limit,
    onPageChange,
}: Pick<SearchResultsProps, "products" | "total" | "page" | "limit" | "onPageChange">) {
    const totalPages = Math.ceil(total / limit);

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Search size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 text-center max-w-md mb-6">
                    Try adjusting your search terms or filters to find what you're looking for.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg font-medium text-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary transition-colors"
                    >
                        Previous
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (page <= 3) {
                                pageNum = i + 1;
                            } else if (page >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = page - 2 + i;
                            }

                            const isCurrentPage = pageNum === page;

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => onPageChange(pageNum)}
                                    className={`min-w-[40px] h-10 rounded-lg font-medium text-sm transition-colors ${isCurrentPage
                                            ? "bg-primary text-white"
                                            : "border border-gray-200 hover:border-primary"
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-lg font-medium text-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Results Info */}
            <div className="text-center text-sm text-gray-500">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} results
            </div>
        </div>
    );
}

// Skeleton loaders
export function SearchResultsSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <ProductCard.Skeleton key={i} />
            ))}
        </div>
    );
}
