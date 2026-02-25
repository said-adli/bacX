import { cn } from "@/lib/utils";
import Image from "next/image";
import logoImg from "../../../../public/images/logo.png";

interface LogoProps {
  className?: string; // For width/height/invert control
  width?: number; // Optional numeric width
  height?: number; // Optional numeric height
}

export const Logo = ({ className, width, height }: LogoProps) => {
  return (
    <Image
      src={logoImg}
      alt="Brainy Platform Logo"
      className={cn("w-auto h-auto object-contain dark:invert", className)}
      width={width}
      height={height}
      priority
    />
  );
};
