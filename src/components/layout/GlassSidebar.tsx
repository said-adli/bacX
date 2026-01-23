"use client";
import React from "react";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    BookOpen,
    PlayCircle,
    Users,
    User,
    Settings,
    ChevronRight,
    ChevronLeft,
    LogOut
} from "lucide-react";
import { BrainyLogo } from "@/components/ui/BrainyLogo";
import { useAuth } from "@/context/AuthContext";

// ============================================================================
// BRAINY V3 - GLASS SIDEBAR (SLIDING)
// ============================================================================
// Fixed Right (RTL) - Collapsible - Ultra Glass
// ============================================================================

const menuItems = [
    { icon: LayoutDashboard, label: "لوحة القيادة", href: "/dashboard" },
    { icon: BookOpen, label: "المواد", href: "/subjects" },
    { icon: PlayCircle, label: "الجلسات المباشرة", href: "/live" },
    { icon: Users, label: "المجتمع", href: "/community" },
    { icon: User, label: "الملف الشخصي", href: "/profile" },
    { icon: Settings, label: "الإعدادات", href: "/settings" },
];

const GlassSidebarComponent = function GlassSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Sidebar Widths
    const width = isCollapsed ? 80 : 280;

    return (
        <>
            {/* Placeholder to push content (optional, or handle in layout) */}
            <div
                className="hidden lg:block transition-all duration-300 ease-in-out"
                style={{ width: width, minWidth: width }}
            />

            <motion.aside
                initial={false}
                animate={{ width: width }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 h-screen z-50 border-l border-white/10 bg-[#050505]/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden gpu-accelerated"
            >
                {/* Header: Logo & Toggle */}
                <div className="flex items-center justify-between p-6 h-24 border-b border-white/5">
                    <AnimatePresence mode="wait">
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-3 overflow-hidden"
                            >
                                <div className="relative w-10 h-10">
                                    <Image
                                        src="/images/brainy-logo-black.png"
                                        alt="Brainy"
                                        fill
                                        className="object-contain"
                                        style={{ filter: 'invert(1) brightness(2)' }}
                                    />
                                </div>
                                <span className="font-bold text-2xl tracking-wide bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent font-serif">Brainy</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden ${isActive
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {/* Active Glow Line (Left) */}
                                {isActive && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-l-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                )}

                                <item.icon size={22} className={`min-w-[22px] transition-colors ${isActive ? "text-emerald-400" : "group-hover:text-white"}`} />

                                <AnimatePresence mode="wait">
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="font-medium whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        );
                    })}
                </div>

                {/* Footer: User & Logout */}
                <div className="p-4 border-t border-white/5">
                    {/* Logout button moved to Profile Dropdown */}
                </div>
            </motion.aside>
        </>
    );
};

export const GlassSidebar = React.memo(GlassSidebarComponent);
