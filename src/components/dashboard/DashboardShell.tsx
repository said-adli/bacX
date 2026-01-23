"use client";

import { useSidebar } from "@/context/SidebarContext";
import RightGlassSidebar from "./RightGlassSidebar";
import StickyGlassMenu from "./StickyGlassMenu";
import { motion } from "framer-motion";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="relative min-h-screen text-white font-sans selection:bg-blue-500/30 bg-[#0B0E14] overflow-hidden" dir="rtl">

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

            {/* Mobile Overlay (Optional refinement) */}
        </div>
    );
}
