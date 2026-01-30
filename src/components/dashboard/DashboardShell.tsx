"use client";

import { useSidebar } from "@/context/SidebarContext";
import RightGlassSidebar from "./RightGlassSidebar";
import StickyGlassMenu from "./StickyGlassMenu";
import MobileBottomNav from "./MobileBottomNav"; // [NEW]
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/hooks/use-media-query"; // [NEW]

import { usePlayer } from "@/context/PlayerContext";
import { GlobalVideoPlayer } from "@/components/player/GlobalVideoPlayer";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();
    const { registerMiniTarget, viewMode, isPlaying } = usePlayer();
    const miniTargetRef = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery("(max-width: 768px)"); // [NEW]

    // Register Mini Target on Mount
    useEffect(() => {
        if (miniTargetRef.current) {
            registerMiniTarget(miniTargetRef.current);
        }
    }, [registerMiniTarget]); // Stable callback

    return (
        <div className="relative min-h-screen text-white font-sans selection:bg-blue-500/30 bg-[#0B0E14] overflow-hidden" dir="rtl">
            <GlobalVideoPlayer />

            {/* Sidebar (Fixed Right) - Hidden on Mobile */}
            <div className="hidden md:block">
                <RightGlassSidebar />
            </div>

            {/* Mobile Bottom Nav - Visible on Mobile Only */}
            <MobileBottomNav />

            {/* Top Bar (Fixed) */}
            <StickyGlassMenu />

            {/* Main Content Area - Animating Margin */}
            <motion.main
                initial={false}
                animate={{
                    // On mobile, margin is 0. On desktop, it depends on sidebar state.
                    marginRight: isMobile ? 0 : (isCollapsed ? 90 : 288),
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="min-h-screen pt-28 px-4 md:px-12 pb-32 md:pb-10 relative z-10 gpu-accelerated"
            >
                {children}
            </motion.main>

            {/* SPACER SHIM (Prevents Mini Player from covering content on mobile) */}
            {/* Height = Mini Player Height (approx 200px) + Padding */}
            {viewMode === 'mini' && (
                <div className="h-[240px] w-full md:hidden" aria-hidden="true" />
            )}

            {/* MINI PLAYER PORTAL TARGET (Floating Footer) */}
            {/* 
               Constraint: "Mini Mode: Must have a specific, declared z-index > MobileNav"
               MobileNav is z-[90]. We use z-[100].
            */}
            <div
                ref={miniTargetRef}
                className={`fixed bottom-24 md:bottom-4 left-4 right-4 md:left-6 md:right-auto z-[100] 
                    w-auto md:w-[320px] aspect-video 
                    transition-transform duration-500 ease-spring 
                    ${viewMode === 'mini' ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0'}`}
                style={{ pointerEvents: viewMode === 'mini' ? 'auto' : 'none' }}
            />
        </div>
    );
}
