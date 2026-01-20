"use client";

import { cn } from "@/lib/utils";
import { useIsLowEndDevice } from "@/hooks/useIsLowEndDevice";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
    const isLowEnd = useIsLowEndDevice();

    return (
        <div
            className={cn(
                "glass-panel backdrop-blur-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.5)] border-white/10",
                isLowEnd ? "backdrop-blur-md" : "glass-premium",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
