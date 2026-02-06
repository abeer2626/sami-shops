import type { Metadata, ResolvingMetadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import {
  generateProductMetadata,
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
  SITE_CONFIG,
} from "@/lib/metadata";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// ============================================================================
// ISR Cache Configuration
// ============================================================================

// Revalidate product pages every hour (3600 seconds)
export const revalidate = 3600;

// Generate static params for static generation (optional)
// export async function generateStaticParams() {
//   const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
//   const response = await fetch(`${apiUrl}/api/v1/products`);
//   if (!response.ok) return [];
//   const products = await response.json();
//   return products.slice(0, 100).map((product: { id: string }) => ({
//     id: product.id,
//   }));
// }

// ============================================================================
// Metadata Generation with SEO
// ============================================================================

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = (await params).id;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  try {
    // Fetch product data with ISR cache
    const response = await fetch(`${apiUrl}/api/v1/products/${id}`, {
      next: { revalidate: 3600, tags: [`product-${id}`] },
    });

    if (response.ok) {
      const product = await response.json();

      // Use shared metadata utility
      const baseMetadata = generateProductMetadata({
        productName: product.name,
        productDescription: product.description || "",
        productImage: product.images?.[0],
        productId: id,
        price: product.price,
      });

      // Add additional metadata
      return {
        ...baseMetadata,
        keywords: [
          product.name,
          product.category || "electronics",
          "online shopping",
          "Pakistan",
          "best price",
          "original products",
          "SamiShops",
          "cash on delivery",
        ].join(", "),
        // Add price for rich snippets
        other: {
          "product:price:amount": product.price.toString(),
          "product:price:currency": "PKR",
          "product:availability": product.stock > 0 ? "in stock" : "out of stock",
        },
      };
    }
  } catch (error) {
    console.error("Error fetching product for metadata:", error);
  }

  // Fallback metadata
  return {
    title: "Product | SamiShops",
    description: "Discover premium products at SamiShops. Best prices, original quality, fast delivery across Pakistan.",
    openGraph: {
      title: "Product | SamiShops",
      description: "Discover premium products at SamiShops.",
      images: ["/og-default.png"],
      type: "website",
    },
  };
}

// ============================================================================
// Page Component with Structured Data
// ============================================================================

// Server component that delegates to client component
export default async function ProductPage({ params }: Props) {
  const id = (await params).id;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  let product = null;
  let jsonLd = null;
  let breadcrumbJsonLd = null;

  try {
    // Fetch product with caching
    const response = await fetch(`${apiUrl}/api/v1/products/${id}`, {
      next: { revalidate: 3600, tags: [`product-${id}`] },
    });

    if (response.ok) {
      product = await response.json();

      // Generate JSON-LD structured data for product
      jsonLd = generateProductJsonLd({
        productName: product.name,
        productDescription: product.description || "",
        productImage: product.images?.[0],
        productId: id,
        price: product.price,
        availability: product.stock > 0 ? "InStock" : "OutOfStock",
        brand: product.vendorName || "SamiShops",
      });

      // Generate breadcrumb JSON-LD
      breadcrumbJsonLd = generateBreadcrumbJsonLd([
        { name: "Home", url: SITE_CONFIG.url },
        { name: product.category || "Shop", url: `${SITE_CONFIG.url}/products` },
        { name: product.name, url: `${SITE_CONFIG.url}/product/${id}` },
      ]);
    }
  } catch (error) {
    console.error("Error fetching product:", error);
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}

      {/* Product Detail Client Component */}
      <ProductDetailClient id={id} initialProduct={product} />
    </>
  );
}
