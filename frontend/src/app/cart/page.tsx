"use client";

import { useCart } from "@/store/useCart";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowLeft, ShieldCheck } from "lucide-react";

export default function CartPage() {
    const { items, removeItem, updateQuantity, getTotalPrice } = useCart();

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-100 max-w-lg mx-auto">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trash2 size={32} className="text-gray-300" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">There are no items in this cart</h2>
                    <p className="text-gray-500 mb-8 text-sm">Add items to your cart and they will be displayed here.</p>
                    <Link
                        href="/"
                        className="bg-primary text-white font-bold py-3 px-10 rounded-sm shadow-md hover:opacity-90 transition-opacity uppercase text-sm inline-block"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-2 mb-8 text-sm group">
                <Link href="/" className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors">
                    <ArrowLeft size={16} />
                    <span>Back to products</span>
                </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Side: Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-100 hidden md:grid grid-cols-12 gap-4 text-xs font-bold text-gray-400 border-b">
                        <div className="col-span-6">ITEM</div>
                        <div className="col-span-2 text-center">PRICE</div>
                        <div className="col-span-2 text-center">QUANTITY</div>
                        <div className="col-span-2 text-center">TOTAL</div>
                    </div>

                    {items.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-sm shadow-sm border border-gray-100 grid grid-cols-12 gap-4 items-center group">
                            {/* Product Info */}
                            <div className="col-span-12 md:col-span-6 flex gap-4">
                                <div className="w-20 h-20 relative flex-shrink-0 border border-gray-100 rounded">
                                    <Image src={item.image} alt={item.name} fill className="object-cover rounded" />
                                </div>
                                <div className="flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-primary transition-colors">
                                            <Link href={`/product/${item.id}`}>{item.name}</Link>
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-gray-400 hover:text-red-500 flex items-center gap-1 text-[10px] font-bold uppercase transition-colors"
                                    >
                                        <Trash2 size={12} />
                                        Remove
                                    </button>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="col-span-4 md:col-span-2 text-center">
                                <span className="text-sm font-medium text-gray-500 md:hidden block uppercase text-[10px] mb-1">Price</span>
                                <span className="text-sm font-semibold text-primary">Rs. {item.price.toLocaleString()}</span>
                            </div>

                            {/* Quantity */}
                            <div className="col-span-4 md:col-span-2 text-center">
                                <span className="text-sm font-medium text-gray-500 md:hidden block uppercase text-[10px] mb-1">Quantity</span>
                                <div className="flex items-center border border-gray-200 rounded mx-auto w-fit">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="p-1 hover:bg-gray-50 transition-colors"
                                    >
                                        <Minus size={12} />
                                    </button>
                                    <span className="w-8 text-xs font-medium">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="p-1 hover:bg-gray-50 transition-colors border-l"
                                    >
                                        <Plus size={12} />
                                    </button>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="col-span-4 md:col-span-2 text-center">
                                <span className="text-sm font-medium text-gray-500 md:hidden block uppercase text-[10px] mb-1">Total</span>
                                <span className="text-sm font-bold text-primary">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Side: Order Summary */}
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4 border-gray-100">Order Summary</h2>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal ({items.length} items)</span>
                                <span>Rs. {getTotalPrice().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping Fee</span>
                                <span className="text-green-600 font-medium">FREE</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-gray-800 font-bold">Total Payout</span>
                                <span className="text-xl font-black text-primary">Rs. {getTotalPrice().toLocaleString()}</span>
                            </div>

                            <Link href="/checkout" className="block w-full">
                                <button className="w-full bg-accent text-white font-bold py-4 px-6 rounded-sm shadow-md hover:opacity-90 transition-opacity uppercase text-sm mt-4">
                                    Proceed to Checkout
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-100">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="text-green-600 flex-shrink-0" size={20} />
                            <div>
                                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-tight">Purchase Protection</h4>
                                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                                    Shop with confidence. We protect you from the first click to delivery.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
