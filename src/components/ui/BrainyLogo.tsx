// Server Component

import React from "react";
import { cn } from "@/lib/utils";
import { BrainyModernLogo } from "./BrainyModernLogo";

interface BrainyLogoProps {
    variant?: "full" | "icon" | "hero" | "navbar" | "watermark";
    className?: string;
    imageSrc?: string; // Kept for compability but ignored in favor of SVG
}

export function BrainyLogo({ variant = "full", className }: BrainyLogoProps) {
    const isWatermark = variant === "watermark";

    return (
        <div className={cn("relative select-none", className)}>
            <BrainyModernLogo className={cn(
                "w-full h-full",
                isWatermark ? "opacity-30" : ""
            )} />
        </div>
    );
}
