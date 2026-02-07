"use client";

import React from "react";
import { Slider, Filter, X, ChevronDown } from "lucide-react";
import { Category } from "@/lib/api";

interface SearchFiltersProps {
    categories: Category[];
    selectedCategory?: string;
    minPrice: number;
    maxPrice: number;
    onCategoryChange: (categoryId: string | undefined) => void;
    onPriceChange: (min: number, max: number) => void;
    onClear: () => void;
    minAvailablePrice?: number;
    maxAvailablePrice?: number;
}

export function SearchFiltersPanel({
    categories,
    selectedCategory,
    minPrice,
    maxPrice,
    onCategoryChange,
    onPriceChange,
    onClear,
    minAvailablePrice = 0,
    maxAvailablePrice = 50000,
}: SearchFiltersProps) {
    const [isExpanded, setIsExpanded] = React.useState(true);
    const [localMinPrice, setLocalMinPrice] = React.useState(minPrice);
    const [localMaxPrice, setLocalMaxPrice] = React.useState(maxPrice);

    const handleApplyPrice = () => {
        onPriceChange(localMinPrice, localMaxPrice);
    };

    const hasActiveFilters = selectedCategory || minPrice > minAvailablePrice || maxPrice < maxAvailablePrice;

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-primary" />
                    <span className="font-bold text-gray-900">Filters</span>
                    {hasActiveFilters && (
                        <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Active
                        </span>
                    )}
                </div>
                <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="p-4 pt-0 space-y-6">
                    {/* Category Filter */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Category</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            <button
                                onClick={() => onCategoryChange(undefined)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                    !selectedCategory
                                        ? "bg-primary text-white"
                                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                <span>All Categories</span>
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => onCategoryChange(category.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                        selectedCategory === category.id
                                            ? "bg-primary text-white"
                                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <span>{category.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Price Range (Rs.)</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <label className="text-[10px] text-gray-500 uppercase tracking-wider">Min</label>
                                    <input
                                        type="number"
                                        value={localMinPrice}
                                        onChange={(e) => setLocalMinPrice(Number(e.target.value))}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder={minAvailablePrice.toString()}
                                    />
                                </div>
                                <span className="text-gray-400 mt-5">—</span>
                                <div className="flex-1">
                                    <label className="text-[10px] text-gray-500 uppercase tracking-wider">Max</label>
                                    <input
                                        type="number"
                                        value={localMaxPrice}
                                        onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder={maxAvailablePrice.toString()}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleApplyPrice}
                                className="w-full py-2 bg-secondary text-primary font-bold text-sm rounded-lg hover:bg-secondary/80 transition-colors"
                            >
                                Apply Price Range
                            </button>
                        </div>
                    </div>

                    {/* Quick Price Filters */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Quick Filters</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: "Under Rs. 1,000", max: 1000 },
                                { label: "Rs. 1,000 - 5,000", min: 1000, max: 5000 },
                                { label: "Rs. 5,000 - 10,000", min: 5000, max: 10000 },
                                { label: "Rs. 10,000+", min: 10000 },
                            ].map((filter, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        const newMin = filter.min || minAvailablePrice;
                                        const newMax = filter.max || maxAvailablePrice;
                                        setLocalMinPrice(newMin);
                                        setLocalMaxPrice(newMax);
                                        onPriceChange(newMin, newMax);
                                    }}
                                    className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:border-primary hover:text-primary transition-colors"
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Clear All */}
                    {hasActiveFilters && (
                        <button
                            onClick={onClear}
                            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <X size={16} />
                            Clear All Filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
