import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = false, ...props }: LogoProps) {
  // Golden Ratio B Construction
  // The 'B' is constructed from a vertical spine and two semi-circles.
  // R1 (top radius) = 15.279
  // R2 (bottom radius) = 24.721 
  // R2/R1 ≈ 1.618 (Golden Ratio)
  // Total Height = 2*R1 + 2*R2 = 80
  
  const pathData = `
    M 30 10 
    L 30 90 
    M 30 10 
    A 15.279 15.279 0 0 1 30 40.557 
    A 24.721 24.721 0 0 1 30 90
  `;

  const Icon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-10 h-10", !showText && className)}
      {...(!showText ? props : {})}
    >
      <path d={pathData} />
    </svg>
  );

  if (showText) {
    return (
      <div className={cn("flex items-center gap-3", className)} {...(props as any)}>
        {Icon}
        <span className="font-sans text-xl font-bold tracking-tight text-foreground">
          Brainy
        </span>
      </div>
    );
  }

  return Icon;
}
