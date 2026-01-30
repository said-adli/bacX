"use client";

import { useSidebar } from "@/context/SidebarContext";
import RightGlassSidebar from "./RightGlassSidebar";
import StickyGlassMenu from "./StickyGlassMenu";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

import { usePlayer } from "@/context/PlayerContext";
import { GlobalVideoPlayer } from "@/components/player/GlobalVideoPlayer";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();
    const { registerMiniTarget, viewMode, isPlaying } = usePlayer();
    const miniTargetRef = useRef<HTMLDivElement>(null);

    // Register Mini Target on Mount
    useEffect(() => {
        if (miniTargetRef.current) {
            registerMiniTarget(miniTargetRef.current);
        }
    }, [registerMiniTarget]); // Stable callback

    return (
        <div className="relative min-h-screen text-white font-sans selection:bg-blue-500/30 bg-[#0B0E14] overflow-hidden" dir="rtl">
            <GlobalVideoPlayer />

            {/* Background System (Moved here from layout.tsx for cleanliness, or kept in layout.tsx? 
                The plan said layout.tsx would be simplified. Let's keep the background in layout.tsx 
                WRAPPER, but the Shell handles the content flow.
                Actually, the user wants the MAIN CONTENT to resize. 
                So the Shell should output Sidebar + Content.
            */}

            {/* Sidebar (Fixed Right) */}
            <RightGlassSidebar />

            {/* Top Bar (Fixed) */}
            <StickyGlassMenu />

            {/* Main Content Area - Animating Margin */}
            <motion.main
                initial={false}
                animate={{
                    marginRight: isCollapsed ? 80 : 288, // 20 (5rem) vs 72 (18rem) or slightly different padding
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="min-h-screen pt-28 px-4 md:px-12 pb-10 relative z-10 gpu-accelerated"
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
               Constraint: "Mini Mode: Must have a specific, declared z-index (e.g., 50)"
               We use z-[50].
               Mobile: Full width minus 2rem (margin-x-4 = 1rem each side, or left-6 = 1.5rem)
               Let's use fixed margins.
            */}
            <div
                ref={miniTargetRef}
                className={`fixed bottom-4 left-4 right-4 md:left-6 md:right-auto z-[50] 
                    w-auto md:w-[320px] aspect-video 
                    transition-transform duration-500 ease-spring 
                    ${viewMode === 'mini' ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0'}`}
                style={{ pointerEvents: viewMode === 'mini' ? 'auto' : 'none' }}
            />
        </div>
    );
}
