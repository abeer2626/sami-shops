import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://samishops.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
    // Static routes
    const routes = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 1,
        },
        {
            url: `${SITE_URL}/search`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/flash-sale`,
            lastModified: new Date(),
            changeFrequency: "hourly" as const,
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/categories`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.5,
        },
    ];

    return routes;
}
