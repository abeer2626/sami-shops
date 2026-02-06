"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import ProductCard from "./components/ProductCard";
import { SkeletonGrid, HeroSkeleton } from "@/components/ui/Skeleton";
import { ShoppingCart, Sparkles, Clock, ChevronRight, Smartphone, Laptop, Headphones, Watch, Camera, Gamepad2, Tablet } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category?: string;
}

interface Category {
  id: string;
  name: string;
  slug?: string;
  icon?: React.ReactNode;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Smartphones": <Smartphone size={24} />,
  "Laptops": <Laptop size={24} />,
  "Audio": <Headphones size={24} />,
  "Watches": <Watch size={24} />,
  "Cameras": <Camera size={24} />,
  "Gaming": <Gamepad2 size={24} />,
  "Tablets": <Tablet size={24} />,
};

const FLASH_DEALS = [
  { id: "1", name: "Wireless Earbuds Pro", originalPrice: 8999, price: 4999, discount: 44, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop" },
  { id: "2", name: "Smart Watch Series 5", originalPrice: 15999, price: 9999, discount: 37, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=300&fit=crop" },
  { id: "3", name: "Mechanical Keyboard RGB", originalPrice: 7999, price: 4499, discount: 43, image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=300&h=300&fit=crop" },
  { id: "4", name: "USB-C Hub Pro", originalPrice: 4999, price: 2499, discount: 50, image: "https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=300&h=300&fit=crop" },
];

// ============================================================================
// Home Page Component
// Note: This is a client component with caching handled via fetch options
// ============================================================================

function HomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [flashDealTime, setFlashDealTime] = useState({
    hours: 5,
    minutes: 32,
    seconds: 15,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    const timer = setInterval(() => {
      setFlashDealTime(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          if (minutes < 0) {
            minutes = 59;
            hours--;
            if (hours < 0) {
              hours = 23;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      // Add cache control for better performance
      const response = await fetch(`${apiUrl}/api/v1/products`, {
        next: { revalidate: 300, tags: ["products"] }, // Cache for 5 minutes
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/v1/categories`, {
        next: { revalidate: 3600, tags: ["categories"] }, // Cache for 1 hour
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const formatTime = (value: number) => value.toString().padStart(2, "0");

  return (
    <div className="w-full">
      {/* Hero Banner - Optimized with priority loading */}
      <section className="relative w-full bg-gradient-to-br from-primary via-primary/95 to-primary/90 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoMnYyaDJ2LTJoMnYyaDJ2LTJoMnYyaDJ2LTJoMnYyaDJ2LTJoMnYtMmgydi0yaDJ2LTJoMnYtMmgydi0yaDJ2LTJoMnYtMmgydi0yaDJ2LTJoMnYtMmgtMnYtMmgtMnYtMmgtMnYtMmgtMnYtMmgtMnYtMmgtMnYtMmgtMnYtMmgtMnYtMmgtMnYtMmgtMnYtMmgtMnYyaDJ2MmgydjJoMnYyaDJ2MmgydjJoMnYyaDJ2MmgydjJoMnYyaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="text-accent" size={16} />
                <span className="text-white/90 text-xs font-bold uppercase tracking-widest">New Arrivals</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white italic tracking-tight mb-4">
                PREMIUM
                <span className="block text-accent">COLLECTION</span>
              </h1>
              <p className="text-white/80 text-sm sm:text-base mb-8 max-w-md mx-auto lg:mx-0">
                Discover the latest tech gadgets and accessories at unbeatable prices. Quality meets affordability.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="#products"
                  className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-lg font-black uppercase tracking-wider text-sm transition-all shadow-lg hover:shadow-accent/30 hover:-translate-y-1"
                  prefetch={true}
                >
                  <ShoppingCart size={18} />
                  Shop Now
                </Link>
                <Link
                  href="#categories"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-black uppercase tracking-wider text-sm transition-all border border-white/20"
                  prefetch={false}
                >
                  Browse Categories
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm flex items-center justify-center">
                <ShoppingCart size={120} className="text-white/20" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f4f4f4] to-transparent"></div>
      </section>

      {/* Categories Strip - Optimized with prefetch hints */}
      <section id="categories" className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            <button className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-black uppercase text-xs tracking-wider transition-all hover:bg-primary/90">
              <Sparkles size={16} />
              All
            </button>
            {categories.length > 0 ? categories.map((category) => (
              <Link
                key={category.id}
                href={`/?category=${category.id}`}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-primary hover:text-white text-gray-700 rounded-xl font-bold uppercase text-xs tracking-wider transition-all"
                prefetch={false}
              >
                {CATEGORY_ICONS[category.name] || <Sparkles size={16} />}
                {category.name}
              </Link>
            )) : (
              <>
                {["Smartphones", "Laptops", "Audio", "Watches", "Cameras", "Gaming", "Tablets"].map((cat) => (
                  <button
                    key={cat}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-primary hover:text-white text-gray-700 rounded-xl font-bold uppercase text-xs tracking-wider transition-all"
                  >
                    {CATEGORY_ICONS[cat]}
                    {cat}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Flash Deals Section - Preloaded images for CLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-accent to-orange-600 rounded-xl">
              <Clock className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight italic">Flash Deals</h2>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Limited Time Offer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest hidden sm:block">Ends in:</span>
            <div className="flex items-center gap-2">
              {[
                { value: flashDealTime.hours, label: "Hours" },
                { value: flashDealTime.minutes, label: "Mins" },
                { value: flashDealTime.seconds, label: "Secs" },
              ].map((item) => (
                <div key={item.label} className="bg-gray-900 text-white rounded-lg px-3 py-2 min-w-[60px] text-center">
                  <span className="block text-lg font-black">{formatTime(item.value)}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {FLASH_DEALS.map((deal) => (
            <Link
              key={deal.id}
              href="#"
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              prefetch={false}
            >
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <div className="absolute top-3 left-3 bg-accent text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider z-10">
                  -{deal.discount}%
                </div>
                <img
                  src={deal.image}
                  alt={deal.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xs font-black text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors uppercase tracking-tight">
                  {deal.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-black text-primary">
                    <span className="text-xs font-bold">Rs.</span> {deal.price.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-gray-300 line-through">
                    Rs. {deal.originalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent to-orange-500 rounded-full" style={{ width: `${Math.floor(Math.random() * 40 + 40)}%` }}></div>
                </div>
                <p className="text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                  Almost Sold Out
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Products Grid - With Skeleton Loading */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight italic">
              Just For You
            </h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
              Recommended Products
            </p>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-2 text-primary font-black uppercase text-xs tracking-wider hover:underline"
            prefetch={true}
          >
            View All
            <ChevronRight size={16} />
          </Link>
        </div>

        <Suspense fallback={<SkeletonGrid count={8} />}>
          {loading ? (
            <SkeletonGrid count={8} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  images={product.images}
                  description={product.description}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
              <ShoppingCart className="text-gray-300 mb-4" size={48} />
              <p className="text-sm font-black text-gray-400 uppercase tracking-wider">No products found</p>
              <p className="text-xs text-gray-400 mt-2">Check back later for new arrivals</p>
            </div>
          )}
        </Suspense>

        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-wider"
          >
            View All Products
            <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-900 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight italic mb-2">
              Stay Updated
            </h2>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Subscribe to our newsletter for exclusive deals and new arrivals
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-accent hover:bg-accent/90 text-white rounded-xl font-black uppercase text-xs tracking-wider transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// Default Export
// ============================================================================

export default function Home() {
  return (
    <Suspense fallback={<HeroSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
