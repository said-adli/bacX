"use client";

import React from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    src?: string | null;
    alt?: string;
    fallback?: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
};

export function UserAvatar({
    src,
    alt = "User",
    fallback,
    size = "md",
    className
}: UserAvatarProps) {
    const [error, setError] = React.useState(false);

    return (
        <div
            className={cn(
                "relative rounded-full overflow-hidden border border-white/10 flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-indigo-600/10",
                sizeClasses[size],
                className
            )}
        >
            {src && !error ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                    onError={() => setError(true)}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/50 font-bold">
                    {fallback ? (
                        fallback.charAt(0).toUpperCase()
                    ) : (
                        <User className="w-1/2 h-1/2" />
                    )}
                </div>
            )}
        </div>
    );
}
