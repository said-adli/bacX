"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function BrainyStoneLogoSVG({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("w-full h-full drop-shadow-2xl", className)}
            aria-label="Brainy Logo"
        >
            <defs>
                {/* Dark Obsidian Stone Gradient */}
                <linearGradient id="stoneBody" x1="100" y1="0" x2="100" y2="200" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#3E3E4A" />
                    <stop offset="40%" stopColor="#1A1A20" />
                    <stop offset="100%" stopColor="#050508" />
                </linearGradient>

                <filter id="stoneTexture">
                    <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise" />
                    <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.3 0" in="noise" result="coloredNoise" />
                    <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
                    <feBlend mode="multiply" in="composite" in2="SourceGraphic" />
                </filter>

                {/* Gold Gradient */}
                <linearGradient id="goldMetal" x1="100" y1="80" x2="100" y2="120" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="50%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#92400E" />
                </linearGradient>
            </defs>

            {/* --- PYRAMID STRUCTURE --- */}
            {/* Main Triangle Body */}
            <path
                d="M100 20 L180 140 H20 L100 20Z"
                fill="url(#stoneBody)"
                stroke="#1A1A20"
                strokeWidth="2"
                filter="url(#stoneTexture)"
            />

            {/* Inner Geometric Lattice Details (Simplistic representation of the complex lattice) */}
            <path d="M100 20 L140 140 H60 Z" fill="none" stroke="#000" strokeWidth="1" opacity="0.5" />
            <path d="M60 140 L100 80 L140 140" fill="none" stroke="#000" strokeWidth="1" opacity="0.5" />

            {/* --- GRADUATION CAP (Center Top) --- */}
            {/* Cap Board */}
            <path
                d="M100 45 L130 55 L100 65 L70 55 Z"
                fill="#1A1A20"
                stroke="#555"
                strokeWidth="0.5"
            />
            {/* Cap Skullcap */}
            <path
                d="M75 58 V65 C75 70 125 70 125 65 V58"
                fill="#1A1A20"
            />
            {/* Tassel */}
            <path
                d="M100 55 L120 54 V70"
                stroke="#D97706"
                strokeWidth="1"
                fill="none"
            />

            {/* --- THE EYE (Center) --- */}
            <g transform="translate(0, 10)">
                <path
                    d="M70 90 Q100 70 130 90 Q100 110 70 90 Z"
                    fill="#050508"
                    stroke="#333"
                    strokeWidth="1"
                />
                <circle cx="100" cy="90" r="12" fill="url(#goldMetal)" />
                <circle cx="100" cy="90" r="4" fill="#000" />
            </g>

            {/* --- TEXT "Brainy" (Stone Serif style) --- */}
            {/* Using standard SVG font text with stone fill */}
            <text
                x="100"
                y="185"
                textAnchor="middle"
                fontFamily="serif"
                fontSize="48"
                fontWeight="bold"
                fill="url(#stoneBody)"
                stroke="#000"
                strokeWidth="0.5"
                filter="url(#stoneTexture)"
                style={{ letterSpacing: '0.05em' }}
            >
                Brainy
            </text>

        </svg>
    );
}
