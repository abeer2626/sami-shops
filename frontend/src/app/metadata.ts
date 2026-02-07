import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://samishops.vercel.app";

export const siteConfig = {
    name: "SamiShops",
    description: "Your one-stop online marketplace for quality products at great prices. Shop from thousands of vendors with fast shipping and secure payments.",
    url: SITE_URL,
    ogImage: `${SITE_URL}/og-image.png`,
    links: {
        twitter: "https://twitter.com/samishops",
        facebook: "https://facebook.com/samishops",
        instagram: "https://instagram.com/samishops",
    },
};

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [
        "online shopping",
        "marketplace",
        "ecommerce",
        "Pakistan",
        "SamiShops",
        "buy online",
        "best prices",
        "quality products",
        "fast delivery",
    ],
    authors: [
        {
            name: "SamiShops",
            url: SITE_URL,
        },
    ],
    creator: "SamiShops",
    metadataBase: new URL(SITE_URL),
    openGraph: {
        type: "website",
        locale: "en_US",
        url: SITE_URL,
        title: siteConfig.name,
        description: siteConfig.description,
        siteName: siteConfig.name,
        images: [
            {
                url: siteConfig.ogImage,
                width: 1200,
                height: 630,
                alt: siteConfig.name,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: siteConfig.name,
        description: siteConfig.description,
        images: [siteConfig.ogImage],
        creator: "@samishops",
    },
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
    verification: {
        google: "your-google-verification-code",
    },
};

export function generatePageMetadata({
    title,
    description,
    image,
    path = "",
}: {
    title: string;
    description?: string;
    image?: string;
    path?: string;
}): Metadata {
    const url = path ? `${SITE_URL}${path}` : SITE_URL;

    return {
        title,
        description: description || siteConfig.description,
        openGraph: {
            url,
            title,
            description: description || siteConfig.description,
            images: image
                ? [
                    {
                        url: image,
                        width: 1200,
                        height: 630,
                        alt: title,
                    },
                ]
                : undefined,
        },
        twitter: {
            title,
            description: description || siteConfig.description,
            images: image ? [image] : undefined,
        },
        alternates: {
            canonical: url,
        },
    };
}
