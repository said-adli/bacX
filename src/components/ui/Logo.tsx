"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
    variant?: "full" | "icon";
    className?: string;
}

export function Logo({ variant = "full", className }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-3 select-none", className)}>
            {/* The Cinematic "B" Icon */}
            <div className="relative w-12 h-12 flex items-center justify-center">
                {/* Outer Glow - Electric Blue */}
                <div className="absolute inset-0 bg-blue-600/30 blur-xl rounded-xl animate-pulse-slow" />

                {/* SVG Container */}
                <svg
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(37,99,235,0.6)]"
                >
                    <defs>
                        {/* Glass Gradient for Body */}
                        <linearGradient id="glass-body" x1="0" y1="0" x2="48" y2="48">
                            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
                            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.05)" />
                            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.1)" />
                        </linearGradient>

                        {/* Electric Blue Stroke Gradient */}
                        <linearGradient id="blue-glow" x1="0" y1="0" x2="48" y2="48">
                            <stop offset="0%" stopColor="#60A5FA" />
                            <stop offset="100%" stopColor="#2563EB" />
                        </linearGradient>

                        {/* Circuit Pattern Mask */}
                        <mask id="b-mask">
                            <path
                                d="M12 8H24C32.8366 8 40 15.1634 40 24C40 32.8366 32.8366 40 24 40H12C9.79086 40 8 38.2091 8 36V12C8 9.79086 9.79086 8 12 8Z"
                                fill="white"
                            />
                        </mask>
                    </defs>

                    {/* The B Shape Body (Glass) */}
                    <path
                        d="M14 6H26C35 6 42 13 42 24C42 35 35 42 26 42H14C10.6863 42 8 39.3137 8 36V12C8 8.68629 10.6863 6 14 6Z"
                        fill="url(#glass-body)"
                        stroke="url(#blue-glow)"
                        strokeWidth="1.5"
                    />

                    {/* Internal Neural/Circuit Pattern */}
                    <g mask="url(#b-mask)" opacity="0.6">
                        {/* Horizontal circuit lines */}
                        <path d="M14 16H30" stroke="#60A5FA" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                        <path d="M14 24H34" stroke="#60A5FA" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
                        <path d="M14 32H28" stroke="#60A5FA" strokeWidth="1" strokeLinecap="round" opacity="0.5" />

                        {/* Connection Nodes */}
                        <circle cx="30" cy="16" r="2" fill="#2563EB" className="animate-pulse" />
                        <circle cx="34" cy="24" r="2" fill="#60A5FA" className="animate-pulse" />
                        <circle cx="28" cy="32" r="2" fill="#2563EB" className="animate-pulse" />

                        {/* Connecting diagonals */}
                        <path d="M30 16L34 24L28 32" stroke="#2563EB" strokeWidth="0.5" strokeDasharray="2 2" />
                    </g>

                    {/* Inner Highlight/Glow */}
                    <path
                        d="M15 9H26C33 9 39 15 39 24"
                        stroke="white"
                        strokeWidth="1"
                        strokeLinecap="round"
                        opacity="0.3"
                        fill="none"
                    />
                </svg>
            </div>

            {/* Typography Variant */}
            {variant === "full" && (
                <div className="flex flex-col justify-center">
                    <h1 className="text-2xl font-bold tracking-tight leading-none text-white font-sans">
                        Brainy
                    </h1>
                </div>
            )}
        </div>
    );
}
