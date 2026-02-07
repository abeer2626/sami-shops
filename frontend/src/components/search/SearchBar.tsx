"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, Clock, Tag, Package } from "lucide-react";
import { getSearchAutocomplete, SearchAutocomplete } from "@/lib/api";
import { useRouter } from "next/navigation";

interface SearchBarProps {
    placeholder?: string;
    variant?: "default" | "compact" | "minimal";
    autoFocus?: boolean;
    defaultValue?: string;
    onSearch?: (query: string) => void;
    className?: string;
}

// Custom hook for debounced value
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function SearchBar({
    placeholder = "Search for products, brands, and more...",
    variant = "default",
    autoFocus = false,
    defaultValue = "",
    onSearch,
    className = "",
}: SearchBarProps) {
    const [query, setQuery] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<SearchAutocomplete | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    const debouncedQuery = useDebounce(query, 300);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Load recent searches from localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("recent_searches");
            if (saved) {
                setRecentSearches(JSON.parse(saved));
            }
        }
    }, []);

    // Fetch autocomplete results
    useEffect(() => {
        const fetchResults = async () => {
            if (debouncedQuery.trim().length >= 2) {
                setIsLoading(true);
                try {
                    const data = await getSearchAutocomplete(debouncedQuery);
                    setResults(data);
                    setSelectedIndex(-1);
                } catch (error) {
                    console.error("Search error:", error);
                    setResults(null);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults(null);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !inputRef.current?.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const items = getAllItems();
            if (!items.length) return;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
                    break;
                case "Enter":
                    e.preventDefault();
                    if (selectedIndex >= 0 && items[selectedIndex]) {
                        handleItemClick(items[selectedIndex]);
                    } else if (query.trim()) {
                        handleSearch(query);
                    }
                    break;
                case "Escape":
                    setIsOpen(false);
                    inputRef.current?.blur();
                    break;
            }
        },
        [selectedIndex, query]
    );

    const getAllItems = () => {
        const items: Array<{ type: string; value: string; url?: string }> = [];

        // Add suggestions
        results?.suggestions.forEach((s) => items.push({ type: "suggestion", value: s }));

        // Add products
        results?.products.forEach((p) =>
            items.push({ type: "product", value: p.name, url: `/product/${p.id}` })
        );

        // Add categories
        results?.categories.forEach((c) =>
            items.push({ type: "category", value: c.name, url: `/category/${c.slug}` })
        );

        return items;
    };

    const handleItemClick = (item: { type: string; value: string; url?: string }) => {
        if (item.url) {
            router.push(item.url);
        } else {
            handleSearch(item.value);
        }
        setIsOpen(false);
    };

    const handleSearch = (searchQuery: string) => {
        const trimmedQuery = searchQuery.trim();
        if (!trimmedQuery) return;

        // Save to recent searches
        const newRecentSearches = [
            trimmedQuery,
            ...recentSearches.filter((s) => s !== trimmedQuery),
        ].slice(0, 5);
        setRecentSearches(newRecentSearches);
        localStorage.setItem("recent_searches", JSON.stringify(newRecentSearches));

        if (onSearch) {
            onSearch(trimmedQuery);
        } else {
            router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
        }
        setIsOpen(false);
    };

    const clearSearch = () => {
        setQuery("");
        setResults(null);
        inputRef.current?.focus();
    };

    if (variant === "minimal") {
        return (
            <div className={`relative ${className}`}>
                <div className="relative flex items-center">
                    <Search size={16} className="absolute left-3 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    {query && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <div className={`relative ${className}`}>
                <div className="relative flex items-center">
                    <Search size={14} className="absolute left-2.5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        className="w-full pl-8 pr-6 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
            </div>
        );
    }

    // Default variant
    return (
        <div className={`relative ${className}`}>
            <div className="relative flex items-center bg-white rounded-xl shadow-sm border border-gray-200 hover:border-primary/50 transition-colors">
                <Search size={20} className="absolute left-4 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="flex-1 pl-12 pr-12 py-3.5 text-base bg-transparent focus:outline-none placeholder:text-gray-400"
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-14 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <X size={18} />
                    </button>
                )}
                <button
                    onClick={() => handleSearch(query)}
                    className="absolute right-2 bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
                >
                    Search
                </button>
            </div>

            {/* Autocomplete Dropdown */}
            {isOpen && (query.trim().length >= 2 || recentSearches.length > 0) && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                >
                    {isLoading && (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                        </div>
                    )}

                    {!isLoading && (
                        <>
                            {/* Results */}
                            {results && (results.suggestions.length > 0 || results.products.length > 0 || results.categories.length > 0) ? (
                                <div className="max-h-96 overflow-y-auto">
                                    {/* Products */}
                                    {results.products.length > 0 && (
                                        <div className="p-2">
                                            <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Products
                                            </div>
                                            {results.products.map((product, idx) => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => handleItemClick({ type: "product", value: product.name, url: `/product/${product.id}` })}
                                                    onMouseEnter={() => setSelectedIndex(idx)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                                        selectedIndex === idx ? "bg-secondary" : "hover:bg-gray-50"
                                                    }`}
                                                >
                                                    <img
                                                        src={product.image || "https://via.placeholder.com/40"}
                                                        alt={product.name}
                                                        className="w-10 h-10 rounded-md object-cover"
                                                    />
                                                    <div className="flex-1 text-left">
                                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                        <div className="text-xs text-gray-500">Rs. {product.price.toLocaleString()}</div>
                                                    </div>
                                                    <Package size={14} className="text-gray-400" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Categories */}
                                    {results.categories.length > 0 && (
                                        <div className="p-2 border-t border-gray-100">
                                            <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Categories
                                            </div>
                                            {results.categories.map((category, idx) => (
                                                <button
                                                    key={category.id}
                                                    onClick={() => handleItemClick({ type: "category", value: category.name, url: `/category/${category.slug}` })}
                                                    onMouseEnter={() => setSelectedIndex(results!.products.length + idx)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                                        selectedIndex === results!.products.length + idx ? "bg-secondary" : "hover:bg-gray-50"
                                                    }`}
                                                >
                                                    <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                                                        <Tag size={16} className="text-primary" />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                                        <div className="text-xs text-gray-500">Browse category</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Suggestions */}
                                    {results.suggestions.length > 0 && (
                                        <div className="p-2 border-t border-gray-100">
                                            <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Suggestions
                                            </div>
                                            {results.suggestions.map((suggestion, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleItemClick({ type: "suggestion", value: suggestion })}
                                                    onMouseEnter={() => setSelectedIndex(results!.products.length + results!.categories.length + idx)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                                        selectedIndex === results!.products.length + results!.categories.length + idx ? "bg-secondary" : "hover:bg-gray-50"
                                                    }`}
                                                >
                                                    <Search size={16} className="text-gray-400" />
                                                    <span className="text-sm text-gray-700">{suggestion}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Recent Searches */}
                                    {recentSearches.length > 0 && query.trim().length < 2 && (
                                        <div className="p-3">
                                            <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                                <Clock size={12} />
                                                Recent Searches
                                            </div>
                                            {recentSearches.map((search, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSearch(search)}
                                                    onMouseEnter={() => setSelectedIndex(idx)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                                                        selectedIndex === idx ? "bg-secondary" : "hover:bg-gray-50"
                                                    }`}
                                                >
                                                    <Clock size={14} className="text-gray-400" />
                                                    <span className="text-sm text-gray-700">{search}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* No Results */}
                                    {query.trim().length >= 2 && (!results || results.suggestions.length === 0) && (
                                        <div className="p-6 text-center text-gray-500 text-sm">
                                            <Search size={32} className="mx-auto mb-2 text-gray-300" />
                                            <p>No results found for "{query}"</p>
                                            <p className="text-xs mt-1">Try different keywords</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// Export the debounce hook for use in other components
export { useDebounce };
