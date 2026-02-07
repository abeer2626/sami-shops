"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Package, Search, Filter, Edit2, Trash2, Eye, TrendingUp, Star, AlertCircle } from "lucide-react";
import { getProducts, deleteProduct, Product } from "@/lib/api";
import { Button } from "@/components/ui";
import Image from "next/image";

export default function AdminProductsPage() {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login?redirect=/admin/products");
            return;
        }
        loadProducts();
    }, [isAuthenticated]);

    const loadProducts = async () => {
        try {
            const data = await getProducts({ limit: 100 });
            setProducts(data);
        } catch (err) {
            console.error("Failed to load products:", err);
            setError("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

        try {
            await deleteProduct(id);
            setSuccess("Product deleted successfully!");
            setProducts(products.filter(p => p.id !== id));
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.detail || "Failed to delete product");
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" ||
            (statusFilter === "in_stock" && product.stock > 0) ||
            (statusFilter === "out_of_stock" && product.stock === 0);
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-gray-500">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Products Management</h1>
                    <p className="text-sm text-gray-500 mt-1">View and manage all products across vendors</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Package size={18} />
                    <span className="font-bold">{products.length} Total Products</span>
                </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} />
                    {success}
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products by name or ID..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                    <option value="all">All Products</option>
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Product Image */}
                        <div className="relative aspect-square bg-gray-50">
                            <img
                                src={product.image || "https://via.placeholder.com/300"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                            {/* Stock Badge */}
                            <div className="absolute top-3 right-3">
                                <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                    product.stock > 0
                                        ? "bg-green-500 text-white"
                                        : "bg-red-500 text-white"
                                }`}>
                                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                                </span>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                            <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 min-h-[2.5em]">
                                {product.name}
                            </h3>

                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <span className="text-lg font-black text-primary">
                                        Rs. {product.price.toLocaleString()}
                                    </span>
                                </div>
                                {product.rating && (
                                    <div className="flex items-center gap-1">
                                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-sm font-bold text-gray-700">
                                            {product.rating.toFixed(1)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="text-xs text-gray-500 mb-3">
                                <p>ID: {product.id.slice(-8).toUpperCase()}</p>
                                <p>Category: {product.category}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => router.push(`/product/${product.id}`)}
                                >
                                    <Eye size={14} className="mr-1" />
                                    View
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="px-3 text-red-500 hover:bg-red-50 hover:border-red-200"
                                    onClick={() => handleDelete(product.id)}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                    <Package size={48} className="mx-auto mb-4 text-gray-200" />
                    <p className="text-sm font-bold">No products found</p>
                    <p className="text-xs mt-1">Try adjusting your filters or search query</p>
                </div>
            )}
        </div>
    );
}
