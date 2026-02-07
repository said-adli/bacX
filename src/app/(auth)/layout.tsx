import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white font-sans relative overflow-hidden selection:bg-blue-500/30">

            {/* --- DEEP SPACE BACKGROUND --- */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* 1. Base Gradient */}
                <div className="absolute inset-0 bg-[#020617]" />

                {/* 2. Animated Galaxy Blobs (GPU Accelerated) */}
                <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-[ambient-motion_20s_infinite] transform-gpu will-change-transform" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-[ambient-motion_25s_infinite_reverse] transform-gpu will-change-transform" />
                <div className="absolute top-[40%] left-[30%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[100px] mix-blend-screen animate-[pulse_10s_infinite] transform-gpu will-change-transform" />

                {/* 3. Cinematic Grain Overlay */}
                <div className="absolute inset-0 film-grain z-10 opacity-20" />
            </div>

            {/* Logo Section */}
            <Link
                href="/"
                className="relative z-20 mb-10 flex flex-col items-center group transition-all duration-300 hover:scale-105"
            >
                <div className="relative mb-6 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_40px_-10px_rgba(37,99,235,0.3)] group-hover:shadow-[0_0_60px_-10px_rgba(37,99,235,0.5)] transition-all duration-500">
                    <Logo className="w-16 h-16 text-white brightness-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                </div>
                <span className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] font-serif">Brainy</span>
            </Link>

            {/* Glass Card Container */}
            <div className="relative z-10 w-full max-w-md px-4 animate-in fade-in zoom-in duration-500">
                <div className="backdrop-blur-2xl bg-[#020617]/40 border border-white/10 rounded-3xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] p-8 md:p-10 relative overflow-hidden transform-gpu">

                    {/* Top Shine */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />

                    {/* Inner Content */}
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            </div>

            {/* Footer Copyright */}
            <div className="absolute bottom-6 text-center z-10">
                <p className="text-xs text-white/20 font-medium">
                    &copy; 2026 Brainy Platform. All rights reserved.
                </p>
            </div>
        </div>
    );
}
