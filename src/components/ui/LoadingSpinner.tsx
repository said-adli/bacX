// Server Component

import { Loader2 } from "lucide-react";

const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
};

interface LoadingSpinnerProps {
    fullScreen?: boolean;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ fullScreen = true, className = "", size = "md" }: LoadingSpinnerProps) {
    const spinnerSize = sizeClasses[size];

    if (fullScreen) {
        return (
            <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center ${className}`}>
                <div className="flex flex-col items-center gap-6">
                    {/* Cinematic B Logo Container */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                        <div className="relative w-16 h-16 bg-black rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl">
                            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-400 to-white animate-pulse">
                                B
                            </div>
                        </div>
                    </div>

                    {/* Loading Text & Spinner */}
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        <span className="text-sm font-medium text-muted-foreground animate-pulse">
                            Loading Academy...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <Loader2 className={`${spinnerSize} text-primary animate-spin`} />
        </div>
    );
}
