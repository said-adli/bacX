"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    // CRITICAL: Track if redirect has been initiated to prevent loop
    const hasRedirected = useRef(false);

    // Mounted guard - ensures we only render after client is ready
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Auth redirect logic - only runs after mounted and auth resolved
    useEffect(() => {
        if (!isMounted || loading) return;

        if (!user && !hasRedirected.current) {
            hasRedirected.current = true;
            router.replace('/login');
        }
    }, [isMounted, loading, user, router]);

    // Show loading while auth is resolving or not mounted
    if (!isMounted || loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    // If no user after auth resolved, show loading (redirect in progress)
    if (!user) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    // SIMPLE LAYOUT - Matching admin layout structure
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans" dir="rtl">
            {/* Sidebar - Desktop Only, Fixed on Right */}
            <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 right-0 z-40 border-l border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
                <Sidebar />
            </aside>

            {/* Main Content Wrapper - Offset by sidebar width on desktop */}
            <div className="lg:mr-72 min-h-screen">
                {/* Top Navigation */}
                <header className="sticky top-0 z-30 h-20 border-b border-white/5 bg-[#050505]/90 backdrop-blur-xl">
                    <TopNav />
                </header>

                {/* Page Content - Simple render, no AnimatePresence blocking */}
                <main className="p-6 lg:p-10">
                    {children}
                </main>
            </div>

            {/* Bottom Navigation - Mobile Only */}
            <BottomNav />
        </div>
    );
}
