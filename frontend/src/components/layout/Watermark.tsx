'use client';

import { usePathname } from 'next/navigation';

interface WatermarkProps {
    theme?: 'light' | 'dark' | 'auto';
    intensity?: 'subtle' | 'normal' | 'visible';
    position?: 'bottom-right' | 'bottom-left' | 'center';
}

export default function Watermark({
    theme = 'auto',
    intensity = 'subtle',
    position = 'bottom-right'
}: WatermarkProps) {
    const pathname = usePathname();

    // Don't show on auth pages, error pages, or print layouts
    const hiddenPaths = ['/login', '/signup', '/register', '/auth', '/404', '/500', '/print'];
    if (hiddenPaths.some(path => pathname.startsWith(path))) {
        return null;
    }

    // Auto-detect theme based on page
    const isDark = theme === 'dark' ||
        (theme === 'auto' && (
            pathname.startsWith('/admin') ||
            pathname.startsWith('/vendor') ||
            pathname.startsWith('/dashboard')
        ));

    // Opacity levels
    const opacityMap = {
        subtle: isDark ? 'opacity-[0.06]' : 'opacity-[0.04]',
        normal: isDark ? 'opacity-[0.10]' : 'opacity-[0.06]',
        visible: isDark ? 'opacity-[0.15]' : 'opacity-[0.08]',
    };

    // Position mappings
    const positionClasses = {
        'bottom-right': 'bottom-8 right-8 rotate-[-12deg] origin-bottom-right',
        'bottom-left': 'bottom-8 left-8 rotate-[12deg] origin-bottom-left',
        'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg]',
    };

    return (
        <div
            className={`
        fixed
        pointer-events-none 
        select-none
        z-[1]
        ${positionClasses[position]}
        ${opacityMap[intensity]}
        transition-opacity duration-500
      `}
            aria-hidden="true"
        >
            <div className="font-bold tracking-tighter">
                <span className={`
          text-[72px] md:text-[96px] lg:text-[120px] xl:text-[140px]
          leading-none
          ${isDark ? 'text-orange-400' : 'text-navy-900'}
        `}>
                    Sami
                </span>
                <span className={`
          text-[72px] md:text-[96px] lg:text-[120px] xl:text-[140px]
          leading-none
          ${isDark ? 'text-orange-300' : 'text-orange-500'}
        `}>
                    's
                </span>
            </div>
        </div>
    );
}
