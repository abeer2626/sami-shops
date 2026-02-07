"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { ChevronRight, ShoppingCart, Filter, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { Input, Select } from "@/components/ui/Input";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    stock: number;
    category?: string;
    store?: {
        id: string;
        name: string;
    };
    discount_percentage?: number;
}

interface ProductFilters {
    category?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: "newest" | "price_low" | "price_high" | "popular";
}

interface ProductGridSectionProps {
    initialProducts?: Product[];
    categories?: { id: string; name: string; slug: string }[];
    title?: string;
    subtitle?: string;
    limit?: number;
}

const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "popular", label: "Most Popular" },
];

export function ProductGridSection({
    initialProducts = [],
    categories = [],
    title = "Just For You",
    subtitle = "Recommended Products",
    limit = 12,
}: ProductGridSectionProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<ProductFilters>({ sort_by: "newest" });
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const params = new URLSearchParams();

                if (filters.category) params.append("category_id", filters.category);
                if (filters.search) params.append("search", filters.search);
                if (filters.min_price) params.append("min_price", filters.min_price.toString());
                if (filters.max_price) params.append("max_price", filters.max_price.toString());
                if (filters.sort_by) {
                    const sortMap: Record<string, string> = {
                        newest: "newest",
                        price_low: "low_to_high",
                        price_high: "high_to_low",
                        popular: "newest",
                    };
                    params.append("sort", sortMap[filters.sort_by]);
                }

                const response = await fetch(`${apiUrl}/api/v1/products?${params.toString()}`, {
                    cache: "no-store",
                });

                if (!response.ok) throw new Error("Failed to fetch products");

                const data = await response.json();
                const products = Array.isArray(data) ? data : data.items || [];
                setProducts(products.slice(0, limit));
            } catch (error) {
                console.error("Error fetching products:", error);
                setProducts(initialProducts.slice(0, limit));
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if filters have changed from initial state
        if (filters.category || filters.search || filters.min_price || filters.max_price) {
            fetchProducts();
        }
    }, [filters, limit, initialProducts]);

    const handleFilterChange = (key: string, value: any) => {
        startTransition(() => {
            setFilters((prev) => ({
                ...prev,
                [key]: value,
            }));
        });
    };

    const clearFilters = () => {
        setFilters({ sort_by: "newest" });
    };

    const hasActiveFilters = filters.category || filters.search || filters.min_price || filters.max_price;

    return (
        <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight italic">
                        {title}
                    </h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                        {subtitle}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Mobile Filter Toggle */}
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg font-bold text-xs uppercase tracking-wider"
                    >
                        <SlidersHorizontal size={16} />
                        Filters
                        {hasActiveFilters && (
                            <Badge variant="accent" size="sm" className="ml-1">
                                {(filters.category ? 1 : 0) +
                                    (filters.search ? 1 : 0) +
                                    (filters.min_price ? 1 : 0) +
                                    (filters.max_price ? 1 : 0)}
                            </Badge>
                        )}
                    </button>

                    {/* Sort Dropdown */}
                    <Select
                        placeholder="Sort by"
                        options={SORT_OPTIONS}
                        value={filters.sort_by}
                        onChange={(e) => handleFilterChange("sort_by", e.target.value)}
                        className="w-[160px] !py-2 !px-3 !text-xs"
                    />
                </div>
            </div>

            {/* Filters Bar */}
            <div
                className={`
                    ${showMobileFilters ? "block" : "hidden"}
                    lg:block mb-6 p-4 bg-white rounded-xl border border-gray-200
                `}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Category Filter */}
                    <Select
                        placeholder="All Categories"
                        options={[
                            { value: "", label: "All Categories" },
                            ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
                        ]}
                        value={filters.category || ""}
                        onChange={(e) => handleFilterChange("category", e.target.value)}
                    />

                    {/* Search Filter */}
                    <Input
                        placeholder="Search products..."
                        value={filters.search || ""}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                    />

                    {/* Price Range */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="Min Price"
                            type="number"
                            value={filters.min_price || ""}
                            onChange={(e) => handleFilterChange("min_price", e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                        <Input
                            placeholder="Max Price"
                            type="number"
                            value={filters.max_price || ""}
                            onChange={(e) => handleFilterChange("max_price", e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                    </div>

                    {/* Clear Button */}
                    <button
                        onClick={clearFilters}
                        disabled={!hasActiveFilters}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Products Grid */}
            {loading || isPending ? (
                <SkeletonGrid count={8} />
            ) : products.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={{
                                    id: product.id,
                                    name: product.name,
                                    description: product.description,
                                    price: product.price,
                                    category: product.category || "",
                                    image: product.images?.[0] || "",
                                    stock: product.stock,
                                    created_at: undefined,
                                    updated_at: undefined,
                                }}
                            />
                        ))}
                    </div>

                    {/* Load More */}
                    {products.length >= limit && (
                        <div className="mt-10 text-center">
                            <button
                                onClick={() => {
                                    // Implement load more logic
                                }}
                                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-wider transition-all shadow-lg hover:shadow-primary/30 hover:-translate-y-1"
                            >
                                Load More Products
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
                    <ShoppingCart className="text-gray-300 mb-4" size={48} />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-wider">
                        No products found
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        Try adjusting your filters or check back later
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            )}
        </section>
    );
}
