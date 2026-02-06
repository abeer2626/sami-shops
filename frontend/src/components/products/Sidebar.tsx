"use client";

import { useState, useEffect } from "react";
import { Star, ChevronRight } from "lucide-react";

interface SidebarProps {
    onFilterChange: (filters: any) => void;
}

export default function Sidebar({ onFilterChange }: SidebarProps) {
    const [categories, setCategories] = useState<any[]>([]);
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedRating, setSelectedRating] = useState<number | null>(null);

    useEffect(() => {
        fetch("http://localhost:8000/api/v1/categories")
            .then(res => res.json())
            .then(data => setCategories(data));
    }, []);

    const applyFilters = () => {
        onFilterChange({
            category_id: selectedCategory,
            min_price: priceRange.min,
            max_price: priceRange.max,
            rating: selectedRating
        });
    };

    return (
        <aside className="w-64 flex-shrink-0 hidden lg:block p-4 bg-white border-r border-gray-100 min-h-screen">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-800 mb-6 italic border-b-2 border-primary w-fit pb-1">Filters</h2>

            {/* Categories */}
            <div className="mb-8">
                <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-[0.2em]">Category</h3>
                <div className="space-y-2">
                    <button
                        onClick={() => { setSelectedCategory(""); applyFilters(); }}
                        className={`text-xs font-bold block hover:text-primary transition-all uppercase ${selectedCategory === "" ? 'text-primary' : 'text-gray-600'}`}
                    >
                        All Categories
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setSelectedCategory(cat.id); applyFilters(); }}
                            className={`text-xs font-bold block hover:text-primary transition-all uppercase text-left ${selectedCategory === cat.id ? 'text-primary' : 'text-gray-600'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-8">
                <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-[0.2em]">Price Range</h3>
                <div className="flex items-center gap-2 mb-3">
                    <input
                        type="number" placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="w-full p-2 bg-gray-50 border border-gray-100 rounded-sm text-xs outline-none focus:border-primary"
                    />
                    <span className="text-gray-300">-</span>
                    <input
                        type="number" placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="w-full p-2 bg-gray-50 border border-gray-100 rounded-sm text-xs outline-none focus:border-primary"
                    />
                </div>
                <button
                    onClick={applyFilters}
                    className="w-full py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:brightness-110 shadow-lg shadow-primary/20 transition-all"
                >
                    Apply Price
                </button>
            </div>

            {/* Ratings */}
            <div className="mb-8">
                <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-[0.2em]">Ratings</h3>
                <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(star => (
                        <button
                            key={star}
                            onClick={() => { setSelectedRating(star); applyFilters(); }}
                            className={`flex items-center gap-2 group transition-all ${selectedRating === star ? 'scale-105' : ''}`}
                        >
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} fill={i < star ? "currentColor" : "none"} className={i < star ? "" : "text-gray-200"} />
                                ))}
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">& UP</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-10 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 italic">Pro Tip</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">Filter by category to get the most specific results for your needs.</p>
            </div>
        </aside>
    );
}
