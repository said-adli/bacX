import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Brand Logo Component
 * Geometric interlocking triangle design with parallel stripes.
 * Uses currentColor for automatic theme adaptation.
 */
export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 94"
      fill="currentColor"
      className={cn("w-10 h-10 select-none", className)}
      aria-label="Logo"
      {...props}
    >
      {/* Outer Triangle Frame - Left Leg */}
      <path d="M50 0 L8 72 L0 88 L4 94 L20 94 L16 88 L50 28 L58 42 L50 54 L34 88 L38 94 L46 94 L66 58" />

      {/* Outer Triangle Frame - Right Leg */}
      <path d="M50 0 L92 72 L100 88 L96 94 L80 94 L84 88 L50 28" />

      {/* Bottom Base Bar */}
      <path d="M4 94 L96 94 L92 86 L8 86 Z" />

      {/* Second Stripe Layer - Left */}
      <path d="M50 14 L18 70 L12 80 L20 80 L50 28 Z" />

      {/* Second Stripe Layer - Right */}
      <path d="M50 14 L82 70 L88 80 L80 80 L50 28 Z" />

      {/* Second Base Stripe */}
      <path d="M12 80 L88 80 L84 72 L16 72 Z" />

      {/* Inner Accent - Top Right Diagonal */}
      <path d="M58 14 L74 42 L82 42 L62 8 Z" />

      {/* Inner Gap/Notch on Right */}
      <path d="M66 50 L74 64 L82 64 L70 44 Z" />
    </svg>
  );
}
