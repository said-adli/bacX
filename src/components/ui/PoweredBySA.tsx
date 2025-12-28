"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface PoweredBySAProps {
    variant?: "footer" | "prominent";
    className?: string;
}

/**
 * Powered by SA Signature Component
 * A professional, minimalist signature for the bacX platform
 */
export function PoweredBySA({ variant = "footer", className }: PoweredBySAProps) {
    const [isHovered, setIsHovered] = useState(false);

    const isFooter = variant === "footer";

    return (
        <div
            className={cn(
                "flex items-center justify-center gap-1.5 select-none transition-all duration-300",
                isFooter ? "opacity-40 hover:opacity-70" : "opacity-70 hover:opacity-100",
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span
                className={cn(
                    "font-light tracking-wide transition-colors duration-300",
                    isFooter ? "text-xs text-slate-500" : "text-sm text-slate-400"
                )}
            >
                Powered by
            </span>

            {/* Separator Line */}
            <span
                className={cn(
                    "w-px bg-gradient-to-b from-transparent via-slate-500/50 to-transparent transition-all duration-300",
                    isFooter ? "h-3" : "h-4",
                    isHovered && "via-primary/70"
                )}
            />

            {/* SA Monogram */}
            <div className="relative overflow-hidden">
                <span
                    className={cn(
                        "font-semibold tracking-tight transition-all duration-300",
                        isFooter ? "text-xs" : "text-sm",
                        isHovered
                            ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
                            : "text-slate-400"
                    )}
                    style={{
                        fontFamily: "'Inter', 'Montserrat', system-ui, sans-serif",
                    }}
                >
                    {isHovered ? (
                        <span className="animate-in fade-in slide-in-from-right-2 duration-200">
                            Said Adli
                        </span>
                    ) : (
                        "SA"
                    )}
                </span>
            </div>
        </div>
    );
}

/**
 * Footer Signature - Low opacity, subtle
 */
export function FooterSignature({ className }: { className?: string }) {
    return (
        <div className={cn("py-4", className)}>
            <PoweredBySA variant="footer" />
        </div>
    );
}

/**
 * Auth Page Signature - More prominent
 */
export function AuthSignature({ className }: { className?: string }) {
    return (
        <div className={cn("mt-6 pt-4 border-t border-white/5", className)}>
            <PoweredBySA variant="prominent" />
        </div>
    );
}

export default PoweredBySA;
