import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string; // For width/height/invert control
  width?: number; // Optional numeric width
  height?: number; // Optional numeric height
}

export const Logo = ({ className, width, height }: LogoProps) => {
  return (
    <img
      src="/images/logo.png"
      alt="Brainy Platform Logo"
      className={cn("w-auto h-auto object-contain dark:invert", className)}
      width={width}
      height={height}
    />
  );
};
