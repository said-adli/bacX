import { cn } from "@/lib/utils";

type StatusType = "success" | "warning" | "error" | "info" | "neutral";

interface StatusBadgeProps {
    status: StatusType;
    children: React.ReactNode;
    className?: string;
    pulse?: boolean;
}

const statusStyles: Record<StatusType, string> = {
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    neutral: "bg-white/5 text-gray-400 border-white/10",
};

export function StatusBadge({ status, children, className, pulse }: StatusBadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md",
                statusStyles[status],
                className
            )}
        >
            {pulse && (
                <span className="relative flex h-2 w-2">
                    <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", statusStyles[status].split(" ")[1].replace("text-", "bg-"))}></span>
                    <span className={cn("relative inline-flex h-2 w-2 rounded-full", statusStyles[status].split(" ")[1].replace("text-", "bg-"))}></span>
                </span>
            )}
            {children}
        </div>
    );
}
