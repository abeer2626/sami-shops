"use client";

import Link from "next/link";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-gray-100">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                    <CheckCircle size={40} strokeWidth={2.5} />
                </div>
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">
                    Order Placed!
                </h1>
                <p className="text-gray-500 text-sm mb-8">
                    Thank you for your purchase. Your order has been securely placed and is being processed.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/orders" // Assuming we'll have an orders page later, or just /products for now
                        className="block w-full py-4 bg-primary text-white rounded-xl font-black uppercase text-xs tracking-wider hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30"
                    >
                        View My Orders
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-gray-50 text-gray-700 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-gray-100 transition-all"
                    >
                        <ShoppingBag size={16} />
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
