import React from 'react';
import Link from 'next/link';
import { Product, ProductFlashPrice } from '@/lib/api';
import { ShoppingCart, Star, Zap } from 'lucide-react';
import { DiscountBadge, StockBadge } from './Badge';
import { CountdownBadge } from '../flashsale/FlashSaleBadge';
import { RatingDisplay } from '../reviews/RatingDisplay';

interface ProductCardProps {
    product: Product;
    featured?: boolean;
    flashPrice?: ProductFlashPrice;
    flashEndTime?: Date | string | number;
    rating?: number;
    reviewCount?: number;
}

const ProductCardComponent = ({ product, featured = false, flashPrice, flashEndTime, rating, reviewCount }: ProductCardProps) => {
    const isInFlashSale = flashPrice?.inFlashSale && flashPrice.salePrice;
    const displayPrice = isInFlashSale ? flashPrice.salePrice! : product.price;
    const originalPrice = product.price;
    const discountPercent = flashPrice?.discountPercent || Math.round(((originalPrice - displayPrice) / originalPrice) * 100);
    const timeRemaining = flashPrice?.timeRemaining;

    return (
        <Link href={`/product/${product.id}`} className="group h-full block">
            <div className={`bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full border border-gray-100 flex flex-col relative ${featured ? 'ring-2 ring-accent ring-offset-2' : ''} ${isInFlashSale ? 'ring-1 ring-accent' : ''}`}>

                {/* Discount Badge */}
                {isInFlashSale && discountPercent > 0 ? (
                    <div className="absolute top-3 left-3 z-10">
                        <span className="bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <Zap size={10} className="fill-white" />
                            {discountPercent}% OFF
                        </span>
                        {featured && (
                            <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm ml-1 mt-1 inline-block">
                                FEATURED
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="absolute top-3 left-3 z-10">
                        {discountPercent > 0 && (
                            <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                {discountPercent}% OFF
                            </span>
                        )}
                        {featured && (
                            <span className="bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm ml-1 mt-1 inline-block">
                                FEATURED
                            </span>
                        )}
                    </div>
                )}

                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                    {/* Fallback image logic is handled by next/image usually, but using img user here for simplicity as per existing patterns */}
                    <img
                        src={product.image || "https://via.placeholder.com/300"}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Flash Sale Countdown Overlay */}
                    {isInFlashSale && flashEndTime && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <CountdownBadge timeRemaining={Math.floor(timeRemaining || 0)} label="Ends in" />
                        </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {/* Could put quick view button here */}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-sm text-gray-700 font-medium line-clamp-2 leading-relaxed group-hover:text-primary transition-colors mb-2 min-h-[2.5em]">
                        {product.name}
                    </h3>

                    {/* Rating Display */}
                    {rating !== undefined ? (
                        <div className="flex items-center gap-1 mb-2">
                            <RatingDisplay rating={rating} size="sm" variant="minimal" />
                            {reviewCount !== undefined && reviewCount > 0 && (
                                <span className="text-[10px] text-gray-400 ml-1">({reviewCount})</span>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 mb-2">
                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                            <Star size={12} className="text-gray-300" />
                            <span className="text-[10px] text-gray-400 ml-1">(45)</span>
                        </div>
                    )}

                    <div className="mt-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className={`font-bold text-lg ${isInFlashSale ? 'text-accent' : 'text-primary'}`}>
                                    Rs. {displayPrice.toLocaleString()}
                                </span>
                                {isInFlashSale && (
                                    <p className="text-[10px] text-gray-400 line-through">Rs. {originalPrice.toLocaleString()}</p>
                                )}
                            </div>

                            <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${isInFlashSale ? 'bg-accent text-white hover:bg-orange-600' : 'bg-secondary hover:bg-accent hover:text-white text-primary'}`}>
                                <ShoppingCart size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

// Skeleton Component for loading state
const ProductCardSkeleton = () => {
    return (
        <div className="bg-white rounded-xl overflow-hidden border border-gray-100 h-full">
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="flex items-center justify-between">
                    <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                </div>
            </div>
        </div>
    );
};

// Assign sub-components
export const ProductCard = Object.assign(ProductCardComponent, {
    Skeleton: ProductCardSkeleton,
});

export default ProductCard;
