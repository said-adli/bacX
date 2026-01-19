"use client";

import { cn } from "@/lib/utils";
import { useIsLowEndDevice } from "@/hooks/useIsLowEndDevice";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
    const isLowEnd = useIsLowEndDevice();

    return (
        <div
            className={cn(
                "glass-panel backdrop-blur-[20px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.5)] border-white/10",
                isLowEnd ? "glass-fallback" : "glass-premium",
                className
            )}
        >
            {children}
        </div>
    );
}
