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
            // INFRASTRUCTURE: VIEWPORT STABILITY
            height: {
                screen: '100dvh',
            },
            minHeight: {
                screen: '100dvh',
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                surface: "var(--card)",
                "surface-highlight": "var(--accent)",
                border: "var(--border)",
                // Electric Blue Palette — The New Primary
                primary: "var(--primary)",
                "primary-foreground": "var(--primary-foreground)",
                "primary-glow": "rgba(37, 99, 235, 0.15)",
                accent: "var(--accent)",
                "accent-foreground": "var(--accent-foreground)",
                // Text Colors
                "text-main": "var(--foreground)",
                "text-muted": "var(--muted-foreground)",
                // Luxury Dark Palette
                "charcoal": "#0A0A0F",
                "charcoal-light": "#12121A",
                // Glassmorphism
                "glass": "var(--glass-surface)",
                "glass-border": "var(--glass-border)",
            },
            fontFamily: {
                sans: ["var(--font-sans)", "sans-serif"],
                serif: ["var(--font-serif)", "serif"],
                amiri: ["var(--font-amiri)", "serif"],
                cinzel: ["var(--font-cinzel)", "serif"],
            },
            borderRadius: {
                '4xl': '2.5rem',
                '3xl': '2rem',
                '2xl': '1.5rem',
                'xl': '1rem',
                'lg': '0.75rem',
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
            },
            animation: {
                shimmer: "shimmer 2s linear infinite",
                'spin-slow': 'spin 3s linear infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
            },
            keyframes: {
                shimmer: {
                    from: { backgroundPosition: "0 0" },
                    to: { backgroundPosition: "-200% 0" },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
            },
            backgroundImage: {
                'mesh-gradient': 'radial-gradient(at 0% 0%, hsla(220, 70%, 10%, 0.8) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(220, 60%, 20%, 0.5) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(220, 50%, 15%, 0.6) 0, transparent 50%)',
                'mesh-gradient-blue': 'radial-gradient(at 0% 0%, hsla(220, 80%, 20%, 0.3) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(220, 70%, 25%, 0.2) 0, transparent 50%)',
            },
            boxShadow: {
                'glow': '0 0 24px var(--primary-glow)',
                'glow-lg': '0 0 40px var(--primary-glow)',
                'glass': '0 4px 24px -2px rgba(0, 0, 0, 0.4)',
                'dropdown': '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
            },
        },
    },
    plugins: [],
};

export default config;
