import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ============================================================================
  // Image Optimization
  // ============================================================================
  images: {
    // Use remotePatterns instead of deprecated domains
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
    ],
    // Image optimization settings
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable blur placeholders for better CLS
    placeholder: "blur",
    // Minimum cache TTL for optimized images (in seconds)
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },

  // ============================================================================
  // Caching Strategies
  // ============================================================================
  // Enable static generation for better performance
  generateEtags: true,

  // HTTP headers for caching
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(js|css)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
      // Security headers
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // ============================================================================
  // Production Optimizations
  // ============================================================================
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Optimize CSS
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },

  // Compression
  compress: true,

  // Power optimizations for production
  swcMinify: true,

  // ============================================================================
  // Experimental Features
  // ============================================================================
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ["lucide-react", "zustand"],
  },
};

export default nextConfig;
