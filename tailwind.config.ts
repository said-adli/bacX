import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class',
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                surface: "var(--card)",
                "surface-highlight": "var(--accent)",
                border: "var(--border)",
                primary: "var(--primary)",
                "primary-glow": "rgba(41, 151, 255, 0.15)",
                "text-main": "var(--foreground)",
                "text-muted": "var(--muted-foreground)",
                // Luxury Palette
                "dark-bg": "#020617", // Deep Space
                "glass": "rgba(255, 255, 255, 0.03)",
                "glass-heavy": "rgba(255, 255, 255, 0.05)",
            },
            fontFamily: {
                sans: ["var(--font-sans)", "sans-serif"],
            },
            borderRadius: {
                '3xl': '1.5rem',
            },
            animation: {
                shimmer: "shimmer 2s linear infinite",
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                shimmer: {
                    from: {
                        backgroundPosition: "0 0",
                    },
                    to: {
                        backgroundPosition: "-200% 0",
                    },
                },
            },
            backgroundImage: {
                'mesh-gradient': 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)',
                'mesh-gradient-light': 'radial-gradient(at 0% 0%, hsla(215, 100%, 96%, 1) 0, transparent 50%), radial-gradient(at 50% 100%, hsla(215, 100%, 96%, 1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(215, 100%, 96%, 1) 0, transparent 50%)',
            },
        },
    },
    plugins: [],
};

export default config;
