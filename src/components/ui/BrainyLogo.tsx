"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface BrainyLogoProps {
    variant?: "full" | "icon" | "hero" | "navbar" | "watermark";
    className?: string;
}

export function BrainyLogo({ variant = "full", className }: BrainyLogoProps) {
    // Map variants to specific assets
    const getLogoSrc = () => {
        switch (variant) {
            case "navbar": return "/images/logo-navbar.png";
            case "watermark": return "/images/logo-watermark.png";
            case "full":
            case "hero": default: return "/images/logo-hero.png";
        }
    };

    const isIcon = variant === "icon";

    return (
        <div className={cn("relative select-none", className)}>
            {!isIcon ? (
                <div className="relative w-full h-full">
                    <Image
                        src={getLogoSrc()}
                        alt="Brainy Logo"
                        width={1024} // High res assets
                        height={1024}
                        className={cn(
                            "object-contain w-full h-full",
                            variant === "watermark" ? "opacity-30" : "drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                        )}
                        priority
                    />
                </div>
            ) : (
                <div className="relative w-full h-full overflow-hidden rounded-xl"> {/* Icon Variant - Crop from Hero */}
                    <Image
                        src="/images/logo-hero.png"
                        alt="Brainy Icon"
                        width={512}
                        height={512}
                        className="absolute top-0 left-0 w-full h-full object-cover scale-[1.3] origin-top"
                    />
                </div>
            )}
        </div>
    );
}
