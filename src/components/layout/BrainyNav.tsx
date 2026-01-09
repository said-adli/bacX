"use client";

import Link from "next/link";

// ============================================================================
// BRAINY NAVIGATION - QODER STYLE TRANSPARENT PILL
// ============================================================================
// Ultra-minimalist floating navbar with transparent glass effect
// ============================================================================

const navItems = [
    { label: "المنتج", href: "/product" },
    { label: "للمؤسسات", href: "/enterprise" },
    { label: "الأسعار", href: "/pricing" },
    { label: "المدونة", href: "/blog" },
    { label: "الدروس", href: "/docs" },
    { label: "المنتدى", href: "/forum" },
];

export function BrainyNav() {
    return (
        <nav className="fixed top-4 right-1/2 translate-x-1/2 z-50">
            <div className="flex items-center gap-2 px-2 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">
                {/* Brand Logo */}
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-full transition-all duration-200"
                >
                    {/* Brainy Icon - Vibrant Green */}
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg blur-sm opacity-60" />
                        <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg">
                            <svg
                                className="w-5 h-5 text-black"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                />
                            </svg>
                        </div>
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        Brainy
                    </span>
                </Link>

                {/* Divider */}
                <div className="w-px h-6 bg-white/10" />

                {/* Navigation Links */}
                <div className="flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-full transition-all duration-200"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-white/10" />

                {/* Action Button - White Pill */}
                <Link
                    href="/download"
                    className="px-5 py-2 text-sm font-semibold text-black bg-white hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                >
                    تحميل
                </Link>
            </div>
        </nav>
    );
}
