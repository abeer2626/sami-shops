"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  X,
  Loader2,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  Package,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// ============================================================================
// Types
// ============================================================================

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  images: string;
  categoryId: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  stock?: string;
  images?: string;
  categoryId?: string;
  general?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
}

// ============================================================================
// Constants
// ============================================================================

const CATEGORIES = [
  { id: "electronics", name: "Electronics" },
  { id: "clothing", name: "Clothing & Fashion" },
  { id: "home", name: "Home & Living" },
  { id: "sports", name: "Sports & Outdoors" },
  { id: "books", name: "Books & Stationery" },
  { id: "toys", name: "Toys & Games" },
  { id: "beauty", name: "Beauty & Health" },
  { id: "automotive", name: "Automotive" },
  { id: "other", name: "Other" },
];

// ============================================================================
// Edit Product Page Component
// ============================================================================

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuthStore();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [notFound, setNotFound] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    stock: "",
    images: "",
    categoryId: "",
  });

  const [imagePreview, setImagePreview] = useState<string[]>([]);

  // ============================================================================
  // Fetch Product
  // ============================================================================

  useEffect(() => {
    fetchProduct();
  }, [productId, token]);

  const fetchProduct = async () => {
    if (!token || !productId) return;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/v1/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const product: Product = await response.json();
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          stock: product.stock.toString(),
          images: product.images?.join(", ") || "",
          categoryId: product.categoryId || "",
        });
        setImagePreview(product.images || []);
      } else if (response.status === 404) {
        setNotFound(true);
      } else {
        throw new Error("Failed to fetch product");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setErrors({ general: "Failed to load product. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (name === "images") {
      const urls = value
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);
      setImagePreview(urls);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Product name must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!formData.stock) {
      newErrors.stock = "Stock quantity is required";
    } else if (parseInt(formData.stock) < 0) {
      newErrors.stock = "Stock cannot be negative";
    }

    if (!formData.images.trim()) {
      newErrors.images = "At least one image URL is required";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Please select a category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const imagesArray = formData.images
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: imagesArray,
        categoryId: formData.categoryId,
      };

      const response = await fetch(`${apiUrl}/api/v1/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Failed to update product");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/vendor/products");
      }, 1500);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Failed to update product. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
            Product not found
          </p>
          <Link
            href="/vendor/products"
            className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider hover:underline"
          >
            <ArrowLeft size={14} />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/vendor/products"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">
          Edit Product
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Update product information and inventory
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
          <p className="text-sm font-bold text-green-800">
            Product updated successfully! Redirecting...
          </p>
        </div>
      )}

      {/* Error Message */}
      {errors.general && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-sm font-bold text-red-800">{errors.general}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Basic Info */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Package size={18} className="text-primary" />
              Basic Information
            </h2>

            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Wireless Bluetooth Headphones"
                  className={`w-full px-4 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.name
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-primary"
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 font-medium mt-2">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Describe your product in detail..."
                  className={`w-full px-4 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none ${
                    errors.description
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-primary"
                  }`}
                />
                {errors.description && (
                  <p className="text-xs text-red-500 font-medium mt-2">{errors.description}</p>
                )}
                <p className="text-[10px] text-gray-400 mt-2">
                  {formData.description.length} / 500 characters
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none bg-white ${
                    errors.categoryId
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-primary"
                  }`}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-xs text-red-500 font-medium mt-2">{errors.categoryId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6">
              Pricing & Inventory
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                  Price (PKR) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                    Rs.
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="9999"
                    min="0"
                    step="0.01"
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                      errors.price
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-primary"
                    }`}
                  />
                </div>
                {errors.price && (
                  <p className="text-xs text-red-500 font-medium mt-2">{errors.price}</p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="100"
                  min="0"
                  className={`w-full px-4 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.stock
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-primary"
                  }`}
                />
                {errors.stock && (
                  <p className="text-xs text-red-500 font-medium mt-2">{errors.stock}</p>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="p-6">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
              <ImageIcon size={18} className="text-primary" />
              Product Images
            </h2>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                Image URLs *
              </label>
              <textarea
                name="images"
                value={formData.images}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter image URLs separated by commas"
                className={`w-full px-4 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none ${
                  errors.images
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-primary"
                }`}
              />
              {errors.images && (
                <p className="text-xs text-red-500 font-medium mt-2">{errors.images}</p>
              )}
              <p className="text-[10px] text-gray-400 mt-2">
                Enter multiple URLs separated by commas.
              </p>
            </div>

            {/* Image Preview */}
            {imagePreview.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">
                  Preview ({imagePreview.length})
                </p>
                <div className="flex flex-wrap gap-4">
                  {imagePreview.map((url, index) => (
                    <div
                      key={index}
                      className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group"
                    >
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Link
            href="/vendor/products"
            className="px-8 py-4 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-4 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
