import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "danger" | "white";
    size?: "sm" | "md" | "lg" | "xl";
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ElementType;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className = "",
        variant = "primary",
        size = "md",
        loading = false,
        fullWidth = false,
        icon: Icon,
        children,
        disabled,
        ...props
    }, ref) => {

        // Base styles
        const baseStyles = "inline-flex items-center justify-center rounded-lg font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

        // Variant styles
        const variants = {
            primary: "bg-primary text-white hover:bg-primary/90 focus:ring-primary shadow-lg shadow-primary/30",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary",
            accent: "bg-accent text-white hover:bg-accent/90 focus:ring-accent shadow-lg shadow-accent/30",
            outline: "border-2 border-primary text-primary bg-transparent hover:bg-primary/5 focus:ring-primary",
            ghost: "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
            white: "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-sm",
        };

        // Size styles
        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-11 px-5 text-sm",
            lg: "h-12 px-8 text-base",
            xl: "h-14 px-10 text-lg",
        };

        const widthClass = fullWidth ? "w-full" : "";

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
                disabled={disabled || loading}
                {...props}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!loading && Icon && <Icon className="mr-2 h-4 w-4" />}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
