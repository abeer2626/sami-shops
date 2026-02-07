import React from "react";

// ============================================================
// CARD COMPONENT - Daraz Theme
// ============================================================

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "bordered" | "elevated" | "flat";
    hover?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = "",
    variant = "default",
    hover = false,
    onClick,
}) => {
    const variants = {
        default: "bg-white rounded-xl shadow-md",
        bordered: "bg-white rounded-xl border border-gray-200",
        elevated: "bg-white rounded-xl shadow-lg",
        flat: "bg-white rounded-xl",
    };

    const hoverClass = hover ? "hover:shadow-lg hover:-translate-y-1" : "";
    const cursorClass = onClick ? "cursor-pointer" : "";

    return (
        <div
            className={`${variants[variant]} ${hoverClass} ${cursorClass} transition-all duration-300 ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
    children,
    className = "",
}) => {
    return <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
};

interface CardBodyProps {
    children: React.ReactNode;
    className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
    children,
    className = "",
}) => {
    return <div className={`p-4 sm:p-6 pt-0 ${className}`}>{children}</div>;
};

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
    children,
    className = "",
}) => {
    return (
        <div className={`p-4 sm:p-6 pt-0 border-t border-gray-100 mt-4 ${className}`}>
            {children}
        </div>
    );
};
