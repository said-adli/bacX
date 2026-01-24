"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

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
                        <Logo showText={true} className="h-10" />
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
