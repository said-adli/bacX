"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function BrainyModernLogo({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 240 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("w-full h-full", className)}
            aria-label="Brainy Logo"
        >
            <defs>
                {/* Luxury Obsidian Gradient */}
                <linearGradient id="obsidianDeep" x1="120" y1="20" x2="120" y2="220" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#2e3b4e" />
                    <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>

                {/* Electric Blue Glow */}
                <linearGradient id="blueGlow" x1="0" y1="0" x2="240" y2="240" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#2563EB" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>

                {/* Gold Metal Gradient */}
                <linearGradient id="goldLuxury" x1="120" y1="80" x2="120" y2="150" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="50%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#92400E" />
                </linearGradient>

                {/* Soft Shadow */}
                <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="0" dy="4" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* --- MAIN GEOMETRY --- */}

            {/* Outer Triangle Glow */}
            <path
                d="M120 30 L210 190 H30 L120 30Z"
                stroke="url(#blueGlow)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.6"
            />

            {/* Main Pyramid Body */}
            <path
                d="M120 40 L195 180 H45 L120 40Z"
                fill="url(#obsidianDeep)"
                stroke="#334155"
                strokeWidth="1"
                filter="url(#softShadow)"
            />

            {/* Inner Triangle Cutout (The Frame) */}
            <path
                d="M120 55 L180 170 H60 L120 55Z"
                stroke="#2563EB"
                strokeWidth="0.5"
                strokeOpacity="0.3"
                fill="none"
            />

            {/* --- ICONOGRAPHY --- */}

            {/* Graduation Cap (Stylized, Minimal) */}
            <path
                d="M120 70 L150 85 L120 100 L90 85 Z"
                fill="#1e293b" // Slate-800
                stroke="url(#goldLuxury)"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            {/* Tassel */}
            <path
                d="M150 85 V95"
                stroke="url(#goldLuxury)"
                strokeWidth="1.5"
                strokeLinecap="round"
            />

            {/* The Eye (Golden Core) */}
            <g transform="translate(0, 15)">
                <path
                    d="M95 115 Q120 100 145 115 Q120 130 95 115 Z"
                    fill="#0f172a"
                    stroke="url(#goldLuxury)"
                    strokeWidth="1.5"
                />
                <circle cx="120" cy="115" r="8" fill="url(#goldLuxury)" />
            </g>

            {/* --- TYPOGRAPHY --- */}
            <text
                x="120"
                y="225"
                textAnchor="middle"
                fontFamily="serif"
                fontSize="32"
                fontWeight="500"
                fill="#E2E8F0" // Slate-200 (Off-white)
                style={{ letterSpacing: '0.15em', textTransform: 'uppercase' }}
            >
                Brainy
            </text>
        </svg>
    );
}
