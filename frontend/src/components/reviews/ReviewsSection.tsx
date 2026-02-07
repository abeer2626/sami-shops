"use client";

import React, { useState, useEffect } from "react";
import { getProductReviews, getProductReviewsList, Review, ReviewSummary, ReviewCreate, ReviewUpdate } from "@/lib/api";
import { RatingDisplay, RatingBreakdown, ReviewList, ReviewListSkeleton, ReviewForm } from "./index";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui";

interface ReviewsSectionProps {
    productId: string;
}

export function ReviewsSection({ productId }: ReviewsSectionProps) {
    const [summary, setSummary] = useState<ReviewSummary | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<"recent" | "helpful">("recent");

    useEffect(() => {
        loadReviews();
    }, [productId, page, sort]);

    const loadReviews = async () => {
        setIsLoading(true);
        try {
            const [summaryData, reviewsData] = await Promise.all([
                getProductReviews(productId),
                getProductReviewsList(productId, page, 10, sort),
            ]);
            setSummary(summaryData);
            setReviews(reviewsData);
        } catch (error) {
            console.error("Failed to load reviews:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReviewSubmit = () => {
        setShowForm(false);
        setEditingReview(undefined);
        loadReviews();
    };

    const handleEditReview = (review: Review) => {
        setEditingReview(review);
        setShowForm(true);
    };

    const handleDeleteReview = (reviewId: string) => {
        loadReviews();
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
                    <Button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingReview(undefined);
                        }}
                        variant={showForm ? "outline" : "primary"}
                    >
                        {showForm ? "Cancel" : "Write a Review"}
                    </Button>
                </div>

                {summary && (
                    <div className="flex flex-col sm:flex-row gap-8">
                        {/* Average Rating */}
                        <div className="flex-shrink-0 text-center">
                            <div className="text-5xl font-black text-gray-900 mb-2">
                                {summary.averageRating.toFixed(1)}
                            </div>
                            <RatingDisplay rating={summary.averageRating} size="lg" variant="minimal" />
                            <p className="text-sm text-gray-500 mt-2">
                                Based on {summary.totalReviews} {summary.totalReviews === 1 ? "review" : "reviews"}
                            </p>
                        </div>

                        {/* Rating Distribution */}
                        <div className="flex-1">
                            <RatingBreakdown
                                distribution={summary.ratingDistribution}
                                totalReviews={summary.totalReviews}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Review Form */}
            {showForm && (
                <div className="mb-6">
                    <ReviewForm
                        productId={productId}
                        existingReview={editingReview}
                        onSubmit={handleReviewSubmit}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingReview(undefined);
                        }}
                    />
                </div>
            )}

            {/* Reviews List */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900">
                        Reviews ({summary?.totalReviews || 0})
                    </h3>
                    <select
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value as typeof sort);
                            setPage(1);
                        }}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="helpful">Most Helpful</option>
                    </select>
                </div>

                {isLoading ? (
                    <ReviewListSkeleton />
                ) : (
                    <ReviewList
                        reviews={reviews}
                        onEdit={handleEditReview}
                        onDelete={handleDeleteReview}
                        onUpdate={loadReviews}
                    />
                )}

                {/* Load More */}
                {summary && summary.totalReviews > reviews.length && (
                    <div className="mt-6 text-center">
                        <Button
                            onClick={() => setPage(page + 1)}
                            variant="outline"
                            className="w-full sm:w-auto"
                        >
                            Load More Reviews
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
