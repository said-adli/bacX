"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface SmartButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    pendingText?: string;
    isLoading?: boolean; // For manual overrides when not using <form action={..}>
}

export function SmartButton({
    children,
    pendingText = "جاري التنفيذ...",
    isLoading: manualLoading,
    className,
    disabled,
    ...props
}: SmartButtonProps) {
    const { pending: formPending } = useFormStatus();

    // Use manual loading state if provided, otherwise default to form context
    const isPending = manualLoading !== undefined ? manualLoading : formPending;

    return (
        <button
            {...props}
            disabled={isPending || disabled}
            className={cn(
                "w-full h-11 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600",
                "hover:from-blue-500 hover:via-blue-400 hover:to-purple-500",
                "text-white font-semibold rounded-xl transition-all duration-300",
                "hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2",
                className
            )}
        >
            {isPending ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{pendingText}</span>
                </>
            ) : (
                children
            )}
        </button>
    );
}
