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
      image: images?.[0] || "/placeholder.png",
      quantity: 1
    });
  };

  const originalPrice = price * 1.35;
  const discount = 35;
  const rating = 4;
  const reviewCount = Math.floor(Math.random() * 50 + 5);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col h-full relative">
      {/* Discount Badge */}
      <div className="absolute top-3 left-3 z-10 bg-primary text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg">
        -{discount}%
      </div>

      {/* Wishlist Button */}
      <button className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-gray-100">
        <Heart size={14} fill="none" />
      </button>

      {/* Image Area */}
      <Link href={`/product/${id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50 flex-shrink-0">
        {images?.[0] ? (
          <Image
            src={images[0]}
            alt={name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <ShoppingCart size={48} />
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Brand / Category */}
        <p className="text-[9px] font-black text-primary/50 uppercase tracking-[0.2em] mb-1">SAMISHOPS</p>

        <Link href={`/product/${id}`} className="block mb-2">
          <h3 className="text-xs font-black text-gray-900 line-clamp-2 min-h-[34px] group-hover:text-primary transition-colors uppercase tracking-tight leading-tight">
            {name}
          </h3>
        </Link>

        {/* Ratings */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={10}
                fill={i < rating ? "currentColor" : "none"}
                className={i < rating ? "" : "text-gray-200"}
              />
            ))}
          </div>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
            ({reviewCount})
          </span>
        </div>

        {/* Pricing and Add to Cart */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3">
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
            className="w-full py-3 bg-gray-900 text-white rounded-xl flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.15em] hover:bg-primary hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg hover:shadow-primary/20"
          >
            <ShoppingCart size={14} />
            ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
}
