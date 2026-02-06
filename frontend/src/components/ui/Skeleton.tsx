import { cn } from "@/lib/utils";

// ============================================================================
// Base Skeleton Component
// ============================================================================

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "rounded" | "text";
}

export function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  const variantClasses = {
    default: "rounded-md",
    circular: "rounded-full",
    rounded: "rounded-xl",
    text: "rounded-sm h-4",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-gray-100 dark:bg-gray-800",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

// ============================================================================
// Card Skeleton
// ============================================================================

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Image Skeleton */}
      <Skeleton variant="default" className="w-full h-48 rounded-t-xl" />
      <div className="p-4 space-y-3">
        {/* Title Skeleton */}
        <Skeleton className="w-3/4 h-5" />
        {/* Price Skeleton */}
        <Skeleton className="w-1/3 h-5" />
        {/* Description Skeleton */}
        <div className="space-y-2">
          <Skeleton className="w-full h-3" />
          <Skeleton className="w-5/6 h-3" />
        </div>
        {/* Button Skeleton */}
        <Skeleton className="w-full h-10 mt-4" />
      </div>
    </div>
  );
}

// ============================================================================
// Product Card Skeleton
// ============================================================================

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden group">
      {/* Image */}
      <Skeleton className="w-full h-48 sm:h-56" variant="default" />
      <div className="p-3 sm:p-4">
        {/* Category */}
        <Skeleton className="w-16 h-3 mb-2" variant="rounded" />
        {/* Title */}
        <Skeleton className="w-full h-5 sm:h-6 mb-2" />
        {/* Price Row */}
        <div className="flex items-center justify-between">
          <Skeleton className="w-20 h-5" />
          <Skeleton className="w-8 h-8" variant="circular" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Stats Card Skeleton
// ============================================================================

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10" variant="rounded" />
        <div className="flex-1">
          <Skeleton className="w-20 h-3 mb-2" />
          <Skeleton className="w-12 h-6" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Table Skeleton
// ============================================================================

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex gap-4 mb-4 pb-4 border-b border-gray-100">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 p-3">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-10 flex-1 min-w-[80px]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Hero Skeleton
// ============================================================================

export function HeroSkeleton() {
  return (
    <div className="relative bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl overflow-hidden">
      <div className="px-6 sm:px-12 py-16 sm:py-24">
        <div className="max-w-2xl">
          {/* Badge */}
          <Skeleton className="w-24 h-6 mb-6" variant="rounded" />
          {/* Title */}
          <div className="space-y-3 mb-6">
            <Skeleton className="w-full h-10 sm:h-14" />
            <Skeleton className="w-3/4 h-10 sm:h-14" />
          </div>
          {/* Subtitle */}
          <Skeleton className="w-full h-5 mb-8" />
          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <Skeleton className="w-36 h-12" variant="rounded" />
            <Skeleton className="w-36 h-12" variant="rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Product Detail Skeleton
// ============================================================================

export function ProductDetailSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      {/* Image Gallery */}
      <div className="space-y-4">
        <Skeleton className="w-full aspect-square rounded-2xl" />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-20 h-20 rounded-xl" />
          ))}
        </div>
      </div>
      {/* Product Info */}
      <div className="space-y-6">
        <Skeleton className="w-32 h-5" variant="rounded" />
        <div className="space-y-3">
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-3/4 h-8" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="w-24 h-8" />
          <Skeleton className="w-24 h-8" />
        </div>
        <Skeleton className="w-full h-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-32 h-12" variant="rounded" />
          <Skeleton className="flex-1 h-12" variant="rounded" />
        </div>
        <Skeleton className="w-full h-14" variant="rounded" />
      </div>
    </div>
  );
}

// ============================================================================
// Cart Item Skeleton
// ============================================================================

export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100">
      <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/3 h-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="w-24 h-8" variant="rounded" />
          <Skeleton className="w-16 h-5" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Order Card Skeleton
// ============================================================================

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-48 h-4" />
        </div>
        <Skeleton className="w-24 h-5" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-16 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Category Card Skeleton
// ============================================================================

export function CategoryCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer group">
      <div className="aspect-square relative overflow-hidden">
        <Skeleton className="w-full h-full" variant="default" />
      </div>
      <div className="p-4">
        <Skeleton className="w-3/4 h-5 mx-auto" />
      </div>
    </div>
  );
}

// ============================================================================
// User Profile Skeleton
// ============================================================================

export function UserProfileSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
      <Skeleton className="w-16 h-16 rounded-full" variant="circular" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-32 h-5" />
        <Skeleton className="w-48 h-4" />
      </div>
      <Skeleton className="w-24 h-8" variant="rounded" />
    </div>
  );
}

// ============================================================================
// Input Skeleton
// ============================================================================

export function InputSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton className={cn("w-full h-12", className)} variant="rounded" />
  );
}

// ============================================================================
// Review Card Skeleton
// ============================================================================

export function ReviewCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-start gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-full" variant="circular" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-20 h-3" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-5/6 h-4" />
        <Skeleton className="w-4/6 h-4" />
      </div>
    </div>
  );
}

// ============================================================================
// Skeleton Grid (for product grids)
// ============================================================================

interface SkeletonGridProps {
  count?: number;
  component?: React.ComponentType;
}

export function SkeletonGrid({
  count = 8,
  component: Component = ProductCardSkeleton,
}: SkeletonGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}
