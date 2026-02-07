"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar, SearchFiltersPanel, SearchResultsHeader, SearchResultsGrid, SearchResultsSkeleton } from "@/components/search";
import { searchProducts, getCategories, Category } from "@/lib/api";

function SearchContent() {
    const searchParams = useSearchParams();
    const queryParam = searchParams.get("q") || "";
    const categoryParam = searchParams.get("category") || "";

    const [query, setQuery] = useState(queryParam);
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
        categoryParam || undefined
    );
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(50000);
    const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc" | "newest">("relevance");

    const limit = 20;

    // Load categories on mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const cats = await getCategories();
                setCategories(cats);
            } catch (error) {
                console.error("Failed to load categories:", error);
            }
        };
        loadCategories();
    }, []);

    // Fetch search results
    useEffect(() => {
        const fetchResults = async () => {
            setIsLoading(true);
            try {
                const results = await searchProducts({
                    query: query || undefined,
                    category_id: selectedCategory,
                    min_price: minPrice > 0 ? minPrice : undefined,
                    max_price: maxPrice < 50000 ? maxPrice : undefined,
                    sort: sortBy,
                    page,
                    limit,
                });

                setProducts(results.products);
                setTotal(results.total);
            } catch (error) {
                console.error("Search failed:", error);
                setProducts([]);
                setTotal(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [query, selectedCategory, minPrice, maxPrice, sortBy, page]);

    const handleSearch = (searchQuery: string) => {
        setQuery(searchQuery);
        setPage(1);
    };

    const handleCategoryChange = (categoryId: string | undefined) => {
        setSelectedCategory(categoryId);
        setPage(1);
    };

    const handlePriceChange = (min: number, max: number) => {
        setMinPrice(min);
        setMaxPrice(max);
        setPage(1);
    };

    const handleClearFilters = () => {
        setSelectedCategory(undefined);
        setMinPrice(0);
        setMaxPrice(50000);
        setPage(1);
    };

    const handleSortChange = (sort: typeof sortBy) => {
        setSortBy(sort);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Search Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <SearchBar
                        placeholder="Search for products..."
                        defaultValue={query}
                        onSearch={handleSearch}
                        className="max-w-2xl mx-auto"
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
                        <SearchFiltersPanel
                            categories={categories}
                            selectedCategory={selectedCategory}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            onCategoryChange={handleCategoryChange}
                            onPriceChange={handlePriceChange}
                            onClear={handleClearFilters}
                        />
                    </aside>

                    {/* Results */}
                    <main className="flex-1 min-w-0">
                        <SearchResultsHeader
                            products={products}
                            total={total}
                            query={query}
                            page={page}
                            limit={limit}
                            sortBy={sortBy}
                            onSortChange={handleSortChange}
                            onToggleFilters={() => setShowFilters(!showFilters)}
                            showFilters={showFilters}
                            onPageChange={setPage}
                        />

                        {isLoading ? (
                            <SearchResultsSkeleton />
                        ) : (
                            <SearchResultsGrid
                                products={products}
                                total={total}
                                page={page}
                                limit={limit}
                                onPageChange={setPage}
                            />
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SearchContent />
        </Suspense>
    );
}
