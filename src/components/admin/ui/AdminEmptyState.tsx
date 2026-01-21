import { LayoutTemplate, SearchX, AlertCircle } from "lucide-react";
import { AdminGlassCard } from "./AdminGlassCard";
import { cn } from "@/lib/utils";

interface AdminEmptyStateProps {
    title?: string;
    description?: string;
    icon?: "search" | "layout" | "error";
    action?: React.ReactNode;
    className?: string;
}

export function AdminEmptyState({
    title = "No data found",
    description = "There are no items to display at this moment.",
    icon = "layout",
    action,
    className,
}: AdminEmptyStateProps) {
    const Icon = icon === "search" ? SearchX : icon === "error" ? AlertCircle : LayoutTemplate;

    return (
        <AdminGlassCard className={cn("flex min-h-[400px] flex-col items-center justify-center text-center", className)}>
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 shadow-inner">
                <Icon className="h-10 w-10 text-white/20" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
            <p className="max-w-md text-gray-400">{description}</p>
            {action && <div className="mt-8">{action}</div>}
        </AdminGlassCard>
    );
}
