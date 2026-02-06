"use client";

import Link from "next/link";
import { ShoppingCart, Search, User, MapPin, HelpCircle, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Navbar() {
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    return (
        <nav className="w-full flex flex-col sticky top-0 z-50 shadow-sm">
            {/* Top Bar - Daraz Style */}
            <div className="bg-[#f5f5f5] text-[#212121] text-xs py-1.5 hidden md:block">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-primary transition-colors flex items-center gap-1">
                            <Smartphone size={12} /> Save More on App
                        </Link>
                        <Link href="#" className="hover:text-primary transition-colors">Sell on SamiShops</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Customer Care</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Track my order</Link>
                    </div>
                    <div className="flex gap-6 items-center">
                        <Link href="/login" className="hover:text-primary transition-colors font-medium">Login</Link>
                        <div className="w-[1px] h-3 bg-gray-300" />
                        <Link href="/register" className="hover:text-primary transition-colors font-medium">Signup</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Change Language</Link>
                    </div>
                </div>
            </div>

            {/* Main Bar - #004B91 Theme */}
            <div className="bg-white border-b py-4">
                <div className="container mx-auto px-4 flex items-center gap-4 md:gap-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="bg-primary p-1.5 rounded-lg">
                            <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-extrabold text-primary hidden sm:block tracking-tighter">
                            SAMI<span className="text-secondary-foreground font-medium">SHOPS</span>
                        </span>
                    </Link>

                    {/* Search Bar - Center */}
                    <div className="flex-grow flex items-center relative group">
                        <div className={cn(
                            "flex w-full overflow-hidden rounded-md transition-all duration-200 border",
                            isSearchFocused ? "border-primary ring-1 ring-primary/20 shadow-md" : "border-gray-200 bg-[#eff0f5]"
                        )}>
                            <input
                                type="text"
                                placeholder="Search in SamiShops"
                                className="w-full px-4 py-2.5 bg-transparent outline-none text-sm"
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                            />
                            <button className="bg-[#f5f5f5] hover:bg-gray-200 px-5 text-gray-500 border-l transition-colors">
                                <Search size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center gap-2 md:gap-6 flex-shrink-0">
                        <Link href="/login" className="hidden md:flex flex-col items-center hover:text-primary transition-colors group">
                            <User size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] mt-1 font-semibold uppercase">Profile</span>
                        </Link>
                        <Link href="/cart" className="flex flex-col items-center relative hover:text-primary transition-colors group">
                            <div className="relative">
                                <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
                                <span className="absolute -top-1.5 -right-2.5 bg-[#f57224] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                                    0
                                </span>
                            </div>
                            <span className="text-[10px] mt-1 font-semibold uppercase hidden md:block">Cart</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Categories Bar - Optional but Daraz features this */}
            <div className="bg-white border-b hidden lg:block py-2">
                <div className="container mx-auto px-4 flex items-center gap-10 text-sm font-medium text-gray-700">
                    <Link href="#" className="flex items-center gap-1 hover:text-primary transition-colors group">
                        Categories
                        <span className="text-[10px] transition-transform group-hover:rotate-180">▼</span>
                    </Link>
                    <Link href="#" className="hover:text-primary transition-colors">Official Stores</Link>
                    <Link href="#" className="hover:text-primary transition-colors text-red-500">Flash Sale</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Vouchers</Link>
                    <Link href="#" className="hover:text-primary transition-colors">SamiShops Mall</Link>
                </div>
            </div>
        </nav>
    );
}
