import Link from "next/link";
import { ShoppingBag, Home, Search } from "lucide-react";
import { Button } from "@/components/ui";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center">
                {/* 404 Illustration */}
                <div className="mb-8">
                    <div className="relative inline-block">
                        <div className="text-[180px] font-black text-primary/10 leading-none">
                            404
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ShoppingBag size={80} className="text-primary/30" />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                <h1 className="text-4xl font-black text-gray-900 mb-4">
                    Page Not Found
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    Sorry! The page you are looking for doesn't exist or has been moved.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/">
                        <Button className="bg-primary text-white">
                            <Home size={18} className="mr-2" />
                            Go to Homepage
                        </Button>
                    </Link>
                    <Link href="/search">
                        <Button variant="outline">
                            <Search size={18} className="mr-2" />
                            Search Products
                        </Button>
                    </Link>
                </div>

                {/* Help Links */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-4">Looking for something specific?</p>
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                        <Link href="/" className="text-primary hover:underline font-medium">
                            Shop All Products
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link href="/flash-sale" className="text-primary hover:underline font-medium">
                            Flash Sales
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link href="/account/orders" className="text-primary hover:underline font-medium">
                            My Orders
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link href="/vendor" className="text-primary hover:underline font-medium">
                            Vendor Portal
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
