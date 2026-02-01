"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    LogOut,
    Menu
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useMediaQuery } from "@/hooks/use-media-query";

// ============================================================================
// BRAINY V3 - GLASS SIDEBAR (SLIDING)
// ============================================================================

const menuItems = [
    { icon: LayoutDashboard, label: "لوحة القيادة", href: "/dashboard" },
    { icon: BookOpen, label: "المواد", href: "/materials" }, // Fixed href to materials (matches user audit context usually)
    { icon: PlayCircle, label: "الجلسات المباشرة", href: "/live" },
    { icon: Users, label: "المجتمع", href: "/community" },
    { icon: User, label: "الملف الشخصي", href: "/profile" },
    { icon: Settings, label: "الإعدادات", href: "/settings" },
];

const GlassSidebarComponent = function GlassSidebar() {
    const pathname = usePathname();
    const { logout, profile } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const isMobile = useMediaQuery("(max-width: 1024px)");

    // Auto-collapse on mobile, expand on desktop
    useEffect(() => {
        setIsCollapsed(isMobile);
    }, [isMobile]);

    // Sidebar Widths
    const width = isCollapsed ? 80 : 280;

    return (
        <>
            {/* Desktop Placeholder to push content */}
            {!isMobile && (
                <div
                    className="hidden lg:block transition-all duration-300 ease-in-out"
                    style={{ width: width, minWidth: width }}
                />
            )}

            {/* Mobile Toggle Button (Fixed on screen) */}
            {isMobile && isCollapsed && (
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="fixed bottom-6 left-6 z-50 p-4 bg-blue-600 rounded-full shadow-lg text-white hover:bg-blue-500 transition-colors"
                >
                    <Menu size={24} />
                </button>
            )}

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && !isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCollapsed(true)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[49]"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{
                    width: isMobile && isCollapsed ? 0 : width,
                    x: isMobile && isCollapsed ? "100%" : 0 // Slide out on mobile
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`fixed top-0 right-0 h-screen z-[100] border-l border-white/10 bg-[#050505]/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden gpu-accelerated
                   ${isMobile ? "right-0" : ""} 
                `}
            >
                {/* Header: Logo & Toggle */}
                <div className="flex flex-col items-center p-4 border-b border-white/5">
                    {/* Logo - Single clean instance */}
                    <Logo className="w-16 h-16 mx-auto mb-6 block" />

                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors self-start"
                    >
                        {isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);

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

                {/* Footer: User Avatar */}
                <div className="p-4 border-t border-white/5">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 px-2 animate-in fade-in">
                            <UserAvatar
                                src={profile?.avatar_url}
                                fallback={profile?.full_name}
                                size="md"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{profile?.full_name || "مستخدم"}</p>
                                <button onClick={logout} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mt-0.5">
                                    <LogOut size={12} />
                                    تسجيل خروج
                                </button>
                            </div>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="flex justify-center">
                            <UserAvatar src={profile?.avatar_url} fallback={profile?.full_name} size="sm" />
                        </div>
                    )}
                </div>
            </motion.aside>
        </>
    );
};

export const GlassSidebar = React.memo(GlassSidebarComponent);
