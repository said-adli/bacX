// Server Component

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrainyStoneLogoSVG({ className }: { className?: string }) {
    return (
        <div className={cn("relative", className)}>
            <Image
                src="/images/brainy-logo-black.png"
                alt="Brainy"
                fill
                className="object-contain"
                style={{ filter: 'invert(1) brightness(2)' }}
                priority
            />
        </div>
    );
}
