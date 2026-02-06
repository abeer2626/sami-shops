"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, Heart, Share2, ChevronLeft, ChevronRight, Shield, Truck, RefreshCw, Minus, Plus, Check } from "lucide-react";
import { useCart } from "@/store/useCart";
import { ProductDetailSkeleton } from "@/components/ui/Skeleton";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category?: string;
  store?: {
    id: string;
    name: string;
  };
  vendorName?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Props {
  id: string;
  initialProduct?: Product | null;
}

// ============================================================================
// Product Detail Content Component
// ============================================================================

function ProductDetailContent({ id, initialProduct }: Props) {
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    // Skip fetch if we already have product from server
    if (initialProduct) {
      setProduct(initialProduct);
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/api/v1/products/${id}`, {
          next: { revalidate: 3600, tags: [`product-${id}`] },
        });
        if (!response.ok) throw new Error("Failed to fetch product");
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, initialProduct]);

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || "/placeholder.png",
      quantity,
    };

    addItem(cartItem);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handlePreviousImage = () => {
    if (!product?.images?.length) return;
    setSelectedImageIndex((prev) => (prev === 0 ? product.images!.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!product?.images?.length) return;
    setSelectedImageIndex((prev) => (prev === product.images!.length - 1 ? 0 : prev + 1));
  };

  const getStockStatus = () => {
    if (!product) return { text: "Loading", color: "bg-gray-100 text-gray-500" };
    if (product.stock === 0) return { text: "Out of Stock", color: "bg-red-100 text-red-600" };
    if (product.stock < 10) return { text: `Only ${product.stock} left`, color: "bg-orange-100 text-orange-600" };
    return { text: "In Stock", color: "bg-green-100 text-green-600" };
  };

  const stockStatus = getStockStatus();
  const images = product?.images || [];

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <ShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-lg font-black text-gray-400 uppercase tracking-widest">Product not found</p>
          <Link href="/" className="inline-block mt-6 text-primary font-black uppercase text-xs tracking-wider hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const originalPrice = product.price * 1.35;
  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <div className="w-full bg-white">
      {/* Breadcrumb - Semantic for SEO */}
      <nav className="bg-gray-50 border-b border-gray-100" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ol className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider" itemScope itemType="https://schema.org/BreadcrumbList">
            <li className="flex items-center gap-2" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/" className="hover:text-primary transition-colors" itemProp="item">
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <span>/</span>
            <li className="flex items-center gap-2 text-gray-900" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span itemProp="name">{product.name}</span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery - Optimized with priority loading */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
              {images.length > 0 ? (
                <Image
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  fill
                  priority={selectedImageIndex === 0} // Priority for first image
                  className="object-contain p-6 sm:p-12"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ShoppingCart size={64} className="text-gray-300" />
                </div>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} className="text-gray-700" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} className="text-gray-700" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-primary shadow-lg scale-105"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      width={80}
                      height={80}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mb-4">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-3 rounded-xl transition-all ${
                  isWishlisted
                    ? "bg-red-50 text-red-500"
                    : "bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50"
                }`}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
              <button
                className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all"
                aria-label="Share product"
              >
                <Share2 size={20} />
              </button>
            </div>

            {/* Category Badge */}
            {product.category && (
              <span className="inline-block w-fit px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg mb-3">
                {product.category}
              </span>
            )}

            {/* Title - Semantic h1 for SEO */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 uppercase tracking-tight leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating & Reviews with structured data */}
            <div className="flex items-center gap-3 mb-6" itemScope itemType="https://schema.org/AggregateRating">
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-400" aria-label="4 out of 5 stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < 4 ? "currentColor" : "none"}
                      className={i < 4 ? "" : "text-gray-200"}
                    />
                  ))}
                </div>
                <meta itemProp="ratingValue" content="4.0" />
                <meta itemProp="bestRating" content="5" />
                <meta itemProp="worstRating" content="1" />
                <span className="text-sm font-bold text-gray-600">4.0</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-sm font-bold text-gray-500" itemProp="reviewCount">
                {Math.floor(Math.random() * 50 + 10)} Reviews
              </span>
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="flex items-baseline gap-3" itemScope itemType="https://schema.org/Offer">
                <meta itemProp="price" content={product.price.toString()} />
                <meta itemProp="priceCurrency" content="PKR" />
                <meta itemProp="availability" content={product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
                <span className="text-3xl sm:text-4xl font-black text-primary italic">
                  <span className="text-lg font-bold not-italic">Rs.</span> {product.price.toLocaleString()}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-lg font-bold text-gray-300 line-through">
                      Rs. {originalPrice.toLocaleString()}
                    </span>
                    <span className="px-2 py-1 bg-accent text-white text-xs font-black uppercase rounded-lg">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl w-fit mb-6 ${stockStatus.color}`}>
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider">{stockStatus.text}</span>
            </div>

            {/* Store Info */}
            {product.store && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">
                    Sold by
                  </p>
                  <p className="text-sm font-black text-gray-800 uppercase tracking-tight">
                    {product.store.name}
                  </p>
                </div>
                <Link
                  href={`/store/${product.store.id}`}
                  className="text-xs font-black text-primary uppercase tracking-wider hover:underline"
                >
                  Visit Store
                </Link>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label htmlFor="quantity" className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 block">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={18} className="text-gray-600" />
                  </button>
                  <span className="w-14 text-center font-black text-lg" aria-live="polite">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.max(1, Math.min(quantity + 1, product.stock || 10)))}
                    disabled={quantity >= (product.stock || 10)}
                    className="p-3 hover:bg-white transition-colors border-l border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    <Plus size={18} className="text-gray-600" />
                  </button>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Max: {product.stock || 10}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-wider text-sm transition-all flex items-center justify-center gap-3 shadow-lg ${
                addedToCart
                  ? "bg-green-500 text-white"
                  : product.stock === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-primary hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
              }`}
              aria-label={product.stock === 0 ? "Out of stock" : "Add to cart"}
            >
              {addedToCart ? (
                <>
                  <Check size={20} />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </>
              )}
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Shield size={24} className="text-green-500" />
                </div>
                <p className="text-[10px] font-black text-gray-700 uppercase tracking-wider">100% Original</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <RefreshCw size={24} className="text-primary" />
                </div>
                <p className="text-[10px] font-black text-gray-700 uppercase tracking-wider">7 Day Return</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Truck size={24} className="text-accent" />
                </div>
                <p className="text-[10px] font-black text-gray-700 uppercase tracking-wider">Fast Delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section - Semantic article */}
        <article className="mt-12 sm:mt-20 border-t border-gray-100 pt-8 sm:pt-12">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight mb-6">
            Product Description
          </h2>
          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
              {product.description || "No description available for this product."}
            </p>
          </div>
        </article>

        {/* Specifications - Semantic section */}
        <section className="mt-12" aria-labelledby="specifications-heading">
          <h2 id="specifications-heading" className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight mb-6">
            Specifications
          </h2>
          <dl className="bg-gray-50 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-2 border-b border-gray-200">
              <div className="p-4 border-r border-gray-200">
                <dt className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Product ID</dt>
                <dd className="text-sm font-bold text-gray-800">{product.id}</dd>
              </div>
              <div className="p-4">
                <dt className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Availability</dt>
                <dd className="text-sm font-bold text-gray-800">{product.stock} units</dd>
              </div>
            </div>
            {product.category && (
              <div className="grid grid-cols-2">
                <div className="p-4 border-r border-gray-200">
                  <dt className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Category</dt>
                  <dd className="text-sm font-bold text-gray-800">{product.category}</dd>
                </div>
                <div className="p-4">
                  <dt className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Seller</dt>
                  <dd className="text-sm font-bold text-gray-800">{product.vendorName || product.store?.name || "SamiShops"}</dd>
                </div>
              </div>
            )}
          </dl>
        </section>
      </div>
    </div>
  );
}

// ============================================================================
// Default Export with Suspense
// ============================================================================

export default function ProductDetailClient(props: Props) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailContent {...props} />
    </Suspense>
  );
}
