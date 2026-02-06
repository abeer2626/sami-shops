"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
    PlusCircle,
    Package,
    Tag,
    Layers,
    Image as ImageIcon,
    Type,
    CheckCircle,
    ShoppingBag,
    AlertCircle,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface Category {
    id: string;
    name: string;
}

export default function AddProductPage() {
    const { user, token, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        categoryId: "",
        image: "",
        storeId: "store_1" // Default store for now
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && !isAuthenticated()) {
            router.push("/login");
        }
    }, [isMounted, isAuthenticated, router]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/v1/categories");
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                categoryId: formData.categoryId,
                storeId: formData.storeId,
                images: [formData.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"]
            };

            const response = await fetch("http://localhost:8000/api/v1/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to add product");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/");
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link href="/" className="inline-flex items-center text-primary font-bold mb-6 hover:underline gap-2 uppercase text-xs tracking-widest">
                    <ArrowLeft size={16} /> Back to Mall
                </Link>

                <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-primary p-8 text-white">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-xl border border-white/30">
                                <PlusCircle size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black uppercase tracking-tight">Add New Product</h1>
                                <p className="text-blue-100 text-xs mt-1 font-bold uppercase tracking-widest">SamiShops Vendor Portal</p>
                            </div>
                        </div>
                    </div>

                    {success ? (
                        <div className="p-20 text-center animate-in fade-in zoom-in-95 duration-500">
                            <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={48} className="text-green-500" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-800 mb-2 uppercase italic">Success!</h2>
                            <p className="text-gray-500 font-medium">Your product has been added and is now live in the mall.</p>
                            <p className="text-xs text-gray-400 mt-8 uppercase font-bold">Redirecting you to the home page...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 flex gap-3 items-center">
                                    <AlertCircle size={20} className="text-red-500" />
                                    <p className="text-sm text-red-700 font-bold">{error}</p>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-8 text-xs font-black uppercase tracking-widest text-gray-400">
                                <div className="space-y-2">
                                    <label className="ml-1 flex items-center gap-2">
                                        <Type size={14} className="text-primary" /> Product Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-800 transition-all font-medium text-sm"
                                        placeholder="e.g. Premium Leather Wallet"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="ml-1 flex items-center gap-2">
                                        <Layers size={14} className="text-primary" /> Category
                                    </label>
                                    <select
                                        required
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-800 transition-all font-medium text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="ml-1 flex items-center gap-2">
                                        <Tag size={14} className="text-primary" /> Price (Rs.)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-800 transition-all font-medium text-sm"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="ml-1 flex items-center gap-2">
                                        <Package size={14} className="text-primary" /> Stock Quantity
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-800 transition-all font-medium text-sm"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="ml-1 flex items-center gap-2">
                                        <ImageIcon size={14} className="text-primary" /> Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-800 transition-all font-medium text-sm"
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                    <p className="text-[10px] italic lowercase">Leave blank to use a default high-quality placeholder image.</p>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="ml-1 flex items-center gap-2">
                                        <ShoppingBag size={14} className="text-primary" /> Description
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-800 transition-all font-medium text-sm resize-none"
                                        placeholder="Write a compelling description for your product..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-accent text-white font-black py-5 px-8 rounded-sm shadow-2xl hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-3 mt-4"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle size={20} />
                                        List Product on SamiShops
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        <ShoppingBag size={12} /> Trusted Vendor Program &bull; Verified by SamiShops Integrity Team
                    </p>
                </div>
            </div>
        </div>
    );
}
