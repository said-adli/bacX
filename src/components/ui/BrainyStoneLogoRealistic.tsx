"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrainyStoneLogoRealistic({ className }: { className?: string }) {
    return (
        <div className={cn("relative", className)}>
            <Image
                src="/images/brainy-logo-v3.png"
                alt="Brainy"
                fill
                className="object-contain"
                priority
            />
        </div>
    );
}
