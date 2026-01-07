import { Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";

// ============================================================================
// DASHBOARD LAYOUT - PURE SERVER COMPONENT
// ============================================================================
// RULES:
// - NO "use client"
// - NO useAuth, useEffect, useState
// - NO conditional rendering based on auth state
// - Just render the shell. Auth is handled by middleware.ts
// ============================================================================

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans" dir="rtl">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 right-0 z-40 border-l border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
                <Sidebar />
            </aside>

            {/* Main */}
            <div className="lg:mr-72 min-h-screen">
                <header className="sticky top-0 z-30 h-20 border-b border-white/5 bg-[#050505]/90 backdrop-blur-xl">
                    <TopNav />
                </header>

                <main className="p-6 lg:p-10">
                    <Suspense fallback={<div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
                        {children}
                    </Suspense>
                </main>
            </div>

            <BottomNav />
        </div>
    );
}
