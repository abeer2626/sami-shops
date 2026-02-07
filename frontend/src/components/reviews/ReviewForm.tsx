"use client";

import React, { useState } from "react";
import { X, Star } from "lucide-react";
import { createReview, updateReview, Review, ReviewCreate, ReviewUpdate } from "@/lib/api";
import { RatingInput } from "./RatingDisplay";
import { useAuthStore } from "@/store/useAuthStore";

interface ReviewFormProps {
    productId: string;
    existingReview?: Review;
    onSubmit?: () => void;
    onCancel?: () => void;
}

export function ReviewForm({ productId, existingReview, onSubmit, onCancel }: ReviewFormProps) {
    const { user, isAuthenticated } = useAuthStore();
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [title, setTitle] = useState(existingReview?.title || "");
    const [comment, setComment] = useState(existingReview?.comment || "");
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const isEditing = !!existingReview;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated()) {
            setError("Please login to submit a review");
            return;
        }

        if (rating === 0) {
            setError("Please select a rating");
            return;
        }

        if (!comment.trim()) {
            setError("Please write a review");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            if (isEditing && existingReview) {
                const updateData: ReviewUpdate = {
                    rating,
                    title: title.trim() || undefined,
                    comment: comment.trim(),
                };
                await updateReview(existingReview.id, updateData);
            } else {
                const createData: ReviewCreate = {
                    productId,
                    rating,
                    title: title.trim() || undefined,
                    comment: comment.trim(),
                };
                await createReview(createData);
            }

            onSubmit?.();
        } catch (err: any) {
            setError(err.detail || "Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRatingChange = (newRating: number) => {
        setRating(newRating);
    };

    if (!isAuthenticated()) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Login to Review</h3>
                <p className="text-gray-500 mb-4">Please login to share your thoughts about this product.</p>
                <button
                    onClick={() => window.location.href = "/login"}
                    className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors"
                >
                    Login
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                    {isEditing ? "Edit Your Review" : "Write a Review"}
                </h3>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                        <RatingInput
                            value={rating}
                            onChange={handleRatingChange}
                            size="lg"
                        />
                        {rating > 0 && (
                            <span className="text-sm font-medium text-primary">
                                {rating}/5
                            </span>
                        )}
                    </div>
                </div>

                {/* Title (Optional) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Title <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Summarize your review"
                        maxLength={100}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts about this product..."
                        rows={5}
                        maxLength={1000}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">{comment.length}/1000 characters</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Guidelines */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 font-medium mb-2">Review Guidelines:</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Focus on the product and your experience</li>
                        <li>• Be honest and detailed in your review</li>
                        <li>• Avoid offensive language or personal attacks</li>
                        <li>• Only verified purchases will show the "Verified Purchase" badge</li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="px-6 py-3 border border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
