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
                // BRAINY CURVE (V29.0): Standardized rounded-3xl (32px) and Glowing Border
                "glass-panel rounded-[2rem] border border-white/5 transition-all duration-300",
                "shadow-[0_0_20px_-5px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_-5px_var(--primary-glow)]", // Ambient Glow
                "hover:border-primary/30", // Subtle Blue Glow on hover
                "backdrop-blur-[12px] bg-[#0A0A0F]/60",
                isLowEnd ? "backdrop-blur-none bg-[#0A0A0F]/90" : "glass-premium",
                className
            )}
            {...props}
            style={{
                ...props.style,
                transform: "translate3d(0,0,0)", // GPU Hack: Force new layer
                willChange: "transform, backdrop-filter"
            }}
        >
            {children}
        </div>
    );
}
