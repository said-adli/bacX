import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
      className={cn("w-10 h-10 select-none", className)}
      {...props}
    >
      {/* 
        Geometric Triangle Logo
        Constructed with 3 interlocking segments creating an impossible triangle effect.
        Optimized paths for precision.
      */}
      <path
        d="M50 15L85 80H15L50 15ZM50 28L29 68H71L50 28Z"
        fillRule="evenodd"
        className="opacity-90"
      />

      {/* Accent/Interlocking Details to make it look premium */}
      <path d="M48 5L10 75L15 85L55 15L48 5Z" className="opacity-60" /> {/* Left Wing Shadow */}
      <path d="M52 5L90 75L85 85L45 15L52 5Z" className="opacity-40" /> {/* Right Wing Shadow */}
      <path d="M15 80L85 80L85 86L15 86L15 80Z" className="opacity-80" /> {/* Bottom Bar Base */}

    </svg>
  );
}
