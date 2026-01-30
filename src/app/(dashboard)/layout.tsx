"use client";

import { SidebarProvider } from "@/context/SidebarContext";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { usePageVisibility } from "@/hooks/usePageVisibility";

// ============================================================================
// BRAINY DASHBOARD LAYOUT V3 - CALM GLASS EDITION (With Collapsible Sidebar)
// ============================================================================

import { NotificationProvider } from "@/context/NotificationContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { RealtimeSystemStatus } from "@/components/dashboard/RealtimeSystemStatus";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const isVisible = usePageVisibility();

    return (
        <SidebarProvider>
            <NotificationProvider>
                <PlayerProvider>
                    <RealtimeSystemStatus />
                    {/* Dark Luxury Mesh Gradient Background (Kept global here) */}
                    <div className={`fixed inset-0 z-0 pointer-events-none ${!isVisible ? "animations-paused" : ""}`}>
                        {/* Base Deep Charcoal */}
                        <div className="absolute inset-0 bg-[#0B0E14]" />

                        {/* Ambient Glowing Blobs - GPU ACCELERATED */}
                        <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-[ambient-motion_20s_infinite] gpu-accelerated" />
                        <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-indigo-600/15 rounded-full blur-[120px] mix-blend-screen animate-[ambient-motion_25s_infinite_reverse] gpu-accelerated" />
                        <div className="absolute top-[40%] left-[30%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[100px] mix-blend-screen animate-[pulse_10s_infinite] gpu-accelerated" />

                        {/* Cinematic Grain Overlay */}
                        <div className="absolute inset-0 film-grain z-10" />
                    </div>

                    <DashboardShell>
                        {/* THE SOUL */}
                        <div className="flex justify-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 delay-300">
                            <p className="text-sm md:text-base font-serif text-white/30 tracking-widest pointer-events-none select-none">
                                "إنَّ اللهَ يَقْذِفُ العِلْمَ فِي قَلْبِ مَنْ يُحِبُّ"
                            </p>
                        </div>
                        {children}
                    </DashboardShell>
                </PlayerProvider>
            </NotificationProvider>
        </SidebarProvider>
    );
}

