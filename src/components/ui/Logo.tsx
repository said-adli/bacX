import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string; // For width/height/invert control
  width?: number; // Optional numeric width
  height?: number; // Optional numeric height
}

export const Logo = ({ className, width, height }: LogoProps) => {
  return (
    <Image
      src="/images/logo.png"
      alt="Brainy Platform Logo"
      className={cn("object-contain dark:invert", className)}
      width={width || 120}
      height={height || 40}
      priority
    />
  );
};
