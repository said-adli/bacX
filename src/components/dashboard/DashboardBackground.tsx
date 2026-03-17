"use client";

import { usePageVisibility } from "@/hooks/usePageVisibility";

export function DashboardBackground() {
    const isVisible = usePageVisibility();

    return (
        <div className={`fixed inset-0 z-0 pointer-events-none ${!isVisible ? "animations-paused" : ""}`}>
            {/* Base Deep Charcoal */}
            <div className="absolute inset-0 bg-[#020617]" />

            {/* Ambient Glowing Blobs - GPU ACCELERATED (Desktop Only) */}
            <div className="hidden md:block absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[10px] mix-blend-screen animate-[ambient-motion_20s_infinite] gpu-accelerated" />
            <div className="hidden md:block absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[10px] mix-blend-screen animate-[ambient-motion_25s_infinite_reverse] gpu-accelerated" />
            <div className="hidden md:block absolute top-[40%] left-[30%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[10px] mix-blend-screen animate-[pulse_10s_infinite] gpu-accelerated" />

            {/* Mobile Optimized Static Gradient (No Blur/Animation) */}
            <div className="block md:hidden absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#020617] via-[#0B0E14] to-black" />

            {/* Cinematic Grain Overlay */}
            <div className="absolute inset-0 film-grain z-10 opacity-30" />
        </div>
    );
}
