"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Sparkles, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";

interface HeroSlide {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    cta_text: string;
    cta_link: string;
    bg_image?: string;
    bg_gradient?: string;
    badge_text?: string;
}

interface HeroSectionProps {
    slides?: HeroSlide[];
    autoPlayInterval?: number;
}

const DEFAULT_SLIDES: HeroSlide[] = [
    {
        id: "1",
        title: "PREMIUM",
        subtitle: "COLLECTION",
        description: "Discover the latest tech gadgets and accessories at unbeatable prices. Quality meets affordability.",
        cta_text: "Shop Now",
        cta_link: "#products",
        bg_gradient: "from-primary via-primary/95 to-primary/90",
        badge_text: "New Arrivals",
    },
    {
        id: "2",
        title: "FLASH SALE",
        subtitle: "UP TO 50% OFF",
        description: "Limited time offer on electronics, fashion, and more. Don't miss out!",
        cta_text: "View Deals",
        cta_link: "#flash-deals",
        bg_gradient: "from-accent via-orange-600 to-red-600",
        badge_text: "Hot Deal",
    },
];

export function HeroSection({ slides = DEFAULT_SLIDES, autoPlayInterval = 5000 }: HeroSectionProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (slides.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, autoPlayInterval);

        return () => clearInterval(timer);
    }, [slides.length, autoPlayInterval]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    const current = slides[currentSlide];

    return (
        <section className="relative w-full overflow-hidden">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                        index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                >
                    <div
                        className={`relative w-full bg-gradient-to-br ${slide.bg_gradient || "from-primary to-primary/90"} min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]`}
                    >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoMnYyaDJ2LTJoMnYyaDJ2LTJoMnYyaDJ2LTJoMnYyaDJ2LTJoMnYtMmgydi0yaDJ2LTJoMnYtMmgydi0yaDJ2LTJoMnYtMmgydi0yaDJ2LTJoMnYtMmgtMnYtMmgtMnYtMmgtMnYtMmgtMnYtMmgtMnYtMmgtMnYtMmgtMnYtMmgtMnYtMmgtMnYtMmgtMnYtMmgtMnYyaDJ2MmgydjJoMnYyaDJ2MmgydjJoMnYyaDJ2MmgydjJoMnYyaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>

                        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 h-full flex items-center">
                            <div className="grid lg:grid-cols-2 gap-8 items-center w-full">
                                <div className="text-center lg:text-left">
                                    {slide.badge_text && (
                                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                                            <Sparkles className="text-accent" size={16} />
                                            <span className="text-white/90 text-xs font-bold uppercase tracking-widest">
                                                {slide.badge_text}
                                            </span>
                                        </div>
                                    )}

                                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white italic tracking-tight mb-4">
                                        {slide.title}
                                        <span className="block text-accent">{slide.subtitle}</span>
                                    </h1>

                                    <p className="text-white/80 text-sm sm:text-base mb-8 max-w-md mx-auto lg:mx-0">
                                        {slide.description}
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                        <Button
                                            variant="accent"
                                            size="lg"
                                            className="!rounded-full !font-black !uppercase !tracking-wider"
                                            onClick={() => {
                                                const element = document.querySelector(slide.cta_link);
                                                element?.scrollIntoView({ behavior: "smooth" });
                                            }}
                                        >
                                            <ShoppingCart size={18} />
                                            {slide.cta_text}
                                        </Button>
                                        <Button
                                            variant="white"
                                            size="lg"
                                            className="!rounded-full !font-black !uppercase !tracking-wider"
                                            onClick={() => {
                                                const element = document.querySelector("#categories");
                                                element?.scrollIntoView({ behavior: "smooth" });
                                            }}
                                        >
                                            Browse Categories
                                            <ChevronRight size={18} />
                                        </Button>
                                    </div>
                                </div>

                                <div className="hidden lg:block relative">
                                    <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm flex items-center justify-center">
                                        <ShoppingCart size={120} className="text-white/20" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Gradient Fade */}
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f4f4f4] to-transparent"></div>
                    </div>
                </div>
            ))}

            {/* Slider Controls */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white flex items-center justify-center transition-all"
                        aria-label="Previous slide"
                    >
                        <ChevronRight size={24} className="rotate-180" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white flex items-center justify-center transition-all"
                        aria-label="Next slide"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    index === currentSlide ? "bg-white w-8" : "bg-white/50"
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
