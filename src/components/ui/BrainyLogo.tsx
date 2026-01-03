"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface BrainyLogoProps {
    variant?: "full" | "icon" | "hero" | "navbar" | "watermark";
    className?: string;
}

export function BrainyLogo({ variant = "full", className }: BrainyLogoProps) {
    const isWatermark = variant === "watermark";

    return (
        <div className={cn("relative select-none", className)}>
            <div className="relative w-full h-full">
                <Image
                    src="/logo.png"
                    alt="Brainy Logo"
                    width={512}
                    height={512}
                    className={cn(
                        "object-contain w-full h-full",
                        className?.includes("drop-shadow") ? "" : (isWatermark ? "opacity-30" : "drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]")
                    )}
                    priority
                />
            </div>
        </div>
    );
}
