import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SamiShops - Your One-Stop Online Shopping Destination",
  description: "Shop the latest products at SamiShops. Discover amazing deals on electronics, fashion, home goods, and more. Fast shipping across Pakistan.",
  keywords: ["online shopping", "Pakistan", "electronics", "fashion", "home goods", "e-commerce", "SamiShops", "buy online", "free delivery", "cash on delivery"],
  authors: [{ name: "SamiShops" }],
  creator: "SamiShops",
  publisher: "SamiShops",
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
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://samishops.com",
    title: "SamiShops - Your One-Stop Online Shopping Destination",
    description: "Shop the latest products at SamiShops. Discover amazing deals on electronics, fashion, home goods, and more.",
    siteName: "SamiShops",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SamiShops",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SamiShops - Your One-Stop Online Shopping Destination",
    description: "Shop the latest products at SamiShops. Discover amazing deals on electronics, fashion, home goods, and more.",
    images: ["/og-image.png"],
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
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://samishops.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-[#f4f4f4] min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
