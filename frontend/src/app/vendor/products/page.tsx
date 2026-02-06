"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Eye,
  AlertCircle,
  Loader2,
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface VendorProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
  sales?: number;
}

// ============================================================================
// Products Page Component
// ============================================================================

export default function VendorProductsPage() {
  const router = useRouter();
  const { token } = useAuthStore();

  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "low-stock" | "out-of-stock">("all");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; productId: string | null }>({
    open: false,
    productId: null,
  });

  // Categories for filter
  const categories = ["all", "Electronics", "Clothing", "Home", "Sports", "Books", "Other"];

  // ============================================================================
  // Data Fetching
  // ============================================================================

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const fetchProducts = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/v1/vendor/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Actions
  // ============================================================================

  const handleDelete = async (productId: string) => {
    if (!token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/v1/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== productId));
        setDeleteDialog({ open: false, productId: null });
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-700" };
    if (stock < 10) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-700" };
    return { label: "In Stock", color: "bg-green-100 text-green-700" };
  };

  // ============================================================================
  // Filter Logic
  // ============================================================================

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;

    let matchesStock = true;
    if (stockFilter === "in-stock") matchesStock = product.stock >= 10;
    else if (stockFilter === "low-stock") matchesStock = product.stock > 0 && product.stock < 10;
    else if (stockFilter === "out-of-stock") matchesStock = product.stock === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // ============================================================================
  // Stats
  // ============================================================================

  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.stock >= 10).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock < 10).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">
            Products
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your product inventory
          </p>
        </div>
        <Link
          href="/vendor/products/new"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="text-primary" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</p>
              <p className="text-lg font-black text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Package className="text-green-600" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">In Stock</p>
              <p className="text-lg font-black text-gray-900">{stats.inStock}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-yellow-600" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Low Stock</p>
              <p className="text-lg font-black text-gray-900">{stats.lowStock}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-red-600" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Out of Stock</p>
              <p className="text-lg font-black text-gray-900">{stats.outOfStock}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <DollarSign className="text-purple-600" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Value</p>
              <p className="text-sm font-black text-gray-900">
                Rs. {(stats.totalValue / 1000).toFixed(1)}k
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          >
            <option value="all">All Stock Levels</option>
            <option value="in-stock">In Stock (10+)</option>
            <option value="low-stock">Low Stock (1-9)</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-4" size={32} />
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Loading products...
            </p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Product Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 relative rounded-lg overflow-hidden border border-gray-100 bg-white flex-shrink-0">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                <Package className="text-gray-300" size={24} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 uppercase truncate max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              ID: {product.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-[10px] font-black uppercase rounded-full">
                          {product.category || "Uncategorized"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-primary">
                          Rs. {product.price.toLocaleString()}
                        </p>
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            {product.stock}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${stockStatus.color}`}
                          >
                            {stockStatus.label}
                          </span>
                        </div>
                      </td>

                      {/* Sales */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <TrendingUp size={14} className="text-green-500" />
                          <span className="text-sm font-bold text-gray-900">
                            {product.sales || 0}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/product/${product.id}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="View on store"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/vendor/products/${product.id}/edit`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit product"
                          >
                            <Edit3 size={16} />
                          </Link>
                          <button
                            onClick={() => setDeleteDialog({ open: true, productId: product.id })}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <Package className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              {searchQuery || selectedCategory !== "all" || stockFilter !== "all"
                ? "No products match your filters"
                : "No products yet"}
            </p>
            {!searchQuery && selectedCategory === "all" && stockFilter === "all" && (
              <Link
                href="/vendor/products/new"
                className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider hover:underline mt-4"
              >
                <Plus size={14} />
                Add your first product
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-black text-gray-900 text-center uppercase tracking-tight mb-2">
              Delete Product?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This action cannot be undone. The product will be permanently removed from
              your inventory.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteDialog({ open: false, productId: null })}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteDialog.productId && handleDelete(deleteDialog.productId)}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
