"use client";

import React from "react";
import { Star, StarHalf } from "lucide-react";

interface RatingDisplayProps {
    rating: number;
    maxRating?: number;
    size?: "sm" | "md" | "lg";
    showValue?: boolean;
    showCount?: boolean;
    count?: number;
    variant?: "default" | "minimal" | "compact";
    className?: string;
}

export function RatingDisplay({
    rating,
    maxRating = 5,
    size = "md",
    showValue = false,
    showCount = false,
    count,
    variant = "default",
    className = "",
}: RatingDisplayProps) {
    const sizeClasses = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5",
    };

    const textSizeClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
    };

    const renderStars = () => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Star
                    key={`full-${i}`}
                    className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`}
                />
            );
        }

        // Half star
        if (hasHalfStar) {
            stars.push(
                <div key="half" className={`relative ${sizeClasses[size]}`}>
                    <Star className="fill-gray-200 text-gray-200" />
                    <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                        <Star className="fill-yellow-400 text-yellow-400" />
                    </div>
                </div>
            );
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <Star
                    key={`empty-${i}`}
                    className={`${sizeClasses[size]} fill-gray-200 text-gray-200`}
                />
            );
        }

        return stars;
    };

    if (variant === "minimal") {
        return (
            <div className={`flex items-center gap-1 ${className}`}>
                {renderStars()}
                {showValue && (
                    <span className={`${textSizeClasses[size]} font-medium text-gray-700 ml-1`}>
                        {rating.toFixed(1)}
                    </span>
                )}
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <div className={`flex items-center gap-1.5 ${className}`}>
                <span className={`font-black text-accent ${textSizeClasses[size]}`}>
                    {rating.toFixed(1)}
                </span>
                <div className="flex items-center">
                    {renderStars().slice(0, 5)}
                </div>
                {showCount && count !== undefined && (
                    <span className={`text-gray-500 ${textSizeClasses[size]}`}>
                        ({count})
                    </span>
                )}
            </div>
        );
    }

    // Default variant
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="flex items-center">
                {renderStars()}
            </div>
            {showValue && (
                <span className={`font-bold text-gray-900 ${textSizeClasses[size]}`}>
                    {rating.toFixed(1)}
                </span>
            )}
            {showCount && count !== undefined && (
                <span className={`text-gray-500 ${textSizeClasses[size]}`}>
                    ({count} {count === 1 ? "review" : "reviews"})
                </span>
            )}
        </div>
    );
}

// Interactive star rating for form inputs
interface RatingInputProps {
    value: number;
    onChange: (rating: number) => void;
    maxRating?: number;
    size?: "sm" | "md" | "lg";
    readonly?: boolean;
    className?: string;
}

export function RatingInput({
    value,
    onChange,
    maxRating = 5,
    size = "md",
    readonly = false,
    className = "",
}: RatingInputProps) {
    const [hoverValue, setHoverValue] = React.useState(0);

    const sizeClasses = {
        sm: "w-5 h-5",
        md: "w-7 h-7",
        lg: "w-9 h-9",
    };

    const handleMouseEnter = (rating: number) => {
        if (!readonly) {
            setHoverValue(rating);
        }
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverValue(0);
        }
    };

    const handleClick = (rating: number) => {
        if (!readonly) {
            onChange(rating);
        }
    };

    const displayValue = hoverValue || value;

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {Array.from({ length: maxRating }).map((_, index) => {
                const starValue = index + 1;
                const isFilled = starValue <= displayValue;

                return (
                    <button
                        key={starValue}
                        type="button"
                        onMouseEnter={() => handleMouseEnter(starValue)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(starValue)}
                        disabled={readonly}
                        className={`transition-transform hover:scale-110 ${
                            readonly ? "cursor-default" : "cursor-pointer"
                        }`}
                        aria-label={`Rate ${starValue} stars`}
                    >
                        <Star
                            className={`${sizeClasses[size]} ${
                                isFilled
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-200"
                            } transition-colors`}
                        />
                    </button>
                );
            })}
        </div>
    );
}

// Rating breakdown component
interface RatingBreakdownProps {
    distribution: {
        "5": number;
        "4": number;
        "3": number;
        "2": number;
        "1": number;
    };
    totalReviews: number;
}

export function RatingBreakdown({ distribution, totalReviews }: RatingBreakdownProps) {
    const getPercentage = (count: number) => {
        return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    };

    return (
        <div className="space-y-2">
            {Object.entries(distribution)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([star, count]) => {
                    const percentage = getPercentage(count);

                    return (
                        <div key={star} className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700 w-8">
                                {star} <span className="text-gray-400">★</span>
                            </span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="text-sm text-gray-500 w-10 text-right">
                                {count}
                            </span>
                        </div>
                    );
                })}
        </div>
    );
}
