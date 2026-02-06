"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { useCart } from "@/store/useCart";

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    images: string[];
    description: string;
}

export default function ProductCard({ id, name, price, images, description }: ProductCardProps) {
    const { addItem } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            id,
            name,
            price,
            image: images[0] || "/placeholder.png",
            quantity: 1
        });
    };

    const originalPrice = price * 1.35; // Mocking a discount
    const discount = 35;

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-500 group border border-gray-100 flex flex-col h-full relative">
            {/* Discount Badge */}
            <div className="absolute top-3 left-3 z-10 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter shadow-lg">
                -{discount}% OFF
            </div>

            {/* Wishlist Button */}
            <button className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-gray-100">
                <Heart size={14} />
            </button>

            {/* Image Area */}
            <Link href={`/product/${id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50 flex-shrink-0">
                <Image
                    src={images[0] || "/placeholder.png"}
                    alt={name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-700"
                />
            </Link>

            {/* Content Area */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Brand / Category Mock */}
                <p className="text-[9px] font-black text-primary/40 uppercase tracking-[0.2em] mb-1">REVEAL PREMIUM</p>

                <Link href={`/product/${id}`} className="block mb-2">
                    <h3 className="text-xs font-black text-gray-800 line-clamp-2 min-h-[34px] group-hover:text-primary transition-colors uppercase tracking-tight leading-tight">
                        {name}
                    </h3>
                </Link>

                {/* Ratings */}
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} fill="currentColor" className={i < 4 ? "" : "text-gray-200"} />
                        ))}
                    </div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">(12)</span>
                </div>

                {/* Pricing Area */}
                <div className="mt-auto">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-primary italic">
                            <span className="text-xs font-bold not-italic">Rs.</span> {price.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-gray-300 line-through">
                            Rs. {originalPrice.toLocaleString()}
                        </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className="w-full mt-4 py-3 bg-gray-900 text-white rounded-lg flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.15em] hover:bg-primary hover:translate-y-[-2px] active:translate-y-0 transition-all shadow-xl shadow-gray-200 hover:shadow-primary/20"
                    >
                        <ShoppingCart size={14} className="group-hover:animate-bounce" />
                        ADD TO CART
                    </button>
                </div>
            </div>
        </div>
    );
}
