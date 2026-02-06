import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#004B91",
                    foreground: "#ffffff",
                },
                secondary: {
                    DEFAULT: "#F5F5F5",
                    foreground: "#212121",
                },
                accent: {
                    DEFAULT: "#F57224",
                    foreground: "#ffffff",
                },
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            container: {
                center: true,
                padding: "1rem",
                screens: {
                    "2xl": "1280px",
                },
            },
        },
    },
    plugins: [],
};
export default config;
