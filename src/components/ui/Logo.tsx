import React from "react";
import { cn } from "@/lib/utils";
import { BrainyLogo } from "./BrainyLogo";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = false, ...props }: LogoProps) {
  return (
    <div className={cn("", className)} {...props}>
      <BrainyLogo variant={showText ? "navbar" : "icon"} className={cn("w-auto", showText ? "h-12" : "h-12 w-12")} />
    </div>
  );
}
