"use client";

import { forwardRef } from "react";
// Zero JS Animations utilized via Tailwind
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
    primary: [
        "bg-primary text-white",
        "hover:shadow-[0_0_20px_rgba(41,151,255,0.3)]",
        "transition-all duration-300",
    ],
    secondary: [
        "bg-transparent border border-border text-text-main",
        "hover:bg-white/5",
        "transition-colors duration-300",
    ],
    ghost: [
        "bg-transparent text-text-muted",
        "hover:text-text-main",
        "transition-colors duration-300",
    ],
};

const sizes = {
    sm: "px-5 py-2 text-sm rounded-full",
    md: "px-8 py-3.5 text-base rounded-full",
    lg: "px-10 py-5 text-lg rounded-full",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: keyof typeof variants;
    size?: keyof typeof sizes;
    isLoading?: boolean;
    icon?: LucideIcon;
    children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "primary",
            size = "md",
            isLoading = false,
            icon: Icon,
            children,
            className,
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    "inline-flex items-center justify-center gap-2 font-medium",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "active:scale-95", // Replaces whileTap={{ scale: 0.95 }}
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : Icon ? (
                    <Icon className="h-4 w-4" />
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

