import { cn } from "@/lib/utils";
import React from "react";

interface AdminGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    gradient?: boolean;
}

export function AdminGlassCard({
    children,
    className,
    gradient = false,
    ...props
}: AdminGlassCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl",
                gradient && "bg-gradient-to-br from-white/5 to-transparent",
                className
            )}
            {...props}
        >
            {/* Glossy top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Inner Content */}
            <div className="relative z-10 p-6">
                {children}
            </div>
        </div>
    );
}
