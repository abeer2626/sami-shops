import React from "react";

// ============================================================
// BADGE COMPONENT - Daraz Theme
// ============================================================

interface BadgeProps {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "accent" | "success" | "warning" | "error" | "info" | "discount";
    size?: "sm" | "md" | "lg";
    className?: string;
    dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = "primary",
    size = "md",
    className = "",
    dot = false,
}) => {
    const variants = {
        primary: "bg-primary/10 text-primary border-primary/20",
        secondary: "bg-secondary text-gray-700 border-gray-300",
        accent: "bg-accent/10 text-accent border-accent/20",
        success: "bg-success/10 text-success border-success/20",
        warning: "bg-warning/10 text-warning border-warning/20",
        error: "bg-error/10 text-error border-error/20",
        info: "bg-info/10 text-info border-info/20",
        discount: "bg-accent text-white border-accent",
    };

    const sizes = {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
            {children}
        </span>
    );
};

// ============================================================
// SPECIALIZED BADGES
// ============================================================

interface DiscountBadgeProps {
    percentage: number;
    className?: string;
}

export const DiscountBadge: React.FC<DiscountBadgeProps> = ({
    percentage,
    className = "",
}) => {
    return (
        <Badge variant="discount" size="sm" className={className}>
            {percentage}% OFF
        </Badge>
    );
};

interface StatusBadgeProps {
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "paid" | "failed";
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    className = "",
}) => {
    const statusConfig: Record<
        string,
        { variant: "primary" | "accent" | "success" | "warning" | "error" | "info"; label: string }
    > = {
        pending: { variant: "warning", label: "Pending" },
        processing: { variant: "info", label: "Processing" },
        shipped: { variant: "primary", label: "Shipped" },
        delivered: { variant: "success", label: "Delivered" },
        cancelled: { variant: "error", label: "Cancelled" },
        paid: { variant: "success", label: "Paid" },
        failed: { variant: "error", label: "Failed" },
    };

    const config = statusConfig[status] || { variant: "info", label: status };

    return (
        <Badge variant={config.variant} size="sm" className={className}>
            {config.label}
        </Badge>
    );
};

interface StockBadgeProps {
    stock: number;
    className?: string;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ stock, className = "" }) => {
    if (stock <= 0) {
        return <Badge variant="error" size="sm" className={className}>Out of Stock</Badge>;
    }
    if (stock <= 5) {
        return <Badge variant="warning" size="sm" className={className}>Low Stock</Badge>;
    }
    if (stock <= 10) {
        return <Badge variant="accent" size="sm" className={className}>Selling Fast</Badge>;
    }
    return <Badge variant="success" size="sm" className={className}>In Stock</Badge>;
};
