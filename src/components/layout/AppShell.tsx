"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
import { motion, AnimatePresence } from "framer-motion";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, loading } = useAuth();

    // Routes that should NOT have the dashboard layout
    const publicRoutes = ['/', '/auth', '/maintenance'];
    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    // Don't render shell for public routes
    if (isPublicRoute) {
        return <>{children}</>;
    }

    // During auth loading
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[var(--foreground)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // If no user after loading
    if (!user) {
        return <>{children}</>;
    }

    // Authenticated user — Notion-style layout
    return (
        <div className="min-h-screen bg-background font-sans transition-colors duration-300">
            {/* Sidebar — Desktop Only */}
            <div className="hidden lg:block fixed right-0 top-0 h-full z-40">
                <Sidebar />
            </div>

            {/* Bottom Navigation — Mobile Only */}
            <BottomNav />

            {/* Top Navigation */}
            <div className="lg:pr-[240px]">
                <TopNav />
            </div>

            {/* Main Content */}
            <AnimatePresence mode="wait">
                <motion.main
                    key={pathname}
                    className="min-h-screen pt-20 pb-24 lg:pb-8 pr-4 pl-4 lg:pr-[260px] lg:pl-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {children}
                </motion.main>
            </AnimatePresence>
        </div>
    );
}
