import React, { forwardRef } from "react";

// ============================================================
// INPUT COMPONENT - Daraz Theme
// ============================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: React.ElementType;
    iconPosition?: "left" | "right";
    containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            helperText,
            icon: Icon,
            iconPosition = "left",
            containerClassName = "",
            className = "",
            disabled,
            ...props
        },
        ref
    ) => {
        const inputWrapperClass = Icon
            ? iconPosition === "left"
                ? "pl-11"
                : "pr-11"
            : "";

        const iconClass = iconPosition === "left" ? "left-3" : "right-3";

        return (
            <div className={`w-full ${containerClassName}`}>
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {Icon && (
                        <div
                            className={`absolute ${iconClass} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}
                        >
                            <Icon size={18} />
                        </div>
                    )}

                    <input
                        ref={ref}
                        disabled={disabled}
                        className={`
                            w-full px-4 py-3 rounded-lg border
                            transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-primary/20
                            ${error ? "border-error focus:border-error" : "border-gray-300 focus:border-primary"}
                            ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"}
                            ${inputWrapperClass}
                            ${className}
                        `}
                        {...props}
                    />
                </div>

                {error && (
                    <p className="mt-1.5 text-sm text-error flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {error}
                    </p>
                )}

                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

// ============================================================
// SELECT COMPONENT
// ============================================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
    containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            label,
            error,
            helperText,
            options,
            placeholder = "Select an option",
            containerClassName = "",
            className = "",
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <div className={`w-full ${containerClassName}`}>
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {label}
                    </label>
                )}

                <select
                    ref={ref}
                    disabled={disabled}
                    className={`
                        w-full px-4 py-3 rounded-lg border appearance-none
                        bg-white
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-primary/20
                        ${error ? "border-error focus:border-error" : "border-gray-300 focus:border-primary"}
                        ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}
                        ${className}
                    `}
                    {...props}
                >
                    <option value="" disabled>
                        {placeholder}
                    </option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {error && (
                    <p className="mt-1.5 text-sm text-error flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {error}
                    </p>
                )}

                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Select.displayName = "Select";

// ============================================================
// TEXTAREA COMPONENT
// ============================================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            label,
            error,
            helperText,
            containerClassName = "",
            className = "",
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <div className={`w-full ${containerClassName}`}>
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {label}
                    </label>
                )}

                <textarea
                    ref={ref}
                    disabled={disabled}
                    rows={4}
                    className={`
                        w-full px-4 py-3 rounded-lg border
                        transition-all duration-200 resize-none
                        focus:outline-none focus:ring-2 focus:ring-primary/20
                        ${error ? "border-error focus:border-error" : "border-gray-300 focus:border-primary"}
                        ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"}
                        ${className}
                    `}
                    {...props}
                />

                {error && (
                    <p className="mt-1.5 text-sm text-error flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {error}
                    </p>
                )}

                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";
