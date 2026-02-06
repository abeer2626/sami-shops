import { Metadata } from "next";

// ============================================================================
// Site Configuration
// ============================================================================

export const SITE_CONFIG = {
  name: "SamiShops",
  title: "SamiShops - Your One-Stop Online Shopping Destination",
  description:
    "Shop the latest products at SamiShops. Discover amazing deals on electronics, fashion, home goods, and more. Fast shipping across Pakistan.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://samishops.com",
  ogImage: "/og-image.png",
  links: {
    facebook: "https://facebook.com/samishops",
    twitter: "https://twitter.com/samishops",
    instagram: "https://instagram.com/samishops",
  },
  contact: {
    email: "support@samishops.com",
    phone: "+92 300 1234567",
  },
} as const;

// ============================================================================
// OpenGraph Image Configuration
// ============================================================================

export interface OpenGraphImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export const DEFAULT_OG_IMAGE: OpenGraphImage = {
  url: SITE_CONFIG.ogImage,
  width: 1200,
  height: 630,
  alt: SITE_CONFIG.name,
};

// ============================================================================
// Metadata Generators
// ============================================================================

/**
 * Generate base metadata for all pages
 */
export function generateBaseMetadata(overrides?: Partial<Metadata>): Metadata {
  return {
    ...overrides,
    metadataBase: new URL(SITE_CONFIG.url),
    title: {
      template: `%s | ${SITE_CONFIG.name}`,
      default: SITE_CONFIG.title,
    },
    description: SITE_CONFIG.description,
    keywords: [
      "online shopping",
      "Pakistan",
      "electronics",
      "fashion",
      "home goods",
      "e-commerce",
      "SamiShops",
      "buy online",
      "free delivery",
      "cash on delivery",
    ],
    authors: [{ name: SITE_CONFIG.name }],
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_PK",
      url: SITE_CONFIG.url,
      title: SITE_CONFIG.title,
      description: SITE_CONFIG.description,
      siteName: SITE_CONFIG.name,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_CONFIG.title,
      description: SITE_CONFIG.description,
      images: [DEFAULT_OG_IMAGE.url],
      creator: "@samishops",
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.json",
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    alternates: {
      canonical: SITE_CONFIG.url,
    },
  };
}

/**
 * Generate metadata for product pages
 */
export function generateProductMetadata({
  productName,
  productDescription,
  productImage,
  productId,
  price,
}: {
  productName: string;
  productDescription: string;
  productImage?: string;
  productId: string;
  price: number;
}): Metadata {
  const title = `${productName} - Rs. ${price.toLocaleString()}`;
  const description = productDescription || SITE_CONFIG.description;
  const url = `${SITE_CONFIG.url}/product/${productId}`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: productImage
        ? [
            {
              url: productImage,
              width: 1200,
              height: 630,
              alt: productName,
            },
          ]
        : [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: productImage ? [productImage] : [DEFAULT_OG_IMAGE.url],
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Generate metadata for category pages
 */
export function generateCategoryMetadata({
  categoryName,
  categoryDescription,
}: {
  categoryName: string;
  categoryDescription?: string;
}): Metadata {
  const title = `${categoryName} - Shop Now`;
  const description = categoryDescription || `Shop ${categoryName} at SamiShops. Best prices, fast delivery.`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Generate JSON-LD structured data for product
 */
export function generateProductJsonLd({
  productName,
  productDescription,
  productImage,
  productId,
  price,
  availability,
  brand = "SamiShops",
}: {
  productName: string;
  productDescription: string;
  productImage?: string;
  productId: string;
  price: number;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  brand?: string;
}) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: productName,
    description: productDescription,
    image: productImage,
    productID: productId,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: "PKR",
      availability: `https://schema.org/${availability || "InStock"}`,
      url: `${SITE_CONFIG.url}/product/${productId}`,
    },
  };
}

/**
 * Generate JSON-LD structured data for website
 */
export function generateWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    description: SITE_CONFIG.description,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE_CONFIG.contact.phone,
      contactType: "Customer Service",
      email: SITE_CONFIG.contact.email,
    },
    sameAs: [
      SITE_CONFIG.links.facebook,
      SITE_CONFIG.links.twitter,
      SITE_CONFIG.links.instagram,
    ],
  };
}

/**
 * Generate breadcrumb JSON-LD
 */
export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
