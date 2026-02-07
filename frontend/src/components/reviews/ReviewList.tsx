"use client";

import React from "react";
import { ThumbsUp, ShieldCheck, Trash2, Edit2, User } from "lucide-react";
import { Review, markReviewHelpful, deleteReview } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { RatingDisplay } from "./RatingDisplay";
import { Badge } from "@/components/ui";

interface ReviewListProps {
    reviews: Review[];
    onEdit?: (review: Review) => void;
    onDelete?: (reviewId: string) => void;
    onUpdate?: () => void;
}

export function ReviewList({ reviews, onEdit, onDelete, onUpdate }: ReviewListProps) {
    const { user, isAuthenticated } = useAuthStore();

    const handleMarkHelpful = async (reviewId: string) => {
        if (!isAuthenticated()) {
            alert("Please login to mark reviews as helpful");
            return;
        }

        try {
            await markReviewHelpful(reviewId);
            onUpdate?.();
        } catch (error) {
            console.error("Failed to mark review as helpful:", error);
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm("Are you sure you want to delete this review?")) {
            return;
        }

        try {
            await deleteReview(reviewId);
            onDelete?.(reviewId);
        } catch (error) {
            console.error("Failed to delete review:", error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500">Be the first to review this product!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => {
                const isOwner = user?.id === review.userId;
                const isAdmin = user?.role === "admin";

                return (
                    <div
                        key={review.id}
                        className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                        <User size={20} className="text-gray-500" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">
                                                {review.user?.name || "Anonymous User"}
                                            </span>
                                            {review.isVerified && (
                                                <Badge variant="success" size="sm">
                                                    <ShieldCheck size={10} className="mr-1" />
                                                    Verified Purchase
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <RatingDisplay rating={review.rating} size="sm" variant="minimal" />
                                            <span className="text-xs text-gray-400">
                                                {formatDate(review.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {(isOwner || isAdmin) && (
                                <div className="flex items-center gap-2">
                                    {isOwner && onEdit && (
                                        <button
                                            onClick={() => onEdit(review)}
                                            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                                            title="Edit review"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete review"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        {review.title && (
                            <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>
                        )}

                        {/* Comment */}
                        <p className="text-gray-700 text-sm leading-relaxed mb-4">
                            {review.comment}
                        </p>

                        {/* Images */}
                        {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mb-4">
                                {review.images.map((image, idx) => (
                                    <img
                                        key={idx}
                                        src={image}
                                        alt={`Review image ${idx + 1}`}
                                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <button
                                onClick={() => handleMarkHelpful(review.id)}
                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
                            >
                                <ThumbsUp size={16} />
                                Helpful ({review.helpful})
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Skeleton loader
export function ReviewListSkeleton() {
    return (
        <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse"
                >
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-24" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}
