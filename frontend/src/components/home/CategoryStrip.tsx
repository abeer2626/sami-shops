"use client";

import Link from "next/link";
import { Smartphone, Laptop, Headphones, Watch, Camera, Gamepad2, Tablet, Sparkles, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface Category {
    id: string;
    name: string;
    slug?: string;
    icon?: string;
    product_count?: number;
}

interface CategoryStripProps {
    categories?: Category[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    "Smartphones": <Smartphone size={20} />,
    "Laptops": <Laptop size={20} />,
    "Audio": <Headphones size={20} />,
    "Watches": <Watch size={20} />,
    "Cameras": <Camera size={20} />,
    "Gaming": <Gamepad2 size={20} />,
    "Tablets": <Tablet size={20} />,
};

const DEFAULT_CATEGORIES = [
    { id: "all", name: "All", slug: "" },
    { id: "smartphones", name: "Smartphones", slug: "smartphones" },
    { id: "laptops", name: "Laptops", slug: "laptops" },
    { id: "audio", name: "Audio", slug: "audio" },
    { id: "watches", name: "Watches", slug: "watches" },
    { id: "cameras", name: "Cameras", slug: "cameras" },
    { id: "gaming", name: "Gaming", slug: "gaming" },
    { id: "tablets", name: "Tablets", slug: "tablets" },
];

export function CategoryStrip({ categories = DEFAULT_CATEGORIES }: CategoryStripProps) {
    const [activeCategory, setActiveCategory] = useState("all");

    const handleCategoryClick = (categoryId: string, slug: string) => {
        setActiveCategory(categoryId);
        // Emit event or update URL
        if (slug) {
            const url = new URL(window.location.href);
            url.searchParams.set("category", slug);
            window.history.pushState({}, "", url.toString());
            window.dispatchEvent(new PopStateEvent("popstate"));
        }
    };

    return (
        <section
            id="categories"
            className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
                    {categories.map((category) => {
                        const isActive = activeCategory === category.id;
                        const isAll = category.id === "all";
                        const icon = CATEGORY_ICONS[category.name] || <Sparkles size={20} />;

                        return (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id, category.slug || "")}
                                className={`
                                    flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl
                                    font-bold uppercase text-xs tracking-wider transition-all
                                    ${isActive
                                        ? "bg-primary text-white shadow-md"
                                        : "bg-gray-100 text-gray-700 hover:bg-primary/10 hover:text-primary"
                                    }
                                `}
                            >
                                {isAll ? <Sparkles size={16} /> : icon}
                                {category.name}
                                {!isAll && category.product_count !== undefined && (
                                    <span className="ml-1 text-[9px] opacity-70">({category.product_count})</span>
                                )}
                            </button>
                        );
                    })}

                    {/* View All Categories Link */}
                    <Link
                        href="/categories"
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl
                                   font-bold uppercase text-xs tracking-wider transition-all
                                   bg-gray-50 text-gray-600 hover:bg-gray-200"
                    >
                        View All
                        <ChevronRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
