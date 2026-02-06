"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User, Smartphone, HelpCircle, Truck, LayoutDashboard } from "lucide-react";
import { useCart } from "@/store/useCart";

import { useAuthStore } from "@/store/useAuthStore";

export default function Header() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();
    const { getTotalItems } = useCart();
    const { user, logout, isAuthenticated } = useAuthStore();
    const cartCount = getTotalItems();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/?search=${encodeURIComponent(searchQuery)}`);
        } else {
            router.push("/");
        }
    };

    return (
        <header className="w-full sticky top-0 z-50 shadow-sm bg-white">
            {/* Top Bar */}
            <div className="bg-[#f5f5f5] hidden md:block border-b border-gray-200">
                <div className="container mx-auto px-4 py-1.5 flex justify-between items-center text-[11px] font-medium text-gray-600">
                    <div className="flex gap-4">
                        <Link href="#" className="hover:text-primary transition-colors flex items-center gap-1">
                            <Smartphone size={12} /> Save More on App
                        </Link>
                        <Link href="#" className="hover:text-primary transition-colors">SamiShops Affiliate Program</Link>
                        <Link href="/vendor/add-product" className="hover:text-primary transition-colors font-black">Sell on SamiShops</Link>
                        {isMounted && user?.role === 'admin' && (
                            <Link href="/vendor/dashboard" className="hover:text-accent transition-colors font-black flex items-center gap-1">
                                <LayoutDashboard size={12} /> Dashboard
                            </Link>
                        )}
                    </div>
                    <div className="flex gap-5 items-center">
                        <Link href="#" className="hover:text-primary transition-colors flex items-center gap-1 uppercase">
                            <HelpCircle size={12} /> Customer Care
                        </Link>
                        <Link href="#" className="hover:text-primary transition-colors flex items-center gap-1 uppercase">
                            <Truck size={12} /> Track My Order
                        </Link>
                        {isMounted && isAuthenticated() ? (
                            <div className="flex gap-4 items-center">
                                <span className="text-primary font-bold uppercase">Hi, {user?.name?.split(' ')[0]}</span>
                                <button onClick={() => { logout(); router.push('/'); }} className="hover:text-primary transition-colors uppercase">Logout</button>
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className="hover:text-primary transition-colors uppercase">
                                    Login
                                </Link>
                                <Link href="/signup" className="hover:text-primary transition-colors uppercase">
                                    Signup
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Bar */}
            <div className="bg-white py-4">
                <div className="container mx-auto px-4 flex items-center gap-4 md:gap-12">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tighter">
                            SAMI<span className="text-secondary-foreground font-medium">SHOPS</span>
                        </h1>
                    </Link>

                    {/* Search Bar */}
                    <form className="flex-grow" onSubmit={handleSearch}>
                        <div className="relative flex items-center w-full group">
                            <input
                                type="text"
                                placeholder="Search in SamiShops"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#eff0f5] rounded-sm py-2 px-4 text-sm outline-none focus:bg-white border-2 border-transparent focus:border-primary transition-all pr-12"
                            />
                            <button type="submit" className="absolute right-0 top-0 h-full px-4 text-white bg-primary rounded-r-sm hover:opacity-90 transition-opacity">
                                <Search size={20} />
                            </button>
                        </div>
                    </form>

                    {/* Actions */}
                    <div className="flex items-center gap-4 md:gap-8">
                        <Link href={isAuthenticated() ? "/profile" : "/login"} className="hidden lg:flex flex-col items-center group">
                            <User size={24} className="text-gray-700 group-hover:text-primary transition-colors" />
                            <span className="text-[10px] uppercase font-bold text-gray-600 mt-1">Profile</span>
                        </Link>

                        <Link href="/cart" className="relative group flex flex-col items-center">
                            <div className="relative">
                                <ShoppingCart size={24} className="text-gray-700 group-hover:text-primary transition-colors" />
                                <span className="absolute -top-1.5 -right-2 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                                    {isMounted ? cartCount : 0}
                                </span>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-gray-600 mt-1 hidden md:block">Cart</span>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
