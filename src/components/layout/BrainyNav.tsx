"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// BRAINY NAVIGATION - QODER STYLE TRANSPARENT PILL
// ============================================================================
// Ultra-minimalist floating navbar with transparent glass effect
// ============================================================================

const navItems = [
    { label: "المنتج", href: "/product" },
    { label: "المسارات", href: "/tracks" },
    { label: "الأسعار", href: "/pricing" },
    { label: "المدونة", href: "/blog" },
];

export function BrainyNav() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    return (
        <>
            <nav className="fixed top-4 right-1/2 translate-x-1/2 z-50 w-[95%] max-w-fit">
                <div className="flex items-center gap-2 px-2 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">
                    {/* Brand Logo */}
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-full transition-all duration-200"
                    >
                        {/* Brainy Icon - Vibrant Green */}
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl blur-md opacity-60" />
                            <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl">
                                <svg
                                    className="w-7 h-7 text-black"
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

                    {/* Desktop Divider */}
                    <div className="hidden md:block w-px h-6 bg-white/10" />

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
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

                    {/* Mobile Hamburger Trigger */}
                    <button
                        className="md:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[100] md:hidden">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        {/* Menu Content */}
                        <motion.div
                            initial={{ y: "-100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute top-0 left-0 right-0 bg-[#0B0E14] border-b border-white/10 p-6 shadow-2xl rounded-b-3xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-xl font-bold text-white">القائمة</span>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-2">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-lg font-medium text-zinc-300 hover:text-white hover:bg-white/5 p-4 rounded-2xl transition-all flex items-center justify-between group"
                                    >
                                        <span>{item.label}</span>
                                        <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" size={16} />
                                    </Link>
                                ))}
                                {/* Add Dashboard Link for Mobile Convenience */}
                                <div className="h-px bg-white/5 my-2" />
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-bold text-emerald-400 bg-emerald-500/10 p-4 rounded-2xl text-center mt-2"
                                >
                                    تسجيل الدخول
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
