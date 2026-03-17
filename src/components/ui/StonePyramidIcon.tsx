// Server Component

import React from "react";
import { cn } from "@/lib/utils";

export function StonePyramidIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("w-full h-full drop-shadow-2xl", className)}
        >
            <defs>
                {/* Obsidian Body Gradient */}
                <linearGradient id="obsidianGradient" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#2A2A35" />
                    <stop offset="50%" stopColor="#0F0F13" />
                    <stop offset="100%" stopColor="#000000" />
                </linearGradient>

                {/* Gold Capstone Gradient */}
                <linearGradient id="goldGradient" x1="50" y1="10" x2="50" y2="40" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FDE68A" /> {/* amber-200 */}
                    <stop offset="50%" stopColor="#D97706" /> {/* amber-600 */}
                    <stop offset="100%" stopColor="#92400E" /> {/* amber-800 */}
                </linearGradient>

                {/* Subtle Shine */}
                <linearGradient id="shine" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="white" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>

            {/* Main Pyramid Body */}
            <path
                d="M50 25 L90 90 H10 L50 25Z"
                fill="url(#obsidianGradient)"
                stroke="#1A1A20"
                strokeWidth="1"
            />

            {/* Front Face Highlight (Left) */}
            <path
                d="M50 25 L50 90 L10 90 Z"
                fill="black"
                fillOpacity="0.2"
            />

            {/* Capstone (The Eye) */}
            <path
                d="M50 10 L65 35 H35 L50 10Z"
                fill="url(#goldGradient)"
                className="drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]"
            />

            {/* Eye Detail */}
            <circle cx="50" cy="25" r="3" fill="#000" fillOpacity="0.8" />
        </svg>
    );
}
