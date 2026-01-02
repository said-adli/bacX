"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
// ... imports
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
// Removed Framer Motion imports for View Transitions

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

    // Optimistic Rendering:
    // If loading, we assume we are authenticated (or checking) and show the shell skeleton/structure
    // to prevent layout shifts or blank screens. 
    // Middleware handles the actual security redirect.
    // We ALWAYS render the shell on protected routes to avoid the "Cliff" effect. We render the shell even while loading to show the UI structure immediately.
    return (
        <div className="flex h-screen w-full bg-background font-sans overflow-hidden text-foreground selection:bg-primary/30">
            {/* Sidebar — Desktop Wrapper */}
            <aside className="hidden lg:block w-[280px] h-full shrink-0 relative z-50">
                <div className="h-full w-full glass-nav border-l border-glass-border">
                    <Sidebar />
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full relative min-w-0">
                {/* Top Navigation */}
                <header className="h-16 w-full z-40 shrink-0 glass-nav border-b border-glass-border sticky top-0">
                    <TopNav />
                </header>

                {/* Page Content - Scrollable */}
                <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative">
                    <main className="w-full min-h-full p-6 lg:p-12 max-w-[1600px] mx-auto">
                        {children}
                    </main>
                </div>

                {/* Bottom Navigation — Mobile Only */}
                <div className="lg:hidden shrink-0 z-50">
                    <BottomNav />
                </div>
            </div>
        </div>
    );
}
