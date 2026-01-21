"use client";

import { forwardRef } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon;
    iconClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ icon: Icon, className, iconClassName, ...props }, ref) => {
        return (
            <div className="relative w-full">
                {Icon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Icon className={cn("h-5 w-5 text-text-muted", iconClassName)} />
                    </div>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full bg-surface-highlight border border-border rounded-2xl",
                        "px-4 py-3 text-text-main placeholder:text-text-muted",
                        "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(41,151,255,0.15)]",
                        "transition-all duration-300",
                        Icon && "pr-12",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);

Input.displayName = "Input";
