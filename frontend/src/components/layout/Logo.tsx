'use client';

import Link from 'next/link';

interface LogoProps {
    variant?: 'default' | 'white' | 'black';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showTagline?: boolean;
    className?: string;
}

export default function Logo({
    variant = 'default',
    size = 'md',
    showTagline = false,
    className = ''
}: LogoProps) {

    // Size mappings
    const sizeClasses = {
        sm: 'text-2xl',
        md: 'text-4xl',
        lg: 'text-5xl',
        xl: 'text-6xl',
    };

    const taglineSizes = {
        sm: 'text-[10px]',
        md: 'text-xs',
        lg: 'text-sm',
        xl: 'text-base',
    };

    // Color variants
    const variantClasses = {
        default: {
            name: 'text-navy-900',
            suffix: 'text-orange-500',
            tagline: 'text-gray-500',
        },
        white: {
            name: 'text-white',
            suffix: 'text-orange-400',
            tagline: 'text-gray-300',
        },
        black: {
            name: 'text-black',
            suffix: 'text-gray-700',
            tagline: 'text-gray-600',
        },
    };

    const selectedVariant = variantClasses[variant];

    return (
        <Link href="/" className={`group inline-block ${className}`}>
            <div className="flex flex-col">
                <h1 className={`font-bold tracking-tighter ${sizeClasses[size]} leading-none select-none`}>
                    <span className={`${selectedVariant.name} transition-all duration-300`}>
                        Sami
                    </span>
                    <span
                        className={`
              ${selectedVariant.suffix} 
              transition-all duration-300 
              group-hover:scale-110 
              inline-block 
              origin-bottom-left
            `}
                    >
                        's
                    </span>
                </h1>
                {showTagline && (
                    <p className={`${taglineSizes[size]} ${selectedVariant.tagline} mt-0.5 tracking-wide uppercase font-medium`}>
                        Your Trusted Marketplace
                    </p>
                )}
            </div>
        </Link>
    );
}
